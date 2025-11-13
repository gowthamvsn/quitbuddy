# 🚨 CACHE ISSUE - READ THIS

## The Problem
You are viewing **CACHED OLD CODE** on `localhost:5173`. The dev server is not picking up the new changes.

## The Evidence
- ✅ Source code in `src/App.tsx` has version 2.1
- ✅ Built files in `dist/` have version 2.1
- ❌ Your browser is showing OLD code (no console logs, no "v2.1" badge)

## The Solution (Choose ONE)

### Option 1: Hard Refresh (Easiest)
1. In your browser, press:
   - **Windows/Linux:** `Ctrl` + `Shift` + `R`
   - **Mac:** `Cmd` + `Shift` + `R`
2. You should immediately see:
   - "ReBoot v2.1" badge (red text) in the top header
   - Console log: "🔄 App version: 2.1 - ReBoot FIXED - Timestamp:"

### Option 2: Clear Cache in DevTools
1. Open DevTools (F12)
2. Open the **Network** tab
3. Check the box "Disable cache"
4. Refresh the page (F5)

### Option 3: Incognito/Private Mode
1. Open a new Incognito/Private window:
   - **Chrome:** `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
   - **Firefox:** `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
2. Navigate to `localhost:5173`

### Option 4: Stop and Restart Dev Server
```bash
# Kill the dev server
pkill -f vite

# Start it again
npm run dev
```

## How To Verify It Worked

After hard refresh, you should see:

1. **In the UI:**
   - Top-left header shows: "ReBoot **v2.1**" (v2.1 in red)

2. **In Console (F12 → Console tab):**
   ```
   🔄 App version: 2.1 - ReBoot FIXED - Timestamp: 2025-10-29T...
   ```

3. **When you click "Start Session":**
   ```
   🚀 START AVATAR SESSION CLICKED - VERSION 2.1
   Selected avatar: {id: 'lisa', name: 'Lisa', ...}
   Window location: http://localhost:5173/
   Timestamp: 2025-10-29T...
   🔑 Keys: { speechKey: 'Present', speechRegion: 'eastus' }
   [Avatar Setup] Lisa - Character: lisa Style: casual-sitting Voice: en-US-JennyNeural
   [1/5] Getting speech token...
   [2/5] Token received
   [3/5] Getting ICE credentials...
   [4/5] ICE credentials received {Urls: [...], Username: '...', Password: '...'}
   [5/5] Starting avatar...
   📹 Track received: video readyState: live
   Stream: MediaStream ...
   Setting video srcObject, current srcObject: null
   Video metadata loaded, dimensions: 1920 x 1080
   ✅ Video playing! paused: false readyState: 4
   📹 Track received: audio readyState: live
   Setting audio srcObject
   ✅ Audio playing!
   🎉 Avatar started successfully!
   ```

## Still Not Working?

If after hard refresh you STILL don't see "v2.1" or console logs, then:

1. Check you're actually refreshing the right tab
2. Try closing ALL browser tabs for localhost:5173 and opening fresh
3. Try a completely different browser
4. Restart the dev server (see Option 4 above)
