const fs = require('fs');
const path = 'app/(main)/map/page.tsx';
let code = fs.readFileSync(path, 'utf-8');

const target = `<Map3D
              mode="SATELLITE"
              defaultCenter={center ? { lat: center.lat, lng: center.lng, altitude: 0 } : { lat: 0, lng: 0, altitude: 0 }}
              defaultRange={1000}
              defaultTilt={67.5}
              defaultHeading={45}
              defaultLabelsDisabled={false}
              onCameraChanged={() => setIsFollowing(false)}
            >`;

const replacement = `<Map3D
              mode="SATELLITE"
              defaultCenter={center ? { lat: center.lat, lng: center.lng, altitude: 0 } : { lat: 0, lng: 0, altitude: 0 }}
              defaultRange={1000}
              defaultTilt={67.5}
              defaultHeading={45}
              defaultLabelsDisabled={false}
            >`;

code = code.replace(target, replacement);
fs.writeFileSync(path, code);
