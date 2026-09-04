const fs = require('fs');
let code = fs.readFileSync('app/(main)/map/page.tsx', 'utf-8');

const hookCallRegex = /useEffect\(\(\) => \{\s*if \(\!user\) return;\s*if \(outboundShares\.length > 0\) \{([\s\S]*?)startSharing\(\s*true,\s*shareContext\.names,\s*shareContext\.expiration,\s*\(loc\) => \{/g;

code = code.replace(hookCallRegex, `useEffect(() => {
    if (!user) return;
    
    const startBackground = async () => {
      if (outboundShares.length > 0) {
        const token = await user.getIdToken();
        const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '';
        
        startSharing(
          true,
          shareContext.names,
          shareContext.expiration,
          dbUrl,
          token,
          user.uid,
          (loc) => {`);

// Add closing brace for startBackground and call it
code = code.replace(
  `} else {\n      stopSharing();\n      // Remove location from RTDB when stop sharing\n      const locRef = ref(rtdb, 'user_locations/' + user.uid);\n      set(locRef, null).catch(err => console.error('Failed to remove RTDB location:', err));\n    }\n  }, [outboundShares, user, startSharing, stopSharing, shareContext]);`,
  `} else {\n      stopSharing();\n      // Remove location from RTDB when stop sharing\n      const locRef = ref(rtdb, 'user_locations/' + user.uid);\n      set(locRef, null).catch(err => console.error('Failed to remove RTDB location:', err));\n    }\n    };\n    startBackground();\n  }, [outboundShares, user, startSharing, stopSharing, shareContext]);`
);

fs.writeFileSync('app/(main)/map/page.tsx', code);
console.log('Patched map page for async startSharing');
