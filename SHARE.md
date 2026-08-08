# Share Sheet Integration Guide

The Bucket List app supports sharing items from Instagram, Google Maps, and websites through a unified share endpoint.

## Share Endpoint

**Base URL:** `https://bucket-list-app.com/share`

### Share Types

#### 1. Instagram Share
Share Instagram posts and reels to create bucket list items.

**Parameters:**
- `type=instagram` (required)
- `url=<instagram_url>` (required) - Full Instagram post/reel URL
- `title=<title>` (optional) - Item title

**Example:**
```
https://bucket-list-app.com/share?type=instagram&url=https://instagram.com/p/ABC123XYZ/&title=Restaurant%20Name
```

#### 2. Google Maps Share
Share locations from Google Maps to create bucket list items.

**Parameters:**
- `type=google_maps` (required)
- `place_id=<place_id>` (required) - Google Places ID
- `url=<maps_url>` (optional) - Google Maps URL (place_id takes priority)
- `title=<title>` (optional) - Override place name
- `address=<address>` (optional) - Override address

**Example:**
```
https://bucket-list-app.com/share?type=google_maps&place_id=ChIJ...&title=Paris%20Cafe
```

#### 3. Website Share
Share any website as a destination or activity.

**Parameters:**
- `type=website` (required)
- `url=<website_url>` (required) - Full website URL
- `title=<title>` (optional) - Item title

**Example:**
```
https://bucket-list-app.com/share?type=website&url=https://example.com&title=Awesome%20Place
```

## iOS Shortcuts Setup

### Creating a Shortcut from Instagram

1. Open the Shortcuts app
2. Create a new shortcut with these steps:
   - Ask for Instagram post URL
   - Get current page URL (from Safari if on Instagram)
   - Encode URL components
   - Open URL: `https://bucket-list-app.com/share?type=instagram&url=[url]`

### Creating a Shortcut from Google Maps

1. Open the Shortcuts app
2. Create a new shortcut with these steps:
   - Ask for location/place name
   - Use "Search in Maps" to get Google Maps URL
   - Extract place ID from URL
   - Open URL: `https://bucket-list-app.com/share?type=google_maps&place_id=[id]&title=[title]`

### Creating a Shortcut from Any Website

1. Open the Shortcuts app
2. Create a new shortcut with these steps:
   - Get current page URL (from Safari)
   - Get page name (document title)
   - Open URL: `https://bucket-list-app.com/share?type=website&url=[url]&title=[title]`

## URL Encoding

Remember to URL-encode parameter values:
- Spaces: `%20`
- `/`: `%2F`
- `:`: `%3A`
- `?`: `%3F`
- `&`: `%26`

Most shortcut apps handle this automatically with "URL encode text" action.

## Flow

1. User shares from Instagram/Maps/Website
2. Shortcut constructs share URL with appropriate type and parameters
3. Share URL redirects to `/add` page with pre-filled fields
4. User can review and save the item

## Future: Native Share Extensions

Once we build the native iOS app, this share endpoint pattern will be replaced with:
- iOS share extension in the app bundle
- Appears directly in share sheet
- No browser redirect needed
- Seamless experience

The URL scheme will still work as a fallback.
