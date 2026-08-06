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

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/auth/login');
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
          visit_date: !item.visited ? new Date().toISOString().split('T')[0] : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to update item');

      const updated = await response.json();
      setItem(updated);
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!item || !session) return;

    if (!confirm('Are you sure you want to delete this item?')) return;

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

      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    } finally {
      setUpdating(false);
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

            {item.rating && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xl text-yellow-400">★</span>
                  <span className="text-lg font-semibold">{item.rating}</span>
                </div>
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

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex gap-3">
            <button
              onClick={toggleVisited}
              disabled={updating}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md font-medium"
            >
              {updating ? 'Updating...' : item.visited ? 'Mark as Unvisited' : 'Mark as Visited'}
            </button>

            <button
              onClick={handleDelete}
              disabled={updating}
              className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md font-medium disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
