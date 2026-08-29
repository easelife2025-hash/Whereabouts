const fs = require('fs');
let content = fs.readFileSync('app/(main)/requests/page.tsx', 'utf8');

// replace RTDB with Firestore
content = content.replace("import { db, rtdb } from '@/lib/firebase';", "import { db } from '@/lib/firebase';");
content = content.replace("import { ref, onValue, update, serverTimestamp as rtdbServerTimestamp } from 'firebase/database';", "import { doc, onSnapshot, query, collection, where, updateDoc, serverTimestamp, getDocs, addDoc } from 'firebase/firestore';");

// 2. Fetch requests from Firestore
const RTDB_FETCH = `  useEffect(() => {
    if (!user) return;
    const incomingRef = ref(rtdb, \`location_requests/\${user.uid}/incoming\`);
    
    const unsub = onValue(incomingRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const pendingIds = Object.keys(data).filter(id => data[id].status === 'pending');
      
      if (pendingIds.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const requestsData: any[] = [];
      for (const id of pendingIds) {
        const userDoc = await getDoc(firebaseDoc(db, 'users', id));
        if (userDoc.exists()) {
          requestsData.push({
            id,
            ...userDoc.data(),
            timestamp: data[id].timestamp
          });
        }
      }

      setRequests(requestsData.sort((a, b) => b.timestamp - a.timestamp));
      setLoading(false);
    });

    return () => unsub();
  }, [user]);`;

const FIRESTORE_FETCH = `  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'location_requests'), where('recipientId', '==', user.uid), where('status', '==', 'pending'));
    
    const unsub = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const requestsData: any[] = [];
      for (const d of snapshot.docs) {
        const reqData = d.data();
        const userDoc = await getDoc(firebaseDoc(db, 'users', reqData.senderId));
        if (userDoc.exists()) {
          requestsData.push({
            id: reqData.senderId,
            reqId: d.id,
            ...userDoc.data(),
            timestamp: reqData.timestamp
          });
        }
      }

      setRequests(requestsData.sort((a, b) => (b.timestamp?.toMillis?.() || 0) - (a.timestamp?.toMillis?.() || 0)));
      setLoading(false);
    });

    return () => unsub();
  }, [user]);`;

content = content.replace(RTDB_FETCH, FIRESTORE_FETCH);

// 3. Handle respond to request
const HANDLE_DECLINE = `  const handleDecline = async () => {
    if (!user || !selectedRequest) return;
    try {
      const updates: any = {};
      updates[\`location_requests/\${user.uid}/incoming/\${selectedRequest.id}\`] = { status: 'denied', timestamp: rtdbServerTimestamp() };
      updates[\`location_requests/\${selectedRequest.id}/outgoing/\${user.uid}\`] = { status: 'denied', timestamp: rtdbServerTimestamp() };
      
      await update(ref(rtdb), updates);
      
      setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
      setSelectedRequest(null);
    } catch (err) {
      console.error(err);
    }
  };`;

const FIRESTORE_DECLINE = `  const handleDecline = async () => {
    if (!user || !selectedRequest) return;
    try {
      await updateDoc(doc(db, 'location_requests', selectedRequest.reqId), { status: 'denied', timestamp: serverTimestamp() });
      setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
      setSelectedRequest(null);
    } catch (err) {
      console.error(err);
    }
  };`;
content = content.replace(HANDLE_DECLINE, FIRESTORE_DECLINE);

const HANDLE_ACCEPT = `  const handleAccept = async () => {
    if (!user || !selectedRequest) return;
    try {
      // Create a new location share
      await addDoc(collection(db, 'location_shares'), {
        requesterId: selectedRequest.id,
        recipientId: user.uid,
        status: 'active',
        createdAt: serverTimestamp(),
      });

      // Update the request status
      const updates: any = {};
      updates[\`location_requests/\${user.uid}/incoming/\${selectedRequest.id}\`] = { status: 'accepted', timestamp: rtdbServerTimestamp() };
      updates[\`location_requests/\${selectedRequest.id}/outgoing/\${user.uid}\`] = { status: 'accepted', timestamp: rtdbServerTimestamp() };
      
      await update(ref(rtdb), updates);
      
      setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
      setSelectedRequest(null);
    } catch (err) {
      console.error(err);
    }
  };`;

const FIRESTORE_ACCEPT = `  const handleAccept = async () => {
    if (!user || !selectedRequest) return;
    try {
      // Create a new location share
      await addDoc(collection(db, 'location_shares'), {
        requesterId: selectedRequest.id,
        recipientId: user.uid,
        status: 'active',
        createdAt: serverTimestamp(),
      });

      // Update the request status
      await updateDoc(doc(db, 'location_requests', selectedRequest.reqId), { status: 'accepted', timestamp: serverTimestamp() });
      
      setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
      setSelectedRequest(null);
    } catch (err) {
      console.error(err);
    }
  };`;
content = content.replace(HANDLE_ACCEPT, FIRESTORE_ACCEPT);

fs.writeFileSync('app/(main)/requests/page.tsx', content);
