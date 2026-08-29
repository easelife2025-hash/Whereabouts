const fs = require('fs');
let content = fs.readFileSync('app/(main)/requests/page.tsx', 'utf8');

const RTDB_FETCH = `  useEffect(() => {
    if (!user) return;
    const incomingRef = ref(rtdb, \`location_requests/\${user.uid}/incoming\`);
    
    const unsub = onValue(incomingRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const pendingIds = Object.keys(data).filter(key => data[key].status === 'pending');
        
        const loadedRequests: Request[] = [];
        for (const pid of pendingIds) {
          const userDoc = await getDoc(doc(db, 'users', pid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Format timestamp nicely if we want, or just generic
            let timeStr = 'Just now';
            if (data[pid].timestamp) {
               const diff = new Date().getTime() - data[pid].timestamp;
               if (diff > 86400000) timeStr = Math.floor(diff/86400000) + 'd ago';
               else if (diff > 3600000) timeStr = Math.floor(diff/3600000) + 'h ago';
               else if (diff > 60000) timeStr = Math.floor(diff/60000) + 'm ago';
            }

            loadedRequests.push({
              id: pid,
              name: userData.name,
              imgSeed: userData.imgSeed || 'default',
              time: timeStr,
              timestamp: data[pid].timestamp || new Date().getTime()
            });
          }
        }
        
        // Sort descending by time
        loadedRequests.sort((a,b) => b.timestamp - a.timestamp);
        setRequests(loadedRequests);
      } else {
        setRequests([]);
      }
    });

    return () => unsub();
  }, [user]);`;
  
const FIRESTORE_FETCH = `  useEffect(() => {
    if (!user) return;
    const incomingQuery = query(collection(db, 'location_requests'), where('recipientId', '==', user.uid), where('status', '==', 'pending'));
    
    const unsub = onSnapshot(incomingQuery, async (snapshot) => {
      if (!snapshot.empty) {
        const loadedRequests: Request[] = [];
        for (const d of snapshot.docs) {
          const reqData = d.data();
          const userDoc = await getDoc(doc(db, 'users', reqData.senderId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            let timeStr = 'Just now';
            if (reqData.timestamp) {
               const millis = reqData.timestamp.toMillis();
               const diff = new Date().getTime() - millis;
               if (diff > 86400000) timeStr = Math.floor(diff/86400000) + 'd ago';
               else if (diff > 3600000) timeStr = Math.floor(diff/3600000) + 'h ago';
               else if (diff > 60000) timeStr = Math.floor(diff/60000) + 'm ago';
            }

            loadedRequests.push({
              id: reqData.senderId,
              name: userData.name,
              imgSeed: userData.imgSeed || 'default',
              time: timeStr,
              timestamp: reqData.timestamp ? reqData.timestamp.toMillis() : new Date().getTime()
            });
          }
        }
        loadedRequests.sort((a,b) => b.timestamp - a.timestamp);
        setRequests(loadedRequests);
      } else {
        setRequests([]);
      }
    });

    return () => unsub();
  }, [user]);`;

content = content.replace(RTDB_FETCH, FIRESTORE_FETCH);

const HANDLE_DENY_OLD = `      const updates: any = {};
      updates[\`location_requests/\${user.uid}/incoming/\${selectedRequest.id}\`] = { status: 'denied', timestamp: rtdbServerTimestamp() };
      updates[\`location_requests/\${selectedRequest.id}/outgoing/\${user.uid}\`] = { status: 'denied', timestamp: rtdbServerTimestamp() };
      
      await update(ref(rtdb), updates);`;

const HANDLE_DENY_NEW = `      await updateDoc(doc(db, 'location_requests', \`\${selectedRequest.id}_\${user.uid}\`), { status: 'denied', timestamp: serverTimestamp() });`;

content = content.replace(HANDLE_DENY_OLD, HANDLE_DENY_NEW);

const HANDLE_ALLOW_OLD = `      const updates: any = {};
      updates[\`location_requests/\${user.uid}/incoming/\${selectedRequest.id}\`] = { status: 'accepted', timestamp: rtdbServerTimestamp() };
      updates[\`location_requests/\${selectedRequest.id}/outgoing/\${user.uid}\`] = { status: 'accepted', timestamp: rtdbServerTimestamp() };
      
      await update(ref(rtdb), updates);`;
      
const HANDLE_ALLOW_NEW = `      await updateDoc(doc(db, 'location_requests', \`\${selectedRequest.id}_\${user.uid}\`), { status: 'accepted', timestamp: serverTimestamp() });`;

content = content.replace(HANDLE_ALLOW_OLD, HANDLE_ALLOW_NEW);
content = content.replace(/firestoreServerTimestamp/g, 'serverTimestamp');

fs.writeFileSync('app/(main)/requests/page.tsx', content);
