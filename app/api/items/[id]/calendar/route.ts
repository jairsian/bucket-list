import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

function formatIcsDate(date: string): string {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function formatIcsDateTime(date: string, time?: string): string {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');

  if (!time) {
    return `${year}${month}${day}`;
  }

  const [hours, minutes] = time.split(':');
  return `${year}${month}${day}T${hours}${minutes}00Z`;
}

function generateIcs(item: any, eventDate: string, eventTime?: string): string {
  const now = new Date().toISOString().replace(/[-:.]/g, '').split('T')[0];
  const nowDateTime = new Date()
    .toISOString()
    .replace(/[-:.]/g, '')
    .replace('Z', 'Z');

  const dtstart = formatIcsDate(eventDate);

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bucket List//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Bucket List Events',
    'X-WR-TIMEZONE:UTC',
    'BEGIN:VEVENT',
    `UID:${item.id}@bucket-list.local`,
    `DTSTAMP:${nowDateTime}`,
    `DTSTART;VALUE=DATE:${dtstart}`,
    `SUMMARY:${escapeIcsText(item.title)}`,
    item.address ? `LOCATION:${escapeIcsText(item.address)}` : '',
    item.notes ? `DESCRIPTION:${escapeIcsText(item.notes)}` : '',
    item.visited ? `STATUS:COMPLETED` : `STATUS:TENTATIVE`,
    `CATEGORIES:${item.type}`,
    `URL:${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/items/${item.id}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');

  return ics;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: item, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .single();

    if (error || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const eventDate = item.event_date || item.created_at;
    const ics = generateIcs(item, eventDate, item.event_time);

    return new NextResponse(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${item.title.replace(/[^a-z0-9]/gi, '_')}.ics"`,
      },
    });
  } catch (error) {
    console.error('Calendar export error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: item, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .single();

    if (error || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const body = await request.json();
    const { eventDate } = body;

    if (!eventDate) {
      return NextResponse.json({ error: 'eventDate is required' }, { status: 400 });
    }

    const ics = generateIcs(item, eventDate);

    return new NextResponse(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${item.title.replace(/[^a-z0-9]/gi, '_')}.ics"`,
      },
    });
  } catch (error) {
    console.error('Calendar export error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
