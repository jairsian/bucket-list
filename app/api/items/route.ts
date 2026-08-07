import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: false },
  }
);

export async function GET(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { data } = await supabase.auth.getUser(token);
    if (!data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch items for this user
    const { data: items, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', data.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(items);
  } catch (error) {
    console.error('GET /api/items error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { data } = await supabase.auth.getUser(token);
    if (!data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const { data: item, error } = await supabase
      .from('items')
      .insert({
        user_id: data.user.id,
        title: body.title,
        description: body.description || null,
        type: body.type,
        latitude: body.latitude,
        longitude: body.longitude,
        address: body.address,
        google_place_id: body.google_place_id,
        visited: body.visited || false,
        visit_date: body.visit_date || null,
        rating: body.rating,
        notes: body.notes,
        image_url: body.image_url || null,
        google_maps_url: body.google_maps_url || null,
        event_date: body.event_date || null,
        event_time: body.event_time || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('POST /api/items error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { data } = await supabase.auth.getUser(token);
    if (!data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...body } = await request.json();

    // Verify ownership
    const { data: existing } = await supabase
      .from('items')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== data.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: item, error } = await supabase
      .from('items')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(item);
  } catch (error) {
    console.error('PUT /api/items error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { data } = await supabase.auth.getUser(token);
    if (!data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();

    // Verify ownership
    const { data: existing } = await supabase
      .from('items')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== data.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase.from('items').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/items error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
