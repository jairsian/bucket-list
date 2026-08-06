'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { searchPlaces, getPlaceDetails, PlaceSearchResult } from '@/lib/places';
import { extractPlaceIdFromMapUrl } from '@/lib/deeplink';

function AddItemContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'event' | 'venue' | 'activity' | 'destination'>('venue');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [googlePlaceId, setGooglePlaceId] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/auth/login');
        return;
      }

      setSession(data.session);

      // Check if this was a deep link from share sheet
      const url = searchParams.get('url');
      const placeId = searchParams.get('placeId');

      if (placeId) {
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
          if (place.rating) {
            setRating(place.rating);
          }
        } catch (error) {
          console.error('Error loading place:', error);
        }
      } else if (url) {
        // Try to extract place ID from URL
        const extractedId = extractPlaceIdFromMapUrl(url);
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
    if (place.geometry?.location) {
      setLatitude(place.geometry.location.lat);
      setLongitude(place.geometry.location.lng);
    }
    if (place.rating) {
      setRating(place.rating);
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
          latitude: latitude || null,
          longitude: longitude || null,
          google_place_id: googlePlaceId || null,
          notes: notes || null,
          rating: rating || null,
          visited: false,
        }),
      });

      if (!response.ok) throw new Error('Failed to create item');

      router.push('/dashboard');
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
          {/* Search for places */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Google Maps
            </label>
            <form onSubmit={handleSearch} className="flex gap-2 mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a restaurant, event, place..."
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={searching}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="border border-gray-300 dark:border-gray-600 rounded-md divide-y dark:divide-gray-600 max-h-64 overflow-y-auto">
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

          {/* Title */}
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
              placeholder="e.g., Visit the Eiffel Tower"
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
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

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="Optional address"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="Add any notes or details..."
            />
          </div>

          {/* Rating */}
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rating
            </label>
            <select
              id="rating"
              value={rating ?? ''}
              onChange={(e) => setRating(e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="">No rating</option>
              <option value="1">★ 1</option>
              <option value="1.5">★ 1.5</option>
              <option value="2">★ 2</option>
              <option value="2.5">★ 2.5</option>
              <option value="3">★ 3</option>
              <option value="3.5">★ 3.5</option>
              <option value="4">★ 4</option>
              <option value="4.5">★ 4.5</option>
              <option value="5">★ 5</option>
            </select>
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
