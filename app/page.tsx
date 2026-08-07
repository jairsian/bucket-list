'use client';

import { useEffect, useState } from 'react';
import { Item } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch('/api/items', {
          signal: controller.signal,
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch items');
        const data = await response.json();
        setItems(data || []);
      } catch (error) {
        console.error('Error fetching items:', error);
        setItems([]);
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  const getPlaceholderImage = (type: string) => {
    const placeholders: Record<string, string> = {
      venue: 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=600&h=400&fit=crop',
      activity: 'https://images.unsplash.com/photo-1527004545514-d3dcc0e43a92?w=600&h=400&fit=crop',
      event: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&h=400&fit=crop',
      destination: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop',
    };
    return placeholders[type] || placeholders.venue;
  };

  const typeColors: Record<string, { badge: string; text: string }> = {
    venue: { badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', text: 'Venue' },
    activity: { badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', text: 'Activity' },
    event: { badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400', text: 'Event' },
    destination: { badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400', text: 'Destination' },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📍</span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bucket</h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/add"
              className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-lg font-medium transition"
            >
              + Add Item
            </Link>
            <Link
              href="/map"
              className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-lg font-medium transition"
            >
              🗺️ Map
            </Link>
            <Link
              href="/tags"
              className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-lg font-medium transition"
            >
              🏷️ Tags
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">No items yet. Start by adding something to your bucket list!</p>
            <Link
              href="/add"
              className="inline-block px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition"
            >
              Add Your First Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {items.map((item) => {
              const itemTypeColors = typeColors[item.type] || typeColors.venue;
              const itemTypeText = itemTypeColors.text;

              return (
                <Link key={item.id} href={`/items/${item.id}`} className="group">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-64 bg-gray-200 dark:bg-slate-800 overflow-hidden">
                      <Image
                        src={getPlaceholderImage(item.type)}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Type Badge */}
                      <div className="flex gap-2 mb-4">
                        <span className={`${itemTypeColors.badge} px-3 py-1 rounded-full text-xs font-medium`}>
                          {itemTypeText}
                        </span>
                        {item.visited && (
                          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                            ✓ Visited
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Address */}
                      {item.address && (
                        <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400 mb-3">
                          <span className="text-lg mt-0.5">📍</span>
                          <span className="text-sm">{item.address}</span>
                        </div>
                      )}

                      {/* Description/Notes */}
                      {item.notes && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                          {item.notes}
                        </p>
                      )}

                      {/* Event Date */}
                      {item.event_date && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                          📅 {new Date(item.event_date).toLocaleDateString()}
                          {item.event_time && ` at ${item.event_time}`}
                        </p>
                      )}

                      {/* Maps Link */}
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm font-medium hover:text-gray-900 dark:hover:text-white transition">
                        <span>📍</span>
                        <span>Maps</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
