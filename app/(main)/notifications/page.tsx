'use client';

import { ArrowLeft, BellRing, MapPin, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NotificationsSettingsPage() {
  const router = useRouter();
  const [toggles, setToggles] = useState({
    requests: true,
    arrivals: true,
    departures: false,
    summaries: true
  });

  const toggleSetting = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col h-full bg-white relative pb-20">
      <div className="px-4 pt-6 pb-2 flex items-center sticky top-0 bg-white z-10 border-b border-zinc-50">
        <button 
          onClick={() => router.back()} 
          className="w-12 h-12 flex items-center justify-center rounded-full active:bg-zinc-100 transition-colors mr-2"
        >
          <ArrowLeft size={24} className="text-zinc-900" />
        </button>
        <h1 className="text-[20px] font-bold text-zinc-900 leading-tight">Notifications</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        
        <div className="mb-8">
          <h3 className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Location Sharing</h3>
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center shrink-0 border border-zinc-100">
                  <UserPlus size={20} className="text-zinc-600" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[16px] font-bold text-zinc-900">New Requests</div>
                  <div className="text-[13px] font-medium text-zinc-500">When someone asks for your location</div>
                </div>
              </div>
              <button 
                onClick={() => toggleSetting('requests')}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${toggles.requests ? 'bg-emerald-500' : 'bg-zinc-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${toggles.requests ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Friend Activity</h3>
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center shrink-0 border border-zinc-100">
                  <MapPin size={20} className="text-zinc-600" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[16px] font-bold text-zinc-900">Arrivals</div>
                  <div className="text-[13px] font-medium text-zinc-500">When friends reach their destination</div>
                </div>
              </div>
              <button 
                onClick={() => toggleSetting('arrivals')}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${toggles.arrivals ? 'bg-emerald-500' : 'bg-zinc-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${toggles.arrivals ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center shrink-0 border border-zinc-100">
                  <MapPin size={20} className="text-zinc-600" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[16px] font-bold text-zinc-900">Departures</div>
                  <div className="text-[13px] font-medium text-zinc-500">When friends leave a location</div>
                </div>
              </div>
              <button 
                onClick={() => toggleSetting('departures')}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${toggles.departures ? 'bg-emerald-500' : 'bg-zinc-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${toggles.departures ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

          </div>
        </div>

        <div>
          <h3 className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Updates</h3>
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center shrink-0 border border-zinc-100">
                  <BellRing size={20} className="text-zinc-600" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-[16px] font-bold text-zinc-900">Weekly Summaries</div>
                  <div className="text-[13px] font-medium text-zinc-500">Your travel stats and updates</div>
                </div>
              </div>
              <button 
                onClick={() => toggleSetting('summaries')}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${toggles.summaries ? 'bg-emerald-500' : 'bg-zinc-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${toggles.summaries ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
