'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getToken, onMessage } from 'firebase/messaging';
import { auth, db, getFirebaseMessaging } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export interface UserProfile {
  name: string;
  email: string;
  photoURL?: string;
  bio?: string;
  fcmToken?: string;
  createdAt?: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  requestNotificationPermission: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  requestNotificationPermission: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const requestNotificationPermission = async () => {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      
      const permission = await Notification.requestPermission();
      if (permission === 'granted' && user) {
        const messaging = await getFirebaseMessaging();
        if (messaging) {
          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
          if (vapidKey) {
            const token = await getToken(messaging, { vapidKey });
            if (token) {
              const userRef = doc(db, 'users', user.uid);
              await updateDoc(userRef, { fcmToken: token });
            }
          } else {
            console.warn("NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing. Cannot register FCM.");
          }
        }
      }
    } catch (err) {
      console.error('Failed to request notification permission', err);
    }
  };

  useEffect(() => {
    let unsubscribeDB: (() => void) | undefined;
    let isMounted = true;

    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      
      if (isMounted && loading) {
        setLoading(false);
      }
      
      if (authUser) {
        const userDocRef = doc(db, 'users', authUser.uid);
        
        try {
          const snapshot = await getDoc(userDocRef);
          
          if (!snapshot.exists()) {
            // Attempt to create if it doesn't exist, but don't block UI if it fails
            setDoc(userDocRef, {
              name: authUser.displayName || 'Unknown User',
              email: authUser.email || '',
              createdAt: Date.now()
            }).catch(console.error);

            setProfile({
              name: authUser.displayName || 'Unknown User',
              email: authUser.email || '',
              createdAt: Date.now()
            });
          } else {
            setProfile(snapshot.data() as UserProfile);
          }
        } catch (err: any) {
          if (err?.code !== 'failed-precondition' && err?.code !== 'unavailable' && !err?.message?.includes('offline')) {
            console.error("Error setting up user profile:", err);
          }
          // Fallback profile if DB fetch fails
          setProfile({
            name: authUser.displayName || 'Unknown User',
            email: authUser.email || '',
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
        
        // Listen for foreground messages
        getFirebaseMessaging().then((messaging) => {
          if (messaging) {
            onMessage(messaging, (payload) => {
              console.log('Received foreground message:', payload);
              // Optionally show a custom toast here
            });
          }
        }).catch(console.error);

      } else {
        if (isMounted) {
          setProfile(null);
        }
      }
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
    <AuthContext.Provider value={{ user, profile, loading, requestNotificationPermission }}>
      {children}
      {loading && (
        <div className="absolute inset-0 z-[9999] flex h-full w-full items-center justify-center bg-[#F9C300]">
          <Loader2 size={48} className="animate-spin text-zinc-900" />
        </div>
      )}
    </AuthContext.Provider>
  );
}
