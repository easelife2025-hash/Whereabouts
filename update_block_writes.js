const fs = require('fs');

function updateFile(file) {
  let code = fs.readFileSync(file, 'utf-8');
  
  if (code.includes('await update(ref(rtdb), {') && code.includes('[`location_requests/${user.uid}/incoming/${')) {
    code = code.replace(
      /await update\(ref\(rtdb\), \{([^}]+)\}\);/g,
      (match, group) => {
        if (group.includes('location_requests')) {
          const varName = file.includes('people') ? 'personUid' : 'selectedRequest.id';
          return `await update(ref(rtdb), {${group}, [\`blocks/\${user.uid}/\${${varName}}\`]: true});`;
        }
        return match;
      }
    );
    fs.writeFileSync(file, code);
  }
}

updateFile('app/(main)/people/page.tsx');
updateFile('app/(main)/requests/page.tsx');
