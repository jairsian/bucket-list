import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const shareType = searchParams.get('type');
  const url = searchParams.get('url');
  const title = searchParams.get('title');
  const address = searchParams.get('address');
  const placeId = searchParams.get('place_id');

  // Validate required parameters
  if (!shareType) {
    return NextResponse.json(
      { error: 'Missing required parameter: type' },
      { status: 400 }
    );
  }

  // Build redirect URL with appropriate parameters
  const addPageParams = new URLSearchParams();
  addPageParams.set('shareType', shareType);

  switch (shareType) {
    case 'instagram':
      if (!url) {
        return NextResponse.json(
          { error: 'Instagram share requires url parameter' },
          { status: 400 }
        );
      }
      addPageParams.set('instagram_url', url);
      if (title) addPageParams.set('title', title);
      break;

    case 'google_maps':
      if (!placeId && !url) {
        return NextResponse.json(
          { error: 'Google Maps share requires place_id or url parameter' },
          { status: 400 }
        );
      }
      if (placeId) addPageParams.set('placeId', placeId);
      if (url) addPageParams.set('url', url);
      if (title) addPageParams.set('title', title);
      if (address) addPageParams.set('address', address);
      break;

    case 'website':
      if (!url) {
        return NextResponse.json(
          { error: 'Website share requires url parameter' },
          { status: 400 }
        );
      }
      addPageParams.set('url', url);
      if (title) addPageParams.set('title', title);
      break;

    default:
      return NextResponse.json(
        { error: `Unknown share type: ${shareType}` },
        { status: 400 }
      );
  }

  // Redirect to add page with parameters
  const redirectUrl = `/add?${addPageParams.toString()}`;
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}
