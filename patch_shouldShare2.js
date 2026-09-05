const fs = require('fs');
const path = 'app/(main)/map/page.tsx';
let code = fs.readFileSync(path, 'utf-8');

const target1 = `const shouldShare = validShares.length > 0 && hasPermission;`;
const replacement1 = `const shouldShare = validShares.length > 0 && hasPermission && isTracking;`;
code = code.replace(target1, replacement1);

const target2 = `      } else {
        stopSharing();
        // Remove location from RTDB when stop sharing
        const locRef = ref(rtdb, 'user_locations/' + user.uid);
        set(locRef, null).catch(err => console.error('Failed to remove RTDB location:', err));
      }`;
const replacement2 = `      } else {
        stopTracking();
        stopSharing();
        // Remove location from RTDB when stop sharing
        const locRef = ref(rtdb, 'user_locations/' + user.uid);
        set(locRef, null).catch(err => console.error('Failed to remove RTDB location:', err));
      }`;
code = code.replace(target2, replacement2);

fs.writeFileSync(path, code);
console.log('Patched shouldShare2');
