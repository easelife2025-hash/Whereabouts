const fs = require('fs');
const file = 'app/(main)/map/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetImport = "import { doc, getDoc } from 'firebase/firestore';";
const replacementImport = "import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';";
code = code.replace(targetImport, replacementImport);

const targetEffect = `  useEffect(() => {
    if (!user) return;
    
    // Listen to all users' locations. In production, secure this with rules.
    const locationsRef = ref(rtdb, 'user_locations');
    const unsub = onValue(locationsRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const newMarkers: any[] = [];
        for (const uid of Object.keys(data)) {
          if (uid !== user.uid && data[uid].lat && data[uid].lng) {
            // Get user info
            const userDoc = await getDoc(doc(db, 'users', uid));
            const userData = userDoc.exists() ? userDoc.data() : { name: 'Unknown' };
            
            newMarkers.push({
              uid,
              name: userData.name,
              lat: data[uid].lat,
              lng: data[uid].lng,
              timestamp: data[uid].timestamp
            });
          }
        }
        setAuthorizedMarkers(newMarkers);
      } else {
        setAuthorizedMarkers([]);
      }
    });

    return () => unsub();
  }, [user]);`;

const replacementEffect = `  useEffect(() => {
    if (!user) return;
    
    // 1. Get the list of people sharing with ME
    const q = query(
      collection(db, 'location_shares'),
      where('requesterId', '==', user.uid),
      where('status', '==', 'active')
    );
    
    let rtdbUnsubs: (() => void)[] = [];
    
    const unsubFirestore = onSnapshot(q, (snapshot) => {
      // Clear old RTDB listeners when sharing status changes
      rtdbUnsubs.forEach(unsub => unsub());
      rtdbUnsubs = [];
      
      const authorizedIds = snapshot.docs.map(doc => doc.data().recipientId);
      
      if (authorizedIds.length === 0) {
        setAuthorizedMarkers([]);
        return;
      }

      const newMarkersMap = new Map();
      
      authorizedIds.forEach(async (uid) => {
        // Fetch user info just once
        const userDoc = await getDoc(doc(db, 'users', uid));
        const userData = userDoc.exists() ? userDoc.data() : { name: 'Unknown' };
        
        // 2. Listen to RTDB for these specific authorized users
        const locRef = ref(rtdb, \`user_locations/\${uid}\`);
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
          // Update state with new array
          setAuthorizedMarkers(Array.from(newMarkersMap.values()));
        }, (error) => {
          console.error("RTDB listener error:", error);
        });
        rtdbUnsubs.push(unsubRTDB);
      });
    }, (error) => {
      console.error("Firestore listener error:", error);
    });

    return () => {
      unsubFirestore();
      rtdbUnsubs.forEach(unsub => unsub());
    };
  }, [user]);`;

code = code.replace(targetEffect, replacementEffect);

// Wait, I should also catch image errors or vis.gl errors? Let's check imports
if (!code.includes("import Image from 'next/image';")) {
  code = code.replace("import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';", "import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';\\nimport Image from 'next/image';");
}

fs.writeFileSync(file, code);
