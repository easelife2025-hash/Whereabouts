'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col h-full bg-white relative pb-20 overflow-y-auto">
      <div className="px-4 pt-6 pb-4 flex items-center sticky top-0 bg-white z-10 border-b border-zinc-50">
        <button onClick={() => router.back()} className="w-12 h-12 flex items-center justify-center rounded-full active:bg-zinc-100 transition-colors mr-2">
          <ArrowLeft size={24} className="text-zinc-900" />
        </button>
        <h1 className="text-[20px] font-bold text-zinc-900 leading-tight">Terms & Conditions</h1>
      </div>
      <div className="px-6 py-6 space-y-6">
        <p className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Last Updated: September 9, 2026</p>
        <div className="space-y-4 text-[16px] text-zinc-700 leading-relaxed">
          <h2 className="text-[18px] font-bold text-zinc-900">1. Acceptance of Terms</h2>
          <p>By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.</p>
          
          <h2 className="text-[18px] font-bold text-zinc-900">2. Description of Service</h2>
          <p>We provide a real-time location sharing service. You are responsible for ensuring that your use of the service complies with all laws and regulations in your jurisdiction.</p>

          <h2 className="text-[18px] font-bold text-zinc-900">3. User Conduct</h2>
          <p>You agree not to use the service for any unlawful purpose or in any way that interrupts, damages, or impairs the service.</p>

          <h2 className="text-[18px] font-bold text-zinc-900">4. Account Security</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>

          <h2 className="text-[18px] font-bold text-zinc-900">5. Termination</h2>
          <p>We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever.</p>
        </div>
      </div>
    </div>
  );
}
