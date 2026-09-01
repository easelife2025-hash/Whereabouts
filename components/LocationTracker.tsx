"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db, rtdb } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, onSnapshot, query, where, addDoc, updateDoc, setDoc, deleteDoc, serverTimestamp as firestoreServerTimestamp, writeBatch } from 'firebase/firestore';
import { ref, set, serverTimestamp, remove } from 'firebase/database';

export function LocationTracker() {
  const { user } = useAuth();
  const [hasActiveShares, setHasActiveShares] = useState(false);
  const [activeViewers, setActiveViewers] = useState<Record<string, boolean>>({});

  // 1. Monitor active shares
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'location_shares'),
      where('recipientId', '==', user.uid),
      where('status', '==', 'active')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const now = new Date();
      let hasAny = false;
      const viewers: Record<string, boolean> = {};
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        let isExpired = false;
        if (data.expiresAt) {
          const expiresDate = data.expiresAt.toDate();
          if (now > expiresDate) {
            isExpired = true;
          }
        }
        
        // Ensure status is active and not expired, revoked, blocked, or denied
        if (!isExpired && data.status === 'active') {
          hasAny = true;
          if (data.requesterId) {
            viewers[data.requesterId] = true;
          }
        }
      }
      
      setHasActiveShares(hasAny);
      setActiveViewers(viewers);
    });

    return () => unsub();
  }, [user]);

  // 2. Manage Geolocation and Firebase Realtime Database
  useEffect(() => {
    let watchId: number;
    let isActive = true;

    if (user && hasActiveShares && typeof window !== 'undefined' && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (!isActive) return;
          const locRef = ref(rtdb, `user_locations/${user.uid}`);
          set(locRef, {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: serverTimestamp(),
            viewers: activeViewers
          }).catch(err => console.error(String((err as any)?.message || err || 'Error occurred')));
        },
        (error) => {
          console.error("Geolocation error:", "error occurred");
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    }

    return () => {
      isActive = false;
      if (watchId !== undefined && typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (user && hasActiveShares) {
        remove(ref(rtdb, `user_locations/${user.uid}`)).catch(err => console.error(String((err as any)?.message || err || 'Error occurred')));
      }
    };
  }, [user, hasActiveShares, activeViewers]);

  return null;
}
