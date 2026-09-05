const fs = require('fs');
const path = 'app/(main)/map/page.tsx';
let code = fs.readFileSync(path, 'utf-8');

const target = `  useEffect(() => {
    if (!user) return;
    const qOut = query(
      collection(db, 'location_shares'),`;

const replacement = `  useEffect(() => {
    if (!outboundShares.length) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const expired = outboundShares.filter(share => {
         if (!share.expiresAt) return false;
         const time = share.expiresAt.toMillis ? share.expiresAt.toMillis() : share.expiresAt;
         return time <= now;
      });
      
      if (expired.length > 0) {
        const batch = writeBatch(db);
        expired.forEach(share => {
          batch.update(doc(db, 'location_shares', share.id), { status: 'expired' });
        });
        batch.commit().catch(console.error);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [outboundShares]);

  useEffect(() => {
    if (!user) return;
    const qOut = query(
      collection(db, 'location_shares'),`;

code = code.replace(target, replacement);

fs.writeFileSync(path, code);
console.log('Patched owner interval');
