const fs = require('fs');
const glob = require('glob');

const files = glob.sync('{app,components,lib}/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Fix the broken console.error injection
  content = content.replace(/console\.error\(([^,]+),\s*\(\(\((err|error|e) as any\)\?\.message \|\| String\(\2\)\)\) \|\| "Error"\)\);/g, "console.error($1, String($2?.message || 'error'));");
  
  content = content.replace(/console\.error\(\(\(\((err|error|e) as any\)\?\.message \|\| String\(\1\)\)\) \|\| "Error"\)\);/g, "console.error(String($1?.message || 'error'));");

  if (content !== fs.readFileSync(file, 'utf8')) {
    fs.writeFileSync(file, content);
    console.log("Fixed syntax in", file);
  }
});
