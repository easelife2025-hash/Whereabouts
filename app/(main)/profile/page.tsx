'use client';

import { Settings, Shield, CircleHelp, LogOut, ChevronRight, Bell, Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/auth/AuthProvider';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const menuItems = [
    { icon: Settings, label: 'Account Settings', href: '/settings' },
    { icon: Shield, label: 'Privacy & Safety', href: '/privacy' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: CircleHelp, label: 'Help & Support', href: '/help' },
    { icon: Info, label: 'About', href: '/about' },
  ];

  const displayName = profile?.name || user?.displayName || 'User';
  const imgSeed = profile?.imgSeed || 'me';

  return (
    <div className="flex flex-col h-full bg-white relative pb-20 overflow-y-auto">
      <div className="px-6 py-8 flex flex-col items-center">
        <div className="relative mb-5">
          <Image 
            src={`https://picsum.photos/seed/${imgSeed}/200`} 
            alt={displayName} 
            width={104} 
            height={104} 
            className="rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
          <Link href="/settings" className="absolute bottom-0 right-0 bg-[#F9C300] text-zinc-900 w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-transform">
            <Settings size={16} strokeWidth={2.5} />
          </Link>
        </div>
        <h2 className="text-[24px] font-bold text-zinc-900 tracking-tight leading-none">{displayName}</h2>
        <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 mt-2">
          {profile?.email || user?.email}
        </div>
        
        <div className="flex gap-4 mt-8 w-full">
          <Link href="/people" className="flex-1 rounded-3xl bg-yellow-50 p-4 text-center active:bg-yellow-100 transition-colors">
            <div className="text-[24px] font-bold text-zinc-900 leading-none mb-1.5">-</div>
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">People</div>
          </Link>
          <Link href="/sharing" className="flex-1 rounded-3xl bg-yellow-50 p-4 text-center active:bg-yellow-100 transition-colors">
            <div className="text-[24px] font-bold text-zinc-900 leading-none mb-1.5">-</div>
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Sharing</div>
          </Link>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link 
                key={index}
                href={item.href}
                className="w-full flex items-center justify-between py-4 group active:opacity-60 transition-opacity"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-[#F9C300] group-hover:bg-yellow-100 transition-colors">
                    <Icon size={18} strokeWidth={2.5} />
                  </div>
                  <span className="text-[16px] font-bold text-zinc-900">{item.label}</span>
                </div>
                <ChevronRight size={20} className="text-zinc-300 group-hover:text-zinc-900 transition-colors" />
              </Link>
            );
          })}
        </div>

        <button onClick={handleSignOut} className="w-full flex items-center gap-4 py-4 mt-4 group active:opacity-60 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-[#F9C300] transition-colors">
            <LogOut size={18} strokeWidth={2.5} />
          </div>
          <span className="text-[16px] font-bold text-[#F9C300] transition-colors">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
