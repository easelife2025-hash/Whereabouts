const fs = require('fs');
let content = fs.readFileSync('app/(main)/people/page.tsx', 'utf8');

// 1. Change RTDB imports to Firestore where appropriate
content = content.replace(/import { ref, onValue, set, update, remove, get, serverTimestamp } from 'firebase\/database';/g, 
  "import { collection, getDocs, query, where, addDoc, updateDoc, doc, setDoc, deleteDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';");
content = content.replace(/import { db, rtdb } from '@\/lib\/firebase';/g, "import { db } from '@/lib/firebase';");

// 2. Remove RTDB incomingRef / outgoingRef logic and use Firestore
const RTDB_LOGIC = `  useEffect(() => {
    if (!user) return;
    
    // Listen to incoming requests
    const incomingRef = ref(rtdb, \`location_requests/\${user.uid}/incoming\`);
    const unsubIncoming = onValue(incomingRef, (snapshot) => {
      if (snapshot.exists()) {
        setIncomingRequests(snapshot.val());
      } else {
        setIncomingRequests({});
      }
    });

    // Listen to outgoing requests
    const outgoingRef = ref(rtdb, \`location_requests/\${user.uid}/outgoing\`);
    const unsubOutgoing = onValue(outgoingRef, (snapshot) => {
      if (snapshot.exists()) {
        setOutgoingRequests(snapshot.val());
      } else {
        setOutgoingRequests({});
      }
    });

    return () => {
      unsubIncoming();
      unsubOutgoing();
    };
  }, [user]);`;

const FIRESTORE_LOGIC = `  // Block logic
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists() && doc.data().blockedUsers) {
        setBlockedUsers(doc.data().blockedUsers);
      } else {
        setBlockedUsers([]);
      }
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    // Listen to requests
    const incomingQuery = query(collection(db, 'location_requests'), where('recipientId', '==', user.uid));
    const unsubIncoming = onSnapshot(incomingQuery, (snapshot) => {
      const incoming: Record<string, any> = {};
      snapshot.forEach(doc => {
        incoming[doc.data().senderId] = { status: doc.data().status, id: doc.id };
      });
      setIncomingRequests(incoming);
    });

    const outgoingQuery = query(collection(db, 'location_requests'), where('senderId', '==', user.uid));
    const unsubOutgoing = onSnapshot(outgoingQuery, (snapshot) => {
      const outgoing: Record<string, any> = {};
      snapshot.forEach(doc => {
        outgoing[doc.data().recipientId] = { status: doc.data().status, id: doc.id };
      });
      setOutgoingRequests(outgoing);
    });

    return () => {
      unsubIncoming();
      unsubOutgoing();
    };
  }, [user]);`;

content = content.replace(RTDB_LOGIC, FIRESTORE_LOGIC);

// 3. Update handleSendRequest
const SEND_REQUEST_RTDB = `  const handleSendRequest = async (recipientId: string) => {
    if (!user) return;
    const updates: any = {};
    updates[\`location_requests/\${user.uid}/outgoing/\${recipientId}\`] = { status: 'pending', timestamp: serverTimestamp() };
    
    updates[\`location_requests/\${recipientId}/incoming/\${user.uid}\`] = { status: 'pending', timestamp: serverTimestamp() };
    
    await update(ref(rtdb), updates);
  };`;

const SEND_REQUEST_FIRESTORE = `  const handleSendRequest = async (recipientId: string) => {
    if (!user) return;
    await setDoc(doc(db, 'location_requests', \`\${user.uid}_\${recipientId}\`), {
      senderId: user.uid,
      recipientId: recipientId,
      status: 'pending',
      timestamp: serverTimestamp()
    });
  };`;
content = content.replace(SEND_REQUEST_RTDB, SEND_REQUEST_FIRESTORE);

// 4. Update handleRespondToRequest
const RESPOND_RTDB = `  const handleRespondToRequest = async (senderId: string, response: 'accepted' | 'denied') => {
    if (!user) return;
    const updates: any = {};
    updates[\`location_requests/\${user.uid}/incoming/\${senderId}\`] = { status: response, timestamp: serverTimestamp() };
    updates[\`location_requests/\${senderId}/outgoing/\${user.uid}\`] = { status: response, timestamp: serverTimestamp() };
    
    await update(ref(rtdb), updates);
  };`;

const RESPOND_FIRESTORE = `  const handleRespondToRequest = async (senderId: string, response: 'accepted' | 'denied') => {
    if (!user) return;
    const reqId = \`\${senderId}_\${user.uid}\`;
    await updateDoc(doc(db, 'location_requests', reqId), { status: response, timestamp: serverTimestamp() });
    
    if (response === 'accepted') {
      await addDoc(collection(db, 'location_shares'), {
        requesterId: senderId,
        recipientId: user.uid,
        status: 'active',
        createdAt: serverTimestamp(),
      });
    }
  };`;
content = content.replace(RESPOND_RTDB, RESPOND_FIRESTORE);

// 5. Update handleRevokeShare
const REVOKE_RTDB = `  const handleRevokeShare = async (recipientId: string) => {
    if (!user) return;
    const updates: any = {};
    updates[\`location_requests/\${user.uid}/outgoing/\${recipientId}\`] = { status: 'revoked', timestamp: serverTimestamp() };
    updates[\`location_requests/\${recipientId}/incoming/\${user.uid}\`] = { status: 'revoked', timestamp: serverTimestamp() };
    
    await update(ref(rtdb), updates);
  };`;

const REVOKE_FIRESTORE = `  const handleRevokeShare = async (recipientId: string) => {
    if (!user) return;
    const reqId = \`\${user.uid}_\${recipientId}\`;
    const reqId2 = \`\${recipientId}_\${user.uid}\`;
    
    try { await updateDoc(doc(db, 'location_requests', reqId), { status: 'revoked', timestamp: serverTimestamp() }); } catch(e) {}
    try { await updateDoc(doc(db, 'location_requests', reqId2), { status: 'revoked', timestamp: serverTimestamp() }); } catch(e) {}

    // Find and revoke share in location_shares where I am sharing with them
    const q = query(collection(db, 'location_shares'), where('recipientId', '==', user.uid), where('requesterId', '==', recipientId), where('status', '==', 'active'));
    const snapshot = await getDocs(q);
    snapshot.forEach(async (d) => {
      await updateDoc(doc(db, 'location_shares', d.id), { status: 'revoked' });
    });
  };`;
content = content.replace(REVOKE_RTDB, REVOKE_FIRESTORE);

fs.writeFileSync('app/(main)/people/page.tsx', content);
