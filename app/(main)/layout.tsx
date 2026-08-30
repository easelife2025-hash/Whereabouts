import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { LocationTracker } from '@/components/LocationTracker';
import { NotificationManager } from '@/components/NotificationManager';

export default function MainLayout({children}: {children: React.ReactNode}) {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden overflow-y-auto relative scroll-smooth flex flex-col bg-white">
        <NotificationManager />
        <LocationTracker />
        {children}
      </main>
      <BottomNav />
    </>
  );
}
