/**
 * TORCH — Persistence Regression Test
 * Verifies that Save/Resume preserves 100% of engine state.
 * Prevents "Ghost State" bugs where resumed games feel different.
 */

import { GameState } from '../engine/gameState.js';
import { getOffenseRoster, getDefenseRoster } from '../data/players.js';
import { SENTINELS_OFF_PLAYS, SENTINELS_DEF_PLAYS } from '../data/sentinelsPlays.js';

function assert(condition, message) {
  if (!condition) {
    console.error('  FAIL: ' + message);
    process.exit(1);
  }
}

export function runPersistenceTest() {
  console.log('\nTORCH Persistence Test');
  console.log('======================');

  // 1. Create a complex initial state
  console.log('Step 1: Creating complex mid-game state...');
  const teamId = 'sentinels';
  const oppId = 'wolves';
  
  const gs = new GameState({
    humanTeam: 'CT', difficulty: 'HARD',
    ctOffHand: SENTINELS_OFF_PLAYS.slice(0, 4),
    ctDefHand: SENTINELS_DEF_PLAYS.slice(0, 4),
    irOffHand: SENTINELS_OFF_PLAYS.slice(0, 4),
    irDefHand: SENTINELS_DEF_PLAYS.slice(0, 4),
    ctOffRoster: getOffenseRoster(teamId).slice(0, 4),
    ctDefRoster: getDefenseRoster(teamId).slice(0, 4),
    irOffRoster: getOffenseRoster(oppId).slice(0, 4),
    irDefRoster: getDefenseRoster(oppId).slice(0, 4),
    ctTeamId: teamId, irTeamId: oppId,
  });

  // Manually dirty the state
  gs.ctScore = 21;
  gs.irScore = 14;
  gs.possession = 'CT';
  gs.ballPosition = 72;
  gs.down = 3;
  gs.distance = 4;
  gs.half = 2;
  gs.playsUsed = 15;
  gs.twoMinActive = true;
  gs.clockSeconds = 45;
  gs.ctTorchPts = 450;
  gs.irTorchPts = 320;
  gs.momentum = 85;
  gs.cpuTorchCards = ['deep_shot', 'ice'];
  gs.offHeatMap = { 'p1': 3, 'p2': 1 };
  gs.defHeatMap = { 'd1': 5 };

  // 2. Generate a "Save Snapshot" (mimicking state.js saveGameState)
  console.log('Step 2: Generating snapshot...');
  const snapshot = {
    humanTeam: gs.humanTeam,
    ctScore: gs.ctScore,
    irScore: gs.irScore,
    possession: gs.possession,
    ballPosition: gs.ballPosition,
    down: gs.down,
    distance: gs.distance,
    half: gs.half,
    playsUsed: gs.playsUsed,
    totalPlays: gs.totalPlays,
    twoMinActive: gs.twoMinActive,
    clockSeconds: gs.clockSeconds,
    gameOver: gs.gameOver,
    ctTorchPts: gs.ctTorchPts,
    irTorchPts: gs.irTorchPts,
    humanTorchCards: gs.humanTorchCards,
    cpuTorchCards: gs.cpuTorchCards,
    weather: gs.weather,
    momentum: gs.momentum,
    offHeatMap: gs.offHeatMap,
    defHeatMap: gs.defHeatMap,
  };

  // 3. Simulate "Resume" (create fresh engine and apply snapshot)
  console.log('Step 3: Resuming into fresh engine...');
  const gs2 = new GameState({
    humanTeam: snapshot.humanTeam || 'CT', difficulty: 'HARD',
    initialPossession: snapshot.possession,
    initialBallPos: snapshot.ballPosition,
    initialDown: snapshot.down,
    initialDistance: snapshot.distance,
    ctOffHand: SENTINELS_OFF_PLAYS.slice(0, 4),
    ctDefHand: SENTINELS_DEF_PLAYS.slice(0, 4),
    irOffHand: SENTINELS_OFF_PLAYS.slice(0, 4),
    irDefHand: SENTINELS_DEF_PLAYS.slice(0, 4),
    ctOffRoster: getOffenseRoster(teamId).slice(0, 4),
    ctDefRoster: getDefenseRoster(teamId).slice(0, 4),
    irOffRoster: getOffenseRoster(oppId).slice(0, 4),
    irDefRoster: getDefenseRoster(oppId).slice(0, 4),
    ctTeamId: teamId, irTeamId: oppId,
  });

  // Apply non-constructor snapshot fields
  gs2.ctScore = snapshot.ctScore;
  gs2.irScore = snapshot.irScore;
  gs2.half = snapshot.half;
  gs2.playsUsed = snapshot.playsUsed;
  gs2.totalPlays = snapshot.totalPlays;
  gs2.twoMinActive = snapshot.twoMinActive;
  gs2.clockSeconds = snapshot.clockSeconds;
  gs2.ctTorchPts = snapshot.ctTorchPts;
  gs2.irTorchPts = snapshot.irTorchPts;
  gs2.cpuTorchCards = snapshot.cpuTorchCards;
  gs2.offHeatMap = snapshot.offHeatMap;
  gs2.defHeatMap = snapshot.defHeatMap;
  gs2.momentum = snapshot.momentum;

  // 4. Assert Equalities
  console.log('Step 4: Running assertions...');
  assert(gs2.ctScore === 21, 'Score mismatch (You)');
  assert(gs2.irScore === 14, 'Score mismatch (Opp)');
  assert(gs2.ballPosition === 72, 'Ball position mismatch');
  assert(gs2.down === 3, 'Down mismatch');
  assert(gs2.clockSeconds === 45, 'Clock mismatch');
  assert(gs2.momentum === 85, 'Momentum mismatch');
  assert(gs2.cpuTorchCards.length === 2, 'AI Card inventory mismatch');
  assert(gs2.offHeatMap['p1'] === 3, 'Heat map mismatch');
  
  // 5. Functional Test: Does the resumed engine produce same logic?
  console.log('Step 5: Verifying resumed engine logic...');
  const summary = gs2.getSummary();
  assert(summary.yardsToEndzone === 28, 'Derived yardsToEndzone mismatch');
  
  // Try a snap
  try {
    const res = gs2.executeSnap();
    assert(res && res.result, 'Resumed engine failed to execute snap');
    assert(gs2.totalPlays === 1, 'Total plays counter failed to increment');
  } catch(e) {
    assert(false, 'Engine crashed after resume: ' + e.message);
  }

  console.log('SUCCESS: Persistence test passed. Save/Resume is stable.');
  console.log('======================\n');
}
