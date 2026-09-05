const fs = require('fs');
const path = 'hooks/useBackgroundSharing.ts';
let code = fs.readFileSync(path, 'utf-8');

code = code.replace(
  'listener.then(l => l.remove());',
  'listener.then((l: any) => l.remove());'
);

fs.writeFileSync(path, code);
