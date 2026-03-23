# Tech Juice: Advanced Arcade Broadcast Effects

Pushing the "Gameday" aesthetic using high-performance vanilla JS and CSS techniques. This document serves as a technical inspiration board for the Torch Football project.

## 1. High-Performance Multiplane Parallax
To achieve smooth 60fps+ backgrounds without "jank," we must offload calculations to the GPU and respect the browser's render cycle.

### Core Principles
*   **GPU Acceleration:** Use `transform: translate3d(x, y, 0)` instead of `top`, `left`, or `background-position`. This promotes layers to their own compositor planes.
*   **Render Loop:** Hook into `requestAnimationFrame` (rAF) rather than executing logic directly in the `scroll` or `mousemove` event.
*   **Passive Listeners:** Use `{ passive: true }` for scroll events to allow the browser to scroll the page immediately without waiting for JS.

### Implementation Snippet
```javascript
const layers = document.querySelectorAll('.parallax-layer');
let ticking = false;

function update(y) {
  layers.forEach(layer => {
    const speed = layer.dataset.speed;
    layer.style.transform = `translate3d(0, ${y * speed}px, 0)`;
  });
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => update(window.scrollY));
    ticking = true;
  }
}, { passive: true });
```

---

## 2. The "CRT Glass" Pipeline
Simulating an old-school broadcast monitor requires layering SVG filters for physical distortion and CSS for scanlines.

### Curvature & Bloom (SVG)
Use `feDisplacementMap` for barrel distortion and `feGaussianBlur` for phosphor bleed.

```html
<svg style="display:none">
  <filter id="crt-distort">
    <!-- Barrel distortion via displacement -->
    <feDisplacementMap in="SourceGraphic" scale="20" xChannelSelector="R" yChannelSelector="G" />
  </filter>
  <filter id="crt-bloom">
    <feGaussianBlur stdDeviation="2" result="blur" />
    <feComposite in="SourceGraphic" in2="blur" operator="over" />
  </filter>
</svg>
```

### Scanlines & Flicker (CSS)
```css
.screen-overlay {
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%),
              linear-gradient(90deg, rgba(255, 0, 0, 0.05), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.05));
  background-size: 100% 3px, 3px 100%;
  pointer-events: none;
  animation: flicker 0.15s infinite;
}

@keyframes flicker {
  0% { opacity: 0.97; }
  50% { opacity: 1; }
  100% { opacity: 0.98; }
}
```

---

## 3. GPU-Optimized Particles (Sparks & Smoke)
For "Gameday" impacts, use a Canvas-based particle system with object pooling.

### Optimization Strategy
*   **Object Pooling:** Pre-allocate 1,000 particle objects and reuse them to avoid Garbage Collection (GC) pauses.
*   **Offscreen Sprites:** Don't draw shapes every frame. Pre-render one "spark" and one "smoke cloud" to a small offscreen canvas and use `drawImage` to stamp them onto the main scene.
*   **Blending Modes:** Use `ctx.globalCompositeOperation = 'lighter'` for sparks to create additive glows where they overlap.

---

## 4. Dynamic Typography & Glitch
Typography should feel "electric" and reactive.

### Neon Glow
Layered `text-shadow` creates the depth of a neon tube.
```css
.neon-title {
  color: #fff;
  text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #0ff, 0 0 40px #0ff;
}
```

### Digital Scrambling (JS)
When a score updates, don't just change the number. "Shuffle" through random characters for 200ms.
```javascript
const scrambleChars = '0123456789ABCDEF!@#$%^&*';
function scramble(element, finalValue) {
  let iterations = 0;
  const interval = setInterval(() => {
    element.innerText = finalValue.split('')
      .map((char, i) => i < iterations ? char : scrambleChars[Math.floor(Math.random() * scrambleChars.length)])
      .join('');
    if (iterations >= finalValue.length) clearInterval(interval);
    iterations += 1/3;
  }, 30);
}
```

### Chromatic Aberration Glitch
Use `clip-path` and pseudo-elements to "tear" the text apart briefly.
```css
.glitch::before {
  content: attr(data-text);
  position: absolute;
  left: -2px;
  text-shadow: 2px 0 #ff00c1;
  clip-path: inset(45% 0 44% 0); /* A thin slice of the text */
  animation: glitch-anim 2s infinite linear alternate-reverse;
}
```

---

## 5. Summary Checklist for "Gameday" Aesthetic
- [ ] **Depth:** 4+ parallax layers (Sky, Far Mid, Near Mid, Foreground UI).
- [ ] **Impact:** Canvas sparks triggered on score changes or "Big Plays."
- [ ] **Texture:** CRT scanline overlay with subtle 1% opacity flicker.
- [ ] **Reaction:** Scramble/Glitch animations on all dynamic UI updates.
- [ ] **Performance:** Zero `top`/`left` animations; 100% `transform` and `opacity`.
