# Bucket List App - Setup Guide

This guide will walk you through setting up the Bucket List app with Supabase and Google Cloud Platform.

## Quick Start

1. **Clone/Setup the project**
   ```bash
   cd bucket-list-app
   npm install
   npm run dev
   ```
   The app will be running at `http://localhost:3000`

2. **Set up Supabase** (see section below)
3. **Set up Google Cloud credentials** (see section below)
4. **Deploy to Vercel** (optional, but recommended)

---

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up for a free account
2. Click "New Project" and fill in the details:
   - **Name**: `bucket-list` (or your choice)
   - **Database Password**: Generate a strong password
   - **Region**: Choose the region closest to you
3. Click "Create new project" and wait for it to initialize (may take a few minutes)

### 2. Get Your Credentials

1. Once the project is ready, go to **Settings > API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Create Database Tables

1. In Supabase, go to **SQL Editor**
2. Create a new query and paste this SQL:

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

-- Create indexes
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

3. Click "Run" to execute the SQL

### 4. Enable Email Auth

1. Go to **Authentication > Providers**
2. Make sure "Email" is enabled (it should be by default)

---

## Google Cloud Setup

### 1. Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click on the project selector and click "New Project"
3. Enter a project name (e.g., "Bucket List App") and click "Create"

### 2. Enable Required APIs

1. In the Google Cloud Console, go to **APIs & Services > Library**
2. Search for and enable these APIs:
   - **Places API (New)** - for place searching
   - **Maps JavaScript API** - for map display
3. For each API, click "Enable"

### 3. Create an API Key

1. Go to **APIs & Services > Credentials**
2. Click "Create Credentials" > "API Key"
3. Copy the API key that appears
4. This key will be used for both `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### 4. Restrict the API Key (Recommended for Security)

1. Click on the API key you just created
2. Under "Application restrictions", select "HTTP referrers (websites)"
3. Add your deployment URL (e.g., `https://yourdomain.vercel.app/*`) or localhost for testing

---

## Configure Environment Variables

1. Create `.env.local` in the project root (or update it):

```env
# Supabase (from API settings)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google Cloud (from Credentials)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your-google-api-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-api-key
```

2. Save the file and restart the dev server (it will pick up the new variables)

---

## Testing the App

1. **Sign up**: Go to `http://localhost:3000` and click "Sign up"
2. **Create a test item**: After logging in, click "+ Add Item"
3. **Search for a place**: Try searching for a restaurant or landmark (you'll need valid Google credentials)
4. **Mark as visited**: Click on an item and mark it as visited

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/bucket-list-app
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project" and import your GitHub repository
3. In "Environment Variables", add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
4. Click "Deploy"

### 3. Update Google Cloud API Restrictions

Once deployed, add your Vercel domain to the API key's HTTP referrer restrictions:
- Pattern: `https://your-deployment.vercel.app/*`

---

## iOS Shortcut Setup

A custom iOS Shortcut will be provided that lets you share Google Maps links directly to the app. Once installed on your iPhone:

1. Open a Google Maps link on your iPhone
2. Tap "Share"
3. Tap "Bucket List" in the share sheet
4. The app will open with the place pre-filled

*Shortcut file to be added: `bucket-list-shortcut.shortcut`*

---

## Troubleshooting

### "Unauthorized" error when creating items
- Check that you've pasted the correct `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Restart the dev server after updating `.env.local`

### Google Places search not working
- Verify `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` is set and correct
- Check that "Places API (New)" is enabled in Google Cloud Console
- Ensure billing is enabled on your Google Cloud project (free tier available)

### Database table errors
- Make sure you ran the SQL setup script in Supabase's SQL Editor
- Check that Row Level Security (RLS) policies were created

### "Port 3000 is already in use"
- Run `lsof -i :3000` to find what's using the port
- Or use a different port: `npm run dev -- -p 3001`

---

## Next Steps

1. **Map view** - Add `/map` page to view all items on a map
2. **Tags & filtering** - Implement tag management and filtering
3. **Calendar export** - Download items as .ics files
4. **Offline support** - Make the PWA work offline
5. **Mobile optimization** - Test and refine mobile experience
6. **Dark mode** - Add theme toggle
