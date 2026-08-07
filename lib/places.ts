// Helper functions for Google Places API integration

export interface PlaceSearchResult {
  name: string;
  formattedAddress: string;
  rating?: number;
  userRatingCount?: number;
  businessStatus?: string;
  placeId: string;
  types?: string[];
  website?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    name: string;
    widthPx: number;
    heightPx: number;
  }>;
}

export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error('Google Places API key not configured');
  }

  try {
    const response = await fetch('/api/places/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching places:', error);
    throw error;
  }
}

export async function getPlaceDetails(placeId: string): Promise<PlaceSearchResult> {
  try {
    const response = await fetch(`/api/places/${placeId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch place details: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching place details:', error);
    throw error;
  }
}

// Extract Google Place ID from various Google Maps URL formats
export function extractPlaceIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // Format: https://maps.google.com/?q=place_id:ChIJ...
    const placeIdMatch = urlObj.searchParams.get('q')?.match(/place_id:(.+)$/);
    if (placeIdMatch) {
      return placeIdMatch[1];
    }

    // Format: https://www.google.com/maps/place/.../@-33.8688/151.2093/17z/data=!4m6!3m5!1s0x...
    // Extract from the path or hash
    const pathMatch = urlObj.pathname.match(/\/maps\/place\/([^/]+)/);
    if (pathMatch) {
      // For shared links, the place ID may be in the data attribute
      // This is a fallback; ideally use the more explicit format above
    }

    // Format: https://maps.app.goo.gl/shortcode
    // These are shortened links, will need to be resolved

    return null;
  } catch {
    return null;
  }
}
