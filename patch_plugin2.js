const fs = require('fs');
const bgPath = 'node_modules/@capacitor-community/background-geolocation/android/src/main/java/com/equimaps/capacitor_background_geolocation/BackgroundGeolocation.java';
const servicePath = 'node_modules/@capacitor-community/background-geolocation/android/src/main/java/com/equimaps/capacitor_background_geolocation/BackgroundGeolocationService.java';

let bgCode = fs.readFileSync(bgPath, 'utf-8');
let serviceCode = fs.readFileSync(servicePath, 'utf-8');

if (!serviceCode.includes('updateNotification')) {
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

if (!bgCode.includes('updateNotification')) {
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
console.log("Patched Java for updateNotification");
