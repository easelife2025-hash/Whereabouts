const fs = require('fs');
let code = fs.readFileSync('app/(main)/requests/page.tsx', 'utf-8');

const effectStr = `  useEffect(() => {
    if (!user) return;
    const incomingRef = ref(rtdb, \`location_requests/\${user.uid}/incoming\`);
    
    const unsub = onValue(incomingRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const pendingIds = Object.keys(data).filter(key => data[key].status === 'pending');
        
        const loadedRequests: Request[] = [];
        for (const pid of pendingIds) {
          const userDoc = await getDoc(doc(db, 'users', pid));
          if (userDoc.exists()) {`;

const newEffectStr = `  useEffect(() => {
    if (!user) return;
    const incomingRef = ref(rtdb, \`location_requests/\${user.uid}/incoming\`);
    
    const unsub = onValue(incomingRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const pendingIds = Object.keys(data).filter(key => data[key].status === 'pending');
        
        // Fetch blocks to filter out blocked users
        const blocksQuery = query(collection(db, 'blocks'), where('blockerId', '==', user.uid));
        const blocksSnap = await getDocs(blocksQuery);
        const blockedIds = new Set<string>();
        blocksSnap.forEach(d => blockedIds.add(d.data().blockedId));

        const blocksQuery2 = query(collection(db, 'blocks'), where('blockedId', '==', user.uid));
        const blocksSnap2 = await getDocs(blocksQuery2);
        blocksSnap2.forEach(d => blockedIds.add(d.data().blockerId));

        const loadedRequests: Request[] = [];
        for (const pid of pendingIds) {
          if (blockedIds.has(pid)) continue;

          const userDoc = await getDoc(doc(db, 'users', pid));
          if (userDoc.exists()) {`;

code = code.replace(effectStr, newEffectStr);
fs.writeFileSync('app/(main)/requests/page.tsx', code);
