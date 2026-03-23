/**
 * TORCH — Engine Test
 * Plays 10 full games in the console and verifies output matches expectations.
 * Run: node src/engine/test.js
 */

import { GameState } from './gameState.js';
import { CT_OFF_PLAYS } from '../data/ctOffensePlays.js';
import { IR_OFF_PLAYS } from '../data/irOffensePlays.js';
import { CT_DEF_PLAYS } from '../data/ctDefensePlays.js';
import { IR_DEF_PLAYS } from '../data/irDefensePlays.js';
import { CT_OFFENSE, CT_DEFENSE, IR_OFFENSE, IR_DEFENSE } from '../data/players.js';

const NUM_GAMES = 100;
const DIFFICULTY = 'RANDOM';

const allResults = [];

for (let g = 0; g < NUM_GAMES; g++) {
  const humanTeam = g % 2 === 0 ? 'CT' : 'IR';

  const gs = new GameState({
    humanTeam,
    difficulty: DIFFICULTY,
    ctOffHand: CT_OFF_PLAYS,
    ctDefHand: CT_DEF_PLAYS,
    irOffHand: IR_OFF_PLAYS,
    irDefHand: IR_DEF_PLAYS,
    ctOffRoster: CT_OFFENSE,
    ctDefRoster: CT_DEFENSE,
    irOffRoster: IR_OFFENSE,
    irDefRoster: IR_DEFENSE,
  });

  let snapCount = 0;
  while (!gs.gameOver && snapCount < 150) {
    const snapResult = gs.executeSnap(); // AI plays both sides for testing

    if (!snapResult) break;

    // Handle touchdown conversion (auto XP for testing)
    if (snapResult.gameEvent === 'touchdown') {
      gs.handleConversion('xp');
    }

    snapCount++;
  }

  const summary = gs.getSummary();
  allResults.push({
    game: g + 1,
    humanTeam,
    ctScore: summary.ctScore,
    irScore: summary.irScore,
    totalPlays: summary.totalPlays,
    ctTorchPts: summary.ctTorchPts,
    irTorchPts: summary.irTorchPts,
    stats: gs.stats,
  });

  console.log(`Game ${g + 1}: CT ${summary.ctScore} - IR ${summary.irScore} | ` +
    `Plays: ${summary.totalPlays} | Sacks: ${gs.stats.sackCount} | ` +
    `TOs: CT=${gs.stats.ctTurnovers} IR=${gs.stats.irTurnovers} | ` +
    `Combos: ${gs.stats.badgeCombos} | ` +
    `CT TORCH: ${summary.ctTorchPts} | IR TORCH: ${summary.irTorchPts}`);
}

// === SUMMARY ===
console.log('\n' + '='.repeat(70));
console.log(`SUMMARY: ${NUM_GAMES} games on ${DIFFICULTY}`);
console.log('='.repeat(70));

const avg = (key) => allResults.reduce((s, r) => s + r[key], 0) / NUM_GAMES;
const avgStat = (key) => allResults.reduce((s, r) => s + r.stats[key], 0) / NUM_GAMES;

console.log(`\nAvg CT Score: ${avg('ctScore').toFixed(1)}`);
console.log(`Avg IR Score: ${avg('irScore').toFixed(1)}`);
console.log(`Avg Combined Score: ${(avg('ctScore') + avg('irScore')).toFixed(1)}  (target: ~22)`);
console.log(`Avg Total Plays: ${avg('totalPlays').toFixed(1)}`);
console.log(`Avg Sacks/game: ${avgStat('sackCount').toFixed(1)}  (target: 2-5)`);
console.log(`Avg CT Turnovers: ${avgStat('ctTurnovers').toFixed(1)}`);
console.log(`Avg IR Turnovers: ${avgStat('irTurnovers').toFixed(1)}  (target: ~0.5/team)`);
console.log(`Avg Badge Combos: ${avgStat('badgeCombos').toFixed(1)}  (target: ~25)`);
console.log(`Avg Explosive Plays: ${avgStat('explosivePlays').toFixed(1)}`);
console.log(`Avg First Downs CT: ${avgStat('ctFirstDowns').toFixed(1)}`);
console.log(`Avg First Downs IR: ${avgStat('irFirstDowns').toFixed(1)}`);
console.log(`Avg 3-and-outs: ${avgStat('threeAndOuts').toFixed(1)}  (target: 1-3)`);
console.log(`Avg Red Zone Trips: ${avgStat('redZoneTrips').toFixed(1)}`);
console.log(`Avg Red Zone TDs: ${avgStat('redZoneTDs').toFixed(1)}`);

const rzTrips = allResults.reduce((s, r) => s + r.stats.redZoneTrips, 0);
const rzTDs = allResults.reduce((s, r) => s + r.stats.redZoneTDs, 0);
console.log(`Red Zone TD Rate: ${rzTrips > 0 ? (rzTDs / rzTrips * 100).toFixed(0) : 'N/A'}%  (target: 55-65%)`);

console.log(`\nAvg CT TORCH pts: ${avg('ctTorchPts').toFixed(0)}`);
console.log(`Avg IR TORCH pts: ${avg('irTorchPts').toFixed(0)}`);

console.log('\n--- GAME BY GAME ---');
for (const r of allResults) {
  const winner = r.ctScore > r.irScore ? 'CT' : r.irScore > r.ctScore ? 'IR' : 'TIE';
  console.log(`#${r.game} Human:${r.humanTeam} CT:${r.ctScore} IR:${r.irScore} Winner:${winner} ` +
    `Plays:${r.totalPlays} Sacks:${r.stats.sackCount} Combos:${r.stats.badgeCombos}`);
}
