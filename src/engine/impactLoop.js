/**
 * TORCH — Impact Loop
 * Centralized coordinator for millisecond-perfect sensory feedback.
 * Synchronizes: SFX, Haptics, Screen Shake, and Hitstops.
 */

import { Haptic } from './haptics.js';
import AudioManager from './audioManager.js';
import { gsap } from 'gsap';

/**
 * Trigger a synchronized impact event.
 * @param {number} tier - 1 (routine), 2 (important), 3 (game-changing)
 * @param {object} opts - { el, isSack, isTurnover, isTD, result, flashColor }
 */
export function triggerImpact(tier, opts = {}) {
  const { el, isSack, isTurnover, isTD, result, flashColor } = opts;
  
  // 1. Timing Configuration
  // hitstopMs: how long to freeze. 133ms = ~8 frames @ 60fps (heavy).
  const hitstopMs = tier === 1 ? 33 : tier === 2 ? 67 : 133;
  const shakeAmt = tier === 1 ? 1 : tier === 2 ? 2 : 5;
  const duckRatio = tier === 1 ? 0.6 : tier === 2 ? 0.3 : 0.1;
  const duckDur = tier === 1 ? 400 : tier === 2 ? 800 : 1200;

  // 2. Audio Ducking (Create auditory vacuum for the impact)
  AudioManager.duck(duckRatio, duckDur);

  // 3. SFX & Haptics (Immediate)
  if (isTD) {
    AudioManager.play('tdCelebration');
    AudioManager.play('victoryImpact');
    Haptic.touchdown();
  } else if (isSack) {
    AudioManager.play('hitHeavy');
    AudioManager.play('bassDrop');
    Haptic.bigHit();
  } else if (isTurnover) {
    AudioManager.play('hitComposite');
    AudioManager.play('bassDrop', { volume: 0.4 });
    Haptic.turnover();
  } else if (tier === 3) {
    AudioManager.play('hitComposite');
    Haptic.bigPlay();
  } else if (tier === 2) {
    AudioManager.play('hitModerate');
    Haptic.hit();
  } else {
    AudioManager.play('hitModerate', { volume: 0.4 });
    Haptic.cardTap();
  }

  // 4. Hitstop (Visual freeze)
  if (el && hitstopMs > 0) {
    gsap.set(el, { scale: 1.02 });
    
    // Flash overlay
    const flash = document.createElement('div');
    const fColor = flashColor || (tier >= 3 ? '#fff' : 'transparent');
    
    if (fColor !== 'transparent') {
      flash.style.cssText = `position:fixed;inset:0;background:${fColor};opacity:0.15;z-index:999;pointer-events:none;`;
      document.body.appendChild(flash);
      setTimeout(() => {
        gsap.to(flash, { opacity: 0, duration: 0.2, onComplete: () => flash.remove() });
      }, hitstopMs);
    }
    
    setTimeout(() => {
      gsap.to(el, { scale: 1, duration: 0.15, ease: 'power2.out' });
    }, hitstopMs);
  }

  // 5. Screen Shake
  if (el && shakeAmt > 0) {
    const shakeAnim = tier === 1 ? 'T-micro-shake 0.15s ease-out' : 'T-clash-shake ' + (tier === 3 ? '0.4s' : '0.2s') + ' ease-out';
    el.style.animation = shakeAnim;
    setTimeout(() => { el.style.animation = ''; }, 500);
  }

  // 6. Rotational Sack Brutality
  if (isSack && el) {
    el.style.animation = 'T-rot-shake 0.55s ease-out';
  }
}

/**
 * Field-level pulse effect at the ball position.
 */
export function fieldPulse(ballPosition, color) {
  // Implementation details would depend on the field renderer, 
  // but we can trigger a global event or call a known field function.
  const event = new CustomEvent('field-pulse', { detail: { ballPosition, color } });
  window.dispatchEvent(event);
}
