const fs = require('fs');

let content = fs.readFileSync('app/(main)/profile/page.tsx', 'utf8');

// Add storage import
content = content.replace(
  "import { auth, db } from '@/lib/firebase';",
  "import { auth, db, storage } from '@/lib/firebase';\nimport { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';"
);

// Replace handlePhotoUpload
const oldUpload = /const handlePhotoUpload = async[\s\S]*?setIsUploadingPhoto\(false\);\n    }\n  };/;
const newUpload = `const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const base64Img = canvas.toDataURL('image/jpeg', 0.8);
          
          try {
            const storageRef = ref(storage, \`users/\${user.uid}/profile.jpg\`);
            await uploadString(storageRef, base64Img, 'data_url');
            const downloadURL = await getDownloadURL(storageRef);
            
            await updateDoc(doc(db, 'users', user.uid), {
              photoURL: downloadURL
            });
          } catch (storageError) {
             console.error('Error uploading to storage:', storageError);
             alert('Failed to upload photo. Check permissions.');
          }
          
          setIsUploadingPhoto(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user || !profile?.photoURL) return;
    setIsUploadingPhoto(true);
    try {
      if (profile.photoURL.includes('firebasestorage')) {
        const storageRef = ref(storage, \`users/\${user.uid}/profile.jpg\`);
        await deleteObject(storageRef).catch(() => console.log('File might not exist'));
      }
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: null
      });
    } catch (error) {
      console.error('Error removing photo:', error);
    } finally {
      setIsUploadingPhoto(false);
    }
  };
`;
content = content.replace(oldUpload, newUpload);

// Replace button section
const oldButtons = /<button \n            onClick={\(\) => fileInputRef\.current\?\.click\(\)}\n            disabled=\{isUploadingPhoto\}\n            className="absolute bottom-0 right-8 bg-\[\#F9C300\] text-zinc-900 w-8 h-8 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"\n          >\n            <Camera size=\{14\} strokeWidth=\{2\.5\} \/>\n          <\/button>\n          \{\!isEditing && \(\n            <button \n              onClick=\{\(\) => \{\n                setEditName\(profile\?\.name || user\?\.displayName || ''\);\n                setEditBio\(profile\?\.bio || ''\);\n                setIsEditing\(true\);\n              \}\}\n              className="absolute bottom-0 right-0 bg-zinc-900 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"\n            >\n              <Edit2 size=\{14\} strokeWidth=\{2\.5\} \/>\n            <\/button>\n          \)\}/;
const newButtons = `<button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPhoto}
            className="absolute bottom-0 right-8 bg-[#F9C300] text-zinc-900 w-8 h-8 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <Camera size={14} strokeWidth={2.5} />
          </button>
          {profile?.photoURL && !isEditing && (
             <button
                onClick={handleRemovePhoto}
                disabled={isUploadingPhoto}
                className="absolute top-0 right-0 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
             >
                <X size={14} strokeWidth={2.5} />
             </button>
          )}
          {!isEditing && (
            <button 
              onClick={() => {
                setEditName(profile?.name || user?.displayName || '');
                setEditBio(profile?.bio || '');
                setIsEditing(true);
              }}
              className="absolute bottom-0 right-0 bg-zinc-900 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <Edit2 size={14} strokeWidth={2.5} />
            </button>
          )}`;

content = content.replace(oldButtons, newButtons);

fs.writeFileSync('app/(main)/profile/page.tsx', content, 'utf8');
console.log('Profile updated');
