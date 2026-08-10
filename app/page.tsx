'use client';

import { useEffect, useState } from 'react';
import { Item, supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ItemModal } from '@/components/ItemModal';

type ItemTagMap = {
  [itemId: string]: any[];
};

type Tag = {
  id: number;
  name: string;
  color: string | null;
};

type PlacePhotoMap = {
  [itemId: string]: string | null;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemTags, setItemTags] = useState<ItemTagMap>({});
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagFilter, setSelectedTagFilter] = useState<number | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [session, setSession] = useState<any>(null);
  const [placePhotos, setPlacePhotos] = useState<PlacePhotoMap>({});
  const [selectedItemForModal, setSelectedItemForModal] = useState<Item | null>(null);


  const handleItemUpdated = (updatedItem: Item) => {
    setItems(items.map(i => i.id === updatedItem.id ? updatedItem : i));
    setSelectedItemForModal(updatedItem);
  };

  const handleItemDeleted = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
    setSelectedItemForModal(null);
  };

  useEffect(() => {
    async function fetchItems() {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        // Get auth token
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        setSession(data.session);

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

        // Fetch all tags
        const tagsResponse = await fetch('/api/tags', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (tagsResponse.ok) {
          const tags = await tagsResponse.json();
          setAllTags(tags || []);
        }

        // Fetch tags for each item
        const tagMap: ItemTagMap = {};
        for (const item of itemsData || []) {
          const itemTagsResponse = await fetch(`/api/item-tags?itemId=${item.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (itemTagsResponse.ok) {
            tagMap[item.id] = await itemTagsResponse.json();
          }
        }
        setItemTags(tagMap);

        // Fetch place photos for items with google_place_id
        const photoMap: PlacePhotoMap = {};
        for (const item of itemsData || []) {
          if (item.google_place_id) {
            try {
              const selectedPhotoIndex = item.selected_photo_index || 0;
              const photoResponse = await fetch(
                `/api/place-photo?placeId=${item.google_place_id}&selectedPhotoIndex=${selectedPhotoIndex}`
              );
              if (photoResponse.ok) {
                const photoData = await photoResponse.json();
                photoMap[item.id] = photoData.photoUrl || null;
              }
            } catch (error) {
              console.error(`Error fetching photo for ${item.id}:`, error);
              photoMap[item.id] = null;
            }
          }
        }
        setPlacePhotos(photoMap);
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

  // Filter items by selected tag, type, and search query
  const filteredItems = items.filter(item => {
    // Type filter
    if (selectedTypeFilter !== null) {
      if (item.type !== selectedTypeFilter) return false;
    }

    // Tag filter
    if (selectedTagFilter !== null) {
      const tags = itemTags[item.id] || [];
      const hasTag = tags.some((tag: any) => tag.tag_id === selectedTagFilter);
      if (!hasTag) return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = item.title.toLowerCase().includes(query);
      const matchesAddress = item.address?.toLowerCase().includes(query);
      const matchesNotes = item.notes?.toLowerCase().includes(query);
      return matchesTitle || matchesAddress || matchesNotes;
    }

    return true;
  });

  const getPlaceholderImage = (type: string) => {
    const colors: Record<string, string> = {
      venue: '3b82f6',
      activity: '10b981',
      event: 'a855f7',
      destination: 'f97316',
    };
    const color = colors[type] || colors.venue;
    const emoji = { venue: '🍽️', activity: '🎯', event: '🎭', destination: '✈️' }[type] || '📍';
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect fill='%23${color}' width='600' height='400'/%3E%3Ctext x='50%25' y='50%25' font-size='80' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' fill='white' font-weight='bold'%3E${emoji}%3C/text%3E%3C/svg%3E`;
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
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">📍</span>
            <h1 className="text-xl font-heading font-bold text-foreground">Bucket</h1>
          </div>
          <nav className="flex gap-4 items-center flex-1 justify-center">
            <Link href="/" className="text-sm text-foreground font-medium hover:opacity-75 transition-opacity whitespace-nowrap">
              Discover
            </Link>
            <Link href="/map" className="text-sm text-foreground font-medium hover:opacity-75 transition-opacity whitespace-nowrap">
              Map
            </Link>
            <Link href="/tags" className="text-sm text-foreground font-medium hover:opacity-75 transition-opacity whitespace-nowrap">
              Tags
            </Link>
          </nav>
          {session ? (
            <Link
              href="/add"
              className="px-4 py-2 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors duration-200 flex-shrink-0"
            >
              + Add
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity flex-shrink-0"
            >
              Sign In
            </Link>
          )}
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
          <>
            {/* Filters Section */}
            <div className="mb-12 space-y-6">
              {/* Search */}
              <div>
                <input
                  type="text"
                  placeholder="Search items by title, location, or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Type Filter Tabs */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Type</p>
                <div className="flex flex-wrap gap-2">
                  {['all', 'venue', 'activity', 'event', 'destination'].map((type) => {
                    const typeInfo = typeColors[type] || typeColors.venue;
                    const label = type === 'all' ? 'All Types' : typeInfo.text;
                    const isActive = (type === 'all' && selectedTypeFilter === null) || (type !== 'all' && selectedTypeFilter === type);

                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedTypeFilter(type === 'all' ? null : type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? `${typeInfo.badge} ring-2 ring-offset-2 ring-offset-background ring-current`
                            : 'border border-border text-foreground hover:bg-muted'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tag Filter */}
              {allTags.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedTagFilter(null)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedTagFilter === null
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      All Tags
                    </button>
                    {allTags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => setSelectedTagFilter(tag.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedTagFilter === tag.id
                            ? 'ring-2 ring-offset-2 ring-offset-background ring-current'
                            : 'opacity-75 hover:opacity-100 hover:ring-2 hover:ring-offset-2 hover:ring-offset-background'
                        }`}
                        style={{ backgroundColor: tag.color || '#ccc', color: 'white' }}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  {searchQuery.trim() ? 'No items match your search.' : 'No items match the selected tag.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredItems.map((item) => {
              const itemTypeColors = typeColors[item.type] || typeColors.venue;
              const itemTypeText = itemTypeColors.text;

              return (
                <div key={item.id} className="group cursor-pointer" onClick={() => setSelectedItemForModal(item)}>
                  <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-border/80 transition-all duration-300 h-full flex flex-col">
                    {/* Image */}
                    <div className="h-72 bg-muted overflow-hidden">
                      <img
                        src={placePhotos[item.id] || getPlaceholderImage(item.type)}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

                      {/* Description */}
                      {item.description && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2 leading-relaxed italic">
                          {item.description}
                        </p>
                      )}

                      {/* Notes */}
                      {item.notes && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-grow leading-relaxed">
                          {item.notes}
                        </p>
                      )}

                      {/* Event Date */}
                      {item.event_date && (
                        <p className="text-muted-foreground text-sm mb-4">
                          📅 {new Date(item.event_date).toLocaleDateString()}
                          {item.event_time && ` at ${item.event_time}`}
                        </p>
                      )}

                      {/* Tags */}
                      {(itemTags[item.id] || []).length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(itemTags[item.id] || []).map((itemTag: any) => (
                            <span
                              key={itemTag.tag_id}
                              className="px-2 py-1 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: itemTag.tags?.color || '#ccc' }}
                            >
                              {itemTag.tags?.name}
                            </span>
                          ))}
                        </div>
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
                </div>
              );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Item Modal */}
      <ItemModal
        item={selectedItemForModal}
        isOpen={!!selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
        session={session}
        onItemUpdated={handleItemUpdated}
        onItemDeleted={handleItemDeleted}
      />
    </div>
  );
}
