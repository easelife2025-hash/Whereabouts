const fs = require('fs');
const path = 'app/(main)/map/page.tsx';
let code = fs.readFileSync(path, 'utf-8');

// Update MapController
const targetMapController = `function MapController({ center }: { center: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [map, center]);
  return null;
}`;

const replacementMapController = `function MapController({ center, tick }: { center: { lat: number; lng: number } | null, tick: number }) {
  const map = useMap();
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
      map.setZoom(15);
    }
  }, [map, center?.lat, center?.lng, tick]);
  return null;
}`;

code = code.replace(targetMapController, replacementMapController);

// Add recenterTick state
const targetState = `  const [outboundShares, setOutboundShares] = useState<OutboundShare[]>([]);`;
const replacementState = `  const [outboundShares, setOutboundShares] = useState<OutboundShare[]>([]);
  const [recenterTick, setRecenterTick] = useState(0);`;

code = code.replace(targetState, replacementState);

// Update handleToggleTracking
const targetToggle = `  const handleToggleTracking = () => {
    if (isTracking || isRequesting) {
      stopTracking();
    } else {
      requestPermissionAndTrack();
    }
  };`;

const replacementToggle = `  const handleToggleTracking = () => {
    if (isTracking && location) {
      setRecenterTick(t => t + 1);
    } else if (!isRequesting) {
      requestPermissionAndTrack();
    }
  };`;

code = code.replace(targetToggle, replacementToggle);

// Update MapController usage
const targetMapCtrlUse = `<MapController center={center} />`;
const replacementMapCtrlUse = `<MapController center={center} tick={recenterTick} />`;

code = code.replace(targetMapCtrlUse, replacementMapCtrlUse);

fs.writeFileSync(path, code);
console.log('Patched crosshair');
