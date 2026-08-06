# Bucket List App

A personal bucket list app for tracking events, activities, venues (bars, restaurants), and travel destinations. Save, organize, search, and mark items as visited.

## Features

✨ **Core Features**
- 📝 Save events, venues, activities, and destinations
- ✓ Mark items as visited with date tracking
- ⭐ Add ratings and personal notes
- 🏷️ Custom tags for organization and filtering
- 🔍 Search and filter by type, tags, or visited status

🗺️ **Maps & Discovery**
- 🌍 View all items on an interactive map
- 🔎 Search Google Places to add items to your list
- 📍 Deep linking from Google Maps via iOS Shortcut
- 🔗 Direct links to Google Maps for each item

📅 **Export & Integration**
- 📥 Add items to your Apple Calendar (export as .ics)
- 🔄 Cloud sync across devices via Supabase
- 📱 Install as a PWA on your iPhone home screen

🎨 **Design**
- 🌙 Dark mode support
- 📱 Mobile-first responsive design
- ⚡ Fast, lightweight, and offline-capable

## Tech Stack

- **Frontend**: Next.js 14+ (React, TypeScript, Tailwind CSS)
- **Backend**: Supabase (Postgres + Auth + Real-time)
- **Maps**: Google Maps JavaScript API + Places API (New)
- **Deployment**: Vercel
- **PWA**: Installable on iOS home screen

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- A Supabase account (free)
- A Google Cloud account with Places API enabled (free tier available)

### Quick Start

1. **Clone or download this project**
   ```bash
   cd bucket-list-app
   npm install
   ```

2. **Set up Supabase and Google Cloud credentials**
   - Follow the [SETUP.md](./SETUP.md) guide for step-by-step instructions

3. **Create `.env.local` with your credentials**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and add your Supabase and Google Cloud keys
   ```

4. **Start the dev server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   - Go to `http://localhost:3000`
   - Sign up or log in
   - Start adding items to your bucket list!

## Usage

### Adding Items

**Option 1: Manual Entry**
- Click "+ Add Item"
- Fill in the title, type, and optional details
- Click "Add to Bucket List"

**Option 2: Search Google Places**
- Click "+ Add Item"
- Use the "Search Google Maps" field
- Click on a result to auto-fill details
- Click "Add to Bucket List"

**Option 3: Share from iPhone (iOS Shortcut)**
- Install the provided iOS Shortcut on your iPhone
- From Google Maps, tap Share → Bucket List
- The app opens with the place pre-filled
- Add notes and click "Add to Bucket List"

### Viewing & Managing Items

- **Dashboard**: See all your items in a grid view
- **Detail View**: Click any item to see full details
- **Mark as Visited**: Click "Mark as Visited" to update status and date
- **Add to Calendar**: Export any item as an `.ics` file to import into Apple Calendar
- **Delete**: Remove items you no longer need

### Filtering & Organization

- **By Type**: Filter by Event, Venue, Activity, or Destination
- **By Tags**: Create custom tags and apply them to items
- **By Status**: Show visited, unvisited, or all items
- **On Map**: View all items spatially and filter by type

### Map View

- Go to the Map section to see all items on an interactive map
- Markers are color-coded by type
- Click a marker for a quick preview
- Filter by type or tag to focus on what matters

## Project Structure

```
bucket-list-app/
├── app/
│   ├── layout.tsx              # Root layout with PWA metadata
│   ├── page.tsx                # Home/redirect page
│   ├── auth/
│   │   ├── login/page.tsx      # Login page
│   │   └── signup/page.tsx     # Signup page
│   ├── dashboard/page.tsx      # Main list view
│   ├── map/page.tsx            # Map view (to be built)
│   ├── items/
│   │   ├── [id]/page.tsx       # Item detail page
│   │   └── page.tsx            # Item form (to be built)
│   ├── add/page.tsx            # Add/import item page
│   ├── tags/page.tsx           # Tag management (to be built)
│   └── api/
│       ├── items/route.ts      # CRUD endpoints
│       ├── places/
│       │   ├── search/route.ts # Google Places search
│       │   └── [placeId]/route.ts # Place details
│       └── items/[id]/
│           └── calendar/route.ts  # Export to .ics
├── components/
│   ├── ItemCard.tsx            # Item card component (to be built)
│   ├── ItemForm.tsx            # Form component (to be built)
│   └── ...
├── lib/
│   ├── supabase.ts             # Supabase client & types
│   ├── places.ts               # Google Places helpers
│   ├── deeplink.ts             # URL parsing utilities
│   └── ical.ts                 # iCal generator
├── public/
│   ├── manifest.json           # PWA manifest
│   └── icons/                  # PWA icons
├── .env.local.example          # Environment template
├── SETUP.md                    # Setup & deployment guide
└── README.md                   # This file
```

## Development

### Running the Dev Server
```bash
npm run dev
```
Opens at `http://localhost:3000` with hot reload enabled.

### Building for Production
```bash
npm run build
npm start
```

### Running Tests (to be added)
```bash
npm run test
```

## Roadmap

### Phase 1 (Current) ✅
- [x] Project setup & auth
- [x] Core CRUD (create, read, update, delete items)
- [x] List view with basic filtering
- [x] Item detail page
- [x] Google Places search integration
- [x] Deep linking from share sheet
- [ ] Map view with markers
- [ ] Tag management & filtering

### Phase 2 (Next)
- [ ] Calendar export (.ics)
- [ ] Advanced filtering & search
- [ ] Image upload for items
- [ ] Real-time sync across tabs
- [ ] Dark mode toggle
- [ ] Offline support (service worker)

### Phase 3 (Future)
- [ ] Stats & insights (most visited types, etc.)
- [ ] Social sharing (share lists with friends)
- [ ] Import/export lists
- [ ] Custom categories & organization
- [ ] Collaboration features

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add environment variables in Vercel settings
4. Click "Deploy"

Your app will be live at a `*.vercel.app` domain and auto-deploy on every push.

### Deploy Elsewhere

The app is a standard Next.js app, so it can be deployed to:
- Netlify
- Railway
- AWS Amplify
- Self-hosted server

See [Next.js Deployment Docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.

## iOS Setup

### Installing as a PWA

1. Open the deployed app in Safari on your iPhone
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Choose a name and tap "Add"

Now the app is installed as a PWA and works like a native app!

### iOS Shortcut for Google Maps Sharing

A custom iOS Shortcut lets you share Google Maps links directly to the app. Instructions and the shortcut file are provided in the repository.

## Contributing

This is a personal project, but feel free to fork and modify for your own use!

## License

MIT License - Feel free to use this however you'd like.

## Support

For questions or issues:
1. Check [SETUP.md](./SETUP.md) for common troubleshooting
2. Review the code comments and git commits
3. Open a GitHub issue if you find a bug

## Future Ideas

- 🌐 Share bucket lists with friends
- 📊 Statistics and insights (most visited places, etc.)
- 🎯 Set goals and milestones
- 🎫 Track events with reminders
- 💰 Budget tracking for trips
- 📸 Photo gallery for visited places
- 🗣️ Reviews and recommendations

---

**Made with ❤️ for organizing your adventures**
