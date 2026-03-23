# Technical Performance Validation: "High-Juice" Mobile Web

## 1. CSS Barrel Distortion (`feDisplacementMap`)
Research confirms that achieving a consistent **60fps** using `feDisplacementMap` on mid-range 2022-2024 mobile devices (iPhone 13, Samsung S22) is **highly problematic** for full-screen or large-area effects.

### Findings:
*   **CPU Bottleneck:** SVG filters like `feDisplacementMap` are typically processed on the CPU. High-DPI (Retina) displays on modern phones triple or quadruple the pixel processing load.
*   **Device Variance:** 
    *   **iPhone 13 (Safari/WebKit):** Highly sensitive to complex filter chains; often drops frames if the filter region is large.
    *   **Samsung S22 (Chrome/Blink):** Better hardware acceleration for some primitives, but prone to thermal throttling during sustained heavy filter use.
*   **The "Killer":** Animating `feTurbulence` as a source for the displacement map is a guaranteed performance killer.

### Alternatives:
*   **WebGL Shaders (Recommended):** Use a fragment shader to perform barrel distortion. This runs entirely on the GPU and easily maintains 60fps.
*   **Static SVG Maps:** If WebGL is not an option, use a pre-rendered static displacement map (`feImage`) instead of dynamic turbulence, and restrict the `filterRegion` to the smallest possible area.

---

## 2. High-Volume Canvas Particles
For "High-Juice" visual density, the choice of rendering technology is critical.

### Findings:
*   **Canvas 2D Limits:** Capped at ~2,000–5,000 particles on mobile before frame rates drop. Every draw call (`arc`, `fill`) is a CPU-to-GPU command.
*   **WebGL Instancing:** Can handle **100,000+ particles** at 60fps on iPhone 13/S22 by sending a single "template" and an array of positions to the GPU.
*   **Memory Pressure:** Creating new particle objects every frame triggers the Garbage Collector (GC), causing "micro-stutter."

### Alternatives:
*   **WebGL 2 + Instanced Rendering:** The industry standard for high-volume particles.
*   **OffscreenCanvas:** Run the particle simulation in a **Web Worker** to keep the main thread free for UI interactions (scrolling, touches).
*   **Object Pooling:** Pre-allocate particle objects and reuse them to eliminate GC spikes.

---

## 3. "Performance Killers" & Surgical Alternatives

| Performance Killer | Why it kills performance | Heavy Effect Alternative |
| :--- | :--- | :--- |
| **DOM-Heavy Sprites** | Moving 100s of `<div>` elements triggers browser "Reflow" and "Layout" cycles. | **Canvas/WebGL:** Use a single flat drawing surface. |
| **Layout-Triggering CSS** | Animating `top`, `left`, `width`, or `height` forces geometry recalculations. | **GPU Transforms:** Use `transform: translate3d()` and `scale()` only. |
| **Object Allocation in Loops** | `let p = {x, y}` inside a loop triggers the Garbage Collector frequently. | **Object Pooling:** Reuse a fixed array of pre-allocated objects. |
| **Main-Thread Physics** | Heavy collision math/AI blocks the rendering loop, causing "jank." | **Web Workers:** Offload non-visual math to a separate CPU thread. |
| **Direct Event Logic** | Running logic directly inside `touchmove` (which fires >60Hz). | **Input Buffering:** Store input state and process once per `requestAnimationFrame`. |

## Conclusion for "High-Juice" Implementation
To guarantee 60fps on iPhone 13/S22:
1.  **Abandon SVG Filters** for real-time distortion; use **WebGL Shaders**.
2.  Use **WebGL Instancing** for any particle system exceeding 2,000 units.
3.  Implement **Object Pooling** and **Web Workers** as the foundational architecture.
