'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DriverRoot() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/driver/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#ff8564] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
