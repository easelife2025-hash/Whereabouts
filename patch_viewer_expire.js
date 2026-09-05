const fs = require('fs');
const path = 'app/(main)/map/page.tsx';
let code = fs.readFileSync(path, 'utf-8');

// Modify MarkerData to include expiresAt
code = code.replace(
  'type MarkerData = { uid: string; name: string; lat: number; lng: number; timestamp: number; };',
  'type MarkerData = { uid: string; name: string; lat: number; lng: number; timestamp: number; expiresAt: number | null; };'
);

// In the onSnapshot listener, we need to associate the expiresAt with the marker
const targetListener = `      const authorizedIds = snapshot.docs.map(doc => doc.data().recipientId);
      
      if (authorizedIds.length === 0) {`;

const replacementListener = `      const authorizedShares = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          recipientId: data.recipientId,
          expiresAt: data.expiresAt ? (data.expiresAt.toMillis ? data.expiresAt.toMillis() : data.expiresAt) : null
        };
      });
      const authorizedIds = authorizedShares.map(s => s.recipientId);
      
      if (authorizedIds.length === 0) {`;

code = code.replace(targetListener, replacementListener);

const targetHandleValue = `            newMarkersMap.set(uid, {
              uid,
              name: userData.name,
              lat: data.latitude || data.lat,
              lng: data.longitude || data.lng,
              timestamp: data.timestamp || data.updatedAt
            });`;

const replacementHandleValue = `            const shareInfo = authorizedShares.find(s => s.recipientId === uid);
            newMarkersMap.set(uid, {
              uid,
              name: userData.name,
              lat: data.latitude || data.lat,
              lng: data.longitude || data.lng,
              timestamp: data.timestamp || data.updatedAt,
              expiresAt: shareInfo ? shareInfo.expiresAt : null
            });`;

code = code.replace(targetHandleValue, replacementHandleValue);

fs.writeFileSync(path, code);
console.log('Patched viewer logic');
