'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleMap, LoadScript, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { supabase } from '@/lib/supabase';
import { Item } from '@/lib/supabase';
import Link from 'next/link';
import { ItemModal } from '@/components/ItemModal';

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
  const [selectedItemForModal, setSelectedItemForModal] = useState<Item | null>(null);
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
      setItems(data.filter((item: Item) => item.latitude && item.longitude));

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

  const handleItemClick = (item: Item) => {
    setSelectedItemForModal(item);
    setSelectedMarker(item.id);
    setMapCenter({
      lat: item.latitude || 0,
      lng: item.longitude || 0,
    });
  };

  const handleItemUpdated = (updatedItem: Item) => {
    setItems(items.map(i => i.id === updatedItem.id ? updatedItem : i));
    setSelectedItemForModal(updatedItem);
  };

  const handleItemDeleted = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
    setSelectedItemForModal(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading map...</p>
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

      {/* Main Content - Two Column Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Item List */}
        <div className="w-96 bg-background border-r border-border overflow-y-auto">
          <div className="p-8">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-2">Map</h2>
            <p className="text-muted-foreground mb-6">Explore places others have saved.</p>

            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No items with locations yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedItemForModal?.id === item.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-border/80 bg-card hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className="text-xl flex-shrink-0">📍</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{item.address || 'No address'}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="flex-1">
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <LoadScript
              googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
              libraries={['places']}
            >
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
                {items.map((item) => (
                  <MarkerF
                    key={item.id}
                    position={{
                      lat: item.latitude || 0,
                      lng: item.longitude || 0,
                    }}
                    icon={getMarkerColor(item.type)}
                    onClick={() => handleItemClick(item)}
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
                          <button
                            onClick={() => setSelectedItemForModal(item)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2 block"
                          >
                            View Details →
                          </button>
                        </div>
                      </InfoWindowF>
                    )}
                  </MarkerF>
                ))}
              </GoogleMap>
            </LoadScript>
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              <p className="text-muted-foreground">Google Maps API key not configured</p>
            </div>
          )}
        </div>
      </div>

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
