import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: false },
  }
);

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

    const { itemId, photoIndex } = await request.json();

    if (!itemId || photoIndex === undefined) {
      return NextResponse.json({ error: 'Missing itemId or photoIndex' }, { status: 400 });
    }

    // Verify ownership
    const { data: item } = await supabase
      .from('items')
      .select('user_id')
      .eq('id', itemId)
      .single();

    if (!item || item.user_id !== data.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update selected photo index
    const { error } = await supabase
      .from('items')
      .update({ selected_photo_index: photoIndex })
      .eq('id', itemId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating item photo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update photo' },
      { status: 500 }
    );
  }
}
