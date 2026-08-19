'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, MoreHorizontal, UserPlus, AlertCircle, ShieldAlert, X, ChevronRight, Navigation, Check } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';

type Person = {
  id: string;
  name: string;
  status: 'sharing' | 'not_sharing';
  location?: string;
  updatedAt?: string;
  imgSeed: string;
  phone: string;
};

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [requestedIds, setRequestedIds] = useState<string[]>([]);
  const router = useRouter();

  // Mock initial data loading (empty list for now)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPeople([]);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredPeople = people.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sharingPeople = filteredPeople.filter(p => p.status === 'sharing');
  const notSharingPeople = filteredPeople.filter(p => p.status === 'not_sharing');

  const handleBlock = () => {
    if (selectedPerson) {
      setPeople(prev => prev.filter(p => p.id !== selectedPerson.id));
      setSelectedPerson(null);
    }
  };

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

        {/* Error State */}
        {!isLoading && isError && (
          <div className="mt-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={32} className="text-[#F9C300]" strokeWidth={2} />
            </div>
            <h3 className="text-[19px] font-bold text-zinc-900 mb-2">Something went wrong</h3>
            <p className="text-[15px] font-medium text-zinc-500 max-w-[240px] mb-6">We couldn&apos;t load your connections. Please try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#F9C300] text-zinc-900 font-bold px-6 py-3 rounded-full text-[15px] active:bg-[#E5B200] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredPeople.length === 0 && (
          <div className="mt-24 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
              <Search size={32} className="text-zinc-300" strokeWidth={2} />
            </div>
            <h3 className="text-[19px] font-bold text-zinc-900 mb-2">No people found</h3>
            <p className="text-[15px] font-medium text-zinc-500 max-w-[240px]">We couldn&apos;t find anyone matching &quot;{searchQuery}&quot;.</p>
          </div>
        )}

        {/* Lists */}
        {!isLoading && !isError && filteredPeople.length > 0 && (
          <div className="pb-8">
            
            {/* Sharing with you */}
            {sharingPeople.length > 0 && (
              <div className="mt-6">
                <h2 className="text-[14px] font-bold text-zinc-900 mb-2">Sharing With You</h2>
                <div className="space-y-0">
                  {sharingPeople.map((person) => (
                    <button 
                      key={person.id} 
                      onClick={() => setSelectedPerson(person)}
                      className="w-full flex items-center gap-4 py-3 active:opacity-60 transition-opacity group"
                    >
                      <div className="relative shrink-0">
                        <Image 
                          src={`https://picsum.photos/seed/${person.imgSeed}/100`} 
                          alt={person.name} 
                          width={48} 
                          height={48} 
                          className="rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#F9C300] rounded-full border-2 border-white"></div>
                      </div>
                      
                      <div className="flex-1 overflow-hidden text-left">
                        <h3 className="font-bold text-zinc-900 text-[16px] truncate leading-tight mb-0.5">{person.name}</h3>
                        <div className="flex items-center text-[13px] font-medium text-zinc-500 gap-1 truncate">
                          <MapPin size={12} className="text-zinc-400 shrink-0" strokeWidth={2.5} />
                          <span className="truncate">{person.location}</span>
                        </div>
                      </div>
                      
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-300 group-hover:text-zinc-900 transition-colors shrink-0">
                        <MoreHorizontal size={20} strokeWidth={2.5} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Not sharing */}
            {notSharingPeople.length > 0 && (
              <div className="mt-8">
                <h2 className="text-[14px] font-bold text-zinc-900 mb-2">Other Connections</h2>
                <div className="space-y-0">
                  {notSharingPeople.map((person) => (
                    <button 
                      key={person.id}
                      onClick={() => setSelectedPerson(person)}
                      className="w-full flex items-center gap-4 py-3 text-left active:opacity-60 transition-opacity"
                    >
                      <Image 
                        src={`https://picsum.photos/seed/${person.imgSeed}/100`} 
                        alt={person.name} 
                        width={48} 
                        height={48} 
                        className="rounded-full object-cover opacity-60"
                        referrerPolicy="no-referrer"
                      />
                      
                      <div className="flex-1 overflow-hidden">
                        <h3 className="font-bold text-zinc-900 text-[16px] truncate leading-tight mb-0.5">{person.name}</h3>
                        <p className="text-[13px] font-medium text-zinc-400 truncate">Not sharing location</p>
                      </div>
                      
                      <div className="shrink-0">
                        <div className="text-[13px] font-bold text-zinc-900 bg-zinc-100 px-4 py-2 rounded-full">
                          Ask
                        </div>
                      </div>
                    </button>
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
                    width={100} 
                    height={100} 
                    className="rounded-full object-cover mb-4 border-4 border-white shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <h2 className="text-[24px] font-bold text-zinc-900 leading-tight text-center">{selectedPerson.name}</h2>
                  <p className="text-[15px] font-medium text-zinc-500 mt-1">{selectedPerson.phone}</p>
                </div>

                {selectedPerson.status === 'sharing' ? (
                  <button 
                    onClick={() => router.push('/map')}
                    className="w-full text-left bg-zinc-50 rounded-[1.5rem] p-5 mb-6 border border-zinc-100 flex items-start gap-4 active:bg-zinc-100 transition-colors"
                  >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                      <MapPin size={24} className="text-[#F9C300]" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Current Location</h4>
                      <p className="text-[16px] font-bold text-zinc-900 leading-snug mb-1">{selectedPerson.location}</p>
                      <p className="text-[13px] font-medium text-zinc-500">Updated {selectedPerson.updatedAt}</p>
                    </div>
                  </button>
                ) : (
                  <div className="bg-zinc-50 rounded-[1.5rem] p-5 mb-6 border border-zinc-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                      <Navigation size={24} className="text-zinc-300" strokeWidth={2.5} />
                    </div>
                    <p className="text-[15px] font-medium text-zinc-900 mb-3">They aren&apos;t sharing their location with you right now.</p>
                    
                    {requestedIds.includes(selectedPerson.id) ? (
                      <div className="w-full bg-emerald-50 text-emerald-600 font-bold text-[15px] py-3.5 rounded-full flex items-center justify-center gap-2">
                        <Check size={18} strokeWidth={2.5} />
                        Requested
                      </div>
                    ) : (
                      <button 
                        onClick={() => setRequestedIds(prev => [...prev, selectedPerson.id])}
                        className="w-full bg-[#F9C300] text-zinc-900 font-bold text-[15px] py-3.5 rounded-full active:bg-[#E5B200] transition-colors"
                      >
                        Request Location
                      </button>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/sharing')}
                    className="w-full flex items-center justify-between bg-zinc-50 p-4 rounded-2xl active:bg-zinc-100 transition-colors"
                  >
                    <span className="text-[16px] font-bold text-zinc-900">Manage my sharing</span>
                    <ChevronRight size={20} className="text-zinc-400" />
                  </button>
                  
                  <button 
                    onClick={handleBlock}
                    className="w-full flex items-center gap-3 bg-red-50/50 p-4 rounded-2xl active:bg-red-50 transition-colors text-left"
                  >
                    <ShieldAlert size={20} className="text-red-500 shrink-0" strokeWidth={2.5} />
                    <div>
                      <span className="block text-[15px] font-bold text-red-600">Block {selectedPerson.name.split(' ')[0]}</span>
                      <span className="block text-[13px] font-medium text-red-500/80 mt-0.5">They won&apos;t be able to see you or request location</span>
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
