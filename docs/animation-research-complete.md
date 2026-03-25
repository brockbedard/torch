# TORCH Animation System — Complete Research (10 Agents)
## March 24, 2026

### Agent Results

| # | Agent | Key Deliverables |
|---|-------|-----------------|
| 1 | Core Animation Loop | Demand-driven RAF, typed arrays, 2-canvas compositing, per-segment easing, SoA layout |
| 2 | Player Movement Realism | OL pass/run blocking, QB phases, 7 route shapes, RB paths, DB man/zone, tackle mechanics |
| 3 | Visual Trails & Speed Effects | Quadratic alpha trails, ellipse stretching, speed lines, 12-20 impact particles, slow-mo turnovers |
| 4 | Variable Play Outcomes | Route pools per play type, defense per scheme, matchup→separation, sack/incomplete variants, random variation |
| 5 | Star Players & Ratings | Gold ring + ember particles, OVR→route crispness/separation, 4 badge effects, TORCH card cinematics |
| 6 | Football Physics | Pre-rendered 16x10 sprite, tangent-aligned flight, bounce physics, snap animation, fumble tumble |
| 7 | Smooth Transitions & Pacing | 400ms easeOutCubic tweens, overlap everything, DL idle oscillation, instant color swap, skip→final positions |
| 8 | TORCH Card Animations | Tiered cinematics (bronze 1.2s / silver 2s / gold 2.6s), PICK SIX return, UNCOVERABLE golden trail, DA BOMB explosion |
| 9 | Mobile Scaling | Stay Canvas 2D, PWA now, Capacitor later, responsive sizing, particle pool, lazy-load, ~9KB total |
| 10 | Ranked Impact Priorities | 25 features ranked, 5-phase implementation order, top 5 "premium feel" features |
| 11 | Formation-Play Mapping System | 12 route templates, 6 defense modes, AnimationTimeline composition, 504 unique animations |
| 12 | TORCH Card Special Animations | Tiered intros (bronze 300ms / silver 400ms / gold 500ms), 20 card-specific animations, persistent effects system, stacking priority, color palette |

---

### Master Implementation Order (from Priority Agent)

#### Phase 1: The Engine
1. Mobile performance framework (60fps target)
2. All 14 players moving with purpose (keyframe system)
3. Smooth field scrolling (camera)
4. Formation transitions (400ms tweens)
5. Tap-to-skip (built into timeline)

#### Phase 2: The Juice
6. Speed trails on ball carrier
7. Screen shake on big hits (3-5px, 0.85 decay)
8. Impact flash at tackle point
9. Ball flight visualization (bezier arc)
10. QB throw cue

#### Phase 3: The Identity
11. Star player gold glow + ring
12. Team-colored particle bursts
13. Variable play speed by importance
14. Turnover drama (slow-mo + color shift)
15. Sound synchronization

#### Phase 4: The Polish
16. TD celebrations (fireworks + confetti)
17. TORCH card cinematics
18. Interception returns
19. Ball carrier jukes
20. DL/OL blocking animation

---

### Top 5 "Premium Feel" Features
1. All 14 players moving with purpose
2. Speed trails on ball carrier
3. Screen shake + impact flash
4. Star player gold glow
5. Variable play speed + turnover drama

### Architecture Decisions
- **Demand-driven RAF** (not continuous loop)
- **2 canvases** (static field + dynamic layer, alpha:false)
- **SoA Float32Array** for keyframe storage
- **Per-segment easing** (not per-dot)
- **12 route templates** composable with 6 defense modes
- **AnimationTimeline composition pipeline** (not monolithic if/else)
- **Pre-rendered glow sprites** (cached, not per-frame gradients)
- **Particle pool** (pre-allocated, no GC during animation)
- **Stay Canvas 2D** (nowhere near bottleneck for 14 dots + particles)

### Key Timing Values
- Pre-snap: static (0fps, DL idle only)
- Pass play: 1500ms
- Run play: 1400ms
- Sack: 1200ms
- Interception: 1800ms
- Touchdown: 1800ms
- Formation tween: 400ms easeOutCubic
- Field scroll: 500ms easeInOutCubic (during play)
- Impact particles: 12-20, 250-400ms lifetime
- Screen shake: 3-5px amplitude, 200ms decay
- Ball flight: 200-600ms depending on depth
- TD celebration: 750-1000ms
- Star player On Fire: continuous ember particles
- TORCH gold card: 2000-2600ms extended animation
