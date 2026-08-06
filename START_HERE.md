# 🎯 START HERE - Bucket List App

Welcome! This guide will get you up and running in 30 minutes.

## What You Just Got

A fully-built **Bucket List App** with:

✨ **Features**
- 📝 Save events, venues, activities, destinations
- ⭐ Add ratings (1-5 stars) and personal notes
- ✓ Mark items as visited with dates
- 🏷️ Custom tags (ready to build)
- 🗺️ Google Places search integration
- 🌍 Map view (ready to build)
- 📅 Calendar export (ready to build)
- 📱 iPhone share sheet integration (via iOS Shortcut)
- 🌙 Dark mode support
- ☁️ Cloud sync across devices

🏗️ **Architecture**
- Next.js 14 (React, TypeScript, Tailwind)
- Supabase (Postgres database + authentication)
- Google Places API (search & details)
- Vercel deployment (one-click)
- PWA-ready (installable on iPhone)

---

## 🚀 Get Started in 3 Steps

### Step 1: Create External Accounts (10 minutes)

**Supabase** (free)
- Go to [supabase.com](https://supabase.com)
- Sign up and create a project
- Copy your Project URL and Anon Key
- Run the SQL setup script
- → Detailed guide: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

**Google Cloud** (free tier)
- Go to [console.cloud.google.com](https://console.cloud.google.com)
- Create a project
- Enable Places API (New) + Maps JavaScript API
- Create an API key
- Enable billing (free $300/month credit)
- → Detailed guide: [GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md)

### Step 2: Configure Your App (2 minutes)

1. Open `bucket-list-app/.env.local`
2. Paste your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your-api-key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key
   ```
3. Restart the dev server:
   ```bash
   # Press Ctrl+C to stop, then:
   npm run dev
   ```

### Step 3: Test It (5 minutes)

1. Go to `http://localhost:3000`
2. Sign up with a test email
3. Click "+ Add Item"
4. Search for `Starbucks` - Google Places results appear
5. Click a result → form auto-fills
6. Click "Add to Bucket List" → item appears on dashboard

**That's it!** 🎉

---

## 📚 Full Documentation

| Document | Purpose | Time |
|----------|---------|------|
| [QUICKSTART.md](./QUICKSTART.md) | Checklist of all setup steps | Reference |
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | Detailed Supabase walkthrough | 10 min |
| [GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md) | Detailed Google Cloud walkthrough | 10 min |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deploy to Vercel | 5 min |
| [IOS_SHORTCUT_SETUP.md](./IOS_SHORTCUT_SETUP.md) | iOS share sheet integration | 5 min |
| [README.md](./README.md) | Feature overview & usage | Reference |
| [SETUP.md](./SETUP.md) | Full technical documentation | Reference |

---

## 🎨 Preview the UI

You can see what the dashboard looks like without logging in:

```bash
# Dev server is already running at http://localhost:3000
# Navigate to the preview:
http://localhost:3000/preview
```

Shows sample data like:
- "Visit the Eiffel Tower" (destination, 4.8 stars)
- "Try authentic ramen in Tokyo" (venue, 4.6 stars)
- "Learn to surf in Bali" (activity, no rating yet)
- And more...

---

## 💾 Project Structure

```
bucket-list-app/
├── app/
│   ├── auth/              # Login/signup pages
│   ├── dashboard/         # Main list view
│   ├── items/            # Item detail page
│   ├── add/              # Add/search items page
│   ├── preview/          # Demo dashboard (no auth needed)
│   └── api/              # Backend routes (CRUD, Google Places)
├── lib/
│   ├── supabase.ts       # Database client
│   ├── places.ts         # Google Places helpers
│   ├── deeplink.ts       # URL parsing for share sheet
│   └── ical.ts           # Calendar export
├── public/               # PWA icons & manifest
├── .env.local            # Your credentials (update this!)
├── .env.local.example    # Template
├── QUICKSTART.md         # Start here!
├── SUPABASE_SETUP.md     # Database setup
├── GOOGLE_CLOUD_SETUP.md # API setup
├── DEPLOYMENT.md         # Deploy to internet
└── README.md             # Feature overview
```

---

## 🎯 Next Steps

### Immediate (Today)
1. ✅ Read this file (you are here!)
2. 📱 Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
3. 🔑 Follow [GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md)
4. ⚙️ Update `.env.local` and restart dev server
5. 🧪 Test everything at `http://localhost:3000`

### Soon (Within a week)
1. 🚀 Deploy to Vercel ([DEPLOYMENT.md](./DEPLOYMENT.md))
2. 📱 Set up iOS Shortcut ([IOS_SHORTCUT_SETUP.md](./IOS_SHORTCUT_SETUP.md))
3. ✨ Add to your iPhone home screen (PWA)

### Later (Optional Features)
- [ ] Map view with all items visualized
- [ ] Tag management UI
- [ ] Calendar export (.ics files)
- [ ] Image upload for items
- [ ] Advanced filtering & search
- [ ] Statistics/insights

---

## ⚡ Quick Reference

### Commands

```bash
# Start dev server (hot reload)
npm run dev

# Build for production
npm run build

# Run production build locally
npm start
```

### Important URLs

| URL | Purpose |
|-----|---------|
| `http://localhost:3000` | App (redirects to login if not authenticated) |
| `http://localhost:3000/auth/login` | Login page |
| `http://localhost:3000/auth/signup` | Signup page |
| `http://localhost:3000/preview` | Preview dashboard (no auth needed) |
| `http://localhost:3000/dashboard` | Dashboard (requires login) |
| `http://localhost:3000/add` | Add item form (requires login) |

### Environment Variables

```env
# Supabase (from Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Google Cloud (from Credentials)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIza...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
```

---

## ❓ FAQ

**Q: Do I need to pay for anything?**  
A: No! Supabase free tier is very generous (500 MB database), and Google Cloud gives you $300/month free. You'll stay within the free tier easily.

**Q: Can I use this on mobile?**  
A: Yes! The app is mobile-optimized and works great on iPhone/Android. You can even add it to your home screen as a PWA.

**Q: Does it work offline?**  
A: Partially. The app can load from cache, but data sync requires internet. Full offline support can be added later.

**Q: How do I add features?**  
A: The codebase is well-documented. See [README.md](./README.md) for architecture. The plan file in `.claude/plans/` outlines future phases.

**Q: Can I share lists with friends?**  
A: Not yet, but it's on the roadmap! Currently each account is private.

**Q: How much does it cost to deploy?**  
A: Deployment is free! Vercel's free tier handles personal projects beautifully.

---

## 🆘 Stuck?

1. **Check the relevant setup guide**
   - Supabase issues → [SUPABASE_SETUP.md](./SUPABASE_SETUP.md#troubleshooting)
   - Google Cloud issues → [GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md#troubleshooting)
   - Deployment issues → [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting)

2. **Check browser console** (F12 → Console) for error messages

3. **Restart dev server** after changing `.env.local`

4. **Double-check credentials** - extra spaces break everything!

---

## 📞 Support

- **Setup help**: Read the relevant `.md` file (they have troubleshooting sections)
- **Code questions**: Check [README.md](./README.md) for architecture
- **Deployment help**: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🎉 Ready?

**Follow this sequence:**

1. 📖 Read [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) (~10 min)
2. 📖 Read [GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md) (~10 min)
3. ⚙️ Update `.env.local`
4. 🔄 Restart dev server
5. 🧪 Test at http://localhost:3000

**Good luck!** Your bucket list app is ready to go. 🚀

---

**Questions about a specific step?** Click on any `.md` file linked above for detailed instructions!
