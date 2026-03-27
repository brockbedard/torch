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
import { calcReturnYards } from './turnoverReturns.js';
import { checkInjury, healInjuries } from './injuries.js';
import { aiSelectPlay, aiSelectPlayer } from './aiOpponent.js';
import { TORCH_CARDS } from '../data/torchCards.js';
// Old CT/IR play imports removed — plays come from constructor args

export class GameState {
  constructor({ humanTeam = 'CT', difficulty = 'MEDIUM', ctOffHand, ctDefHand, irOffHand, irDefHand,
                ctOffRoster, ctDefRoster, irOffRoster, irDefRoster, coachBadge = 'SCHEMER',
                initialBallPos, initialDown, initialDistance, initialPossession }) {
    // Teams
    this.humanTeam = humanTeam;
    this.cpuTeam = humanTeam === 'CT' ? 'IR' : 'CT';
    this.difficulty = difficulty;
    this.coachBadge = coachBadge; // SCHEMER, IRON_CURTAIN, SPEED_DEMON

    // Environmental
    const weathers = ['CLEAR', 'CLEAR', 'RAIN', 'WINDY', 'SNOW'];
    this.weather = weathers[Math.floor(Math.random() * weathers.length)];
    this.momentum = 50; // 0-100 scale

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
    this.possession = initialPossession || this.cpuTeam; // Default: CPU receives first
    this.ballPosition = initialBallPos !== undefined ? initialBallPos : 50;
    this.down = initialDown !== undefined ? initialDown : 1;
    this.distance = initialDistance !== undefined ? initialDistance : 10;

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
    this.inRedZone = this.yardsToEndzone() <= 20;

    // TORCH points
    this.ctTorchPts = 0;
    this.irTorchPts = 0;

    // Heat maps (personnel system) — { playerId: heatLevel }
    this.offHeatMap = {};
    this.defHeatMap = {};

    // Torch Cards (3 slots)
    this.humanTorchCards = [];
    this.cpuTorchCards = [];
    // AI starting cards scale with difficulty
    if (this.difficulty === 'MEDIUM') {
      var bronzePool = TORCH_CARDS.filter(function(c) { return c.tier === 'BRONZE'; });
      if (bronzePool.length > 0) this.cpuTorchCards.push(bronzePool[Math.floor(Math.random() * bronzePool.length)].id);
    } else if (this.difficulty === 'HARD') {
      var silverPool = TORCH_CARDS.filter(function(c) { return c.tier === 'SILVER'; });
      if (silverPool.length > 0) this.cpuTorchCards.push(silverPool[Math.floor(Math.random() * silverPool.length)].id);
    }

    // Stats
    this.stats = {
      ctTurnovers: 0, irTurnovers: 0,
      ctTouchdowns: 0, irTouchdowns: 0,
      ctTotalYards: 0, irTotalYards: 0,
      ctSacks: 0, irSacks: 0,
      ctFirstDowns: 0, irFirstDowns: 0,
      ctDrives: 0, irDrives: 0,
      ctIncompletions: 0, irIncompletions: 0,
      ctTorchPlays: 0, irTorchPlays: 0,
      ctTorchYards: 0, irTorchYards: 0,
      explosivePlays: 0, bigPlays: 0,
      leadChanges: 0, tiesBroken: 0,
      sackCount: 0, safeties: 0,
      fourthDownAttempts: 0, fourthDownConversions: 0,
      threeAndOuts: 0, longDrives: 0,
      badgeCombos: 0, historyBonuses: 0,
      redZoneTrips: this.inRedZone ? 1 : 0, redZoneTDs: 0,
      twoMinScores: 0, turnoverTDs: 0,
      audiblesUsed: 0,
    };

    // Game over flag
    this.gameOver = false;
    this.snapLog = []; // [{ half, team, down, ballPos, desc, yards }]
    this.needsHalftime = false;

    // Initialize drives count
    if (this.possession === 'CT') this.stats.ctDrives = 1;
    else this.stats.irDrives = 1;
  }

  /** Yards to the end zone for the team with possession */
  yardsToEndzone() {
    return this.possession === 'CT' ? 100 - this.ballPosition : this.ballPosition;
  }

  /** Simulate a kickoff and return the receiving team's starting position (own yard line, 0-100 scale) */
  static resolveKickoff() {
    var KICKOFF = [
      { weight: 58, min: 25, max: 25 },  // touchback
      { weight: 22, min: 20, max: 28 },  // short return
      { weight: 13, min: 28, max: 35 },  // avg return
      { weight: 5,  min: 35, max: 45 },  // good return
      { weight: 1.5, min: 45, max: 50 }, // big return
      { weight: 0.5, min: -1, max: -1 }, // return TD (handled separately)
    ];
    var total = KICKOFF.reduce(function(s, k) { return s + k.weight; }, 0);
    var r = Math.random() * total;
    for (var i = 0; i < KICKOFF.length; i++) {
      r -= KICKOFF[i].weight;
      if (r <= 0) {
        var k = KICKOFF[i];
        if (k.min === -1) return -1; // return TD signal
        return k.min + Math.floor(Math.random() * (k.max - k.min + 1));
      }
    }
    return 25; // fallback touchback
  }

  /** Flip possession after a score — uses kickoff distribution for starting position */
  kickoffFlip() {
    var ownYardLine = GameState.resolveKickoff();
    // Convert own yard line to 0-100 coordinate for the RECEIVING team
    var newPoss = this.possession === 'CT' ? 'IR' : 'CT';
    var ballPos;
    if (ownYardLine === -1) {
      // Kick return TD — award 6 points to receiving team, then do a normal flip
      if (newPoss === 'CT') this.ctScore += 6;
      else this.irScore += 6;
      // Recursively kick again (the team that just scored kicks off)
      this.possession = newPoss;
      this.kickoffFlip();
      return { returnTD: true };
    }
    // Own yard line: CT at position=ownYardLine, IR at position=100-ownYardLine
    ballPos = newPoss === 'CT' ? ownYardLine : 100 - ownYardLine;
    this.flipPossession(ballPos);
    return { returnTD: false, startYard: ownYardLine };
  }

  /** Resolve a punt from current field position. Returns { netYards, result, label } */
  punt() {
    // Gross distance distribution (~42 yd average)
    var GROSS = [
      { min: 25, max: 34, weight: 10 },
      { min: 35, max: 39, weight: 20 },
      { min: 40, max: 44, weight: 35 },
      { min: 45, max: 49, weight: 25 },
      { min: 50, max: 58, weight: 10 },
    ];
    var RETURN = [
      { ret: 0, weight: 40, label: 'Fair catch' },
      { ret: 8, weight: 35, label: 'Short return' },
      { ret: 19, weight: 20, label: 'Decent return' },
      { ret: 35, weight: 5, label: 'Big return' },
    ];

    // Roll gross
    var total = GROSS.reduce(function(s, g) { return s + g.weight; }, 0);
    var r = Math.random() * total;
    var gross = 42;
    for (var i = 0; i < GROSS.length; i++) {
      r -= GROSS[i].weight;
      if (r <= 0) { gross = GROSS[i].min + Math.floor(Math.random() * (GROSS[i].max - GROSS[i].min + 1)); break; }
    }

    // Landing spot (in 0-100 coordinates)
    var landingYdsToEz = Math.max(0, this.yardsToEndzone() - gross);
    // Touchback check if landing inside opponent's 10
    var isTouchback = false;
    if (landingYdsToEz < 10 && Math.random() < 0.6) {
      isTouchback = true;
    }

    // Return yards
    var retYards = 0;
    var retLabel = 'Fair catch';
    if (!isTouchback) {
      var rt = Math.random() * 100;
      for (var j = 0; j < RETURN.length; j++) {
        rt -= RETURN[j].weight;
        if (rt <= 0) {
          retYards = RETURN[j].ret + Math.floor(Math.random() * 5 - 2);
          retLabel = RETURN[j].label;
          break;
        }
      }
    }

    // Calculate new ball position for receiving team
    var receiverYdsFromOwnEz;
    if (isTouchback) {
      receiverYdsFromOwnEz = 25;
    } else {
      receiverYdsFromOwnEz = Math.max(5, landingYdsToEz + retYards);
      // Cap: can't return past midfield easily
      receiverYdsFromOwnEz = Math.min(50, receiverYdsFromOwnEz);
    }

    // Convert to 0-100 coordinate for new possessing team
    var newPoss = this.possession === 'CT' ? 'IR' : 'CT';
    var newBallPos = newPoss === 'CT' ? receiverYdsFromOwnEz : 100 - receiverYdsFromOwnEz;

    var netYards = gross - retYards;
    var label = isTouchback ? 'Punt — ' + gross + ' yards — Touchback' : 'Punt — ' + gross + ' yards — ' + retLabel + ' to the ' + receiverYdsFromOwnEz;

    this.totalPlays++;
    if (!this.twoMinActive) this.playsUsed++;
    this.flipPossession(newBallPos);
    this._checkHalfEnd();

    return { gross: gross, netYards: netYards, isTouchback: isTouchback, retLabel: retLabel, label: label, newBallPos: receiverYdsFromOwnEz };
  }

  /** Attempt a field goal. Returns { made, distance, label } */
  attemptFieldGoal() {
    var ydsToEz = this.yardsToEndzone();
    var fgDist = ydsToEz + 17; // 10yd endzone + 7yd snap

    // Make rates by distance
    var makePercent;
    if (fgDist <= 29) makePercent = 88;
    else if (fgDist <= 39) makePercent = 80;
    else if (fgDist <= 49) makePercent = 68;
    else makePercent = 50;

    // Difficulty mod for AI kicks
    var diffMod = { EASY: -5, MEDIUM: 0, HARD: 8 }[this.difficulty] || 0;
    var sides = this.getCurrentSides();
    if (!sides.offenseIsHuman) makePercent += diffMod;

    var made = Math.random() * 100 < makePercent;

    this.totalPlays++;
    if (!this.twoMinActive) this.playsUsed++;

    if (made) {
      // Award 3 points
      if (this.possession === 'CT') this.ctScore += 3;
      else this.irScore += 3;
      var label = fgDist + '-yard field goal is GOOD! +3';
      this.kickoffFlip();
      this._checkHalfEnd();
      return { made: true, distance: fgDist, label: label };
    } else {
      // Missed: opponent gets ball at LOS or the 20, whichever is farther from their endzone
      var losYds = 100 - ydsToEz; // LOS in terms of opponent's yards from own EZ
      var spotYds = Math.max(20, losYds);
      var newPoss = this.possession === 'CT' ? 'IR' : 'CT';
      var newBallPos = newPoss === 'CT' ? spotYds : 100 - spotYds;
      var label2 = fgDist + '-yard field goal NO GOOD!';
      this.flipPossession(newBallPos);
      this._checkHalfEnd();
      return { made: false, distance: fgDist, label: label2 };
    }
  }

  /** Check if the team can punt/FG (past the 50 into opponent territory) */
  canSpecialTeams() {
    return this.yardsToEndzone() <= 50;
  }

  /** Check if field goal is in range (max 50-yard FG) */
  canAttemptFG() {
    return this.canSpecialTeams() && (this.yardsToEndzone() + 17) <= 50;
  }

  /** AI 4th down decision */
  ai4thDownDecision() {
    var dist = this.distance;
    var ydsToEz = this.yardsToEndzone();
    var scoreDiff = this.possession === 'CT' ? this.ctScore - this.irScore : this.irScore - this.ctScore;
    var desperate = scoreDiff <= -14 && this.twoMinActive;
    var aggMod = { EASY: -15, MEDIUM: 0, HARD: 15 }[this.difficulty] || 0;

    // Must go for it in own territory
    if (!this.canSpecialTeams()) return 'go_for_it';

    // Always go for it: short yardage, desperate, or inside the 5
    if (dist <= 2) return 'go_for_it';
    if (desperate) return 'go_for_it';
    if (ydsToEz <= 5) return 'go_for_it';

    // FG range decisions
    if (this.canAttemptFG() && dist >= 6) {
      if (Math.random() * 100 < 85 + aggMod) return 'field_goal';
    }

    // Medium distance (3-5 yards)
    if (dist >= 3 && dist <= 5) {
      if (Math.random() * 100 < 65 + aggMod) return 'go_for_it';
      return 'punt';
    }

    // Long distance (6+), outside FG range
    if (dist >= 6 && !this.canAttemptFG()) {
      if (Math.random() * 100 < 80 - aggMod) return 'punt';
      return 'go_for_it';
    }

    return 'go_for_it';
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
   * @param {string} [offCard] - Offensive Torch Card ID
   * @param {string} [defCard] - Defensive Torch Card ID
   * @returns {object} { result, offPlay, defPlay, featuredOff, featuredDef, offCard, defCard, gotFirstDown, gameEvent }
   */
  executeSnap(offPlay, featuredOff, defPlay, featuredDef, offCard, defCard, _devForceResult) {
    if (this.gameOver) return null;

    const sides = this.getCurrentSides();
    const situation = {
      down: this.down, distance: this.distance,
      ballPos: this.ballPosition, playHistory: this.drivePlayHistory,
      scoreDiff: this.getScoreDiff(),
    };

    const offInv = sides.offenseIsHuman ? this.humanTorchCards : this.cpuTorchCards;
    const defInv = sides.offenseIsHuman ? this.cpuTorchCards : this.humanTorchCards;

    // AI selects Torch Cards based on difficulty
    // Easy: never uses cards. Medium: uses on 3rd down or 2-min. Hard: uses optimally.
    if (offCard === undefined || offCard === null) {
      if (this.difficulty === 'EASY') {
        // Easy AI never uses torch cards
      } else if (this.difficulty === 'MEDIUM') {
        if (offInv.length > 0 && (this.down >= 3 || this.twoMinActive) && Math.random() < 0.5) {
          offCard = offInv.splice(Math.floor(Math.random() * offInv.length), 1)[0];
        }
      } else {
        // Hard: use on 3rd down, 2-min, red zone, or trailing
        var shouldUse = this.down >= 3 || this.twoMinActive || this.yardsToEndzone() <= 20 || this.getScoreDiff() > 7;
        if (offInv.length > 0 && shouldUse) {
          offCard = offInv.shift();
        }
      }
    }
    if (defCard === undefined || defCard === null) {
      if (this.difficulty === 'EASY') {
        // Easy AI never uses torch cards
      } else if (this.difficulty === 'MEDIUM') {
        if (defInv.length > 0 && (this.down >= 3 || this.twoMinActive) && Math.random() < 0.4) {
          defCard = defInv.splice(Math.floor(Math.random() * defInv.length), 1)[0];
        }
      } else {
        var shouldUseDef = this.down >= 3 || this.twoMinActive || this.yardsToEndzone() <= 10;
        if (defInv.length > 0 && shouldUseDef) {
          defCard = defInv.shift();
        }
      }
    }

    // AI selects defense if not provided
    if (defPlay === undefined || defPlay === null) {
      defPlay = aiSelectPlay(sides.defHand, 'defense', this.difficulty, situation);
    }

    // AI selects offense if not provided
    if (offPlay === undefined || offPlay === null) {
      // Reveal Card Sim-Benefits
      let oppPlay = null;
      if (offCard === 'scout_team') {
        oppPlay = defPlay;
      }
      offPlay = aiSelectPlay(sides.offHand, 'offense', this.difficulty, { ...situation, oppPlay });
    }
    if (featuredOff === undefined || featuredOff === null) {
      featuredOff = aiSelectPlayer(sides.offPlayers, offPlay, this.difficulty, true);
    }
    if (featuredDef === undefined || featuredDef === null) {
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
      offCard,
      defCard,
      twoMinActive: this.twoMinActive,
      weather: this.weather,
      momentum: this.momentum,
      coachBadge: this.coachBadge,
      difficulty: this.difficulty,
      offenseIsHuman: sides.offenseIsHuman,
      offHeatMap: this.offHeatMap,
      defHeatMap: this.defHeatMap,
    };

    const result = resolveSnap(offPlay, defPlay, featuredOff, featuredDef,
      sides.offPlayers, sides.defPlayers, context);

    // Dev: force result override (applied before engine processes outcomes)
    if (_devForceResult) _devForceResult(result, ydsToEz);

    // Easy difficulty adjustments now handled in snapResolver.js

    // Update counters
    this.totalPlays++;
    this.drivePlays++;
    if (!this.twoMinActive) this.playsUsed++;
    this.drivePlayHistory.push(offPlay.playType);

    // Update heat maps (personnel system)
    var offIds = sides.offPlayers.map(function(p) { return p.id; });
    var defIds = sides.defPlayers.map(function(p) { return p.id; });
    updateHeat(featuredOff.id, offIds, this.offHeatMap);
    updateHeat(featuredDef.id, defIds, this.defHeatMap);

    // Track moments
    if (offCard || defCard) {
      if (this.possession === 'CT') {
        this.stats.ctTorchPlays++;
        this.stats.ctTorchYards += result.yards;
      } else {
        this.stats.irTorchPlays++;
        this.stats.irTorchYards += result.yards;
      }
    }

    if (result.yards >= 15) {
      this.stats.explosivePlays++;
      this.momentum = Math.min(100, this.momentum + 10);
    }
    if (result.yards >= 10) this.stats.bigPlays++;
    if (result.isSack) this.momentum = Math.min(100, this.momentum + 5);
    
    // Momentum decay
    this.momentum = Math.max(0, this.momentum - 1);

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
    // Safety removed in v1 — ball capped at 1-yard line instead

    if (result.isInterception) {
      const returnYds = calcReturnYards(featuredDef);
      if (this.possession === 'CT') {
        this.stats.ctTurnovers++;
        let newPos = this.ballPosition - returnYds;
        if (newPos <= 0) {
          this.irScore += 7; this.stats.irTouchdowns++; this.stats.turnoverTDs++;
          gameEvent = 'turnover_td';
          this.kickoffFlip();
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
          this.kickoffFlip();
        } else {
          this.flipPossession(Math.max(1, Math.min(99, newPos)));
          gameEvent = 'interception';
        }
      }
      const offPts = calcOffenseTorchPoints(result, false);
      const defPts = calcDefenseTorchPoints(result, false);
      this._awardTorchPts(offPts, defPts);
      this._checkHalfEnd();
      this.snapLog.push({ play: this.totalPlays, team: this.possession, offPlay: offPlay.name, defPlay: defPlay.name, result: result.description, event: gameEvent });
      return { result, offPlay, defPlay, featuredOff, featuredDef, offCard, defCard, gotFirstDown, gameEvent };
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
          this.kickoffFlip();
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
          this.kickoffFlip();
        } else {
          this.flipPossession(Math.max(1, Math.min(99, newPos)));
          gameEvent = 'fumble_lost';
        }
      }
      const offPts = calcOffenseTorchPoints(result, false);
      const defPts = calcDefenseTorchPoints(result, false);
      this._awardTorchPts(offPts, defPts);
      this._checkHalfEnd();
      this.snapLog.push({ play: this.totalPlays, team: this.possession, offPlay: offPlay.name, defPlay: defPlay.name, result: result.description, event: gameEvent });
      return { result, offPlay, defPlay, featuredOff, featuredDef, offCard, defCard, gotFirstDown, gameEvent };
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
      this.snapLog.push({ play: this.totalPlays, team: this.possession, offPlay: offPlay.name, defPlay: defPlay.name, result: result.description, event: gameEvent });
      // Possession flip will happen in handleConversion, but we should ensure ball resets to 50 there too.
      // However, if it's a turnover TD, it's already handled.
      // For a regular TD, we don't flip yet because of the conversion attempt.
      return { result, offPlay, defPlay, featuredOff, featuredDef, gotFirstDown, gameEvent, scoringTeam };
    }

    // Down and distance
    this.ballPosition = Math.max(1, Math.min(99, this.ballPosition));

    if (result.yards >= this.distance) {
      gotFirstDown = true;
      this.down = 1;
      // Always reset to 10 (or goal if inside the 10)
      const ydsLeft = this.yardsToEndzone();
      this.distance = ydsLeft <= 10 ? ydsLeft : 10;
      if (this.possession === 'CT') {
        this.stats.ctFirstDowns++;
        this.ctTorchPts += 10;
      } else {
        this.stats.irFirstDowns++;
        this.irTorchPts += 10;
      }
      if (is4th) this.stats.fourthDownConversions++;
    } else {
      // Negative yards (sacks, stuffed runs) increase the distance
      if (result.yards > 0) {
        this.distance -= result.yards;
      } else if (result.yards < 0) {
        this.distance += Math.abs(result.yards);
      }
      // Incomplete passes: distance stays the same (yards = 0)
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

    this.snapLog.push({ play: this.totalPlays, team: this.possession, offPlay: offPlay.name, defPlay: defPlay.name, result: result.description, event: gameEvent });
    return { result, offPlay, defPlay, featuredOff, featuredDef, offCard, defCard, gotFirstDown, gameEvent };
  }

  /** Use a one-time audible to swap the current play for a new random one from the deck */
  useAudible(isOffense) {
    if (this.stats.audiblesUsed >= 1) return null;

    const sides = this.getCurrentSides();
    const pool = isOffense ? sides.offHand : sides.defHand;
    const newPlay = pool[Math.floor(Math.random() * pool.length)];

    this.stats.audiblesUsed++;
    return newPlay;
  }

  /** Spike the ball — 2-minute drill only, 3 seconds off clock, 0 yards */
  spike() {
    if (!this.twoMinActive) return null;
    this.clockSeconds -= 3;
    this.totalPlays++;
    this.down++;  // Spike costs a down (like real football)
    if (this.down > 4) {
      // Turnover on downs after spike
      this.flipPossession(this.ballPosition);
      this.snapLog.push({ play: this.totalPlays, team: this.possession, offPlay: 'SPIKE', defPlay: '-', result: 'Ball spiked on 4th down — turnover.', event: 'turnover_on_downs' });
      this._checkHalfEnd();
      return { event: 'turnover_on_downs', description: 'Ball spiked on 4th down — turnover on downs.' };
    }
    this.snapLog.push({ play: this.totalPlays, team: this.possession, offPlay: 'SPIKE', defPlay: '-', result: 'Ball spiked. Clock stops.', event: 'spike' });
    this._checkHalfEnd();
    return { event: 'spike', description: 'Ball spiked. Clock stops.' };
  }

  /** Kneel the ball — 2-minute drill only, 30 seconds off clock, 0 yards */
  kneel() {
    if (!this.twoMinActive) return null;
    this.clockSeconds -= 30;
    this.totalPlays++;
    if (!this.twoMinActive) this.playsUsed++;
    healInjuries([this.ctOffRoster, this.ctDefRoster, this.irOffRoster, this.irDefRoster]);
    this.snapLog.push({ play: this.totalPlays, team: this.possession, offPlay: 'KNEEL', defPlay: '-', result: 'Quarterback kneels. Clock running.', event: 'kneel' });
    this._checkHalfEnd();
    return { event: 'kneel', description: 'Quarterback kneels. Clock running.' };
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
      this.kickoffFlip();
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
      down: 1, distance: fromYardLine, isConversion: true,
      scoreDiff: this.getScoreDiff(),
      weather: this.weather || 'CLEAR',
      momentum: this.momentum || 50,
      coachBadge: this.coachBadge || '',
      difficulty: this.difficulty || 'MEDIUM',
      offenseIsHuman: sides.offenseIsHuman,
    };

    const result = resolveSnap(offPlay, defPlay, featuredOff, featuredDef,
      sides.offPlayers, sides.defPlayers, context);

    const success = result.isTouchdown;
    const points = choice === '2pt' ? 2 : 3;

    if (success) {
      if (scoringTeam === 'CT') this.ctScore += points;
      else this.irScore += points;
    }

    // ONSIDE KICK: 35% chance to recover at midfield instead of flipping possession
    var onsideRecovery = false;
    var scoringInv = scoringTeam === 'CT' ? this.humanTorchCards : this.cpuTorchCards;
    var onsideIdx = scoringInv.indexOf('onside_kick');
    if (onsideIdx >= 0) {
      scoringInv.splice(onsideIdx, 1);  // consume the card
      if (Math.random() < 0.35) {
        onsideRecovery = true;
        // Don't flip — scoring team keeps it at the 50
        this.ballPosition = 50;
        this.down = 1;
        this.distance = 10;
        this.drivePlays = 0;
        this.drivePlayHistory = [];
      }
    }
    if (!onsideRecovery) {
      this.kickoffFlip();
    }
    this._checkHalfEnd();
    return { success, points: success ? points : 0, result, onsideRecovery };
  }

  /** Halftime Booster Shop — port of halftime_booster logic from sim */
  halftimeShop() {
    for (const teamAbbr of ['CT', 'IR']) {
      const isHuman = this.humanTeam === teamAbbr;
      const pts = teamAbbr === 'CT' ? this.ctTorchPts : this.irTorchPts;
      const inv = isHuman ? this.humanTorchCards : this.cpuTorchCards;

      const purchased = this._halftimeBooster(pts, isHuman);
      for (const cardId of purchased) {
        if (inv.length < 3) {
          inv.push(cardId);
          const card = TORCH_CARDS.find(c => c.id === cardId);
          if (teamAbbr === 'CT') this.ctTorchPts -= card.cost;
          else this.irTorchPts -= card.cost;
        }
      }
    }
  }

  _halftimeBooster(currentPts, isHuman) {
    const purchased = [];
    const pool = TORCH_CARDS.map(c => c.id);
    // Rough weighted choice
    const getOffer = () => {
      const r = Math.random();
      let tierPool;
      if (r < 0.50) tierPool = TORCH_CARDS.filter(c => c.tier === 'BRONZE');
      else if (r < 0.85) tierPool = TORCH_CARDS.filter(c => c.tier === 'SILVER');
      else tierPool = TORCH_CARDS.filter(c => c.tier === 'GOLD');
      return tierPool[Math.floor(Math.random() * tierPool.length)].id;
    };

    const offers = [getOffer(), getOffer(), getOffer()];

    if (isHuman) {
      // Human sees the shop UI — no auto-buy
      return purchased;
    }
    // AI buying logic based on difficulty
    const affordable = offers.filter(id => {
      const card = TORCH_CARDS.find(c => c.id === id);
      return card && card.cost <= currentPts;
    });
    if (this.difficulty === 'EASY') {
      // Easy AI never buys
    } else if (this.difficulty === 'MEDIUM') {
      // Medium: buy 1 cheapest
      if (affordable.length > 0) {
        purchased.push(affordable.reduce((a, b) => {
          return TORCH_CARDS.find(c => c.id === a).cost < TORCH_CARDS.find(c => c.id === b).cost ? a : b;
        }));
      }
    } else {
      // Hard: buy up to 2, best value (most expensive affordable)
      var sorted = affordable.slice().sort((a, b) => {
        return TORCH_CARDS.find(c => c.id === b).cost - TORCH_CARDS.find(c => c.id === a).cost;
      });
      for (var bi = 0; bi < Math.min(2, sorted.length); bi++) {
        var cardCost = TORCH_CARDS.find(c => c.id === sorted[bi]).cost;
        if (cardCost <= currentPts) {
          purchased.push(sorted[bi]);
          currentPts -= cardCost;
        }
      }
    }
    return purchased;
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
        this.needsHalftime = true;
      } else {
        this._endGame();
      }
    }
    // Hard cap total plays to prevent infinite loops
    if (this.totalPlays > 150) {
      this._endGame();
    }
  }

  /** Transition to the second half */
  startSecondHalf() {
    this.half = 2;
    this.playsUsed = 0;
    this.twoMinActive = false;
    this.clockSeconds = 120;
    this.needsHalftime = false;
    this.kickoffFlip();
  }

  /** End the game */
  _endGame() {
    this.gameOver = true;
    // Win bonus recalibrated for v0.23
    if (this.ctScore > this.irScore) this.ctTorchPts += 20;
    else if (this.irScore > this.ctScore) this.irTorchPts += 20;
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
