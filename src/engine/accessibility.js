/**
 * TORCH — Accessibility System
 * Phase 5: Million Dollar Engine leap.
 * Provides auditory cues for visually impaired players.
 */

import { Howl, Howler } from 'howler';

class SonarSystem {
  constructor() {
    this.enabled = localStorage.getItem('torch_a11y_sonar') === 'true';
    this.oscillator = null;
    this.gainNode = null;
    this._initialized = false;
  }

  init() {
    if (this._initialized || !Howler.ctx) return;
    
    this.gainNode = Howler.ctx.createGain();
    this.gainNode.gain.value = 0;
    this.gainNode.connect(Howler.ctx.destination);

    this.oscillator = Howler.ctx.createOscillator();
    this.oscillator.type = 'sine';
    this.oscillator.frequency.value = 220; // A3
    this.oscillator.connect(this.gainNode);
    this.oscillator.start();

    this._initialized = true;
  }

  setEnabled(bool) {
    this.enabled = bool;
    localStorage.setItem('torch_a11y_sonar', String(bool));
    if (this.enabled) {
      if (!this._initialized) this.init();
      this.gainNode.gain.setTargetAtTime(0.05, Howler.ctx.currentTime, 0.1);
    } else if (this.gainNode) {
      this.gainNode.gain.setTargetAtTime(0, Howler.ctx.currentTime, 0.1);
    }
  }

  /**
   * Update the sonar pitch based on yards to endzone.
   * Higher pitch = closer to scoring.
   * @param {number} yardsToEndzone (0-100)
   */
  update(yardsToEndzone) {
    if (!this.enabled || !this._initialized) return;

    // Map 100 yards to 220Hz (A3) and 0 yards to 880Hz (A5)
    const freq = 880 - (yardsToEndzone * 6.6);
    this.oscillator.frequency.setTargetAtTime(Math.max(220, freq), Howler.ctx.currentTime, 0.1);
  }

  /**
   * Short beep for important events (down change, red zone).
   */
  beep(freq = 440, dur = 0.1) {
    if (!this.enabled || !Howler.ctx) return;
    const osc = Howler.ctx.createOscillator();
    const gn = Howler.ctx.createGain();
    osc.connect(gn);
    gn.connect(Howler.ctx.destination);
    osc.frequency.value = freq;
    gn.gain.setValueAtTime(0, Howler.ctx.currentTime);
    gn.gain.linearRampToValueAtTime(0.1, Howler.ctx.currentTime + 0.02);
    gn.gain.exponentialRampToValueAtTime(0.001, Howler.ctx.currentTime + dur);
    osc.start();
    osc.stop(Howler.ctx.currentTime + dur);
  }
}

export const Sonar = new SonarSystem();
