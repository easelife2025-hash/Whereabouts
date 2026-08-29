"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, onSnapshot, query, where, addDoc, updateDoc, setDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';

export function LocationTracker() {
  const { user } = useAuth();
  const [hasActiveShares, setHasActiveShares] = useState(false);
  const [activeViewers, setActiveViewers] = useState<string[]>([]);

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
      const viewers: string[] = [];
      
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
          if (data.requesterId && !viewers.includes(data.requesterId)) viewers.push(data.requesterId);
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
          setDoc(doc(db, 'user_locations', user.uid), {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: serverTimestamp(),
            viewers: activeViewers
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
        deleteDoc(doc(db, 'user_locations', user.uid)).catch(console.error);
      }
    };
  }, [user, hasActiveShares, activeViewers]);

  return null;
}
