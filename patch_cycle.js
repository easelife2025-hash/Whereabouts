const fs = require('fs');
const path = 'app/(main)/map/page.tsx';
let code = fs.readFileSync(path, 'utf-8');

// Need to import useRef if it's not imported. But wait, we can just declare the ref.
if (!code.includes('useRef')) {
  code = code.replace('useEffect, useState', 'useEffect, useState, useRef');
}

const target = `  const [shareContext, setShareContext] = useState({ names: "", expiration: "" });
  const [authorizedMarkers, setAuthorizedMarkers] = useState<MarkerData[]>([]);
  const [selectedUser, setSelectedUser] = useState<MarkerData | null>(null);
  const [outboundShares, setOutboundShares] = useState<OutboundShare[]>([]);

  async function handleStopSharing() {`;

const replacement = `  const [shareContext, setShareContext] = useState({ names: "", expiration: "" });
  const [authorizedMarkers, setAuthorizedMarkers] = useState<MarkerData[]>([]);
  const [selectedUser, setSelectedUser] = useState<MarkerData | null>(null);
  const [outboundShares, setOutboundShares] = useState<OutboundShare[]>([]);
  const stopSharingRef = useRef<(() => void) | null>(null);

  async function handleStopSharing() {`;

code = code.replace(target, replacement);

const target2 = `      stopTracking();
      stopSharing();`;
const replacement2 = `      stopTracking();
      if (stopSharingRef.current) stopSharingRef.current();`;

code = code.replace(target2, replacement2);

const target3 = `  const { startSharing, stopSharing, isSharing } = useBackgroundSharing(() => handleStopSharing());`;
const replacement3 = `  const { startSharing, stopSharing, isSharing } = useBackgroundSharing(() => handleStopSharing());
  useEffect(() => { stopSharingRef.current = stopSharing; }, [stopSharing]);`;

code = code.replace(target3, replacement3);

fs.writeFileSync(path, code);
