// Parse deep links from share sheet (Google Maps URLs)

export interface DeepLinkData {
  url?: string;
  placeId?: string;
}

export function parseDeepLink(queryParams: URLSearchParams): DeepLinkData {
  const url = queryParams.get('url');
  const placeId = queryParams.get('placeId');

  return {
    url: url || undefined,
    placeId: placeId || undefined,
  };
}

// If a place ID isn't in the query, try to extract it from the URL
export function extractPlaceIdFromMapUrl(mapUrl: string): string | null {
  if (!mapUrl) return null;

  try {
    const url = new URL(mapUrl);

    // Try common Google Maps URL formats
    // Format 1: q=place_id:ChIJ...
    const qParam = url.searchParams.get('q');
    if (qParam?.includes('place_id:')) {
      const match = qParam.match(/place_id:([^&\s]+)/);
      if (match) return match[1];
    }

    // Format 2: data attribute in path
    if (url.pathname.includes('/maps/place/')) {
      // This requires more complex parsing, skip for now
    }

    return null;
  } catch {
    return null;
  }
}
