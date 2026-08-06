'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bucket List</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}
