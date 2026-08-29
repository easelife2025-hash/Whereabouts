const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import { doc, getDoc, collection, addDoc, serverTimestamp as firestoreServerTimestamp } from 'firebase\/firestore';/g, "");
  content = content.replace(/import { doc, onSnapshot, query, collection, where, updateDoc, serverTimestamp, getDocs, addDoc } from 'firebase\/firestore';/g, "import { doc, getDoc, onSnapshot, query, collection, where, updateDoc, serverTimestamp, getDocs, addDoc, setDoc, deleteDoc } from 'firebase/firestore';");
  content = content.replace(/firebaseDoc/g, "doc");
  content = content.replace(/import { collection, getDocs, query, where, addDoc, updateDoc, doc, setDoc, deleteDoc, serverTimestamp, onSnapshot } from 'firebase\/firestore';/g, "import { doc, getDoc, onSnapshot, query, collection, where, updateDoc, serverTimestamp, getDocs, addDoc, setDoc, deleteDoc } from 'firebase/firestore';");
  fs.writeFileSync(file, content);
}

fix('app/(main)/requests/page.tsx');
fix('app/(main)/people/page.tsx');
