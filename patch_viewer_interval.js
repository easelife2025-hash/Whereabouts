const fs = require('fs');
const path = 'app/(main)/map/page.tsx';
let code = fs.readFileSync(path, 'utf-8');

const target = `  useEffect(() => {
    if (!user) return;
    
    // 1. Get the list of people sharing with ME`;

const replacement = `  useEffect(() => {
    const interval = setInterval(() => {
      setAuthorizedMarkers(prev => {
        const now = Date.now();
        const next = prev.filter(m => !m.expiresAt || m.expiresAt > now);
        if (next.length !== prev.length) {
          return next;
        }
        return prev;
      });
      setSelectedUser(prev => {
        if (prev && prev.expiresAt && prev.expiresAt <= Date.now()) return null;
        return prev;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // 1. Get the list of people sharing with ME`;

code = code.replace(target, replacement);

fs.writeFileSync(path, code);
console.log('Patched viewer interval');
