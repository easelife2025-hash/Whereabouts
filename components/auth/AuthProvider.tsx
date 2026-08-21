'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export interface UserProfile {
  name: string;
  email: string;
  imgSeed: string;
  createdAt?: number;
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
    let isMounted = true;

    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        const userDocRef = doc(db, 'users', authUser.uid);
        
        try {
          const snapshot = await getDoc(userDocRef);
          
          if (!snapshot.exists()) {
            // Attempt to create if it doesn't exist, but don't block UI if it fails
            setDoc(userDocRef, {
              name: authUser.displayName || 'Unknown User',
              email: authUser.email || '',
              imgSeed: Math.floor(Math.random() * 1000).toString(),
              createdAt: Date.now()
            }).catch(console.error);

            setProfile({
              name: authUser.displayName || 'Unknown User',
              email: authUser.email || '',
              imgSeed: Math.floor(Math.random() * 1000).toString(),
              createdAt: Date.now()
            });
          } else {
            setProfile(snapshot.data() as UserProfile);
          }
        } catch (err: any) {
          console.error("Error setting up user profile:", err);
          // Fallback profile if DB fetch fails
          setProfile({
            name: authUser.displayName || 'Unknown User',
            email: authUser.email || '',
            imgSeed: Math.floor(Math.random() * 1000).toString(),
            createdAt: Date.now()
          });
        }

        const listener = onSnapshot(userDocRef, (snap) => {
          if (!isMounted) return;
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          }
        });
        
        unsubscribeDB = () => listener();
      } else {
        if (isMounted) {
          setProfile(null);
        }
      }
      
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
      if (unsubscribeDB) {
        unsubscribeDB();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) return;

    // Define protected routes (anything under /(main) or similar logic)
    const currentPath = pathname || '';
    const isMainRoute = 
      currentPath.startsWith('/home') || 
      currentPath.startsWith('/map') || 
      currentPath.startsWith('/people') || 
      currentPath.startsWith('/profile') || 
      currentPath.startsWith('/requests') || 
      currentPath.startsWith('/sharing') ||
      currentPath.startsWith('/settings');
      
    const isAuthRoute = currentPath === '/login' || currentPath === '/signup' || currentPath === '/';

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
