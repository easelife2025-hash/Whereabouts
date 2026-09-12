/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings2, Cookie, Check } from 'lucide-react';

type CookiePreferences = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
};

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if consent was already given
    const storedConsent = localStorage.getItem('cookie-consent');
    if (storedConsent) {
      try {
        const parsed = JSON.parse(storedConsent);
        setPreferences(parsed);
      } catch (e) {
        setShowBanner(true);
      }
    } else {
      // Small delay to not flash immediately on load
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
    return () => {
      clearTimeout(timer);
      window.removeEventListener('openCookieSettings', handleOpenSettings);
    };
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ essential: true, analytics: true, marketing: true });
  };

  const handleRejectNonEssential = () => {
    saveConsent({ essential: true, analytics: false, marketing: false });
  };

  const handleSaveSettings = () => {
    saveConsent(preferences);
  };

  const handleClearPreferences = () => {
    localStorage.removeItem('cookie-consent');
    setPreferences({ essential: true, analytics: false, marketing: false });
    setShowSettings(false);
    setShowBanner(true);
  };

  if (!showBanner && !showSettings) return null;

  return (
    <>
      <AnimatePresence>
        {showBanner && !showSettings && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-white border-t border-zinc-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-safe"
          >
            <div className="max-w-4xl mx-auto flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center shrink-0">
                  <Cookie size={20} className="text-zinc-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[16px] font-bold text-zinc-900 mb-1">We value your privacy</h3>
                  <p className="text-[13px] font-medium text-zinc-500 leading-relaxed">
                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies. Read our{' '}
                    <Link href="/legal/cookies" className="text-zinc-900 font-bold underline decoration-zinc-300 underline-offset-2">Cookie Policy</Link> for more information.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <button
                  onClick={handleAcceptAll}
                  className="w-full sm:w-auto flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-[14px] py-3 rounded-xl transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={handleRejectNonEssential}
                  className="w-full sm:w-auto flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-[14px] py-3 rounded-xl transition-colors"
                >
                  Reject Non-Essential
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-bold text-[14px] py-3 px-4 rounded-xl transition-colors"
                >
                  <Settings2 size={16} />
                  Settings
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowSettings(false)}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-zinc-100">
                <h2 className="text-[18px] font-bold text-zinc-900">Cookie Preferences</h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-[15px] font-bold text-zinc-900">Strictly Necessary</h4>
                    <p className="text-[13px] text-zinc-500 mt-1 leading-relaxed">These cookies are essential for the app to function securely and cannot be switched off.</p>
                  </div>
                  <div className="text-[12px] font-bold text-zinc-400 bg-zinc-100 px-2 py-1 rounded-md uppercase tracking-wide shrink-0">
                    Always Active
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 pt-4 border-t border-zinc-100">
                  <div>
                    <h4 className="text-[15px] font-bold text-zinc-900">Analytics</h4>
                    <p className="text-[13px] text-zinc-500 mt-1 leading-relaxed">Help us understand how you use the app so we can improve it. All data is anonymized.</p>
                  </div>
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                    className={`w-12 h-7 rounded-full shrink-0 relative transition-colors ${preferences.analytics ? 'bg-green-500' : 'bg-zinc-200'}`}
                  >
                    <div className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${preferences.analytics ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-start justify-between gap-4 pt-4 border-t border-zinc-100">
                  <div>
                    <h4 className="text-[15px] font-bold text-zinc-900">Marketing</h4>
                    <p className="text-[13px] text-zinc-500 mt-1 leading-relaxed">Used to deliver personalized content and track its effectiveness.</p>
                  </div>
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
                    className={`w-12 h-7 rounded-full shrink-0 relative transition-colors ${preferences.marketing ? 'bg-green-500' : 'bg-zinc-200'}`}
                  >
                    <div className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${preferences.marketing ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              <div className="p-5 border-t border-zinc-100 bg-zinc-50 flex flex-col gap-3">
                <button
                  onClick={handleSaveSettings}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-[15px] py-4 rounded-xl transition-colors"
                >
                  Save Preferences
                </button>
                <button
                  onClick={handleClearPreferences}
                  className="w-full bg-white hover:bg-zinc-50 border border-zinc-200 text-red-600 font-bold text-[15px] py-3 rounded-xl transition-colors"
                >
                  Clear Preferences
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
