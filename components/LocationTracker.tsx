"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db, rtdb } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ref, set, serverTimestamp, onDisconnect } from 'firebase/database';

export function LocationTracker() {
  const { user } = useAuth();
  const [hasActiveShares, setHasActiveShares] = useState(false);

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
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        let isExpired = false;
        if (data.expiresAt) {
          const expiresDate = data.expiresAt.toDate();
          if (now > expiresDate) {
            isExpired = true;
          }
        }
        if (!isExpired) {
          hasAny = true;
          break;
        }
      }
      
      setHasActiveShares(hasAny);
    });

    return () => unsub();
  }, [user]);

  // 2. Manage Geolocation and Firebase Realtime Database
  useEffect(() => {
    let watchId: number;
    let isActive = true;

    if (user && hasActiveShares && typeof window !== 'undefined' && 'geolocation' in navigator) {
      const locationRef = ref(rtdb, `user_locations/${user.uid}`);
      
      // Clean up location on disconnect (if they close app)
      onDisconnect(locationRef).remove().catch(console.error);

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (!isActive) return;
          set(locationRef, {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: serverTimestamp()
          }).catch(console.error);
        },
        (error) => {
          console.error("Geolocation error:", error);
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
        // When stopping (e.g. sharing ends or component unmounts), remove location
        const locationRef = ref(rtdb, `user_locations/${user.uid}`);
        set(locationRef, null).catch(console.error);
        onDisconnect(locationRef).cancel().catch(console.error);
      }
    };
  }, [user, hasActiveShares]);

  return null;
}
