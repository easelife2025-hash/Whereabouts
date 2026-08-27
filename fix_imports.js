const fs = require('fs');
let code = fs.readFileSync('app/(main)/requests/page.tsx', 'utf-8');

code = code.replace(
  "import { doc, getDoc, collection, addDoc, serverTimestamp as firestoreServerTimestamp } from 'firebase/firestore';",
  "import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp as firestoreServerTimestamp } from 'firebase/firestore';"
);

fs.writeFileSync('app/(main)/requests/page.tsx', code);
