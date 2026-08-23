'use client';

import { useState } from 'react';
import { Outfit } from 'next/font/google';
import { MapPin, UserPlus, ShieldCheck, Activity, ChevronRight, Inbox, Check, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const outfit = Outfit({ subsets: ['latin'] });

// Helper to get 24 hours from now
const getExpirationDate = () => new Date(Date.now() + 24 * 60 * 60 * 1000);

// Demo Data
const INITIAL_REQUESTS = [
  {
    id: 'req_1',
    name: 'Sarah Jenkins',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    time: '2m ago'
  }
];

const INITIAL_PEOPLE = [
  {
    id: 'usr_1',
    name: 'Alex Rivera',
    avatar: 'https://i.pravatar.cc/150?u=alex',
    location: 'Central Park',
    distance: '2.4 mi',
    time: 'Just now'
  },
  {
    id: 'usr_2',
    name: 'Emily Chen',
    avatar: 'https://i.pravatar.cc/150?u=emily',
    location: 'Downtown Cafe',
    distance: '0.8 mi',
    time: '14m ago'
  },
  {
    id: 'usr_3',
    name: 'Marcus Johnson',
    avatar: 'https://i.pravatar.cc/150?u=marcus',
    location: 'Work',
    distance: '5.2 mi',
    time: '1h ago'
  }
];

export default function HomePage() {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [people, setPeople] = useState(INITIAL_PEOPLE);
  
  const handleAcceptRequest = async (id: string) => {
    const requestToAccept = requests.find(r => r.id === id);
    if (!requestToAccept) return;

    // Update UI instantly
    setRequests(prev => prev.filter(r => r.id !== id));
    setPeople(prev => [{
      id: requestToAccept.id,
      name: requestToAccept.name,
      avatar: requestToAccept.avatar,
      location: 'Locating...',
      distance: 'Calculating...',
      time: 'Just now'
    }, ...prev]);

    // Save active sharing permission to Firebase
    if (user?.uid) {
      try {
        const shareRef = doc(collection(db, 'location_shares'));
        await setDoc(shareRef, {
          requesterId: requestToAccept.id,
          recipientId: user.uid,
          status: 'active',
          createdAt: serverTimestamp(),
          expiresAt: getExpirationDate() // 24 hours
        });
      } catch (error) {
        console.error('Error saving share permission:', error);
      }
    }
  };

  const handleDeclineRequest = async (id: string) => {
    // Update UI instantly
    setRequests(prev => prev.filter(r => r.id !== id));
    
    // Save denied status to Firebase
    if (user?.uid) {
      try {
        const shareRef = doc(collection(db, 'location_shares'));
        await setDoc(shareRef, {
          requesterId: id,
          recipientId: user.uid,
          status: 'denied',
          createdAt: serverTimestamp(),
          expiresAt: getExpirationDate() // 24 hours
        });
      } catch (error) {
        console.error('Error saving denied permission:', error);
      }
    }
  };
  
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 5 && hour < 12) {
    greeting = 'Good morning';
  } else if (hour >= 12 && hour < 16) {
    greeting = 'Good afternoon';
  } else {
    greeting = 'Good evening';
  }

  // Get first name from profile or user
  const displayName = profile?.name || user?.displayName || 'User';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="flex flex-col flex-1 bg-white pb-20">
      <div className="px-6 py-6 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h2 suppressHydrationWarning className={`text-[28px] font-bold text-zinc-900 tracking-tight leading-tight ${outfit.className}`}>{greeting},</h2>
            <h2 className={`text-[28px] font-bold text-zinc-400 tracking-tight leading-tight ${outfit.className}`}>{firstName}.</h2>
          </div>
          <button className="w-11 h-11 bg-yellow-50 rounded-full flex items-center justify-center text-[#F9C300] active:scale-95 transition-transform">
            <UserPlus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="px-6 mt-6 space-y-8">
        {/* Status Highlights */}
        <div className="flex gap-3">
          <div className="flex-1 bg-yellow-50 rounded-3xl p-4 active:scale-95 transition-transform">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Activity size={16} className="text-[#F9C300]" strokeWidth={3} />
              </div>
              <h3 className="text-[14px] font-bold text-zinc-900">Live</h3>
            </div>
            <p className="text-[13px] font-medium text-zinc-500">Updating now</p>
          </div>
          
          <Link href="/sharing" className="flex-1 bg-yellow-50 rounded-3xl p-4 active:scale-95 transition-transform block">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                <ShieldCheck size={16} className="text-[#F9C300]" strokeWidth={3} />
              </div>
              <h3 className="text-[14px] font-bold text-zinc-900">Sharing</h3>
            </div>
            <p className="text-[13px] font-medium text-zinc-500">{people.length} people</p>
          </Link>
        </div>

        {/* Pending Requests */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-zinc-900">Requests</h3>
            <span className="bg-zinc-100 text-zinc-500 text-[11px] font-bold px-2 py-0.5 rounded-full">
              {requests.length} New
            </span>
          </div>
          
          {requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="bg-white rounded-3xl p-4 flex items-center justify-between border border-zinc-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <img src={req.avatar} alt={req.name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="text-[14px] font-bold text-zinc-900">{req.name}</h4>
                      <p className="text-[12px] font-medium text-zinc-500">Requested {req.time}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDeclineRequest(req.id)} className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center active:scale-95 transition-transform">
                      <X size={16} className="text-zinc-600" />
                    </button>
                    <button onClick={() => handleAcceptRequest(req.id)} className="w-8 h-8 rounded-full bg-[#F9C300] flex items-center justify-center active:scale-95 transition-transform">
                      <Check size={16} className="text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-50 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 border border-dashed border-zinc-200">
              <Inbox size={24} className="text-zinc-300" />
              <p className="text-[13px] font-medium text-zinc-500 text-center">No new location requests.</p>
            </div>
          )}
        </div>

        {/* People List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-zinc-900">Recent</h3>
            <Link href="/people" className="text-[13px] font-bold text-zinc-500 flex items-center group">
              View All <ChevronRight size={14} className="ml-0.5 group-active:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {people.length > 0 ? (
            <div className="space-y-3">
              {people.map((person) => (
                <div key={person.id} className="bg-zinc-50 rounded-3xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform">
                  <div className="relative">
                    <img src={person.avatar} alt={person.name} className="w-12 h-12 rounded-full object-cover" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-bold text-zinc-900 truncate">{person.name}</h4>
                    <div className="flex items-center text-[13px] text-zinc-500 font-medium mt-0.5">
                      <MapPin size={12} className="mr-1" />
                      <span className="truncate">{person.location}</span>
                      <span className="mx-1.5">•</span>
                      <span>{person.distance}</span>
                    </div>
                  </div>
                  <div className="text-[12px] font-bold text-zinc-400 whitespace-nowrap">
                    {person.time}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-50 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 border border-dashed border-zinc-200">
              <UserPlus size={24} className="text-zinc-300" />
              <p className="text-[13px] font-medium text-zinc-500 text-center">You haven&apos;t shared your location with anyone recently.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
