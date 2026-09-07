const fs = require('fs');
const path = 'app/(main)/map/page.tsx';
let code = fs.readFileSync(path, 'utf-8');

const targetReturnStart = `  return (
    <div className="flex flex-col flex-1 bg-zinc-50 relative h-full w-full">
      <div className="absolute inset-0">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>`;

const targetReturnEnd = `          </Map>
        </APIProvider>
      </div>`;

// Find the content between these two strings
const startIndex = code.indexOf(targetReturnStart);
const endIndex = code.indexOf(targetReturnEnd) + targetReturnEnd.length;

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find the target return block.");
  process.exit(1);
}

const replacement = `  return (
    <div className="flex flex-col flex-1 bg-zinc-50 relative h-full w-full">
      <div className="absolute inset-0">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} version="alpha">
          {/* 2D Vector Map */}
          <div className={\`absolute inset-0 transition-opacity duration-300 \${is3D ? 'opacity-0 pointer-events-none' : 'opacity-100'}\`} onPointerDown={() => setIsFollowing(false)}>
            <Map
              defaultCenter={{ lat: 0, lng: 0 }}
              defaultZoom={15}
              mapId="DEMO_MAP_ID"
              renderingType="VECTOR"
              gestureHandling={'greedy'}
              disableDefaultUI={true}
              style={{ width: '100%', height: '100%' }}
              internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
              onDragstart={() => setIsFollowing(false)}
            >
              <MapController center={center} tick={recenterTick} isFollowing={isFollowing} is3D={false} />
              
              {/* Current User Marker */}
              {location && (
                <AdvancedMarker position={{ lat: location.lat, lng: location.lng }} zIndex={10}>
                  <div className="relative">
                    <div className="w-12 h-12 bg-white rounded-full p-1 shadow-xl flex items-center justify-center relative z-10 border-2 border-[#F9C300]">
                      <div className="bg-zinc-100 w-full h-full rounded-full flex items-center justify-center">
                        <Navigation size={20} className="text-[#F9C300]" />
                      </div>
                    </div>
                  </div>
                </AdvancedMarker>
              )}

              {/* Authorized Persons Markers */}
              {authorizedMarkers.map((marker) => (
                <AnimatedMarker 
                  key={marker.uid}
                  marker={marker}
                  onClick={() => setSelectedUser(marker)}
                />
              ))}
            </Map>
          </div>

          {/* Photorealistic 3D Map */}
          <div className={\`absolute inset-0 transition-opacity duration-300 \${is3D ? 'opacity-100' : 'opacity-0 pointer-events-none'}\`} onPointerDown={() => setIsFollowing(false)} onTouchStart={() => setIsFollowing(false)}>
            <Map3D
              center={center ? { lat: center.lat, lng: center.lng, altitude: 0 } : { lat: 0, lng: 0, altitude: 0 }}
              range={1000}
              tilt={67.5}
              heading={45}
              defaultLabelsDisabled={false}
            >
              <Map3DController center={center} tick={recenterTick} isFollowing={isFollowing} />
              
              {/* Current User Marker */}
              {location && (
                <Marker3D position={{ lat: location.lat, lng: location.lng, altitude: 0 }} altitudeMode="RELATIVE_TO_GROUND">
                  <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="23" fill="white" stroke="#F9C300" strokeWidth="2" />
                    <circle cx="24" cy="24" r="18" fill="#f4f4f5" />
                    <path d="M18 26L32 16L22 30L21 25L18 26Z" fill="#F9C300" />
                  </svg>
                </Marker3D>
              )}

              {/* Authorized Persons Markers */}
              {authorizedMarkers.map((marker) => (
                <AnimatedMarker3D 
                  key={marker.uid}
                  marker={marker}
                  onClick={() => setSelectedUser(marker)}
                />
              ))}
            </Map3D>
          </div>
        </APIProvider>
      </div>`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);

const mapControllerEndIndex = code.indexOf('return null;\n}') + 16;
if (mapControllerEndIndex === 15) {
   console.error("Could not find MapController");
   process.exit(1);
}

const map3dControllers = `

function Map3DController({ center, tick, isFollowing }: { center: { lat: number; lng: number } | null, tick: number, isFollowing: boolean }) {
  const map3d = useMap3D();
  
  useEffect(() => {
    if (map3d && center && isFollowing) {
      map3d.center = { lat: center.lat, lng: center.lng, altitude: 0 };
    }
  }, [map3d, center?.lat, center?.lng, isFollowing]);

  useEffect(() => {
    if (map3d && center) {
      map3d.center = { lat: center.lat, lng: center.lng, altitude: 0 };
      map3d.range = 500;
    }
  }, [tick]);

  return null;
}

function AnimatedMarker3D({ marker, onClick }: { marker: any; onClick: () => void }) {
  const [pos, setPos] = useState({ lat: marker.lat, lng: marker.lng });

  useEffect(() => {
    let start = pos;
    let end = { lat: marker.lat, lng: marker.lng };
    if (start.lat === end.lat && start.lng === end.lng) return;

    let startTime = performance.now();
    let duration = 1000;
    let frameId;

    const animate = (time) => {
      let progress = (time - startTime) / duration;
      if (progress > 1) progress = 1;
      const easeProgress = progress * (2 - progress);

      setPos({
        lat: start.lat + (end.lat - start.lat) * easeProgress,
        lng: start.lng + (end.lng - start.lng) * easeProgress
      });

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [marker.lat, marker.lng]);

  return (
    <Marker3D position={{ lat: pos.lat, lng: pos.lng, altitude: 0 }} altitudeMode="RELATIVE_TO_GROUND" onClick={onClick}>
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19" fill="#F9C300" stroke="white" strokeWidth="2" />
        {marker.photoUrl ? (
          <image href={marker.photoUrl} x="4" y="4" width="32" height="32" clipPath="url(#circle)" />
        ) : (
          <text x="20" y="26" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#18181b">{marker.name.charAt(0)}</text>
        )}
        <defs>
          <clipPath id="circle">
            <circle cx="20" cy="20" r="16" />
          </clipPath>
        </defs>
      </svg>
    </Marker3D>
  );
}`;

code = code.substring(0, mapControllerEndIndex) + map3dControllers + code.substring(mapControllerEndIndex);

const targetImport = "import { APIProvider, Map, Map3D, Marker3D, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';";
const replacementImport = "import { APIProvider, Map, Map3D, Marker3D, AdvancedMarker, Pin, useMap, useMap3D } from '@vis.gl/react-google-maps';";
code = code.replace(targetImport, replacementImport);

fs.writeFileSync(path, code);
console.log('done');
