'use client';

import { ArrowLeft, ChevronRight, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AboutPage() {
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
        <h1 className="text-[20px] font-bold text-zinc-900 leading-tight">About</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-20 h-20 bg-zinc-900 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-xl">
            <MapPin size={40} className="text-[#F9C300]" strokeWidth={2.5} />
          </div>
          <h2 className="text-[24px] font-bold text-zinc-900 mb-1">Tracker</h2>
          <p className="text-[13px] font-bold text-zinc-400 tracking-widest uppercase">Version 1.0.0</p>
        </div>

        <div className="space-y-3 mt-4">
          <button className="w-full flex items-center justify-between bg-zinc-50 p-4 rounded-[1.25rem] active:bg-zinc-100 transition-colors border border-zinc-100">
            <span className="text-[16px] font-bold text-zinc-900">Terms of Service</span>
            <ChevronRight size={20} className="text-zinc-300" />
          </button>
          
          <button className="w-full flex items-center justify-between bg-zinc-50 p-4 rounded-[1.25rem] active:bg-zinc-100 transition-colors border border-zinc-100">
            <span className="text-[16px] font-bold text-zinc-900">Privacy Policy</span>
            <ChevronRight size={20} className="text-zinc-300" />
          </button>
          
          <button className="w-full flex items-center justify-between bg-zinc-50 p-4 rounded-[1.25rem] active:bg-zinc-100 transition-colors border border-zinc-100">
            <span className="text-[16px] font-bold text-zinc-900">Open Source Libraries</span>
            <ChevronRight size={20} className="text-zinc-300" />
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[13px] font-medium text-zinc-400">
            &copy; {new Date().getFullYear()} Tracker Inc.<br/>All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
}
