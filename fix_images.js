const fs = require('fs');
const glob = require('glob');

const files = glob.sync('{app,components}/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Need to replace src={`https://picsum.photos/seed/${person.imgSeed}/100`}
  // with src={person.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=F9C300&color=fff`}
  // Wait, different variable names: person, user, selectedPerson, selectedRequest, req, profile
  
  // More generic: src={`https://picsum.photos/seed/${xyz.imgSeed}/...`}
  // becomes src={xyz.photoURL || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(xyz.name || 'User')}`}
  // But wait, what if name is not available?
  // Let's just use dicebear avataaars with imgSeed: src={xyz.photoURL || `https://api.dicebear.com/9.x/avataaars/svg?seed=${xyz.imgSeed}`}
  
  content = content.replace(/src=\{`https:\/\/picsum\.photos\/seed\/\$\{([^}]+)\.imgSeed\}\/\d+`\}/g, 
    "src={$1.photoURL || `https://api.dicebear.com/9.x/avataaars/svg?seed=${$1.imgSeed}`}");
    
  // Handing the imgSeed standalone ones like imgSeed = profile?.imgSeed || 'me';
  content = content.replace(/src=\{`https:\/\/picsum\.photos\/seed\/\$\{imgSeed\}\/\d+`\}/g,
    "src={profile?.photoURL || `https://api.dicebear.com/9.x/avataaars/svg?seed=${imgSeed}`}");
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Images fixed');
