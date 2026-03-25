/**
 * torchPointsAnim.js — Sequential TORCH Points Animation
 * 
 * Drop-in module for the TORCH football game.
 * Handles: rolling counter, fly-to path, particle bursts, 
 * scale pop, glow, source labels, screen shake, haptics.
 * 
 * USAGE:
 *   import { playPointsSequence, initPointsAnim } from './torchPointsAnim.js';
 * 
 *   // Call once on gameplay screen mount:
 *   initPointsAnim();
 * 
 *   // After each snap resolves:
 *   playPointsSequence({
 *     counterEl: document.querySelector('.torch-points-value'),
 *     containerEl: document.querySelector('.torch-points-container'),
 *     sources: [
 *       { key: 'play',   pts: 15 },
 *       { key: 'combo',  pts: 10 },
 *       { key: 'streak', pts: 5  },
 *     ],
 *     startValue: 185,   // current displayed score before this play
 *     onComplete: (newTotal) => { // update game state },
 *   });
 */

// ─── SOURCE DEFINITIONS ─────────────────────────────────────
const SOURCES = {
  play:   { label: 'PLAY',   color: '#F1F5F9', glow: 'rgba(241,245,249,0.3)' },
  combo:  { label: 'COMBO',  color: '#FF6B2B', glow: 'rgba(255,107,43,0.4)' },
  streak: { label: 'STREAK', color: '#FFB800', glow: 'rgba(255,184,0,0.4)' },
  bonus:  { label: 'BONUS',  color: '#22D3EE', glow: 'rgba(34,211,238,0.4)' },
};

// ─── EASING ──────────────────────────────────────────────────
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// ─── STATE ───────────────────────────────────────────────────
let _isPlaying = false;
let _rollAnim = null;
let _cssInjected = false;

// ─── CSS INJECTION ───────────────────────────────────────────
function injectCSS() {
  if (_cssInjected) return;
  _cssInjected = true;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes tp-flyIn {
      0% {
        opacity: 0;
        transform: translate(-50%, 0) scale(0.4);
      }
      20% {
        opacity: 1;
        transform: translate(calc(-50% + var(--tp-cx, 0px)), -20px) scale(1.1);
      }
      55% {
        opacity: 1;
        transform: translate(calc(-50% + var(--tp-cx2, 0px)), -55px) scale(0.95);
      }
      80% {
        opacity: 0.7;
        transform: translate(calc(-50% + var(--tp-cx2, 0px) * 0.5), -70px) scale(0.6);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -78px) scale(0.3);
      }
    }

    @keyframes tp-particleBurst {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) translate(calc(var(--tp-px) * 0.2), calc(var(--tp-py) * 0.2)) scale(1);
      }
      50% { opacity: 0.8; }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) translate(var(--tp-px), var(--tp-py)) scale(0);
      }
    }

    @keyframes tp-labelSlideIn {
      0% { opacity: 0; transform: translateY(-50%) translateX(-6px); }
      100% { opacity: 1; transform: translateY(-50%) translateX(0); }
    }

    @keyframes tp-pulseRing {
      0% { opacity: 0.5; transform: translateX(-50%) scale(0.7); }
      100% { opacity: 0; transform: translateX(-50%) scale(2.5); }
    }

    @keyframes tp-shake {
      0%, 100% { transform: translateX(0) rotate(0); }
      12% { transform: translateX(-5px) rotate(-0.8deg); }
      25% { transform: translateX(4px) rotate(0.6deg); }
      37% { transform: translateX(-3px) rotate(-0.4deg); }
      50% { transform: translateX(3px) rotate(0.3deg); }
      62% { transform: translateX(-2px) rotate(-0.2deg); }
      75% { transform: translateX(1px); }
    }

    /* Flyer element */
    .tp-flyer {
      position: absolute;
      left: 50%;
      bottom: -120px;
      pointer-events: none;
      z-index: 10;
      text-align: center;
    }
    .tp-flyer-value {
      font-family: 'Teko', sans-serif;
      font-weight: 700;
      line-height: 1;
    }
    .tp-flyer-label {
      font-family: 'Teko', sans-serif;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 2px;
      opacity: 0.6;
    }

    /* Particle */
    .tp-particle {
      position: absolute;
      left: 50%;
      top: 100%;
      border-radius: 50%;
      pointer-events: none;
    }

    /* Source label (right side) */
    .tp-source-label {
      position: absolute;
      left: calc(100% + 12px);
      top: 50%;
      transform: translateY(-50%);
      font-family: 'Teko', sans-serif;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 3px;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 4px;
      animation: tp-labelSlideIn 0.25s ease-out;
    }
    .tp-source-dot {
      width: 3px;
      height: 3px;
      border-radius: 50%;
    }

    /* Pulse ring */
    .tp-pulse-ring {
      position: absolute;
      left: 50%;
      bottom: -6px;
      width: 130px;
      height: 24px;
      border-radius: 12px;
      pointer-events: none;
      animation: tp-pulseRing 0.6s ease-out forwards;
    }
  `;
  document.head.appendChild(style);
}

// ─── ROLLING COUNTER ─────────────────────────────────────────
function rollCounter(el, from, to, duration = 400) {
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(from + (to - from) * easeOutCubic(t));
    if (t < 1) _rollAnim = requestAnimationFrame(tick);
  };
  cancelAnimationFrame(_rollAnim);
  _rollAnim = requestAnimationFrame(tick);
}

// ─── COUNTER POP ─────────────────────────────────────────────
function popCounter(containerEl, counterEl, intensity = 1) {
  const maxScale = 1 + 0.15 * intensity;
  const goldGlow = 'rgba(255,184,0,0.45)';

  // Scale pop
  containerEl.style.transition = 'transform 0.12s ease-out, box-shadow 0.3s, border-color 0.3s';
  containerEl.style.transform = `scale(${maxScale})`;
  containerEl.style.boxShadow = `0 0 ${16 + intensity * 20}px rgba(255,184,0,${0.15 + intensity * 0.2})`;
  containerEl.style.borderColor = `rgba(255,184,0,${0.2 + intensity * 0.3})`;

  // Text glow
  counterEl.style.color = intensity > 0.8 ? '#FFE066' : '#FFB800';
  counterEl.style.textShadow = `0 0 ${10 + intensity * 10}px ${goldGlow}`;

  // Flame brightness (if flame icon exists as sibling/child)
  const flame = containerEl.querySelector('.torch-flame, svg');
  if (flame) flame.style.filter = `brightness(${1 + 0.5 * intensity})`;

  // Settle
  setTimeout(() => {
    containerEl.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s, border-color 0.4s';
    containerEl.style.transform = 'scale(1)';
  }, 120 + intensity * 80);

  setTimeout(() => {
    containerEl.style.boxShadow = '';
    containerEl.style.borderColor = '';
    counterEl.style.color = '';
    counterEl.style.textShadow = '';
    if (flame) flame.style.filter = '';
  }, 400 + intensity * 200);
}

// ─── PARTICLES ───────────────────────────────────────────────
function burstParticles(containerEl, count = 6, color = '#FFB800') {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const dist = 35 + Math.random() * 30;
    const size = 2 + Math.random() * 2.5;
    const dur = 450 + Math.random() * 250;

    const p = document.createElement('div');
    p.className = 'tp-particle';
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.background = color;
    p.style.boxShadow = `0 0 ${size + 2}px ${color}`;
    p.style.setProperty('--tp-px', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--tp-py', `${Math.sin(angle) * dist * 0.6}px`);
    p.style.animation = `tp-particleBurst ${dur}ms ease-out forwards`;

    containerEl.appendChild(p);
    setTimeout(() => p.remove(), dur + 50);
  }
}

// ─── FLYER ───────────────────────────────────────────────────
function spawnFlyer(containerEl, value, sourceKey, lane = 0) {
  const src = SOURCES[sourceKey] || SOURCES.play;
  const flyDur = 750;
  const curveX = (lane - 0.5) * 20 + (Math.random() - 0.5) * 10;

  const flyer = document.createElement('div');
  flyer.className = 'tp-flyer';
  flyer.style.animation = `tp-flyIn ${flyDur}ms cubic-bezier(0.25, 0.1, 0.25, 1) forwards`;
  flyer.style.setProperty('--tp-cx', `${curveX}px`);
  flyer.style.setProperty('--tp-cx2', `${curveX * 0.3}px`);

  const valEl = document.createElement('div');
  valEl.className = 'tp-flyer-value';
  valEl.textContent = `+${value}`;
  valEl.style.fontSize = value > 20 ? '30px' : value > 10 ? '26px' : '22px';
  valEl.style.color = src.color;
  valEl.style.textShadow = `0 0 12px ${src.glow}`;

  const labelEl = document.createElement('div');
  labelEl.className = 'tp-flyer-label';
  labelEl.textContent = src.label;
  labelEl.style.color = src.color;

  flyer.appendChild(valEl);
  flyer.appendChild(labelEl);
  containerEl.appendChild(flyer);

  setTimeout(() => flyer.remove(), flyDur + 100);
  return flyDur;
}

// ─── SOURCE LABEL ────────────────────────────────────────────
let _activeLabelEl = null;

function showSourceLabel(containerEl, sourceKey) {
  if (_activeLabelEl) _activeLabelEl.remove();

  const src = SOURCES[sourceKey] || SOURCES.play;
  const label = document.createElement('div');
  label.className = 'tp-source-label';
  label.style.color = src.color;
  label.style.textShadow = `0 0 8px ${src.glow}`;

  const dot = document.createElement('span');
  dot.className = 'tp-source-dot';
  dot.style.background = src.color;
  dot.style.boxShadow = `0 0 6px ${src.color}`;

  label.appendChild(dot);
  label.appendChild(document.createTextNode(src.label));
  containerEl.appendChild(label);
  _activeLabelEl = label;
}

function hideSourceLabel() {
  if (_activeLabelEl) {
    _activeLabelEl.remove();
    _activeLabelEl = null;
  }
}

// ─── PULSE RING ──────────────────────────────────────────────
function showPulseRing(containerEl) {
  const ring = document.createElement('div');
  ring.className = 'tp-pulse-ring';
  ring.style.border = '1px solid #FFB800';
  containerEl.appendChild(ring);
  setTimeout(() => ring.remove(), 650);
}

// ─── SCREEN SHAKE ────────────────────────────────────────────
function shakeContainer(containerEl, duration = 400) {
  containerEl.style.animation = `tp-shake ${duration}ms ease-out`;
  setTimeout(() => { containerEl.style.animation = ''; }, duration + 50);
}

// ─── HAPTIC ──────────────────────────────────────────────────
function haptic(pts) {
  if (!navigator.vibrate) return;
  if (pts > 20) navigator.vibrate([15, 20, 25]);
  else if (pts > 10) navigator.vibrate(20);
  else navigator.vibrate(10);
}

// ─── MAIN API ────────────────────────────────────────────────

/**
 * Call once when gameplay screen mounts.
 * Injects CSS keyframes.
 */
export function initPointsAnim() {
  injectCSS();
}

/**
 * Returns true if an animation sequence is currently playing.
 */
export function isPointsAnimPlaying() {
  return _isPlaying;
}

/**
 * Play the sequential points animation.
 * 
 * @param {Object} opts
 * @param {HTMLElement} opts.counterEl   — The element showing the points number (e.g. <span>185</span>)
 * @param {HTMLElement} opts.containerEl — The parent box around the counter (gets pop/glow effects).
 *                                         Must have position:relative.
 * @param {Array} opts.sources          — Array of { key: 'play'|'combo'|'streak'|'bonus', pts: number }
 * @param {number} opts.startValue      — Current displayed score BEFORE this play
 * @param {boolean} [opts.shake]        — Whether to screen-shake (big plays / TDs)
 * @param {Function} [opts.onComplete]  — Called with new total when full sequence finishes
 * @param {number} [opts.gap]           — ms between sources (default 750)
 */
export function playPointsSequence({
  counterEl,
  containerEl,
  sources,
  startValue,
  shake = false,
  onComplete = null,
  gap = 750,
}) {
  if (_isPlaying) return;
  if (!sources || sources.length === 0) return;

  injectCSS();
  _isPlaying = true;

  // Ensure container is positioned for absolute children
  const pos = getComputedStyle(containerEl).position;
  if (pos === 'static') containerEl.style.position = 'relative';

  if (shake) shakeContainer(containerEl);

  let running = startValue;
  const totalPts = sources.reduce((s, x) => s + x.pts, 0);

  sources.forEach(({ key, pts }, i) => {
    const delay = i * gap;

    setTimeout(() => {
      // Show source label to the right
      showSourceLabel(containerEl, key);

      // Spawn flyer
      const flyDur = spawnFlyer(containerEl, pts, key, i);

      // On arrival: pop + particles + roll counter
      setTimeout(() => {
        const from = running;
        running += pts;
        rollCounter(counterEl, from, running, 400);

        const intensity = pts > 20 ? 1.2 : pts > 10 ? 0.9 : 0.6;
        popCounter(containerEl, counterEl, intensity);

        const particleCount = pts > 20 ? 8 : pts > 10 ? 6 : 4;
        const src = SOURCES[key] || SOURCES.play;
        burstParticles(containerEl, particleCount, src.color);

        // Pulse ring on big hits
        if (pts > 15) showPulseRing(containerEl);

        haptic(pts);
      }, flyDur - 50); // sound-leads-visual principle

      // Last source: clean up
      if (i === sources.length - 1) {
        setTimeout(() => {
          hideSourceLabel();
          _isPlaying = false;
          if (onComplete) onComplete(startValue + totalPts);
        }, flyDur + 400);
      }
    }, delay);
  });
}

export default { initPointsAnim, playPointsSequence, isPointsAnimPlaying };
