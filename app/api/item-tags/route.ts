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
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { data } = await supabase.auth.getUser(token);
    if (!data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'itemId required' }, { status: 400 });
    }

    // Verify item ownership
    const { data: item } = await supabase
      .from('items')
      .select('user_id')
      .eq('id', itemId)
      .single();

    if (!item || item.user_id !== data.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: itemTags, error } = await supabase
      .from('item_tags')
      .select('tag_id, tags(id, name, color)')
      .eq('item_id', itemId);

    if (error) throw error;

    return NextResponse.json(itemTags);
  } catch (error) {
    console.error('GET /api/item-tags error:', error);
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
    const { itemId, tagId } = body;

    if (!itemId || !tagId) {
      return NextResponse.json({ error: 'itemId and tagId required' }, { status: 400 });
    }

    // Verify item ownership
    const { data: item } = await supabase
      .from('items')
      .select('user_id')
      .eq('id', itemId)
      .single();

    if (!item || item.user_id !== data.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify tag ownership
    const { data: tag } = await supabase
      .from('tags')
      .select('user_id')
      .eq('id', tagId)
      .single();

    if (!tag || tag.user_id !== data.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: itemTag, error } = await supabase
      .from('item_tags')
      .insert({
        item_id: itemId,
        tag_id: tagId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(itemTag, { status: 201 });
  } catch (error) {
    console.error('POST /api/item-tags error:', error);
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

    const { itemId, tagId } = await request.json();

    if (!itemId || !tagId) {
      return NextResponse.json({ error: 'itemId and tagId required' }, { status: 400 });
    }

    // Verify item ownership
    const { data: item } = await supabase
      .from('items')
      .select('user_id')
      .eq('id', itemId)
      .single();

    if (!item || item.user_id !== data.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('item_tags')
      .delete()
      .eq('item_id', itemId)
      .eq('tag_id', tagId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/item-tags error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
