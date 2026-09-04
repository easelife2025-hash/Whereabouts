const fs = require('fs');
let code = fs.readFileSync('hooks/useBackgroundSharing.ts', 'utf-8');

code = code.replace(
  'const startSharing = useCallback(async (\n    hasAuthorizedSession: boolean,\n    sharedWithNames: string,\n    expirationTime: string,\n    onLocationUpdate: (loc: BackgroundLocationData) => void,\n    onError: (err: any) => void\n  ) => {',
  'const startSharing = useCallback(async (\n    hasAuthorizedSession: boolean,\n    sharedWithNames: string,\n    expirationTime: string,\n    firebaseDbUrl: string,\n    firebaseToken: string,\n    firebaseUid: string,\n    onLocationUpdate: (loc: BackgroundLocationData) => void,\n    onError: (err: any) => void\n  ) => {'
);

code = code.replace(
  'distanceFilter: 10 // meters\n          },',
  'distanceFilter: 10, // meters\n            firebaseDbUrl,\n            firebaseToken,\n            firebaseUid\n          } as any,'
);

fs.writeFileSync('hooks/useBackgroundSharing.ts', code);
console.log('Patched useBackgroundSharing.ts');
