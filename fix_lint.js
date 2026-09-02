const fs = require('fs');
let content = fs.readFileSync('app/(main)/map/page.tsx', 'utf8');

// Fix implicitly 'any' type on time and frameId
content = content.replace(/let frameId;/g, 'let frameId: number;');
content = content.replace(/const animate = \(time\) => \{/g, 'const animate = (time: number) => {');

fs.writeFileSync('app/(main)/map/page.tsx', content);
