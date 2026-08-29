const fs = require('fs');
let content = fs.readFileSync('components/LocationTracker.tsx', 'utf8');

// replace RTDB with Firestore
content = content.replace("import { db, rtdb } from '@/lib/firebase';", "import { db } from '@/lib/firebase';");
content = content.replace("import { ref, set, serverTimestamp, onDisconnect } from 'firebase/database';", "import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';");

// we need to keep track of active viewers
const TRACK_VIEWERS = `    const unsub = onSnapshot(q, (snapshot) => {
      const now = new Date();
      let hasAny = false;
      const viewers: string[] = [];
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        let isExpired = false;
        if (data.expiresAt) {
          const expiresDate = data.expiresAt.toDate();
          if (now > expiresDate) {
            isExpired = true;
          }
        }
        if (!isExpired) {
          hasAny = true;
          if (data.requesterId && !viewers.includes(data.requesterId)) viewers.push(data.requesterId);
        }
      }
      
      setHasActiveShares(hasAny);
    });`;
    
const OLD_TRACK = `    const unsub = onSnapshot(q, (snapshot) => {
      const now = new Date();
      let hasAny = false;
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        let isExpired = false;
        if (data.expiresAt) {
          const expiresDate = data.expiresAt.toDate();
          if (now > expiresDate) {
            isExpired = true;
          }
        }
        if (!isExpired) {
          hasAny = true;
          break;
        }
      }
      
      setHasActiveShares(hasAny);
    });`;

content = content.replace(OLD_TRACK, TRACK_VIEWERS);

// add activeViewers state
content = content.replace("const [hasActiveShares, setHasActiveShares] = useState(false);", "const [hasActiveShares, setHasActiveShares] = useState(false);\n  const [activeViewers, setActiveViewers] = useState<string[]>([]);");
content = content.replace("setHasActiveShares(hasAny);", "setHasActiveShares(hasAny);\n      setActiveViewers(viewers);");

// update location sharing logic
const GEOLOC_OLD = `      const locationRef = ref(rtdb, \`user_locations/\${user.uid}\`);
      
      // Clean up location on disconnect (if they close app)
      onDisconnect(locationRef).remove().catch(console.error);

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (!isActive) return;
          set(locationRef, {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: serverTimestamp()
          }).catch(console.error);
        },`;

const GEOLOC_NEW = `      watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (!isActive) return;
          setDoc(doc(db, 'user_locations', user.uid), {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: serverTimestamp(),
            viewers: activeViewers
          }).catch(console.error);
        },`;
content = content.replace(GEOLOC_OLD, GEOLOC_NEW);

const CLEANUP_OLD = `      if (user && hasActiveShares) {
        // When stopping (e.g. sharing ends or component unmounts), remove location
        const locationRef = ref(rtdb, \`user_locations/\${user.uid}\`);
        set(locationRef, null).catch(console.error);
        onDisconnect(locationRef).cancel().catch(console.error);
      }`;
      
const CLEANUP_NEW = `      if (user && hasActiveShares) {
        deleteDoc(doc(db, 'user_locations', user.uid)).catch(console.error);
      }`;
content = content.replace(CLEANUP_OLD, CLEANUP_NEW);

fs.writeFileSync('components/LocationTracker.tsx', content);
