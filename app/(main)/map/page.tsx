'use client';

import { Crosshair, X, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function TrackingPage() {
  const router = useRouter();
  const personName = "David Kim";

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 relative h-full w-full">
      {/* Temporary visual map placeholder (to be replaced by Google Maps) */}
      <div className="absolute inset-0 overflow-hidden bg-[#e5e3df]">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, #18181b 1px, transparent 1px), linear-gradient(to bottom, #18181b 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        {/* Placeholder map features */}
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[30%] bg-[#d5d3cf] rounded-[40px] opacity-30 transform rotate-12"></div>
        <div className="absolute top-[50%] left-[50%] w-[60%] h-[10%] bg-[#f5f5f5] opacity-40 transform -rotate-12"></div>
      </div>

      {/* Map UI Overlay */}
      <div className="absolute inset-0 flex flex-col z-10">
        
        {/* Top Controls */}
        <div className="p-4 flex justify-between items-start pointer-events-none mt-2">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center text-zinc-900 pointer-events-auto border border-zinc-200/50 active:bg-zinc-100 transition-colors"
          >
            <X size={24} strokeWidth={2.5} />
          </button>

          <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center text-zinc-900 hover:bg-zinc-50 pointer-events-auto border border-zinc-200/50 transition-colors active:bg-zinc-100">
            <Crosshair size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Center Person Marker */}
        <div className="flex-1 flex items-center justify-center relative pointer-events-none pb-20">
          <div className="relative pointer-events-auto group">
            {/* Pulsing rings */}
            <div className="absolute -inset-8 bg-[#F9C300]/20 rounded-full animate-ping [animation-duration:3s]"></div>
            <div className="absolute -inset-4 bg-[#F9C300]/30 rounded-full animate-pulse [animation-duration:2s]"></div>
            
            {/* Avatar marker */}
            <div className="w-16 h-16 bg-white rounded-full p-1 shadow-xl flex items-center justify-center relative z-10 border-2 border-[#F9C300]">
              <Image 
                src="https://picsum.photos/seed/req1/150" 
                alt={personName}
                width={56} 
                height={56} 
                className="rounded-full object-cover w-full h-full"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Shadow under marker */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/10 blur-[3px] rounded-[100%]"></div>
          </div>
        </div>

        {/* Bottom Info Card */}
        <div className="mt-auto px-4 pb-6 pointer-events-none relative z-20">
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-zinc-100 pointer-events-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F9C300]"></span>
                  </span>
                  <span className="text-[11px] font-bold text-[#E5B200] uppercase tracking-widest">Live</span>
                </div>
                <h2 className="text-[20px] font-bold text-zinc-900 leading-tight">{personName}</h2>
                <p className="text-[13px] font-medium text-zinc-500 mt-0.5">Updated just now</p>
              </div>

              <div className="w-12 h-12 bg-zinc-50 rounded-full overflow-hidden border border-zinc-100 shrink-0">
                 <Image 
                  src="https://picsum.photos/seed/req1/100" 
                  alt={personName}
                  width={48} 
                  height={48} 
                  className="object-cover w-full h-full"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <button 
              onClick={() => router.push('/home')}
              className="w-full flex items-center justify-center gap-2 bg-[#F9C300] text-zinc-900 font-bold text-[15px] py-3.5 rounded-2xl active:bg-[#E5B200] transition-colors"
            >
              <ShieldAlert size={18} strokeWidth={2.5} />
              Stop Sharing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
