/**
 * TORCH — Game State Manager
 * Ported from torch_sim.py GameState class.
 * Manages score, ball position, down/distance, halves, clock,
 * possession, drive history, TORCH points, Torch Card inventory,
 * injury tracking, and all state transitions.
 */

import { resolveSnap } from './snapResolver.js';
import { calcOffenseTorchPoints, calcDefenseTorchPoints } from './torchPoints.js';
import { updateHeat } from './personnelSystem.js';
import { updateMomentum, decayMomentum, spikeMomentum, crashMomentum } from './momentumSystem.js';
import { calcReturnYards } from './turnoverReturns.js';
import { checkInjury, healInjuries } from './injuries.js';
import { aiSelectPlay, aiSelectPlayer } from './aiOpponent.js';

// New Managers
import { ClockManager } from './managers/ClockManager.js';
import { ScoreManager } from './managers/ScoreManager.js';
import { FieldManager } from './managers/FieldManager.js';
import { StatManager } from './managers/StatManager.js';
import { EconomyManager } from './managers/EconomyManager.js';
import { SpecialTeamsManager } from './managers/SpecialTeamsManager.js';
import { engineBridge } from './worker/engineBridge.js';

export class GameState {
  constructor({ humanTeam = 'CT', difficulty = 'MEDIUM', ctOffHand, ctDefHand, irOffHand, irDefHand,
                ctOffRoster, ctDefRoster, irOffRoster, irDefRoster, coachBadge = 'SCHEMER',
                initialBallPos, initialDown, initialDistance, initialPossession,
                ctTeamId = null, irTeamId = null }) {
    // Basic config
    this.humanTeam = humanTeam;
    this.cpuTeam = humanTeam === 'CT' ? 'IR' : 'CT';
    this.ctTeamId = ctTeamId;
    this.irTeamId = irTeamId;
    this.difficulty = difficulty;
    this.coachBadge = coachBadge;
    this.halftimeAdjustment = 'balanced';

    // Environmental
    const weathers = ['CLEAR', 'CLEAR', 'RAIN', 'WINDY', 'SNOW'];
    this.weather = weathers[Math.floor(Math.random() * weathers.length)];
    this.momentum = 50;

    // Managers
    this.clock = new ClockManager(20);
    this.score = new ScoreManager();
    this.field = new FieldManager(initialBallPos, initialDown, initialDistance, initialPossession || this.cpuTeam);
    this.statsManager = new StatManager(this.field.possession);
    this.economy = new EconomyManager(this.difficulty);

    // Hands
    this.ctOffHand = ctOffHand;
    this.ctDefHand = ctDefHand;
    this.irOffHand = irOffHand;
    this.irDefHand = irDefHand;

    // Rosters
    this.ctOffRoster = ctOffRoster.map(p => ({ ...p, injured: false, injurySnapsRemaining: 0 }));
    this.ctDefRoster = ctDefRoster.map(p => ({ ...p, injured: false, injurySnapsRemaining: 0 }));
    this.irOffRoster = irOffRoster.map(p => ({ ...p, injured: false, injurySnapsRemaining: 0 }));
    this.irDefRoster = irDefRoster.map(p => ({ ...p, injured: false, injurySnapsRemaining: 0 }));

    // Personnel Systems
    this.offHeatMap = {};
    this.defHeatMap = {};
    this.offMomentumMap = {};
    this.defMomentumMap = {};

    this.humanTendencies = { runs: 0, passes: 0, total: 0 };

    // Compatibility Getters (for existing UI code)
    Object.defineProperty(this, 'ctScore', { get: () => this.score.ctScore, set: (v) => this.score.ctScore = v });
    Object.defineProperty(this, 'irScore', { get: () => this.score.irScore, set: (v) => this.score.irScore = v });
    Object.defineProperty(this, 'possession', { get: () => this.field.possession, set: (v) => this.field.possession = v });
    Object.defineProperty(this, 'ballPosition', { get: () => this.field.ballPosition, set: (v) => this.field.ballPosition = v });
    Object.defineProperty(this, 'down', { get: () => this.field.down, set: (v) => this.field.down = v });
    Object.defineProperty(this, 'distance', { get: () => this.field.distance, set: (v) => this.field.distance = v });
    Object.defineProperty(this, 'half', { get: () => this.clock.half, set: (v) => this.clock.half = v });
    Object.defineProperty(this, 'playsUsed', { get: () => this.clock.playsUsed, set: (v) => this.clock.playsUsed = v });
    Object.defineProperty(this, 'twoMinActive', { get: () => this.clock.twoMinActive, set: (v) => this.clock.twoMinActive = v });
    Object.defineProperty(this, 'clockSeconds', { get: () => this.clock.clockSeconds, set: (v) => this.clock.clockSeconds = v });
    Object.defineProperty(this, 'totalPlays', { get: () => this.clock.totalPlays, set: (v) => this.clock.totalPlays = v });
    Object.defineProperty(this, 'needsHalftime', { get: () => this.clock.needsHalftime, set: (v) => this.clock.needsHalftime = v });
    Object.defineProperty(this, 'gameOver', { get: () => this.clock.gameOver, set: (v) => this.clock.gameOver = v });
    Object.defineProperty(this, 'ctTorchPts', { get: () => this.economy.ctTorchPts, set: (v) => this.economy.ctTorchPts = v });
    Object.defineProperty(this, 'irTorchPts', { get: () => this.economy.irTorchPts, set: (v) => this.economy.irTorchPts = v });
    Object.defineProperty(this, 'humanTorchCards', { get: () => this.economy.humanTorchCards });
    Object.defineProperty(this, 'cpuTorchCards', { get: () => this.economy.cpuTorchCards });
    Object.defineProperty(this, 'stats', { get: () => this.statsManager.stats });
    Object.defineProperty(this, 'drivePlayHistory', { get: () => this.field.drivePlayHistory });
    Object.defineProperty(this, 'drivePlays', { get: () => this.field.drivePlays });
    Object.defineProperty(this, 'inRedZone', { get: () => this.field.inRedZone, set: (v) => this.field.inRedZone = v });

    this.snapLog = [];
  }

  /** Yards to the end zone for the team with possession */
  yardsToEndzone() {
    return this.field.getYardsToEndzone();
  }

  /** Flip possession after a score — uses kickoff distribution for starting position */
  kickoffFlip(opts = {}) {
    var res = SpecialTeamsManager.resolveKickoff(null, opts);
    var newPoss = this.field.possession === 'CT' ? 'IR' : 'CT';
    
    if (res.touchdown) {
      this.score.addPoints(newPoss, 7);
      this.statsManager.recordTouchdown(newPoss, true); // turnover/kick return TD
      this.field.possession = newPoss;
      return this.kickoffFlip(opts);
    }

    var ownYardLine = res.returnYard;
    var ballPos = newPoss === 'CT' ? ownYardLine : 100 - ownYardLine;
    this.flipPossession(ballPos);
    return { returnTD: false, startYard: ownYardLine };
  }

  /** Resolve a punt from current field position. Returns { gross, netYards, result, label }
   *  @param {object} [punter] - Punting player with st.kickPower (optional)
   */
  punt(punter, opts = {}) {
    const res = SpecialTeamsManager.resolvePunt(this.yardsToEndzone(), punter, opts);
    
    this.clock.advance(this.twoMinActive);

    if (res.blocked) {
      this.flipPossession(this.field.ballPosition);
    } else {
      const newPoss = this.field.possession === 'CT' ? 'IR' : 'CT';
      const newBallPos = newPoss === 'CT' ? res.newBallPosFromOwnEz : 100 - res.newBallPosFromOwnEz;
      this.flipPossession(newBallPos);
    }

    this._checkHalfEnd();
    return res;
  }

  /** Attempt a field goal. Returns { made, distance, label }
   *  @param {object} [kicker] - Kicking player with st.kickAccuracy (optional)
   *  @param {object} [opts] - { iceTheKicker, cannonLeg, blockedKick }
   */
  attemptFieldGoal(kicker, opts = {}) {
    const sides = this.getCurrentSides();
    const res = SpecialTeamsManager.resolveFieldGoal(this.yardsToEndzone(), kicker, opts, this.difficulty, sides.offenseIsHuman);
    
    this.clock.advance(this.twoMinActive);

    if (res.made) {
      this.score.addPoints(this.field.possession, 3);
      this.kickoffFlip();
    } else if (res.blocked) {
      this.flipPossession(this.field.ballPosition);
    } else {
      // Missed
      var spotYds = Math.max(20, this.yardsToEndzone());
      var newPoss = this.field.possession === 'CT' ? 'IR' : 'CT';
      var newBallPos = newPoss === 'CT' ? spotYds : 100 - spotYds;
      this.flipPossession(newBallPos);
    }

    this._checkHalfEnd();
    return res;
  }

  /** Check if the team can punt/FG (past the 50 into opponent territory) */
  canSpecialTeams() {
    return this.yardsToEndzone() <= 50;
  }

  /** Check if field goal is in range (max 50-yard FG default, or 60 with CANNON LEG) */
  canAttemptFG(cannonLeg) {
    var maxRange = cannonLeg ? 60 : 50;
    return this.canSpecialTeams() && (this.yardsToEndzone() + 17) <= maxRange;
  }

  /** AI Conversion Decision after TD */
  aiConversionDecision() {
    return this.score.aiDecision(this.field.possession, this.clock.half, this.clock.twoMinActive, this.clock.playsUsed, this.difficulty);
  }

  /** AI 4th down decision */
  ai4thDownDecision() {
    var dist = this.field.distance;
    var ydsToEz = this.yardsToEndzone();
    var scoreDiff = this.score.getDiff(this.field.possession);
    var desperate = scoreDiff >= 14 && this.clock.twoMinActive; // Trailing by 14+ late
    var aggressive = this.difficulty === 'HARD';
    
    if (ydsToEz > 50) {
      if (desperate) return 'go_for_it';
      if (dist === 1 && aggressive && Math.random() < 0.4) return 'go_for_it';
      return 'punt';
    }

    if (ydsToEz > 35) {
      if (desperate) return 'go_for_it';
      if (dist <= 2) return 'go_for_it';
      if (dist <= 5 && aggressive && Math.random() < 0.5) return 'go_for_it';
      return 'punt';
    }

    const sides = this.getCurrentSides();
    const inv = sides.offenseIsHuman ? this.economy.humanTorchCards : this.economy.cpuTorchCards;
    const hasCannon = inv.indexOf('cannon_leg') >= 0;

    if (this.canAttemptFG(hasCannon)) {
      if (desperate) return 'go_for_it';
      if (ydsToEz <= 5 && dist <= 3) return 'go_for_it';
      if (dist <= 2 && aggressive && Math.random() < 0.6) return 'go_for_it';
      return 'field_goal';
    }

    if (desperate || dist <= 5 || aggressive) return 'go_for_it';
    return 'punt';
  }

  /** Flip possession after score/turnover/failed 4th */
  flipPossession(newBallPos) {
    this.field.flip(newBallPos);
    this.statsManager.recordDrive(this.field.possession);
    decayMomentum(this.offMomentumMap);
    decayMomentum(this.defMomentumMap);
  }

  /** Advance the ball */
  advanceBall(yards) {
    this.field.advance(yards);
    this.statsManager.recordYards(this.field.possession, yards);
  }

  /** Get score diff from offense's perspective (positive = trailing) */
  getScoreDiff() {
    return this.score.getDiff(this.field.possession);
  }

  /** Get the offensive/defensive hands and rosters for current possession */
  getCurrentSides() {
    if (this.field.possession === 'CT') {
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
   * Async version for Phase 5.
   */
  async executeSnap(offPlay, featuredOff, defPlay, featuredDef, offCard, defCard, _devForceResult, extras) {
    if (this.gameOver) return null;

    const sides = this.getCurrentSides();
    const situation = {
      down: this.down, distance: this.distance,
      ballPos: this.ballPosition, playHistory: this.drivePlayHistory,
      scoreDiff: this.getScoreDiff(),
      teamId: sides.offenseIsHuman ? null : (this.possession === 'CT' ? this.ctTeamId : this.irTeamId),
      humanTendencies: this.humanTendencies,
    };

    // Track human tendencies (before resolution)
    if (sides.offenseIsHuman && offPlay) {
      this.humanTendencies.total++;
      if (offPlay.isRun || offPlay.playType === 'RUN') this.humanTendencies.runs++;
      else this.humanTendencies.passes++;
    }

    // Card Selection Logic (AI)
    if (offCard === undefined || offCard === null) {
      if (this.difficulty !== 'EASY') {
        const inv = sides.offenseIsHuman ? this.economy.humanTorchCards : this.economy.cpuTorchCards;
        const shouldUse = this.down >= 3 || this.twoMinActive || this.yardsToEndzone() <= 20 || this.getScoreDiff() > 7;
        if (inv.length > 0 && shouldUse && (this.difficulty === 'HARD' || Math.random() < 0.5)) {
          offCard = inv[0];
        }
      }
    }
    if (offCard) this.economy.useCard(this.possession, offCard);

    if (defCard === undefined || defCard === null) {
      if (this.difficulty !== 'EASY') {
        const defTeam = this.possession === 'CT' ? 'IR' : 'CT';
        const inv = sides.offenseIsHuman ? this.economy.cpuTorchCards : this.economy.humanTorchCards;
        const shouldUseDef = this.down >= 3 || this.twoMinActive || this.yardsToEndzone() <= 10;
        if (inv.length > 0 && shouldUseDef && (this.difficulty === 'HARD' || Math.random() < 0.4)) {
          defCard = inv[0];
        }
      }
    }
    if (defCard) this.economy.useCard(this.possession === 'CT' ? 'IR' : 'CT', defCard);

    // AI selects plays/players if not provided (NOW ASYNC via Worker)
    if (defPlay === undefined || defPlay === null) {
      defPlay = await engineBridge.aiSelectPlay(sides.defHand, 'defense', this.difficulty, situation);
    }
    if (offPlay === undefined || offPlay === null) {
      let oppPlay = (offCard === 'scout_team') ? defPlay : null;
      offPlay = await engineBridge.aiSelectPlay(sides.offHand, 'offense', this.difficulty, { ...situation, oppPlay });
    }
    if (featuredOff === undefined || featuredOff === null) {
      featuredOff = await engineBridge.aiSelectPlayer(sides.offPlayers, offPlay, this.difficulty, true, this.offHeatMap);
    }
    if (featuredDef === undefined || featuredDef === null) {
      featuredDef = await engineBridge.aiSelectPlayer(sides.defPlayers, defPlay, this.difficulty, false, this.defHeatMap);
    }

    // Situation tracking before resolution
    const ydsToEz = this.yardsToEndzone();
    if (ydsToEz <= 20 && !this.inRedZone) {
      this.inRedZone = true;
      this.statsManager.stats.redZoneTrips++;
    }
    const is4th = this.down === 4;
    if (is4th) this.statsManager.stats.fourthDownAttempts++;

    // Resolve (NOW ASYNC via Worker)
    const context = {
      playHistory: this.drivePlayHistory,
      yardsToEndzone: ydsToEz,
      ballPosition: this.ballPosition,
      down: this.down,
      distance: this.distance,
      isConversion: false,
      scoreDiff: this.getScoreDiff(),
      offCard, defCard,
      twoMinActive: this.twoMinActive,
      weather: this.weather,
      momentum: this.momentum,
      coachBadge: this.coachBadge,
      difficulty: this.difficulty,
      offenseIsHuman: sides.offenseIsHuman,
      offHeatMap: this.offHeatMap,
      defHeatMap: this.defHeatMap,
      offMomentumMap: this.offMomentumMap,
      halftimeAdjustment: this.halftimeAdjustment,
      cardComboBonus: extras && extras.cardComboBonus || null,
      starHotBonus: extras && extras.starHotBonus || 0,
    };

    const result = await engineBridge.resolveSnap(offPlay, defPlay, featuredOff, featuredDef, sides.offPlayers, sides.defPlayers, context);
    if (_devForceResult) _devForceResult(result, ydsToEz);

    // Update state using managers
    this.clock.advance(this.twoMinActive, result);
    this.field.recordPlay(offPlay.playType);
    
    // Personnel/Momentum updates
    updateHeat(featuredOff.id, sides.offPlayers.map(p => p.id), this.offHeatMap);
    updateHeat(featuredDef.id, sides.defPlayers.map(p => p.id), this.defHeatMap);
    updateMomentum(featuredOff.id, featuredOff, offPlay.playType, this.offMomentumMap);
    updateMomentum(featuredDef.id, featuredDef, defPlay.cardType, this.defMomentumMap);

    if (result.isTouchdown) spikeMomentum(featuredOff.id, 2, this.offMomentumMap);
    if (result.isInterception || result.isFumbleLost) {
      spikeMomentum(featuredDef.id, 3, this.defMomentumMap);
      crashMomentum(featuredOff.id, this.offMomentumMap);
    }
    if (result.isSack) spikeMomentum(featuredDef.id, 2, this.defMomentumMap);

    // Stats
    if (offCard || defCard) this.statsManager.recordTorchPlay(this.possession, result.yards);
    this.statsManager.recordExplosivePlay(result.yards, this);
    if (result.isSack) this.statsManager.recordSack(this.possession, this);
    if (result.isIncomplete) this.statsManager.recordIncompletion(this.possession);
    if (result.offComboPts > 0 || result.defComboPts > 0) this.statsManager.stats.badgeCombos++;

    // Game Events & Possession Flipping
    let gotFirstDown = false;
    let gameEvent = null;

    if (result.isInterception || result.isFumbleLost) {
      const defTeam = this.possession === 'CT' ? 'IR' : 'CT';
      const returnYds = calcReturnYards(featuredDef);
      const fumbleMod = result.isFumbleLost ? (this.possession === 'CT' ? 1 : -1) * Math.floor(result.yards * 0.5) : 0;
      let newPos = this.ballPosition + fumbleMod + (defTeam === 'CT' ? 1 : -1) * returnYds;

      if ((defTeam === 'CT' && newPos >= 100) || (defTeam === 'IR' && newPos <= 0)) {
        this.score.addPoints(defTeam, 7);
        this.statsManager.recordTouchdown(defTeam, true);
        gameEvent = 'turnover_td';
        this.kickoffFlip();
      } else {
        this.flipPossession(Math.max(1, Math.min(99, newPos)));
        gameEvent = result.isInterception ? 'interception' : 'fumble_lost';
        this.statsManager.recordTurnover(this.possession === 'CT' ? 'IR' : 'CT'); // Old offense
      }
      this.economy.triggerShop(this.humanTeam === defTeam, 'turnover');
    } else if (result.isTouchdown) {
      const scoringTeam = this.possession;
      this.score.addPoints(scoringTeam, 6);
      this.statsManager.recordTouchdown(scoringTeam, false, this.twoMinActive, this.inRedZone, this.drivePlays);
      gameEvent = 'touchdown';
      this.economy.triggerShop(this.humanTeam === scoringTeam, 'touchdown');
      // Set up for conversion
      this.field.ballPosition = scoringTeam === 'CT' ? 100 : 0;
    } else {
      // Normal advancement
      this.advanceBall(result.yards);
      gotFirstDown = this.field.updateDown(result.yards);
      if (gotFirstDown) {
        this.statsManager.recordFirstDown(this.possession, is4th);
      } else if (this.field.down > 4) {
        if (this.field.drivePlays <= 4) this.statsManager.stats.threeAndOuts++;
        gameEvent = 'turnover_on_downs';
        const defTeam = this.possession === 'CT' ? 'IR' : 'CT';
        this.economy.triggerShop(this.humanTeam === defTeam, 'fourthDownStop');
        this.flipPossession(this.field.ballPosition);
      }
    }

    // Award Torch Points
    const offPts = calcOffenseTorchPoints(result, gotFirstDown);
    const defPts = calcDefenseTorchPoints(result, gotFirstDown);
    this._awardTorchPts(offPts, defPts);

    // Final checks
    const injury = checkInjury(result, featuredOff, featuredDef);
    if (injury) { injury.player.injured = true; injury.player.injurySnapsRemaining = injury.snapsRemaining; }
    healInjuries([this.ctOffRoster, this.ctDefRoster, this.irOffRoster, this.irDefRoster]);
    this._checkHalfEnd();

    this.snapLog.push({ play: this.totalPlays, team: this.possession, offPlay: offPlay.name, result: result.description, event: gameEvent });
    return { result, offPlay, defPlay, featuredOff, featuredDef, offCard, defCard, gotFirstDown, gameEvent };
  }

  /** Use a one-time audible to swap the current play for a new random one from the deck */
  useAudible(isOffense) {
    if (this.statsManager.stats.audiblesUsed >= 1) return null;
    const sides = this.getCurrentSides();
    const pool = isOffense ? sides.offHand : sides.defHand;
    const newPlay = pool[Math.floor(Math.random() * pool.length)];
    this.statsManager.stats.audiblesUsed++;
    return newPlay;
  }

  /** Spike the ball — 2-minute drill only, 3 seconds off clock, 0 yards */
  spike() {
    if (!this.twoMinActive) return null;
    this.clock.tick(3);
    this.field.down++;
    if (this.field.down > 4) {
      this.flipPossession(this.field.ballPosition);
      return { event: 'turnover_on_downs', description: 'Ball spiked on 4th down — turnover on downs.' };
    }
    return { event: 'spike', description: 'Ball spiked. Clock stops.' };
  }

  /** Kneel the ball — 2-minute drill only, 30 seconds off clock, 0 yards */
  kneel() {
    if (!this.twoMinActive) return null;
    this.clock.tick(30);
    this.field.down++;
    healInjuries([this.ctOffRoster, this.ctDefRoster, this.irOffRoster, this.irDefRoster]);
    if (this.field.down > 4) {
      this.flipPossession(this.field.ballPosition);
      return { event: 'turnover_on_downs', description: 'Ball turned over on downs after kneel.' };
    }
    return { event: 'kneel', description: 'Quarterback kneels. Clock running.' };
  }

  /**
   * Handle conversion after a touchdown.
   * Async version.
   */
  async handleConversion(choice, offPlay, featuredOff, defPlay, featuredDef) {
    const scoringTeam = this.possession;

    if (choice === 'xp') {
      this.score.addPoints(scoringTeam, 1);
      this.field.ballPosition = 50;
      this.kickoffFlip();
      this._checkHalfEnd();
      return { success: true, points: 1 };
    }

    const fromYardLine = choice === '2pt' ? 5 : 10;
    const sides = this.getCurrentSides();
    const situation = { down: 1, distance: fromYardLine, ballPos: this.ballPosition, playHistory: [], scoreDiff: 0, teamId: null };

    if (!offPlay) offPlay = await engineBridge.aiSelectPlay(sides.offHand, 'offense', this.difficulty, situation);
    if (!featuredOff) featuredOff = await engineBridge.aiSelectPlayer(sides.offPlayers, offPlay, this.difficulty, true);
    if (!defPlay) defPlay = await engineBridge.aiSelectPlay(sides.defHand, 'defense', this.difficulty, situation);
    if (!featuredDef) featuredDef = await engineBridge.aiSelectPlayer(sides.defPlayers, defPlay, this.difficulty, false);

    const context = {
      playHistory: [], yardsToEndzone: fromYardLine,
      ballPosition: scoringTeam === 'CT' ? 100 - fromYardLine : fromYardLine,
      down: 1, distance: fromYardLine, isConversion: true,
      scoreDiff: this.getScoreDiff(),
      weather: this.weather || 'CLEAR',
      momentum: this.momentum || 50,
      coachBadge: this.coachBadge || '',
      difficulty: this.difficulty || 'MEDIUM',
      offenseIsHuman: sides.offenseIsHuman,
    };

    const result = await engineBridge.resolveSnap(offPlay, defPlay, featuredOff, featuredDef, sides.offPlayers, sides.defPlayers, context);

    const success = result.isTouchdown;
    const points = choice === '2pt' ? 2 : 3;
    if (success) this.score.addPoints(scoringTeam, points);

    this.field.ballPosition = 50;

    // Onside Kick
    var onsideRecovery = false;
    var scoringInv = scoringTeam === this.humanTeam ? this.humanTorchCards : this.cpuTorchCards;
    var onsideIdx = scoringInv.indexOf('onside_kick');
    if (onsideIdx >= 0) {
      scoringInv.splice(onsideIdx, 1);
      if (Math.random() < 0.35) {
        onsideRecovery = true;
        this.field.ballPosition = 50;
        this.field.down = 1;
        this.field.distance = 10;
      }
    }
    
    if (!onsideRecovery) this.kickoffFlip();
    this._checkHalfEnd();
    return { success, points: success ? points : 0, result, onsideRecovery };
  }

  /** Halftime Booster Shop */
  halftimeShop() {
    this.economy.triggerShop(true, 'halftime');
    this.economy.triggerShop(false, 'halftime');
  }

  /** Award TORCH points to the correct teams */
  _awardTorchPts(offPts, defPts) {
    const irOff = this.possession === 'IR' ? Math.ceil(offPts * 1.2) : offPts;
    const irDef = this.possession === 'CT' ? Math.ceil(defPts * 1.2) : defPts;
    this.economy.awardPoints(this.possession === 'CT' ? offPts : irDef, this.possession === 'IR' ? irOff : irDef);
  }

  /** Compatibility Wrapper */
  _triggerShop(isHuman, trigger) {
    this.economy.triggerShop(isHuman, trigger);
  }

  /** Compatibility Wrapper */
  _triggerAiShop(trigger) {
    this.economy.triggerShop(false, trigger);
  }

  /** Check if the half should end */
  _checkHalfEnd() {
    const transition = this.clock.checkTransitions(this.score.ctScore, this.score.irScore);
    if (transition === 'overtime') {
      this.kickoffFlip();
    } else if (transition === 'gameover') {
      this._endGame();
    }
  }

  /** Transition to the second half */
  startSecondHalf() {
    this.clock.startSecondHalf();
  }

  /** End the game */
  _endGame() {
    this.economy.awardPoints(this.score.ctScore > this.score.irScore ? 20 : 0, this.score.irScore > this.score.ctScore ? 20 : 0);
  }

  /** Get a summary of the current game state for UI */
  getSummary() {
    return {
      ...this.score.getState(),
      ...this.field.getState(),
      ...this.clock.getState(),
      ...this.economy.getState()
    };
  }
}
