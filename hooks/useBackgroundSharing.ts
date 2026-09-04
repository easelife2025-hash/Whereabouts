import { useState, useCallback, useRef } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import type { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

export type BackgroundLocationData = {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
};

export function useBackgroundSharing() {
  const [isSharing, setIsSharing] = useState(false);
  const watcherIdRef = useRef<string | null>(null);

  const startSharing = useCallback(async (
    hasAuthorizedSession: boolean,
    onLocationUpdate: (loc: BackgroundLocationData) => void,
    onError: (err: any) => void
  ) => {
    if (!hasAuthorizedSession) {
      onError(new Error("Cannot start background sharing without an active authorized sharing session."));
      return;
    }

    if (isSharing) return;

    try {
      if (Capacitor.isNativePlatform()) {
        const watcher_id = await BackgroundGeolocation.addWatcher(
          {
            backgroundMessage: "Your live location is being shared in the background.",
            backgroundTitle: "Live Sharing Active",
            requestPermissions: true,
            stale: false,
            distanceFilter: 10 // meters
          },
          function callback(location, error) {
            if (error) {
              if (error.code === "NOT_AUTHORIZED") {
                // Not authorized logic
                onError(new Error("Location permission not authorized."));
              } else {
                onError(error);
              }
              return;
            }

            if (location) {
              onLocationUpdate({
                lat: location.latitude,
                lng: location.longitude,
                accuracy: location.accuracy,
                timestamp: location.time || Date.now()
              });
            }
          }
        );
        watcherIdRef.current = watcher_id;
        setIsSharing(true);
      } else {
        // Fallback to standard geolocation if not on native platform, 
        // though it won't work purely in the background reliably.
        const id = navigator.geolocation.watchPosition(
          (position) => {
            onLocationUpdate({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            });
          },
          (err) => {
            onError(err);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
          }
        );
        watcherIdRef.current = id.toString();
        setIsSharing(true);
      }
    } catch (err) {
      onError(err);
    }
  }, [isSharing]);

  const stopSharing = useCallback(async () => {
    if (watcherIdRef.current) {
      if (Capacitor.isNativePlatform()) {
        await BackgroundGeolocation.removeWatcher({ id: watcherIdRef.current });
      } else {
        navigator.geolocation.clearWatch(parseInt(watcherIdRef.current));
      }
      watcherIdRef.current = null;
    }
    setIsSharing(false);
  }, []);

  return { isSharing, startSharing, stopSharing };
}
