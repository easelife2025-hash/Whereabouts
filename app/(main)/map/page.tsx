'use client';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

import { Crosshair, X, Navigation, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useBackgroundSharing } from '@/hooks/useBackgroundSharing';
import { set } from 'firebase/database';
import { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { db, rtdb } from '@/lib/firebase';
import { ref, onValue, off, DataSnapshot } from 'firebase/database';
import { collection, doc, getDoc, getDocs, onSnapshot, query, where, addDoc, updateDoc, setDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useAuth } from '@/components/auth/AuthProvider';
import Image from 'next/image';

function MapController({ center }: { center: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [map, center]);
  return null;
}


function AnimatedMarker({ marker, onClick }: { marker: any; onClick: () => void }) {
  const [pos, setPos] = useState({ lat: marker.lat, lng: marker.lng });

  useEffect(() => {
    let start = pos;
    let end = { lat: marker.lat, lng: marker.lng };
    if (start.lat === end.lat && start.lng === end.lng) return;

    let startTime = performance.now();
    let duration = 1000; // 1 second animation

    let frameId: number;
    const animate = (time: number) => {
      let progress = (time - startTime) / duration;
      if (progress > 1) progress = 1;
      // Easing function (easeOutQuad)
      const easeProgress = progress * (2 - progress);
      setPos({
        lat: start.lat + (end.lat - start.lat) * easeProgress,
        lng: start.lng + (end.lng - start.lng) * easeProgress
      });
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };
    frameId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(frameId);
  }, [marker.lat, marker.lng]);

  return (
    <AdvancedMarker position={pos} onClick={onClick}>
      <Pin background={'#10b981'} borderColor={'#059669'} glyphColor={'#ffffff'} scale={1.2} />
    </AdvancedMarker>
  );
}

type OutboundShare = { id: string };
type MarkerData = { uid: string; name: string; lat: number; lng: number; timestamp: number; };

export default function TrackingPage() {

  const router = useRouter();
  const { user } = useAuth();
  const { location, error, isTracking, isRequesting, requestPermissionAndTrack, stopTracking } = useGeolocation();
  async function handleStopSharing() {
    try {
      const batch = writeBatch(db);
      outboundShares.forEach(share => {
        batch.update(doc(db, 'location_shares', share.id), { status: 'revoked' });
      });
      await batch.commit();
    } catch (err) {
      console.error("Error stopping shares", "error occurred");
    }
  };
  const { startSharing, stopSharing, isSharing } = useBackgroundSharing(() => handleStopSharing());
  const [shareContext, setShareContext] = useState({ names: "", expiration: "" });
  const [authorizedMarkers, setAuthorizedMarkers] = useState<MarkerData[]>([]);
  const [selectedUser, setSelectedUser] = useState<MarkerData | null>(null);
  const [outboundShares, setOutboundShares] = useState<OutboundShare[]>([]);

  useEffect(() => {
    if (!user) return;
    
    // 1. Get the list of people sharing with ME
    const q = query(
      collection(db, 'location_shares'),
      where('requesterId', '==', user.uid),
      where('status', '==', 'active')
    );
    
    let rtdbUnsubs: (() => void)[] = [];
    
    const unsubFirestore = onSnapshot(q, (snapshot) => {
      // Clear old RTDB listeners when sharing status changes
      rtdbUnsubs.forEach(unsub => unsub());
      rtdbUnsubs = [];
      
      const authorizedIds = snapshot.docs.map(doc => doc.data().recipientId);
      
      if (authorizedIds.length === 0) {
        setAuthorizedMarkers([]);
        setSelectedUser(null);
        return;
      }

      const newMarkersMap = new globalThis.Map<string, MarkerData>();
      
      authorizedIds.forEach(async (uid) => {
        // Fetch user info just once
        const userDoc = await getDoc(doc(db, 'users', uid));
        const userData = userDoc.exists() ? userDoc.data() : { name: 'Unknown' };
        
        // 2. Listen to RTDB for these specific authorized users
        const locRef = ref(rtdb, 'user_locations/' + uid);
        const handleValue = (locSnapshot: DataSnapshot) => {
          const data = locSnapshot.val();
          if (data && (data.lat || data.latitude) && (data.lng || data.longitude)) {
            newMarkersMap.set(uid, {
              uid,
              name: userData.name,
              lat: data.latitude || data.lat,
              lng: data.longitude || data.lng,
              timestamp: data.timestamp || data.updatedAt
            });
          } else {
             newMarkersMap.delete(uid);
          }
          // Update state with new array
          const newMarkers = Array.from(newMarkersMap.values());
          setAuthorizedMarkers(newMarkers);
          setSelectedUser((prev) => {
            if (prev && !newMarkersMap.has(prev.uid)) {
              return null;
            }
            if (prev && newMarkersMap.has(prev.uid)) {
              return newMarkersMap.get(prev.uid) || null;
            }
            return prev;
          });
        };
        onValue(locRef, handleValue, (error) => {
          console.error('RTDB listener error:', error);
        });
        rtdbUnsubs.push(() => off(locRef, 'value', handleValue));
      });
    }, (error) => {
      console.error("Firestore listener error:", "error occurred");
    });

    return () => {
      unsubFirestore();
      rtdbUnsubs.forEach(unsub => unsub());
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const qOut = query(
      collection(db, 'location_shares'),
      where('recipientId', '==', user.uid),
      where('status', '==', 'active')
    );
    const unsubOut = onSnapshot(qOut, (snapshot) => {
      setOutboundShares(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubOut();
  }, [user]);

  
  
  useEffect(() => {
    const fetchContext = async () => {
      if (outboundShares.length === 0) {
        setShareContext({ names: "", expiration: "" });
        return;
      }
      
      const names = [];
      let earliestExpiration = Infinity;

      for (const share of outboundShares) {
        if (share.requesterId) {
          const userDoc = await getDoc(doc(db, 'users', share.requesterId));
          if (userDoc.exists()) {
            names.push(userDoc.data().name);
          }
        }
        if (share.expiresAt) {
          const time = share.expiresAt.toMillis ? share.expiresAt.toMillis() : share.expiresAt;
          if (time < earliestExpiration) {
            earliestExpiration = time;
          }
        }
      }

      const namesStr = names.length > 0 ? names.join(', ') : 'Selected contacts';
      let expirationStr = 'Never';
      if (earliestExpiration !== Infinity) {
        expirationStr = new Date(earliestExpiration).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      setShareContext({ names: namesStr, expiration: expirationStr });
    };
    fetchContext();
  }, [outboundShares]);

  useEffect(() => {
    if (!user) return;
    
    const startBackground = async () => {
      // 4. Sharing has not expired
      const validShares = outboundShares.filter(share => {
         if (!share.expiresAt) return true;
         const time = share.expiresAt.toMillis ? share.expiresAt.toMillis() : share.expiresAt;
         return time > Date.now();
      });

      // 3. The location owner has granted device location permission
      let hasPermission = false;
      if (Capacitor.isNativePlatform()) {
        try {
          const permStatus = await Geolocation.checkPermissions();
          hasPermission = (permStatus.location === 'granted' || permStatus.coarseLocation === 'granted');
        } catch(e) {
          hasPermission = false;
        }
      } else {
        hasPermission = true;
      }

      // 1. User is authenticated (checked at top)
      // 2. Another user has an active permission (validShares.length > 0)
      // 3. Location permission granted (hasPermission)
      // 4. Sharing has not expired (validShares)
      // 5. User explicitly started sharing (isTracking is true)
      
      const shouldShare = validShares.length > 0 && hasPermission;

      if (shouldShare) {
        const token = await user.getIdToken();
        const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '';
        
        startSharing(
          true,
          shareContext.names,
          shareContext.expiration,
          dbUrl,
          token,
          user.uid,
          (loc) => {
            // Push to Firebase RTDB
            const locRef = ref(rtdb, 'user_locations/' + user.uid);
            set(locRef, {
              latitude: loc.lat,
              longitude: loc.lng,
              accuracy: loc.accuracy,
              updatedAt: loc.timestamp
            }).catch(err => console.error('Failed to update RTDB location:', err));
          },
          (err) => {
            console.error("Background sharing error:", err);
          }
        );
      } else {
        stopSharing();
        // Remove location from RTDB when stop sharing
        const locRef = ref(rtdb, 'user_locations/' + user.uid);
        set(locRef, null).catch(err => console.error('Failed to remove RTDB location:', err));
      }
    };
    startBackground();
  }, [outboundShares, user, startSharing, stopSharing, shareContext, isTracking]);

  const handleToggleTracking = () => {
    if (isTracking || isRequesting) {
      stopTracking();
    } else {
      requestPermissionAndTrack();
    }
  };

  

  const center = location ? { lat: location.lat, lng: location.lng } : null;

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 relative h-full w-full">
      <div className="absolute inset-0">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
          <Map
            defaultCenter={{ lat: 0, lng: 0 }}
            defaultZoom={15}
            mapId="DEMO_MAP_ID"
            gestureHandling={'greedy'}
            disableDefaultUI={true}
            style={{ width: '100%', height: '100%' }}
            internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
          >
            <MapController center={center} />
            
            {/* Current User Marker */}
            {location && (
              <AdvancedMarker position={{ lat: location.lat, lng: location.lng }} zIndex={10}>
                <div className="relative">
                  <div className="w-12 h-12 bg-white rounded-full p-1 shadow-xl flex items-center justify-center relative z-10 border-2 border-[#F9C300]">
                    <div className="bg-zinc-100 w-full h-full rounded-full flex items-center justify-center">
                      <Navigation size={20} className="text-[#F9C300]" />
                    </div>
                  </div>
                </div>
              </AdvancedMarker>
            )}

            {/* Authorized Persons Markers */}
            {authorizedMarkers.map((marker) => (
              <AnimatedMarker 
                key={marker.uid}
                marker={marker}
                onClick={() => setSelectedUser(marker)}
              />
            ))}
          </Map>
        </APIProvider>
      </div>

      {/* Map UI Overlay */}
      <div className="absolute inset-0 flex flex-col z-10 pointer-events-none">
        
        {/* Top Controls */}
        <div className="p-4 flex justify-between items-start mt-2">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center text-zinc-900 pointer-events-auto border border-zinc-200/50 active:bg-zinc-100 transition-colors"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
          
          <button 
            onClick={handleToggleTracking}
            className={`w-12 h-12 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center pointer-events-auto border transition-colors ${isTracking ? 'bg-[#F9C300] text-zinc-900 border-[#E5B200]' : 'bg-white/90 text-zinc-900 hover:bg-zinc-50 border-zinc-200/50 active:bg-zinc-100'}`}
          >
            {isRequesting ? (
              <Loader2 size={22} strokeWidth={2.5} className="animate-spin" />
            ) : (
              <Crosshair size={22} strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* Bottom Info Card */}
        <div className="mt-auto px-4 pb-6 relative z-20 pointer-events-auto">
          {selectedUser ? (
             <div className="bg-white rounded-3xl p-5 shadow-lg border border-zinc-100">
               <div className="flex items-center justify-between mb-2">
                 <div className="flex flex-col">
                   <div className="flex items-center gap-2 mb-1">
                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                     <span className="text-[11px] font-bold text-green-600 uppercase tracking-widest">LIVE</span>
                   </div>
                   <h2 className="text-[20px] font-bold text-zinc-900 leading-tight">{selectedUser.name}</h2>
                   <p className="text-[13px] font-medium text-zinc-500 mt-0.5">
                     Last updated: {selectedUser.timestamp ? new Date(selectedUser.timestamp).toLocaleTimeString() : 'Just now'}
                   </p>
                 </div>
                 <button onClick={() => setSelectedUser(null)} className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-200">
                   <X size={18} />
                 </button>
               </div>
             </div>
          ) : (
            <div className="bg-white rounded-3xl p-5 shadow-lg border border-zinc-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                  {error ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest">Error</span>
                      </div>
                      <h2 className="text-[20px] font-bold text-zinc-900 leading-tight">{error}</h2>
                      <p className="text-[13px] font-medium text-zinc-500 mt-0.5">Check your device settings</p>
                    </>
                  ) : isTracking && location ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-[#F9C300] animate-pulse"></div>
                        <span className="text-[11px] font-bold text-yellow-600 uppercase tracking-widest">Broadcasting</span>
                      </div>
                      <h2 className="text-[20px] font-bold text-zinc-900 leading-tight">Your Location</h2>
                      <p className="text-[13px] font-medium text-zinc-500 mt-0.5 font-mono">
                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </p>
                      {outboundShares.length > 0 && (
                        <button 
                          onClick={handleStopSharing}
                          className="mt-3 w-full bg-red-50 text-red-600 font-bold text-[14px] py-2.5 rounded-xl flex items-center justify-center gap-2 active:bg-red-100 transition-colors"
                        >
                          <AlertTriangle size={16} /> Stop Sharing
                        </button>
                      )}
                    </>
                  ) : isRequesting ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-[#F9C300] animate-pulse"></div>
                        <span className="text-[11px] font-bold text-yellow-600 uppercase tracking-widest">Requesting</span>
                      </div>
                      <h2 className="text-[20px] font-bold text-zinc-900 leading-tight">Getting Location...</h2>
                      <p className="text-[13px] font-medium text-zinc-500 mt-0.5">Please allow permission</p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${outboundShares.length > 0 ? 'bg-[#F9C300] animate-pulse' : 'bg-zinc-300'}`}></div>
                        <span className={`text-[11px] font-bold uppercase tracking-widest ${outboundShares.length > 0 ? 'text-yellow-600' : 'text-zinc-400'}`}>
                          {outboundShares.length > 0 ? 'Background Sharing' : 'Offline'}
                        </span>
                      </div>
                      <h2 className="text-[20px] font-bold text-zinc-900 leading-tight">
                        {outboundShares.length > 0 ? 'Location is shared' : 'Not broadcasting'}
                      </h2>
                      <p className="text-[13px] font-medium text-zinc-500 mt-0.5">
                        {outboundShares.length > 0 ? 'You are sharing your location.' : 'Tap crosshair to enable'}
                      </p>
                      {outboundShares.length > 0 && (
                        <button 
                          onClick={handleStopSharing}
                          className="mt-3 w-full bg-red-50 text-red-600 font-bold text-[14px] py-2.5 rounded-xl flex items-center justify-center gap-2 active:bg-red-100 transition-colors"
                        >
                          <AlertTriangle size={16} /> Stop Sharing
                        </button>
                      )}
                    </>
                  )}
                </div>
                
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${error ? 'bg-red-50 border-red-100 text-red-400' : isTracking ? 'bg-[#F9C300]/20 border-[#F9C300]/30 text-[#E5B200]' : 'bg-zinc-50 border-zinc-100 text-zinc-300'}`}> 
                  {error ? (
                    <AlertTriangle size={20} />
                  ) : isTracking ? (
                    <ShieldCheck size={20} />
                  ) : (
                    <Navigation size={20} />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
