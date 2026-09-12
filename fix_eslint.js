const fs = require('fs');
let code = fs.readFileSync('components/CookieConsent.tsx', 'utf-8');

code = code.replace(
  `        const parsed = JSON.parse(storedConsent);
        setPreferences(parsed);
      } catch (e) {`,
  `        const parsed = JSON.parse(storedConsent);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreferences(parsed);
      } catch (e) {`
);

fs.writeFileSync('components/CookieConsent.tsx', code);
console.log('done');
