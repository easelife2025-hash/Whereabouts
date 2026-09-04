const fs = require('fs');

const mapPath = 'app/(main)/map/page.tsx';
let mapCode = fs.readFileSync(mapPath, 'utf-8');

const replacement = `const shouldShare = validShares.length > 0 && hasPermission;`;

mapCode = mapCode.replace(
  'const shouldShare = validShares.length > 0 && hasPermission && isTracking;',
  replacement
);

mapCode = mapCode.replace(
  '}, [outboundShares, user, startSharing, stopSharing, shareContext, isTracking]);',
  '}, [outboundShares, user, startSharing, stopSharing, shareContext]);'
);

fs.writeFileSync(mapPath, mapCode);
console.log('Removed isTracking from background logic');
