# Setting Up Row-Level Security (RLS) for Tags

The tag creation is failing because the `tags` table has Row-Level Security (RLS) enabled, but there are no policies allowing authenticated users to create and manage tags.

## Quick Fix

### Option 1: Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the SQL from `supabase/migrations/enable_tags_rls.sql`
6. Click **Run**

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
npx supabase db push
```

This will run all migrations in the `supabase/migrations/` directory.

## What These Policies Do

The migration creates the following RLS policies:

### Tags Table
- **INSERT**: Users can create tags for themselves
- **SELECT**: Users can only see their own tags
- **UPDATE**: Users can only update their own tags
- **DELETE**: Users can only delete their own tags

### Item_Tags Table (Junction Table)
- **INSERT**: Users can add tags to their own items
- **SELECT**: Users can only see tags for their own items
- **DELETE**: Users can remove tags from their own items

## Verifying It Works

1. Open the app and navigate to `/tags`
2. Try creating a new tag
3. If successful, you should see the tag appear in the list

## Troubleshooting

If you still get errors after setting up RLS:

1. Make sure you're logged in (check Network tab for Authorization header)
2. Check Supabase logs for more details
3. Verify the policies were created:
   - Go to Supabase Dashboard → Authentication → Policies
   - Look for the policies listed above

## Manual Policy Creation (if SQL fails)

If you prefer to create policies through the UI:

1. Go to Supabase Dashboard → Authentication → Policies
2. For the `tags` table, create these policies:
   - **INSERT**: Check `auth.uid() = user_id`
   - **SELECT**: Check `auth.uid() = user_id`
   - **UPDATE**: Check `auth.uid() = user_id`
   - **DELETE**: Check `auth.uid() = user_id`

3. For the `item_tags` table, create these policies:
   - **INSERT**: Check item belongs to user: `EXISTS (SELECT 1 FROM items WHERE items.id = item_tags.item_id AND items.user_id = auth.uid())`
   - **SELECT**: Same check as INSERT
   - **DELETE**: Same check as INSERT
