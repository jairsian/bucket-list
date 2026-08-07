import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const placeId = request.nextUrl.searchParams.get('placeId');

    if (!placeId || !GOOGLE_MAPS_API_KEY) {
      return NextResponse.json({ error: 'Missing placeId or API key' }, { status: 400 });
    }

    // Use new Places API (v1) to get photos
    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?fields=photos&key=${GOOGLE_MAPS_API_KEY}`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.photos && data.photos.length > 0) {
          const firstPhoto = data.photos[0];
          const photoName = firstPhoto.name; // Format: "places/ChIJ.../photos/AWCwydg..."

          // Use the correct endpoint to get the photo media
          const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?max_height_px=400&max_width_px=600&key=${GOOGLE_MAPS_API_KEY}`;

          return NextResponse.json({ photoUrl });
        }
      }
    } catch (error) {
      console.error('Error fetching from Places API:', error);
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
