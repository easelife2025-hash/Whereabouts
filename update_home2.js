const fs = require('fs');
let content = fs.readFileSync('app/(main)/home/page.tsx', 'utf8');

const peopleListBlock = `{recentPeople.length === 0 ? (
          <div className="bg-zinc-50 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 border border-dashed border-zinc-200">
            <UserPlus size={24} className="text-zinc-300" />
            <p className="text-[13px] font-medium text-zinc-500 text-center">You haven&apos;t shared your location with anyone recently.</p>
          </div>
          ) : (
          <div className="bg-zinc-50 rounded-3xl p-2 border border-zinc-100 flex flex-col">
            {recentPeople.map(person => (
              <div key={person.id} className="p-3 flex items-center gap-3 border-b border-zinc-100/50 last:border-0">
                <Image 
                  src={person.photoURL || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(person.name || 'User')}&background=F9C300&color=18181b\`}
                  alt={person.name || 'User'} width={40} height={40} className="rounded-full" referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <h4 className="text-[14px] font-bold text-zinc-900 leading-tight">{person.name}</h4>
                  <p className="text-[12px] font-medium text-zinc-500">Currently sharing</p>
                </div>
                <Link href="/map" className="bg-[#F9C300] text-zinc-900 text-[12px] font-bold px-4 py-1.5 rounded-full shadow-sm">
                  Map
                </Link>
              </div>
            ))}
          </div>
          )}`;

content = content.replace(/<div className="bg-zinc-50 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 border border-dashed border-zinc-200">\s*<UserPlus size=\{24\} className="text-zinc-300" \/>\s*<p className="text-\[13px\] font-medium text-zinc-500 text-center">You haven&apos;t shared your location with anyone recently\.<\/p>\s*<\/div>/, peopleListBlock);

fs.writeFileSync('app/(main)/home/page.tsx', content);
console.log('Done 2');
