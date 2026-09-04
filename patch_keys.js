const fs = require('fs');

const mapPath = 'app/(main)/map/page.tsx';
let mapCode = fs.readFileSync(mapPath, 'utf-8');

mapCode = mapCode.replace(
  'lat: data.lat,\n              lng: data.lng,',
  'lat: data.latitude || data.lat,\n              lng: data.longitude || data.lng,'
);

mapCode = mapCode.replace(
  'if (data && data.lat && data.lng) {',
  'if (data && (data.lat || data.latitude) && (data.lng || data.longitude)) {'
);

mapCode = mapCode.replace(
  'lat: loc.lat,\n            lng: loc.lng,\n            accuracy: loc.accuracy,\n            timestamp: loc.timestamp',
  'latitude: loc.lat,\n            longitude: loc.lng,\n            accuracy: loc.accuracy,\n            updatedAt: loc.timestamp'
);

fs.writeFileSync(mapPath, mapCode);
console.log('Patched map page keys');

