import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: tags, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('name');

    if (error) throw error;
    return NextResponse.json(tags || []);
  } catch (error) {
    console.error('Fetch tags error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split('Bearer ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, color } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    const { data: tag, error } = await supabase
      .from('tags')
      .insert([{ user_id: userData.user.id, name, color: color || null }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(tag);
  } catch (error) {
    console.error('Create tag error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
