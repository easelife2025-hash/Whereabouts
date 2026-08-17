import { MapPin, UserPlus, ShieldCheck, Activity, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1 bg-white pb-20">
      <div className="px-6 py-6 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-[28px] font-bold text-zinc-900 tracking-tight leading-tight">Good morning,</h2>
            <h2 className="text-[28px] font-bold text-zinc-400 tracking-tight leading-tight">Emily.</h2>
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
            <p className="text-[13px] font-medium text-zinc-500">4 people</p>
          </Link>
        </div>

        {/* Pending Requests */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-zinc-900">Requests</h3>
            <span className="bg-[#F9C300] text-zinc-900 text-[11px] font-bold px-2 py-0.5 rounded-full">1 New</span>
          </div>
          
          <div className="bg-zinc-50 rounded-3xl p-4 flex items-center gap-4">
            <Image 
              src={`https://picsum.photos/seed/req1/100`} 
              alt="David Kim"
              width={44} 
              height={44} 
              className="rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1">
              <h4 className="text-[15px] font-bold text-zinc-900">David Kim</h4>
              <p className="text-[13px] font-medium text-zinc-500">Wants your location</p>
            </div>
            <Link href="/requests" className="bg-[#F9C300] text-zinc-900 text-[13px] font-bold px-4 py-2.5 rounded-full active:opacity-80 transition-colors">
              Review
            </Link>
          </div>
        </div>

        {/* People List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[14px] font-bold text-zinc-900">Recent</h3>
            <Link href="/people" className="text-[13px] font-bold text-zinc-500 flex items-center group">
              View All <ChevronRight size={14} className="ml-0.5 group-active:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="flex flex-col">
            {[
              { name: 'Alex Johnson', location: 'Central Park', status: 'Active now', img: 'friend1' },
              { name: 'Sarah Jenkins', location: 'Home', status: '20m ago', img: 'friend2' },
              { name: 'Michael Chen', location: 'San Francisco', status: '1h ago', img: 'friend3' },
            ].map((person, i) => (
              <div key={i} className="flex items-center gap-4 py-3 active:opacity-60 transition-opacity cursor-pointer">
                <div className="relative">
                  <Image 
                    src={`https://picsum.photos/seed/${person.img}/100`} 
                    alt={person.name}
                    width={48} 
                    height={48} 
                    className="rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {i === 0 && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#F9C300] border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-[16px] font-bold text-zinc-900">{person.name}</h4>
                  <div className="flex items-center gap-1 mt-0.5 text-zinc-500">
                    <MapPin size={12} strokeWidth={2.5} />
                    <span className="text-[13px] font-medium">{person.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
