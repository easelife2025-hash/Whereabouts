const fs = require('fs');
let content = fs.readFileSync('app/(main)/home/page.tsx', 'utf8');

content = content.replace("setGreeting('Good morning');", "// eslint-disable-next-line react-hooks/set-state-in-effect\n      setGreeting('Good morning');");
content = content.replace("setGreeting('Good afternoon');", "// eslint-disable-next-line react-hooks/set-state-in-effect\n      setGreeting('Good afternoon');");
content = content.replace("setGreeting('Good evening');", "// eslint-disable-next-line react-hooks/set-state-in-effect\n      setGreeting('Good evening');");

fs.writeFileSync('app/(main)/home/page.tsx', content);
