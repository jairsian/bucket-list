# Supabase Setup - Step by Step

Follow these steps to get your Supabase project ready for the Bucket List app.

## Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Sign Up"**
3. Use your email or GitHub account to sign in
4. Verify your email if needed

## Step 2: Create a New Project

1. Click **"New Project"**
2. Fill in the form:
   - **Project name**: `bucket-list` (or your choice)
   - **Database password**: Generate a strong password (you won't need it often)
   - **Region**: Choose the region closest to you (or us-east-1 as default)
3. Click **"Create new project"**
4. Wait 2-3 minutes for the project to initialize (you'll see a loading screen)

## Step 3: Get Your API Credentials

Once the project loads:

1. Click **Settings** (gear icon, bottom left)
2. Click **API** in the sidebar
3. You'll see this section:
   ```
   Project URL: https://xxxxx.supabase.co
   Anon Key: eyJ...
   Service Role Key: eyJ...
   ```
4. **Copy these two values:**
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Keep these safe! You'll paste them into `.env.local` shortly.

## Step 4: Create Database Tables

This is crucial — your app needs these tables to work.

1. In Supabase, click **SQL Editor** (left sidebar)
2. Click **New Query** (or the `+` button)
3. Copy-paste this entire SQL script:

```sql
-- Create items table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('event', 'venue', 'activity', 'destination')),
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  address TEXT,
  google_place_id TEXT,
  visited BOOLEAN DEFAULT FALSE,
  visit_date DATE,
  rating DECIMAL(2, 1),
  notes TEXT,
  image_url TEXT,
  google_maps_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, google_place_id)
);

-- Create tags table
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  UNIQUE(user_id, name)
);

-- Create item_tags junction table
CREATE TABLE item_tags (
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);

-- Create indexes for performance
CREATE INDEX idx_items_user ON items(user_id);
CREATE INDEX idx_items_visited ON items(user_id, visited);
CREATE INDEX idx_items_type ON items(user_id, type);
CREATE INDEX idx_tags_user ON tags(user_id);

-- Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for items
CREATE POLICY "Users can view their own items"
  ON items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for tags
CREATE POLICY "Users can view their own tags"
  ON tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags"
  ON tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
  ON tags FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
  ON tags FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for item_tags
CREATE POLICY "Users can view their own item tags"
  ON item_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_tags.item_id
      AND items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert item tags"
  ON item_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_tags.item_id
      AND items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete item tags"
  ON item_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_tags.item_id
      AND items.user_id = auth.uid()
    )
  );
```

4. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
5. You should see a success message. If there are errors, check the SQL syntax.

## Step 5: Verify Tables Were Created

1. Click **Table Editor** (left sidebar)
2. You should see three new tables:
   - `items`
   - `tags`
   - `item_tags`

Click on each to verify they have the right columns.

## Step 6: Enable Email Authentication

1. Click **Authentication** (left sidebar)
2. Click **Providers**
3. Scroll down and find **Email**
4. Toggle it **ON** (it's usually enabled by default)

This lets users sign up with their email and password.

## Step 7: Configure `.env.local`

Now that you have your credentials, update your app's environment file:

1. In your project, open `.env.local`
2. Replace the placeholder values:

```env
# Supabase (from Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...

# Google Cloud (we'll do this next)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=placeholder-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=placeholder-key
```

3. **Important**: After updating `.env.local`, restart your dev server:
   ```bash
   # Press Ctrl+C to stop the server
   # Then run:
   npm run dev
   ```

## Step 8: Test the Connection

1. Start your dev server (if not already running):
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3000/auth/signup`

3. Try signing up with a test email:
   - Email: `test@example.com`
   - Password: `TestPassword123`

4. If signup succeeds and redirects you to the dashboard, **you're done!** 🎉

## Troubleshooting

### "Invalid credentials" error
- Double-check that you copied the **exact** URL and Anon Key from Supabase
- Make sure there are no extra spaces
- Restart the dev server after updating `.env.local`

### "Failed to fetch" when signing up
- Check that Supabase project is running (go to Supabase dashboard)
- Verify email authentication is enabled (Settings > Authentication > Providers)
- Check browser console for detailed error messages

### Tables not created
- Go back to SQL Editor
- Click "New Query"
- Paste the SQL again and run it
- Check for error messages in red text

### "User already exists" error
- You already signed up with that email
- Try a different email for testing
- Or reset the auth user in Supabase:
  1. Go to Authentication > Users
  2. Find the user
  3. Click the three dots and delete them

## Next Steps

Once Supabase is working:

1. ✅ Supabase is set up
2. 📍 **Next**: [Google Cloud Setup](./SETUP.md#google-cloud-setup)
3. 🚀 Deploy to Vercel
4. 📱 Set up iOS Shortcut

---

**Need help?** Check the [main SETUP.md](./SETUP.md) for common issues.
