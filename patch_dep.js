const fs = require('fs');
const mapPath = 'app/(main)/map/page.tsx';
let mapCode = fs.readFileSync(mapPath, 'utf-8');

mapCode = mapCode.replace(
  '}, [outboundShares, user, startSharing, stopSharing, shareContext]);',
  '}, [outboundShares, user, startSharing, stopSharing, shareContext, isTracking]);'
);

fs.writeFileSync(mapPath, mapCode);
console.log('Added isTracking back to dependency array');
