const fs = require('fs');
let content = fs.readFileSync('app/(main)/home/page.tsx', 'utf8');

const newImports = `import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';`;

content = content.replace(/import \{ useState, useEffect \} from 'react';/, `import { useState, useEffect } from 'react';\n${newImports}`);

const stateLogic = `  const [activeShares, setActiveShares] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [recentPeople, setRecentPeople] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    // 1. Pending Requests
    const qReqs = query(collection(db, 'location_requests'), where('recipientId', '==', user.uid), where('status', '==', 'pending'));
    const unsubReqs = onSnapshot(qReqs, async (snap) => {
       const reqs = [];
       for (const d of snap.docs) {
           const data = d.data();
           const uDoc = await getDoc(doc(db, 'users', data.senderId));
           if (uDoc.exists()) {
               reqs.push({ id: d.id, ...data, name: uDoc.data().name, photoURL: uDoc.data().photoURL });
           }
       }
       setPendingRequests(reqs);
    });

    // 2. Active Shares (People I am sharing my location with)
    const qShares = query(collection(db, 'location_shares'), where('recipientId', '==', user.uid), where('status', '==', 'active'));
    const unsubShares = onSnapshot(qShares, async (snap) => {
       const now = new Date();
       const validShares = snap.docs.filter(d => {
           const data = d.data();
           if (data.expiresAt && data.expiresAt.toDate() < now) return false;
           return true;
       });
       setActiveShares(validShares.map(d => ({id: d.id, ...d.data()})));
       
       const people = [];
       for (const shareDoc of validShares) {
           const uid = shareDoc.data().requesterId;
           const uDoc = await getDoc(doc(db, 'users', uid));
           if (uDoc.exists()) {
               people.push({ id: uid, ...uDoc.data(), shareId: shareDoc.id });
           }
       }
       setRecentPeople(people);
    });

    return () => {
       unsubReqs();
       unsubShares();
    }
  }, [user]);`;

content = content.replace(/const displayName = profile\?\.name \|\| user\?\.displayName \|\| 'User';/, `${stateLogic}\n  // Get first name from profile or user\n  const displayName = profile?.name || user?.displayName || 'User';`);

const liveBlock = `<div className="flex-1 bg-yellow-50 rounded-3xl p-4 active:scale-95 transition-transform">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Activity size={16} className="text-[#F9C300]" strokeWidth={3} />
              </div>
              <h3 className="text-[14px] font-bold text-zinc-900">Live</h3>
            </div>
            <p className="text-[13px] font-medium text-zinc-500">{activeShares.length > 0 ? 'Broadcasting' : 'Inactive'}</p>
          </div>`;

content = content.replace(/<div className="flex-1 bg-yellow-50 rounded-3xl p-4 active:scale-95 transition-transform">[\s\S]*?<p className="text-\[13px\] font-medium text-zinc-500">Updating now<\/p>\s*<\/div>/, liveBlock);

const sharingBlock = `<Link href="/sharing" className="flex-1 bg-yellow-50 rounded-3xl p-4 active:scale-95 transition-transform block">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                <ShieldCheck size={16} className="text-[#F9C300]" strokeWidth={3} />
              </div>
              <h3 className="text-[14px] font-bold text-zinc-900">Sharing</h3>
            </div>
            <p className="text-[13px] font-medium text-zinc-500">{activeShares.length} people</p>
          </Link>`;

content = content.replace(/<Link href="\/sharing"[\s\S]*?0 people<\/p>\s*<\/Link>/, sharingBlock);

const requestsHeaderBlock = `<h3 className="text-[14px] font-bold text-zinc-900">Requests</h3>
            <span className="bg-zinc-100 text-zinc-500 text-[11px] font-bold px-2 py-0.5 rounded-full">{pendingRequests.length} New</span>`;

content = content.replace(/<h3 className="text-\[14px\] font-bold text-zinc-900">Requests<\/h3>\s*<span className="bg-zinc-100 text-zinc-500 text-\[11px\] font-bold px-2 py-0.5 rounded-full">0 New<\/span>/, requestsHeaderBlock);

const requestsListBlock = `{pendingRequests.length === 0 ? (
          <div className="bg-zinc-50 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 border border-dashed border-zinc-200">
            <Inbox size={24} className="text-zinc-300" />
            <p className="text-[13px] font-medium text-zinc-500 text-center">No new location requests.</p>
          </div>
          ) : (
          <div className="bg-zinc-50 rounded-3xl p-2 border border-zinc-100 flex flex-col">
            {pendingRequests.map(req => (
              <div key={req.id} className="p-3 flex items-center gap-3 border-b border-zinc-100/50 last:border-0">
                <Image 
                  src={req.photoURL || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(req.name || 'User')}&background=F9C300&color=18181b\`}
                  alt={req.name || 'User'} width={40} height={40} className="rounded-full" referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <h4 className="text-[14px] font-bold text-zinc-900 leading-tight">{req.name}</h4>
                  <p className="text-[12px] font-medium text-zinc-500">Requested location</p>
                </div>
                <Link href="/requests" className="bg-white border border-zinc-200 text-zinc-900 text-[12px] font-bold px-4 py-1.5 rounded-full shadow-sm">
                  View
                </Link>
              </div>
            ))}
          </div>
          )}`;

content = content.replace(/<div className="bg-zinc-50 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 border border-dashed border-zinc-200">\s*<Inbox size=\{24\} className="text-zinc-300" \/>\s*<p className="text-\[13px\] font-medium text-zinc-500 text-center">No new location requests\.<\/p>\s*<\/div>/, requestsListBlock);


const peopleListBlock = `{recentPeople.length === 0 ? (
          <div className="bg-zinc-50 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 border border-dashed border-zinc-200">
            <UserPlus size={24} className="text-zinc-300" />
            <p className="text-[13px] font-medium text-zinc-500 text-center">You haven't shared your location with anyone recently.</p>
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

content = content.replace(/<div className="bg-zinc-50 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 border border-dashed border-zinc-200">\s*<UserPlus size=\{24\} className="text-zinc-300" \/>\s*<p className="text-\[13px\] font-medium text-zinc-500 text-center">You haven&\#39;t shared your location with anyone recently\.<\/p>\s*<\/div>/, peopleListBlock);

fs.writeFileSync('app/(main)/home/page.tsx', content);
console.log('Done');
