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
import { TORCH_CARDS } from '../data/torchCards.js';
// Old CT/IR play imports removed — plays come from constructor args

export class GameState {
  constructor({ humanTeam = 'CT', difficulty = 'MEDIUM', ctOffHand, ctDefHand, irOffHand, irDefHand,
                ctOffRoster, ctDefRoster, irOffRoster, irDefRoster, coachBadge = 'SCHEMER' }) {
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
      ctTorchPlays: 0, irTorchPlays: 0,
      ctTorchYards: 0, irTorchYards: 0,
      explosivePlays: 0, bigPlays: 0,
      leadChanges: 0, tiesBroken: 0,
      sackCount: 0, safeties: 0,
      fourthDownAttempts: 0, fourthDownConversions: 0,
      threeAndOuts: 0, longDrives: 0,
      badgeCombos: 0, historyBonuses: 0,
      redZoneTrips: 0, redZoneTDs: 0,
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
  executeSnap(offPlay, featuredOff, defPlay, featuredDef, offCard, defCard) {
    if (this.gameOver) return null;

    const sides = this.getCurrentSides();
    const situation = {
      down: this.down, distance: this.distance,
      ballPos: this.ballPosition, playHistory: this.drivePlayHistory,
      scoreDiff: this.getScoreDiff(),
    };

    const offInv = sides.offenseIsHuman ? this.humanTorchCards : this.cpuTorchCards;
    const defInv = sides.offenseIsHuman ? this.cpuTorchCards : this.humanTorchCards;

    // AI selects Torch Cards if not provided
    if (offCard === undefined || offCard === null) {
      if (this.difficulty === 'RANDOM') {
        if (offInv.length > 0 && Math.random() < 0.20) {
          offCard = offInv.splice(Math.floor(Math.random() * offInv.length), 1)[0];
        }
      } else if (offInv.length > 0 && (this.down >= 3 || this.twoMinActive)) {
        offCard = offInv.shift();
      }
    }
    if (defCard === undefined || defCard === null) {
      if (this.difficulty === 'RANDOM') {
        if (defInv.length > 0 && Math.random() < 0.20) {
          defCard = defInv.splice(Math.floor(Math.random() * defInv.length), 1)[0];
        }
      } else if (defInv.length > 0 && (this.down >= 3 || this.twoMinActive)) {
        defCard = defInv.shift();
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
    };

    const result = resolveSnap(offPlay, defPlay, featuredOff, featuredDef,
      sides.offPlayers, sides.defPlayers, context);

    // Easy difficulty adjustments now handled in snapResolver.js

    // Update counters
    this.totalPlays++;
    this.drivePlays++;
    if (!this.twoMinActive) this.playsUsed++;
    this.drivePlayHistory.push(offPlay.playType);

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
      this.snapLog.push({ play: this.totalPlays, team: this.possession, offPlay: offPlay.name, defPlay: defPlay.name, result: result.description, event: gameEvent });
      return { result, offPlay, defPlay, featuredOff, featuredDef, offCard, defCard, gotFirstDown, gameEvent };
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
    if (!this.twoMinActive) this.playsUsed++;
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
      this.flipPossession(50);
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

    if (isHuman && this.difficulty !== 'RANDOM') {
      const affordable = offers.filter(id => {
        const card = TORCH_CARDS.find(c => c.id === id);
        return card.cost <= currentPts;
      });
      if (affordable.length > 0 && Math.random() < 0.5) {
        // Buy most expensive affordable
        purchased.push(affordable.reduce((a, b) => {
          const cardA = TORCH_CARDS.find(c => c.id === a);
          const cardB = TORCH_CARDS.find(c => c.id === b);
          return cardA.cost > cardB.cost ? a : b;
        }));
      }
    } else {
      if (this.difficulty === 'RANDOM') {
        const affordable = offers.filter(id => TORCH_CARDS.find(c => c.id === id).cost <= currentPts);
        if (affordable.length > 0 && Math.random() < 0.5) {
          purchased.push(affordable[Math.floor(Math.random() * affordable.length)]);
        }
      } else if (this.difficulty === 'MEDIUM') {
        const affordable = offers.filter(id => TORCH_CARDS.find(c => c.id === id).cost <= currentPts);
        if (affordable.length > 0) {
          purchased.push(affordable.reduce((a, b) => {
            const cardA = TORCH_CARDS.find(c => c.id === a);
            const cardB = TORCH_CARDS.find(c => c.id === b);
            return cardA.cost < cardB.cost ? a : b;
          }));
        }
      } else if (this.difficulty === 'HARD') {
        const affordable = offers.filter(id => TORCH_CARDS.find(c => c.id === id).cost <= currentPts);
        if (affordable.length > 0) {
          purchased.push(affordable.reduce((a, b) => {
            const cardA = TORCH_CARDS.find(c => c.id === a);
            const cardB = TORCH_CARDS.find(c => c.id === b);
            return cardA.cost > cardB.cost ? a : b;
          }));
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
    this.flipPossession(50);
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
