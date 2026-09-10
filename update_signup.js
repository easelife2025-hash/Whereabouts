const fs = require('fs');
const path = 'app/signup/page.tsx';
let code = fs.readFileSync(path, 'utf-8');

const target = `<div className="pt-6">
              <button
                type="submit"`;
const replacement = `<div className="pt-2">
              <p className="text-[12px] text-zinc-500 mb-4 px-1 text-center leading-relaxed">
                By signing up, you agree to our{' '}
                <Link href="/legal/terms" className="text-zinc-900 font-bold underline decoration-zinc-300 underline-offset-2">Terms</Link>,{' '}
                <Link href="/legal/privacy" className="text-zinc-900 font-bold underline decoration-zinc-300 underline-offset-2">Privacy Policy</Link>, and{' '}
                <Link href="/legal/cookies" className="text-zinc-900 font-bold underline decoration-zinc-300 underline-offset-2">Cookie Policy</Link>.
              </p>
              <button
                type="submit"`;

code = code.replace(target, replacement);

fs.writeFileSync(path, code);
console.log('done');
