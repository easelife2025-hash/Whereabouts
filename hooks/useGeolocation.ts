import { useState, useEffect, useCallback } from 'react';

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

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    setIsRequesting(false);
  }, []);

  const requestPermissionAndTrack = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported');
      return;
    }

    setIsRequesting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setIsTracking(true);
        setIsRequesting(false);
      },
      (err) => {
        setIsRequesting(false);
        setIsTracking(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Permission denied');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location unavailable'); // Includes GPS disabled
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
  }, []);

  useEffect(() => {
    let watchId: number;

    if (isTracking && typeof window !== 'undefined' && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
          setError(null);
        },
        (err) => {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              setError('Permission denied');
              setIsTracking(false);
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
    }

    return () => {
      if (watchId !== undefined && typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking]);

  return { location, error, isTracking, isRequesting, requestPermissionAndTrack, stopTracking };
}
