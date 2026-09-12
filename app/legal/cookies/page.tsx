'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function CookiesPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col h-full bg-white relative pb-20 overflow-y-auto">
      <div className="px-4 pt-6 pb-4 flex items-center sticky top-0 bg-white z-10 border-b border-zinc-50">
        <button onClick={() => router.back()} className="w-12 h-12 flex items-center justify-center rounded-full active:bg-zinc-100 transition-colors mr-2">
          <ArrowLeft size={24} className="text-zinc-900" />
        </button>
        <h1 className="text-[20px] font-bold text-zinc-900 leading-tight">Cookie Policy</h1>
      </div>
      <div className="px-6 py-6 space-y-6">
        <p className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Last Updated: September 9, 2026</p>
        <div className="space-y-4 text-[16px] text-zinc-700 leading-relaxed">
          <h2 className="text-[18px] font-bold text-zinc-900">1. What Are Cookies?</h2>
          <p>Cookies are small text files that are placed on your device to help the site provide a better user experience.</p>
          
          <h2 className="text-[18px] font-bold text-zinc-900">2. How We Use Cookies</h2>
          <p>We use cookies to retain user preferences, manage authentication sessions, and provide anonymized tracking data to third party applications.</p>

          <h2 className="text-[18px] font-bold text-zinc-900">3. Types of Cookies</h2>
          <p>We primarily use essential cookies required for the operation of our service, such as those that keep you logged in securely.</p>

          <h2 className="text-[18px] font-bold text-zinc-900">4. Managing Cookies</h2>
          <p>You may prefer to disable cookies on this site and on others. The most effective way to do this is to disable cookies in your browser.</p>
          
          <div className="pt-4">
            <button 
              onClick={() => window.dispatchEvent(new Event('openCookieSettings'))}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Manage Cookie Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
