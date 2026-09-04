import { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Dialog } from '@capacitor/dialog';

export type LocationData = {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
};

export type GeolocationError = 
  | 'Permission denied'
  | 'GPS disabled'
  | 'Location unavailable'
  | 'Network errors'
  | 'Geolocation not supported'
  | null;

export function useGeolocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<GeolocationError>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const watchIdRef = useRef<string | number | null>(null);

  const stopTracking = useCallback(async () => {
    setIsTracking(false);
    setIsRequesting(false);
    if (watchIdRef.current !== null) {
      if (Capacitor.isNativePlatform()) {
        await Geolocation.clearWatch({ id: watchIdRef.current as string });
      } else {
        navigator.geolocation.clearWatch(watchIdRef.current as number);
      }
      watchIdRef.current = null;
    }
  }, []);

  const requestPermissionAndTrack = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    setIsRequesting(true);
    setError(null);

    try {
      if (Capacitor.isNativePlatform()) {
        let permStatus = await Geolocation.checkPermissions();
        
        if (permStatus.location !== 'granted' && permStatus.coarseLocation !== 'granted') {
          // Explain clearly to the user why location access is needed.
          // Never request location secretly.
          const { value } = await Dialog.confirm({
            title: 'Location Access Required',
            message: 'This app needs access to your precise and foreground location to show your position on the map and track your route. Background location access may also be required for continuous tracking while the app is minimized. Do you allow access?',
            okButtonTitle: 'Continue',
            cancelButtonTitle: 'Not Now'
          });
          
          if (value) {
            permStatus = await Geolocation.requestPermissions();
            if (permStatus.location !== 'granted' && permStatus.coarseLocation !== 'granted') {
              setError('Permission denied');
              setIsRequesting(false);
              return;
            }
          } else {
            setError('Permission denied');
            setIsRequesting(false);
            return;
          }
        }
      } else {
        if (!('geolocation' in navigator)) {
          setError('Geolocation not supported');
          setIsRequesting(false);
          return;
        }
      }
      
      setIsTracking(true);
    } catch (e) {
      setError('Geolocation not supported');
      setIsRequesting(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const startWatching = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const id = await Geolocation.watchPosition(
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
            (position, err) => {
              if (!active) return;
              if (err) {
                setIsRequesting(false);
                setIsTracking(false);
                setError('Location unavailable');
                return;
              }
              if (position) {
                setIsRequesting(false);
                setLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  accuracy: position.coords.accuracy,
                  timestamp: position.timestamp,
                });
                setError(null);
              }
            }
          );
          if (active) watchIdRef.current = id;
          else Geolocation.clearWatch({ id });
        } catch (e) {
          if (active) {
            setError('Location unavailable');
            setIsRequesting(false);
            setIsTracking(false);
          }
        }
      } else {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            if (!active) return;
            setIsRequesting(false);
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            });
            setError(null);
          },
          (err) => {
            if (!active) return;
            setIsRequesting(false);
            setIsTracking(false);
            switch (err.code) {
              case err.PERMISSION_DENIED:
                setError('Permission denied');
                break;
              case err.POSITION_UNAVAILABLE:
                setError('Location unavailable');
                break;
              case err.TIMEOUT:
                setError('Network errors');
                break;
              default:
                setError('Location unavailable');
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        );
        watchIdRef.current = id;
      }
    };

    if (isTracking) {
      startWatching();
    }

    return () => {
      active = false;
      if (watchIdRef.current !== null) {
        if (Capacitor.isNativePlatform()) {
          Geolocation.clearWatch({ id: watchIdRef.current as string });
        } else {
          navigator.geolocation.clearWatch(watchIdRef.current as number);
        }
        watchIdRef.current = null;
      }
    };
  }, [isTracking]);

  return { location, error, isTracking, isRequesting, requestPermissionAndTrack, stopTracking };
}
