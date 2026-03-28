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

### Game Flow
| Control | What it does |
|---|---|
| View Roster | Jump to roster screen |
| Replay Coin Toss | Re-trigger coin toss from current game |
| Force Kickoff | Re-trigger kickoff from current state |
| Jump to Halftime | Jump to halftime screen immediately |
| Jump to 2-Min Drill | Set plays used to max, activate 2-minute clock |
| Jump to 4th Down (past 50) | Set 4th & 5 in opponent territory (punt/FG options appear) |
| Jump to 4th Down (own territory) | Set 4th & 8 in own territory (go for it forced) |
| Force End Game | Jump to end game screen |

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

### Phase 1 — Core Gameplay (10 min)

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

- Open dev panel, give yourself **SURE HANDS**
- Force a turnover (FORCE NEXT: Turnover), snap
  - Reactive prompt appears: USE IT / SAVE IT
  - USE IT: turnover cancelled, drive continues
- Give yourself **CHALLENGE FLAG**, force a sack
  - Reactive prompt appears
  - USE IT: snap rerolls with better odds
- Give yourself each auto-consume card (COFFIN CORNER, CANNON LEG, FRESH LEGS, etc.), trigger their event, verify toast notification fires
- Use **+500 PTS**, open the store manually, buy a card
  - Verify inventory updates and TORCH point balance decreases

### Phase 3 — Season Flow (10 min)

- Play through 3 games (use Force End Game + Play Again to speed up)
- Verify season progress label updates on team select screen
- After game 3: season recap screen appears
- If 2+ wins: championship game path offered
- Win the championship: verify title display on team select

### Phase 4 — New Systems (10 min)

- **Momentum pips:** use the same player 3+ times in a game — pips should appear on their card
- **Heat badges:** use a player 5+ times — WARM then TIRED badge should appear
- **Drive heat bar:** visible at bottom of screen throughout a drive
- **Stats sheet:** tap the scorebug (top center) to open stats overlay
- **Pregame scouting report:** verify it appears before kickoff
- **Daily Drive:** play a Daily Drive mode game — verify seeded matchup, result saves

### Phase 5 — Polish & Edge Cases (10 min)

- Test on mobile via LAN URL from terminal
- Check safe area (iPhone notch / dynamic island) — scorebug and cards should not clip
- Test game speed settings: Normal / Fast / Turbo
- Test save/resume: refresh mid-game, return to home — Resume button should appear
- Open settings screen: verify achievements tab, game history
- Play a full game to end screen: verify headline text and Film Room highlights

---

## 4. Known Issues / Balance Notes

| Issue | Status |
|---|---|
| Easy difficulty win rate 88–98% in sim | By design, but may feel trivial |
| Tie rate on Medium/Hard 14–26% (target <10%) | Elevated — watch for ties feeling too common |
| Sentinels (Boars) underperform on Medium | Likely run-heavy scheme punished by AI play selection |
| Big play rate slightly elevated on Easy | Minor — extra +1.5 mean yard bonus overshoots |

---

## 5. Bug Reporting Template

```
WHAT: [what happened]
EXPECTED: [what should have happened]
STEPS: [how to reproduce]
DEVICE: [phone model / browser / OS]
SCREENSHOT: [if applicable]
```
