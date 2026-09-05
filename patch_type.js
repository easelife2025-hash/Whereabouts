const fs = require('fs');
const path = 'app/(main)/map/page.tsx';
let code = fs.readFileSync(path, 'utf-8');

code = code.replace(
  'type OutboundShare = { id: string };',
  'type OutboundShare = { id: string; requesterId?: string; expiresAt?: any; [key: string]: any; };'
);

fs.writeFileSync(path, code);
