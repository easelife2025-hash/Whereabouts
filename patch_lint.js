const fs = require('fs');

const mapPath = 'app/(main)/map/page.tsx';
let mapCode = fs.readFileSync(mapPath, 'utf-8');

// 1. Move handleStopSharing to a function definition before it's used
const stopCodeMatch = mapCode.match(/const handleStopSharing = async \(\) => \{([\s\S]*?)batch\.commit\(\);\s*\}\s*catch[^\}]+\}\s*\};/);
if (stopCodeMatch) {
  const funcCode = stopCodeMatch[0];
  mapCode = mapCode.replace(funcCode, '');
  mapCode = mapCode.replace(
    'const { startSharing, stopSharing, isSharing } = useBackgroundSharing(() => handleStopSharing());',
    funcCode.replace('const handleStopSharing = async () => {', 'async function handleStopSharing() {') + '\n  const { startSharing, stopSharing, isSharing } = useBackgroundSharing(() => handleStopSharing());'
  );
}

fs.writeFileSync(mapPath, mapCode);
console.log('Fixed lint errors');

