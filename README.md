# 🔥 TORCH — The Football Card Game

Read the defense. Pick your play. Burn the coverage.

A daily football puzzle game with card-based playcalling, AI commentary, and Wordle-style sharing.

---

## Quick Start

### 1. Clone & enter the project
```bash
git init torch-football
cd torch-football
# copy all project files here, or:
# git clone <your-repo-url> && cd torch-football
```

### 2. Run locally (no AI commentary — fallback text works fine)
```bash
npx serve public -l 3000
```
Open [http://localhost:3000](http://localhost:3000) on your phone or in a mobile-width browser window (430px).

That's it. The game is fully playable without any API key or backend.

---

## Enable AI Commentary (Optional)

The game calls `/api/commentary` for Claude-powered play-by-play and defensive coordinator commentary. To enable this:

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Set up your API key
```bash
cp .env.example .env
# Edit .env and paste your Anthropic API key
# Get one at https://console.anthropic.com/settings/keys
```

### 3. Run with API routes
```bash
vercel dev
```
This spins up both the static file server and the `/api/commentary` serverless function locally.

---

## Deploy to Vercel

```bash
# First time — links to your Vercel account
vercel

# Production deploy
vercel --prod
```

After deploying, add your `ANTHROPIC_API_KEY` in the Vercel dashboard:
**Project Settings → Environment Variables → Add `ANTHROPIC_API_KEY`**

---

## Using Claude Code

This project includes a `CLAUDE.md` file that gives Claude Code full context about the game architecture, coding conventions, and known issues. To use it:

### 1. Install Claude Code
```bash
npm i -g @anthropic-ai/claude-code
```

### 2. Run it from the project root
```bash
cd torch-football
claude
```

Claude Code will automatically read `CLAUDE.md` and understand the project structure. Example prompts:

- `"Add a new daily scenario for a 4th-and-goal situation against Cover 0"`
- `"Refactor the buildGame function into smaller helper functions"`
- `"Add a PWA manifest and service worker for offline play"`
- `"The Vertical Threat scheme is overpowered — rebalance it"`
- `"Split the monolith into ES modules with no build step"`

---

## Project Structure

```
torch-football/
├── public/
│   └── index.html        # The entire game (single file, ~3400 lines)
├── api/
│   └── commentary.js     # Vercel serverless function → Anthropic API
├── package.json
├── vercel.json            # Vercel routing config
├── CLAUDE.md              # Context file for Claude Code
├── .env.example           # API key template
└── .gitignore
```

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS (no framework, no build step)
- **Fonts:** Bebas Neue, Press Start 2P, Barlow Condensed (Google Fonts)
- **Audio:** Web Audio API (synthesized 8-bit sounds)
- **AI:** Claude API via serverless proxy (with static fallbacks)
- **Hosting:** Vercel (static + serverless)
- **State:** In-memory `GS` object + localStorage for persistence
