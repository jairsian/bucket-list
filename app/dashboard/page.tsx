'use client';

import { useEffect, useState } from 'react';
import { Item, supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

export default function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        // Get auth token
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        if (!token) {
          setItems([]);
          setLoading(false);
          return;
        }

        const response = await fetch('/api/items', {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch items');
        const itemsData = await response.json();
        setItems(itemsData);
      } catch (error) {
        // Silently handle auth/fetch errors - show empty state
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
        <p className="text-muted-foreground">Loading...</p>
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
    venue: { badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300', text: 'Venue' },
    activity: { badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300', text: 'Activity' },
    event: { badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300', text: 'Event' },
    destination: { badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300', text: 'Destination' },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📍</span>
            <h1 className="text-2xl font-heading font-bold text-foreground">Bucket</h1>
          </div>
          <div className="flex gap-2">
            <Link
              href="/add"
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md font-medium transition-colors duration-200"
            >
              + Add Item
            </Link>
            <Link
              href="/map"
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md font-medium transition-colors duration-200"
            >
              🗺️ Map
            </Link>
            <Link
              href="/tags"
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-md font-medium transition-colors duration-200"
            >
              🏷️ Tags
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-6">🗺️</div>
            <p className="text-lg text-muted-foreground mb-8">No items yet. Start by adding something to your bucket list!</p>
            <Link
              href="/add"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition-opacity duration-200"
            >
              Add Your First Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => {
              const itemTypeColors = typeColors[item.type] || typeColors.venue;
              const itemTypeText = itemTypeColors.text;

              return (
                <Link key={item.id} href={`/items/${item.id}`} className="group">
                  <div className="bg-card rounded-lg overflow-hidden border border-border hover:border-border/80 hover:shadow-sm transition-all duration-300 h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-56 bg-muted overflow-hidden">
                      <Image
                        src={getPlaceholderImage(item.type)}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-grow">
                      {/* Type Badge */}
                      <div className="flex gap-2 mb-3">
                        <span className={`${itemTypeColors.badge} px-2.5 py-1 rounded text-xs font-medium`}>
                          {itemTypeText}
                        </span>
                        {item.visited && (
                          <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2.5 py-1 rounded text-xs font-medium">
                            ✓ Visited
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-heading font-semibold text-foreground mb-2 line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Address */}
                      {item.address && (
                        <div className="flex items-start gap-2 text-muted-foreground mb-3">
                          <span className="text-base mt-0.5">📍</span>
                          <span className="text-sm">{item.address}</span>
                        </div>
                      )}

                      {/* Description/Notes */}
                      {item.notes && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2 flex-grow">
                          {item.notes}
                        </p>
                      )}

                      {/* Event Date */}
                      {item.event_date && (
                        <p className="text-muted-foreground text-sm mb-3">
                          📅 {new Date(item.event_date).toLocaleDateString()}
                          {item.event_time && ` at ${item.event_time}`}
                        </p>
                      )}

                      {/* Maps Link */}
                      <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-200">
                        <span>📍</span>
                        <span>View on Maps</span>
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
