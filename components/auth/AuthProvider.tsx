'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, onValue, set, get } from 'firebase/database';
import { auth, rtdb } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export interface UserProfile {
  name: string;
  email: string;
  imgSeed: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let unsubscribeDB: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        const userRef = ref(rtdb, `users/${authUser.uid}`);
        
        // Fetch profile once, create if missing
        try {
          const snapshot = await get(userRef);
          if (!snapshot.exists()) {
            await set(userRef, {
              name: authUser.displayName || 'Unknown User',
              email: authUser.email || '',
              imgSeed: Math.floor(Math.random() * 1000).toString(),
              createdAt: Date.now()
            });
          }
        } catch (err) {
          console.error("Error setting up user profile", err);
        }

        unsubscribeDB = onValue(userRef, (snap) => {
          if (snap.exists()) {
            setProfile(snap.val() as UserProfile);
          } else {
            setProfile(null);
          }
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDB) {
        unsubscribeDB();
      }
    };
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

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
      {loading && (
        <div className="absolute inset-0 z-[9999] flex h-full w-full items-center justify-center bg-[#F9C300]">
          <Loader2 size={48} className="animate-spin text-zinc-900" />
        </div>
      )}
    </AuthContext.Provider>
  );
}
