'use client';

import { MapPin, UserPlus, ShieldCheck, Activity, ChevronRight, Inbox } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';

export default function HomePage() {
  const { user, profile } = useAuth();
  
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
            <h2 suppressHydrationWarning className="text-[28px] font-bold text-zinc-900 tracking-tight leading-tight">{greeting},</h2>
            <h2 className="text-[28px] font-bold text-zinc-400 tracking-tight leading-tight">{firstName}.</h2>
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
            <p className="text-[13px] font-medium text-zinc-500">0 people</p>
          </Link>
        </div>

        {/* Pending Requests */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-zinc-900">Requests</h3>
            <span className="bg-zinc-100 text-zinc-500 text-[11px] font-bold px-2 py-0.5 rounded-full">0 New</span>
          </div>
          
          <div className="bg-zinc-50 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 border border-dashed border-zinc-200">
            <Inbox size={24} className="text-zinc-300" />
            <p className="text-[13px] font-medium text-zinc-500 text-center">No new location requests.</p>
          </div>
        </div>

        {/* People List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-zinc-900">Recent</h3>
            <Link href="/people" className="text-[13px] font-bold text-zinc-500 flex items-center group">
              View All <ChevronRight size={14} className="ml-0.5 group-active:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="bg-zinc-50 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 border border-dashed border-zinc-200">
            <UserPlus size={24} className="text-zinc-300" />
            <p className="text-[13px] font-medium text-zinc-500 text-center">You haven&apos;t shared your location with anyone recently.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
