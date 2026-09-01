const fs = require('fs');
const glob = require('glob');

const files = glob.sync('{app,components,lib}/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('.catch(console.error)')) {
    content = content.replace(/\.catch\(console\.error\)/g, ".catch(err => console.error(err?.message || 'Error occurred'))");
    changed = true;
  }

  // Also replace console.error(error) and similar calls with safe logging
  // Match console.error(err) or console.error("string", err)
  const regex = /console\.error\(([^)]+)\)/g;
  content = content.replace(regex, (match, p1) => {
    if (p1.includes('err') || p1.includes('error') || p1.includes('e')) {
      // safe wrap
      return `console.error(${p1.split(',').map(arg => arg.trim() === 'error' || arg.trim() === 'err' || arg.trim() === 'e' ? `(${arg}?.message || "Error")` : arg).join(', ')})`;
    }
    return match;
  });

  if (content !== fs.readFileSync(file, 'utf8')) {
    fs.writeFileSync(file, content);
    console.log("Updated", file);
  }
});
