'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Tag = {
  id: number;
  user_id: string;
  name: string;
  color: string | null;
};

const TAG_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A3E4D7',
];

export default function TagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setTimeout(() => router.push('/auth/login'), 100);
        return;
      }

      setSession(data.session);
      await fetchTags(data.session.access_token);
    }

    init();
  }, [router]);

  async function fetchTags(token: string) {
    try {
      const response = await fetch('/api/tags', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch tags');
      const data = await response.json();
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTag() {
    if (!newTagName.trim() || !session) return;

    setCreating(true);
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
        }),
      });

      if (!response.ok) throw new Error('Failed to create tag');

      const newTag = await response.json();
      setTags([...tags, newTag].sort((a, b) => a.name.localeCompare(b.name)));
      setNewTagName('');
      setNewTagColor(TAG_COLORS[0]);
    } catch (error) {
      console.error('Error creating tag:', error);
      alert('Failed to create tag');
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateTag() {
    if (!editName.trim() || editingId === null || !session) return;

    setUpdating(true);
    try {
      const response = await fetch('/api/tags', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id: editingId,
          name: editName.trim(),
          color: editColor,
        }),
      });

      if (!response.ok) throw new Error('Failed to update tag');

      const updated = await response.json();
      setTags(tags.map(t => t.id === editingId ? updated : t).sort((a, b) => a.name.localeCompare(b.name)));
      setEditingId(null);
      setEditName('');
      setEditColor('');
    } catch (error) {
      console.error('Error updating tag:', error);
      alert('Failed to update tag');
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteTag(id: number) {
    if (!session) return;

    setDeleting(id);
    try {
      const response = await fetch('/api/tags', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error('Failed to delete tag');

      setTags(tags.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting tag:', error);
      alert('Failed to delete tag');
    } finally {
      setDeleting(null);
    }
  }

  function startEdit(tag: Tag) {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color || TAG_COLORS[0]);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
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

        <div className="space-y-8">
          {/* Create Tag */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Create Tag</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="tagName" className="block text-sm font-medium text-foreground mb-2">
                  Tag Name *
                </label>
                <input
                  id="tagName"
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g., Favorite, Expensive, Quiet"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="tagColor" className="block text-sm font-medium text-foreground mb-2">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewTagColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        newTagColor === color ? 'border-foreground' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateTag}
                disabled={creating || !newTagName.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {creating ? 'Creating...' : 'Create Tag'}
              </button>
            </div>
          </div>

          {/* Tags List */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
              Tags ({tags.length})
            </h2>

            {tags.length === 0 ? (
              <p className="text-muted-foreground">No tags yet. Create one to get started!</p>
            ) : (
              <div className="space-y-3">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                    {editingId === tag.id ? (
                      <>
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <div className="flex gap-2 flex-wrap">
                            {TAG_COLORS.map((color) => (
                              <button
                                key={color}
                                onClick={() => setEditColor(color)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                  editColor === color ? 'border-foreground' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdateTag}
                            disabled={updating || !editName.trim()}
                            className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            disabled={updating}
                            className="px-3 py-1 border border-border text-foreground rounded text-sm font-medium hover:bg-muted disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="w-6 h-6 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color || TAG_COLORS[0] }}
                        />
                        <span className="flex-1 font-medium text-foreground">{tag.name}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(tag)}
                            className="px-3 py-1 border border-border text-foreground rounded text-sm font-medium hover:bg-muted transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTag(tag.id)}
                            disabled={deleting === tag.id}
                            className="px-3 py-1 border border-border text-destructive rounded text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50 transition-colors"
                          >
                            {deleting === tag.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
