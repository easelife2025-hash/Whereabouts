import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white text-zinc-900">
      <h2 className="text-2xl font-bold mb-4">404 - Not Found</h2>
      <p className="mb-6">Could not find requested resource</p>
      <Link
        href="/home"
        className="rounded-full bg-[#F9C300] px-6 py-2 font-semibold text-zinc-900 transition-opacity hover:opacity-90"
      >
        Return Home
      </Link>
    </div>
  );
}
