/**
 * TORCH — Game State Manager
 * Ported from torch_sim.py GameState class.
 * Manages score, ball position, down/distance, halves, clock,
 * possession, drive history, TORCH points, Torch Card inventory,
 * injury tracking, and all state transitions.
 */

import { resolveSnap } from './snapResolver.js';
import { calcOffenseTorchPoints, calcDefenseTorchPoints } from './torchPoints.js';
import { calcReturnYards } from './turnoverReturns.js';
import { checkInjury, healInjuries } from './injuries.js';
import { aiSelectPlay, aiSelectPlayer } from './aiOpponent.js';

export class GameState {
  constructor({ humanTeam = 'CT', difficulty = 'MEDIUM', ctOffHand, ctDefHand, irOffHand, irDefHand,
                ctOffRoster, ctDefRoster, irOffRoster, irDefRoster }) {
    // Teams
    this.humanTeam = humanTeam;
    this.cpuTeam = humanTeam === 'CT' ? 'IR' : 'CT';
    this.difficulty = difficulty;

    // Hands (5 cards each)
    this.ctOffHand = ctOffHand;
    this.ctDefHand = ctDefHand;
    this.irOffHand = irOffHand;
    this.irDefHand = irDefHand;

    // Rosters (with injury state added)
    this.ctOffRoster = ctOffRoster.map(p => ({ ...p, injured: false, injurySnapsRemaining: 0 }));
    this.ctDefRoster = ctDefRoster.map(p => ({ ...p, injured: false, injurySnapsRemaining: 0 }));
    this.irOffRoster = irOffRoster.map(p => ({ ...p, injured: false, injurySnapsRemaining: 0 }));
    this.irDefRoster = irDefRoster.map(p => ({ ...p, injured: false, injurySnapsRemaining: 0 }));

    // Score
    this.ctScore = 0;
    this.irScore = 0;

    // Ball state
    this.possession = this.cpuTeam; // CPU receives first
    this.ballPosition = 50;
    this.down = 1;
    this.distance = 10;

    // Half/clock
    this.half = 1;
    this.playsUsed = 0;
    this.playsPerHalf = 20;
    this.twoMinActive = false;
    this.clockSeconds = 120;

    // Drive tracking
    this.drivePlayHistory = [];
    this.totalPlays = 0;
    this.drivePlays = 0;
    this.inRedZone = false;

    // TORCH points
    this.ctTorchPts = 0;
    this.irTorchPts = 0;

    // Torch Cards (3 slots)
    this.humanTorchCards = [];
    this.cpuTorchCards = [];

    // Stats
    this.stats = {
      ctTurnovers: 0, irTurnovers: 0,
      ctTouchdowns: 0, irTouchdowns: 0,
      ctTotalYards: 0, irTotalYards: 0,
      ctSacks: 0, irSacks: 0,
      ctFirstDowns: 0, irFirstDowns: 0,
      ctDrives: 0, irDrives: 0,
      ctIncompletions: 0, irIncompletions: 0,
      explosivePlays: 0, bigPlays: 0,
      leadChanges: 0, tiesBroken: 0,
      sackCount: 0, safeties: 0,
      fourthDownAttempts: 0, fourthDownConversions: 0,
      threeAndOuts: 0, longDrives: 0,
      badgeCombos: 0, historyBonuses: 0,
      redZoneTrips: 0, redZoneTDs: 0,
      twoMinScores: 0, turnoverTDs: 0,
    };

    // Game over flag
    this.gameOver = false;
    this.snapLog = [];

    // Initialize drives count
    if (this.possession === 'CT') this.stats.ctDrives = 1;
    else this.stats.irDrives = 1;
  }

  /** Yards to the end zone for the team with possession */
  yardsToEndzone() {
    return this.possession === 'CT' ? 100 - this.ballPosition : this.ballPosition;
  }

  /** Flip possession after score/turnover/failed 4th */
  flipPossession(newBallPos) {
    this.possession = this.possession === 'CT' ? 'IR' : 'CT';
    this.ballPosition = newBallPos;
    this.down = 1;
    this.distance = 10;
    this.drivePlayHistory = [];
    this.drivePlays = 0;
    this.inRedZone = false;
    if (this.possession === 'CT') this.stats.ctDrives++;
    else this.stats.irDrives++;
  }

  /** Advance the ball */
  advanceBall(yards) {
    if (this.possession === 'CT') {
      this.ballPosition += yards;
      this.stats.ctTotalYards += yards;
    } else {
      this.ballPosition -= yards;
      this.stats.irTotalYards += yards;
    }
  }

  /** Get score diff from offense's perspective (positive = trailing) */
  getScoreDiff() {
    if (this.possession === 'CT') return this.irScore - this.ctScore;
    return this.ctScore - this.irScore;
  }

  /** Get the offensive/defensive hands and rosters for current possession */
  getCurrentSides() {
    if (this.possession === 'CT') {
      return {
        offHand: this.ctOffHand, defHand: this.irDefHand,
        offPlayers: this.ctOffRoster, defPlayers: this.irDefRoster,
        offenseIsHuman: this.humanTeam === 'CT',
      };
    }
    return {
      offHand: this.irOffHand, defHand: this.ctDefHand,
      offPlayers: this.irOffRoster, defPlayers: this.ctDefRoster,
      offenseIsHuman: this.humanTeam === 'IR',
    };
  }

  /**
   * Execute a snap with the given selections.
   * Human selections are provided via options; AI auto-selects the rest.
   * @param {object} [offPlay] - Offensive play (human provides on offense, AI auto-selects)
   * @param {object} [featuredOff] - Featured offensive player
   * @param {object} [defPlay] - Defensive play (human provides on defense, AI auto-selects)
   * @param {object} [featuredDef] - Featured defensive player
   * @returns {object} { result, offPlay, defPlay, featuredOff, featuredDef, gotFirstDown, gameEvent }
   */
  executeSnap(offPlay, featuredOff, defPlay, featuredDef) {
    if (this.gameOver) return null;

    const sides = this.getCurrentSides();
    const situation = {
      down: this.down, distance: this.distance,
      ballPos: this.ballPosition, playHistory: this.drivePlayHistory,
      scoreDiff: this.getScoreDiff(),
    };

    // AI selects defense if not provided
    if (!defPlay) {
      defPlay = aiSelectPlay(sides.defHand, 'defense', this.difficulty, situation);
    }

    // AI selects offense if not provided
    if (!offPlay) {
      offPlay = aiSelectPlay(sides.offHand, 'offense', this.difficulty, situation);
    }
    if (!featuredOff) {
      featuredOff = aiSelectPlayer(sides.offPlayers, offPlay, this.difficulty, true);
    }
    if (!featuredDef) {
      featuredDef = aiSelectPlayer(sides.defPlayers, defPlay, this.difficulty, false);
    }

    // Track red zone entry
    const ydsToEz = this.yardsToEndzone();
    if (ydsToEz <= 20 && !this.inRedZone) {
      this.inRedZone = true;
      this.stats.redZoneTrips++;
    }

    // Track 4th down
    const is4th = this.down === 4;
    if (is4th) this.stats.fourthDownAttempts++;

    // Resolve the snap
    const oldCtScore = this.ctScore;
    const oldIrScore = this.irScore;

    const context = {
      playHistory: this.drivePlayHistory,
      yardsToEndzone: ydsToEz,
      ballPosition: this.ballPosition,
      down: this.down,
      distance: this.distance,
      isConversion: false,
      scoreDiff: this.getScoreDiff(),
    };

    const result = resolveSnap(offPlay, defPlay, featuredOff, featuredDef,
      sides.offPlayers, sides.defPlayers, context);

    // Easy difficulty yard adjustments
    if (this.difficulty === 'EASY') {
      if (sides.offenseIsHuman && !result.isSack && !result.isIncomplete && !result.isInterception && !result.isFumbleLost) {
        result.yards = Math.min(result.yards + 2, ydsToEz); // +2 human bonus
      } else if (!sides.offenseIsHuman && !result.isSack && !result.isIncomplete) {
        result.yards = Math.max(result.yards - 1, -5); // -1 CPU penalty
      }
    }

    // Update counters
    this.totalPlays++;
    this.drivePlays++;
    if (!this.twoMinActive) this.playsUsed++;
    this.drivePlayHistory.push(offPlay.playType);

    // Track moments
    if (result.yards >= 15) this.stats.explosivePlays++;
    if (result.yards >= 10) this.stats.bigPlays++;
    if (result.offComboPts > 0 || result.defComboPts > 0) this.stats.badgeCombos++;
    if (result.historyBonus !== 0) this.stats.historyBonuses++;
    if (result.isIncomplete) {
      if (this.possession === 'CT') this.stats.ctIncompletions++;
      else this.stats.irIncompletions++;
    }

    // 2-minute clock
    if (this.twoMinActive) {
      if (result.isIncomplete) this.clockSeconds -= 5;
      else if (result.isSack) this.clockSeconds -= 20;
      else this.clockSeconds -= 25 + Math.floor(Math.random() * 6); // 25-30
    }

    // TORCH points
    let gotFirstDown = false;
    let gameEvent = null;

    // === HANDLE RESULT ===
    if (result.isSafety) {
      this.stats.safeties++;
      if (this.possession === 'CT') this.irScore += 2;
      else this.ctScore += 2;
      const offPts = calcOffenseTorchPoints(result, false);
      const defPts = calcDefenseTorchPoints(result, false);
      this._awardTorchPts(offPts, defPts);
      gameEvent = 'safety';
      this.flipPossession(50);
      this._checkHalfEnd();
      this.snapLog.push({ play: this.totalPlays, offPlay: offPlay.name, defPlay: defPlay.name, result: result.description, event: gameEvent });
      return { result, offPlay, defPlay, featuredOff, featuredDef, gotFirstDown, gameEvent };
    }

    if (result.isInterception) {
      const returnYds = calcReturnYards(featuredDef);
      if (this.possession === 'CT') {
        this.stats.ctTurnovers++;
        let newPos = this.ballPosition - returnYds;
        if (newPos <= 0) {
          this.irScore += 7; this.stats.irTouchdowns++; this.stats.turnoverTDs++;
          gameEvent = 'turnover_td';
          this.flipPossession(50);
        } else {
          this.flipPossession(Math.max(1, Math.min(99, newPos)));
          gameEvent = 'interception';
        }
      } else {
        this.stats.irTurnovers++;
        let newPos = this.ballPosition + returnYds;
        if (newPos >= 100) {
          this.ctScore += 7; this.stats.ctTouchdowns++; this.stats.turnoverTDs++;
          gameEvent = 'turnover_td';
          this.flipPossession(50);
        } else {
          this.flipPossession(Math.max(1, Math.min(99, newPos)));
          gameEvent = 'interception';
        }
      }
      const offPts = calcOffenseTorchPoints(result, false);
      const defPts = calcDefenseTorchPoints(result, false);
      this._awardTorchPts(offPts, defPts);
      this._checkHalfEnd();
      this.snapLog.push({ play: this.totalPlays, offPlay: offPlay.name, defPlay: defPlay.name, result: result.description, event: gameEvent });
      return { result, offPlay, defPlay, featuredOff, featuredDef, gotFirstDown, gameEvent };
    }

    if (result.isFumbleLost) {
      if (this.possession === 'CT') {
        this.stats.ctTurnovers++;
        const fumbleSpot = this.ballPosition + Math.floor(result.yards * (0.3 + Math.random() * 0.5));
        const returnYds = calcReturnYards(featuredDef);
        let newPos = fumbleSpot - returnYds;
        if (newPos <= 0) {
          this.irScore += 7; this.stats.irTouchdowns++; this.stats.turnoverTDs++;
          gameEvent = 'turnover_td';
          this.flipPossession(50);
        } else {
          this.flipPossession(Math.max(1, Math.min(99, newPos)));
          gameEvent = 'fumble_lost';
        }
      } else {
        this.stats.irTurnovers++;
        const fumbleSpot = this.ballPosition - Math.floor(result.yards * (0.3 + Math.random() * 0.5));
        const returnYds = calcReturnYards(featuredDef);
        let newPos = fumbleSpot + returnYds;
        if (newPos >= 100) {
          this.ctScore += 7; this.stats.ctTouchdowns++; this.stats.turnoverTDs++;
          gameEvent = 'turnover_td';
          this.flipPossession(50);
        } else {
          this.flipPossession(Math.max(1, Math.min(99, newPos)));
          gameEvent = 'fumble_lost';
        }
      }
      const offPts = calcOffenseTorchPoints(result, false);
      const defPts = calcDefenseTorchPoints(result, false);
      this._awardTorchPts(offPts, defPts);
      this._checkHalfEnd();
      this.snapLog.push({ play: this.totalPlays, offPlay: offPlay.name, defPlay: defPlay.name, result: result.description, event: gameEvent });
      return { result, offPlay, defPlay, featuredOff, featuredDef, gotFirstDown, gameEvent };
    }

    // Sack stat tracking
    if (result.isSack) {
      this.stats.sackCount++;
      if (this.possession === 'CT') this.stats.irSacks++;
      else this.stats.ctSacks++;
    }

    // Advance ball
    this.advanceBall(result.yards);

    // Touchdown
    if (result.isTouchdown) {
      const scoringTeam = this.possession;
      if (scoringTeam === 'CT') {
        this.ctScore += 6; this.stats.ctTouchdowns++;
      } else {
        this.irScore += 6; this.stats.irTouchdowns++;
      }
      if (this.twoMinActive) this.stats.twoMinScores++;
      if (this.inRedZone) this.stats.redZoneTDs++;
      if (this.drivePlays >= 6) this.stats.longDrives++;
      if (is4th) this.stats.fourthDownConversions++;

      const offPts = calcOffenseTorchPoints(result, false);
      const defPts = calcDefenseTorchPoints(result, false);
      this._awardTorchPts(offPts, defPts);

      gameEvent = 'touchdown';
      this.snapLog.push({ play: this.totalPlays, offPlay: offPlay.name, defPlay: defPlay.name, result: result.description, event: gameEvent });
      // Don't flip yet — conversion happens next
      return { result, offPlay, defPlay, featuredOff, featuredDef, gotFirstDown, gameEvent, scoringTeam };
    }

    // Down and distance
    this.ballPosition = Math.max(1, Math.min(99, this.ballPosition));

    if (result.yards >= this.distance) {
      gotFirstDown = true;
      this.down = 1;
      this.distance = Math.min(10, this.yardsToEndzone());
      if (this.possession === 'CT') {
        this.stats.ctFirstDowns++;
        this.ctTorchPts += 10;
      } else {
        this.stats.irFirstDowns++;
        this.irTorchPts += 10;
      }
      if (is4th) this.stats.fourthDownConversions++;
    } else {
      this.distance -= Math.max(0, result.yards);
      this.down++;

      if (this.down > 4) {
        if (this.drivePlays <= 4) this.stats.threeAndOuts++;
        gameEvent = 'turnover_on_downs';
        this.flipPossession(this.ballPosition);
      }
    }

    // TORCH points
    const offPts = calcOffenseTorchPoints(result, gotFirstDown);
    const defPts = calcDefenseTorchPoints(result, gotFirstDown);
    this._awardTorchPts(offPts, defPts);

    // Injury check
    const injury = checkInjury(result, featuredOff, featuredDef);
    if (injury) {
      injury.player.injured = true;
      injury.player.injurySnapsRemaining = injury.snapsRemaining;
    }

    // Heal injuries
    healInjuries([this.ctOffRoster, this.ctDefRoster, this.irOffRoster, this.irDefRoster]);

    this._checkHalfEnd();

    this.snapLog.push({ play: this.totalPlays, offPlay: offPlay.name, defPlay: defPlay.name, result: result.description, event: gameEvent });
    return { result, offPlay, defPlay, featuredOff, featuredDef, gotFirstDown, gameEvent };
  }

  /**
   * Handle conversion after a touchdown.
   * @param {'xp'|'2pt'|'3pt'} choice
   * @param {object} [offPlay] - For 2pt/3pt, the play used
   * @param {object} [featuredOff] - Featured player for conversion
   * @returns {object} { success, points, result }
   */
  handleConversion(choice, offPlay, featuredOff) {
    const scoringTeam = this.possession;

    if (choice === 'xp') {
      if (scoringTeam === 'CT') this.ctScore += 1;
      else this.irScore += 1;
      this.flipPossession(50);
      this._checkHalfEnd();
      return { success: true, points: 1 };
    }

    // 2pt or 3pt: resolve a snap from the appropriate yard line
    const fromYardLine = choice === '2pt' ? 5 : 10;
    const sides = this.getCurrentSides();
    const situation = { down: 1, distance: fromYardLine, ballPos: this.ballPosition, playHistory: [], scoreDiff: 0 };

    if (!offPlay) offPlay = aiSelectPlay(sides.offHand, 'offense', this.difficulty, situation);
    if (!featuredOff) featuredOff = aiSelectPlayer(sides.offPlayers, offPlay, this.difficulty, true);
    const defPlay = aiSelectPlay(sides.defHand, 'defense', this.difficulty, situation);
    const featuredDef = aiSelectPlayer(sides.defPlayers, defPlay, this.difficulty, false);

    const context = {
      playHistory: [], yardsToEndzone: fromYardLine,
      ballPosition: scoringTeam === 'CT' ? 100 - fromYardLine : fromYardLine,
      down: 1, distance: fromYardLine, isConversion: true, scoreDiff: 0,
    };

    const result = resolveSnap(offPlay, defPlay, featuredOff, featuredDef,
      sides.offPlayers, sides.defPlayers, context);

    const success = result.isTouchdown;
    const points = choice === '2pt' ? 2 : 3;

    if (success) {
      if (scoringTeam === 'CT') this.ctScore += points;
      else this.irScore += points;
    }

    this.flipPossession(50);
    this._checkHalfEnd();
    return { success, points: success ? points : 0, result };
  }

  /** Award TORCH points to the correct teams */
  _awardTorchPts(offPts, defPts) {
    if (this.possession === 'CT') {
      this.ctTorchPts += offPts;
      this.irTorchPts += defPts;
    } else {
      this.irTorchPts += offPts;
      this.ctTorchPts += defPts;
    }
  }

  /** Check if the half should end */
  _checkHalfEnd() {
    if (!this.twoMinActive && this.playsUsed >= this.playsPerHalf) {
      this.twoMinActive = true;
      this.clockSeconds = 120;
    }
    if (this.twoMinActive && this.clockSeconds <= 0) {
      if (this.half === 1) {
        this.half = 2;
        this.playsUsed = 0;
        this.twoMinActive = false;
        this.clockSeconds = 120;
        this.flipPossession(50);
      } else {
        this._endGame();
      }
    }
    if (this.totalPlays > 120) {
      this._endGame();
    }
  }

  /** End the game */
  _endGame() {
    this.gameOver = true;
    // Win bonus
    if (this.ctScore > this.irScore) this.ctTorchPts += 100;
    else if (this.irScore > this.ctScore) this.irTorchPts += 100;
  }

  /** Get a summary of the current game state for UI */
  getSummary() {
    return {
      ctScore: this.ctScore, irScore: this.irScore,
      possession: this.possession,
      ballPosition: this.ballPosition,
      down: this.down, distance: this.distance,
      half: this.half,
      playsUsed: this.playsUsed,
      twoMinActive: this.twoMinActive,
      clockSeconds: this.clockSeconds,
      ctTorchPts: this.ctTorchPts, irTorchPts: this.irTorchPts,
      yardsToEndzone: this.yardsToEndzone(),
      gameOver: this.gameOver,
      totalPlays: this.totalPlays,
    };
  }
}
