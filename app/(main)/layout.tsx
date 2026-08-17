import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function MainLayout({children}: {children: React.ReactNode}) {
  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden overflow-y-auto relative scroll-smooth flex flex-col bg-white">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
