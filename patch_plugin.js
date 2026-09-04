const fs = require('fs');
const path = 'node_modules/@capacitor-community/background-geolocation/android/src/main/java/com/equimaps/capacitor_background_geolocation/BackgroundGeolocation.java';
let code = fs.readFileSync(path, 'utf-8');

// 1. Add BigTextStyle to the builder
if (!code.includes('BigTextStyle')) {
  code = code.replace(
    '.setContentText(backgroundMessage)',
    '.setContentText(backgroundMessage)\n                    .setStyle(new Notification.BigTextStyle().bigText(backgroundMessage))'
  );
}

// 2. Add Stop action
if (!code.includes('STOP_SHARING')) {
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
  code = code.replace(
    'backgroundNotification = builder.build();',
    actionCode + '\n            backgroundNotification = builder.build();'
  );

  // Add the BroadcastReceiver
  const receiverCode = `
    private BroadcastReceiver stopSharingReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if ("com.equimaps.capacitor_background_geolocation.STOP_SHARING".equals(intent.getAction())) {
                notifyListeners("stopSharing", new JSObject());
                
                // Bring app to front
                Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
                if (launchIntent != null) {
                    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
                    context.startActivity(launchIntent);
                }
            }
        }
    };
  `;
  code = code.replace(
    'public class BackgroundGeolocation extends Plugin {',
    'public class BackgroundGeolocation extends Plugin {' + receiverCode
  );

  // Register receiver in load()
  const registerCode = `
        IntentFilter filter = new IntentFilter("com.equimaps.capacitor_background_geolocation.STOP_SHARING");
        if (Build.VERSION.SDK_INT >= 33) {
            getContext().registerReceiver(stopSharingReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            getContext().registerReceiver(stopSharingReceiver, filter);
        }
  `;
  code = code.replace(
    'super.load();',
    'super.load();\n' + registerCode
  );
  
  // Unregister in handleOnDestroy()
  const unregisterCode = `
        try {
            getContext().unregisterReceiver(stopSharingReceiver);
        } catch(Exception e) {}
  `;
  code = code.replace(
    'super.handleOnDestroy();',
    unregisterCode + '\n        super.handleOnDestroy();'
  );
}

fs.writeFileSync(path, code);
console.log('Plugin patched successfully');
