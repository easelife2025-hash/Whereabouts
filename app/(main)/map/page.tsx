'use client';
import { Crosshair, X, Navigation, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useGeolocation } from '@/hooks/useGeolocation';
import { motion, AnimatePresence } from 'motion/react';
export default function TrackingPage() {
  const router = useRouter();
  const { location, error, isTracking, isRequesting, requestPermissionAndTrack, stopTracking } = useGeolocation();

  const handleToggleTracking = () => {
    if (isTracking || isRequesting) {
      stopTracking();
    } else {
      requestPermissionAndTrack();
    }
  };

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
          
          <button 
            onClick={handleToggleTracking}
            className={`w-12 h-12 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center pointer-events-auto border transition-colors ${isTracking ? 'bg-[#F9C300] text-zinc-900 border-[#E5B200]' : 'bg-white/90 text-zinc-900 hover:bg-zinc-50 border-zinc-200/50 active:bg-zinc-100'}`}
          >
            {isRequesting ? (
              <Loader2 size={22} strokeWidth={2.5} className="animate-spin" />
            ) : (
              <Crosshair size={22} strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* Center Person Marker (Empty State) */}
        <div className="flex-1 flex items-center justify-center relative pointer-events-none pb-20">
          <div className="relative pointer-events-auto group">
            <div className="w-16 h-16 bg-white rounded-full p-1 shadow-xl flex items-center justify-center relative z-10 border-2 border-zinc-200">
              <div className="bg-zinc-100 w-full h-full rounded-full flex items-center justify-center">
                <Navigation size={24} className={`${isTracking ? 'text-[#F9C300]' : 'text-zinc-400'}`} />
              </div>
            </div>
            {/* Shadow under marker */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/10 blur-[3px] rounded-[100%]"></div>
          </div>
        </div>

        {/* Bottom Info Card */}
        <div className="mt-auto px-4 pb-6 pointer-events-none relative z-20">
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-zinc-100 pointer-events-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col">
                {error ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest">Error</span>
                    </div>
                    <h2 className="text-[20px] font-bold text-zinc-900 leading-tight">{error}</h2>
                    <p className="text-[13px] font-medium text-zinc-500 mt-0.5">Check your device settings</p>
                  </>
                ) : isTracking && location ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[11px] font-bold text-green-600 uppercase tracking-widest">Live</span>
                    </div>
                    <h2 className="text-[20px] font-bold text-zinc-900 leading-tight">Tracking Active</h2>
                    <p className="text-[13px] font-medium text-zinc-500 mt-0.5 font-mono">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      <span className="ml-2 text-zinc-400">±{Math.round(location.accuracy)}m</span>
                    </p>
                  </>
                ) : isRequesting ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-[#F9C300] animate-pulse"></div>
                      <span className="text-[11px] font-bold text-yellow-600 uppercase tracking-widest">Requesting</span>
                    </div>
                    <h2 className="text-[20px] font-bold text-zinc-900 leading-tight">Getting Location...</h2>
                    <p className="text-[13px] font-medium text-zinc-500 mt-0.5">Please allow permission</p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Offline</span>
                    </div>
                    <h2 className="text-[20px] font-bold text-zinc-900 leading-tight">No active tracking</h2>
                    <p className="text-[13px] font-medium text-zinc-500 mt-0.5">Tap crosshair to enable</p>
                  </>
                )}
              </div>
              
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${error ? 'bg-red-50 border-red-100 text-red-400' : isTracking ? 'bg-[#F9C300]/20 border-[#F9C300]/30 text-[#E5B200]' : 'bg-zinc-50 border-zinc-100 text-zinc-300'}`}> 
                {error ? (
                  <AlertTriangle size={20} />
                ) : isTracking ? (
                  <ShieldCheck size={20} />
                ) : (
                  <Navigation size={20} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
