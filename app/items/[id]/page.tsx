'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Item } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { searchPlaces, getPlaceDetails, PlaceSearchResult } from '@/lib/places';
import { TagSelector } from '@/components/TagSelector';

export default function ItemDetail() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [itemTags, setItemTags] = useState<any[]>([]);
  const [editData, setEditData] = useState({
    title: '',
    type: 'venue' as 'event' | 'venue' | 'activity' | 'destination',
    address: '',
    notes: '',
    website_url: '',
    event_date: '',
    event_time: '',
  });

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setTimeout(() => router.push('/auth/login'), 100);
        return;
      }

      setSession(data.session);
      await fetchItem(data.session.access_token);
    }

    init();
  }, [router, itemId]);

  async function fetchItem(token: string) {
    try {
      const { data: item } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (item) {
        setItem(item);

        // Fetch tags for this item
        try {
          const tagsResponse = await fetch(`/api/item-tags?itemId=${item.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (tagsResponse.ok) {
            const tags = await tagsResponse.json();
            setItemTags(tags);
          }
        } catch (error) {
          console.error('Error fetching item tags:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching item:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleVisited() {
    if (!item || !session) return;

    setUpdating(true);
    try {
      const response = await fetch('/api/items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: item.id,
          visited: !item.visited,
          visit_date: !item.visited ? (visitDate || null) : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to update item');

      const updated = await response.json();
      setItem(updated);
      setShowDatePicker(false);
      setVisitDate('');
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    } finally {
      setUpdating(false);
    }
  }

  async function startEditing() {
    if (!item || !session) return;

    setEditData({
      title: item.title,
      type: item.type,
      address: item.address || '',
      notes: item.notes || '',
      website_url: item.website_url || '',
      event_date: item.event_date || '',
      event_time: item.event_time || '',
    });

    // Fetch existing tags for this item
    try {
      const response = await fetch(`/api/item-tags?itemId=${item.id}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const itemTags = await response.json();
        const tagIds = itemTags.map((it: any) => it.tag_id);
        setSelectedTagIds(tagIds);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }

    setIsEditing(true);
  }

  async function handleSave() {
    if (!item || !session) return;

    setUpdating(true);
    try {
      const response = await fetch('/api/items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: item.id,
          title: editData.title,
          type: editData.type,
          address: editData.address || null,
          notes: editData.notes || null,
          website_url: editData.website_url || null,
          event_date: editData.event_date || null,
          event_time: editData.event_time || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to save item');

      const updated = await response.json();

      // Fetch current tags for this item
      const tagsResponse = await fetch(`/api/item-tags?itemId=${item.id}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const currentItemTags = tagsResponse.ok ? await tagsResponse.json() : [];
      const currentTagIds = currentItemTags.map((it: any) => it.tag_id);

      // Remove tags that are no longer selected
      for (const tagId of currentTagIds) {
        if (!selectedTagIds.includes(tagId)) {
          await fetch('/api/item-tags', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              itemId: item.id,
              tagId,
            }),
          });
        }
      }

      // Add newly selected tags
      for (const tagId of selectedTagIds) {
        if (!currentTagIds.includes(tagId)) {
          await fetch('/api/item-tags', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              itemId: item.id,
              tagId,
            }),
          });
        }
      }

      setItem(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save changes');
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!item || !session) return;

    setUpdating(true);
    try {
      const response = await fetch('/api/items', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: item.id }),
      });

      if (!response.ok) throw new Error('Failed to delete item');

      setTimeout(() => router.push('/'), 100);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    } finally {
      setUpdating(false);
    }
  }

  async function handleExportCalendar() {
    if (!item || !session) return;

    try {
      const response = await fetch(`/api/items/${item.id}/calendar`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to export calendar');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting calendar:', error);
      alert('Failed to export calendar');
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const results = await searchPlaces(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Failed to search places');
    } finally {
      setSearching(false);
    }
  }

  function selectPlace(place: PlaceSearchResult) {
    setEditData({
      ...editData,
      title: place.name,
      address: place.formattedAddress,
      website_url: place.website || editData.website_url,
    });
    setSearchResults([]);
    setSearchQuery('');
  }

  const getPlaceholderImage = (type: string) => {
    const placeholders: Record<string, string> = {
      venue: 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=800&h=400&fit=crop',
      activity: 'https://images.unsplash.com/photo-1527004545514-d3dcc0e43a92?w=800&h=400&fit=crop',
      event: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=400&fit=crop',
      destination: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop',
    };
    return placeholders[type] || placeholders.venue;
  };

  const typeColors: Record<string, { badge: string; text: string }> = {
    venue: { badge: 'bg-blue-100 text-blue-700', text: 'Venue' },
    activity: { badge: 'bg-green-100 text-green-700', text: 'Activity' },
    event: { badge: 'bg-purple-100 text-purple-700', text: 'Event' },
    destination: { badge: 'bg-orange-100 text-orange-700', text: 'Destination' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Item not found</p>
          <Link href="/" className="text-primary hover:opacity-80">
            Back to items
          </Link>
        </div>
      </div>
    );
  }

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
            <Link href="/tags" className="text-foreground font-medium hover:opacity-75 transition-opacity">
              Tags
            </Link>
          </nav>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/" className="text-muted-foreground hover:text-foreground font-medium mb-8 inline-flex items-center gap-2 transition-colors">
          ← Back to discover
        </Link>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Image */}
          <div className="relative h-96 bg-muted overflow-hidden">
            <Image
              src={getPlaceholderImage(item.type)}
              alt={item.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Content */}
          <div className="p-8">
            {isEditing ? (
            <>
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Edit Item</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type *
                  </label>
                  <select
                    id="type"
                    value={editData.type}
                    onChange={(e) => setEditData({ ...editData, type: e.target.value as any })}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="venue">Venue</option>
                    <option value="event">Event</option>
                    <option value="activity">Activity</option>
                    <option value="destination">Destination</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>

                {(editData.type === 'venue' || editData.type === 'activity' || editData.type === 'event') && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="address-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Location
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="address-search"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                          placeholder="Search for a place or enter address"
                        />
                        <button
                          type="button"
                          onClick={handleSearch}
                          disabled={searching}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium"
                        >
                          {searching ? 'Searching...' : 'Search'}
                        </button>
                      </div>

                      {searchResults.length > 0 && (
                        <div className="border border-gray-300 dark:border-gray-600 rounded-md divide-y dark:divide-gray-600 max-h-64 overflow-y-auto mt-2">
                          {searchResults.map((result) => (
                            <button
                              key={result.placeId}
                              type="button"
                              onClick={() => selectPlace(result)}
                              className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                            >
                              <div className="font-medium text-gray-900 dark:text-white">{result.name}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">{result.formattedAddress}</div>
                              {result.rating && <div className="text-sm text-yellow-600 dark:text-yellow-400">★ {result.rating}</div>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {editData.address && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                        <p className="text-sm text-blue-900 dark:text-blue-200">
                          <strong>Location:</strong> {editData.address}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {(editData.type === 'venue' || editData.type === 'activity') && (
                  <div>
                    <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website
                    </label>
                    <input
                      id="website_url"
                      type="url"
                      value={editData.website_url}
                      onChange={(e) => setEditData({ ...editData, website_url: e.target.value })}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>
                )}

                {editData.type === 'event' && (
                  <>
                    <div>
                      <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Event Date *
                      </label>
                      <input
                        id="event_date"
                        type="date"
                        value={editData.event_date}
                        onChange={(e) => setEditData({ ...editData, event_date: e.target.value })}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="event_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Event Time
                      </label>
                      <input
                        id="event_time"
                        type="time"
                        value={editData.event_time}
                        onChange={(e) => setEditData({ ...editData, event_time: e.target.value })}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-md">
                  <TagSelector
                    selectedTagIds={selectedTagIds}
                    onTagsChange={setSelectedTagIds}
                    sessionToken={session?.access_token}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={updating || !editData.title.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={updating}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-6 mb-8">
                {/* Type Badge */}
                <div className="flex gap-2">
                  <span className={`${typeColors[item.type]?.badge || typeColors.venue.badge} px-3 py-1 rounded text-xs font-medium`}>
                    {typeColors[item.type]?.text || 'Item'}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-heading font-bold text-foreground">
                  {item.title}
                </h1>

                {/* Address */}
                {item.address && (
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-1 flex-shrink-0">📍</span>
                    <p className="text-lg text-muted-foreground">{item.address}</p>
                  </div>
                )}

                {/* Description/Notes */}
                {item.notes && (
                  <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {item.notes}
                  </p>
                )}

                {/* Event Date */}
                {item.event_date && (
                  <div className="text-muted-foreground">
                    📅 {new Date(item.event_date).toLocaleDateString()}
                    {item.event_time && ` at ${item.event_time}`}
                  </div>
                )}

                {/* Tags */}
                {itemTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {itemTags.map((itemTag: any) => (
                      <span
                        key={itemTag.tag_id}
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: itemTag.tags?.color || '#ccc' }}
                      >
                        {itemTag.tags?.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  Created on {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>
            </>
            )}

            <div className="border-t border-border pt-8 space-y-4">
            {!item.visited && showDatePicker && (
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-md space-y-3">
                <div>
                  <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Visit Date (optional)
                  </label>
                  <input
                    id="visitDate"
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave blank to mark visited with no date</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleVisited}
                    disabled={updating}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md font-medium"
                  >
                    {updating ? 'Updating...' : 'Confirm Visited'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDatePicker(false);
                      setVisitDate('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-6 items-center">
              {item.google_maps_url && (
                <a
                  href={item.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded font-medium hover:bg-muted transition-colors"
                >
                  <span>↗</span>
                  <span>Open in Google Maps</span>
                </a>
              )}

              {item.website_url && (
                <a
                  href={item.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground font-medium hover:opacity-75 transition-opacity"
                >
                  Website
                </a>
              )}
            </div>

            <div className="flex items-center justify-end gap-4 mt-8">
              <button
                onClick={handleExportCalendar}
                className="text-foreground hover:opacity-75 transition-opacity"
                title="Add to Calendar"
              >
                <span className="text-xl">📅</span>
              </button>

              {!item.visited ? (
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="text-primary hover:opacity-75 transition-opacity"
                  title="Mark as Visited"
                >
                  <span className="text-xl">✓</span>
                </button>
              ) : (
                <button
                  onClick={toggleVisited}
                  disabled={updating}
                  className="text-primary hover:opacity-75 disabled:opacity-50 transition-opacity"
                  title="Mark as Unvisited"
                >
                  <span className="text-xl">↩</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (!isEditing) {
                    startEditing();
                  } else {
                    setIsEditing(false);
                  }
                }}
                className="text-foreground hover:opacity-75 transition-opacity"
                title="Edit"
              >
                <span className="text-xl">✎</span>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={updating}
                className="text-destructive hover:opacity-75 disabled:opacity-50 transition-opacity"
                title="Delete"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>
          </div>

            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-card rounded-lg border border-border shadow-lg p-6 max-w-sm">
                <h3 className="text-lg font-bold text-foreground mb-2">Delete Item?</h3>
                <p className="text-muted-foreground mb-6">
                  Are you sure you want to delete "{item.title}"? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={updating}
                    className="flex-1 px-4 py-2 bg-destructive hover:opacity-90 disabled:opacity-50 text-destructive-foreground rounded-md font-medium"
                  >
                    {updating ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={updating}
                    className="flex-1 px-4 py-2 border border-border text-foreground hover:bg-muted rounded-md font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
            )}
            </div>
          </div>
      </main>
    </div>
  );
}
