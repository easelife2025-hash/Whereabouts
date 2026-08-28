const fs = require('fs');
let code = fs.readFileSync('app/(main)/requests/page.tsx', 'utf-8');

code = code.replace(
  "        createdAt: firestoreServerTimestamp()\n      });\n    } catch (error) {}\n    handleDeny();",
  \`        createdAt: firestoreServerTimestamp()
      });
      const updates: any = {};
      updates[\\\`location_requests/\${user.uid}/incoming/\${selectedRequest.id}\\\`] = null;
      updates[\\\`location_requests/\${selectedRequest.id}/outgoing/\${user.uid}\\\`] = null;
      await update(ref(rtdb), updates);
    } catch (error) {}
    handleDeny();\`
);

fs.writeFileSync('app/(main)/requests/page.tsx', code);
