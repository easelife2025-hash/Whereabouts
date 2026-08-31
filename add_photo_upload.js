const fs = require('fs');

let content = fs.readFileSync('app/(main)/profile/page.tsx', 'utf8');

const importsToAdd = "import { Camera } from 'lucide-react';\nimport { useRef } from 'react';\n";
content = content.replace("import { useState, useEffect } from 'react';", importsToAdd + "import { useState, useEffect } from 'react';");

const fileInputRefStr = `
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          
          await updateDoc(doc(db, 'users', user.uid), {
            photoURL: base64Img
          });
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
`;

content = content.replace("const [isSaving, setIsSaving] = useState(false);", "const [isSaving, setIsSaving] = useState(false);" + fileInputRefStr);

const imageContainerStr = `
        <div className="relative mb-5 group">
          <div className="relative w-[104px] h-[104px] rounded-full overflow-hidden border-4 border-white shadow-md bg-zinc-100">
            <Image 
              src={profile?.photoURL || \`https://api.dicebear.com/9.x/avataaars/svg?seed=\${imgSeed}\`} 
              alt={displayName} 
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
            {isUploadingPhoto && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <input 
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPhoto}
            className="absolute bottom-0 right-8 bg-[#F9C300] text-zinc-900 w-8 h-8 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <Camera size={14} strokeWidth={2.5} />
          </button>
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
          )}
        </div>
`;

// Replace the old Image container
content = content.replace(/<div className="relative mb-5">[\s\S]*?<\/div>/, imageContainerStr);

fs.writeFileSync('app/(main)/profile/page.tsx', content, 'utf8');
