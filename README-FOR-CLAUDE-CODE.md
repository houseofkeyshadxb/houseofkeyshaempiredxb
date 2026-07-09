# Empire Sites - README for Claude Code Sessions

## 🚨 IMPORTANT: Start Here

If you're a new Claude Code session working on this project, read these files in order:

### 1. Master Handoff Document (START HERE)
**Location**: `~/CLAUDE-CODE-HANDOFF-COMPLETE.md`

This contains:
- Complete project overview
- All system architecture details
- Current urgent task (Deploy quote builder)
- Integration instructions (Quote builder + WhatsApp bot)
- Environment & credentials
- Troubleshooting guides
- Session history

```bash
# Read it:
cat ~/CLAUDE-CODE-HANDOFF-COMPLETE.md
```

### 2. Quick Status Check
**Location**: `~/QUOTE-BUILDER-STATUS.md`

Quick summary of quote builder deployment status and next steps.

```bash
cat ~/QUOTE-BUILDER-STATUS.md
```

### 3. Deployment Instructions
**Location**: `./RAILWAY-DEPLOYMENT-INSTRUCTIONS.md` (this repo)

Detailed Railway deployment fix guide.

```bash
cat ./RAILWAY-DEPLOYMENT-INSTRUCTIONS.md
```

### 4. Quick Start Prompt
**Location**: `~/CLAUDE-PROMPT-FOR-QUOTE-BUILDER.txt`

Copy-paste this into Claude Code to get started quickly.

```bash
cat ~/CLAUDE-PROMPT-FOR-QUOTE-BUILDER.txt
```

---

## Current Status

⚠️ **URGENT**: Quote builder is 95% complete but Railway is using Caddy (static server) instead of Node.js.

**What's Done**:
- ✅ Quote builder fully integrated
- ✅ Gemini API configured
- ✅ All code committed to GitHub
- ✅ Express server ready with `/quote-builder` route

**What's Blocked**:
- ⚠️ Railway service type must be changed from "Static" to "Node.js" via dashboard
- This is a MANUAL step (Railway CLI doesn't support it)

**Instructions**: See `~/CLAUDE-CODE-HANDOFF-COMPLETE.md` Section: "CURRENT URGENT TASK"

---

## Quick Commands

### Check Railway Status
```bash
railway status
railway logs --tail 50
```

### Test Locally
```bash
node index.js
# Then open: http://localhost:3000/quote-builder
```

### Deploy Changes
```bash
git add .
git commit -m "Your message"
git push origin main
railway redeploy --from-source -y
```

---

## Project Structure

```
empire-sites/
├── index.js                          ← EXPRESS SERVER (must run this!)
├── package.json                      ← "start": "node index.js"
├── static/                           ← HTML pages (moved from root)
│   ├── index.html
│   ├── mistress-keysha.html
│   └── becky.html
├── quote-builder/                    ← REACT QUOTE BUILDER (integrated)
│   ├── index.html
│   └── assets/
│       ├── index-*.js
│       └── index-*.css
├── images/                           ← Static assets
├── css/                              ← Stylesheets
├── js/                               ← JavaScript files
├── Procfile                          ← Railway start command
├── nixpacks.toml                     ← Nixpacks config
├── .nixpacks.json                    ← Nixpacks JSON
└── RAILWAY-DEPLOYMENT-INSTRUCTIONS.md ← Deployment guide
```

---

## Key URLs

- **Live Site**: https://empire-sites-production.up.railway.app
- **Quote Builder** (when fixed): https://empire-sites-production.up.railway.app/quote-builder
- **GitHub**: https://github.com/houseofkeyshadxb/houseofkeyshaempiredxb
- **Railway Dashboard**: https://railway.com/project/3d92972d-7a28-4054-9770-99c67aa9e004

---

## Contact / Session Info

- **Owner**: houseofkeyshadxb@gmail.com
- **Date Created**: 2026-07-09
- **Last Session**: Quote builder integration (95% complete)
- **Next Step**: Fix Railway service type → Deploy

---

**READ THE MASTER HANDOFF DOCUMENT FIRST**: `~/CLAUDE-CODE-HANDOFF-COMPLETE.md`

It has everything you need!
