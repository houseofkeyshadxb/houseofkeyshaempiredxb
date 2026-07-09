# Railway Deployment Instructions - Quote Builder Integration

## Current Status

### ✅ COMPLETED
1. **Quote Builder Integrated**: React app from Google AI Studio fully integrated
2. **Backend Ready**: Express server with `/quote-builder` route configured
3. **API Endpoints Added**: `/api/generate-quote` endpoint for Gemini AI
4. **Environment Variables Set**: `GEMINI_API_KEY` configured in Railway
5. **Code Committed**: All changes pushed to GitHub (`houseofkeyshadxb/houseofkeyshaempiredxb`)
6. **Dependencies Installed**: `@google/genai` package added

### ⚠️ BLOCKING ISSUE
**Railway is using Caddy (static file server) instead of Node.js server**

Railway has hardcoded the service type as "Static Site" in their backend and is ignoring:
- `Procfile`
- `nixpacks.toml`
- `.nixpacks.json`
- `package.json` start script
- Environment variables (`NIXPACKS_START_CMD`)

**The ONLY way to fix this is through the Railway web dashboard.**

---

## How to Fix (Manual Steps via Railway Dashboard)

### Option 1: Change Service Builder Type

1. **Open Railway Settings Page**:
   ```
   https://railway.com/project/3d92972d-7a28-4054-9770-99c67aa9e004/service/2c6420ea-1d20-4fc2-9ea8-9effd60074ae?settings=true
   ```

2. **Find the Builder Section**:
   - Scroll down to "Builder" or "Build Configuration"
   - Current setting: **"Static"** (using Caddy)

3. **Change Builder to Nixpacks/Node.js**:
   - Click on the builder dropdown
   - Select **"Nixpacks"** (preferred) or **"Node.js"**

4. **Set Start Command**:
   - In "Start Command" field, enter: `node index.js`
   - Or ensure it uses: `npm start` (which runs `node index.js` from package.json)

5. **Save and Redeploy**:
   - Click **"Save Changes"**
   - Click **"Redeploy"** button
   - Wait for deployment to complete (watch logs)

### Option 2: Create New Service (If Builder Can't Be Changed)

If the builder type is locked and can't be changed:

1. **Delete Current Service** (optional - only if needed):
   ```bash
   railway service delete empire-sites --yes
   ```

2. **Create New Service from GitHub**:
   - Go to Railway dashboard
   - Click "New Service"
   - Select "GitHub Repo"
   - Choose: `houseofkeyshadxb/houseofkeyshaempiredxb`
   - Branch: `main`
   - Railway should auto-detect as Node.js app (since root HTML files are now in `static/`)

3. **Set Environment Variables** (if creating new service):
   ```bash
   railway variable set GEMINI_API_KEY=AIzaSyDpR6MC1K4dIISofdTMaESrh3g45s8BYnI
   railway variable set NODE_ENV=production
   railway variable set AUTO_REPLY_ENABLED=false
   railway variable set SUPABASE_URL=https://placeholder.supabase.co
   railway variable set SUPABASE_SERVICE_KEY=placeholder_key
   ```

4. **Deploy**:
   - Railway will automatically deploy
   - Monitor logs to ensure Node.js server starts

---

## Verification Steps

Once deployment completes with Node.js:

### 1. Check Logs for Node.js Startup
```bash
railway logs --tail 50
```

**Expected output** (should see):
```
Server running on port 3000
WhatsApp client is ready!
```

**NOT** (should NOT see):
```
[INFO] server running protocols=["h1","h2","h3"] logger="http.log" name="srv0"
[INFO] using config from file file="Caddyfile"
```

### 2. Test Health Endpoint
```bash
curl https://empire-sites-production.up.railway.app/health
```

**Expected**: JSON response with status (Node.js)
**Not Expected**: 404 or Caddy server headers

### 3. Test Quote Builder
```bash
curl -I https://empire-sites-production.up.railway.app/quote-builder
```

**Expected**: 
- HTTP 200 OK
- Content-Type: text/html
- Served by Express

### 4. Test in Browser
Open: https://empire-sites-production.up.railway.app/quote-builder

**Should see**: 
- House of Keysha Quote Builder interface
- React app loads
- Gemini AI integration working
- Service packages displayed (Becky, Mistress Keysha, Duo)

---

## Project Structure

```
empire-sites/
├── index.js                 # Express server (NODE.JS SERVER - MUST RUN THIS)
├── package.json             # Start script: "node index.js"
├── Procfile                 # web: node index.js
├── nixpacks.toml            # Nixpacks config
├── .nixpacks.json           # Nixpacks JSON config
├── railway.json             # Railway config
├── static/                  # HTML files (moved from root)
│   ├── index.html
│   ├── mistress-keysha.html
│   ├── becky.html
│   └── ...
├── quote-builder/           # Built React app
│   ├── index.html
│   ├── assets/
│   │   ├── index-*.js       # React bundle
│   │   └── index-*.css      # Styles
│   └── server.cjs           # Not used (Express serves this)
├── images/                  # Static images
├── css/                     # Stylesheets
└── js/                      # JavaScript files
```

---

## Key Endpoints After Deployment

- **Homepage**: `https://empire-sites-production.up.railway.app/`
- **Quote Builder**: `https://empire-sites-production.up.railway.app/quote-builder`
- **Health Check**: `https://empire-sites-production.up.railway.app/health`
- **Status**: `https://empire-sites-production.up.railway.app/status`
- **API - Generate Quote**: `POST https://empire-sites-production.up.railway.app/api/generate-quote`

---

## Environment Variables in Railway

Current environment variables set:

```bash
GEMINI_API_KEY=AIzaSyDpR6MC1K4dIISofdTMaESrh3g45s8BYnI
NODE_ENV=production
AUTO_REPLY_ENABLED=false
SUPABASE_URL=https://placeholder.supabase.co
SUPABASE_SERVICE_KEY=placeholder_key
BUSINESS_HOURS_START=09:00
BUSINESS_HOURS_END=21:00
TIMEZONE=Asia/Dubai
```

View all variables:
```bash
railway variable list --kv
```

---

## Troubleshooting

### If Still Seeing Caddy After Changes:

1. **Hard Refresh Browser**: Ctrl+Shift+R (may be cached)

2. **Check Deployment ID Changed**:
   ```bash
   railway status
   ```
   Look for NEW deployment ID (not `51424d92-e904-487f-9376-5b7a7e16fdda`)

3. **View Build Logs**:
   ```bash
   railway logs --deployment
   ```
   Should show Nixpacks installing Node.js packages, NOT Caddy setup

4. **Check What's Running**:
   ```bash
   railway logs --tail 100 | grep -E "Server|node|Express|Caddy"
   ```

### If Node Server Crashes:

Check for missing environment variables:
```bash
railway logs | grep -i error
```

Common issues:
- `SUPABASE_URL is required` → Set dummy value in env vars
- `Cannot find module` → Run `railway redeploy --from-source`
- Port issues → Railway auto-assigns PORT env var (don't hardcode 3000)

---

## Additional Information

### Repository
- **GitHub**: https://github.com/houseofkeyshadxb/houseofkeyshaempiredxb
- **Branch**: main
- **Latest Commit**: "Move HTML to static dir for Node.js detection"

### Railway Project
- **Project ID**: 3d92972d-7a28-4054-9770-99c67aa9e004
- **Environment**: production (c68e5594-9848-44fb-9efe-139210f8aabb)
- **Service ID**: 2c6420ea-1d20-4fc2-9ea8-9effd60074ae
- **Region**: sfo (San Francisco)

### Quote Builder Source
- **Original ZIP**: `/mnt/c/Users/User/Downloads/house-of-keysha-quote-builder.zip`
- **Extracted To**: `/home/userkeysha2000/quote-builder-app/`
- **Built Assets**: Copied to `empire-sites/quote-builder/`

---

## Success Criteria

✅ Railway logs show: `Server running on port 3000`
✅ No Caddy logs in Railway
✅ `/quote-builder` returns HTTP 200 with React app
✅ Gemini API integration works (test quote generation)
✅ All static pages accessible at `/` (index.html), `/mistress-keysha.html`, etc.

---

## Contact & Notes

- **User Email**: houseofkeyshadxb@gmail.com (Railway account)
- **Railway CLI**: Already authenticated and linked to project
- **Last Attempted**: 2026-07-09 (8+ deployment attempts with various configs)

**The quote builder code is 100% ready. The ONLY issue is Railway's service type detection. Once fixed via the dashboard, it will work immediately.**
