'use client';

import Link from 'next/link';

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bucket List</h1>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium">
              + Add Item
            </button>
            <button className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Sample Item Cards */}
          {[
            {
              id: '1',
              title: 'Visit the Eiffel Tower',
              type: 'destination',
              address: 'Paris, France',
              rating: 4.8,
              visited: true,
            },
            {
              id: '2',
              title: 'Try authentic ramen in Tokyo',
              type: 'venue',
              address: 'Tokyo, Japan',
              rating: 4.6,
              visited: false,
            },
            {
              id: '3',
              title: 'Learn to surf in Bali',
              type: 'activity',
              address: 'Bali, Indonesia',
              rating: null,
              visited: false,
            },
            {
              id: '4',
              title: 'Concert at Madison Square Garden',
              type: 'event',
              address: 'New York, NY',
              rating: 4.9,
              visited: true,
            },
            {
              id: '5',
              title: 'Michelin-star dining',
              type: 'venue',
              address: 'San Francisco, CA',
              rating: 4.7,
              visited: false,
            },
            {
              id: '6',
              title: 'Hiking in Yosemite',
              type: 'activity',
              address: 'Yosemite, CA',
              rating: 5.0,
              visited: true,
            },
          ].map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-md transition p-4 cursor-pointer h-full"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {item.title}
                </h3>
                {item.visited && (
                  <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{item.type}</p>
              {item.address && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                  {item.address}
                </p>
              )}
              {item.rating && (
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-sm font-medium">{item.rating}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Footer note */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>This is a preview of the dashboard. Items are sample data showing the UI.</p>
        <p className="mt-2">
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-700">
            Go to login
          </Link>
          {' '} to set up with real data.
        </p>
      </div>
    </div>
  );
}
