'use client';

import { useEffect, useState } from 'react';
import { Item, supabase } from '@/lib/supabase';
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
        setItems(itemsData || []);
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
    venue: { badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300', text: 'Venue' },
    activity: { badge: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300', text: 'Activity' },
    event: { badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300', text: 'Event' },
    destination: { badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300', text: 'Destination' },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📍</span>
            <h1 className="text-2xl font-heading font-bold text-foreground">Bucket</h1>
          </div>
          <nav className="flex gap-8 items-center">
            <Link href="/" className="text-foreground font-medium hover:opacity-75 transition-opacity">
              Discover
            </Link>
            <Link href="/map" className="text-foreground font-medium hover:opacity-75 transition-opacity">
              Map
            </Link>
          </nav>
          <Link
            href="/add"
            className="px-4 py-2 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors duration-200"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {items.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-7xl mb-8">🗺️</div>
            <p className="text-2xl font-heading text-foreground mb-4">Start your bucket list</p>
            <p className="text-lg text-muted-foreground mb-12">Add destinations, activities, venues and events you want to experience.</p>
            <Link
              href="/add"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity duration-200"
            >
              Add Your First Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {items.map((item) => {
              const itemTypeColors = typeColors[item.type] || typeColors.venue;
              const itemTypeText = itemTypeColors.text;

              return (
                <Link key={item.id} href={`/items/${item.id}`} className="group">
                  <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-border/80 transition-all duration-300 h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-72 bg-muted overflow-hidden">
                      <Image
                        src={getPlaceholderImage(item.type)}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Type Badge + Tags */}
                      <div className="flex gap-3 items-center mb-4 flex-wrap">
                        <span className={`${itemTypeColors.badge} px-3 py-1 rounded text-xs font-medium`}>
                          {itemTypeText}
                        </span>
                        {item.visited && (
                          <span className="text-green-700 text-xs font-medium">
                            ✓ Visited
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-heading font-semibold text-foreground mb-3 line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Address */}
                      {item.address && (
                        <div className="flex items-start gap-2 text-muted-foreground mb-4">
                          <span className="text-lg mt-0.5 flex-shrink-0">📍</span>
                          <span className="text-sm leading-relaxed">{item.address}</span>
                        </div>
                      )}

                      {/* Description/Notes */}
                      {item.notes && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-grow leading-relaxed">
                          {item.notes.split('\n').filter(line => !line.startsWith('Website:')).join('\n').trim()}
                        </p>
                      )}

                      {/* Event Date */}
                      {item.event_date && (
                        <p className="text-muted-foreground text-sm mb-4">
                          📅 {new Date(item.event_date).toLocaleDateString()}
                          {item.event_time && ` at ${item.event_time}`}
                        </p>
                      )}

                      {/* Maps Link */}
                      {item.google_maps_url && (
                        <a href={item.google_maps_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-2 text-primary hover:opacity-75 text-sm font-medium transition-opacity duration-200 mt-auto pt-4 border-t border-border">
                          <span>📍</span>
                          <span>Maps</span>
                        </a>
                      )}
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
