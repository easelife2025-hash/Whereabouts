const fs = require('fs');
let code = fs.readFileSync('app/(main)/people/page.tsx', 'utf-8');

const fetchUsersStr = `  // Load all users from Firestore
  useEffect(() => {
    if (!user) return;
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const usersList: UserProfile[] = [];
        snapshot.forEach(doc => {
          if (doc.id !== user.uid) {
            usersList.push({ uid: doc.id, ...doc.data() } as UserProfile);
          }
        });
        setAllUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
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
        const blocksQuery1 = query(collection(db, 'blocks'), where('blockerId', '==', user.uid));
        const blocksQuery2 = query(collection(db, 'blocks'), where('blockedId', '==', user.uid));
        
        const [blocks1, blocks2, snapshot] = await Promise.all([
          getDocs(blocksQuery1),
          getDocs(blocksQuery2),
          getDocs(collection(db, 'users'))
        ]);
        
        const blocked = new Set<string>();
        blocks1.forEach(doc => blocked.add(doc.data().blockedId));
        blocks2.forEach(doc => blocked.add(doc.data().blockerId));
        setBlockedUsers(blocked);

        const usersList: UserProfile[] = [];
        snapshot.forEach(doc => {
          if (doc.id !== user.uid && !blocked.has(doc.id)) {
            usersList.push({ uid: doc.id, ...doc.data() } as UserProfile);
          }
        });
        setAllUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
        setIsError(true);
      }
    };
    fetchUsersAndBlocks();
  }, [user]);`;

if (code.includes(fetchUsersStr)) {
  code = code.replace(fetchUsersStr, newFetchUsersStr);
} else {
  console.log("Could not find fetchUsers");
}

fs.writeFileSync('app/(main)/people/page.tsx', code);
