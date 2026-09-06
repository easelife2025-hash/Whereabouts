const fs = require('fs');
const bgPath = 'node_modules/@capacitor-community/background-geolocation/android/src/main/java/com/equimaps/capacitor_background_geolocation/BackgroundGeolocation.java';
const servicePath = 'node_modules/@capacitor-community/background-geolocation/android/src/main/java/com/equimaps/capacitor_background_geolocation/BackgroundGeolocationService.java';

let bgCode = fs.readFileSync(bgPath, 'utf-8');
let serviceCode = fs.readFileSync(servicePath, 'utf-8');

// ==== Patch BackgroundGeolocationService.java ====
serviceCode = `package com.equimaps.capacitor_background_geolocation;

import android.app.Notification;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.location.Location;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;
import com.getcapacitor.Logger;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationAvailability;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import java.util.HashSet;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

public class BackgroundGeolocationService extends Service {
    static final String ACTION_BROADCAST = (
            BackgroundGeolocationService.class.getPackage().getName() + ".broadcast"
    );

    private final IBinder binder = new LocalBinder();
    private static final int NOTIFICATION_ID = 28351;

    private class Watcher {
        public String id;
        public FusedLocationProviderClient client;
        public LocationRequest locationRequest;
        public LocationCallback locationCallback;
        public Notification backgroundNotification;
        public String firebaseDbUrl;
        public String firebaseToken;
        public String firebaseUid;
    }

    private HashSet<Watcher> watchers = new HashSet<Watcher>();

    @Override
    public IBinder onBind(Intent intent) {
        return binder;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (watchers.isEmpty()) {
            stopForeground(true);
            stopSelf();
            return START_NOT_STICKY;
        }
        return START_NOT_STICKY; // Respect security model: don't aggressively restart
    }

    @Override
    public boolean onUnbind(Intent intent) {
        // Keep running in foreground if user swipes app away
        if (getNotification() != null && !watchers.isEmpty()) {
            return true; // Rebind allowed
        }
        for (Watcher watcher : watchers) {
            watcher.client.removeLocationUpdates(watcher.locationCallback);
        }
        watchers.clear();
        stopSelf();
        return false;
    }
    
    @Override
    public void onTaskRemoved(Intent rootIntent) {
        super.onTaskRemoved(rootIntent);
        // Do NOT stop self here, let foreground service continue.
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        // Best-effort cleanup of RTDB if service is killed
        for (Watcher watcher : watchers) {
            final String dbUrl = watcher.firebaseDbUrl;
            final String uid = watcher.firebaseUid;
            final String token = watcher.firebaseToken;
            if (dbUrl != null && uid != null) {
                new Thread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            String urlStr = dbUrl;
                            if (urlStr.endsWith("/")) urlStr = urlStr.substring(0, urlStr.length() - 1);
                            urlStr += "/user_locations/" + uid + ".json";
                            if (token != null && !token.isEmpty()) urlStr += "?auth=" + token;
                            java.net.URL url = new java.net.URL(urlStr);
                            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                            conn.setRequestMethod("DELETE");
                            conn.getResponseCode();
                            conn.disconnect();
                        } catch (Exception ignore) {}
                    }
                }).start();
            }
        }
    }

    Notification getNotification() {
        for (Watcher watcher : watchers) {
            if (watcher.backgroundNotification != null) {
                return watcher.backgroundNotification;
            }
        }
        return null;
    }

    public class LocalBinder extends Binder {
        void addWatcher(
                final String id,
                Notification backgroundNotification,
                float distanceFilter,
                final String firebaseDbUrl,
                final String firebaseToken,
                final String firebaseUid
        ) {
            FusedLocationProviderClient client = LocationServices.getFusedLocationProviderClient(
                    BackgroundGeolocationService.this
            );

            LocationRequest locationRequest = new LocationRequest();
            // Battery Optimization
            locationRequest.setMaxWaitTime(10000); 
            locationRequest.setInterval(10000); 
            locationRequest.setFastestInterval(5000);
            locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
            locationRequest.setSmallestDisplacement(Math.max(distanceFilter, 10f)); // At least 10 meters

            LocationCallback callback = new LocationCallback(){
                @Override
                public void onLocationResult(LocationResult locationResult) {
                    Location location = locationResult.getLastLocation();
                    Intent intent = new Intent(ACTION_BROADCAST);
                    intent.putExtra("location", location);
                    intent.putExtra("id", id);
                    LocalBroadcastManager.getInstance(
                            getApplicationContext()
                    ).sendBroadcast(intent);
                    
                    if (firebaseDbUrl != null && firebaseUid != null) {
                        new Thread(new Runnable() {
                            @Override
                            public void run() {
                                try {
                                    String urlStr = firebaseDbUrl;
                                    if (urlStr.endsWith("/")) urlStr = urlStr.substring(0, urlStr.length() - 1);
                                    urlStr += "/user_locations/" + firebaseUid + ".json";
                                    if (firebaseToken != null && !firebaseToken.isEmpty()) urlStr += "?auth=" + firebaseToken;
                                    java.net.URL url = new java.net.URL(urlStr);
                                    java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                                    conn.setRequestMethod("PUT");
                                    conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                                    conn.setDoOutput(true);
                                    String json = String.format(
                                        java.util.Locale.US,
                                        "{\\"lat\\": %f, \\"lng\\": %f, \\"accuracy\\": %f, \\"updatedAt\\": %d}",
                                        location.getLatitude(),
                                        location.getLongitude(),
                                        location.hasAccuracy() ? location.getAccuracy() : 0.0f,
                                        System.currentTimeMillis()
                                    );
                                    java.io.OutputStream os = conn.getOutputStream();
                                    os.write(json.getBytes("UTF-8"));
                                    os.close();
                                    conn.getResponseCode();
                                    conn.disconnect();
                                } catch (Exception e) {
                                    Logger.error("Firebase update failed", e);
                                }
                            }
                        }).start();
                    }
                }

                @Override
                public void onLocationAvailability(LocationAvailability availability) {
                    if (!availability.isLocationAvailable()) {
                        Logger.debug("Location not available");
                    }
                }
            };

            Watcher watcher = new Watcher();
            watcher.id = id;
            watcher.client = client;
            watcher.locationRequest = locationRequest;
            watcher.locationCallback = callback;
            watcher.backgroundNotification = backgroundNotification;
            watcher.firebaseDbUrl = firebaseDbUrl;
            watcher.firebaseToken = firebaseToken;
            watcher.firebaseUid = firebaseUid;
            watchers.add(watcher);

            try {
                watcher.client.requestLocationUpdates(
                        watcher.locationRequest,
                        watcher.locationCallback,
                        null
                );
            } catch (SecurityException ignore) {}

            if (backgroundNotification != null) {
                try {
                    startForeground(NOTIFICATION_ID, backgroundNotification);
                } catch (Exception exception) {}
            }
        }
        
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

        void removeWatcher(String id) {
            for (Watcher watcher : watchers) {
                if (watcher.id.equals(id)) {
                    watcher.client.removeLocationUpdates(watcher.locationCallback);
                    watchers.remove(watcher);
                    if (getNotification() == null) {
                        stopForeground(true);
                    }
                    return;
                }
            }
        }

        void onPermissionsGranted() {
            for (Watcher watcher : watchers) {
                watcher.client.removeLocationUpdates(watcher.locationCallback);
                try {
                    watcher.client.requestLocationUpdates(
                            watcher.locationRequest,
                            watcher.locationCallback,
                            null
                    );
                } catch (SecurityException ignore) {}
            }
        }

        void stopService() {
            BackgroundGeolocationService.this.stopSelf();
        }
    }
}
`;

fs.writeFileSync(servicePath, serviceCode);
console.log('Written BackgroundGeolocationService.java');

// ==== Patch BackgroundGeolocation.java ====
if (!bgCode.includes('updateNotification')) {
  // Add updateNotification method
  const updateMethod = `
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
                    builder.setColor(android.graphics.Color.parseColor(color));
                }
            } catch (Exception e) {}
            
            android.content.Intent launchIntent = getContext().getPackageManager().getLaunchIntentForPackage(getContext().getPackageName());
            if (launchIntent != null) {
                launchIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
                builder.setContentIntent(android.app.PendingIntent.getActivity(getContext(), 0, launchIntent, android.app.PendingIntent.FLAG_CANCEL_CURRENT | android.app.PendingIntent.FLAG_IMMUTABLE));
            }
            
            android.content.Intent stopIntent = new android.content.Intent("com.equimaps.capacitor_background_geolocation.STOP_SHARING");
            stopIntent.setPackage(getContext().getPackageName());
            android.app.PendingIntent stopPendingIntent = android.app.PendingIntent.getBroadcast(getContext(), 0, stopIntent, android.app.PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? android.app.PendingIntent.FLAG_IMMUTABLE : 0));
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
    updateMethod + '\n    @PluginMethod()\n    public void removeWatcher(PluginCall call)'
  );
}

if (!bgCode.includes('call.getString("firebaseDbUrl")')) {
  bgCode = bgCode.replace(
    'service.addWatcher(\n                call.getCallbackId(),\n                backgroundNotification,\n                call.getFloat("distanceFilter", 0f)\n        );',
    'service.addWatcher(\n                call.getCallbackId(),\n                backgroundNotification,\n                call.getFloat("distanceFilter", 0f),\n                call.getString("firebaseDbUrl"),\n                call.getString("firebaseToken"),\n                call.getString("firebaseUid")\n        );'
  );
}

// Add STOP_SHARING intent receiver logic to BackgroundGeolocation.java
if (!bgCode.includes('STOP_SHARING')) {
  const initCode = `
    @Override
    public void load() {
        super.load();
        getContext().registerReceiver(new android.content.BroadcastReceiver() {
            @Override
            public void onReceive(android.content.Context context, android.content.Intent intent) {
                if ("com.equimaps.capacitor_background_geolocation.STOP_SHARING".equals(intent.getAction())) {
                    notifyListeners("stopSharing", new com.getcapacitor.JSObject());
                }
            }
        }, new android.content.IntentFilter("com.equimaps.capacitor_background_geolocation.STOP_SHARING"), android.content.Context.RECEIVER_EXPORTED);
    }
  `;
  bgCode = bgCode.replace(
    'public class BackgroundGeolocation extends Plugin {',
    'public class BackgroundGeolocation extends Plugin {' + initCode
  );
  
  // Also we must add "STOP_SHARING" action building to the addWatcher method in BackgroundGeolocation.java!
  const addWatcherPattern = `builder.setContentIntent(PendingIntent.getActivity(getContext(), 0, launchIntent, PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE));
            }`;
  const addStopActionCode = `
            android.content.Intent stopIntent = new android.content.Intent("com.equimaps.capacitor_background_geolocation.STOP_SHARING");
            stopIntent.setPackage(getContext().getPackageName());
            android.app.PendingIntent stopPendingIntent = android.app.PendingIntent.getBroadcast(getContext(), 0, stopIntent, android.app.PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? android.app.PendingIntent.FLAG_IMMUTABLE : 0));
            Notification.Action stopAction = new Notification.Action.Builder(0, "Stop Sharing", stopPendingIntent).build();
            builder.addAction(stopAction);
  `;
  bgCode = bgCode.replace(addWatcherPattern, addWatcherPattern + addStopActionCode);
}

fs.writeFileSync(bgPath, bgCode);
console.log('Written BackgroundGeolocation.java');
