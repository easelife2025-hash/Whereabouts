const fs = require('fs');

let content = fs.readFileSync('app/(main)/requests/page.tsx', 'utf8');

const imports = `import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, MapPin, X, Shield, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { db, rtdb } from '@/lib/firebase';
import { ref, onValue, update, serverTimestamp as rtdbServerTimestamp } from 'firebase/database';
import { doc, getDoc, collection, addDoc, serverTimestamp as firestoreServerTimestamp } from 'firebase/firestore';`;

content = content.replace(/import \{ useState \} from 'react';[\s\S]*?import \{ useRouter \} from 'next\/navigation';/, imports);

content = content.replace(/type Request = \{[^}]+\};/, `type Request = {
  id: string;
  name: string;
  imgSeed: string;
  time: string;
  timestamp: number;
};`);

const newComponentLogic = `export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [flowStep, setFlowStep] = useState<'initial' | 'duration'>('initial');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
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
               const diff = Date.now() - data[pid].timestamp;
               if (diff > 86400000) timeStr = Math.floor(diff/86400000) + 'd ago';
               else if (diff > 3600000) timeStr = Math.floor(diff/3600000) + 'h ago';
               else if (diff > 60000) timeStr = Math.floor(diff/60000) + 'm ago';
            }

            loadedRequests.push({
              id: pid,
              name: userData.name,
              imgSeed: userData.imgSeed || 'default',
              time: timeStr,
              timestamp: data[pid].timestamp || Date.now()
            });
          }
        }
        
        loadedRequests.sort((a, b) => b.timestamp - a.timestamp);
        setRequests(loadedRequests);
      } else {
        setRequests([]);
      }
    });

    return () => unsub();
  }, [user]);

  const openRequest = (req: Request) => {
    setSelectedRequest(req);
    setFlowStep('initial');
  };

  const closeRequest = () => {
    setSelectedRequest(null);
    setTimeout(() => setFlowStep('initial'), 300); // Reset after animation
  };

  const handleAllow = () => {
    setFlowStep('duration');
  };

  const handleDeny = async () => {
    if (!selectedRequest || !user) return;

    try {
      const updates: any = {};
      updates[\`location_requests/\${user.uid}/incoming/\${selectedRequest.id}\`] = { status: 'denied', timestamp: rtdbServerTimestamp() };
      updates[\`location_requests/\${selectedRequest.id}/outgoing/\${user.uid}\`] = { status: 'denied', timestamp: rtdbServerTimestamp() };
      
      await update(ref(rtdb), updates);
    } catch (error) {
      console.error('Error denying request:', error);
    }

    closeRequest();
  };

  const handleSelectDuration = async (duration: string) => {
    if (!selectedRequest || !user) return;
    
    let expiresAt: Date | null = null;
    if (duration === '15m') {
      expiresAt = new Date(Date.now() + 15 * 60000);
    } else if (duration === '1h') {
      expiresAt = new Date(Date.now() + 60 * 60000);
    } else if (duration === '4h') {
      expiresAt = new Date(Date.now() + 4 * 60 * 60000);
    }

    try {
      await addDoc(collection(db, 'location_shares'), {
        requesterId: selectedRequest.id,
        recipientId: user.uid,
        status: 'active',
        createdAt: firestoreServerTimestamp(),
        expiresAt: expiresAt
      });

      const updates: any = {};
      updates[\`location_requests/\${user.uid}/incoming/\${selectedRequest.id}\`] = { status: 'accepted', timestamp: rtdbServerTimestamp() };
      updates[\`location_requests/\${selectedRequest.id}/outgoing/\${user.uid}\`] = { status: 'accepted', timestamp: rtdbServerTimestamp() };
      
      await update(ref(rtdb), updates);

    } catch (error) {
      console.error('Error accepting request:', error);
    }
    
    closeRequest();
    setTimeout(() => {
      router.push('/map');
    }, 400); 
  };`;

content = content.replace(/export default function RequestsPage\(\) \{[\s\S]*?return \(/, newComponentLogic + '\n\n  return (');

fs.writeFileSync('app/(main)/requests/page.tsx', content);
console.log('Replaced successfully');
