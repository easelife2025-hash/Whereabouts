const fs = require('fs');
let content = fs.readFileSync('app/(main)/map/page.tsx', 'utf8');

const oldCode = `          setSelectedUser((prev: any) => {
            if (prev && !newMarkersMap.has(prev.uid)) {
              return null;
            }
            return prev;
          });`;

const newCode = `          setSelectedUser((prev: any) => {
            if (prev && !newMarkersMap.has(prev.uid)) {
              return null;
            }
            if (prev && newMarkersMap.has(prev.uid)) {
              return newMarkersMap.get(prev.uid);
            }
            return prev;
          });`;

content = content.replace(oldCode, newCode);

fs.writeFileSync('app/(main)/map/page.tsx', content);
console.log("Updated app/(main)/map/page.tsx");
