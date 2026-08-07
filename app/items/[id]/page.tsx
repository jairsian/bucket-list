'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Item } from '@/lib/supabase';
import Link from 'next/link';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Item not found</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← Back to dashboard
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          {isEditing ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Item</h2>
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
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-sm font-medium">
                      {item.type}
                    </span>
                  </p>
                </div>

                {item.visited && (
                  <div className="text-center">
                    <div className="text-3xl text-green-600">✓</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Visited</p>
                    {item.visit_date && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">{new Date(item.visit_date).toLocaleDateString()}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-6 mb-6">
                {item.address && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</h3>
                    <p className="text-gray-900 dark:text-white">{item.address}</p>
                  </div>
                )}

                {item.event_date && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Date</h3>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(item.event_date).toLocaleDateString()}
                      {item.event_time && ` at ${item.event_time}`}
                    </p>
                  </div>
                )}

                {item.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</h3>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{item.notes}</p>
                  </div>
                )}

                {item.google_maps_url && (
                  <div>
                    <a
                      href={item.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View on Google Maps →
                    </a>
                  </div>
                )}

                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Created on {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>
            </>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
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

            <div className="flex gap-3">
              <button
                onClick={startEditing}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
              >
                Edit
              </button>

              {!item.visited ? (
                <>
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
                  >
                    {showDatePicker ? 'Hide Date Picker' : 'Mark as Visited'}
                  </button>
                </>
              ) : (
                <button
                  onClick={toggleVisited}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-md font-medium"
                >
                  {updating ? 'Updating...' : 'Mark as Unvisited'}
                </button>
              )}

              <button
                onClick={handleExportCalendar}
                className="px-4 py-2 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md font-medium disabled:opacity-50"
              >
                📅 Add to Calendar
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={updating}
                className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md font-medium disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>

          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 max-w-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Item?</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete "{item.title}"? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={updating}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md font-medium"
                  >
                    {updating ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={updating}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
