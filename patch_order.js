const fs = require('fs');
const path = 'app/(main)/map/page.tsx';
let code = fs.readFileSync(path, 'utf-8');

const declarations = `  const [shareContext, setShareContext] = useState({ names: "", expiration: "" });
  const [authorizedMarkers, setAuthorizedMarkers] = useState<MarkerData[]>([]);
  const [selectedUser, setSelectedUser] = useState<MarkerData | null>(null);
  const [outboundShares, setOutboundShares] = useState<OutboundShare[]>([]);`;

code = code.replace(declarations, '');

const handleStopSharing = `  async function handleStopSharing() {`;

code = code.replace(handleStopSharing, `${declarations}\n\n  async function handleStopSharing() {`);

// Now add the stop sequence correctly since my previous patch might have been undone or failed.
const target = `  async function handleStopSharing() {
    try {
      const batch = writeBatch(db);
      outboundShares.forEach(share => {
        batch.update(doc(db, 'location_shares', share.id), { status: 'revoked' });
      });
      await batch.commit();
    } catch (err) {
      console.error("Error stopping shares", "error occurred");
    }
  };`;

const replacement = `  async function handleStopSharing() {
    try {
      const batch = writeBatch(db);
      outboundShares.forEach(share => {
        batch.update(doc(db, 'location_shares', share.id), { status: 'revoked' });
      });
      await batch.commit();
      
      stopTracking();
      stopSharing();
      
      if (user?.uid) {
        const locRef = ref(rtdb, 'user_locations/' + user.uid);
        await set(locRef, null);
      }
    } catch (err) {
      console.error("Error stopping shares", err);
    }
  };`;

code = code.replace(target, replacement);

fs.writeFileSync(path, code);
