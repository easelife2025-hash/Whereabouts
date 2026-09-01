'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, MapPin, X, Shield, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, onSnapshot, query, where, addDoc, updateDoc, setDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';


type Request = {
  id: string;
  name: string;
  imgSeed: string;
  photoURL?: string;
  time: string;
  timestamp: number;
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [flowStep, setFlowStep] = useState<'initial' | 'duration'>('initial');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
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
      await addDoc(collection(db, 'location_shares'), {
        requesterId: selectedRequest.id,
        recipientId: user.uid,
        status: 'denied',
        createdAt: serverTimestamp(),
        expiresAt: null
      });

      await updateDoc(doc(db, 'location_requests', `${selectedRequest.id}_${user.uid}`), { status: 'denied', timestamp: serverTimestamp() });
    } catch (error) {
      console.error('Error denying request:', "error occurred");
    }

    closeRequest();
  };

  const handleSelectDuration = async (duration: string) => {
    if (!selectedRequest || !user) return;
    
    let expiresAt: Date | null = null;
    if (duration === '15m') {
      expiresAt = new Date(new Date().getTime() + 15 * 60000);
    } else if (duration === '1h') {
      expiresAt = new Date(new Date().getTime() + 60 * 60000);
    } else if (duration === '4h') {
      expiresAt = new Date(new Date().getTime() + 4 * 60 * 60000);
    }

    try {
      await addDoc(collection(db, 'location_shares'), {
        requesterId: selectedRequest.id,
        recipientId: user.uid,
        status: 'active',
        createdAt: serverTimestamp(),
        expiresAt: expiresAt
      });

      await updateDoc(doc(db, 'location_requests', `${selectedRequest.id}_${user.uid}`), { status: 'accepted', timestamp: serverTimestamp() });

    } catch (error) {
      console.error('Error accepting request:', "error occurred");
    }
    
    closeRequest();
    setTimeout(() => {
      router.push('/map');
    }, 400); 
  };

  return (
    <div className="flex flex-col h-full bg-white relative pb-20">
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-[32px] font-bold text-zinc-900 tracking-tight leading-none mb-2">Requests</h1>
        <p className="text-[15px] font-medium text-zinc-500">Manage who can see your location.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6">
        {requests.length === 0 ? (
          <div className="mt-24 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
              <Bell size={32} className="text-zinc-300" strokeWidth={2} />
            </div>
            <h3 className="text-[19px] font-bold text-zinc-900 mb-2">No pending requests</h3>
            <p className="text-[15px] font-medium text-zinc-500 max-w-[240px]">You&apos;re all caught up! No one is waiting for your location.</p>
          </div>
        ) : (
          <div className="space-y-0 mt-2">
            {requests.map(req => (
              <div key={req.id} className="py-4 border-b border-zinc-100 last:border-0 flex items-center gap-4">
                <Image 
                  src={req.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.name || 'User')}&background=F9C300&color=18181b`} 
                  alt={req.name}
                  width={48} 
                  height={48} 
                  className="rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <h4 className="text-[16px] font-bold text-zinc-900 mb-0.5">{req.name}</h4>
                  <p className="text-[13px] font-medium text-zinc-500">{req.time}</p>
                </div>
                <button 
                  onClick={() => openRequest(req)}
                  className="bg-[#F9C300] text-zinc-900 text-[13px] font-bold px-5 py-2.5 rounded-full active:scale-95 transition-transform"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Drawer Overlay */}
      <AnimatePresence>
        {selectedRequest && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeRequest}
              className="fixed inset-0 bg-black/40 z-40"
            />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] z-50 overflow-hidden flex flex-col"
            >
              <div className="flex justify-center pt-3 pb-2 w-full active:bg-zinc-50" onClick={closeRequest}>
                <div className="w-12 h-1.5 bg-zinc-200 rounded-full"></div>
              </div>

              <div className="px-6 pb-8 pt-4">
                <AnimatePresence mode="wait">
                  {flowStep === 'initial' ? (
                    <motion.div 
                      key="initial"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex flex-col items-center text-center"
                    >
                      <Image 
                        src={selectedRequest.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedRequest.name || 'User')}&background=F9C300&color=18181b`} 
                        alt={selectedRequest.name}
                        width={80} 
                        height={80} 
                        className="rounded-full object-cover mb-4 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <h2 className="text-[22px] font-bold text-zinc-900 leading-tight mb-2">
                        {selectedRequest.name} wants to see your live location.
                      </h2>
                      <p className="text-[15px] font-medium text-zinc-500 mb-8 max-w-[280px]">
                        They will be able to see your exact location on their map.
                      </p>

                      <div className="w-full space-y-3">
                        <button 
                          onClick={handleAllow}
                          className="w-full bg-[#F9C300] text-zinc-900 font-bold text-[17px] py-4 rounded-full active:bg-[#E5B200] transition-colors shadow-sm"
                        >
                          Allow
                        </button>
                        <button 
                          onClick={handleDeny}
                          className="w-full bg-white text-[#F9C300] font-bold text-[17px] py-4 rounded-full border border-zinc-200 active:bg-zinc-50 transition-colors"
                        >
                          Deny
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="duration"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[20px] font-bold text-zinc-900">For how long?</h2>
                        <button onClick={() => setFlowStep('initial')} className="p-2 -mr-2 bg-zinc-50 rounded-full text-zinc-500 active:bg-zinc-100 transition-colors">
                          <X size={20} strokeWidth={2.5} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {[
                          { id: '15m', label: '15 minutes', icon: Clock },
                          { id: '1h', label: '1 hour', icon: Clock },
                          { id: '4h', label: '4 hours', icon: Clock },
                          { id: 'inf', label: 'Until I stop', icon: Shield },
                        ].map(option => (
                          <button
                            key={option.id}
                            onClick={() => handleSelectDuration(option.id)}
                            className="w-full flex items-center justify-between bg-zinc-50 p-4 rounded-2xl border border-zinc-100 active:bg-zinc-100 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <option.icon size={20} className="text-zinc-400 group-hover:text-zinc-600 transition-colors" strokeWidth={2.5} />
                              <span className="text-[16px] font-bold text-zinc-900">{option.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
