const fs = require('fs');
const path = 'app/(main)/settings/page.tsx';
let code = fs.readFileSync(path, 'utf-8');

const target = `import { useRouter } from 'next/navigation';`;
const replacement = `import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, FileText, Cookie, ChevronRight } from 'lucide-react';`;
code = code.replace(target, replacement);

const target2 = `        <div>
          <label className="block text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Security</label>
          <button className="w-full flex items-center gap-4 bg-zinc-50 border border-zinc-100 p-4 rounded-[1.25rem] active:bg-zinc-100 transition-colors">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
              <Lock size={18} className="text-zinc-600" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <div className="text-[16px] font-bold text-zinc-900">Change Password</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}`;

const replacement2 = `        <div>
          <label className="block text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Security</label>
          <button className="w-full flex items-center gap-4 bg-zinc-50 border border-zinc-100 p-4 rounded-[1.25rem] active:bg-zinc-100 transition-colors">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
              <Lock size={18} className="text-zinc-600" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <div className="text-[16px] font-bold text-zinc-900">Change Password</div>
            </div>
          </button>
        </div>

        <div>
          <label className="block text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Legal</label>
          <div className="bg-zinc-50 border border-zinc-100 rounded-[1.25rem] overflow-hidden">
            <Link href="/legal/privacy" className="w-full flex items-center justify-between p-4 active:bg-zinc-100 transition-colors border-b border-zinc-200/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
                  <Shield size={18} className="text-zinc-600" strokeWidth={2.5} />
                </div>
                <div className="text-[16px] font-bold text-zinc-900">Privacy Policy</div>
              </div>
              <ChevronRight size={20} className="text-zinc-400" />
            </Link>
            <Link href="/legal/terms" className="w-full flex items-center justify-between p-4 active:bg-zinc-100 transition-colors border-b border-zinc-200/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-zinc-600" strokeWidth={2.5} />
                </div>
                <div className="text-[16px] font-bold text-zinc-900">Terms & Conditions</div>
              </div>
              <ChevronRight size={20} className="text-zinc-400" />
            </Link>
            <Link href="/legal/cookies" className="w-full flex items-center justify-between p-4 active:bg-zinc-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
                  <Cookie size={18} className="text-zinc-600" strokeWidth={2.5} />
                </div>
                <div className="text-[16px] font-bold text-zinc-900">Cookie Policy</div>
              </div>
              <ChevronRight size={20} className="text-zinc-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}`;

code = code.replace(target2, replacement2);
fs.writeFileSync(path, code);
console.log('done');
