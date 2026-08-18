'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setIsLoading(false);
        return;
      }
      
      // If IndexedDB fails or popup is blocked, fallback to redirect
      if (err.message?.includes('closing/hidden') || err.code === 'auth/internal-error' || err.code === 'auth/popup-blocked') {
        try {
          const { signInWithRedirect } = await import('firebase/auth');
          await signInWithRedirect(auth, new GoogleAuthProvider());
        } catch (redirectErr: any) {
          setError(redirectErr.message || 'Failed to sign up with Google.');
          setIsLoading(false);
        }
      } else {
        setError(err.message || 'Failed to sign up with Google.');
        setIsLoading(false);
      }
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name.trim() });
        const { ref, set } = await import('firebase/database');
        const { rtdb } = await import('@/lib/firebase');
        const userRef = ref(rtdb, 'users/' + userCredential.user.uid);
        await set(userRef, {
          name: name.trim(),
          email: userCredential.user.email,
          imgSeed: Math.floor(Math.random() * 1000).toString(),
          createdAt: Date.now()
        });
      }
    } catch (err: any) {
      let errorMessage = err.message || 'Failed to create account.';
      if (err.code === 'auth/unauthorized-domain') {
        errorMessage = 'This preview domain is not authorized. Please add it to Firebase Console > Authentication > Settings > Authorized domains.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/Password sign-in is not enabled. Please enable it in your Firebase Console.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white relative">
      {/* Header */}
      <div className="flex items-center px-4 h-[68px] shrink-0">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-zinc-100 transition-colors"
        >
          <ArrowLeft size={24} className="text-zinc-900" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-2 pb-safe flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-[32px] font-bold text-zinc-900 tracking-tight mb-2">Create Account</h1>
          <p className="text-[15px] font-medium text-zinc-500 mb-8">Start sharing your location securely.</p>

          <form onSubmit={handleSignUp} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 text-red-600 text-[14px] font-semibold rounded-2xl border border-red-100"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-[12px] font-bold text-zinc-400 mb-2 ml-1 uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-4 text-[16px] font-medium focus:ring-2 focus:ring-[#F9C300] focus:border-[#F9C300] outline-none transition-all placeholder:text-zinc-400 text-zinc-900 disabled:opacity-60"
                placeholder="Full Name"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-zinc-400 mb-2 ml-1 uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-4 text-[16px] font-medium focus:ring-2 focus:ring-[#F9C300] focus:border-[#F9C300] outline-none transition-all placeholder:text-zinc-400 text-zinc-900 disabled:opacity-60"
                placeholder="name@example.com"
                autoCapitalize="none"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-zinc-400 mb-2 ml-1 uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 px-4 text-[16px] font-medium focus:ring-2 focus:ring-[#F9C300] focus:border-[#F9C300] outline-none transition-all placeholder:text-zinc-400 text-zinc-900 disabled:opacity-60"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#F9C300] active:bg-[#E5B200] disabled:opacity-70 text-zinc-900 font-bold text-[17px] py-4 rounded-full flex items-center justify-center transition-colors shadow-sm h-[56px]"
              >
                {isLoading ? <Loader2 size={24} className="animate-spin text-zinc-900" /> : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px bg-zinc-200 flex-1"></div>
            <span className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest">Or</span>
            <div className="h-px bg-zinc-200 flex-1"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white border-2 border-zinc-200 active:bg-zinc-50 disabled:opacity-70 text-zinc-900 font-bold text-[17px] py-4 rounded-full flex items-center justify-center gap-3 transition-colors h-[56px]"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, 39.238998)">
                <path fill="#4285F4" d="M -3.264 5.106 C -3.264 4.378 -3.336 3.65 -3.456 2.922 L -15 2.922 L -15 7.41 L -8.406 7.41 C -8.67 8.898 -9.51 10.146 -10.74 10.974 L -10.74 13.914 L -6.786 13.914 C -4.47 11.754 -3.264 8.718 -3.264 5.106 Z"/>
                <path fill="#34A853" d="M -15 17.076 C -11.688 17.076 -8.91 15.984 -6.786 13.914 L -10.74 10.974 C -11.892 11.754 -13.35 12.216 -15 12.216 C -18.21 12.216 -20.922 10.056 -21.882 7.116 L -25.968 7.116 L -25.968 10.314 C -23.826 14.544 -19.68 17.076 -15 17.076 Z"/>
                <path fill="#FBBC05" d="M -21.882 7.116 C -22.134 6.336 -22.284 5.526 -22.284 4.698 C -22.284 3.87 -22.134 3.06 -21.882 2.28 L -21.882 -0.918 L -25.968 -0.918 C -26.796 0.72 -27.282 2.664 -27.282 4.698 C -27.282 6.732 -26.796 8.676 -25.968 10.314 L -21.882 7.116 Z"/>
                <path fill="#EA4335" d="M -15 -7.68 C -13.188 -7.68 -11.562 -7.05 -10.278 -5.844 L -6.69 -9.432 C -8.91 -11.514 -11.688 -12.54 -15 -12.54 C -19.68 -12.54 -23.826 -10.008 -25.968 -5.778 L -21.882 -2.58 C -20.922 -5.52 -18.21 -7.68 -15 -7.68 Z"/>
              </g>
            </svg>
            Continue with Google
          </button>

          <div className="mt-8 text-center pb-8">
            <p className="text-[15px] font-medium text-zinc-500">
              Already have an account?{' '}
              <Link href="/login" className="text-zinc-900 font-bold active:opacity-60 transition-opacity">
                Log In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
