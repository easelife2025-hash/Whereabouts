const fs = require('fs');

const authFile = 'components/auth/AuthProvider.tsx';
let authContent = fs.readFileSync(authFile, 'utf8');
authContent = authContent.replace(/ *imgSeed: string;\n?/g, '');
authContent = authContent.replace(/ *imgSeed: [^\n]+\n?/g, '');
fs.writeFileSync(authFile, authContent);

const signupFile = 'app/signup/page.tsx';
let signupContent = fs.readFileSync(signupFile, 'utf8');
signupContent = signupContent.replace(/ *imgSeed: [^\n]+\n?/g, '');
fs.writeFileSync(signupFile, signupContent);
