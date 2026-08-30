'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, MoreHorizontal, UserPlus, AlertCircle, ShieldAlert, X, ChevronRight, Navigation, Check, Clock } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, onSnapshot, query, where, addDoc, updateDoc, setDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { sendNotification } from '@/lib/notify';

type UserProfile = {
  uid: string;
  name: string;
  email: string;
  imgSeed: string;
};

type LocationRequest = {
  status: 'pending' | 'accepted' | 'denied' | 'revoked' | 'expired';
  timestamp: number;
};

export default function FriendsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Record<string, LocationRequest>>({});
  const [outgoingRequests, setOutgoingRequests] = useState<Record<string, LocationRequest>>({});
  
  const [selectedPerson, setSelectedPerson] = useState<UserProfile | null>(null);

  // Load all users from Firestore
  useEffect(() => {
    if (!user) return;
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const usersList: UserProfile[] = [];
        snapshot.forEach(doc => {
          if (doc.id !== user.uid) {
            usersList.push({ uid: doc.id, ...doc.data() } as UserProfile);
          }
        });
        setAllUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
        setIsError(true);
      }
    };
    fetchUsers();
  }, [user]);

  // Load Firestore request states
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists() && docSnap.data().blockedUsers) {
        setBlockedUsers(docSnap.data().blockedUsers);
      } else {
        setBlockedUsers([]);
      }
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    // Listen to incoming
    const incomingQuery = query(collection(db, 'location_requests'), where('recipientId', '==', user.uid));
    const unsubIncoming = onSnapshot(incomingQuery, (snapshot) => {
      const incoming: Record<string, any> = {};
      snapshot.forEach(doc => {
        incoming[doc.data().senderId] = { status: doc.data().status, id: doc.id };
      });
      setIncomingRequests(incoming);
      setIsLoading(false);
    }, (error) => {
      console.error(error);
      setIsError(true);
      setIsLoading(false);
    });

    // Listen to outgoing
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
  }, [user]);

  const handleSendRequest = async (recipientId: string) => {
    if (!user) return;
    await setDoc(doc(db, 'location_requests', `${user.uid}_${recipientId}`), {
      senderId: user.uid,
      recipientId: recipientId,
      status: 'pending',
      timestamp: serverTimestamp()
    });
    
    sendNotification(
      recipientId,
      'New Location Request',
      `${profile?.name || user.displayName || 'Someone'} requested your location`,
      '/requests'
    );
  };

  const handleRespondToRequest = async (senderId: string, response: 'accepted' | 'denied') => {
    if (!user) return;
    const reqId = `${senderId}_${user.uid}`;
    await updateDoc(doc(db, 'location_requests', reqId), { status: response, timestamp: serverTimestamp() });
    
    if (response === 'accepted') {
      await addDoc(collection(db, 'location_shares'), {
        requesterId: senderId,
        recipientId: user.uid,
        status: 'active',
        createdAt: serverTimestamp(),
      });
      
      sendNotification(
        senderId,
        'Request Accepted',
        `${profile?.name || user.displayName || 'Someone'} is now sharing their location with you`,
        '/home'
      );
    } else {
      sendNotification(
        senderId,
        'Request Denied',
        `${profile?.name || user.displayName || 'Someone'} denied your location request`,
        '/people'
      );
    }
  };

  const handleBlockUser = async (targetId: string) => {
    if (!user) return;
    const newBlocked = [...blockedUsers, targetId];
    await setDoc(doc(db, 'users', user.uid), { blockedUsers: newBlocked }, { merge: true });
    
    // Also revoke active shares just in case
    try {
      const q1 = query(collection(db, 'location_shares'), where('recipientId', '==', user.uid), where('requesterId', '==', targetId), where('status', '==', 'active'));
      const s1 = await getDocs(q1);
      s1.forEach(async d => await updateDoc(doc(db, 'location_shares', d.id), { status: 'revoked' }));
      
      const q2 = query(collection(db, 'location_shares'), where('recipientId', '==', targetId), where('requesterId', '==', user.uid), where('status', '==', 'active'));
      const s2 = await getDocs(q2);
      s2.forEach(async d => await updateDoc(doc(db, 'location_shares', d.id), { status: 'revoked' }));
    } catch(e) {}
    setSelectedPerson(null);
  };

  const handleUnblockUser = async (targetId: string) => {
    if (!user) return;
    const newBlocked = blockedUsers.filter(id => id !== targetId);
    await setDoc(doc(db, 'users', user.uid), { blockedUsers: newBlocked }, { merge: true });
    setSelectedPerson(null);
  };

  const handleRevokeShare = async (recipientId: string) => {
    if (!user) return;
    const reqId = `${user.uid}_${recipientId}`;
    const reqId2 = `${recipientId}_${user.uid}`;
    
    try { await updateDoc(doc(db, 'location_requests', reqId), { status: 'revoked', timestamp: serverTimestamp() }); } catch(e) {}
    try { await updateDoc(doc(db, 'location_requests', reqId2), { status: 'revoked', timestamp: serverTimestamp() }); } catch(e) {}

    // Find and revoke share in location_shares where I am sharing with them
    const q = query(collection(db, 'location_shares'), where('recipientId', '==', user.uid), where('requesterId', '==', recipientId), where('status', '==', 'active'));
    const snapshot = await getDocs(q);
    snapshot.forEach(async (d) => {
      await updateDoc(doc(db, 'location_shares', d.id), { status: 'revoked' });
    });
    
    sendNotification(
      recipientId,
      'Sharing Stopped',
      `${profile?.name || user.displayName || 'Someone'} stopped sharing their location with you`,
      '/home'
    );
  };

  const filteredUsers = allUsers.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group users based on request status
  const sharingWithMe = allUsers.filter(u => incomingRequests[u.uid]?.status === 'accepted');
  const iAmSharingWith = allUsers.filter(u => outgoingRequests[u.uid]?.status === 'accepted');
  const pendingIncoming = allUsers.filter(u => incomingRequests[u.uid]?.status === 'pending');
  const pendingOutgoing = allUsers.filter(u => outgoingRequests[u.uid]?.status === 'pending');
  
  const connectedIds = new Set([
    ...sharingWithMe.map(u => u.uid),
    ...iAmSharingWith.map(u => u.uid),
    ...pendingIncoming.map(u => u.uid),
    ...pendingOutgoing.map(u => u.uid)
  ]);
  
  const otherUsers = filteredUsers.filter(u => !connectedIds.has(u.uid));

  return (
    <div className="flex flex-col h-full bg-white relative pb-20">
      
      {/* Header & Actions */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[28px] font-bold text-zinc-900 tracking-tight leading-none">People</h1>
          <button className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center text-[#F9C300] active:bg-yellow-100 transition-colors">
            <UserPlus size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} strokeWidth={2.5} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search connections..." 
            className="w-full bg-zinc-100 rounded-2xl py-3.5 pl-11 pr-4 text-[15px] font-medium focus:ring-2 focus:ring-[#F9C300] focus:bg-white outline-none transition-all placeholder:text-zinc-400 text-zinc-900 h-[48px]"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6">
        
        {/* Loading State */}
        {isLoading && (
          <div className="mt-6 space-y-5 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-100 rounded-full shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-zinc-100 rounded-full w-1/2 mb-2"></div>
                  <div className="h-3 bg-zinc-50 rounded-full w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lists */}
        {!isLoading && !isError && (
          <div className="pb-8 space-y-8 mt-6">

            {/* Empty State: No Registered Users at all */}
            {allUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                  <UserPlus size={28} className="text-zinc-400" strokeWidth={2} />
                </div>
                <h3 className="text-[17px] font-bold text-zinc-900 mb-1">No users found</h3>
                <p className="text-[14px] text-zinc-500 max-w-[240px]">There are no other registered users in the app yet.</p>
              </div>
            )}

            {/* Empty State: Search found nothing */}
            {allUsers.length > 0 && filteredUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                  <Search size={28} className="text-zinc-400" strokeWidth={2} />
                </div>
                <h3 className="text-[17px] font-bold text-zinc-900 mb-1">No matches</h3>
                <p className="text-[14px] text-zinc-500 max-w-[240px]">No users match your search &quot;{searchQuery}&quot;</p>
              </div>
            )}
            
            {/* Pending Requests */}
            {pendingIncoming.length > 0 && (
              <div>
                <h2 className="text-[14px] font-bold text-emerald-600 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  New Location Requests
                </h2>
                <div className="space-y-3">
                  {pendingIncoming.map((person) => (
                    <div key={person.uid} className="w-full flex items-center gap-4 p-4 bg-emerald-50 rounded-[1.5rem]">
                      <Image 
                        src={`https://picsum.photos/seed/${person.imgSeed}/100`} 
                        alt={person.name} 
                        width={48} height={48} 
                        className="rounded-full object-cover shrink-0 border-2 border-white"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 overflow-hidden">
                        <h3 className="font-bold text-zinc-900 text-[16px] truncate leading-tight mb-0.5">{person.name}</h3>
                        <p className="text-[13px] font-medium text-zinc-500 truncate">Wants to see your location</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => handleRespondToRequest(person.uid, 'denied')}
                          className="w-10 h-10 rounded-full bg-white text-zinc-400 flex items-center justify-center active:bg-zinc-100"
                        >
                          <X size={18} strokeWidth={3} />
                        </button>
                        <button 
                          onClick={() => handleRespondToRequest(person.uid, 'accepted')}
                          className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center active:bg-emerald-600 shadow-sm"
                        >
                          <Check size={18} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sharing With You */}
            {sharingWithMe.length > 0 && (
              <div>
                <h2 className="text-[14px] font-bold text-zinc-900 mb-2">Sharing With You</h2>
                <div className="space-y-0">
                  {sharingWithMe.map((person) => (
                    <button 
                      key={person.uid} 
                      onClick={() => setSelectedPerson(person)}
                      className="w-full flex items-center gap-4 py-3 active:opacity-60 transition-opacity group"
                    >
                      <div className="relative shrink-0">
                        <Image 
                          src={`https://picsum.photos/seed/${person.imgSeed}/100`} 
                          alt={person.name} 
                          width={48} height={48} 
                          className="rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#F9C300] rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 overflow-hidden text-left">
                        <h3 className="font-bold text-zinc-900 text-[16px] truncate leading-tight mb-0.5">{person.name}</h3>
                        <div className="flex items-center text-[13px] font-medium text-zinc-500 gap-1 truncate">
                          <MapPin size={12} className="text-[#F9C300] shrink-0" strokeWidth={2.5} />
                          <span className="truncate">Location available (Hidden for now)</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-300 group-hover:text-zinc-900 shrink-0">
                        <MoreHorizontal size={20} strokeWidth={2.5} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Outgoing Pending */}
            {pendingOutgoing.length > 0 && (
              <div>
                <h2 className="text-[14px] font-bold text-zinc-900 mb-2">Requested by You</h2>
                <div className="space-y-0">
                  {pendingOutgoing.map((person) => (
                    <div key={person.uid} className="w-full flex items-center gap-4 py-3 opacity-70">
                      <Image 
                        src={`https://picsum.photos/seed/${person.imgSeed}/100`} 
                        alt={person.name} 
                        width={48} height={48} 
                        className="rounded-full object-cover shrink-0 grayscale"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 overflow-hidden text-left">
                        <h3 className="font-bold text-zinc-900 text-[16px] truncate leading-tight mb-0.5">{person.name}</h3>
                        <div className="flex items-center text-[13px] font-medium text-zinc-500 gap-1 truncate">
                          <Clock size={12} className="text-zinc-400 shrink-0" strokeWidth={2.5} />
                          <span className="truncate">Awaiting approval</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Not sharing (Other users) */}
            {otherUsers.length > 0 && (
              <div>
                <h2 className="text-[14px] font-bold text-zinc-900 mb-2">Other Users</h2>
                <div className="space-y-0">
                  {otherUsers.map((person) => (
                    <div key={person.uid} className="w-full flex items-center gap-4 py-3 text-left">
                      <Image 
                        src={`https://picsum.photos/seed/${person.imgSeed}/100`} 
                        alt={person.name} 
                        width={48} height={48} 
                        className="rounded-full object-cover opacity-60 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 overflow-hidden">
                        <h3 className="font-bold text-zinc-900 text-[16px] truncate leading-tight mb-0.5">{person.name}</h3>
                        <p className="text-[13px] font-medium text-zinc-400 truncate">Not sharing location</p>
                      </div>
                      <div className="shrink-0">
                        <button 
                          onClick={() => handleSendRequest(person.uid)}
                          className="text-[13px] font-bold text-zinc-900 bg-zinc-100 px-4 py-2 rounded-full active:bg-zinc-200"
                        >
                          Ask
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Profile Drawer Overlay */}
      <AnimatePresence>
        {selectedPerson && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPerson(null)}
              className="fixed inset-0 bg-black/40 z-40"
            />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] z-50 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-center pt-3 pb-2 w-full active:bg-zinc-50" onClick={() => setSelectedPerson(null)}>
                <div className="w-12 h-1.5 bg-zinc-200 rounded-full"></div>
              </div>

              <div className="px-6 pb-8 pt-2 overflow-y-auto">
                <div className="flex flex-col items-center mb-8">
                  <Image 
                    src={`https://picsum.photos/seed/${selectedPerson.imgSeed}/400`} 
                    alt={selectedPerson.name} 
                    width={100} height={100} 
                    className="rounded-full object-cover mb-4 border-4 border-white shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <h2 className="text-[24px] font-bold text-zinc-900 leading-tight text-center">{selectedPerson.name}</h2>
                  <p className="text-[15px] font-medium text-zinc-500 mt-1">{selectedPerson.email}</p>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      handleRevokeShare(selectedPerson.uid);
                      setSelectedPerson(null);
                    }}
                    className="w-full flex items-center gap-3 bg-red-50/50 p-4 rounded-2xl active:bg-red-50 transition-colors text-left"
                  >
                    <ShieldAlert size={20} className="text-red-500 shrink-0" strokeWidth={2.5} />
                    <div>
                      <span className="block text-[15px] font-bold text-red-600">Revoke sharing with {selectedPerson.name.split(' ')[0]}</span>
                      <span className="block text-[13px] font-medium text-red-500/80 mt-0.5">They will no longer see your location</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleBlockUser(selectedPerson.uid)}
                    className="w-full flex items-center gap-3 bg-red-50/50 p-4 rounded-2xl active:bg-red-50 transition-colors text-left mt-3"
                  >
                    <AlertCircle size={20} className="text-red-500 shrink-0" strokeWidth={2.5} />
                    <div>
                      <span className="block text-[15px] font-bold text-red-600">Block {selectedPerson.name.split(' ')[0]}</span>
                      <span className="block text-[13px] font-medium text-red-500/80 mt-0.5">They won&apos;t be able to request or view your location</span>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
