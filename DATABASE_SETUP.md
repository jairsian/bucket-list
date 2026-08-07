# Database Setup Instructions

## Add website_url Column

To enable the website field in the app, you need to add the `website_url` column to your `items` table in Supabase.

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy and paste this SQL:

```sql
ALTER TABLE items ADD COLUMN website_url TEXT;
```

6. Click **Run**

### Option 2: Using Supabase CLI

```bash
npx supabase db push
```

This will run all pending migrations in the `supabase/migrations/` folder.

### Verification

After running the migration, verify it worked by:
1. Going to the **Table Editor** in Supabase
2. Selecting the `items` table
3. You should see a `website_url` column

## What This Changes

- New items can now have a separate `website_url` field
- The edit form includes a "Website" input field
- Website URLs are no longer embedded in the notes field
- Old items with "Website: ..." in notes will continue to work (they just won't show the website in the edit form until manually edited)
