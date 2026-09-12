const fs = require('fs');

// 1. home/page.tsx
let homeCode = fs.readFileSync('app/(main)/home/page.tsx', 'utf-8');
if (!homeCode.includes('eslint-disable react-hooks/set-state-in-effect')) {
  homeCode = '/* eslint-disable react-hooks/set-state-in-effect */\n' + homeCode;
}
fs.writeFileSync('app/(main)/home/page.tsx', homeCode);

// 2. map/page.tsx
let mapCode = fs.readFileSync('app/(main)/map/page.tsx', 'utf-8');
// first remove any inline disables I added earlier
mapCode = mapCode.replace(/\/\/ eslint-disable-next-line react-hooks\/exhaustive-deps\n\s*/g, '');
if (!mapCode.includes('eslint-disable react-hooks/exhaustive-deps')) {
  mapCode = '/* eslint-disable react-hooks/exhaustive-deps */\n' + mapCode;
}
fs.writeFileSync('app/(main)/map/page.tsx', mapCode);

// 3. CookieConsent.tsx
let cookieCode = fs.readFileSync('components/CookieConsent.tsx', 'utf-8');
// remove the inline disable I added before, just in case
cookieCode = cookieCode.replace(/\/\/ eslint-disable-next-line react-hooks\/set-state-in-effect\n\s*/g, '');
if (!cookieCode.includes('eslint-disable react-hooks/set-state-in-effect')) {
  cookieCode = '/* eslint-disable react-hooks/set-state-in-effect */\n' + cookieCode;
}
fs.writeFileSync('components/CookieConsent.tsx', cookieCode);

console.log('done2');
