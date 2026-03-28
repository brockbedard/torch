# Pre-Production Test Plan — All Changes Since v0.28.0

28 commits since last prod push. Test at `localhost:5174/?dev`.

---

## QUICK CHECKS (tap through, 30 seconds each)

- [ ] **Coin toss**: "DOLPHINS WIN THE TOSS" in team color (not gold). Dramatic flip sound on coin spin. "Draw a FREE Torch Card" (word FREE present).
- [ ] **Card reveal**: "TAP A CARD TO REVEAL" in team color
- [ ] **Drop zones**: "TAP PLAY CARD" / "TAP PLAYER CARD" (not "DRAG"). Outlines clearly visible (40% opacity).
- [ ] **Play cards**: long names truncate with ellipsis, no text overlap
- [ ] **SKIP button**: gold border, 14px Teko, visible in torch row
- [ ] **Tooltips**: quick tap selects card (no tooltip). Long-press (500ms hold) shows tooltip.
- [ ] **Grammar**: no "Henderson. secures" pattern. Check a few plays for clean sentences.

## CARD TRAY LAYOUT

- [ ] **2 rows**: when 0 torch cards — PLAYS + PLAYERS visible, SNAP below
- [ ] **3 rows**: when 1+ torch cards — TORCH row on top (compact 85px), plays, players, SNAP still visible
- [ ] **Ghost slots**: selected cards show "ON FIELD" dashed green slot in tray
- [ ] **Card lock-in**: cards travel from below (0.4s) to field with scale pulse + thud sound on landing

## TORCH CARD FANFARE

- [ ] **Dev: Give All Gold** → play a torch card → card scales in 1.5x center screen with tier color flash
- [ ] Gold: dramatic flip sound, 0.8s hold. Silver: card snap, 0.5s. Bronze: click, 0.5s.
- [ ] Card name + effect text below. Tap to skip.

## TORCH STORE

- [ ] Tap BUY → shows "BUY FOR X PTS?" with CONFIRM (green) + CANCEL
- [ ] On confirm: "-X" flies upward in red, points counter flashes red → green
- [ ] Only 12 implemented cards appear (no BLOCKED KICK, HOUSE CALL, etc.)

## SOUND

- [ ] Card deal: snap sound on new cards
- [ ] Card select → field: thud on lock-in
- [ ] Coin toss flip: dramatic flip sound (deeper than card flip)
- [ ] FG attempt: kick thud + crowd cheer (made) or groan (missed)
- [ ] Punt: kick thud sound
- [ ] 2-minute warning: whistle
- [ ] Halftime: whistle
- [ ] Game end: whistle + crowd fades out over 2 seconds
- [ ] TD celebration: tdCelebration sound + crowd spike
- [ ] Close game (within 7, 2-min drill): crowd intensity high (0.85)

## YARD DISPLAY

- [ ] Result overlay: "GAIN OF 7" (not "+7 YDS")
- [ ] Defense stops: "LOSS OF 3" or "NO GAIN"
- [ ] Drive summary log: "+7" / "-3" shorthand (not "+7 YDS")

## TEAM COLORS

- [ ] Down & distance: possession team color everywhere
- [ ] "SPECTRES GO FOR IT": team color, full-screen overlay, 3.5s, tap to dismiss
- [ ] "BOARS ELECT TO PUNT": team color
- [ ] "DOLPHINS ATTEMPT A 42-YARD FG": team color
- [ ] Opponent TD: team color at reduced opacity (muted but colored)
- [ ] TD commentary: scoring team color

## 4TH DOWN

- [ ] **Dev: 4th Down (past 50)** → GO FOR IT full-width in team color, PUNT + FG side by side below
- [ ] Context label: "4TH & 5 AT OPP 22" in red accent

## TURNOVERS (user-biased)

- [ ] **Force Turnover** while on offense → red flash, "INTERCEPTED", groan
- [ ] **Force Turnover** while on defense → green flash, "PICKED OFF!", cheer, bigger shake

## FIELD POSITION

- [ ] Field strip shows "OWN 35" / "OPP 20" / "RED ZONE" label above LOS in team color

## KICKOFF RETURN

- [ ] After any kickoff: "KICKOFF RETURN" header + result in team color
- [ ] Kick thud sound fires
- [ ] Big returns (35+) get crowd cheer
- [ ] Tap to dismiss, 2.5s auto-dismiss

## TD CELEBRATION

- [ ] Bigger screen shake (8 frames)
- [ ] Full-screen team color flash (fades over 0.5s)
- [ ] More footballs raining
- [ ] TD sound + crowd spike (user TD) or groan (opponent TD)

## END GAME

- [ ] MVP card with stat line
- [ ] Open loop: single line, no wrapping
- [ ] "PLAY AGAIN" (win) / "RUN IT BACK" (loss) / "SETTLE IT" (tie)
- [ ] Film Room as opt-in link below button
- [ ] Per-team records on team select ("7-3")
- [ ] Last team pre-highlighted with glow

## FULL GAME FLOW

- [ ] Home → Team Select → Roster (14 players) → Pregame → Coin Toss → Gameplay
- [ ] Play 5+ snaps, verify card carry-over
- [ ] Use DISCARD once, verify "NO DISCARDS" after
- [ ] Score or turnover → possession change
- [ ] Get to 4th down → FG with kicker selection + burn
- [ ] Play to halftime → stats + store + card pick → 2nd half
- [ ] Play to end → end game screen → PLAY AGAIN → verify TORCH points carry
