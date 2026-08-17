'use client';

import { useState } from 'react';
import { Menu, X, User, Share2, Shield, Bell, Settings, CircleHelp, Info, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();

  const getPageTitle = () => {
    switch (pathname) {
      case '/home': return 'Home';
      case '/people': return 'People';
      case '/map': return 'Map';
      case '/requests': return 'Requests';
      default: return 'Whereabouts';
    }
  };

  const drawerItems = [
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Share2, label: 'Sharing Permissions', href: '/sharing' },
    { icon: Shield, label: 'Privacy & Safety', href: '/privacy' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: CircleHelp, label: 'Help', href: '/help' },
    { icon: Info, label: 'About', href: '/about' },
  ];

  return (
    <>
      <header className="flex items-center justify-between px-4 h-[60px] bg-white sticky top-0 z-40 shrink-0 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-zinc-100 transition-colors"
          >
            <Menu size={24} strokeWidth={2.5} className="text-zinc-900" />
          </button>
          <h1 className="text-[20px] font-bold tracking-tight text-zinc-900">{getPageTitle()}</h1>
        </div>
        
        <div className="flex items-center text-zinc-900 pr-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-200 cursor-pointer active:opacity-70 transition-opacity">
            <Image 
              src="https://picsum.photos/seed/me/100" 
              alt="Profile" 
              width={32} 
              height={32} 
              className="object-cover w-full h-full"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      {/* Side Drawer Overlay */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-zinc-900/40 z-50 backdrop-blur-sm"
              onClick={() => setIsDrawerOpen(false)}
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-[320px] bg-white z-50 flex flex-col shadow-2xl"
            >
              <div className="flex flex-col h-full overflow-y-auto">
                <div className="px-6 py-8 border-b border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Image 
                      src="https://picsum.photos/seed/me/100" 
                      alt="Profile" 
                      width={56} 
                      height={56} 
                      className="rounded-full object-cover border border-zinc-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h2 className="text-lg font-bold text-zinc-900">Emily Carter</h2>
                      <p className="text-sm font-medium text-zinc-500">emily@example.com</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-10 h-10 flex items-center justify-center bg-zinc-100 rounded-full active:bg-zinc-200 transition-colors"
                  >
                    <X size={20} strokeWidth={2.5} className="text-zinc-900" />
                  </button>
                </div>

                <div className="flex-1 py-4 flex flex-col">
                  {drawerItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={index}
                        href={item.href}
                        onClick={() => setIsDrawerOpen(false)}
                        className="flex items-center gap-4 px-6 py-4 active:bg-zinc-50 transition-colors"
                      >
                        <Icon size={22} className="text-zinc-500" strokeWidth={2} />
                        <span className="text-[15px] font-bold text-zinc-900">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="p-6 border-t border-zinc-100">
                  <Link href="/login" onClick={() => setIsDrawerOpen(false)} className="flex items-center gap-4 w-full active:opacity-60 transition-opacity">
                    <LogOut size={22} className="text-zinc-500" strokeWidth={2} />
                    <span className="text-[15px] font-bold text-zinc-500">Log Out</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
