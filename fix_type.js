const fs = require('fs');

const files = ['app/(main)/people/page.tsx', 'app/(main)/requests/page.tsx', 'app/(main)/sharing/page.tsx', 'components/auth/AuthProvider.tsx'];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace("photoURL?: string;", "photoURL?: string;");
  fs.writeFileSync(f, content);
});
console.log('checked')
