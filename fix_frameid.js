const fs = require('fs');
const path = 'app/(main)/map/page.tsx';
let code = fs.readFileSync(path, 'utf-8');

code = code.replace("let frameId;", "let frameId: number;");
code = code.replace("const animate = (time) => {", "const animate = (time: number) => {");

fs.writeFileSync(path, code);
