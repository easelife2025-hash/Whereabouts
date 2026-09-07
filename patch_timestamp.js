const fs = require('fs');
const servicePath = 'node_modules/@capacitor-community/background-geolocation/android/src/main/java/com/equimaps/capacitor_background_geolocation/BackgroundGeolocationService.java';

let serviceCode = fs.readFileSync(servicePath, 'utf-8');

serviceCode = serviceCode.replace(
  'System.currentTimeMillis()',
  'location.getTime()'
);

fs.writeFileSync(servicePath, serviceCode);
console.log('Fixed timestamp');
