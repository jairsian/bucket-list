'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bucket List</h1>
          <div className="flex gap-4">
            <Link href="/add" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium">
              + Add Item
            </Link>
            <Link href="/map" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium">
              🗺️ Map
            </Link>
            <Link href="/tags" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium">
              🏷️ Tags
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Welcome to your Bucket List! Start by adding something.</p>
          <Link href="/add" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium">
            Add Your First Item
          </Link>
        </div>
      </main>
    </div>
  );
}
