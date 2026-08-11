'use client';

import { useState, useEffect } from 'react';
import { Item, supabase } from '@/lib/supabase';
import { PhotoSelector } from './PhotoSelector';
import { DatePicker } from './DatePicker';
import { searchPlaces, getPlaceDetails, PlaceSearchResult } from '@/lib/places';

interface ItemModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  session: any;
  onItemUpdated?: (item: Item) => void;
  onItemDeleted?: (itemId: string) => void;
}

export function ItemModal({ item, isOpen, onClose, session, onItemUpdated, onItemDeleted }: ItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);
  const [showCalendarDatePicker, setShowCalendarDatePicker] = useState(false);
  const [calendarDate, setCalendarDate] = useState('');
  const [itemPhotoUrl, setItemPhotoUrl] = useState<string | null>(null);
  const [itemTags, setItemTags] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    type: 'venue' as 'event' | 'venue' | 'activity' | 'destination',
    address: '',
    notes: '',
    description: '',
    website_url: '',
    instagram_url: '',
    event_date: '',
    event_time: '',
    google_place_id: '',
  });

  useEffect(() => {
    if (item && isOpen) {
      fetchItemDetails();
    }
  }, [item, isOpen]);

  async function fetchItemDetails() {
    if (!item || !session) return;

    try {
      // Fetch photo prioritizing source: website → instagram → google places
      let photoUrl: string | null = null;

      // Priority 1: Website image (if shared from website)
      if (item.website_url) {
        try {
          const websiteResponse = await fetch(
            `/api/website-image?url=${encodeURIComponent(item.website_url)}`
          );
          if (websiteResponse.ok) {
            const websiteData = await websiteResponse.json();
            photoUrl = websiteData.imageUrl || null;
          }
        } catch (error) {
          console.error(`Error fetching website image:`, error);
        }
      }

      // Priority 2: Instagram image (if shared from Instagram)
      // TODO: Add Instagram image extraction when available

      // Priority 3: Google Places image (fallback)
      if (!photoUrl && item.google_place_id) {
        try {
          const selectedPhotoIndex = item.selected_photo_index || 0;
          const photoResponse = await fetch(
            `/api/place-photo?placeId=${item.google_place_id}&selectedPhotoIndex=${selectedPhotoIndex}`
          );
          if (photoResponse.ok) {
            const photoData = await photoResponse.json();
            photoUrl = photoData.photoUrl || null;
          }
        } catch (error) {
          console.error(`Error fetching photo:`, error);
        }
      }

      if (photoUrl) {
        setItemPhotoUrl(photoUrl);
      }

      // Fetch tags
      const tagsResponse = await fetch(`/api/item-tags?itemId=${item.id}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (tagsResponse.ok) {
        setItemTags(await tagsResponse.json());
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
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
          visit_date: !item.visited ? (visitDate || new Date().toISOString().split('T')[0]) : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to update item');

      const updated = await response.json();
      onItemUpdated?.(updated);
      setShowDatePicker(false);
      setVisitDate('');
    } catch (error) {
      console.error('Error toggling visited:', error);
      alert('Failed to update item');
    } finally {
      setUpdating(false);
    }
  }

  async function handlePhotoSelect(photoIndex: number) {
    if (!item) return;

    try {
      // Optimistically fetch and display the new photo immediately
      if (item.google_place_id) {
        const photoResponse = await fetch(
          `/api/place-photo?placeId=${item.google_place_id}&selectedPhotoIndex=${photoIndex}`
        );
        if (photoResponse.ok) {
          const photoData = await photoResponse.json();
          setItemPhotoUrl(photoData.photoUrl);
        }
      }

      // Then persist the change in background
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        throw new Error('No active session');
      }

      const response = await fetch('/api/item-photo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId: item.id, photoIndex }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update photo');
      }

      // Update the item with the new photo index and notify parent
      const updatedItem = { ...item, selected_photo_index: photoIndex };
      onItemUpdated?.(updatedItem);
    } catch (error) {
      console.error('Error updating photo:', error);
      alert('Failed to update photo');
    }
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
          description: editData.description || null,
          website_url: editData.website_url || null,
          instagram_url: editData.instagram_url || null,
          event_date: editData.event_date || null,
          event_time: editData.event_time || null,
          google_place_id: editData.google_place_id || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to save item');

      const updated = await response.json();
      onItemUpdated?.(updated);
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

      onItemDeleted?.(item.id);
      onClose();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    } finally {
      setUpdating(false);
    }
  }

  async function handleExportCalendar() {
    if (!item || !session) return;

    // If no event date, show date picker
    if (!item.event_date) {
      setShowCalendarDatePicker(true);
      return;
    }

    try {
      const response = await fetch(`/api/items/${item.id}/calendar`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export calendar');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting calendar:', error);
      alert(error instanceof Error ? error.message : 'Failed to export calendar');
    }
  }

  async function handleExportCalendarWithDate() {
    if (!item || !session || !calendarDate) return;

    try {
      const response = await fetch(`/api/items/${item.id}/calendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ eventDate: calendarDate }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export calendar');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
      a.click();
      window.URL.revokeObjectURL(url);

      setShowCalendarDatePicker(false);
      setCalendarDate('');
    } catch (error) {
      console.error('Error exporting calendar:', error);
      alert(error instanceof Error ? error.message : 'Failed to export calendar');
    }
  }

  async function handleSearchPlace(e: React.FormEvent) {
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
      google_place_id: place.placeId,
      website_url: place.website || editData.website_url,
      description: place.description || editData.description,
    });
    setSearchResults([]);
    setSearchQuery('');
  }

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-background rounded-lg border border-border shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-heading font-bold text-foreground">{item.title}</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center gap-3">
            {item.instagram_url && (
              <a
                href={item.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:opacity-75 transition-opacity"
                title="View on Instagram"
              >
                <span className="text-xl">📸</span>
              </a>
            )}

            {item.google_place_id ? (
              <a
                href={`https://www.google.com/maps/place/?q=place_id:${item.google_place_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:opacity-75 transition-opacity"
                title="Open in Google Maps"
              >
                <span className="text-xl">🗺️</span>
              </a>
            ) : item.address ? (
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(item.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:opacity-75 transition-opacity"
                title="Open in Google Maps"
              >
                <span className="text-xl">🗺️</span>
              </a>
            ) : null}

            <button
              onClick={handleExportCalendar}
              className="text-foreground hover:opacity-75 transition-opacity"
              title="Add to Calendar"
            >
              <span className="text-xl">📅</span>
            </button>

            <button
              onClick={toggleVisited}
              disabled={updating}
              className="text-primary hover:opacity-75 disabled:opacity-50 transition-opacity"
              title={item.visited ? 'Mark as Unvisited' : 'Mark as Visited'}
            >
              <span className="text-xl">{item.visited ? '↩' : '✓'}</span>
            </button>

            {!isEditing ? (
              <button
                onClick={() => {
                  setEditData({
                    title: item.title,
                    type: item.type,
                    address: item.address || '',
                    notes: item.notes || '',
                    description: item.description || '',
                    website_url: item.website_url || '',
                    instagram_url: item.instagram_url || '',
                    event_date: item.event_date || '',
                    event_time: item.event_time || '',
                    google_place_id: item.google_place_id || '',
                  });
                  setIsEditing(true);
                }}
                className="text-foreground hover:opacity-75 transition-opacity"
                title="Edit"
              >
                <span className="text-xl">✎</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={updating}
                className="px-3 py-1 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 text-sm font-medium"
              >
                {updating ? 'Saving...' : 'Save'}
              </button>
            )}

            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={updating}
              className="text-red-600 hover:opacity-75 disabled:opacity-50 transition-opacity"
              title="Delete"
            >
              <span className="text-xl">🗑️</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Photo */}
          {itemPhotoUrl && (
            <div className="relative group">
              <img
                src={itemPhotoUrl}
                alt={item.title}
                className="w-full h-96 object-cover rounded-lg"
              />
              {item.google_place_id && !item.website_url && (
                <button
                  onClick={() => setShowPhotoSelector(true)}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  📸
                </button>
              )}
            </div>
          )}

          {!isEditing ? (
            <>
              {/* View Mode */}
              {item.address && (
                <div className="flex items-start gap-2">
                  <span className="text-lg mt-0.5">📍</span>
                  <span className="text-foreground">{item.address}</span>
                </div>
              )}

              {item.description && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">From Google Places</p>
                  <p className="text-base text-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )}

              {item.notes && (
                <div>
                  <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {item.notes}
                  </p>
                </div>
              )}

              {item.event_date && (
                <div className="text-muted-foreground">
                  📅 {new Date(item.event_date).toLocaleDateString()}
                  {item.event_time && ` at ${item.event_time}`}
                </div>
              )}

              {itemTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {itemTags.map((itemTag: any) => (
                    <span
                      key={itemTag.tag_id}
                      className="px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: itemTag.tags?.color || '#ccc' }}
                    >
                      {itemTag.tags?.name}
                    </span>
                  ))}
                </div>
              )}

              {item.website_url && (
                <a
                  href={item.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:opacity-75 font-medium inline-block"
                >
                  Website
                </a>
              )}
            </>
          ) : (
            <>
              {/* Edit Mode */}
              <div className="space-y-4">
                {/* 1. Type */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                  <select
                    value={editData.type}
                    onChange={(e) => setEditData({ ...editData, type: e.target.value as any })}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="venue">Venue</option>
                    <option value="activity">Activity</option>
                    <option value="event">Event</option>
                    <option value="destination">Destination</option>
                  </select>
                </div>

                {/* 2. Address */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                  <input
                    type="text"
                    value={editData.address}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* 3. Instagram Post/Reel */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Instagram Post/Reel</label>
                  <input
                    type="url"
                    value={editData.instagram_url}
                    onChange={(e) => setEditData({ ...editData, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/p/..."
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* 4. Website (if not instagram) */}
                {!editData.instagram_url && (editData.type === 'venue' || editData.type === 'activity' || editData.type === 'event') && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Website</label>
                    <input
                      type="url"
                      value={editData.website_url}
                      onChange={(e) => setEditData({ ...editData, website_url: e.target.value })}
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                {/* Always show website if instagram is set */}
                {editData.instagram_url && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Website</label>
                    <input
                      type="url"
                      value={editData.website_url}
                      onChange={(e) => setEditData({ ...editData, website_url: e.target.value })}
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                {/* 5. Title */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* 6. Dates & Time (always show for events) */}
                {editData.type === 'event' && (
                  <DatePicker
                    startDate={editData.event_date}
                    endDate=""
                    startTime={editData.event_time}
                    onStartDateChange={(date) => setEditData({ ...editData, event_date: date })}
                    onEndDateChange={() => {}}
                    onStartTimeChange={(time) => setEditData({ ...editData, event_time: time })}
                    showTime={true}
                  />
                )}

                {/* 7. Description (if not instagram, if not website) */}
                {!editData.instagram_url && !editData.website_url && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={2}
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                {/* 8. Notes */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
                  <textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Photo Selector Modal */}
      {showPhotoSelector && item.google_place_id && (
        <PhotoSelector
          placeId={item.google_place_id}
          selectedIndex={item.selected_photo_index || 0}
          onSelect={handlePhotoSelect}
          onClose={() => setShowPhotoSelector(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border shadow-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-foreground mb-2">Delete Item?</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete "{item.title}"? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={updating}
                className="flex-1 px-4 py-2 bg-red-600 hover:opacity-90 disabled:opacity-50 text-white rounded-md font-medium transition-opacity"
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

      {/* Calendar Date Picker Modal */}
      {showCalendarDatePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border shadow-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-foreground mb-4">Select Date for Calendar</h3>
            <p className="text-sm text-muted-foreground mb-4">
              "{item.title}" doesn't have a date. Enter a date to export to calendar.
            </p>
            <input
              type="date"
              value={calendarDate}
              onChange={(e) => setCalendarDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleExportCalendarWithDate}
                disabled={!calendarDate}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 font-medium transition-opacity"
              >
                Export
              </button>
              <button
                onClick={() => {
                  setShowCalendarDatePicker(false);
                  setCalendarDate('');
                }}
                className="flex-1 px-4 py-2 border border-border text-foreground hover:bg-muted rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
