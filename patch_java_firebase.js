const fs = require('fs');

const bgPath = 'node_modules/@capacitor-community/background-geolocation/android/src/main/java/com/equimaps/capacitor_background_geolocation/BackgroundGeolocation.java';
const servicePath = 'node_modules/@capacitor-community/background-geolocation/android/src/main/java/com/equimaps/capacitor_background_geolocation/BackgroundGeolocationService.java';

let bgCode = fs.readFileSync(bgPath, 'utf-8');
let serviceCode = fs.readFileSync(servicePath, 'utf-8');

// Patch BackgroundGeolocationService.java
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
                                        "{\\"lat\\": %f, \\"lng\\": %f, \\"accuracy\\": %f, \\"updatedAt\\": %d}",
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

  fs.writeFileSync(servicePath, serviceCode);
  console.log('Patched BackgroundGeolocationService.java');
}

// Patch BackgroundGeolocation.java
if (!bgCode.includes('call.getString("firebaseDbUrl")')) {
  bgCode = bgCode.replace(
    'service.addWatcher(\n                call.getCallbackId(),\n                backgroundNotification,\n                call.getFloat("distanceFilter", 0f)\n        );',
    'service.addWatcher(\n                call.getCallbackId(),\n                backgroundNotification,\n                call.getFloat("distanceFilter", 0f),\n                call.getString("firebaseDbUrl"),\n                call.getString("firebaseToken"),\n                call.getString("firebaseUid")\n        );'
  );
  
  fs.writeFileSync(bgPath, bgCode);
  console.log('Patched BackgroundGeolocation.java');
}

