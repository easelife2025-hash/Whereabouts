'use client';

import { ArrowLeft, ShieldCheck, MapPin, UserX, Trash2, ChevronRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PrivacySafetyPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-white relative pb-20">
      <div className="px-4 pt-6 pb-2 flex items-center sticky top-0 bg-white z-10 border-b border-zinc-50">
        <button 
          onClick={() => router.back()} 
          className="w-12 h-12 flex items-center justify-center rounded-full active:bg-zinc-100 transition-colors mr-2"
        >
          <ArrowLeft size={24} className="text-zinc-900" />
        </button>
        <h1 className="text-[20px] font-bold text-zinc-900 leading-tight">Privacy & Safety</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        
        {/* Core Philosophy Banner */}
        <div className="bg-zinc-900 rounded-[1.5rem] p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck size={120} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <h2 className="text-[24px] font-bold text-white mb-2 leading-tight">No permission =<br />No tracking.</h2>
            <p className="text-[15px] font-medium text-zinc-400 max-w-[240px] leading-relaxed">
              Your location is entirely in your control. We only share it when you explicitly choose to.
            </p>
          </div>
        </div>

        {/* Location Permissions */}
        <div className="mb-8">
          <h3 className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-3">System Permissions</h3>
          <div className="bg-zinc-50 rounded-[1.5rem] p-4 border border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 border border-zinc-100">
                <MapPin size={18} className="text-[#F9C300]" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-[16px] font-bold text-zinc-900 mb-0.5">Location Access</div>
                <div className="text-[13px] font-medium text-zinc-500">While Using App</div>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Check size={14} strokeWidth={3} />
            </div>
          </div>
          <p className="text-[13px] font-medium text-zinc-400 mt-2 px-1">Manage this in your device settings.</p>
        </div>

        {/* Privacy Controls */}
        <div className="mb-8">
          <h3 className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Privacy Controls</h3>
          <div className="space-y-3">
            <Link href="/sharing" className="w-full flex items-center justify-between bg-zinc-50 p-4 rounded-[1.25rem] active:bg-zinc-100 transition-colors border border-zinc-100">
              <div className="flex items-center gap-4">
                <ShieldCheck size={20} className="text-zinc-600" strokeWidth={2.5} />
                <span className="text-[16px] font-bold text-zinc-900">Active Sharing</span>
              </div>
              <ChevronRight size={20} className="text-zinc-300" />
            </Link>

            <button className="w-full flex items-center justify-between bg-zinc-50 p-4 rounded-[1.25rem] active:bg-zinc-100 transition-colors border border-zinc-100">
              <div className="flex items-center gap-4">
                <UserX size={20} className="text-zinc-600" strokeWidth={2.5} />
                <span className="text-[16px] font-bold text-zinc-900">Blocked Users</span>
              </div>
              <ChevronRight size={20} className="text-zinc-300" />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div>
          <h3 className="text-[13px] font-bold text-red-400 uppercase tracking-widest mb-3">Account Controls</h3>
          <button className="w-full flex items-center gap-4 bg-red-50 p-4 rounded-[1.25rem] active:bg-red-100 transition-colors">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
              <Trash2 size={18} className="text-red-500" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <div className="text-[16px] font-bold text-red-600">Delete Account</div>
              <div className="text-[13px] font-medium text-red-500/80 mt-0.5">Permanently remove your data</div>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
