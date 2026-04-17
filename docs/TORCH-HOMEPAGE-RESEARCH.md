# TORCH Homepage Design Research

**Date:** 2026-04-15
**Brief:** Reimagine TORCH Football's home/title screen. Target: mobile-first (375×812 iPhone baseline) with Capacitor wrapping for iOS + Android app stores.
**Sources:** Web research + domain knowledge. The Gemini deep research query was started but its MCP server disconnected before results returned; this document synthesizes WebSearch findings + established game-UI knowledge.

---

## 1. Best-in-class examples (with takeaways)

### Balatro — *the north star*
- **What it does:** dark velvet canvas, pixel-art wordmark at top, jokers drift across screen, dust/particle ambience, synthwave audio loop. Menu is a **left-anchored vertical stack** (CONTINUE RUN, NEW RUN, COLLECTION, CHALLENGES, OPTIONS). CRT scanline filter on everything.
- **Lesson:** *commitment to a single aesthetic register*. Balatro doesn't chase multiple vibes; every element reinforces "seedy back-room poker." The home screen feels like a place.
- **Ref:** [Balatro on Game UI Database](https://www.gameuidatabase.com/gameData.php?id=1935), [GamesRadar on the near-miss name "Fool's Gambit"](https://www.gamesradar.com/games/roguelike/before-balatro-took-over-the-world-the-roguelikes-creator-considered-naming-it-fools-gambit-obviously-not-a-great-name-but-it-had-a-killer-main-menu/)

### Slay the Spire
- Stone-gate + lantern + bell. Menu: CONTINUE, NEW GAME, STATS, COMPENDIUM, OPTIONS. Atmospheric low-fi ambient score.
- **Lesson:** home-as-threshold. The gate metaphor tells you you're about to enter somewhere specific.

### Inscryption
- Cabin-in-the-woods CRT horror. Single verb: BEGIN. No alternate paths on the home screen.
- **Lesson:** extreme commitment. If your game has one verb, show one verb.

### Monster Train
- Warm orange locomotive glow on dark background. Tight menu.
- **Lesson:** color temperature IS the brand. Warm orange = infernal but inviting.

### ESPN College GameDay (2024 rebrand)
- Stadium-atmosphere is the core design element. The new logo is a **shield with notches representing bleachers, uprights, end zones, and field lines**. Graphics layer crowd signs, mascots, "frenzy." Multi-layered environment, not a flat logo.
- **Ref:** [NewscastStudio on ESPN 2024 CFB overhaul](https://www.newscaststudio.com/2025/09/19/espn-college-football-branding-design-graphics/), [Compadre on GameDay package](https://hicompadre.com/work/espn-college-gameday-show-graphics-package/)
- **Lesson:** the best CF visual identity does **not** show a football or a helmet. It shows *the crowd + the shield.*

### EA College Football 25 / Madden Mobile / NBA 2K Mobile
- Personalized dashboard over static title screen. "Your team" front and center. News strip. Daily challenges. Store.
- EA Sports is applying a "hybrid of mobile app styling and social media type animated graphics" to appear young ([Operation Sports critique](https://forums.operationsports.com/forums/forum/football/madden-nfl-football/898627-ea-sports-their-ui-design-choices)).
- **Lesson:** premium sports mobile is a dashboard, not a title screen. But dashboards are cold. TORCH is narrative-first, so we should **resist** full dashboard-ification and stay closer to Balatro's "place" model.

### Game UI Database (reference)
- 1,300+ games, 55,000+ UI screenshots filterable by screen type. Title Screens: [Game UI Database Title Screen section](https://www.gameuidatabase.com/index.php?scrn=1). Canonical research tool.

### Disco Elysium / Cultist Simulator (narrative indie)
- Disco Elysium: dim painterly hotel room. Title treatment is a typographic logotype. Committed, atmospheric, reading-heavy.
- Cultist Simulator: the home screen IS a card you click. Play-style + visual-style are identical from moment one.
- **Lesson:** for narrative indies, the home screen teaches the ludonarrative register.

---

## 2. Structural — what belongs where

### Essential on the home surface
1. **Primary verb** (the one big CTA): typically "CONTINUE" if a save exists, else "NEW GAME."
2. **Team/identity signal**: TORCH wordmark, flame, maybe a secondary mark like your most-recently-coached team's wordmark or helmet.
3. **Season/streak/record proof**: one compact data point — *"3-W streak • current coach"*. Not a full dashboard.

### Second-tier (visible but not primary)
- Daily Drive (if you ship a daily-challenge mode)
- Settings
- Achievements / Trophy Case

### Drawer / menu only (not on home)
- Shop / Cosmetics
- Patch Notes
- Credits
- Leaderboards
- Team Creator
- Mockups / Dev tools (you already gate this with `?dev`)

### Best practice: the one-second rule
The PLAY button must be **large, centered, distinctive** ([Hitem3D on mobile game design](https://www.hitem3d.ai/blog/en-Mobile-Game-Design-Best-Practices-and-Key-Differences-from-PC-and-Console/)). If the primary action isn't obvious within one second of the screen appearing, the design failed.

---

## 3. First-30-seconds psychology

| Signal | What it tells the player |
|---|---|
| **Splash duration** (<1.5s) | "This isn't a bloated game." |
| **Studio logo reveal** | "Someone made this deliberately." |
| **Ambient audio on launch** | "The world is already running." Balatro, Slay the Spire both do this. Mobile-safe via silent-sample unlock. |
| **Stable wordmark animation** (not a splashy jump) | "This is confident." |
| **Save-state awareness** | "The app remembers me." Show CONTINUE first if a save exists. |
| **Crowd/atmosphere loop** | Establishes place. You already have `crowd_mid_loop_*` audio. |
| **Season/calendar context** | "There's a rhythm to this game." |

### Anti-patterns
- Studio splash longer than 2s (perceived as amateurish delay)
- Tutorial prompt on home screen (treat tutorials as gameplay, not chrome)
- Multiple equal-weight CTAs (classic "icon soup")
- Dashboard with 8+ tiles (you're not a news app)
- Generic dark-gradient + gold-flame rendering (AI-slop default)

---

## 4. College football visual vocabulary (steal from)

Real CF visual language is **not** "helmet + football + shield rendered in 3D." It's older, warmer, paper-and-print.

| Motif | Why it works for TORCH |
|---|---|
| **Gameday program covers** (1920s-1970s) | Rich illustrated covers, heavy typography. Very specific CF nostalgia. See [Historic Football Posters](https://www.historicfootballposters.com/), [Sports Poster Warehouse](https://sportsposterwarehouse.com/collections/vintage-ncaa-program-cover-prints) |
| **Stadium crowd atmosphere** | ESPN's 2024 rebrand explicitly centers this. Signs, mascots, bleacher texture. |
| **Gameday shield / crest** | ESPN's 2024 shield uses notches for bleachers, uprights, end zones — a structural visual pun. Worth stealing for TORCH's own mark. |
| **Bowl-game medallions** | Trophy coins, heavy chrome, Roman numerals. (Your helmet generator already taps this — reuse.) |
| **Ticket stubs** | Perforation, printed aesthetic, dates + seat numbers as typographic ornament. |
| **Chalkboard diagrams** | X's and O's, coach's clipboard. Especially good for a deckbuilder that's about *reading the defense.* |
| **Yearbook typography** | Playfair, Teko, Marcellus — you already have these. |
| **Letterman jackets / chenille patches** | Warm nostalgic CF aesthetic. You already touched this in icon Plate VI. |

**Don't steal:** generic football-field green turf, stadium spotlight cliché, holographic hologram-style 3D helmets, EA Sports synthetic gloss. Those are the visual vocabulary of mainstream sports games — TORCH is *indie-narrative* and should lean older/warmer/more printed.

---

## 5. Mobile-first UX patterns

1. **One-thumb reachability.** Primary CTA in the bottom 60% of screen (375px wide × 812px tall baseline — iPhone 13/14/15).
2. **Splash-to-home under 1s.** Use a 300-500ms cross-fade. Don't linger.
3. **CONTINUE > NEW GAME hierarchy.** If a save exists, CONTINUE is the primary button; NEW GAME is secondary/smaller. Mobile players play in micro-sessions ([BamBamTastic on mobile game design](https://bambamtastic.com/mobile-game-ui-design/)).
4. **Aggressive autosave + scene-restoration.** Per [Hitem3D](https://www.hitem3d.ai/blog/en-Mobile-Game-Design-Best-Practices-and-Key-Differences-from-PC-and-Console/): "Never force a player to search for a save point — frequent autosaving is important for mobile games."
5. **Safe-area-inset awareness.** You've already done the work here (phase 2 of mobile prep). Home screen must respect notches + home indicators.
6. **Haptic on primary tap.** Already wired via `Haptic.cardTap()`.
7. **Thumb-reachable secondary nav.** Drawer or bottom sheet, not top nav.
8. **No hover states.** Design for touch-only.

---

## 6. Anti-patterns to avoid

From [PC Gamer's "19 worst game design crimes"](https://www.pcgamer.com/game-design-sins/), [From Dust Scratch Games](https://www.fromdustscratch.com/2015/11/bad-game-design-by-example/), and [Wayline's anti-pattern guide](https://www.wayline.io/blog/anti-pattern-game-design):

1. **Icon soup.** 6+ tile layout with no clear primary. Looks like a launcher, not a game.
2. **Unlabeled glyphs.** If a player must guess what a button does, you lost them.
3. **Exit that restarts.** Respect platform conventions. (Not strictly a TORCH risk — just don't add it.)
4. **Fake "premium" shader effects.** Excessive bloom + chromatic aberration + film grain used to mask shallow design. Readers see through it.
5. **Feature creep on home.** News ticker + shop + patch notes + daily + friends + store + social → players bounce.
6. **Text-heavy tutorials on home.** Tutorials belong in first-launch gameplay, not in the shell.
7. **Over-animated.** One ambient motion loop, maybe two. Not seven simultaneous parallax effects.
8. **Generic "dark gradient + glowing orange + flame." (AI-slop default.) You're already past this risk because the team-select and brand language are specific — just don't backslide.**

---

## 7. Five home screen archetypes to prototype

Each commits to a different strategic bet. All 5 can use the 4-layer flame + 9-layer football + TORCH wordmark. Difference is in composition, hierarchy, and what the home screen tells you TORCH *is.*

### A. STADIUM ARRIVAL — *cinematic, atmospheric*
**The bet:** *We lean into "arriving at a night game."* Home screen is a moody stadium approach — backlit crowd silhouettes, stadium lights bleeding into fog, distant crowd loop audio. Foreground: tight TORCH wordmark with a vertical "PRESS START" / "TAP TO PLAY" below.
- **Primary anchor:** atmospheric backdrop
- **CTA:** single central button
- **Secondary:** small coach badge + streak at top, settings gear bottom-right
- **Reference:** ESPN GameDay 2024 rebrand + Inscryption's cabin
- **Why it works:** establishes place, teaches you TORCH is narrative-atmospheric-first
- **Why it fails:** could feel film-trailer-posey, hard to reuse for 8 teams' color identities

### B. THE PROGRAM — *vintage gameday program cover*
**The bet:** *We lean into printed CF nostalgia.* Home screen is a gameday program cover — the TORCH wordmark as a Teko headline, a centered hero illustration (flame + football), a date banner, team vs team strip at the bottom (if there's a scheduled next game). Edges feel like a printed paper program.
- **Primary anchor:** centered hero illustration
- **CTA:** "OPEN" or "KICKOFF" in a stamp/button at the bottom of the cover
- **Secondary:** program-interior links (Achievements → "Hall of Fame", Shop → "Concession Stand", etc.)
- **Reference:** 1960s NCAA program covers, your [Volume I Plate IV Sancta VIII](/mockups/app-icons.html)
- **Why it works:** deeply CF-native, evokes nostalgia, turns mundane menu items into diegetic page references
- **Why it fails:** can feel twee; requires design polish to not look parody

### C. LOCKER ROOM — *personal, your-team-forward*
**The bet:** *We lean into identity + return.* Home screen is "your locker" — your most recently coached team's helmet on a bench or locker, their wordmark above, your coach name on a nameplate, your streak + record displayed. CONTINUE is implicit ("Step into the locker.")
- **Primary anchor:** team helmet (generated from your helmet tool)
- **CTA:** "CONTINUE COACHING" or "NEW GAME" if no save
- **Secondary:** switch team, daily drive, settings
- **Reference:** NBA 2K MyCareer "my house" screen, Madden franchise hub
- **Why it works:** personalized, strong "return to the app" feel, leverages the helmet generator work we just built
- **Why it fails:** locks into a "career" frame that might not match TORCH's single-session scope; needs save-state awareness; first-launch experience is trickier

### D. BROADCAST DECK — *scorebug / sportscast chrome*
**The bet:** *We commit to broadcast-graphic visual language.* Home screen is a sportscast set: scorebug across the top, "PREGAME" headline, a "PLAY BALL" CTA in network-gold. Secondary tiles styled like lower-third graphics (achievements = trophy case, daily = upcoming game). Maybe a scrolling ticker along the bottom with recent results.
- **Primary anchor:** broadcast scorebug headline
- **CTA:** "KICKOFF" / "PLAY BALL" in a network-gold bar
- **Secondary:** ticker, small chiclet tiles
- **Reference:** ESPN GameDay, Monday Night Football, NFL RedZone
- **Why it works:** distinctive visual territory (no other card game uses it), signals "sports" instantly, extensible for future features
- **Why it fails:** can feel cold / dashboard-y; broadcast chrome is Big Brand, TORCH is small-studio

### E. COIN TOSS RITUAL — *single-verb commitment, Inscryption-level confidence*
**The bet:** *We commit to a single ceremonial action.* Home screen shows a coin mid-toss (your kickoff ritual is already cinematic v0.36.0 "Kickoff Ritual"). Tap the coin → flip → land → game begins. TORCH wordmark above, nothing else visible. Gear icon minimized in corner.
- **Primary anchor:** the coin
- **CTA:** the coin itself (tap to flip = start)
- **Secondary:** NONE on home. Everything in drawer.
- **Reference:** Inscryption single-BEGIN, Balatro's card-as-menu, your existing coin toss
- **Why it works:** extreme commitment, deeply ritualistic, ties home to the first moment of gameplay, unforgettable
- **Why it fails:** hardest to build; requires discoverability for secondary features; demands lots of polish to not feel empty

---

## Recommended direction

**My top two bets to prototype:**

1. **Archetype B (THE PROGRAM)** — strongest TORCH-specific identity, leans hardest into college football visual vocabulary, which nobody else in the mobile card game space is doing. Pairs beautifully with the Ember Eight lore. Your existing Teko + Marcellus + Italiana typography is already set up for this.

2. **Archetype E (COIN TOSS RITUAL)** — highest-risk, highest-reward. If you ship this with confidence, it's the kind of home screen that becomes a GIF people share on Twitter. It also resolves the mobile-home-screen anti-patterns by commitment: you literally can't icon-soup a coin.

**Hybrid worth considering:** Program (B) chrome around a Coin (E) central action — the TORCH wordmark + date banner + "KICKOFF" button sit in a printed-program frame, but when you tap, the frame recedes and the coin flips. Preserves atmosphere AND commitment.

**My bet I'd skip first:** Archetype C (LOCKER ROOM) — has the most potential personalization payoff but is tricky to nail at first-launch (no team yet) AND for narrative scope (TORCH is single-session, not a career app). Save for v2 when personalization features mature.

---

## Next session

If you want to move forward:
1. Approve 2-3 archetypes to mockup.
2. I'll produce `public/mockups/home-{archetype}.html` files, each a functional HTML prototype at the 375×812 mobile viewport.
3. You pick a winner (or hybrid), I wire it into `src/ui/screens/home.js` replacing the current stub.
