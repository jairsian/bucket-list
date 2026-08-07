'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Item } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

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
  const [editData, setEditData] = useState({
    title: '',
    address: '',
    notes: '',
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

  function startEditing() {
    if (!item) return;
    setEditData({
      title: item.title,
      address: item.address || '',
      notes: item.notes || '',
      event_date: item.event_date || '',
      event_time: item.event_time || '',
    });
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
          address: editData.address || null,
          notes: editData.notes || null,
          event_date: editData.event_date || null,
          event_time: editData.event_time || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to save item');

      const updated = await response.json();
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

                {(item.type === 'venue' || item.type === 'activity' || item.type === 'event') && (
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                )}

                {item.type === 'event' && (
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
                    {item.notes.split('\n').filter(line => !line.startsWith('Website:')).join('\n').trim()}
                  </p>
                )}

                {/* Event Date */}
                {item.event_date && (
                  <div className="text-muted-foreground">
                    📅 {new Date(item.event_date).toLocaleDateString()}
                    {item.event_time && ` at ${item.event_time}`}
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
              {(item.google_maps_url || item.address) && (
                <a
                  href={item.google_maps_url || `https://www.google.com/maps/search/${encodeURIComponent(item.address || item.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded font-medium hover:bg-muted transition-colors"
                >
                  <span>↗</span>
                  <span>Open in Google Maps</span>
                </a>
              )}

              {(item.google_maps_url || item.address) && (
                <a
                  href={item.google_maps_url || `https://www.google.com/maps/search/${encodeURIComponent(item.address || item.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground font-medium hover:opacity-75 transition-opacity"
                >
                  Website
                </a>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={handleExportCalendar}
                className="px-6 py-2 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
              >
                📅 Add to Calendar
              </button>

              {!item.visited ? (
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  {showDatePicker ? 'Hide Date Picker' : 'Mark as Visited'}
                </button>
              ) : (
                <button
                  onClick={toggleVisited}
                  disabled={updating}
                  className="px-6 py-2 bg-muted text-foreground rounded-lg font-medium hover:opacity-75 disabled:opacity-50 transition-opacity"
                >
                  {updating ? 'Updating...' : 'Mark as Unvisited'}
                </button>
              )}

              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={updating}
                className="ml-auto px-6 py-2 text-destructive font-medium hover:opacity-75 disabled:opacity-50 transition-opacity"
              >
                Delete
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
