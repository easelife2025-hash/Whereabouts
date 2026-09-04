import { useState, useCallback, useRef, useEffect } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import type { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';

export interface CustomBackgroundGeolocationPlugin extends BackgroundGeolocationPlugin {
  addListener(eventName: 'stopSharing', listenerFunc: () => void): any;
  updateNotification(options: { backgroundTitle: string, backgroundMessage: string }): Promise<void>;
}

const BackgroundGeolocation = registerPlugin<CustomBackgroundGeolocationPlugin>('BackgroundGeolocation');

export type BackgroundLocationData = {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
};

export function useBackgroundSharing(onStopRequested?: () => void) {
  const [isSharing, setIsSharing] = useState(false);
  const watcherIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const listener = BackgroundGeolocation.addListener('stopSharing', () => {
        if (onStopRequested) {
          onStopRequested();
        }
      });
      return () => {
        listener.then(l => l.remove());
      };
    }
  }, [onStopRequested]);

  const startSharing = useCallback(async (
    hasAuthorizedSession: boolean,
    sharedWithNames: string,
    expirationTime: string,
    firebaseDbUrl: string,
    firebaseToken: string,
    firebaseUid: string,
    onLocationUpdate: (loc: BackgroundLocationData) => void,
    onError: (err: any) => void
  ) => {
    if (!hasAuthorizedSession) {
      onError(new Error("Cannot start background sharing without an active authorized sharing session."));
      return;
    }

    const message = `Visible to: ${sharedWithNames || 'Selected contacts'}\nExpires: ${expirationTime}`;
    const title = "Location sharing is active";

    if (isSharing) {
      // Update existing notification dynamically
      if (Capacitor.isNativePlatform()) {
        try {
          await BackgroundGeolocation.updateNotification({
             backgroundTitle: title,
             backgroundMessage: message
          });
        } catch (e) {
          console.warn("Failed to update notification", e);
        }
      }
      return;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        const watcher_id = await BackgroundGeolocation.addWatcher(
          {
            backgroundMessage: message,
            backgroundTitle: title,
            requestPermissions: true,
            stale: false,
            distanceFilter: 10, // meters
            firebaseDbUrl,
            firebaseToken,
            firebaseUid
          } as any,
          function callback(location, error) {
            if (error) {
              if (error.code === "NOT_AUTHORIZED") {
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
