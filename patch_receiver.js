const fs = require('fs');
const bgPath = 'node_modules/@capacitor-community/background-geolocation/android/src/main/java/com/equimaps/capacitor_background_geolocation/BackgroundGeolocation.java';

let bgCode = fs.readFileSync(bgPath, 'utf-8');

const oldRegister = `}, new android.content.IntentFilter("com.equimaps.capacitor_background_geolocation.STOP_SHARING"), android.content.Context.RECEIVER_EXPORTED);`;

const newRegister = `};
        android.content.IntentFilter filter = new android.content.IntentFilter("com.equimaps.capacitor_background_geolocation.STOP_SHARING");
        if (Build.VERSION.SDK_INT >= 33) {
            getContext().registerReceiver(receiver, filter, android.content.Context.RECEIVER_EXPORTED);
        } else {
            getContext().registerReceiver(receiver, filter);
        }
`;

bgCode = bgCode.replace(oldRegister, newRegister);

// Also we need to name the receiver
const oldReceiverInit = `getContext().registerReceiver(new android.content.BroadcastReceiver() {`;
const newReceiverInit = `android.content.BroadcastReceiver receiver = new android.content.BroadcastReceiver() {`;
bgCode = bgCode.replace(oldReceiverInit, newReceiverInit);

fs.writeFileSync(bgPath, bgCode);
console.log('Fixed registerReceiver for older Android versions.');
