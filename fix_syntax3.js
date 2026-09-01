const fs = require('fs');
const glob = require('glob');

const files = glob.sync('{app,components,lib}/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Fix the broken `err => console.error(..., 'Error occurred'))` statements
  content = content.replace(/\.catch\(err => console\.error\(\(\(err as any\)\?\.message \|\| String\(err\)\)\) \|\| 'Error occurred'\)\);/g, ".catch(err => console.error(String((err as any)?.message || err || 'Error occurred')));");

  if (content !== fs.readFileSync(file, 'utf8')) {
    fs.writeFileSync(file, content);
    console.log("Fixed syntax 3 in", file);
  }
});
