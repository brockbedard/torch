# TORCH v0.27.0 Test Plan

Test at `localhost:5174/?dev` (dev panel auto-opens on desktop).

---

## A. Full Game Flow (~10 min playthrough)

1. Home → pick a team → **Roster** (14 players, both OFF+DEF, stars, traits, full names) → CONTINUE
2. Pregame → Coin toss → choose card or receive
3. Play 5-6 snaps on offense watching **card carry-over** (6 cards stay, 2 new deal into vacated slots)
4. Use **DISCARD** once (mark 1 play + 1 player → CONFIRM) → verify button shows "NO DISCARDS"
5. Score or turn over → verify possession change redeals fresh hand + resets discards
6. Get to 4th down past 50 → try **FG** (pick kicker, see ratings, verify burn)
7. Play to halftime → verify stats, pep talk, Torch Store, receiver info → START SECOND HALF → face-down card pick → kickoff
8. Play to end → VICTORY/DEFEAT screen → TORCH points + Film Room → PLAY AGAIN
9. Verify TORCH points carried to next game

---

## B. Card Tray Mechanics

- [ ] **8 cards visible** simultaneously (4 plays + 4 players)
- [ ] **Ghost slots**: selected cards leave tray, show "ON FIELD", tap ghost to deselect
- [ ] **SNAP**: only activates when both play + player selected
- [ ] **Torch row**: appears above plays/players when torch cards available. Same height (120px). Non-applicable cards show "DEFENSE ONLY" / "OFFENSE ONLY". Can SNAP without picking torch card.
- [ ] **CARDS button** on TORCH banner → opens inventory sheet
- [ ] **Deal animation**: new cards slide in from above with bounce + sound
- [ ] **Touch feedback**: cards lift on press

---

## C. Personnel System

- [ ] Pick **BURNER WR + deep pass** several snaps → should trend positive
- [ ] Pick **OL + deep pass** several snaps → should trend negative (anti-synergy)
- [ ] Feature **same player 4+ snaps** → results degrade (heat penalty)
- [ ] **Dev: Redeal Hand** to get different cards and compare

---

## D. Special Teams

- [ ] **Dev: 4th Down (past 50)** → FG → kicker selection → pick 5-star ACC vs 1-star → compare make rates
- [ ] **Dev: 4th Down (past 50)** → PUNT → punter selection → pick 5-star PWR vs 1-star → compare distance
- [ ] Verify burned players show result context: "Made 42-yard FG", "45-yard punt"
- [ ] **Dev: Burn 10 ST Players** → trigger FG → low-deck warning (red count)
- [ ] **Dev: Show ST Deck Info** → verify burn history

---

## E. Torch Cards — WORKING (12 original, effects wired in snapResolver.js)

| Card | How to Test | Dev Shortcut | Pass? |
|------|-------------|-------------|-------|
| **SCOUT TEAM** | Give Gold → play pre-snap → does AI play reveal? | Give All Gold | |
| **SURE HANDS** | Give Gold → Force Turnover → does reactive card appear? Cancel? | Force Turnover | |
| **HARD COUNT** | Give Silver → play pre-snap → AI play randomized? | Give All Silver | |
| **DEEP SHOT** | Give Silver → play pre-snap on pass → yards doubled? | | |
| **TRUCK STICK** | Give Silver → play pre-snap on run → yards doubled, no fumble? | | |
| **CHALLENGE FLAG** | Give Silver → get bad result → reactive reroll appears? | Force Covered | |
| **PRIME TIME** | Give Silver → play with low-OVR player → boost visible? | | |
| **PLAY ACTION** | Give Bronze → play vs run defense → +5 yards? vs zone → no bonus? | Give All Bronze | |
| **SCRAMBLE DRILL** | Give Bronze → get sacked → negative converted to 0? | | |
| **12TH MAN** | Give Bronze → play → +4 yards + 2x TORCH points? | | |
| **ICE** | Give Bronze → play on defense → opponent OVR zeroed + no combos? | | |
| **PERSONNEL REPORT** | Give Bronze → play → AI player revealed? | | |

---

## F. Torch Cards — DATA ONLY (12 new, effects NOT wired)

These cards appear in the store/inventory and can be played, but their effects don't fire. Verify they show up and are consumable, but expect NO gameplay effect.

| Card | Expected Effect (not implemented) | Pass? |
|------|----------------------------------|-------|
| **BLOCKED KICK** | Block AI FG/punt 60% of time | |
| **HOUSE CALL** | Guarantee 50+ yd return | |
| **ICE THE KICKER** | Reduce AI kicker accuracy -1 star | |
| **CANNON LEG** | Extend FG range +10 yds | |
| **IRON MAN** | Restore burned ST player | |
| **RINGER** | Best player kicks regardless of deck | |
| **SCOUT REPORT** | Show all 7 players instead of 4 | |
| **PRE-SNAP READ** | Reveal AI featured player | |
| **FRESH LEGS** | Extra discard this drive | |
| **GAME PLAN** | Reset player heat to 0 | |
| **COFFIN CORNER** | Punt inside the 10 | |
| **FAIR CATCH GHOST** | Force fair catch, no return yds | |

---

## G. Known Issues to Watch For

1. **PERSONNEL REPORT vs PRE-SNAP READ** — appear to be duplicate effects (both reveal AI player). Need differentiation.
2. **PRIME TIME + star system** — uses legacy OVR boost (`(99 - ovr) / 5 * 0.5`), doesn't account for new stars/traits/personnel modifiers.
3. **ICE + star system** — zeros OVR + badge combos but doesn't zero personnel system modifiers (baseline, synergy, matchup).
4. **COFFIN CORNER + touchback** — if implemented naively, touchback rule (60% to 25) could override the card, making it worse than not using it. Card should guarantee inside-10 with NO touchback.
5. **Reactive card timing** — SURE HANDS and CHALLENGE FLAG work in the resolver. BLOCKED KICK would need to fire during ST resolution (different flow than snap).
6. **12 new cards playable but do nothing** — player could waste TORCH points buying cards with no effect. Consider: hide unimplemented cards from the store until wired, or add placeholder effects.

---

## H. Conversions

- [ ] **Force TD** → conversion screen shows "TOUCHDOWN!" in team color (big Teko font)
- [ ] XP: auto "+1 point"
- [ ] 2pt/3pt: card selection → snap → **"GOOD!"** or **"NO GOOD"** (not TOUCHDOWN)
- [ ] No shop trigger after conversion
- [ ] No "1st & 10" overlay after conversion
- [ ] Commentary describes the play (not "d player makes the stop")
- [ ] **Dev: Conv GOOD / Conv FAIL** to test both paths

---

## I. Halftime

- [ ] Score, stats (yards/FDs/TOs), pep talk matches game state
- [ ] Torch Store shows 3 cards, correct tier distribution
- [ ] Can buy card if affordable, points deducted
- [ ] Receiver info shows correct team for 2nd half
- [ ] START SECOND HALF → face-down card pick (kicking team) → kickoff → game resumes

---

## J. End Game

- [ ] VICTORY (green) / DEFEAT (red) / TIE (gold) header
- [ ] TORCH points + win bonus (+20) calculated correctly
- [ ] Film Room shows max 4 highlights
- [ ] PLAY AGAIN → team select → TORCH points persist

---

## K. AI Behavior

- [ ] **Hard difficulty**: AI picks situational plays (run on short yardage, deep on long)
- [ ] **Hard AI player selection**: picks synergy-optimal players (not random)
- [ ] AI burns ST players on FG/punt (uses aiPickST)
- [ ] Easy AI: random plays + random players

---

## L. Colors & Polish

- [ ] Down & distance in **possession team color** (scoreboard, result overlay, drive log, possession change)
- [ ] Drive stats numbers (plays/yds/1st dn) in team color, labels gray
- [ ] TD commentary in scoring team color
- [ ] Tooltips dismiss on tap (don't stick permanently)
- [ ] Dev panel auto-opens on desktop

---

## Priority After Testing

1. Wire the 12 new card effects into the engine
2. Address PRIME TIME/ICE legacy compatibility with star/trait system
3. Differentiate PERSONNEL REPORT vs PRE-SNAP READ
4. Consider hiding unimplemented cards from the Torch Store
