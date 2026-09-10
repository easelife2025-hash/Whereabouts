const fs = require('fs');
const files = [
  'app/legal/privacy/page.tsx',
  'app/legal/terms/page.tsx',
  'app/legal/cookies/page.tsx'
];

files.forEach(path => {
  let code = fs.readFileSync(path, 'utf-8');
  
  // Replace Link with useRouter and button
  code = code.replace(
    `import Link from 'next/link';\nimport { ArrowLeft } from 'lucide-react';`,
    `'use client';\nimport { useRouter } from 'next/navigation';\nimport { ArrowLeft } from 'lucide-react';`
  );

  code = code.replace(
    `<Link href="/settings" className="w-12 h-12 flex items-center justify-center rounded-full active:bg-zinc-100 transition-colors mr-2">
          <ArrowLeft size={24} className="text-zinc-900" />
        </Link>`,
    `<button onClick={() => router.back()} className="w-12 h-12 flex items-center justify-center rounded-full active:bg-zinc-100 transition-colors mr-2">
          <ArrowLeft size={24} className="text-zinc-900" />
        </button>`
  );

  code = code.replace(
    `export default function `,
    `export default function `
  );
  
  // Insert const router = useRouter(); inside the component
  const componentMatch = code.match(/export default function \w+\(\) \{\n/);
  if (componentMatch) {
    code = code.replace(
      componentMatch[0],
      componentMatch[0] + `  const router = useRouter();\n`
    );
  }

  fs.writeFileSync(path, code);
});
console.log('done');
