'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white text-zinc-900">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button
        onClick={() => reset()}
        className="rounded-full bg-[#F9C300] px-6 py-2 font-semibold text-zinc-900 transition-opacity hover:opacity-90 mb-4"
      >
        Try again
      </button>
      <Link href="/home" className="text-zinc-500 hover:underline">
        Go back home
      </Link>
    </div>
  );
}
