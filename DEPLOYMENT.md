# Quick Deployment Guide

## 5-Minute Deployment to Vercel

### Prerequisites
- ✅ Supabase account with credentials (see SETUP.md)
- ✅ Google Cloud API key (see SETUP.md)
- ✅ GitHub account

### Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial bucket list app commit"
   git remote add origin https://github.com/yourusername/bucket-list-app
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your repository
   - Click "Import"

3. **Add Environment Variables**
   - Click "Environment Variables"
   - Add these 4 variables:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
     - `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` = your Google API key
     - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = your Google API key

4. **Deploy**
   - Click "Deploy"
   - Wait ~2 minutes for build to complete
   - Your app is live! 🎉

### After Deployment

1. **Update iOS Shortcut**
   - Replace `localhost:3000` with your Vercel URL in the iOS Shortcut
   - See [IOS_SHORTCUT_SETUP.md](./IOS_SHORTCUT_SETUP.md)

2. **Add to Google Cloud Allowed Domains**
   - Go to Google Cloud Console
   - Click on your API key
   - Add HTTP referrer: `https://your-deployment.vercel.app/*`

3. **Test the App**
   - Sign up at your Vercel URL
   - Try adding an item
   - Test Google Places search
   - Share a Maps link using your iOS Shortcut

## Troubleshooting

### "Invalid credentials" after deploy
- Double-check environment variables in Vercel
- Make sure you copied the exact values (no extra spaces)
- Redeploy after adding variables

### Google Places search returns 401
- Check that `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` is set in Vercel
- Verify billing is enabled in Google Cloud Console
- Try refreshing the page

### "Page not found" when visiting deployed URL
- The build might still be running (check Vercel dashboard)
- Try refreshing the page
- Check the Vercel build logs for errors

## Continuous Deployment

Vercel automatically redeploys whenever you push to GitHub:

```bash
git add .
git commit -m "Add new feature"
git push origin main
# Vercel automatically rebuilds and deploys! ✨
```

## Rollback

If something breaks, rollback to a previous deployment:

1. Go to Vercel Dashboard
2. Click your project
3. Go to "Deployments"
4. Click the three dots on a previous deployment
5. Click "Promote to Production"

## Custom Domain

To use a custom domain instead of `*.vercel.app`:

1. In Vercel, go to Settings > Domains
2. Add your custom domain
3. Follow the DNS setup instructions
4. Update your iOS Shortcut to use the custom domain

## Monitoring & Analytics

Vercel provides free:
- Build & deployment logs
- Performance analytics
- Error tracking
- Edge function analytics

Check the Vercel Dashboard to monitor your app's health.

---

See [SETUP.md](./SETUP.md) for full setup instructions
See [README.md](./README.md) for feature overview
