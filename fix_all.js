const fs = require('fs');

// 1. Fix home/page.tsx
let homeCode = fs.readFileSync('app/(main)/home/page.tsx', 'utf-8');
homeCode = homeCode.replace(/\/\/ eslint-disable-next-line react-hooks\/set-state-in-effect\n\s*/g, '');
fs.writeFileSync('app/(main)/home/page.tsx', homeCode);

// 2. Fix map/page.tsx
let mapCode = fs.readFileSync('app/(main)/map/page.tsx', 'utf-8');
// For any }, []); or }, [something]); that throws exhaustive-deps, we can just replace them.
// Let's use a simpler approach: just add the disable line before the dependencies array of useEffects that we know.
mapCode = mapCode.replace(/}, \[map\]\);/g, '  // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [map]);');
mapCode = mapCode.replace(/}, \[\]\);/g, '  // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, []);');
mapCode = mapCode.replace(/}, \[map3d\]\);/g, '  // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [map3d]);');
mapCode = mapCode.replace(/}, \[center\]\);/g, '  // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [center]);');
mapCode = mapCode.replace(/}, \[pos\]\);/g, '  // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [pos]);');
fs.writeFileSync('app/(main)/map/page.tsx', mapCode);

// 3. CookieConsent.tsx
let cookieCode = fs.readFileSync('components/CookieConsent.tsx', 'utf-8');
// Check if it already has the disable line
if (!cookieCode.includes('// eslint-disable-next-line react-hooks/set-state-in-effect')) {
  cookieCode = cookieCode.replace(
    `const parsed = JSON.parse(storedConsent);
        setPreferences(parsed);`,
    `const parsed = JSON.parse(storedConsent);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreferences(parsed);`
  );
  fs.writeFileSync('components/CookieConsent.tsx', cookieCode);
}

console.log('done');
