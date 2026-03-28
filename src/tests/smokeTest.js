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
import { traitSynergy, heatPenalty, calculatePersonnelMod } from '../engine/personnelSystem.js';
import { createHandState, afterSnap, canDiscard, discard, redeal } from '../engine/handManager.js';
import { createSTDeck, burnPlayer, restorePlayer, aiPickST } from '../engine/stDeck.js';
import { updateMomentum, getMomentumBonus, decayMomentum } from '../engine/momentumSystem.js';
import { checkCardCombo } from '../engine/cardCombos.js';
import { checkAchievements, getProgress, getAllAchievements } from '../engine/achievements.js';
import { updateStreak, getStreak, getH2H } from '../engine/streaks.js';
import { recordGame, getHistory, getRecentGames, getFormString } from '../engine/gameHistory.js';
import { recordGameStats, getCareerStats, getCareerStatLines } from '../engine/careerStats.js';

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

// ── Section 5: Personnel System Tests ──

function testPersonnelSystem() {
  console.log('\n=== 5. Personnel System ===');

  // traitSynergy: BURNER + DEEP_PASS group should return a positive value
  var burnerPlayer = { trait: 'BURNER', pos: 'WR', stars: 3 };
  var synergyResult = traitSynergy(burnerPlayer, 'DEEP_PASS', false, null);
  assert(typeof synergyResult === 'number', 'traitSynergy: returns a number');
  assert(synergyResult > 0, 'traitSynergy: BURNER + DEEP_PASS is positive (got ' + synergyResult + ')');

  // heatPenalty: heat=0 should return 0
  var penaltyAt0 = heatPenalty(0);
  assert(penaltyAt0 === 0, 'heatPenalty: heat=0 returns 0 (got ' + penaltyAt0 + ')');

  // heatPenalty: heat=5 should return a negative value
  var penaltyAt5 = heatPenalty(5);
  assert(typeof penaltyAt5 === 'number', 'heatPenalty: heat=5 returns a number');
  assert(penaltyAt5 < 0, 'heatPenalty: heat=5 returns negative (got ' + penaltyAt5 + ')');

  // calculatePersonnelMod: returns a number in [-6, 6]
  var mockOffPlayers = [
    { id: 'o1', pos: 'QB', stars: 3, trait: 'DEEP BALL' },
    { id: 'o2', pos: 'WR', stars: 4, trait: 'BURNER' },
    { id: 'o3', pos: 'RB', stars: 2, trait: 'TRUCK STICK' },
    { id: 'o4', pos: 'TE', stars: 3, trait: 'SURE HANDS' },
    { id: 'o5', pos: 'OL', stars: 3, trait: 'ROAD GRADER' },
    { id: 'o6', pos: 'WR', stars: 3, trait: 'ROUTE IQ' },
    { id: 'o7', pos: 'WR', stars: 2, trait: 'YAC BEAST' },
  ];
  var mockDefPlayers = [
    { id: 'd1', pos: 'CB', stars: 3, trait: 'SHUTDOWN' },
    { id: 'd2', pos: 'LB', stars: 3, trait: 'TACKLER' },
    { id: 'd3', pos: 'DL', stars: 4, trait: 'PASS RUSHER' },
    { id: 'd4', pos: 'S',  stars: 3, trait: 'BALL HAWK' },
    { id: 'd5', pos: 'CB', stars: 2, trait: 'PRESS CORNER' },
    { id: 'd6', pos: 'LB', stars: 3, trait: 'COVERAGE LB' },
    { id: 'd7', pos: 'DL', stars: 3, trait: 'RUN STUFFER' },
  ];
  var personnelResult = calculatePersonnelMod({
    featuredOff: mockOffPlayers[1],
    featuredDef: mockDefPlayers[0],
    offPlayers: mockOffPlayers,
    defPlayers: mockDefPlayers,
    offPlayType: 'DEEP',
    defCardType: 'ZONE',
    offHeatMap: {},
    defHeatMap: {},
  });
  assert(typeof personnelResult.totalMod === 'number', 'calculatePersonnelMod: totalMod is a number');
  assert(personnelResult.totalMod >= -6 && personnelResult.totalMod <= 6, 'calculatePersonnelMod: totalMod in [-6, 6] (got ' + personnelResult.totalMod + ')');
}

// ── Section 6: Hand Management Tests ──

function testHandManagement() {
  console.log('\n=== 6. Hand Management ===');

  // Build mock plays and players (10 plays, 7 players)
  var mockPlays = [];
  for (var i = 0; i < 10; i++) {
    mockPlays.push({ id: 'play' + i, name: 'Play ' + i });
  }
  var mockPlayers = [];
  for (var j = 0; j < 7; j++) {
    mockPlayers.push({ id: 'player' + j, name: 'Player ' + j });
  }

  // createHandState: 10 plays + 7 players → 4+4 hand, 6+3 pile
  var hs = createHandState(mockPlays, mockPlayers);
  assert(hs.playHand.length === 4, 'createHandState: playHand has 4 cards (got ' + hs.playHand.length + ')');
  assert(hs.playerHand.length === 4, 'createHandState: playerHand has 4 cards (got ' + hs.playerHand.length + ')');
  assert(hs.playPile.length === 6, 'createHandState: playPile has 6 cards (got ' + hs.playPile.length + ')');
  assert(hs.playerPile.length === 3, 'createHandState: playerPile has 3 cards (got ' + hs.playerPile.length + ')');

  // afterSnap: removes played card and draws replacement — hand stays at 4
  var playedPlay = hs.playHand[0];
  var playedPlayer = hs.playerHand[0];
  afterSnap(hs, playedPlay, playedPlayer);
  assert(hs.playHand.length === 4, 'afterSnap: playHand stays at 4 (got ' + hs.playHand.length + ')');
  assert(hs.playerHand.length === 4, 'afterSnap: playerHand stays at 4 (got ' + hs.playerHand.length + ')');
  assert(hs.playHand.indexOf(playedPlay) === -1, 'afterSnap: played play removed from hand');
  assert(hs.playDiscard.length === 1, 'afterSnap: played play in discard (got ' + hs.playDiscard.length + ')');

  // canDiscard: true initially
  assert(canDiscard(hs, 'play') === true, 'canDiscard: true before any discard');
  assert(canDiscard(hs, 'player') === true, 'canDiscard: player true before any discard');

  // discard() then canDiscard returns false
  discard(hs, 'play', [hs.playHand[0]]);
  assert(canDiscard(hs, 'play') === false, 'canDiscard: false after discard used');

  // redeal: resets everything to fresh 4+4
  redeal(hs);
  assert(hs.playHand.length === 4, 'redeal: playHand is 4 (got ' + hs.playHand.length + ')');
  assert(hs.playerHand.length === 4, 'redeal: playerHand is 4 (got ' + hs.playerHand.length + ')');
  assert(hs.playDiscard.length === 0, 'redeal: playDiscard is empty');
  assert(hs.playerDiscard.length === 0, 'redeal: playerDiscard is empty');
  assert(hs.playDiscardsUsed === 0, 'redeal: playDiscardsUsed reset to 0');
  assert(hs.playerDiscardsUsed === 0, 'redeal: playerDiscardsUsed reset to 0');
}

// ── Section 7: ST Deck Tests ──

function testSTDeck() {
  console.log('\n=== 7. ST Deck ===');

  // Build mock 14-player roster
  var mockRoster = [];
  for (var i = 0; i < 14; i++) {
    mockRoster.push({
      id: 'st' + i,
      name: 'Player ' + i,
      st: { kickPower: 2 + (i % 4), kickAccuracy: 2 + (i % 4), returnAbility: 2 + (i % 4) },
    });
  }

  // createSTDeck: 14 available, 0 burned
  var deck = createSTDeck(mockRoster);
  assert(deck.available.length === 14, 'createSTDeck: 14 available (got ' + deck.available.length + ')');
  assert(deck.burned.length === 0, 'createSTDeck: 0 burned (got ' + deck.burned.length + ')');

  // burnPlayer: moves player from available to burned
  var playerToBurn = deck.available[0];
  burnPlayer(deck, playerToBurn, 'kicker', 'FG Q1');
  assert(deck.available.length === 13, 'burnPlayer: available drops to 13 (got ' + deck.available.length + ')');
  assert(deck.burned.length === 1, 'burnPlayer: burned has 1 entry (got ' + deck.burned.length + ')');
  assert(deck.available.indexOf(playerToBurn) === -1, 'burnPlayer: player removed from available');

  // restorePlayer: moves player back from burned to available
  restorePlayer(deck, playerToBurn);
  assert(deck.available.length === 14, 'restorePlayer: available back to 14 (got ' + deck.available.length + ')');
  assert(deck.burned.length === 0, 'restorePlayer: burned is empty (got ' + deck.burned.length + ')');

  // aiPickST: returns a player object (not null) when deck has players
  var picked = aiPickST(deck, 'kickAccuracy', 'HARD');
  assert(picked !== null && picked !== undefined, 'aiPickST: returns a player (not null)');
  assert(typeof picked.id === 'string', 'aiPickST: returned player has an id');
}

// ── Section 8: New Torch Card Engine Tests ──

function testTorchCardEngine() {
  console.log('\n=== 8. Torch Card Engine (punt/FG/kickoff) ===');

  // punt() with opts.coffinCorner: newBallPos should be <= 10
  {
    var gs = makeGameState('sentinels');
    // Place offense deep in own territory so punt goes toward opponent endzone
    // CT possesses, ballPosition=20 means yardsToEndzone=80 for CT
    gs.possession = 'CT';
    gs.ballPosition = 20;
    gs.down = 4;
    gs.distance = 15;

    var puntPassed = true;
    for (var trial = 0; trial < 20; trial++) {
      var gs2 = makeGameState('sentinels');
      gs2.possession = 'CT';
      gs2.ballPosition = 20;
      gs2.down = 4;
      gs2.distance = 15;
      var puntResult = gs2.punt(null, { coffinCorner: true });
      if (puntResult.newBallPos > 10) {
        puntPassed = false;
        assert(false, 'punt coffinCorner: newBallPos > 10 on trial ' + trial + ' (got ' + puntResult.newBallPos + ')');
        break;
      }
    }
    if (puntPassed) {
      assert(true, 'punt coffinCorner: newBallPos <= 10 across 20 trials');
    }
  }

  // punt() with opts.fairCatchGhost: retLabel should be 'Fair catch'
  {
    var gs3 = makeGameState('wolves');
    gs3.possession = 'CT';
    gs3.ballPosition = 20;
    gs3.down = 4;
    gs3.distance = 12;
    var fairResult = gs3.punt(null, { fairCatchGhost: true });
    assert(fairResult.retLabel === 'Fair catch', 'punt fairCatchGhost: retLabel is "Fair catch" (got "' + fairResult.retLabel + '")');
  }

  // attemptFieldGoal() with opts.iceTheKicker: returns {made, distance, label}
  {
    var gs4 = makeGameState('stags');
    gs4.possession = 'CT';
    gs4.ballPosition = 68; // ~32 yds to endzone → ~49 yd FG
    gs4.down = 4;
    gs4.distance = 5;
    var fgResult = gs4.attemptFieldGoal(null, { iceTheKicker: true });
    assert(typeof fgResult.made === 'boolean', 'attemptFieldGoal iceTheKicker: result.made is boolean');
    assert(typeof fgResult.distance === 'number', 'attemptFieldGoal iceTheKicker: result.distance is number');
    assert(typeof fgResult.label === 'string', 'attemptFieldGoal iceTheKicker: result.label is string');
  }

  // GameState.resolveKickoff(null, { houseCall: true }): result >= 50 or -1
  {
    var houseCallPassed = true;
    for (var k = 0; k < 50; k++) {
      var kickResult = GameState.resolveKickoff(null, { houseCall: true });
      if (kickResult !== -1 && kickResult < 50) {
        houseCallPassed = false;
        assert(false, 'resolveKickoff houseCall: result not >= 50 and not -1 (got ' + kickResult + ')');
        break;
      }
    }
    if (houseCallPassed) {
      assert(true, 'resolveKickoff houseCall: all results >= 50 or -1 across 50 trials');
    }
  }
}

// ── localStorage mock (Node environment) ──
// Node 25 has a localStorage stub but setItem is not functional — replace it unconditionally
// when running in Node (no window object).
if (typeof window === 'undefined') {
  globalThis.localStorage = {
    _d: {},
    getItem: function(k) { return this._d[k] !== undefined ? this._d[k] : null; },
    setItem: function(k, v) { this._d[k] = v; },
    removeItem: function(k) { delete this._d[k]; },
    clear: function() { this._d = {}; },
  };
}

// ── Section 9: Momentum System ──

function testMomentumSystem() {
  console.log('\n=== 9. Momentum System ===');

  // Matched play increments momentum
  var map = {};
  var wr = { pos: 'WR' };
  var result = updateMomentum('p1', wr, 'DEEP', map);
  assert(result === 1, 'updateMomentum: matched play increments to 1 (got ' + result + ')');

  // Unmatched play decrements (RB on pass play)
  var map2 = { 'p2': 3 };
  var rb = { pos: 'RB' };
  var result2 = updateMomentum('p2', rb, 'DEEP', map2);
  assert(result2 === 2, 'updateMomentum: unmatched play decrements from 3 to 2 (got ' + result2 + ')');

  // Cap at 5
  var map3 = { 'p3': 5 };
  var result3 = updateMomentum('p3', wr, 'DEEP', map3);
  assert(result3 === 5, 'updateMomentum: caps at 5 (got ' + result3 + ')');

  // Floor at 0
  var map4 = { 'p4': 0 };
  var result4 = updateMomentum('p4', wr, 'RUN', map4);
  assert(result4 === 0, 'updateMomentum: WR on RUN play floors at 0 (got ' + result4 + ')');

  // Missing player/map returns 0
  var result5 = updateMomentum(null, wr, 'DEEP', {});
  assert(result5 === 0, 'updateMomentum: null playerId returns 0');

  // getMomentumBonus: 0 at values 0-2
  assert(getMomentumBonus(0) === 0, 'getMomentumBonus: 0 at momentum 0');
  assert(getMomentumBonus(2) === 0, 'getMomentumBonus: 0 at momentum 2');

  // getMomentumBonus: +1 at 3
  assert(getMomentumBonus(3) === 1, 'getMomentumBonus: 1 at momentum 3');

  // getMomentumBonus: +2 at 4 and 5
  assert(getMomentumBonus(4) === 2, 'getMomentumBonus: 2 at momentum 4');
  assert(getMomentumBonus(5) === 2, 'getMomentumBonus: 2 at momentum 5');

  // decayMomentum reduces all values by 2, floor 0
  var decayMap = { 'a': 5, 'b': 3, 'c': 1, 'd': 0 };
  decayMomentum(decayMap);
  assert(decayMap['a'] === 3, 'decayMomentum: 5 decays to 3 (got ' + decayMap['a'] + ')');
  assert(decayMap['b'] === 1, 'decayMomentum: 3 decays to 1 (got ' + decayMap['b'] + ')');
  assert(decayMap['c'] === 0, 'decayMomentum: 1 decays to 0 (floor) (got ' + decayMap['c'] + ')');
  assert(decayMap['d'] === 0, 'decayMomentum: 0 stays at 0 (got ' + decayMap['d'] + ')');
}

// ── Section 10: Card Combos ──

function testCardCombos() {
  console.log('\n=== 10. Card Combos ===');

  // Known combo: deep_shot + truck_stick = double_threat
  var combo = checkCardCombo(['deep_shot'], 'truck_stick', []);
  assert(combo !== null, 'checkCardCombo: deep_shot + truck_stick triggers a combo');
  assert(combo.id === 'double_threat', 'checkCardCombo: combo id is double_threat (got ' + (combo && combo.id) + ')');
  assert(typeof combo.bonus === 'object', 'checkCardCombo: combo has bonus object');

  // Known combo: scout_team + personnel_report = film_study
  var combo2 = checkCardCombo(['scout_team'], 'personnel_report', []);
  assert(combo2 !== null && combo2.id === 'film_study', 'checkCardCombo: scout_team + personnel_report = film_study');

  // Known combo: ice + hard_count = ice_storm
  var combo3 = checkCardCombo(['ice'], 'hard_count', []);
  assert(combo3 !== null && combo3.id === 'ice_storm', 'checkCardCombo: ice + hard_count = ice_storm');

  // Non-combo pair returns null
  var noCombo = checkCardCombo(['deep_shot'], 'prime_time', []);
  assert(noCombo === null, 'checkCardCombo: deep_shot + prime_time returns null (no combo)');

  // Partial combo (only one card of a pair) returns null
  var partial = checkCardCombo([], 'deep_shot', []);
  assert(partial === null, 'checkCardCombo: single card with no prior match returns null');

  // Already-fired combo does not re-trigger
  var alreadyFired = checkCardCombo(['deep_shot'], 'truck_stick', ['double_threat']);
  assert(alreadyFired === null, 'checkCardCombo: already-fired combo does not re-trigger');

  // Null inputs return null
  var nullResult = checkCardCombo(null, 'truck_stick', []);
  assert(nullResult === null, 'checkCardCombo: null driveCards returns null');
}

// ── Section 11: Achievements ──

function testAchievements() {
  console.log('\n=== 11. Achievements ===');

  // Clear any prior achievement state so tests are deterministic
  try { localStorage.removeItem('torch_achievements'); } catch(e) {}
  try { localStorage.removeItem('torch_team_records'); } catch(e) {}
  try { localStorage.removeItem('torch_streaks'); } catch(e) {}

  // won=true should unlock first_win
  var ctx1 = { won: true, cpuScore: 7, humanScore: 14, tds: 2, turnoversForced: 0,
    biggestPlay: 10, difficulty: 'MEDIUM', dailyStreak: 0 };
  var newAchs1 = checkAchievements(ctx1);
  var ids1 = newAchs1.map(function(a) { return a.id; });
  assert(ids1.indexOf('first_win') >= 0, 'checkAchievements: first_win unlocked when won=true');

  // first_win should NOT unlock again on second call (already unlocked)
  var newAchs2 = checkAchievements(ctx1);
  var ids2 = newAchs2.map(function(a) { return a.id; });
  assert(ids2.indexOf('first_win') === -1, 'checkAchievements: first_win not returned again when already unlocked');

  // Reset for shutout test
  try { localStorage.removeItem('torch_achievements'); } catch(e) {}

  // won=true + cpuScore=0 should unlock shutout AND first_win
  var ctx2 = { won: true, cpuScore: 0, humanScore: 21, tds: 3, turnoversForced: 0,
    biggestPlay: 15, difficulty: 'MEDIUM', dailyStreak: 0 };
  var newAchs3 = checkAchievements(ctx2);
  var ids3 = newAchs3.map(function(a) { return a.id; });
  assert(ids3.indexOf('shutout') >= 0, 'checkAchievements: shutout unlocked when won=true and cpuScore=0');

  // tds>=3 should unlock hat_trick
  assert(ids3.indexOf('hat_trick') >= 0, 'checkAchievements: hat_trick unlocked when tds=3');

  // getProgress returns correct counts
  var prog = getProgress();
  assert(typeof prog.unlocked === 'number', 'getProgress: returns unlocked count as number');
  assert(typeof prog.total === 'number', 'getProgress: returns total count as number');
  assert(prog.total === getAllAchievements().length, 'getProgress: total matches ACHIEVEMENTS array length');
  assert(prog.unlocked > 0, 'getProgress: unlocked > 0 after unlocking achievements');
  assert(prog.unlocked <= prog.total, 'getProgress: unlocked does not exceed total');
}

// ── Section 12: Streaks ──

function testStreaks() {
  console.log('\n=== 12. Streaks ===');

  // Clear prior streak state
  try { localStorage.removeItem('torch_streaks'); } catch(e) {}

  // Win increments currentWin
  var ts1 = updateStreak('sentinels', true, 'wolves');
  assert(ts1.currentWin === 1, 'updateStreak: win increments currentWin to 1 (got ' + ts1.currentWin + ')');

  // Second win increments to 2
  var ts2 = updateStreak('sentinels', true, 'wolves');
  assert(ts2.currentWin === 2, 'updateStreak: second win increments currentWin to 2 (got ' + ts2.currentWin + ')');

  // longestWin tracks maximum
  assert(ts2.longestWin === 2, 'updateStreak: longestWin tracks peak (got ' + ts2.longestWin + ')');

  // Loss resets currentWin to 0 but longestWin stays
  var ts3 = updateStreak('sentinels', false, 'stags');
  assert(ts3.currentWin === 0, 'updateStreak: loss resets currentWin to 0 (got ' + ts3.currentWin + ')');
  assert(ts3.longestWin === 2, 'updateStreak: longestWin preserved after loss (got ' + ts3.longestWin + ')');

  // getH2H returns correct record
  var h2h = getH2H('sentinels', 'wolves');
  assert(h2h.wins === 2, 'getH2H: wins = 2 after two wins vs wolves (got ' + h2h.wins + ')');
  assert(h2h.losses === 0, 'getH2H: losses = 0 vs wolves (got ' + h2h.losses + ')');

  var h2h2 = getH2H('sentinels', 'stags');
  assert(h2h2.losses === 1, 'getH2H: losses = 1 after one loss vs stags (got ' + h2h2.losses + ')');

  // null/undefined teamId does not crash
  var safe = updateStreak(null, true, 'wolves');
  assert(safe.currentWin === 0, 'updateStreak: null teamId returns safe default (got ' + safe.currentWin + ')');

  var safeGet = getH2H(null, 'wolves');
  assert(safeGet.wins === 0, 'getH2H: null teamId returns { wins: 0, losses: 0 }');
}

// ── Section 13: Game History ──

function testGameHistory() {
  console.log('\n=== 13. Game History ===');

  // Clear prior history
  try { localStorage.removeItem('torch_game_history'); } catch(e) {}

  // recordGame adds an entry
  recordGame({ team: 'sentinels', opponent: 'wolves', difficulty: 'MEDIUM',
    humanScore: 21, cpuScore: 14, won: true, tied: false, torchPts: 120 });
  var h1 = getHistory();
  assert(h1.length === 1, 'recordGame: history has 1 entry after one recordGame (got ' + h1.length + ')');
  assert(h1[0].team === 'sentinels', 'recordGame: entry has correct team');
  assert(h1[0].won === true, 'recordGame: entry has won=true');

  // Second record is prepended (most recent first)
  recordGame({ team: 'wolves', opponent: 'stags', difficulty: 'HARD',
    humanScore: 7, cpuScore: 17, won: false, tied: false, torchPts: 60 });
  var h2 = getHistory();
  assert(h2.length === 2, 'recordGame: history grows to 2 (got ' + h2.length + ')');
  assert(h2[0].team === 'wolves', 'recordGame: newest entry is first (got ' + h2[0].team + ')');

  // getRecentGames returns correct count
  // Add a third entry so we can test slicing
  recordGame({ team: 'stags', opponent: 'serpents', difficulty: 'EASY',
    humanScore: 14, cpuScore: 14, won: false, tied: true, torchPts: 80 });
  var recent = getRecentGames(2);
  assert(recent.length === 2, 'getRecentGames(2): returns 2 entries (got ' + recent.length + ')');

  // getFormString returns W/L/D string
  // History (newest first): stags tied → D, wolves lost → L, sentinels won → W
  var form = getFormString(3);
  assert(form === 'DLW', 'getFormString(3): returns "DLW" (got "' + form + '")');

  // History caps at 50 entries
  try { localStorage.removeItem('torch_game_history'); } catch(e) {}
  for (var i = 0; i < 55; i++) {
    recordGame({ team: 'sentinels', opponent: 'wolves', difficulty: 'MEDIUM',
      humanScore: 10, cpuScore: 7, won: true, tied: false, torchPts: 50 });
  }
  var bigHistory = getHistory();
  assert(bigHistory.length === 50, 'recordGame: history capped at 50 entries (got ' + bigHistory.length + ')');
}

// ── Section 14: Career Stats ──

function testCareerStats() {
  console.log('\n=== 14. Career Stats ===');

  // Clear prior stats
  try { localStorage.removeItem('torch_career_stats'); } catch(e) {}

  // Build a minimal mock gs object matching what recordGameStats reads
  var mockGs = {
    ctScore: 28,
    ctTorchPts: 150,
    stats: {
      ctTouchdowns: 4,
      ctTotalYards: 312,
      irTurnovers: 2,
      irSacks: 1,
      ctFirstDowns: 15,
    },
    snapLog: [
      { team: 'CT', yards: 22 },
      { team: 'CT', yards: 35 },
      { team: 'IR', yards: 18 },
    ],
  };

  var result = recordGameStats(mockGs);
  assert(typeof result === 'object', 'recordGameStats: returns stats object');
  assert(result.gamesPlayed === 1, 'recordGameStats: gamesPlayed increments to 1 (got ' + result.gamesPlayed + ')');
  assert(result.totalTDs === 4, 'recordGameStats: totalTDs = 4 (got ' + result.totalTDs + ')');
  assert(result.totalYards === 312, 'recordGameStats: totalYards = 312 (got ' + result.totalYards + ')');
  assert(result.totalTurnoversForced === 2, 'recordGameStats: totalTurnoversForced = 2 (got ' + result.totalTurnoversForced + ')');
  assert(result.totalFirstDowns === 15, 'recordGameStats: totalFirstDowns = 15 (got ' + result.totalFirstDowns + ')');
  assert(result.biggestPlay === 35, 'recordGameStats: biggestPlay = 35 (CT snaps only) (got ' + result.biggestPlay + ')');
  assert(result.highScore === 28, 'recordGameStats: highScore = 28 (got ' + result.highScore + ')');

  // Stats accumulate on second call
  var mockGs2 = {
    ctScore: 14,
    ctTorchPts: 80,
    stats: { ctTouchdowns: 2, ctTotalYards: 180, irTurnovers: 1, irSacks: 0, ctFirstDowns: 9 },
    snapLog: [{ team: 'CT', yards: 12 }],
  };
  var result2 = recordGameStats(mockGs2);
  assert(result2.gamesPlayed === 2, 'recordGameStats: gamesPlayed accumulates to 2 (got ' + result2.gamesPlayed + ')');
  assert(result2.totalTDs === 6, 'recordGameStats: totalTDs accumulates to 6 (got ' + result2.totalTDs + ')');
  assert(result2.totalYards === 492, 'recordGameStats: totalYards accumulates to 492 (got ' + result2.totalYards + ')');
  assert(result2.biggestPlay === 35, 'recordGameStats: biggestPlay stays 35 when new max is lower (got ' + result2.biggestPlay + ')');
  assert(result2.highScore === 28, 'recordGameStats: highScore stays 28 when new score is lower (got ' + result2.highScore + ')');

  // getCareerStatLines returns array of [label, value] pairs
  var lines = getCareerStatLines();
  assert(Array.isArray(lines), 'getCareerStatLines: returns an array');
  assert(lines.length > 0, 'getCareerStatLines: array is not empty');
  assert(Array.isArray(lines[0]), 'getCareerStatLines: first entry is an array (label/value pair)');
  assert(typeof lines[0][0] === 'string', 'getCareerStatLines: first element of pair is a string label');
}

// ── Main ──

export function runSmokeTest() {
  console.log('TORCH Smoke Test');
  console.log('================');

  testSnapSimulation();
  testTorchCards();
  testConversions();
  testFlipPossession();
  testPersonnelSystem();
  testHandManagement();
  testSTDeck();
  testTorchCardEngine();
  testMomentumSystem();
  testCardCombos();
  testAchievements();
  testStreaks();
  testGameHistory();
  testCareerStats();

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
