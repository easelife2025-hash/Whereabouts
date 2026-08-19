'use client';

import { ArrowLeft, User, Mail, Lock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [localName, setLocalName] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Use localName if user has typed something, otherwise fallback to profile name
  const displayValue = localName !== null ? localName : (profile?.name || '');

  const handleNameBlur = async () => {
    if (!user || localName === null || localName === profile?.name || !localName.trim()) {
      setLocalName(null); // Reset if empty or unchanged
      return;
    }
    
    setIsUpdating(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { name: localName.trim() });
      setLocalName(null); // Once updated, profile.name will reflect the change
    } catch (error) {
      console.error('Failed to update name:', error);
      setLocalName(null); // Revert on failure
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative pb-20">
      <div className="px-4 pt-6 pb-4 flex items-center sticky top-0 bg-white z-10 border-b border-zinc-50">
        <button 
          onClick={() => router.back()} 
          className="w-12 h-12 flex items-center justify-center rounded-full active:bg-zinc-100 transition-colors mr-2"
        >
          <ArrowLeft size={24} className="text-zinc-900" />
        </button>
        <h1 className="text-[20px] font-bold text-zinc-900 leading-tight">Account Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        <div>
          <label className="block text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Profile Info</label>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                <User size={20} strokeWidth={2.5} />
              </div>
              <input 
                type="text" 
                value={displayValue}
                onChange={(e) => setLocalName(e.target.value)}
                onBlur={handleNameBlur}
                disabled={isUpdating}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-[1.25rem] py-4 pl-12 pr-12 text-[16px] font-bold text-zinc-900 focus:ring-2 focus:ring-[#F9C300] focus:border-[#F9C300] outline-none transition-all h-[56px] disabled:opacity-70"
              />
              {isUpdating && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
                  <Loader2 size={18} className="animate-spin" />
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                <Mail size={20} strokeWidth={2.5} />
              </div>
              <input 
                type="email" 
                value={profile?.email || user?.email || ''}
                readOnly
                className="w-full bg-zinc-100 border border-zinc-200/50 rounded-[1.25rem] py-4 pl-12 pr-4 text-[16px] font-medium text-zinc-500 outline-none h-[56px] opacity-80"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Security</label>
          <button className="w-full flex items-center gap-4 bg-zinc-50 border border-zinc-100 p-4 rounded-[1.25rem] active:bg-zinc-100 transition-colors">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
              <Lock size={18} className="text-zinc-600" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <div className="text-[16px] font-bold text-zinc-900">Change Password</div>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
