'use client';

import { Settings, Shield, CircleHelp, LogOut, ChevronRight, Bell, Info, Edit2, Check, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/components/auth/AuthProvider';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: editName,
        bio: editBio,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditName(profile.name || user?.displayName || '');
      setEditBio(profile.bio || '');
    }
    setIsEditing(false);
  };

  const menuItems = [
    { icon: Settings, label: 'Account Settings', href: '/settings' },
    { icon: Shield, label: 'Privacy & Safety', href: '/privacy' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: CircleHelp, label: 'Help & Support', href: '/help' },
    { icon: Info, label: 'About', href: '/about' },
  ];

  const displayName = profile?.name || user?.displayName || 'User';
  const imgSeed = profile?.imgSeed || 'me';
  const bio = profile?.bio || 'No bio provided.';

  return (
    <div className="flex flex-col h-full bg-white relative pb-20 overflow-y-auto">
      <div className="px-6 py-8 flex flex-col items-center">
        <div className="relative mb-5">
          <Image 
            src={`https://picsum.photos/seed/${imgSeed}/200`} 
            alt={displayName} 
            width={104} 
            height={104} 
            className="rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
          {!isEditing && (
            <button 
              onClick={() => {
                setEditName(profile?.name || user?.displayName || '');
                setEditBio(profile?.bio || '');
                setIsEditing(true);
              }}
              className="absolute bottom-0 right-0 bg-[#F9C300] text-zinc-900 w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            >
              <Edit2 size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div className="w-full flex flex-col items-center gap-3">
            <input 
              type="text" 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Your Name"
              className="w-full text-center text-[20px] font-bold text-zinc-900 bg-zinc-50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#F9C300]"
              disabled={isSaving}
            />
            <textarea 
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Write a short bio..."
              className="w-full text-center text-[14px] text-zinc-600 bg-zinc-50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#F9C300] resize-none h-20"
              disabled={isSaving}
            />
            <div className="flex items-center gap-3 mt-2">
              <button 
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 text-zinc-600 font-semibold active:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                <X size={16} /> Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F9C300] text-zinc-900 font-semibold active:bg-yellow-400 transition-colors disabled:opacity-50"
              >
                <Check size={16} /> {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-[24px] font-bold text-zinc-900 tracking-tight leading-none text-center">{displayName}</h2>
            <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 mt-2 text-center">
              {profile?.email || user?.email}
            </div>
            {profile?.bio && (
              <p className="mt-4 text-center text-[14px] text-zinc-600 px-4">
                {bio}
              </p>
            )}
          </>
        )}
        
        <div className="flex gap-4 mt-8 w-full">
          <Link href="/people" className="flex-1 rounded-3xl bg-yellow-50 p-4 text-center active:bg-yellow-100 transition-colors">
            <div className="text-[24px] font-bold text-zinc-900 leading-none mb-1.5">-</div>
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">People</div>
          </Link>
          <Link href="/sharing" className="flex-1 rounded-3xl bg-yellow-50 p-4 text-center active:bg-yellow-100 transition-colors">
            <div className="text-[24px] font-bold text-zinc-900 leading-none mb-1.5">-</div>
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Sharing</div>
          </Link>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link 
                key={index}
                href={item.href}
                className="w-full flex items-center justify-between py-4 group active:opacity-60 transition-opacity"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-[#F9C300] group-hover:bg-yellow-100 transition-colors">
                    <Icon size={18} strokeWidth={2.5} />
                  </div>
                  <span className="text-[16px] font-bold text-zinc-900">{item.label}</span>
                </div>
                <ChevronRight size={20} className="text-zinc-300 group-hover:text-zinc-900 transition-colors" />
              </Link>
            );
          })}
        </div>

        <button onClick={handleSignOut} className="w-full flex items-center gap-4 py-4 mt-4 group active:opacity-60 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-[#F9C300] transition-colors">
            <LogOut size={18} strokeWidth={2.5} />
          </div>
          <span className="text-[16px] font-bold text-[#F9C300] transition-colors">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
