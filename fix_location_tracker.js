const fs = require('fs');
let content = fs.readFileSync('components/LocationTracker.tsx', 'utf8');

content = content.replace(
  /import { db } from '@\/lib\/firebase';/,
  "import { db, rtdb } from '@/lib/firebase';"
);

content = content.replace(
  /import { collection, doc, getDoc, getDocs, onSnapshot, query, where, addDoc, updateDoc, setDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase\/firestore';/,
  "import { collection, doc, getDoc, getDocs, onSnapshot, query, where, addDoc, updateDoc, setDoc, deleteDoc, serverTimestamp as firestoreServerTimestamp, writeBatch } from 'firebase/firestore';\nimport { ref, set, serverTimestamp, remove } from 'firebase/database';"
);

content = content.replace(
  /setDoc\(doc\(db, 'user_locations', user\.uid\), \{[\s\S]*?\}\)\.catch\(console\.error\);/,
  "const locRef = ref(rtdb, `user_locations/${user.uid}`);\n          set(locRef, {\n            lat: position.coords.latitude,\n            lng: position.coords.longitude,\n            timestamp: serverTimestamp(),\n            viewers: activeViewers\n          }).catch(console.error);"
);

content = content.replace(
  /deleteDoc\(doc\(db, 'user_locations', user\.uid\)\)\.catch\(console\.error\);/,
  "remove(ref(rtdb, `user_locations/${user.uid}`)).catch(console.error);"
);

fs.writeFileSync('components/LocationTracker.tsx', content);
console.log("Updated components/LocationTracker.tsx");
