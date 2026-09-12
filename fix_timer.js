const fs = require('fs');
let code = fs.readFileSync('components/CookieConsent.tsx', 'utf-8');

const oldUseEffect = `  useEffect(() => {
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
  }, []);`;

const newUseEffect = `  useEffect(() => {
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

    let timer: ReturnType<typeof setTimeout>;
    
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
      timer = setTimeout(() => setShowBanner(true), 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('openCookieSettings', handleOpenSettings);
    };
  }, []);`;

code = code.replace(oldUseEffect, newUseEffect);
fs.writeFileSync('components/CookieConsent.tsx', code);
console.log('done');
