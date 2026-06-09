import { NextRequest, NextResponse } from 'next/server';

const BASE_URLS: Record<string, string> = {
  west: 'https://west.albion-online-data.com',
  east: 'https://east.albion-online-data.com',
  europe: 'https://europe.albion-online-data.com',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids');
  const server = searchParams.get('server') || 'west';
  const locations = searchParams.get('locations') || 'Caerleon';
  const qualities = searchParams.get('qualities') || '1,2,3,4';

  if (!ids) {
    return NextResponse.json({ error: 'Missing ids' }, { status: 400 });
  }

  const baseUrl = BASE_URLS[server] || BASE_URLS.west;
  const url = `${baseUrl}/api/v2/stats/prices/${ids}.json?locations=${locations}&qualities=${qualities}`;

  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ error: `API returned ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
  }
}
