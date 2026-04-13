/**
 * TORCH — Field Manager
 * Manages ball position, possession, down, distance, and red zone tracking.
 */

export class FieldManager {
  constructor(initialBallPos = 50, initialDown = 1, initialDistance = 10, initialPossession = 'IR') {
    this.possession = initialPossession;
    this.ballPosition = initialBallPos;
    this.down = initialDown;
    this.distance = initialDistance;
    this.inRedZone = this.getYardsToEndzone() <= 20;
    this.drivePlays = 0;
    this.drivePlayHistory = [];
  }

  getYardsToEndzone() {
    return this.possession === 'CT' ? 100 - this.ballPosition : this.ballPosition;
  }

  /**
   * Advance the ball.
   * @param {number} yards 
   * @param {object} statsRef - Optional reference to update stats
   */
  advance(yards) {
    if (this.possession === 'CT') {
      this.ballPosition += yards;
    } else {
      this.ballPosition -= yards;
    }
    // Cap ball position
    this.ballPosition = Math.max(0, Math.min(100, this.ballPosition));
  }

  /**
   * Update down and distance.
   * @param {number} yardsGained 
   * @returns {boolean} Whether a first down was gained
   */
  updateDown(yardsGained) {
    if (yardsGained >= this.distance) {
      this.down = 1;
      const ydsLeft = this.getYardsToEndzone();
      this.distance = ydsLeft <= 10 ? ydsLeft : 10;
      return true;
    } else {
      if (yardsGained > 0) {
        this.distance -= yardsGained;
      } else if (yardsGained < 0) {
        this.distance += Math.abs(yardsGained);
      }
      this.down++;
      return false;
    }
  }

  /**
   * Check if a first down was achieved on the play.
   * Useful for awarding points/stats before formal updateDown call.
   */
  checkFirstDown(yardsGained) {
    return yardsGained >= this.distance;
  }

  /**
   * Flip possession.
   * @param {number} newBallPos 
   */
  flip(newBallPos) {
    this.possession = this.possession === 'CT' ? 'IR' : 'CT';
    this.ballPosition = newBallPos;
    this.down = 1;
    this.distance = 10;
    this.drivePlays = 0;
    this.drivePlayHistory = [];
    this.inRedZone = false;
  }

  /** Record a play in the current drive history */
  recordPlay(playType) {
    this.drivePlays++;
    this.drivePlayHistory.push(playType);
  }

  getState() {
    return {
      possession: this.possession,
      ballPosition: this.ballPosition,
      down: this.down,
      distance: this.distance,
      yardsToEndzone: this.getYardsToEndzone(),
      inRedZone: this.inRedZone,
      drivePlays: this.drivePlays,
      drivePlayHistory: this.drivePlayHistory
    };
  }
}
