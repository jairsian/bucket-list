# Bucket List App - Quick Start Checklist

Use this as your step-by-step guide to get everything running.

## ✅ Phase 1: Local Setup (Already Done!)

- [x] Next.js project created
- [x] Supabase integration configured
- [x] Google Places API integration ready
- [x] Auth pages (login/signup) built
- [x] Dashboard UI ready
- [x] Add item form ready
- [x] Dev server running

**Status**: App is running at `http://localhost:3000`

---

## 📋 Phase 2: External Accounts Setup (15 minutes)

### [ ] Supabase
**Follow**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

- [ ] Create Supabase account at supabase.com
- [ ] Create a new project
- [ ] Get your credentials:
  - [ ] Project URL → `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] Anon Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Run SQL migrations (copy-paste into SQL Editor)
- [ ] Verify tables created (items, tags, item_tags)
- [ ] Enable Email authentication

### [ ] Google Cloud
**Follow**: [GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md)

- [ ] Create Google Cloud account at console.cloud.google.com
- [ ] Create a new project
- [ ] Enable these APIs:
  - [ ] Places API (New)
  - [ ] Maps JavaScript API
- [ ] Create an API key
- [ ] Enable billing (required, but free tier is generous)
- [ ] Copy API key → Both `GOOGLE_PLACES_API_KEY` lines

---

## 🔑 Phase 3: Connect Credentials (2 minutes)

### [ ] Update `.env.local`

Open `bucket-list-app/.env.local` and update:

```env
# From Supabase > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# From Google Cloud > Credentials
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIza...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
```

### [ ] Restart Dev Server

```bash
# Press Ctrl+C to stop the current server
# Then run:
npm run dev
```

---

## 🧪 Phase 4: Test Everything (5 minutes)

### [ ] Test Authentication
- [ ] Go to `http://localhost:3000/auth/signup`
- [ ] Sign up with a test email
- [ ] Should redirect to dashboard
- [ ] Click "Logout" and test login

### [ ] Test Google Places Search
- [ ] Click "+ Add Item"
- [ ] In "Search Google Maps", type: `Starbucks`
- [ ] Results should appear
- [ ] Click a result to auto-fill the form
- [ ] Click "Add to Bucket List" (will fail without real Supabase, but form should work)

### [ ] Test Add Item Form
- [ ] Fill in manually:
  - [ ] Title: `Visit the Eiffel Tower`
  - [ ] Type: `destination`
  - [ ] Address: `Paris, France`
  - [ ] Rating: `5`
  - [ ] Notes: `See it at sunset`
- [ ] Click "Add to Bucket List"
- [ ] Should redirect to dashboard with your new item

### [ ] Test Item Detail
- [ ] Click on an item in the dashboard
- [ ] Should show:
  - [ ] Full details
  - [ ] "Mark as Visited" button
  - [ ] Delete button
- [ ] Click "Mark as Visited" - item should update
- [ ] Go back to dashboard - checkmark should appear

---

## 🚀 Phase 5: Deployment (5 minutes)

**Follow**: [DEPLOYMENT.md](./DEPLOYMENT.md)

- [ ] Push code to GitHub
- [ ] Create Vercel account at vercel.com
- [ ] Import your GitHub repository
- [ ] Add 4 environment variables in Vercel
- [ ] Click "Deploy"
- [ ] Wait for deployment (2-3 minutes)
- [ ] Your app is live! 🎉

### After Deployment:
- [ ] Update Google Cloud API restrictions to allow your Vercel domain
- [ ] Test signup/login on your Vercel URL
- [ ] Test Google Places search

---

## 📱 Phase 6: iOS Setup (Optional)

**Follow**: [IOS_SHORTCUT_SETUP.md](./IOS_SHORTCUT_SETUP.md)

- [ ] Create iOS Shortcut on your iPhone
- [ ] Configure shortcut with your app URL
- [ ] Test sharing a Google Maps link via share sheet
- [ ] Shortcut should open your app with place pre-filled

---

## 🎉 You're Done!

Once you complete all steps, you have:

✅ A working bucket list app  
✅ Cloud sync via Supabase  
✅ Google Places integration  
✅ Live on the internet (Vercel)  
✅ iOS Shortcut for easy sharing  

**Next features to add** (optional):

- [ ] Map view (shows all items on a map)
- [ ] Tag management (create and filter by tags)
- [ ] Calendar export (download items as .ics)
- [ ] Dark mode toggle
- [ ] Image upload for items

---

## 📞 Troubleshooting

If something doesn't work:

1. **Check the relevant setup guide**:
   - Auth issues → [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Search not working → [GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md)
   - Deployment issues → [DEPLOYMENT.md](./DEPLOYMENT.md)

2. **Check browser console** (F12 → Console tab) for error messages

3. **Restart dev server** after changing `.env.local`:
   ```bash
   # Ctrl+C to stop
   npm run dev
   ```

4. **Check environment variables** - they must be exactly right (no extra spaces)

---

## Current Status

```
Project Location: /Users/jairsian/bucket-list-app
Dev Server: http://localhost:3000
Status: Ready for Supabase & Google Cloud setup
```

**Next step**: Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to create your Supabase project!
