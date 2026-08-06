import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Item = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: 'event' | 'venue' | 'activity' | 'destination';
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  google_place_id: string | null;
  visited: boolean;
  visit_date: string | null;
  rating: number | null;
  notes: string | null;
  image_url: string | null;
  google_maps_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Tag = {
  id: number;
  user_id: string;
  name: string;
  color: string | null;
};

export type ItemTag = {
  item_id: string;
  tag_id: number;
};
