/**
 * TORCH — Clock Manager
 * Manages halves, clock seconds, play counts, and 2-minute drill logic.
 */

export class ClockManager {
  constructor(playsPerHalf = 20) {
    this.half = 1;
    this.playsUsed = 0;
    this.playsPerHalf = playsPerHalf;
    this.twoMinActive = false;
    this.clockSeconds = 120; // 2 minutes in seconds
    this.totalPlays = 0;
    this.needsHalftime = false;
    this.gameOver = false;
  }

  /**
   * Advance the clock after a play.
   * @param {boolean} isTwoMin - Whether 2-minute drill is active
   * @param {object} result - Snap result { isIncomplete, isSack }
   */
  advance(isTwoMin, result) {
    this.totalPlays++;
    
    if (isTwoMin) {
      if (result && result.isIncomplete) {
        this.clockSeconds -= 5;
      } else if (result && result.isSack) {
        this.clockSeconds -= 20;
      } else {
        // Standard play: 25-30 seconds
        this.clockSeconds -= 25 + Math.floor(Math.random() * 6);
      }
    } else {
      this.playsUsed++;
    }
  }

  /**
   * Manual clock adjustments (spikes, kneels).
   * @param {number} seconds - Seconds to remove
   */
  tick(seconds) {
    this.clockSeconds -= seconds;
  }

  /**
   * Check for half or game transitions.
   * @param {number} ctScore
   * @param {number} irScore
   * @returns {string|null} 'halftime', 'gameover', 'overtime'
   */
  checkTransitions(ctScore, irScore) {
    // 2-minute warning trigger
    if (!this.twoMinActive && this.playsUsed >= this.playsPerHalf) {
      this.twoMinActive = true;
      this.clockSeconds = 120;
      return 'two_minute_warning';
    }

    // End of half / game
    if (this.twoMinActive && this.clockSeconds <= 0) {
      if (this.half === 1) {
        this.needsHalftime = true;
        return 'halftime';
      } else {
        // Overtime check
        if (ctScore === irScore) {
          this.half++;
          this.playsUsed = 0;
          this.twoMinActive = false;
          this.clockSeconds = 120;
          return 'overtime';
        } else {
          this.gameOver = true;
          return 'gameover';
        }
      }
    }

    // Absolute hard cap to prevent infinite loops
    if (this.totalPlays > 200) {
      this.gameOver = true;
      return 'gameover';
    }

    return null;
  }

  /** Initialize second half */
  startSecondHalf() {
    this.half = 2;
    this.playsUsed = 0;
    this.twoMinActive = false;
    this.clockSeconds = 120;
    this.needsHalftime = false;
  }

  getState() {
    return {
      half: this.half,
      playsUsed: this.playsUsed,
      twoMinActive: this.twoMinActive,
      clockSeconds: this.clockSeconds,
      totalPlays: this.totalPlays,
      needsHalftime: this.needsHalftime,
      gameOver: this.gameOver
    };
  }
}
