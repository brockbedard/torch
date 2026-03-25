# Field Animation Research — Collected from 10 Subagents
## March 24, 2026

### Agent Results Summary

**Round 1 (Canvas Rendering Quality):**
1. Glow & Lighting — neon line sprites, baked sprites, white jersey numbers ✅ APPLIED
2. Turf Texture — mowing stripes, stadium light, vignette, noise texture ✅ APPLIED
3. Animation & Transitions — fieldAnimator.js architecture, easing, RAF loop ⏳ READY
4. Performance & HiDPI — eliminate shadowBlur, pre-render sprites, font optimization ✅ PARTIALLY APPLIED
5. Broadcast Polish — zone shading, embossed numbers, depth gradient, sidelines ✅ APPLIED

**Round 2 (Formations & Movement):**
1. Offensive Formations — 7 formations with exact coordinates ✅ RECEIVED
2. Defensive Formations — 8 formations with exact coordinates ✅ RECEIVED
3. Post-Snap Movement — keyframe animations for all 6 result types ✅ RECEIVED
4. Formation-to-Play Mapping — play type → formation + team overrides ✅ RECEIVED
5. NFL Blitz Visual Style — impacts, screen shake, trails, celebrations ⏳ PENDING

### Key Design Decisions

**7-on-7 roster:**
- Offense: 1 QB + 3 OL (C, LG, RG) + 3 skill (WR/RB/TE/FB/SLOT)
- Defense: 3 DL (LDE, NT, RDE) + 4 coverage (LB/CB/S mix)
- 14 total dots on field, all same size (20px radius)

**Animation timing:**
- Completed pass: 1500ms (throw at 400ms, catch at 700ms, tackle at 1300ms)
- Incomplete: 1200ms (ball miss at 700ms)
- Run: 1400ms (hole burst at 300ms, tackle at 1000ms)
- Sack: 1200ms (impact at 800ms, screen shake)
- Interception: 1800ms (INT at 700ms, celebration at 900ms)
- Touchdown: 1800ms (goal line at 1000ms, fireworks)

**Easing functions:**
- Rush (linemen): easeOutExpo
- Glide (routes): easeInOutCubic
- Snap (impacts): easeOutBack
- Arc (ball flight): easeInOutQuad

**Formation-to-play mapping:**
- DEEP → empty_spread / shotgun_spread
- SHORT → shotgun_2x2 / trips_right
- QUICK → bunch_right / bunch_left
- SCREEN → shotgun_trips / spread
- RUN → heavy_i / pistol / spread_rpo
- Per-team overrides for all 4 schemes

**Defensive formation mapping:**
- ZONE → cover_2_shell / cover_3_zone
- BLITZ → zero_blitz / swarm_blitz
- PRESSURE → man_press / cover_1_robber
- HYBRID → pattern_match / two_high_shell
