'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ShieldAlert, X, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, writeBatch } from 'firebase/firestore';

type SharedUser = {
  id: string;
  requesterId: string;
  name: string;
  imgSeed: string;
  duration: string;
  remainingTime: string | null; // null if 'Until stopped'
};

export default function SharingPermissionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'location_shares'),
      where('recipientId', '==', user.uid),
      where('status', '==', 'active')
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const now = new Date();
      const activeShares: SharedUser[] = [];
      const expiredDocs: string[] = [];

      for (const document of snapshot.docs) {
        const data = document.data();
        
        let isExpired = false;
        if (data.expiresAt) {
          const expiresDate = data.expiresAt.toDate();
          if (now > expiresDate) {
            isExpired = true;
          }
        }

        if (isExpired) {
          expiredDocs.push(document.id);
          continue;
        }

        // Fetch user info for the requester
        const userDoc = await getDoc(doc(db, 'users', data.requesterId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          let remainingStr = null;
          let durationStr = 'Until stopped';
          if (data.expiresAt) {
             const expiresDate = data.expiresAt.toDate();
             const diffMs = expiresDate.getTime() - now.getTime();
             if (diffMs > 0) {
                if (diffMs > 3600000) remainingStr = Math.ceil(diffMs/3600000) + 'h left';
                else remainingStr = Math.ceil(diffMs/60000) + 'm left';
                durationStr = 'Temporary';
             }
          }

          activeShares.push({
            id: document.id,
            requesterId: requesterId,
            name: userData.name || 'Unknown',
            imgSeed: userData.imgSeed || 'default',
            duration: durationStr,
            remainingTime: remainingStr
          });
        }
      }

      setSharedUsers(activeShares);

      // Clean up expired ones in the background
      if (expiredDocs.length > 0) {
        const batch = writeBatch(db);
        expiredDocs.forEach(id => {
          batch.update(doc(db, 'location_shares', id), { status: 'expired' });
        });
        batch.commit().catch(console.error);
      }
    });

    return () => unsub();
  }, [user]);

  const handleRevoke = async (id: string, requesterId: string) => {
    try {
      await updateDoc(doc(db, 'location_shares', id), { status: 'revoked' });
    } catch (error) {
      console.error('Error revoking share:', error);
    }
  };

  const handleStopSharingAll = async () => {
    try {
      const batch = writeBatch(db);
      sharedUsers.forEach(u => {
        batch.update(doc(db, 'location_shares', u.id), { status: 'revoked' });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error stopping all shares:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative pb-20">
      {/* Header */}
      <div className="px-4 pt-6 pb-2 flex items-center sticky top-0 bg-white z-10 border-b border-zinc-50">
        <button 
          onClick={() => router.back()} 
          className="w-12 h-12 flex items-center justify-center rounded-full active:bg-zinc-100 transition-colors mr-2"
        >
          <ArrowLeft size={24} className="text-zinc-900" />
        </button>
        <div>
          <h1 className="text-[20px] font-bold text-zinc-900 leading-tight">Privacy & Sharing</h1>
          <p className="text-[13px] font-medium text-[#F9C300] flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#F9C300]"></span>
            </span>
            Active Location Sharing
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        
        {/* Global Privacy Status */}
        <div className="bg-yellow-50 rounded-[1.5rem] p-5 mb-8 border border-yellow-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#F9C300]/20 rounded-full flex items-center justify-center shrink-0">
              <ShieldCheck size={20} className="text-[#E5B200]" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-zinc-900 mb-1">Your location is protected</h3>
              <p className="text-[14px] font-medium text-zinc-600 leading-relaxed">
                Only the people listed below can see your live location. You can revoke access at any time.
              </p>
            </div>
          </div>
        </div>

        {/* List of People */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-zinc-400 uppercase tracking-widest">
            Viewing your location ({sharedUsers.length})
          </h2>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {sharedUsers.map((user) => (
              <motion.div 
                key={user.id}
                layout
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="bg-zinc-50 rounded-[1.5rem] p-4 border border-zinc-100 flex items-center gap-4"
              >
                <div className="relative shrink-0">
                  <Image 
                    src={`https://picsum.photos/seed/${user.imgSeed}/100`} 
                    alt={user.name}
                    width={52} 
                    height={52} 
                    className="rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#F9C300] rounded-full border-2 border-white"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-[16px] font-bold text-zinc-900 truncate mb-1">{user.name}</h4>
                  <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-500">
                    <Clock size={12} className="shrink-0" />
                    <span className="truncate">
                      {user.duration}
                      {user.remainingTime && <span className="text-zinc-400"> • {user.remainingTime}</span>}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => handleRevoke(user.id, user.requesterId)}
                  className="w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-400 hover:text-[#F9C300] active:bg-zinc-100 transition-colors shrink-0"
                  aria-label={`Revoke access for ${user.name}`}
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {sharedUsers.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10"
            >
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100">
                <ShieldCheck size={28} className="text-zinc-300" strokeWidth={2} />
              </div>
              <h3 className="text-[18px] font-bold text-zinc-900 mb-1">Not sharing</h3>
              <p className="text-[14px] font-medium text-zinc-500">You aren&apos;t sharing your location with anyone right now.</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Global Stop Button */}
      {sharedUsers.length > 0 && (
        <div className="p-6 bg-white border-t border-zinc-100 mt-auto sticky bottom-0 z-10">
          <button 
            onClick={handleStopSharingAll}
            className="w-full bg-[#F9C300] text-zinc-900 font-bold text-[16px] py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <AlertTriangle size={18} strokeWidth={2.5} />
            Stop Sharing with Everyone
          </button>
        </div>
      )}
    </div>
  );
}
