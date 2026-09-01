const fs = require('fs');
let content = fs.readFileSync('hooks/useGeolocation.ts', 'utf8');

const replacement = `
  const requestPermissionAndTrack = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported');
      return;
    }

    setIsRequesting(true);
    setError(null);
    setIsTracking(true);
  }, []);

  useEffect(() => {
    let watchId: number;

    if (isTracking && typeof window !== 'undefined' && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
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
    }

    return () => {
      if (watchId !== undefined && typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking]);
`;

const oldStart = `  const requestPermissionAndTrack = useCallback(() => {`;
const oldEnd = `  }, [isTracking]);`;

const startIndex = content.indexOf(oldStart);
const endIndex = content.indexOf(oldEnd) + oldEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + replacement.trim() + content.substring(endIndex);
  fs.writeFileSync('hooks/useGeolocation.ts', content);
  console.log("Updated hooks/useGeolocation.ts");
} else {
  console.log("Could not find the block to replace.");
}
