'use client';

import { ArrowLeft, MessageCircle, FileText, ExternalLink, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HelpSupportPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-white relative pb-20">
      <div className="px-4 pt-6 pb-2 flex items-center sticky top-0 bg-white z-10 border-b border-zinc-50">
        <button 
          onClick={() => router.back()} 
          className="w-12 h-12 flex items-center justify-center rounded-full active:bg-zinc-100 transition-colors mr-2"
        >
          <ArrowLeft size={24} className="text-zinc-900" />
        </button>
        <h1 className="text-[20px] font-bold text-zinc-900 leading-tight">Help & Support</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        
        <div>
          <h3 className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Contact Us</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between bg-zinc-50 p-4 rounded-[1.25rem] active:bg-zinc-100 transition-colors border border-zinc-100">
              <div className="flex items-center gap-4">
                <MessageCircle size={20} className="text-zinc-600" strokeWidth={2.5} />
                <div className="text-left">
                  <div className="text-[16px] font-bold text-zinc-900">Chat with Support</div>
                  <div className="text-[13px] font-medium text-zinc-500">Usually replies in 5 mins</div>
                </div>
              </div>
              <ExternalLink size={18} className="text-zinc-300" />
            </button>

            <button className="w-full flex items-center justify-between bg-zinc-50 p-4 rounded-[1.25rem] active:bg-zinc-100 transition-colors border border-zinc-100">
              <div className="flex items-center gap-4">
                <Mail size={20} className="text-zinc-600" strokeWidth={2.5} />
                <div className="text-left">
                  <div className="text-[16px] font-bold text-zinc-900">Email Us</div>
                  <div className="text-[13px] font-medium text-zinc-500">support@example.com</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-[13px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Resources</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between bg-zinc-50 p-4 rounded-[1.25rem] active:bg-zinc-100 transition-colors border border-zinc-100">
              <div className="flex items-center gap-4">
                <FileText size={20} className="text-zinc-600" strokeWidth={2.5} />
                <span className="text-[16px] font-bold text-zinc-900">FAQ</span>
              </div>
              <ExternalLink size={18} className="text-zinc-300" />
            </button>
            <button className="w-full flex items-center justify-between bg-zinc-50 p-4 rounded-[1.25rem] active:bg-zinc-100 transition-colors border border-zinc-100">
              <div className="flex items-center gap-4">
                <FileText size={20} className="text-zinc-600" strokeWidth={2.5} />
                <span className="text-[16px] font-bold text-zinc-900">Safety Center</span>
              </div>
              <ExternalLink size={18} className="text-zinc-300" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
