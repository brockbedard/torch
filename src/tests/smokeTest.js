/**
 * TORCH — Headless Smoke Test
 * Exercises the game engine without a browser.
 *
 * Run via:
 *   node --input-type=module -e "import { runSmokeTest } from './src/tests/smokeTest.js'; runSmokeTest();"
 *
 * Note: Node may emit a MODULE_TYPELESS_PACKAGE_JSON warning when importing
 * .js files from a directory without "type": "module" in package.json.
 * This is harmless and can be ignored.
 */

import { GameState } from '../engine/gameState.js';
import { resolveSnap } from '../engine/snapResolver.js';
import { TORCH_CARDS, getCardById } from '../data/torchCards.js';
import { getOffenseRoster, getDefenseRoster } from '../data/players.js';
import { getOffCards, getDefCards } from '../state.js';

// ── Test harness ──

let totalTests = 0;
let passes = 0;
let failures = [];

function assert(condition, label) {
  totalTests++;
  if (condition) {
    passes++;
  } else {
    failures.push(label);
    console.log(`  FAIL: ${label}`);
  }
}

// ── Helpers ──

const TEAMS = ['sentinels', 'wolves', 'stags', 'serpents'];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomOpponent(teamId) {
  const others = TEAMS.filter(t => t !== teamId);
  return pickRandom(others);
}

function makeGameState(humanTeamId) {
  const cpuTeamId = pickRandomOpponent(humanTeamId);
  const ctOffHand = getOffCards(humanTeamId).slice(0, 5);
  const ctDefHand = getDefCards(humanTeamId).slice(0, 5);
  const irOffHand = getOffCards(cpuTeamId).slice(0, 5);
  const irDefHand = getDefCards(cpuTeamId).slice(0, 5);
  const ctOffRoster = getOffenseRoster(humanTeamId).slice();
  const ctDefRoster = getDefenseRoster(humanTeamId).slice();
  const irOffRoster = getOffenseRoster(cpuTeamId).slice();
  const irDefRoster = getDefenseRoster(cpuTeamId).slice();

  return new GameState({
    humanTeam: 'CT',
    difficulty: 'MEDIUM',
    ctOffHand,
    ctDefHand,
    irOffHand,
    irDefHand,
    ctOffRoster,
    ctDefRoster,
    irOffRoster,
    irDefRoster,
    coachBadge: 'SCHEMER',
  });
}

// ── Section 1: Simulate 20 snaps per team ──

function testSnapSimulation() {
  console.log('\n=== 1. Snap simulation (20 snaps x 4 teams) ===');

  for (const teamId of TEAMS) {
    const gs = makeGameState(teamId);
    console.log(`  Team: ${teamId} vs opponent`);

    for (let i = 0; i < 20; i++) {
      if (gs.gameOver) break;

      let snapResult;
      try {
        snapResult = gs.executeSnap();
      } catch (err) {
        assert(false, `${teamId} snap ${i + 1}: threw ${err.message}`);
        continue;
      }

      // executeSnap returns null when game is over
      if (snapResult === null) break;

      const r = snapResult.result;
      const label = `${teamId} snap ${i + 1}`;

      assert(r !== undefined && r !== null, `${label}: result exists`);
      assert(typeof r.yards === 'number' && Number.isFinite(r.yards), `${label}: yards is finite number (got ${r.yards})`);
      assert(r.playType === 'run' || r.playType === 'pass', `${label}: playType is run or pass (got ${r.playType})`);
      assert(gs.ctScore >= 0 && gs.irScore >= 0, `${label}: scores not negative (CT=${gs.ctScore}, IR=${gs.irScore})`);
      // Ball can be 0 (safety) or 100 (TD) transiently before flipPossession resets it
      assert(gs.ballPosition >= 0 && gs.ballPosition <= 100, `${label}: ball position 0-100 (got ${gs.ballPosition})`);
      assert(gs.down >= 1 && gs.down <= 4, `${label}: down 1-4 (got ${gs.down})`);
      assert(gs.distance >= 1 && gs.distance <= 99, `${label}: distance 1-99 (got ${gs.distance})`);

      // Handle conversion if touchdown
      if (snapResult.gameEvent === 'touchdown') {
        try {
          gs.handleConversion('xp');
        } catch (err) {
          assert(false, `${label}: conversion threw ${err.message}`);
        }
      }
    }
  }
}

// ── Section 2: Test each of the 12 TORCH cards ──

function testTorchCards() {
  console.log('\n=== 2. TORCH card effects (12 cards) ===');

  // Build a standard context for resolveSnap
  const humanTeam = 'sentinels';
  const cpuTeam = 'wolves';
  const offPlays = getOffCards(humanTeam);
  const defPlays = getDefCards(cpuTeam);
  const offRoster = getOffenseRoster(humanTeam);
  const defRoster = getDefenseRoster(cpuTeam);
  const offPlay = offPlays[0];
  const defPlay = defPlays[0];
  const featuredOff = offRoster[0];
  const featuredDef = defRoster[0];

  const baseContext = {
    playHistory: [],
    yardsToEndzone: 60,
    ballPosition: 40,
    down: 2,
    distance: 8,
    isConversion: false,
    scoreDiff: 0,
    weather: 'CLEAR',
    momentum: 50,
    coachBadge: 'SCHEMER',
    difficulty: 'MEDIUM',
    offenseIsHuman: true,
  };

  for (const card of TORCH_CARDS) {
    const isDefCard = card.id === 'ice';
    const ctx = {
      ...baseContext,
      offCard: isDefCard ? null : card.id,
      defCard: isDefCard ? card.id : null,
    };

    let result;
    try {
      result = resolveSnap(offPlay, defPlay, featuredOff, featuredDef, offRoster, defRoster, ctx);
      assert(true, `card ${card.id}: no crash`);
    } catch (err) {
      assert(false, `card ${card.id}: threw ${err.message}`);
      continue;
    }

    assert(result !== undefined && result !== null, `card ${card.id}: result exists`);
    assert(typeof result.yards === 'number' && Number.isFinite(result.yards), `card ${card.id}: yards finite`);
    assert(result.playType === 'run' || result.playType === 'pass', `card ${card.id}: playType valid`);
    assert(typeof result.description === 'string', `card ${card.id}: has description`);
  }

  // ── SURE_HANDS specific: force an interception scenario ──
  console.log('  Testing SURE_HANDS turnover cancellation...');
  let sureHandsCancelled = false;
  // Run many trials to get at least one interception that gets cancelled
  for (let trial = 0; trial < 500; trial++) {
    // Use a deep pass play for higher INT chance
    const deepPass = offPlays.find(p => p.playType === 'DEEP') || offPlays[0];
    const ctx = {
      ...baseContext,
      offCard: 'sure_hands',
      defCard: null,
      yardsToEndzone: 60,
    };
    const r = resolveSnap(deepPass, defPlay, featuredOff, featuredDef, offRoster, defRoster, ctx);
    if (r.torchCardUsed === 'sure_hands') {
      // SURE_HANDS triggered — the turnover should be cancelled
      assert(!r.isInterception && !r.isFumbleLost, 'SURE_HANDS: turnover cancelled (no INT/fumble on result)');
      assert(r.yards >= 0, 'SURE_HANDS: yards >= 0 after cancellation');
      sureHandsCancelled = true;
      break;
    }
  }
  if (!sureHandsCancelled) {
    // Didn't hit an interception in 500 trials — not a failure, just note it
    console.log('  (SURE_HANDS: no turnover triggered in 500 trials — card logic not exercised)');
  }

  // ── TWELFTH_MAN specific: verify +4 yards ──
  console.log('  Testing 12TH MAN +4 yard bonus...');
  {
    const ctxWith = { ...baseContext, offCard: 'twelfth_man', defCard: null };
    const ctxWithout = { ...baseContext, offCard: null, defCard: null };
    // Run many pairs and check average difference
    let totalDiff = 0;
    const pairCount = 200;
    // Since randomness is involved, we just verify the card doesn't crash
    // and check that on average the boost is positive
    for (let i = 0; i < pairCount; i++) {
      const rWith = resolveSnap(offPlay, defPlay, featuredOff, featuredDef, offRoster, defRoster, ctxWith);
      const rWithout = resolveSnap(offPlay, defPlay, featuredOff, featuredDef, offRoster, defRoster, ctxWithout);
      totalDiff += rWith.yards - rWithout.yards;
    }
    const avgDiff = totalDiff / pairCount;
    // The +4 bonus should show up as a positive average difference
    // We use a lenient threshold (>1) since randomness adds noise
    assert(avgDiff > 1, `12TH MAN: average yard boost is positive (avg diff=${avgDiff.toFixed(2)})`);
  }

  // ── ICE specific: verify comboPts are 0 ──
  console.log('  Testing ICE zeroes combo points...');
  {
    const ctx = { ...baseContext, offCard: null, defCard: 'ice' };
    let iceVerified = false;
    for (let trial = 0; trial < 100; trial++) {
      const r = resolveSnap(offPlay, defPlay, featuredOff, featuredDef, offRoster, defRoster, ctx);
      if (r.torchCardUsed === 'ice') {
        assert(r.offComboPts === 0, 'ICE: offComboPts is 0');
        assert(r.offComboYards === 0, 'ICE: offComboYards is 0');
        iceVerified = true;
        break;
      }
    }
    if (!iceVerified) {
      // ICE always fires when defCard='ice', so check directly
      const r = resolveSnap(offPlay, defPlay, featuredOff, featuredDef, offRoster, defRoster, ctx);
      assert(r.offComboPts === 0, 'ICE: offComboPts is 0 (direct)');
    }
  }
}

// ── Section 3: Test handleConversion ──

function testConversions() {
  console.log('\n=== 3. Conversions (xp, 2pt, 3pt) ===');

  for (const choice of ['xp', '2pt', '3pt']) {
    const gs = makeGameState('stags');
    // Force a touchdown state: set possession and score a TD
    gs.ctScore += 6;

    let convResult;
    try {
      convResult = gs.handleConversion(choice);
      assert(true, `handleConversion('${choice}'): no crash`);
    } catch (err) {
      assert(false, `handleConversion('${choice}'): threw ${err.message}`);
      continue;
    }

    assert(convResult !== undefined && convResult !== null, `handleConversion('${choice}'): result exists`);
    assert(typeof convResult.success === 'boolean', `handleConversion('${choice}'): has success boolean`);
    assert(typeof convResult.points === 'number', `handleConversion('${choice}'): has points number`);
  }
}

// ── Section 4: Test flipPossession ──

function testFlipPossession() {
  console.log('\n=== 4. flipPossession ===');

  const gs = makeGameState('serpents');
  const before = gs.possession;
  gs.flipPossession(50);
  const after = gs.possession;

  assert(before !== after, `flipPossession: possession changed (${before} -> ${after})`);
  assert(gs.ballPosition === 50, `flipPossession: ball at 50`);
  assert(gs.down === 1, `flipPossession: down reset to 1`);
  assert(gs.distance === 10, `flipPossession: distance reset to 10`);
}

// ── Main ──

export function runSmokeTest() {
  console.log('TORCH Smoke Test');
  console.log('================');

  testSnapSimulation();
  testTorchCards();
  testConversions();
  testFlipPossession();

  console.log('\n================');
  console.log(`Total: ${totalTests}  Passed: ${passes}  Failed: ${failures.length}`);
  if (failures.length > 0) {
    console.log('\nFailures:');
    for (const f of failures) {
      console.log(`  - ${f}`);
    }
    process.exitCode = 1;
  } else {
    console.log('\nAll tests passed.');
  }
}

// Allow direct CLI execution
// node --input-type=module -e "import { runSmokeTest } from './src/tests/smokeTest.js'; runSmokeTest();"
