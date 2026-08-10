'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { searchPlaces, getPlaceDetails, PlaceSearchResult } from '@/lib/places';
import { extractPlaceIdFromMapUrl } from '@/lib/deeplink';
import { TagSelector } from '@/components/TagSelector';

function AddItemContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'event' | 'venue' | 'activity' | 'destination'>('venue');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [googlePlaceId, setGooglePlaceId] = useState('');
  const [notes, setNotes] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventTime, setEventTime] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setTimeout(() => router.push('/auth/login'), 100);
        return;
      }

      setSession(data.session);

      // Check if this was a deep link from share sheet
      const shareType = searchParams.get('shareType');
      const shareUrl = searchParams.get('url');
      const shareTitle = searchParams.get('title');
      const shareAddress = searchParams.get('address');
      const instagramShareUrl = searchParams.get('instagram_url');
      const placeId = searchParams.get('placeId');

      // Handle Instagram share
      if (shareType === 'instagram' && instagramShareUrl) {
        setInstagramUrl(instagramShareUrl);
        setType('venue');
        if (shareTitle) setTitle(shareTitle);
      }
      // Handle Google Maps share
      else if (shareType === 'google_maps' && placeId) {
        try {
          const place = await getPlaceDetails(placeId);
          setTitle(place.name);
          setAddress(place.formattedAddress);
          setGooglePlaceId(place.placeId);
          setType('venue');
          if (place.geometry?.location) {
            setLatitude(place.geometry.location.lat);
            setLongitude(place.geometry.location.lng);
          }
        } catch (error) {
          console.error('Error loading place:', error);
        }
      }
      // Handle website share
      else if (shareType === 'website' && shareUrl) {
        setWebsite(shareUrl);
        if (shareTitle) setTitle(shareTitle);
        setType('destination');
      }
      // Fallback to old deep link handling
      else if (placeId) {
        // Pre-fill from Google Place
        try {
          const place = await getPlaceDetails(placeId);
          setTitle(place.name);
          setAddress(place.formattedAddress);
          setGooglePlaceId(place.placeId);
          if (place.geometry?.location) {
            setLatitude(place.geometry.location.lat);
            setLongitude(place.geometry.location.lng);
          }
        } catch (error) {
          console.error('Error loading place:', error);
        }
      } else if (shareUrl) {
        // Try to extract place ID from URL
        const extractedId = extractPlaceIdFromMapUrl(shareUrl);
        if (extractedId) {
          try {
            const place = await getPlaceDetails(extractedId);
            setTitle(place.name);
            setAddress(place.formattedAddress);
            setGooglePlaceId(place.placeId);
            if (place.geometry?.location) {
              setLatitude(place.geometry.location.lat);
              setLongitude(place.geometry.location.lng);
            }
          } catch (error) {
            console.error('Error loading place from URL:', error);
          }
        }
      }

      setLoading(false);
    }

    init();
  }, [router, searchParams]);

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
    setTitle(place.name);
    setAddress(place.formattedAddress);
    setGooglePlaceId(place.placeId);
    if (place.website) {
      setWebsite(place.website);
    }
    if (place.description) {
      setDescription(place.description);
    }
    if (place.geometry?.location) {
      setLatitude(place.geometry.location.lat);
      setLongitude(place.geometry.location.lng);
    }
    setSearchResults([]);
    setSearchQuery('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !session) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          type,
          address: address || null,
          description: description || null,
          latitude: latitude || null,
          longitude: longitude || null,
          google_place_id: googlePlaceId || null,
          notes: notes || null,
          website_url: website || null,
          instagram_url: instagramUrl || null,
          event_date: type === 'event' && eventDate ? eventDate : null,
          event_time: type === 'event' && eventTime ? eventTime : null,
          visited: false,
        }),
      });

      if (!response.ok) throw new Error('Failed to create item');

      const item = await response.json();

      // Save tags if any are selected
      if (selectedTagIds.length > 0) {
        for (const tagId of selectedTagIds) {
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

      setTimeout(() => router.push('/'), 100);
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to create item');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Add Item to Bucket List</h1>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 space-y-6">
          {/* 1. Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type *
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="venue">Venue</option>
              <option value="event">Event</option>
              <option value="activity">Activity</option>
              <option value="destination">Destination</option>
            </select>
          </div>

          {/* 2. Location (search + address display) */}
          <div className="space-y-3">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <div className="flex gap-2">
                <input
                  id="address"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder={type === 'destination' ? 'e.g., Paris, Tokyo' : 'Search for a place or enter address'}
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

            {address && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>Location:</strong> {address}
                </p>
              </div>
            )}
          </div>

          {/* 3. Instagram Post/Reel */}
          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Instagram Post/Reel
            </label>
            <input
              id="instagram"
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="https://instagram.com/p/..."
            />
          </div>

          {/* 4. Website (conditional: venue/activity/event, if not instagram) */}
          {(type === 'venue' || type === 'activity' || type === 'event') && !instagramUrl && (
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
          )}

          {/* 5. Title (if not instagram, if not website) */}
          {!instagramUrl && !website && (
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder={type === 'destination' ? 'e.g., Tokyo' : 'e.g., Il Posto Accanto'}
              />
            </div>
          )}

          {/* Always show title if we don't have those fields, or show it if explicitly filled */}
          {(instagramUrl || website) && (
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder={type === 'destination' ? 'e.g., Tokyo' : 'e.g., Il Posto Accanto'}
              />
            </div>
          )}

          {/* 6. Dates & Time (all types, optional, if not instagram, if not website) */}
          {!instagramUrl && !website && (
            <>
              {type === 'event' && (
                <>
                  <div>
                    <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      id="eventDate"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="eventEndDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      id="eventEndDate"
                      type="date"
                      value={eventEndDate}
                      onChange={(e) => setEventEndDate(e.target.value)}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Time
                    </label>
                    <input
                      id="eventTime"
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </>
          )}

          {/* 7. Description (if not instagram, if not website) */}
          {!instagramUrl && !website && (
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description <span className="text-gray-500 text-xs">(from Google Places)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Place description (auto-filled from Google Places)..."
              />
            </div>
          )}

          {/* 8. Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="Add any notes or details..."
            />
          </div>

          {/* 9. Tags */}
          <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-md">
            <TagSelector
              selectedTagIds={selectedTagIds}
              onTagsChange={setSelectedTagIds}
              sessionToken={session?.access_token}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium"
            >
              {submitting ? 'Creating...' : 'Add to Bucket List'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddItem() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddItemContent />
    </Suspense>
  );
}
