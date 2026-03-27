# TORCH Mobile App Store Research — 2026-03-26

## Recommendation Summary

| Path | Effort | Timeline | Cost | Verdict |
|------|--------|----------|------|---------|
| **Capacitor (iOS + Android)** | Low | Days | $125 (Apple $99 + Google $25) | **DO THIS** |
| **Google Play via TWA/PWA** | Low | Days | $25 | Good for Android-only quick launch |
| **React Native rewrite** | Very High | 3-5 months | Time | Not worth it for a card game |
| **iOS Home Screen PWA** | Zero | Now | Free | Already works, promote it |

**Winner: Capacitor.js** — wraps your existing Vite build with zero code changes. Both stores. ~30 min setup.

---

## 1. Capacitor.js (Best Path)

**Works with vanilla JS?** Yes, fully. Framework-agnostic. Points at your `dist/` folder.

**Setup:**
```bash
npm install @capacitor/core @capacitor/cli
npx cap init "TORCH Football" com.torch.football --web-dir dist
npm run build && npx cap sync
npx cap add ios && npx cap add android
npx cap open ios  # opens Xcode
```

**Code changes needed:** Zero. Your game runs as-is in the native WebView.

**Performance:**
- GSAP: identical to mobile Safari/Chrome (WKWebView uses same engine)
- jsfxr/Web Audio: works on both platforms (iOS needs user gesture for AudioContext.resume)
- Canvas 2D: hardware-accelerated, 60fps for a card game
- Touch events: pass through directly, no translation layer

**App Store risk:** Low. Apple's Guideline 4.2/4.7 explicitly allows HTML5 games that are self-contained. TORCH is a real game with animations, audio, and gameplay — not a website wrapper.

**What you'd add:**
- Splash screens + app icons
- `env(safe-area-inset-top)` for notch/Dynamic Island (partially done already)
- `capacitor.config.ts` with `ios.scrollEnabled: false`
- Optional native plugins: haptics, status bar

---

## 2. Google Play via PWA (TWA)

Fastest path to Android. Uses Bubblewrap to wrap your PWA in a Trusted Web Activity.

**Requires fixing first:**
- Service worker (currently a no-op stub — needs real caching)
- Manifest: add 512x512 icon, maskable icon, `scope`, `id`
- Must pass Lighthouse PWA audit (score 80+)

**Not viable for iOS App Store** — Apple rejects pure PWA wrappers.

---

## 3. React Native (Not Recommended)

Full rewrite: 3-5 months for a solo dev. Every DOM interaction, every GSAP animation, every jsfxr sound must be rewritten. The performance gain is negligible for a card game. Only consider if you hit an actual Capacitor limitation (unlikely).

---

## 4. Codebase Mobile Readiness: 85%

| Area | Status | Issue | Fix |
|------|--------|-------|-----|
| Touch events | ✅ Good | 8 mouse handlers, all have touch fallbacks | None needed |
| Viewport | ✅ Good | Missing `viewport-fit=cover` | Add to index.html meta tag |
| Bundle size | ⚠️ Amber | 505KB minified (157KB gzipped) | Acceptable for card game |
| Service worker | 🔴 Red | Non-functional stub, caches nothing | Implement with vite-plugin-pwa |
| CSS | ✅ Good | Missing `100dvh` fallback in gameplay.js | One-line fix |
| Audio | ⚠️ Amber | iOS AudioContext.resume pattern incomplete | Test + add explicit resume |
| Images | ✅ Good | SVG-first, tiny PNGs | None needed |
| localStorage | ✅ Good | Game state not persisted (by design) | None needed |
| Deep linking | 🔴 Red | No shareable URLs for results | Future feature |
| No :hover CSS | ✅ Excellent | Zero hover-dependent interactions | None needed |

### Must-Fix Before App Store:
1. Add `viewport-fit=cover` to index.html
2. Fix service worker (real caching strategy)
3. Add 512x512 + maskable icons to manifest
4. Test iOS audio unlock (AudioContext.resume on first gesture)
5. Add `100dvh` fallback to gameplay screen

---

## 5. Monetization

**Recommended model: Premium paid ($5-7)** — the Balatro path.

| Model | Revenue/mo needed | Feasibility |
|-------|-------------------|-------------|
| Premium web (Stripe, keep 97%) | ~600-850 sales at $7 | Requires marketing |
| Premium app store (keep 85%) | ~700-1000 sales at $7 | Store discovery helps |
| Cosmetic IAP (card backs, skins) | Supplemental | Low dev cost, high value |
| Ads | Need 400K+ views/mo | Too early |

**What to sell:** Card backs ($1-3), team skins ($2-5), field themes ($2-3), commentary packs ($2-5). All cosmetic, zero gameplay impact.

**What NOT to sell:** TORCH points for real money (gambling risk), randomized packs for real money (loot box laws), anything that affects gameplay balance.

**Legal:** Keep TORCH points as gameplay-only currency. Never sell them. If you sell randomized content, disclose drop rates. Consider a games attorney consultation ($200-400) before any real-money transactions.

---

## 6. Recommended Launch Sequence

### Phase 1: Web Polish (now)
- Fix the 5 must-fix items above
- Continue testing and iterating on gameplay
- Add "Add to Home Screen" prompt for iOS users

### Phase 2: Capacitor Setup (when gameplay is solid)
- `npm install @capacitor/core @capacitor/cli`
- Generate app icons (1024x1024 source → all sizes)
- Create splash screens
- Build + test on physical iOS and Android devices
- Submit to both stores simultaneously

### Phase 3: Monetization (post-launch)
- Start free, build audience
- Add Stripe tip jar / supporter pack on web ($5-10)
- App store launch as premium paid ($5-7)
- Add cosmetic IAP for long-tail revenue

---

## Sources
- Capacitor.js official docs (capacitorjs.com)
- Apple Guidelines 4.2 and 4.7 (HTML5 games)
- Google TWA / Bubblewrap documentation
- Balatro, Slay the Spire, Marvel Snap monetization analysis
- Belgium/Netherlands loot box legislation
- App Store Small Business Program (15% cut under $1M)
