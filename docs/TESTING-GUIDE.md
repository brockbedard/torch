# TORCH Football — Testing Quick-Start Guide

## 1. Starting a Test Session

```bash
npx vite --host
# Runs at localhost:5173
# Phone: use LAN IP shown in terminal (e.g. http://192.168.x.x:5173)
```

Add `?dev` to any URL to enable the dev panel (auto-opens on desktop, tap DEV button on mobile).

**Clean slate:**
```js
localStorage.clear()  // in browser console — wipes save, season progress, all state
```

---

## 2. Dev Panel Reference

Access: `?dev` in URL, or `localStorage.setItem('torch_dev', '1')`.

### Quick Start
| Control | What it does |
|---|---|
| Jump to Gameplay (OFF) | Start mid-game on offense — skips team select, roster, pregame |
| Jump to Gameplay (DEF) | Start mid-game on defense |
| Team / Opp dropdowns | Pick which team you play and which you face |

### Game State
| Control | What it does |
|---|---|
| Down selector | Set 1st–4th down |
| Dist input | Set yards to go |
| Ball input | Set ball position (0–100, where 100 = your end zone) |
| You / Opp score inputs | Set current score |
| Apply State | Commit all game state fields above |

### Hand Management
| Control | What it does |
|---|---|
| Redeal Hand | Fresh 4-play + 4-player hand |
| Reset Discards | Clear discard history, full hand available again |
| Show ST Deck Info | Log special teams deck state to console |
| Burn 10 ST Players | Fast-forward ST fatigue to test depleted deck behavior |

### Torch Cards
| Control | What it does |
|---|---|
| BRONZE / SILVER / GOLD | Add all implemented cards of that tier to your hand |
| SURE HANDS | Give yourself Sure Hands (Gold reactive) |
| CHALLENGE | Give yourself Challenge Flag (Silver reactive) |
| BLK KICK | Give yourself Blocked Kick (Gold reactive) |
| TIMEOUT | Give yourself Iron Man (Silver) |
| IRON MAN | Give yourself Iron Man (Silver) |
| HSE CALL | Give yourself House Call (Gold) |
| COFFIN | Give yourself Coffin Corner (Bronze) |
| CANNON | Give yourself Cannon Leg (Silver) |
| SCOUT RPT | Give yourself Scout Report (Silver) |
| FRESH LEGS | Give yourself Fresh Legs (Bronze) |
| Open Store | Force the Torch Store to open |
| +500 PTS | Add 500 TORCH points to your wallet |
| Clear Cards | Wipe your entire Torch Card hand |

### Season & Flow
| Control | What it does |
|---|---|
| View Roster | Jump to roster screen |
| Replay Coin Toss | Re-trigger coin toss from current game |
| Force Kickoff | Re-trigger kickoff from current state |
| Jump to Halftime | Jump to halftime screen immediately |
| Jump to Season Recap | Jump to season recap with mock 2-1 record |
| Set Game 2/3 | Advance season.currentGame for mid-season testing |
| Trigger Daily Drive | Navigate to Daily Drive screen |
| Jump to 2-Min Drill | Set plays used to max, activate 2-minute clock |
| Jump to 4th Down (past 50) | Set 4th & 5 in opponent territory (punt/FG options appear) |
| Jump to 4th Down (own territory) | Set 4th & 8 in own territory (go for it forced) |
| Force End Game | Jump to end game screen |

### Momentum & Heat
| Control | What it does |
|---|---|
| Max Momentum P1 | Set first player's momentum to 5 (gold/red pips visible) |
| Max Heat P1 | Set first player's heat to 5 (TIRED badge visible) |
| Reset All Heat | Clear all heat maps (all players fresh) |

### Score Shortcuts
| Control | What it does |
|---|---|
| Force 2-Min Drill | Set twoMinActive=true, clock=60s, playsUsed=19 |
| Set Score 21-14 | Human leads (test winning scenarios) |
| Set Score 7-21 | Human trails (test comeback scenarios) |
| Force Game Over | Set gameOver=true |

### Achievements
| Control | What it does |
|---|---|
| Clear Achievements | Remove all achievement unlocks |
| Clear All Progress | Wipe ALL torch_* localStorage keys |

### Feature Flags
| Control | What it does |
|---|---|
| 15 toggle buttons | Enable/disable individual features: momentum, combos, drive heat, tutorial, weather audio, smart highlights, achievements, streaks, etc. Green=ON, gray=OFF. Persists to localStorage. |

### Force Next Result
Arm one of these before snapping — result fires once then clears.
| Control | What it does |
|---|---|
| TD | Force a touchdown on next snap |
| Exploit | Force a positive/big play |
| Covered | Force a stop / negative result |
| Turnover | Force a turnover |
| Conv GOOD | Force conversion success |
| Conv FAIL | Force conversion failure |

> Armed result shown as red badge in the corner. Fires on next snap only.

### Bias Test
| Control | What it does |
|---|---|
| Poss Change (good) | Trigger a good possession cutscene (interception by user) |
| Poss Change (bad) | Trigger a bad possession cutscene (opponent scores) |
| Flip Possession | Swap who has the ball |

### Utils
| Control | What it does |
|---|---|
| Reset Game | Wipe game state and return to home |
| State readout | Live JSON snapshot of possession, score, down, distance, TORCH pts |

---

## 3. Sequential Testing Plan

### Testing Progress (as of 2026-03-29)

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1 — Core Gameplay | ✅ DONE | Full games played, snap→result→points flow verified |
| Phase 2 — Torch Cards | ⬜ NOT STARTED | All 25 cards need individual testing |
| Phase 3 — Season Flow | ⬜ NOT STARTED | 3-game season + championship untested |
| Phase 4 — New Systems | ⬜ NOT STARTED | Momentum, combos, stats, Daily Drive untested |
| Phase 5 — Season & Progression | ⬜ NOT STARTED | Achievements, streaks, history untested |
| Phase 6 — Settings & Save | ⬜ NOT STARTED | Speed toggle, save/resume untested |
| Phase 7 — Mobile & Visual Polish | 🟡 PARTIAL | Caught snap blocking, card dealing, tooltips. Celebrations untested. |
| Phase 8 — Onboarding | 🟡 PARTIAL | Tutorial flow tested + fixed. First-TD/shop/discard tooltips untested. |

**Bugs found and fixed during Phase 1/7/8 testing:**
- Mobile snap button blocked by torch card row (FIXED)
- Crowd audio loop gap (FIXED)
- Torch card deselection not working (FIXED x2)
- Grammar: plural team verbs (FIXED)
- "NO TORCH CARD" label too long (FIXED)
- "P1" on scoreboard unclear (REMOVED)
- Audible button removed (FIXED — tap-to-deselect replaces it)
- Tutorial overlay blocking mobile taps (REVERTED to inline)
- Scouting report duplicate text + low team color (FIXED)
- Cards dealing before kickoff (FIXED)
- Auto-advance after snap (REMOVED — player must tap)
- Torch points not visible in play-by-play (FIXED — color-coded breakdown)
- TAP FOR NEXT PLAY wrapping to 2 lines (FIXED)
- Auto-skip torch phase when no playable cards (FIXED)
- Kickoff result missing team branding (FIXED)
- PLAYER field slot not flashing during tutorial (FIXED)

---

### Phase 1 — Core Gameplay (10 min) ✅ DONE

- Clear localStorage, start fresh
- Verify tutorial tooltip appears on first snap (1st & Goal from the 9)
- Play 5 snaps on offense:
  - Cards deal with animation
  - Tap a play card, then a player card
  - Snap fires, result displays
  - Cards redeal (used slots replace, others carry over)
- Score a TD:
  - Celebration fires
  - TORCH points animate in
  - Torch Store opens (before kickoff)
- Switch to defense (let opponent drive or use Quick Start DEF):
  - Card selection works on defense
  - Results show in correct color framing (red = bad for opponent)

### Phase 2 — Torch Cards (15 min)

**Reactive cards (decision prompts):**
- Give yourself **SURE HANDS**, force a turnover → snap
  - Prompt appears: USE IT / SAVE IT
  - Tap USE IT: turnover cancelled, drive continues
  - (Test SAVE IT too — card should stay in inventory)
- Give yourself **CHALLENGE FLAG**, force a sack → snap
  - Prompt appears: USE IT / SAVE IT
  - Tap USE IT: 50% reroll

**Auto-consume cards (toast notifications):**
- Give yourself **COFFIN CORNER**, punt on 4th down → verify toast: "COFFIN CORNER!"
- Give yourself **FAIR CATCH GHOST**, punt → verify toast
- Give yourself **CANNON LEG**, attempt FG → verify FG range extended + toast
- Give yourself **RINGER**, attempt FG → verify best kicker auto-selected + toast
- Give yourself **HOUSE CALL**, let opponent score → verify kickoff return 50+ yards + toast
- Give yourself **ICE THE KICKER**, let opponent attempt FG → verify toast
- Give yourself **BLOCKED KICK**, let opponent punt or FG → verify 35% block chance + toast

**Pre-snap cards:**
- Give yourself **SCOUT TEAM** → verify opponent's play revealed before you pick
- Give yourself **SCOUT REPORT** → verify 7 players shown (not 4)
- Give yourself **PERSONNEL REPORT** or **PRE-SNAP READ** → verify opponent player reveal overlay (2s, blocks SNAP)
- Give yourself **IRON MAN** → verify burned ST player restored (or refunded if none burned)
- Give yourself **TIMEOUT** → verify +30s in 2-min drill (or refunded if not 2-min)
- Give yourself **FRESH LEGS** → verify extra discard available
- Give yourself **GAME PLAN** → verify featured player's heat resets

**Standard pre-snap cards (verify effect in snap result):**
- DEEP SHOT (2x pass yards), TRUCK STICK (2x run + no fumble), PRIME TIME (OVR=99)
- PLAY ACTION (+5 vs run defense), SCRAMBLE DRILL (negative→0), 12TH MAN (+4 yards + 2x TORCH)
- ICE (zero opponent OVR), HARD COUNT (randomize opponent play)

**Shop:**
- Use **+500 PTS**, open store, buy a card → verify inventory + balance update
- Buy with full inventory (3 cards) → verify swap UI appears and cancel works

### Phase 3 — Season Flow (10 min)

- Play through 3 games (use Force End Game + Play Again to speed up)
- Verify season progress label updates on team select screen
- After game 3: season recap screen appears
- If 2+ wins: championship game path offered
- Win the championship: verify title display on team select

### Phase 4 — New Systems (15 min)

- **Momentum pips:** Use same player 3+ times on matched plays (RB on runs) → gold pips appear on card
  - Use dev panel "Max Momentum P1" to verify immediately
- **Heat badges:** Use a player 5+ times → WARM (orange) then TIRED (red) badge appears
  - Use dev panel "Max Heat P1" to verify immediately
- **Drive heat bar:** Visible at bottom of screen, climbs on good plays, drops on bad
- **Stats sheet:** Tap the scorebug → stats overlay slides up
- **Pregame scouting report:** Shows opponent scheme, star players, matchup assessment
- **Daily Drive:** Home screen → DAILY DRIVE → verify seeded matchup, play through, result saves, can't replay same day
- **Audible:** Select play + player → AUDIBLE button appears top-right + DEF TENDENCY hint shows → tap to change play (player stays)
- **Win probability:** Was in scorebug (now hidden by default for declutter — verify it's not showing)
- **Play-by-play ticker:** Scrolling text below scorebug showing recent plays
- **Play clock bar:** Thin bar in scorebug showing plays remaining (colors from gray → gold → red)
- **LAST PLAY flash:** Red "LAST PLAY" text appears before 2-minute drill starts
- **Card combos:** Play DEEP SHOT + TRUCK STICK in same drive → green "DOUBLE THREAT!" flash
  - Other combos: SCOUT TEAM + PERSONNEL REPORT, ICE + HARD COUNT, 12TH MAN + PRIME TIME, SURE HANDS + SCRAMBLE DRILL
- **Achievements:** Win a game → check Settings → achievements gallery should show unlocked
- **Streaks:** Win 2+ in a row → end game shows "2-GAME WIN STREAK" in gold
- **Game history:** Settings → recent games list with W/D/L pips
- **Newspaper headline:** End game shows contextual headline ("BOARS SURVIVE SERPENTS IN 24-21 THRILLER")
- **Film Room:** End game → Film Room → Play of the Game + Key Moments + Game Grade (A+ through D)

### Phase 5 — Season Mode & Progression (10 min)

- Play 3 games (use Force End Game to speed up)
- After each game: "NEXT GAME — vs [TEAM]" button should appear (not "PLAY AGAIN")
- Team select should show "CONFERENCE SEASON — GAME 2 OF 3"
- After game 3: Season Recap screen with record, game results, championship path
- If 2+ wins: "CHAMPIONSHIP GAME" button → play the game → win for "NATIONAL CHAMPIONS"
- Championship titles show on team select: "5-2 · 1× CHAMP"
- Halftime: Choose aggressive/balanced/conservative → verify 2nd half feels different

### Phase 6 — Settings, Speed & Save/Resume (10 min)

- **Settings screen:** Home → SETTINGS → verify audio toggle, speed selector, achievements gallery with progress bar, game history with form pips, all-time stats, version display
- **Game speed:** Home → toggle FAST or TURBO → start game → animations should be noticeably faster
- **Save/resume:** Mid-game, refresh browser → home screen should show "RESUME GAME" button → tap it → verify score/possession/field position roughly restored
- **Daily Drive:** Home → DAILY DRIVE → verify seeded matchup → finish game → revisit → shows result + share button

### Phase 7 — Mobile & Visual Polish (10 min)

- Test on phone via LAN URL
- Check safe area (iPhone notch / dynamic island) — scorebug and cards should not clip
- Verify card lift on touch (10px + shadow)
- Verify haptic feedback on card taps, snaps, TDs (mobile only)
- Check end game: breathing room between sections, headline reads well
- Check TD celebration: team-specific confetti colors + catchphrase
- Check sack: hard shake + red vignette (offense) or green "SACKED!" (defense)
- Check turnover: red/green edge glow + "YOUR BALL!" or "Possession lost."
- Check red zone: field glows, ball position turns red, "RED ZONE" flash on entry
- Check 2-minute drill: pulsing border, clock color escalation (white → gold → red)
- Check end-of-half: "END OF HALF" or "FINAL" overlay with score + whistle

### Phase 8 — Onboarding (Fresh Eyes Test) (10 min)

- Clear ALL localStorage: `localStorage.clear()`
- Start game from home screen (should be "first season" mode)
- Verify: tutorial glow highlights play cards (gold pulse, player cards dimmed)
- Pick a play → glow shifts to player cards
- Pick a player → "TAP SNAP!" in green
- Snap → tutorial disappears permanently
- Score first TD → "YOUR SCORE IS YOUR WALLET" explainer appears (3.5s)
- First shop opens → instructional banner at top
- On game 2: discard button shows "NEW! Swap out bad cards" tooltip
- Situational hints should show on first game: "3rd & short — run or quick pass"
- Smart card highlights: "STRONG" label on situationally good plays

---

## 4. Known Issues / Balance Notes

| Issue | Status |
|---|---|
| Easy difficulty win rate 88–98% in sim | By design, but may feel trivial |
| Tie rate on Medium/Hard 14–26% (target <10%) | Elevated — watch for ties feeling too common |
| Sentinels (Boars) underperform on Medium | Likely run-heavy scheme punished by AI play selection |
| Big play rate slightly elevated on Easy | Minor — extra +1.0 mean yard bonus overshoots |
| gameplay.js 4200+ lines | Tech debt — works but hard to navigate |
| Bundle 650KB | Vite warns at 500KB — code splitting candidate |
| Serpents OP on Easy (98% win rate) | Scheme advantage compounds with Easy buffs |
| TIMEOUT label in dev panel maps to IRON MAN | Mislabeled button — gives Iron Man, not Timeout |

---

## 5. Bug Reporting Template

```
WHAT: [what happened]
EXPECTED: [what should have happened]
STEPS: [how to reproduce]
DEVICE: [phone model / browser / OS]
SCREENSHOT: [if applicable]
```
