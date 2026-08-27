const fs = require('fs');
let code = fs.readFileSync('app/(main)/map/page.tsx', 'utf-8');
code = code.replace('setSelectedUser(prev => {', 'setSelectedUser((prev: any) => {');
fs.writeFileSync('app/(main)/map/page.tsx', code);
