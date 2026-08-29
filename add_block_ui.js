const fs = require('fs');
let content = fs.readFileSync('app/(main)/people/page.tsx', 'utf8');

// Add handleBlockUser
const BLOCK_USER = `  const handleBlockUser = async (targetId: string) => {
    if (!user) return;
    const newBlocked = [...blockedUsers, targetId];
    await setDoc(doc(db, 'users', user.uid), { blockedUsers: newBlocked }, { merge: true });
    
    // Also revoke active shares just in case
    try {
      const q1 = query(collection(db, 'location_shares'), where('recipientId', '==', user.uid), where('requesterId', '==', targetId), where('status', '==', 'active'));
      const s1 = await getDocs(q1);
      s1.forEach(async d => await updateDoc(doc(db, 'location_shares', d.id), { status: 'revoked' }));
      
      const q2 = query(collection(db, 'location_shares'), where('recipientId', '==', targetId), where('requesterId', '==', user.uid), where('status', '==', 'active'));
      const s2 = await getDocs(q2);
      s2.forEach(async d => await updateDoc(doc(db, 'location_shares', d.id), { status: 'revoked' }));
    } catch(e) {}
    setSelectedPerson(null);
  };

  const handleUnblockUser = async (targetId: string) => {
    if (!user) return;
    const newBlocked = blockedUsers.filter(id => id !== targetId);
    await setDoc(doc(db, 'users', user.uid), { blockedUsers: newBlocked }, { merge: true });
    setSelectedPerson(null);
  };
`;

content = content.replace("  const handleRevokeShare", BLOCK_USER + "\n  const handleRevokeShare");

// Filter out blocked users from all lists
const FILTER = `  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );`;

const NEW_FILTER = `  const filteredUsers = allUsers.filter(u => 
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
    !blockedUsers.includes(u.uid)
  );`;

content = content.replace(FILTER, NEW_FILTER);

// Add Block button in the profile drawer
const SHIELD_ALERT = `                    <div>
                      <span className="block text-[15px] font-bold text-red-600">Revoke sharing with {selectedPerson.name.split(' ')[0]}</span>
                      <span className="block text-[13px] font-medium text-red-500/80 mt-0.5">They will no longer see your location</span>
                    </div>
                  </button>
                </div>`;

const BLOCK_UI = `                    <div>
                      <span className="block text-[15px] font-bold text-red-600">Revoke sharing with {selectedPerson.name.split(' ')[0]}</span>
                      <span className="block text-[13px] font-medium text-red-500/80 mt-0.5">They will no longer see your location</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleBlockUser(selectedPerson.uid)}
                    className="w-full flex items-center gap-3 bg-red-50/50 p-4 rounded-2xl active:bg-red-50 transition-colors text-left mt-3"
                  >
                    <AlertCircle size={20} className="text-red-500 shrink-0" strokeWidth={2.5} />
                    <div>
                      <span className="block text-[15px] font-bold text-red-600">Block {selectedPerson.name.split(' ')[0]}</span>
                      <span className="block text-[13px] font-medium text-red-500/80 mt-0.5">They won't be able to request or view your location</span>
                    </div>
                  </button>
                </div>`;
                
content = content.replace(SHIELD_ALERT, BLOCK_UI);

fs.writeFileSync('app/(main)/people/page.tsx', content);
