const fs = require('fs');
const path = 'app/(main)/map/page.tsx';
let code = fs.readFileSync(path, 'utf-8');

// Update TrackingPage state
const targetState = `  const [outboundShares, setOutboundShares] = useState<OutboundShare[]>([]);
  const [recenterTick, setRecenterTick] = useState(0);`;

const replacementState = `  const [outboundShares, setOutboundShares] = useState<OutboundShare[]>([]);
  const [recenterTick, setRecenterTick] = useState(0);
  const [isFollowing, setIsFollowing] = useState(true);`;

code = code.replace(targetState, replacementState);

// Update MapController
const targetMapController = `function MapController({ center, tick }: { center: { lat: number; lng: number } | null, tick: number }) {
  const map = useMap();
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
      map.setZoom(15);
    }
  }, [map, center?.lat, center?.lng, tick]);
  return null;
}`;

const replacementMapController = `function MapController({ center, tick, isFollowing }: { center: { lat: number; lng: number } | null, tick: number, isFollowing: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (map && center && isFollowing) {
      map.panTo(center);
    }
  }, [map, center?.lat, center?.lng, isFollowing]);

  useEffect(() => {
    if (map && center) {
      map.panTo(center);
      map.setZoom(15);
    }
  }, [tick]);

  return null;
}`;

code = code.replace(targetMapController, replacementMapController);

// Update handleToggleTracking
const targetToggle = `  const handleToggleTracking = () => {
    if (isTracking && location) {
      setRecenterTick(t => t + 1);
    } else if (!isRequesting) {
      requestPermissionAndTrack();
    }
  };`;

const replacementToggle = `  const handleToggleTracking = () => {
    if (isTracking && location) {
      setIsFollowing(true);
      setRecenterTick(t => t + 1);
    } else if (!isRequesting) {
      requestPermissionAndTrack();
    }
  };`;

code = code.replace(targetToggle, replacementToggle);

// Update Crosshair button styling to reflect following mode
const targetCrosshair = `className={\`w-12 h-12 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center pointer-events-auto border transition-colors \${isTracking ? 'bg-[#F9C300] text-zinc-900 border-[#E5B200]' : 'bg-white/90 text-zinc-900 hover:bg-zinc-50 border-zinc-200/50 active:bg-zinc-100'}\`}`;
const replacementCrosshair = `className={\`w-12 h-12 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center pointer-events-auto border transition-colors \${isTracking && isFollowing ? 'bg-[#F9C300] text-zinc-900 border-[#E5B200]' : 'bg-white/90 text-zinc-900 hover:bg-zinc-50 border-zinc-200/50 active:bg-zinc-100'}\`}`;

code = code.replace(targetCrosshair, replacementCrosshair);

// Update Map component to detect manual dragging
const targetMap = `            internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
          >`;
const replacementMap = `            internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
            onDragstart={() => setIsFollowing(false)}
          >`;

code = code.replace(targetMap, replacementMap);

// Update MapController usage
const targetMapCtrlUse = `<MapController center={center} tick={recenterTick} />`;
const replacementMapCtrlUse = `<MapController center={center} tick={recenterTick} isFollowing={isFollowing} />`;

code = code.replace(targetMapCtrlUse, replacementMapCtrlUse);

fs.writeFileSync(path, code);
console.log('Patched map follow mode');
