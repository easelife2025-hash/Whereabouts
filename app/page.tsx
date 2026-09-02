'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { MapPin, ShieldCheck, Users, ArrowRight, Map } from 'lucide-react';

import { useAuth } from '@/components/auth/AuthProvider';

export default function OnboardingPage() {
  const [step, setStep] = useState(0); // 0 = Splash, 1-3 = Onboarding
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.push('/home');
      return;
    }
    // Splash screen timer
    if (step === 0) {
      const timer = setTimeout(() => {
        setStep(1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, user, loading, router]);

  const completeOnboarding = () => {
    router.push('/signup');
  };

  const onboardingData = [
    {
      id: 1,
      icon: Map,
      title: "Know Where They Are",
      description: "Keep up with friends and family in real-time on a private, secure map."
    },
    {
      id: 2,
      icon: ShieldCheck,
      title: "Privacy First",
      description: "Share your live location only when you give permission. You are always in control."
    },
    {
      id: 3,
      icon: Users,
      title: "Stay Connected",
      description: "Get notified when loved ones arrive safely at their destinations."
    }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-white relative">
      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div 
            key="splash"
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#F9C300]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6">
              <MapPin size={40} className="text-[#F9C300]" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Whereabouts</h1>
          </motion.div>
        ) : (
          <motion.div 
            key="onboarding"
            className="flex flex-col h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Top Bar */}
            <div className="flex justify-end p-6 h-20 shrink-0">
              {step < 3 && (
                <button 
                  onClick={completeOnboarding}
                  className="text-[15px] font-bold text-zinc-400 active:text-zinc-900 transition-colors px-4 py-2"
                >
                  Skip
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 pb-10">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={step}
                  className="flex flex-col items-center text-center w-full max-w-sm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-32 h-32 bg-zinc-50 rounded-full flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(0,0,0,0.03)] border border-zinc-100">
                    {(() => {
                      const Icon = onboardingData[step - 1].icon;
                      return <Icon size={56} className="text-zinc-900" strokeWidth={1.5} />;
                    })()}
                  </div>
                  
                  <h2 className="text-[28px] leading-tight font-bold text-zinc-900 mb-4 tracking-tight">
                    {onboardingData[step - 1].title}
                  </h2>
                  <p className="text-[15px] font-medium text-zinc-500 leading-relaxed px-2">
                    {onboardingData[step - 1].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Bar */}
            <div className="p-8 pb-safe shrink-0 flex flex-col items-center">
              <div className="flex gap-2.5 mb-10">
                {[1, 2, 3].map((dot) => (
                  <div 
                    key={dot} 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      step === dot ? 'w-8 bg-zinc-900' : 'w-2 bg-zinc-200'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  if (step < 3) setStep(step + 1);
                  else completeOnboarding();
                }}
                className="w-full bg-[#F9C300] active:bg-[#E5B200] text-zinc-900 font-bold text-[17px] py-4 rounded-full flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {step < 3 ? 'Next' : 'Get Started'}
                {step === 3 && <ArrowRight size={20} strokeWidth={2.5} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
