const fs = require('fs');
let code = fs.readFileSync('app/(main)/map/page.tsx', 'utf-8');

// Import useBackgroundSharing
code = code.replace(
  "import { useGeolocation } from '@/hooks/useGeolocation';",
  "import { useGeolocation } from '@/hooks/useGeolocation';\nimport { useBackgroundSharing } from '@/hooks/useBackgroundSharing';\nimport { set } from 'firebase/database';"
);

// Call hook inside component
code = code.replace(
  "const { location, error, isTracking, isRequesting, requestPermissionAndTrack, stopTracking } = useGeolocation();",
  "const { location, error, isTracking, isRequesting, requestPermissionAndTrack, stopTracking } = useGeolocation();\n  const { startSharing, stopSharing, isSharing } = useBackgroundSharing();"
);

// Add useEffect to manage background sharing based on outboundShares
const useEffectHook = `
  useEffect(() => {
    if (!user) return;
    if (outboundShares.length > 0) {
      startSharing(
        true,
        (loc) => {
          // Push to Firebase RTDB
          const locRef = ref(rtdb, 'user_locations/' + user.uid);
          set(locRef, {
            lat: loc.lat,
            lng: loc.lng,
            accuracy: loc.accuracy,
            timestamp: loc.timestamp
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
  }, [outboundShares, user, startSharing, stopSharing]);
`;

code = code.replace(
  "const handleToggleTracking = () => {",
  useEffectHook + "\n  const handleToggleTracking = () => {"
);

fs.writeFileSync('app/(main)/map/page.tsx', code);
