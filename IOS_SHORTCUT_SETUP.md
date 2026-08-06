# iOS Shortcut Setup - Share Google Maps Links to Bucket List

This guide will help you install a custom iOS Shortcut that lets you share Google Maps links directly to your Bucket List app from Safari or the Maps app.

## What It Does

When you find a place on Google Maps and want to add it to your bucket list:

1. Open Google Maps (or any map URL)
2. Tap "Share"
3. Tap "Bucket List" in the share sheet
4. The app opens with the place pre-populated and ready to add

No copy-pasting URLs — seamless integration!

## Installation (iPhone Only)

### Method 1: Using iCloud Link (Easiest)

1. On your iPhone, open this iCloud link (we'll provide this once deployed):
   - `https://www.icloud.com/shortcuts/[shortcut-id]`
2. Tap "Get Shortcut"
3. Tap "Add Shortcut"
4. Done! The shortcut now appears in your share sheet

### Method 2: Manual Installation

If you don't have an iCloud link, you can create it manually:

1. On your iPhone, open the **Shortcuts app**
2. Tap the **"+" button** to create a new shortcut
3. Tap **"Add Action"**
4. Search for and add: **URL**
5. In the URL field, paste:
   ```
   https://[YOUR_APP_DOMAIN]/add?url=SHARED_URL
   ```
   Replace `[YOUR_APP_DOMAIN]` with your Vercel deployment URL or localhost:3000 for testing
6. Add another action: **Open URLs**
7. Set it to open the URL from step 5
8. Tap the **three dots** at the top-right
9. Tap **"Details"**
10. Turn on **"Show in Share Sheet"**
11. Tap **"Add to Share Sheet"**
12. Name it **"Bucket List"** and tap **"Add"**

### Method 3: Using Shortcuts XML (Advanced)

If you have a Shortcuts XML export, you can import it:

1. Download the shortcut XML file
2. On iPhone, tap the file or use AirDrop to send it to yourself
3. Open it in the Shortcuts app
4. Tap "Add Shortcut"
5. Configure the app URL (see below)

## Configuration

### Important: Update the App URL

The shortcut needs to know where your app is located. Update it with:

**For Development (Local Testing)**
```
http://localhost:3000/add?url=SHARED_URL
```

**For Production (Deployed)**
```
https://your-deployment.vercel.app/add?url=SHARED_URL
```

### How to Update

1. Open the Shortcuts app
2. Tap the Bucket List shortcut
3. Tap **Edit**
4. Tap the **URL** action
5. Replace the domain with your app's URL
6. Tap **Done**

## Testing

### Test the Shortcut Locally

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Update the shortcut** to use `http://localhost:3000/add?url=SHARED_URL`

3. **On your iPhone or Mac**:
   - Open Safari
   - Go to any Google Maps link, e.g.:
     ```
     https://maps.google.com/?q=place_id:ChIJV4-G9IKAhYAR...
     ```
   - Tap Share
   - Tap Bucket List
   - The app should open at `localhost:3000/add` with the place pre-filled

### Test After Deployment

1. **Deploy to Vercel** (see SETUP.md)
2. **Update the shortcut URL** to your Vercel domain
3. **Test on your iPhone**:
   - Open Google Maps
   - Find a place (restaurant, landmark, etc.)
   - Tap "Share"
   - Tap "Bucket List"
   - The app should open with the place pre-filled

## Shortcut Flow

Here's what happens when you use the shortcut:

```
1. You tap "Share" on a Google Maps link
   ↓
2. Tap "Bucket List" shortcut
   ↓
3. Shortcut captures the shared URL
   ↓
4. Shortcut opens: https://your-app.com/add?url=<SHARED_URL>
   ↓
5. App parses the URL
   ↓
6. App extracts the place ID from the Google Maps URL
   ↓
7. App fetches place details from Google Places API
   ↓
8. Form is auto-filled with:
      - Name
      - Address
      - Rating
      - Coordinates
   ↓
9. You review, add notes if needed, and click "Add to Bucket List"
```

## Troubleshooting

### Shortcut doesn't appear in share sheet
- Make sure you enabled "Show in Share Sheet" in the shortcut's details
- Make sure the shortcut name is "Bucket List" (or your custom name)
- Restart your iPhone: Settings → General → Shut Down, then power on

### "Invalid URL" error
- Make sure the app URL in the shortcut is correct
- Make sure your dev server is running or your deployment is live
- Check that the URL includes the full path: `/add?url=`

### Place doesn't pre-populate
- The shortcut is working, but the app can't extract the place ID from the URL
- Try using a Google Maps link with `place_id=` in it
- Check browser console for errors (use Safari Developer Tools)

### "Can't connect to server"
- Make sure your app is running (dev server or deployment)
- Check that the URL is accessible (try opening it in Safari)
- Check network connection on your iPhone

## Advanced: Creating Your Own Shortcut

If you want to customize the shortcut, you can create it from scratch:

1. Open the **Shortcuts app**
2. Create a new shortcut
3. Add these actions in order:

**Step 1: Get the shared URL**
- Action: **Ask for URL**
- Set prompt to: "Paste Google Maps link"

**Step 2: Open the app**
- Action: **Open URLs**
- URL: `https://your-app.com/add?url=<result from step 1>`

**Step 3: Share sheet integration**
- In shortcut details, enable "Show in Share Sheet"

## Examples

### Google Maps Business Link
```
https://maps.google.com/?q=place_id:ChIJ0Z3bysvw44kRBHwMLdS5KkE
↓
Opens in Bucket List at:
https://your-app.com/add?url=https://maps.google.com/?q=place_id:ChIJ0Z3bysvw44kRBHwMLdS5KkE
```

### Google Maps Navigation Link
```
https://www.google.com/maps/dir//McDonald's/@40.7128,-74.0060,12z
↓
Opens in Bucket List at:
https://your-app.com/add?url=https://www.google.com/maps/dir//McDonald's/@40.7128,-74.0060,12z
```

### Short Google Maps Link (maps.app.goo.gl)
```
https://maps.app.goo.gl/ABC123XYZ
↓
Opens in Bucket List at:
https://your-app.com/add?url=https://maps.app.goo.gl/ABC123XYZ
```

## Tips & Tricks

### Faster Setup
- Use Vercel deployment instead of localhost so you don't have to reconfigure the shortcut
- Once deployed, the shortcut works on any device without additional setup

### Share Before Opening
- In Safari, use Swipe From Left to access the share menu while viewing Google Maps
- Or use the keyboard shortcut (depends on your iPhone settings)

### Multiple App Versions
- Create shortcuts for different versions (dev, staging, production)
- Useful if you're testing multiple versions of the app

### Combine with Other Automations
- Create an automation that runs the shortcut when Maps opens
- Set reminders for items you've added to your bucket list
- Use Siri to trigger the shortcut: "Hey Siri, add to bucket list"

## Next Steps

1. ✅ Install the shortcut
2. ✅ Test with a local Google Maps URL
3. ✅ Deploy your app to Vercel
4. ✅ Update the shortcut URL to your Vercel domain
5. 🎉 Start sharing places to your bucket list!

---

For help with the app setup, see [SETUP.md](./SETUP.md)
For general app info, see [README.md](./README.md)
