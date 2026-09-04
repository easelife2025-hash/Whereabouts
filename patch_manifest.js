const fs = require('fs');
let manifest = fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf-8');

const permissionsToAdd = `
    <uses-feature android:name="android.hardware.location.gps" android:required="false" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
`;

if (!manifest.includes('android.permission.FOREGROUND_SERVICE')) {
  manifest = manifest.replace(
    '</manifest>',
    permissionsToAdd + '\n</manifest>'
  );
  fs.writeFileSync('android/app/src/main/AndroidManifest.xml', manifest);
  console.log('Manifest updated.');
} else {
  console.log('Permissions already exist.');
}
