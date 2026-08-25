"use client";
import { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { rtdb, db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '@/components/auth/AuthProvider';

export function LiveMap({ centerLat, centerLng }: { centerLat?: number, centerLng?: number }) {
  const { user } = useAuth();
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    // In a real app we would query who is sharing with us.
    // For now let's just listen to all user_locations for simplicity,
    // or specifically ones we know about. 
    // Actually we can just listen to the whole `user_locations` node and filter?
    // In RTDB, we can't easily filter without proper rules, but we can listen to it if rules allow.
    const locationsRef = ref(rtdb, 'user_locations');
    const unsub = onValue(locationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const newMarkers: any[] = [];
        Object.keys(data).forEach(uid => {
          if (uid !== user.uid && data[uid].lat && data[uid].lng) {
            newMarkers.push({
              uid,
              lat: data[uid].lat,
              lng: data[uid].lng,
              timestamp: data[uid].timestamp
            });
          }
        });
        setMarkers(newMarkers);
      }
    });

    return () => unsub();
  }, [user]);

  const defaultCenter = { lat: centerLat || 0, lng: centerLng || 0 };

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={15}
        mapId="DEMO_MAP_ID"
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        style={{ width: '100%', height: '100%' }}
      >
        {centerLat && centerLng && (
          <AdvancedMarker position={{ lat: centerLat, lng: centerLng }}>
            <Pin background={'#4f46e5'} borderColor={'#3730a3'} glyphColor={'#ffffff'} />
          </AdvancedMarker>
        )}
        {markers.map(m => (
          <AdvancedMarker key={m.uid} position={{ lat: m.lat, lng: m.lng }}>
            <Pin background={'#10b981'} borderColor={'#059669'} glyphColor={'#ffffff'} />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
