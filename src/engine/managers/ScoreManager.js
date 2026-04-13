/**
 * TORCH — Score Manager
 * Manages team scores, touchdowns, safeties, and field goals.
 */

export class ScoreManager {
  constructor() {
    this.ctScore = 0;
    this.irScore = 0;
  }

  addPoints(team, points) {
    if (team === 'CT') this.ctScore += points;
    else this.irScore += points;
  }

  getDiff(currentPossession) {
    if (currentPossession === 'CT') return this.irScore - this.ctScore;
    return this.ctScore - this.irScore;
  }

  /**
   * AI Conversion Decision after TD
   * @param {string} possession - 'CT' or 'IR'
   * @param {number} half
   * @param {boolean} twoMinActive
   * @param {number} playsUsed
   * @param {string} difficulty - 'EASY'|'MEDIUM'|'HARD'
   * @returns {'xp'|'2pt'|'3pt'}
   */
  aiDecision(possession, half, twoMinActive, playsUsed, difficulty) {
    // Current score is AFTER the 6-pt TD was added, but BEFORE conversion.
    // scoreDiff: positive = CPU is trailing, negative = CPU is leading.
    const scoreDiff = this.getDiff(possession);
    const isLate = half >= 2 && (twoMinActive || playsUsed > 20);

    // AGGRESSIVE MODE (3-POINT)
    if (isLate && scoreDiff >= 9) return '3pt';
    if (difficulty === 'HARD' && Math.random() < 0.1) return '3pt';

    // BALANCED MODE (2-POINT)
    if (scoreDiff === 2) return '2pt';
    if (scoreDiff === 5) return '2pt';
    if (scoreDiff === 10) return '2pt';
    
    if (isLate && scoreDiff === -1) return '2pt';
    if (isLate && scoreDiff === -5) return '2pt';

    // Random variety
    if (difficulty === 'HARD' && Math.random() < 0.15) return '2pt';
    if (difficulty === 'MEDIUM' && Math.random() < 0.05) return '2pt';

    return 'xp';
  }

  getState() {
    return {
      ctScore: this.ctScore,
      irScore: this.irScore
    };
  }
}
