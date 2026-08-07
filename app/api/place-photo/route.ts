import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const placeId = request.nextUrl.searchParams.get('placeId');

    if (!placeId || !GOOGLE_MAPS_API_KEY) {
      return NextResponse.json({ error: 'Missing placeId or API key' }, { status: 400 });
    }

    // Fetch place details from Google Places API to get photo references
    const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(placeDetailsUrl);
    const data = await response.json();

    if (!data.result?.photos || data.result.photos.length === 0) {
      return NextResponse.json({ photoUrl: null });
    }

    // Use the first photo
    const photoReference = data.result.photos[0].photo_reference;

    // Return the photo URL using Google Maps Static API
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;

    return NextResponse.json({ photoUrl });
  } catch (error) {
    console.error('Error fetching place photo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch photo' },
      { status: 500 }
    );
  }
}
