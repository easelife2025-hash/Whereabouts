const fs = require('fs');
let content = fs.readFileSync('app/(main)/map/page.tsx', 'utf8');

// 1. Change RTDB imports to Firestore where appropriate
content = content.replace("import { rtdb, db } from '@/lib/firebase';", "import { db } from '@/lib/firebase';");
content = content.replace("import { ref, onValue } from 'firebase/database';", "import { onSnapshot, doc } from 'firebase/firestore';");

// 2. Replace RTDB fetch with Firestore fetch
const RTDB_FETCH = `        const locRef = ref(rtdb, \`user_locations/\${uid}\`);
        const unsubRTDB = onValue(locRef, (locSnapshot) => {
          const data = locSnapshot.val();
          if (data && data.lat && data.lng) {
            newMarkersMap.set(uid, {
              uid,
              name: userData.name,
              lat: data.lat,
              lng: data.lng,
              timestamp: data.timestamp
            });
          } else {
            newMarkersMap.delete(uid);
          }
          // Convert map to array to trigger re-render
          setAuthorizedMarkers(Array.from(newMarkersMap.values()));
        });
        
        rtdbUnsubs.push(unsubRTDB);`;

const FIRESTORE_FETCH = `        const locRef = doc(db, 'user_locations', uid);
        const unsubLoc = onSnapshot(locRef, (locSnapshot) => {
          const data = locSnapshot.data();
          if (data && data.lat && data.lng) {
            newMarkersMap.set(uid, {
              uid,
              name: userData.name,
              lat: data.lat,
              lng: data.lng,
              timestamp: data.timestamp
            });
          } else {
            newMarkersMap.delete(uid);
          }
          setAuthorizedMarkers(Array.from(newMarkersMap.values()));
        }, (err) => {
          console.error("Error reading location:", err);
          newMarkersMap.delete(uid);
          setAuthorizedMarkers(Array.from(newMarkersMap.values()));
        });
        
        rtdbUnsubs.push(unsubLoc);`;

content = content.replace(RTDB_FETCH, FIRESTORE_FETCH);

fs.writeFileSync('app/(main)/map/page.tsx', content);
