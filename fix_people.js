const fs = require('fs');
let code = fs.readFileSync('app/(main)/people/page.tsx', 'utf-8');

code = code.replace(
  "import { collection, getDocs, query, where } from 'firebase/firestore';",
  "import { doc, setDoc, collection, getDocs, query, where, serverTimestamp as firestoreServerTimestamp } from 'firebase/firestore';"
);

// We need to fetch blocked users in the useEffect
const fetchUsersStr = `  // Load all users from Firestore
  useEffect(() => {
    if (!user) return;
    
    const fetchUsers = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersList: UserProfile[] = [];
        usersSnap.forEach(doc => {
          if (doc.id !== user.uid) {
            usersList.push({ uid: doc.id, ...doc.data() } as UserProfile);
          }
        });
        setAllUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
        setIsError(true);
      }
    };
    fetchUsers();
  }, [user]);`;

const newFetchUsersStr = `  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());

  // Load all users and blocks from Firestore
  useEffect(() => {
    if (!user) return;
    
    const fetchUsersAndBlocks = async () => {
      try {
        // Fetch blocks where user is blocker
        const blocksQuery1 = query(collection(db, 'blocks'), where('blockerId', '==', user.uid));
        const blocksQuery2 = query(collection(db, 'blocks'), where('blockedId', '==', user.uid));
        
        const [blocks1, blocks2, usersSnap] = await Promise.all([
          getDocs(blocksQuery1),
          getDocs(blocksQuery2),
          getDocs(collection(db, 'users'))
        ]);
        
        const blocked = new Set<string>();
        blocks1.forEach(doc => blocked.add(doc.data().blockedId));
        blocks2.forEach(doc => blocked.add(doc.data().blockerId));
        setBlockedUsers(blocked);

        const usersList: UserProfile[] = [];
        usersSnap.forEach(doc => {
          if (doc.id !== user.uid && !blocked.has(doc.id)) {
            usersList.push({ uid: doc.id, ...doc.data() } as UserProfile);
          }
        });
        setAllUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
        setIsError(true);
      }
    };
    fetchUsersAndBlocks();
  }, [user]);`;

code = code.replace(fetchUsersStr, newFetchUsersStr);

const handleBlockStr = `  const handleBlockUser = async (personUid: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'blocks', \`\${user.uid}_\${personUid}\`), {
        blockerId: user.uid,
        blockedId: personUid,
        createdAt: firestoreServerTimestamp()
      });
      setAllUsers(prev => prev.filter(u => u.uid !== personUid));
      setSelectedPerson(null);
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };`;

// Insert handleBlockUser after handleRevokeShare
code = code.replace(
  "const handleRevokeShare = async (recipientId: string) => {",
  handleBlockStr + "\n\n  const handleRevokeShare = async (recipientId: string) => {"
);

// Insert Block button in selectedPerson drawer
code = code.replace(
  `                    <div>
                      <span className="block text-[15px] font-bold text-red-600">Revoke sharing with {selectedPerson.name.split(' ')[0]}</span>
                      <span className="block text-[13px] font-medium text-red-500/80 mt-0.5">They will no longer see your location</span>
                    </div>
                  </button>`,
  `                    <div>
                      <span className="block text-[15px] font-bold text-red-600">Revoke sharing with {selectedPerson.name.split(' ')[0]}</span>
                      <span className="block text-[13px] font-medium text-red-500/80 mt-0.5">They will no longer see your location</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleBlockUser(selectedPerson.uid)}
                    className="w-full flex items-center gap-3 bg-red-50 p-4 rounded-2xl active:bg-red-100 transition-colors text-left mt-3"
                  >
                    <ShieldAlert size={20} className="text-red-500 shrink-0" strokeWidth={2.5} />
                    <div>
                      <span className="block text-[15px] font-bold text-red-600">Block {selectedPerson.name.split(' ')[0]}</span>
                      <span className="block text-[13px] font-medium text-red-500/80 mt-0.5">They won't be able to request your location</span>
                    </div>
                  </button>`
);

fs.writeFileSync('app/(main)/people/page.tsx', code);
