const fs = require('fs');
const path = 'hooks/useGeolocation.ts';
let code = fs.readFileSync(path, 'utf-8');

const target = `    const startWatching = async () => {
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
    };`;

const replacement = `    const startWatching = () => {
      if (!('geolocation' in navigator)) {
        if (active) {
          setError('Geolocation not supported');
          setIsRequesting(false);
          setIsTracking(false);
        }
        return;
      }

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
    };`;

code = code.replace(target, replacement);
fs.writeFileSync(path, code);
console.log('patched');
