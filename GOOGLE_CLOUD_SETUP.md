# Google Cloud Setup - Step by Step

Follow these steps to get Google Places API working for the Bucket List app.

## Step 1: Create a Google Cloud Account

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with your Google account (or create one)
3. You should see the Google Cloud Console

## Step 2: Create a New Project

1. At the top, click the **Project Selector** (shows "Select a Project")
2. Click **NEW PROJECT**
3. Fill in:
   - **Project name**: `bucket-list-app` (or your choice)
   - **Organization**: Leave as "No organization"
4. Click **CREATE**
5. Wait for the project to be created (1-2 minutes)

## Step 3: Enable Required APIs

You need two APIs enabled:

### Enable Places API (New)

1. In Google Cloud Console, go to **APIs & Services > Library**
2. Search for: **"Places API"**
3. Click on **"Places API"** (the new one, not the old "Google Places API Web Service")
4. Click **ENABLE**

### Enable Maps JavaScript API

1. Go back to **APIs & Services > Library**
2. Search for: **"Maps JavaScript API"**
3. Click on it
4. Click **ENABLE**

You should now have two APIs enabled. You can verify this by going to **APIs & Services > Enabled APIs & Services**.

## Step 4: Create an API Key

1. Go to **APIs & Services > Credentials** (left sidebar)
2. Click **+ CREATE CREDENTIALS** (top button)
3. Select **API Key** from the dropdown
4. A modal will appear with your new API key. **Copy it immediately** (you won't see it again)
5. Click **Close**

This API key goes into both:
   - `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## Step 5: Enable Billing (Required!)

**Important:** Without billing enabled, you won't be able to use the APIs. But don't worry — Google gives you $300 free credit per month for testing.

1. Go to **Billing** (left sidebar)
2. Click **Link Billing Account**
3. Create or select a billing account
4. Enter your payment method
5. Click **Start Free Trial** (or just proceed with your account)

Once billing is enabled, your APIs should work!

## Step 6: Restrict API Key (Recommended for Security)

To prevent unauthorized use of your API key:

1. Go to **APIs & Services > Credentials**
2. Click on your API key
3. Under **API restrictions**, select:
   - **Places API (New)**
   - **Maps JavaScript API**
4. Under **Application restrictions**, select **HTTP referrers (websites)**
5. Add these URLs:
   - `http://localhost:3000/*` (for local testing)
   - `http://127.0.0.1:3000/*` (alternative localhost)

**After deployment to Vercel**, add your Vercel URL:
   - `https://your-deployment.vercel.app/*`

Click **SAVE**

## Step 7: Update `.env.local`

1. Open `.env.local` in your project
2. Update these lines:

```env
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your-api-key-here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key-here
```

Replace `your-api-key-here` with the API key you copied in Step 4.

3. **Restart your dev server:**
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

## Step 8: Test the Connection

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3000/auth/signup` and create a test account

3. After signing in, click **"+ Add Item"**

4. In the "Search Google Maps" field, try searching for something like:
   - `Starbucks in San Francisco`
   - `Eiffel Tower`
   - `McDonald's`

5. If search results appear, **you're done!** 🎉

## Troubleshooting

### "Invalid API Key" error
- Make sure you copied the **exact** API key (no extra spaces)
- Restart the dev server after updating `.env.local`
- Check that the API key is in both lines (`GOOGLE_PLACES_API_KEY` and `GOOGLE_MAPS_API_KEY`)

### "API not enabled" error
- Go to **APIs & Services > Library**
- Search for and enable **"Places API"** and **"Maps JavaScript API"**
- Wait a few minutes for the changes to take effect
- Restart your dev server

### "Billing account not found" error
- Go to **Billing** and link a billing account
- This is **required** — APIs won't work without it
- You get $300 free credit per month, so there's no immediate cost

### Search returns no results
- Make sure billing is enabled (check the Billing page)
- Check that both APIs are enabled (**APIs & Services > Enabled APIs & Services**)
- Try a simple search like `Pizza` to test

### "Quota exceeded" error
- You've hit the free tier limit for this month
- Check **APIs & Services > Quotas** to see usage
- The free tier is very generous (100,000 requests/month for Places)
- To increase, go to **Quotas** and request a higher limit

## Cost Information

**Good news**: The free tier is very generous!

- **Places API (New)**: 25,000 requests/month free
- **Maps JavaScript API**: 28,000 map loads/month free
- After free tier: ~$0.007 per request (very cheap)

For a personal bucket list app, you'll easily stay within the free tier.

## Next Steps

Once Google Cloud is working:

1. ✅ Supabase is set up
2. ✅ Google Cloud is set up
3. 🚀 **Next**: [Deploy to Vercel](./DEPLOYMENT.md)
4. 📱 Set up iOS Shortcut

---

**Need help?** Check the [main SETUP.md](./SETUP.md) for common issues.
