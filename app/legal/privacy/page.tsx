'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col h-full bg-white relative pb-20 overflow-y-auto">
      <div className="px-4 pt-6 pb-4 flex items-center sticky top-0 bg-white z-10 border-b border-zinc-50">
        <button onClick={() => router.back()} className="w-12 h-12 flex items-center justify-center rounded-full active:bg-zinc-100 transition-colors mr-2">
          <ArrowLeft size={24} className="text-zinc-900" />
        </button>
        <h1 className="text-[20px] font-bold text-zinc-900 leading-tight">Privacy Policy</h1>
      </div>
      <div className="px-6 py-6 space-y-6">
        <p className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Last Updated: September 9, 2026</p>
        <div className="space-y-4 text-[16px] text-zinc-700 leading-relaxed">
          <h2 className="text-[18px] font-bold text-zinc-900">1. Introduction</h2>
          <p>We respect your privacy and are committed to protecting it through our compliance with this policy. This Privacy Policy describes the types of information we may collect from you or that you may provide when you use our application.</p>
          
          <h2 className="text-[18px] font-bold text-zinc-900">2. Information We Collect</h2>
          <p>We collect location data to enable location sharing with your trusted contacts. We also collect basic account information such as your name and email address when you register.</p>

          <h2 className="text-[18px] font-bold text-zinc-900">3. How We Use Your Information</h2>
          <p>We use your information to provide and improve the service, allow you to share your location, and securely authenticate your account.</p>

          <h2 className="text-[18px] font-bold text-zinc-900">4. Sharing Your Information</h2>
          <p>Your location data is only shared with the contacts you explicitly authorize. We do not sell your personal data to third parties.</p>

          <h2 className="text-[18px] font-bold text-zinc-900">5. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us through the app.</p>
        </div>
      </div>
    </div>
  );
}
