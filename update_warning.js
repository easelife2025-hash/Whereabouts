const fs = require('fs');
const path = 'app/(main)/map/page.tsx';
let code = fs.readFileSync(path, 'utf-8');

if (!code.includes("import { Capacitor } from '@capacitor/core';")) {
  code = code.replace("import { useRouter } from 'next/navigation';", "import { useRouter } from 'next/navigation';\nimport { Capacitor } from '@capacitor/core';");
}

const targetWebWarning = `{outboundShares.length > 0 ? 'You are sharing your location.' : 'Tap crosshair to enable'}`;
const replacementWebWarning = `{outboundShares.length > 0 ? (Capacitor.isNativePlatform() ? 'You are sharing your location.' : 'Keep this tab open to continue sharing.') : 'Tap crosshair to enable'}`;

code = code.replace(targetWebWarning, replacementWebWarning);

const targetWebWarning2 = `                      <p className="text-[13px] font-medium text-zinc-500 mt-0.5 font-mono">
                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </p>`;
const replacementWebWarning2 = `                      <p className="text-[13px] font-medium text-zinc-500 mt-0.5 font-mono">
                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </p>
                      {!Capacitor.isNativePlatform() && (
                        <div className="mt-2 bg-amber-50 text-amber-700 p-2 rounded-lg text-xs font-medium border border-amber-200">
                          <strong>Note:</strong> Since you are in a web browser, this tab must remain open and active to update your location.
                        </div>
                      )}`;

code = code.replace(targetWebWarning2, replacementWebWarning2);

fs.writeFileSync(path, code);
console.log('done');
