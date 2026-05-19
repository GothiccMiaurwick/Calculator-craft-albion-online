import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get('itemId');

  if (!itemId) {
    return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://gameinfo.albiononline.com/api/gameinfo/items/${itemId}/data`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
        // Fallback for non-200 responses
        return NextResponse.json({ error: `API returned ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 500 });
  }
}
