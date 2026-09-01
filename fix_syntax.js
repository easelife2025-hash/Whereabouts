const fs = require('fs');
const glob = require('glob');

const files = glob.sync('{app,components,lib}/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Fix my syntax errors
  content = content.replace(/console\.error\([^;]+\);/g, (match) => {
    // If it's something like console.error('string', (((error as any)... ))
    if (match.includes('as any')) {
      // Just extract the string and the variable, assuming standard format
      let m = match.match(/console\.error\((['"`].+?['"`]),\s*\(\(\([^)]+as any\)\?\.message \|\| String\([^)]+\)\)\) \|\| "Error"\)\);/);
      if (m) {
        return `console.error(${m[1]}, "error occurred");`;
      }
      
      let m2 = match.match(/console\.error\(\(\(\([^)]+as any\)\?\.message \|\| String\([^)]+\)\)\) \|\| "Error"\)\);/);
      if (m2) {
        return `console.error("error occurred");`;
      }
    }
    return match;
  });

  if (content !== fs.readFileSync(file, 'utf8')) {
    fs.writeFileSync(file, content);
    console.log("Fixed syntax in", file);
  }
});
