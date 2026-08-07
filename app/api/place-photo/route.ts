import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const placeId = request.nextUrl.searchParams.get('placeId');
    const latitude = request.nextUrl.searchParams.get('latitude');
    const longitude = request.nextUrl.searchParams.get('longitude');

    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 400 });
    }

    // Preferred: Use Street View Static API (most reliable) if we have coordinates
    if (latitude && longitude) {
      const photoUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
      return NextResponse.json({ photoUrl });
    }

    // If only placeId, try to get coordinates from Geocoding API
    if (placeId) {
      try {
        const geoResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_MAPS_API_KEY}`
        );

        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData.result?.geometry?.location) {
            const { lat, lng } = geoData.result.geometry.location;
            const photoUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
            return NextResponse.json({ photoUrl });
          }
        }
      } catch (error) {
        console.error('Error getting coordinates:', error);
      }
    }

    return NextResponse.json({ photoUrl: null });
  } catch (error) {
    console.error('Error fetching place photo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch photo' },
      { status: 500 }
    );
  }
}
