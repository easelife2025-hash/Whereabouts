const fs = require('fs');
let code = fs.readFileSync('app/(main)/requests/page.tsx', 'utf-8');

code = code.replace(
  "import { collection, query, where, getDocs, addDoc, serverTimestamp as firestoreServerTimestamp } from 'firebase/firestore';",
  "import { doc, setDoc, collection, query, where, getDocs, addDoc, serverTimestamp as firestoreServerTimestamp } from 'firebase/firestore';"
);

code = code.replace(
  "const handleDeny = async () => {",
  `const handleBlock = async () => {
    if (!selectedRequest || !user) return;
    try {
      await setDoc(doc(db, 'blocks', \`\${user.uid}_\${selectedRequest.id}\`), {
        blockerId: user.uid,
        blockedId: selectedRequest.id,
        createdAt: firestoreServerTimestamp()
      });
    } catch (error) {}
    handleDeny();
  };

  const handleDeny = async () => {`
);

code = code.replace(
  `<button 
                          onClick={handleDeny}
                          className="w-full bg-white text-[#F9C300] font-bold text-[17px] py-4 rounded-full border border-zinc-200 active:bg-zinc-50 transition-colors"
                        >
                          Deny
                        </button>`,
  `<button 
                          onClick={handleDeny}
                          className="w-full bg-white text-[#F9C300] font-bold text-[17px] py-4 rounded-full border border-zinc-200 active:bg-zinc-50 transition-colors"
                        >
                          Deny
                        </button>
                        <button 
                          onClick={handleBlock}
                          className="w-full bg-red-50 text-red-600 font-bold text-[17px] py-4 rounded-full active:bg-red-100 transition-colors"
                        >
                          Block User
                        </button>`
);

fs.writeFileSync('app/(main)/requests/page.tsx', code);
