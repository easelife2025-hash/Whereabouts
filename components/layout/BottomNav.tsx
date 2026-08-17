'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Map, Inbox } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/home', icon: Home, label: 'Home' },
    { href: '/people', icon: Users, label: 'People' },
    { href: '/map', icon: Map, label: 'Map' },
    { href: '/requests', icon: Inbox, label: 'Requests' },
  ];

  return (
    <nav className="bg-white flex justify-around pb-safe pt-1 px-2 z-40 sticky bottom-0 shrink-0 border-t border-zinc-100 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className="flex flex-col items-center justify-center w-16 h-16 relative active:scale-95 transition-transform"
          >
            <div className={`relative flex items-center justify-center w-14 h-[34px] rounded-full transition-colors duration-300 ${isActive ? 'bg-[#F9C300]' : 'bg-transparent'}`}>
              <Icon 
                size={22} 
                className={isActive ? 'text-zinc-900' : 'text-zinc-400'} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
            </div>
            <span className={`text-[11px] mt-1.5 font-bold tracking-wide ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
