const fs = require('fs');
let code = fs.readFileSync('components/CookieConsent.tsx', 'utf-8');

code = code.replace(
  `  useEffect(() => {
    const storedConsent = localStorage.getItem('cookie-consent');`,
  `  useEffect(() => {
    const handleOpenSettings = () => {
      setShowSettings(true);
      const stored = localStorage.getItem('cookie-consent');
      if (stored) {
        try {
          setPreferences(JSON.parse(stored));
        } catch(e) {}
      }
    };
    window.addEventListener('openCookieSettings', handleOpenSettings);

    const storedConsent = localStorage.getItem('cookie-consent');`
);

code = code.replace(
  `  }, []);`,
  `    return () => {
      clearTimeout(timer);
      window.removeEventListener('openCookieSettings', handleOpenSettings);
    };
  }, []);`
);

code = code.replace(
  `  const handleSaveSettings = () => {
    saveConsent(preferences);
  };`,
  `  const handleSaveSettings = () => {
    saveConsent(preferences);
  };

  const handleClearPreferences = () => {
    localStorage.removeItem('cookie-consent');
    setPreferences({ essential: true, analytics: false, marketing: false });
    setShowSettings(false);
    setShowBanner(true);
  };`
);

code = code.replace(
  `              <div className="p-5 border-t border-zinc-100 bg-zinc-50">
                <button
                  onClick={handleSaveSettings}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-[15px] py-4 rounded-xl transition-colors"
                >
                  Save Preferences
                </button>
              </div>`,
  `              <div className="p-5 border-t border-zinc-100 bg-zinc-50 flex flex-col gap-3">
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
              </div>`
);

fs.writeFileSync('components/CookieConsent.tsx', code);
console.log('done');
