import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchText';

export async function POST(request: NextRequest) {
  try {
    if (!GOOGLE_PLACES_API_KEY) {
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      );
    }

    const { query } = await request.json();
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter required' },
        { status: 400 }
      );
    }

    const response = await fetch(GOOGLE_PLACES_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: 10,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Google Places API error:', error);
      return NextResponse.json(
        { error: 'Places API request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform Google Places API response to our format
    const results = (data.places || []).map((place: any) => ({
      name: place.displayName?.text || '',
      formattedAddress: place.formattedAddress || '',
      rating: place.rating,
      userRatingCount: place.userRatingCount,
      businessStatus: place.businessStatus,
      placeId: place.name?.split('/')[1] || '',
      types: place.types,
      geometry: {
        location: {
          lat: place.location?.latitude || 0,
          lng: place.location?.longitude || 0,
        },
      },
      photos: place.photos || [],
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search places error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
