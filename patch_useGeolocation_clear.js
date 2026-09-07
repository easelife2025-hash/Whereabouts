const fs = require('fs');
const path = 'hooks/useGeolocation.ts';
let code = fs.readFileSync(path, 'utf-8');

const target1 = `    return () => {
      active = false;
      if (watchIdRef.current !== null) {
        if (Capacitor.isNativePlatform()) {
          Geolocation.clearWatch({ id: watchIdRef.current as string });
        } else {
          navigator.geolocation.clearWatch(watchIdRef.current as number);
        }
        watchIdRef.current = null;
      }
    };`;

const replacement1 = `    return () => {
      active = false;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current as number);
        watchIdRef.current = null;
      }
    };`;

code = code.replace(target1, replacement1);

const target2 = `  const stopTracking = useCallback(async () => {
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
  }, []);`;

const replacement2 = `  const stopTracking = useCallback(() => {
    setIsTracking(false);
    setIsRequesting(false);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current as number);
      watchIdRef.current = null;
    }
  }, []);`;

code = code.replace(target2, replacement2);

fs.writeFileSync(path, code);
console.log('patched clear watch');
