'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    // Define protected routes (anything under /(main) or similar logic)
    const isMainRoute = 
      pathname.startsWith('/home') || 
      pathname.startsWith('/map') || 
      pathname.startsWith('/people') || 
      pathname.startsWith('/profile') || 
      pathname.startsWith('/requests') || 
      pathname.startsWith('/sharing');
      
    const isAuthRoute = pathname === '/login' || pathname === '/signup' || pathname === '/';

    if (!user && isMainRoute) {
      router.push('/login');
    } else if (user && isAuthRoute) {
      router.push('/home');
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F9C300]">
        <Loader2 size={48} className="animate-spin text-zinc-900" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
