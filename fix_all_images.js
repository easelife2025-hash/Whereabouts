const fs = require('fs');
const glob = require('glob');

const files = glob.sync('{app,components}/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Need to handle profile?.photoURL || `https://api.dicebear.com/9.x/avataaars/svg?seed=${imgSeed}`
  content = content.replace(/`https:\/\/api\.dicebear\.com\/9\.x\/avataaars\/svg\?seed=\$\{imgSeed\}`/g, 
    "`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || user?.displayName || 'User')}&background=F9C300&color=18181b`");
  
  // Need to handle xyz.photoURL || `https://api.dicebear.com/9.x/avataaars/svg?seed=${xyz.imgSeed}`
  content = content.replace(/`https:\/\/api\.dicebear\.com\/9\.x\/avataaars\/svg\?seed=\$\{([^}]+)\.imgSeed\}`/g, 
    "`https://ui-avatars.com/api/?name=${encodeURIComponent($1.name || 'User')}&background=F9C300&color=18181b`");

  fs.writeFileSync(file, content, 'utf8');
});

console.log('Images fixed');
