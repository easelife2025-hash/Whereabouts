const fs = require('fs');

const bgPath = 'node_modules/@capacitor-community/background-geolocation/android/src/main/java/com/equimaps/capacitor_background_geolocation/BackgroundGeolocation.java';
const servicePath = 'node_modules/@capacitor-community/background-geolocation/android/src/main/java/com/equimaps/capacitor_background_geolocation/BackgroundGeolocationService.java';

let bgCode = fs.readFileSync(bgPath, 'utf-8');
let serviceCode = fs.readFileSync(servicePath, 'utf-8');

// ==== 1. Patch BackgroundGeolocationService.java ====
if (!serviceCode.includes('firebaseDbUrl')) {
  // Add fields to Watcher class
  serviceCode = serviceCode.replace(
    'public Notification backgroundNotification;',
    'public Notification backgroundNotification;\n        public String firebaseDbUrl;\n        public String firebaseToken;\n        public String firebaseUid;'
  );

  // Update addWatcher signature
  serviceCode = serviceCode.replace(
    'void addWatcher(\n                final String id,\n                Notification backgroundNotification,\n                float distanceFilter\n        ) {',
    'void addWatcher(\n                final String id,\n                Notification backgroundNotification,\n                float distanceFilter,\n                final String firebaseDbUrl,\n                final String firebaseToken,\n                final String firebaseUid\n        ) {'
  );

  // Set fields on watcher
  serviceCode = serviceCode.replace(
    'watcher.backgroundNotification = backgroundNotification;',
    'watcher.backgroundNotification = backgroundNotification;\n            watcher.firebaseDbUrl = firebaseDbUrl;\n            watcher.firebaseToken = firebaseToken;\n            watcher.firebaseUid = firebaseUid;'
  );

  // Add Firebase HTTP call in onLocationResult
  const firebaseHttpCode = `
                    if (firebaseDbUrl != null && firebaseUid != null) {
                        new Thread(new Runnable() {
                            @Override
                            public void run() {
                                try {
                                    String urlStr = firebaseDbUrl;
                                    if (urlStr.endsWith("/")) {
                                        urlStr = urlStr.substring(0, urlStr.length() - 1);
                                    }
                                    urlStr += "/user_locations/" + firebaseUid + ".json";
                                    if (firebaseToken != null && !firebaseToken.isEmpty()) {
                                        urlStr += "?auth=" + firebaseToken;
                                    }
                                    java.net.URL url = new java.net.URL(urlStr);
                                    java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                                    conn.setRequestMethod("PUT");
                                    conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                                    conn.setDoOutput(true);

                                    String json = String.format(
                                        java.util.Locale.US,
                                        "{\\"latitude\\": %f, \\"longitude\\": %f, \\"accuracy\\": %f, \\"updatedAt\\": %d}",
                                        location.getLatitude(),
                                        location.getLongitude(),
                                        location.hasAccuracy() ? location.getAccuracy() : 0.0f,
                                        System.currentTimeMillis()
                                    );

                                    java.io.OutputStream os = conn.getOutputStream();
                                    os.write(json.getBytes("UTF-8"));
                                    os.close();
                                    int responseCode = conn.getResponseCode();
                                    Logger.debug("Firebase HTTP response: " + responseCode);
                                    conn.disconnect();
                                } catch (Exception e) {
                                    Logger.error("Firebase update failed", e);
                                }
                            }
                        }).start();
                    }
  `;

  serviceCode = serviceCode.replace(
    'LocalBroadcastManager.getInstance(\n                            getApplicationContext()\n                    ).sendBroadcast(intent);',
    'LocalBroadcastManager.getInstance(\n                            getApplicationContext()\n                    ).sendBroadcast(intent);\n' + firebaseHttpCode
  );

  const serviceUpdateCode = `
        void updateNotification(Notification notification) {
            for (Watcher watcher : watchers) {
                watcher.backgroundNotification = notification;
            }
            if (getNotification() != null) {
                try {
                    startForeground(NOTIFICATION_ID, getNotification());
                } catch (Exception e) {}
            }
        }
  `;
  serviceCode = serviceCode.replace(
    'void removeWatcher(String id)',
    serviceUpdateCode + '\n        void removeWatcher(String id)'
  );

  fs.writeFileSync(servicePath, serviceCode);
}

// ==== 2. Patch BackgroundGeolocation.java ====
if (!bgCode.includes('firebaseDbUrl')) {
  // Add BigTextStyle and STOP_SHARING
  bgCode = bgCode.replace(
    '.setContentText(backgroundMessage)',
    '.setContentText(backgroundMessage)\n                    .setStyle(new Notification.BigTextStyle().bigText(backgroundMessage))'
  );

  const actionCode = `
            Intent stopIntent = new Intent("com.equimaps.capacitor_background_geolocation.STOP_SHARING");
            stopIntent.setPackage(getContext().getPackageName());
            PendingIntent stopPendingIntent = PendingIntent.getBroadcast(
                    getContext(),
                    0,
                    stopIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
            );
            Notification.Action stopAction = new Notification.Action.Builder(
                    0,
                    "Stop Sharing",
                    stopPendingIntent
            ).build();
            builder.addAction(stopAction);
  `;
  bgCode = bgCode.replace(
    'backgroundNotification = builder.build();',
    actionCode + '\n            backgroundNotification = builder.build();'
  );

  const receiverCode = `
    private BroadcastReceiver stopSharingReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if ("com.equimaps.capacitor_background_geolocation.STOP_SHARING".equals(intent.getAction())) {
                notifyListeners("stopSharing", new JSObject());
                
                Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
                if (launchIntent != null) {
                    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
                    context.startActivity(launchIntent);
                }
            }
        }
    };
  `;
  bgCode = bgCode.replace(
    'public class BackgroundGeolocation extends Plugin {',
    'public class BackgroundGeolocation extends Plugin {' + receiverCode
  );

  const registerCode = `
        IntentFilter filter = new IntentFilter("com.equimaps.capacitor_background_geolocation.STOP_SHARING");
        if (Build.VERSION.SDK_INT >= 33) {
            getContext().registerReceiver(stopSharingReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            getContext().registerReceiver(stopSharingReceiver, filter);
        }
  `;
  bgCode = bgCode.replace(
    'super.load();',
    'super.load();\n' + registerCode
  );
  
  const unregisterCode = `
        try {
            getContext().unregisterReceiver(stopSharingReceiver);
        } catch(Exception e) {}
  `;
  bgCode = bgCode.replace(
    'super.handleOnDestroy();',
    unregisterCode + '\n        super.handleOnDestroy();'
  );

  bgCode = bgCode.replace(
    'service.addWatcher(\n                call.getCallbackId(),\n                backgroundNotification,\n                call.getFloat("distanceFilter", 0f)\n        );',
    'service.addWatcher(\n                call.getCallbackId(),\n                backgroundNotification,\n                call.getFloat("distanceFilter", 0f),\n                call.getString("firebaseDbUrl"),\n                call.getString("firebaseToken"),\n                call.getString("firebaseUid")\n        );'
  );
  
  const bgUpdateCode = `
    @PluginMethod()
    public void updateNotification(final PluginCall call) {
        if (service == null) {
            call.reject("Service not running.");
            return;
        }
        String backgroundMessage = call.getString("backgroundMessage");
        if (backgroundMessage != null) {
            Notification.Builder builder = new Notification.Builder(getContext())
                    .setContentTitle(call.getString("backgroundTitle", "Using your location"))
                    .setContentText(backgroundMessage)
                    .setStyle(new Notification.BigTextStyle().bigText(backgroundMessage))
                    .setOngoing(true)
                    .setPriority(Notification.PRIORITY_HIGH)
                    .setWhen(System.currentTimeMillis());

            try {
                String name = getAppString("capacitor_background_geolocation_notification_icon", "mipmap/ic_launcher");
                String[] parts = name.split("/");
                builder.setSmallIcon(getAppResourceIdentifier(parts[1], parts[0]));
                String color = getAppString("capacitor_background_geolocation_notification_color", null);
                if (color != null) {
                    builder.setColor(Color.parseColor(color));
                }
            } catch (Exception e) {}

            Intent launchIntent = getContext().getPackageManager().getLaunchIntentForPackage(getContext().getPackageName());
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
                builder.setContentIntent(PendingIntent.getActivity(getContext(), 0, launchIntent, PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE));
            }

            Intent stopIntent = new Intent("com.equimaps.capacitor_background_geolocation.STOP_SHARING");
            stopIntent.setPackage(getContext().getPackageName());
            PendingIntent stopPendingIntent = PendingIntent.getBroadcast(getContext(), 0, stopIntent, PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0));
            Notification.Action stopAction = new Notification.Action.Builder(0, "Stop Sharing", stopPendingIntent).build();
            builder.addAction(stopAction);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                builder.setChannelId(BackgroundGeolocationService.class.getPackage().getName());
            }

            service.updateNotification(builder.build());
        }
        call.resolve();
    }
  `;
  bgCode = bgCode.replace(
    'public void removeWatcher(PluginCall call)',
    bgUpdateCode + '\n    @PluginMethod()\n    public void removeWatcher(PluginCall call)'
  );

  fs.writeFileSync(bgPath, bgCode);
}
console.log('All patches applied to node_modules');
