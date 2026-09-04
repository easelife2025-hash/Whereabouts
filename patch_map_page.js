const fs = require('fs');
let code = fs.readFileSync('app/(main)/map/page.tsx', 'utf-8');

// 1. Hook usage
code = code.replace(
  'const { startSharing, stopSharing, isSharing } = useBackgroundSharing();',
  'const { startSharing, stopSharing, isSharing } = useBackgroundSharing(() => handleStopSharing());\n  const [shareContext, setShareContext] = useState({ names: "", expiration: "" });'
);

// 2. Add useEffect to compute shareContext
const computeContextCode = `
  useEffect(() => {
    const fetchContext = async () => {
      if (outboundShares.length === 0) {
        setShareContext({ names: "", expiration: "" });
        return;
      }
      
      const names = [];
      let earliestExpiration = Infinity;

      for (const share of outboundShares) {
        if (share.requesterId) {
          const userDoc = await getDoc(doc(db, 'users', share.requesterId));
          if (userDoc.exists()) {
            names.push(userDoc.data().name);
          }
        }
        if (share.expiresAt) {
          const time = share.expiresAt.toMillis ? share.expiresAt.toMillis() : share.expiresAt;
          if (time < earliestExpiration) {
            earliestExpiration = time;
          }
        }
      }

      const namesStr = names.length > 0 ? names.join(', ') : 'Selected contacts';
      let expirationStr = 'Never';
      if (earliestExpiration !== Infinity) {
        expirationStr = new Date(earliestExpiration).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      setShareContext({ names: namesStr, expiration: expirationStr });
    };
    fetchContext();
  }, [outboundShares]);
`;

code = code.replace(
  'useEffect(() => {\n    if (!user) return;\n    if (outboundShares.length > 0) {',
  computeContextCode + '\n  useEffect(() => {\n    if (!user) return;\n    if (outboundShares.length > 0) {'
);

// 3. Update startSharing call
code = code.replace(
  'startSharing(\n        true,\n        (loc) => {',
  'startSharing(\n        true,\n        shareContext.names,\n        shareContext.expiration,\n        (loc) => {'
);
code = code.replace(
  '}, [outboundShares, user, startSharing, stopSharing]);',
  '}, [outboundShares, user, startSharing, stopSharing, shareContext]);'
);

fs.writeFileSync('app/(main)/map/page.tsx', code);
console.log('Map page patched');
