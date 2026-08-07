# Setting Up Row-Level Security (RLS) for Tags

The tag creation is failing because the `tags` table has Row-Level Security (RLS) enabled, but there are no policies allowing authenticated users to create and manage tags.

## Error Details

- Error Code: `42501` (Permission Denied)
- Message: "new row violates row-level security policy for table 'tags'"
- Cause: Missing or misconfigured RLS policies

## Step-by-Step Fix

### Step 1: Access Supabase Dashboard

1. Go to https://app.supabase.com
2. Log in with your credentials
3. Select your project from the list

### Step 2: Open SQL Editor

1. In the left sidebar, click **SQL Editor** (or **Database** → **SQL**)
2. Click the **+ New Query** button (top right)
3. A new query window will open

### Step 3: Copy and Execute the Migration

1. Open the file `supabase/migrations/enable_tags_rls.sql` in your editor
2. Copy ALL the SQL code
3. Paste it into the Supabase SQL Editor query window
4. Click the **Run** button (or press `Ctrl+Enter` / `Cmd+Enter`)

You should see:
```
Success. No rows returned
```

### Step 4: Verify the Policies

After running the migration:

1. In Supabase, go to **Authentication** → **Policies** in the left sidebar
2. Select the **tags** table from the dropdown
3. You should see 4 policies:
   - "Users can insert their own tags"
   - "Users can view their own tags"
   - "Users can update their own tags"
   - "Users can delete their own tags"

4. Select the **item_tags** table
5. You should see 3 policies:
   - "Users can insert tags for their items"
   - "Users can view tags for their items"
   - "Users can delete tags from their items"

### Step 5: Test It

1. Go back to your app at http://localhost:3000
2. Navigate to `/tags`
3. Try creating a new tag
4. If successful, you'll see the tag appear in the list

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

### Still Getting "Failed to create tag" Error?

Try these steps:

1. **Clear your browser cache and refresh**
   - Press `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
   - Clear "All time" data
   - Refresh the app

2. **Verify policies exist in Supabase**
   - Go to Supabase Dashboard
   - Click **Authentication** → **Policies**
   - Select "tags" from dropdown
   - You should see policies listed

3. **Check RLS is enabled**
   - Go to **Database** → **Tables**
   - Click the **tags** table
   - Look for "RLS Enabled" indicator
   - If OFF, click to enable it, then re-run the SQL migration

4. **Clear conflicting policies**
   - If migration returns error about duplicate policies:
   - Go to **Authentication** → **Policies**
   - Delete any existing policies on tags/item_tags
   - Re-run the migration SQL

### If SQL Migration Still Fails

Try running this simpler version first to check for issues:

```sql
-- Just enable RLS without policies
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;
```

Then check Supabase logs to see the specific error.

## Manual Policy Creation (if SQL fails)

If you prefer to create policies through the Supabase UI:

### For Tags Table

1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. Click **+ Create Policy** for the **tags** table
3. Create 4 policies:

**Policy 1 - INSERT**
- Target roles: `authenticated`
- Using expression: `auth.uid() = user_id`

**Policy 2 - SELECT**
- Target roles: `authenticated`
- Using expression: `auth.uid() = user_id`

**Policy 3 - UPDATE**
- Target roles: `authenticated`
- Using expression: `auth.uid() = user_id`

**Policy 4 - DELETE**
- Target roles: `authenticated`
- Using expression: `auth.uid() = user_id`

### For Item_Tags Table

1. Go to **Authentication** → **Policies**
2. Click **+ Create Policy** for the **item_tags** table
3. Create 3 policies:

**Policy 1 - INSERT**
- Target roles: `authenticated`
- Using expression: 
  ```sql
  EXISTS (SELECT 1 FROM items WHERE items.id = item_tags.item_id AND items.user_id = auth.uid())
  ```

**Policy 2 - SELECT**
- Target roles: `authenticated`
- Using expression: (same as INSERT above)

**Policy 3 - DELETE**
- Target roles: `authenticated`
- Using expression: (same as INSERT above)
