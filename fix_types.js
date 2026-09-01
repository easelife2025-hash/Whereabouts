const fs = require('fs');
const glob = require('glob');

const files = glob.sync('{app,components,lib}/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Fix the previously injected `err?.message` issues
  content = content.replace(/\(\s*(err|error|e)\?\.message/g, "((($1 as any)?.message || String($1)))");

  // Fix the .catch((err) => console.error(err?.message...
  content = content.replace(/\.catch\((err|error|e) => console\.error\(([^)]+)\)\)/g, ".catch(($1: any) => console.error($1?.message || String($1)))");

  if (content !== fs.readFileSync(file, 'utf8')) {
    fs.writeFileSync(file, content);
    console.log("Fixed types in", file);
  }
});
