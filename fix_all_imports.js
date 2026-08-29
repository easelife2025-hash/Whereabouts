const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Remove all firestore imports
  const lines = content.split('\n');
  const filteredLines = lines.filter(l => !l.includes("from 'firebase/firestore'"));
  
  // Find where to add the unified import (after firebase import)
  const unifiedImport = "import { collection, doc, getDoc, getDocs, onSnapshot, query, where, addDoc, updateDoc, setDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';";
  
  const firebaseIndex = filteredLines.findIndex(l => l.includes("from '@/lib/firebase'"));
  if (firebaseIndex !== -1) {
    filteredLines.splice(firebaseIndex + 1, 0, unifiedImport);
  }
  
  fs.writeFileSync(file, filteredLines.join('\n'));
}

fix('app/(main)/map/page.tsx');
fix('app/(main)/people/page.tsx');
fix('app/(main)/requests/page.tsx');
fix('components/LocationTracker.tsx');

