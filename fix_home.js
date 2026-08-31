const fs = require('fs');
let content = fs.readFileSync('app/(main)/home/page.tsx', 'utf8');

const newCode = `
  const { user, profile } = useAuth();
  const [greeting, setGreeting] = useState('Hello');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning');
    } else if (hour >= 12 && hour < 16) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);
`;

content = content.replace("import { useAuth } from '@/components/auth/AuthProvider';", "import { useAuth } from '@/components/auth/AuthProvider';\nimport { useState, useEffect } from 'react';");
content = content.replace(/const { user, profile } = useAuth\(\);[\s\S]*?let greeting = 'Good morning';[\s\S]*?greeting = 'Good evening';\n  }/, newCode);
content = content.replace("<h2 suppressHydrationWarning", "<h2");

fs.writeFileSync('app/(main)/home/page.tsx', content);
