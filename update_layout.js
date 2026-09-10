const fs = require('fs');
const path = 'app/layout.tsx';
let code = fs.readFileSync(path, 'utf-8');

code = code.replace(
  `import { AuthProvider } from '@/components/auth/AuthProvider';`,
  `import { AuthProvider } from '@/components/auth/AuthProvider';\nimport CookieConsent from '@/components/CookieConsent';`
);

code = code.replace(
  `        </AuthProvider>
      </body>`,
  `        </AuthProvider>\n        <CookieConsent />\n      </body>`
);

fs.writeFileSync(path, code);
console.log('done');
