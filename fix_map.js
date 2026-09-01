const fs = require('fs');
let content = fs.readFileSync('app/(main)/map/page.tsx', 'utf8');

// Add rtdb import
content = content.replace(
  /import { db } from '@\/lib\/firebase';/,
  "import { db, rtdb } from '@/lib/firebase';\nimport { ref, onValue, off } from 'firebase/database';"
);

// Replace the Firestore onSnapshot with RTDB onValue
const oldFirestoreCode = `
        // 2. Listen to Firestore for these specific authorized users
        const locRef = doc(db, 'user_locations', uid);
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
          // Update state with new array
          const newMarkers = Array.from(newMarkersMap.values());
          setAuthorizedMarkers(newMarkers);
          setSelectedUser((prev: any) => {
            if (prev && !newMarkersMap.has(prev.uid)) {
              return null;
            }
            return prev;
          });
        }, (error) => {
          console.error("Firestore listener error:", error);
        });
        rtdbUnsubs.push(unsubLoc);
`;

const newRTDBCode = `
        // 2. Listen to RTDB for these specific authorized users
        const locRef = ref(rtdb, \`user_locations/\${uid}\`);
        const listener = onValue(locRef, (snapshot) => {
          const data = snapshot.val();
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
          // Update state with new array
          const newMarkers = Array.from(newMarkersMap.values());
          setAuthorizedMarkers(newMarkers);
          setSelectedUser((prev: any) => {
            if (prev && !newMarkersMap.has(prev.uid)) {
              return null;
            }
            return prev;
          });
        }, (error) => {
          console.error("RTDB listener error:", error);
        });
        rtdbUnsubs.push(() => off(locRef, 'value', listener));
`;

content = content.replace(oldFirestoreCode.trim(), newRTDBCode.trim());

fs.writeFileSync('app/(main)/map/page.tsx', content);
console.log("Updated app/(main)/map/page.tsx");
