const fs = require('fs');
let content = fs.readFileSync('app/(main)/map/page.tsx', 'utf8');

// Replace the Firestore snapshot with RTDB onValue
content = content.replace(
  /\/\/ 2\. Listen to Firestore for these specific authorized users[\s\S]*?rtdbUnsubs\.push\(unsubLoc\);/,
  `// 2. Listen to RTDB for these specific authorized users
        const locRef = ref(rtdb, 'user_locations/' + uid);
        const handleValue = (locSnapshot) => {
          const data = locSnapshot.val();
          if (data && data.lat && data.lng) {
            newMarkersMap.set(uid, {
              uid,
              name: userData.name,
              lat: data.lat,
              lng: data.lng,
              timestamp: data.timestamp || data.updatedAt
            });
          } else {
             newMarkersMap.delete(uid);
          }
          // Update state with new array
          const newMarkers = Array.from(newMarkersMap.values());
          setAuthorizedMarkers(newMarkers);
          setSelectedUser((prev) => {
            if (prev && !newMarkersMap.has(prev.uid)) {
              return null;
            }
            if (prev && newMarkersMap.has(prev.uid)) {
              return newMarkersMap.get(prev.uid);
            }
            return prev;
          });
        };
        onValue(locRef, handleValue, (error) => {
          console.error('RTDB listener error:', error);
        });
        rtdbUnsubs.push(() => off(locRef, 'value', handleValue));`
);

// Insert AnimatedMarker component
const animatedMarkerCode = `
function AnimatedMarker({ marker, onClick }: { marker: any; onClick: () => void }) {
  const [pos, setPos] = useState({ lat: marker.lat, lng: marker.lng });

  useEffect(() => {
    let start = pos;
    let end = { lat: marker.lat, lng: marker.lng };
    if (start.lat === end.lat && start.lng === end.lng) return;

    let startTime = performance.now();
    let duration = 1000; // 1 second animation

    let frameId;
    const animate = (time) => {
      let progress = (time - startTime) / duration;
      if (progress > 1) progress = 1;
      // Easing function (easeOutQuad)
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
    <AdvancedMarker position={pos} onClick={onClick}>
      <Pin background={'#10b981'} borderColor={'#059669'} glyphColor={'#ffffff'} scale={1.2} />
    </AdvancedMarker>
  );
}

export default function TrackingPage() {
`;

content = content.replace(/export default function TrackingPage\(\) {/, animatedMarkerCode);

// Replace `<AdvancedMarker>` in map with `<AnimatedMarker>`
content = content.replace(
  /\{\/\* Authorized Persons Markers \*\/\}\s*\{authorizedMarkers\.map\(\(marker\) => \([\s\S]*?<\/AdvancedMarker>\s*\)\)\}/,
  `{/* Authorized Persons Markers */}
            {authorizedMarkers.map((marker) => (
              <AnimatedMarker 
                key={marker.uid}
                marker={marker}
                onClick={() => setSelectedUser(marker)}
              />
            ))}`
);

fs.writeFileSync('app/(main)/map/page.tsx', content);
console.log('Fixed map/page.tsx');
