import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'Missing url parameter' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 5000,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch website' },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Extract og:image from meta tags
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);

    if (ogImageMatch && ogImageMatch[1]) {
      return NextResponse.json({ imageUrl: ogImageMatch[1] });
    }

    // Fallback: look for regular image meta tag
    const imageMatch = html.match(/<meta\s+name=["']image["']\s+content=["']([^"']+)["']/i);
    if (imageMatch && imageMatch[1]) {
      return NextResponse.json({ imageUrl: imageMatch[1] });
    }

    return NextResponse.json({ imageUrl: null });
  } catch (error) {
    console.error('Error fetching website image:', error);
    return NextResponse.json({ imageUrl: null });
  }
}
