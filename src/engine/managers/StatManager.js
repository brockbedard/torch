import { hasUpgrade } from '../../data/stadiumUpgrades.js';

export class StatManager {
  constructor(initialPossession) {
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

    if (initialPossession === 'CT') this.stats.ctDrives = 1;
    else this.stats.irDrives = 1;
  }

  recordDrive(team) {
    if (team === 'CT') this.stats.ctDrives++;
    else this.stats.irDrives++;
  }

  recordYards(team, yards) {
    if (team === 'CT') this.stats.ctTotalYards += yards;
    else this.stats.irTotalYards += yards;
  }

  recordTouchdown(team, isTurnoverTD = false, isTwoMin = false, inRedZone = false, drivePlays = 0) {
    if (team === 'CT') this.stats.ctTouchdowns++;
    else this.stats.irTouchdowns++;
    
    if (isTurnoverTD) this.stats.turnoverTDs++;
    if (isTwoMin) this.stats.twoMinScores++;
    if (inRedZone) this.stats.redZoneTDs++;
    if (drivePlays >= 6) this.stats.longDrives++;
  }

  recordTurnover(team) {
    if (team === 'CT') this.stats.ctTurnovers++;
    else this.stats.irTurnovers++;
  }

  recordFirstDown(team, is4th = false) {
    if (team === 'CT') this.stats.ctFirstDowns++;
    else this.stats.irFirstDowns++;
    if (is4th) this.stats.fourthDownConversions++;
  }

  recordSack(team, state) {
    this.stats.sackCount++;
    if (team === 'CT') this.stats.irSacks++; // IR sacked CT
    else this.stats.ctSacks++;

    if (state && hasUpgrade('jumbotron')) {
      state.momentum = Math.min(100, state.momentum + 6);
    } else if (state) {
      state.momentum = Math.min(100, state.momentum + 5);
    }
  }

  recordIncompletion(team) {
    if (team === 'CT') this.stats.ctIncompletions++;
    else this.stats.irIncompletions++;
  }

  recordTorchPlay(team, yards) {
    if (team === 'CT') {
      this.stats.ctTorchPlays++;
      this.stats.ctTorchYards += yards;
    } else {
      this.stats.irTorchPlays++;
      this.stats.irTorchYards += yards;
    }
  }

  recordExplosivePlay(yards, state) {
    if (yards >= 15) {
      this.stats.explosivePlays++;
      if (state && hasUpgrade('jumbotron')) {
        state.momentum = Math.min(100, state.momentum + 12);
      } else if (state) {
        state.momentum = Math.min(100, state.momentum + 10);
      }
    }
    if (yards >= 10) this.stats.bigPlays++;
  }

  getState() {
    return this.stats;
  }
}
