const fs = require('fs');
let code = fs.readFileSync('app/legal/cookies/page.tsx', 'utf-8');

const target = `<h2 className="text-[18px] font-bold text-zinc-900">4. Managing Cookies</h2>
          <p>You may prefer to disable cookies on this site and on others. The most effective way to do this is to disable cookies in your browser.</p>
        </div>
      </div>`;

const replacement = `<h2 className="text-[18px] font-bold text-zinc-900">4. Managing Cookies</h2>
          <p>You may prefer to disable cookies on this site and on others. The most effective way to do this is to disable cookies in your browser.</p>
          
          <div className="pt-4">
            <button 
              onClick={() => window.dispatchEvent(new Event('openCookieSettings'))}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Manage Cookie Preferences
            </button>
          </div>
        </div>
      </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('app/legal/cookies/page.tsx', code);
console.log('done');
