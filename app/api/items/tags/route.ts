import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { itemId, tagIds } = await request.json();
    if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 });

    // Delete existing tags for this item
    const { error: deleteError } = await supabase
      .from('item_tags')
      .delete()
      .eq('item_id', itemId);

    if (deleteError) throw deleteError;

    // Insert new tags if provided
    if (tagIds && tagIds.length > 0) {
      const { error: insertError } = await supabase
        .from('item_tags')
        .insert(tagIds.map((tagId: number) => ({ item_id: itemId, tag_id: tagId })));

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update item tags error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
