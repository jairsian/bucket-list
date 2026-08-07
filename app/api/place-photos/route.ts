import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const placeId = request.nextUrl.searchParams.get('placeId');

    if (!placeId || !GOOGLE_MAPS_API_KEY) {
      return NextResponse.json({ error: 'Missing placeId or API key' }, { status: 400 });
    }

    // Fetch all photos from Places API v1 (limit to 5)
    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?fields=photos&key=${GOOGLE_MAPS_API_KEY}`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.photos && data.photos.length > 0) {
          // Limit to 5 photos
          const photos = data.photos.slice(0, 5).map((photo: any, index: number) => ({
            index,
            name: photo.name,
            widthPx: photo.widthPx,
            heightPx: photo.heightPx,
            photoUrl: `https://places.googleapis.com/v1/${photo.name}/media?max_height_px=400&max_width_px=600&key=${GOOGLE_MAPS_API_KEY}`,
          }));

          return NextResponse.json({ photos });
        }
      }
    } catch (error) {
      console.error('Error fetching from Places API:', error);
    }

    return NextResponse.json({ photos: [] });
  } catch (error) {
    console.error('Error fetching place photos:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
