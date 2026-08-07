'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleMap, LoadScript, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { supabase } from '@/lib/supabase';
import { Item } from '@/lib/supabase';
import Link from 'next/link';

const mapStyles = {
  height: '100vh',
  width: '100%',
};

const getMarkerColor = (type: string) => {
  switch (type) {
    case 'venue':
      return 'https://maps.google.com/mapfiles/ms/micons/red-dot.png';
    case 'activity':
      return 'https://maps.google.com/mapfiles/ms/micons/blue-dot.png';
    case 'event':
      return 'https://maps.google.com/mapfiles/ms/micons/yellow-dot.png';
    case 'destination':
      return 'https://maps.google.com/mapfiles/ms/micons/green-dot.png';
    default:
      return 'https://maps.google.com/mapfiles/ms/micons/red-dot.png';
  }
};

export default function MapView() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterVisited, setFilterVisited] = useState<string>('all');
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.006 });

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setTimeout(() => router.push('/auth/login'), 100);
        return;
      }

      setSession(data.session);
      await fetchItems(data.session.access_token);
    }

    init();
  }, [router]);

  async function fetchItems(token: string) {
    try {
      const response = await fetch('/api/items', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);

      // Center map on first item with coordinates
      if (data.length > 0) {
        const itemWithCoords = data.find((item: Item) => item.latitude && item.longitude);
        if (itemWithCoords) {
          setMapCenter({
            lat: itemWithCoords.latitude,
            lng: itemWithCoords.longitude,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = items.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterVisited === 'visited' && !item.visited) return false;
    if (filterVisited === 'unvisited' && item.visited) return false;
    return item.latitude && item.longitude;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
      {/* Filter Controls */}
      <div className="absolute top-4 left-4 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 space-y-3">
        <Link
          href="/dashboard"
          className="block text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          ← Back to Dashboard
        </Link>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-2 py-1 text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="venue">Venues</option>
            <option value="activity">Activities</option>
            <option value="event">Events</option>
            <option value="destination">Destinations</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={filterVisited}
            onChange={(e) => setFilterVisited(e.target.value)}
            className="w-full text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-2 py-1 text-gray-900 dark:text-white"
          >
            <option value="all">All Items</option>
            <option value="visited">Visited</option>
            <option value="unvisited">Unvisited</option>
          </select>
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-400">
          Showing {filteredItems.length} of {items.length} items
        </div>
      </div>

      {/* Map */}
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
        <GoogleMap
          mapContainerStyle={mapStyles}
          center={mapCenter}
          zoom={12}
          options={{
            mapTypeControl: true,
            fullscreenControl: true,
            zoomControl: true,
          }}
        >
          {filteredItems.map((item) => (
            <MarkerF
              key={item.id}
              position={{
                lat: item.latitude || 0,
                lng: item.longitude || 0,
              }}
              icon={getMarkerColor(item.type)}
              onClick={() => setSelectedMarker(item.id)}
            >
              {selectedMarker === item.id && (
                <InfoWindowF
                  position={{
                    lat: item.latitude || 0,
                    lng: item.longitude || 0,
                  }}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-2 max-w-xs">
                    <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-600 capitalize">{item.type}</p>
                    {item.address && (
                      <p className="text-xs text-gray-600 mt-1">{item.address}</p>
                    )}
                    {item.visited && (
                      <p className="text-xs text-green-600 mt-1 font-medium">✓ Visited</p>
                    )}
                    <Link
                      href={`/items/${item.id}`}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2 block"
                    >
                      View Details →
                    </Link>
                  </div>
                </InfoWindowF>
              )}
            </MarkerF>
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
