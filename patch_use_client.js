const fs = require('fs');

const mapPath = 'app/(main)/map/page.tsx';
let mapCode = fs.readFileSync(mapPath, 'utf-8');

mapCode = mapCode.replace("import { Capacitor } from '@capacitor/core';\nimport { Geolocation } from '@capacitor/geolocation';\n'use client';", "'use client';\nimport { Capacitor } from '@capacitor/core';\nimport { Geolocation } from '@capacitor/geolocation';");

fs.writeFileSync(mapPath, mapCode);
console.log('Fixed use client directive');

