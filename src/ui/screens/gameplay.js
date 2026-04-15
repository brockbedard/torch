/**
 * TORCH — Gameplay Screen v3
 * Complete rewrite. Portrait bottom-stack.
 * Fresh visual language — no reuse from prior versions.
 */

import { gsap } from 'gsap';
import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, getOtherTeam, fmtClock, getOffCards, getDefCards, getDrawWeight, getSpeedMultiplier, FEATURES } from '../../state.js';
import { GameState } from '../../engine/gameState.js';
import { getOffenseRoster, getDefenseRoster, getFullRoster } from '../../data/players.js';
// playSvg removed — play cards no longer use SVG diagrams
import { TORCH_CARDS } from '../../data/torchCards.js';
import { buildMaddenPlayer, buildPlayV1, buildTorchCard, buildHomeCard, flipRevealTorchCard } from '../components/cards.js';
import { renderTorchCardIcon } from '../../assets/icons/torchCardIcons.js';
import { showShop } from '../components/shop.js';
// tooltip system removed — will be rebuilt in v2
import AudioStateManager from '../../engine/audioManager.js';
import { renderTeamBadge } from '../../assets/icons/teamLogos.js';
import { renderTeamWordmark } from '../teamWordmark.js';
import { TEAM_WORDMARKS } from '../../data/teamWordmarks.js';
import { getConditionEffects } from '../../data/gameConditions.js';
import { checkPlayCombos } from '../../data/playSequenceCombos.js';
import { generateCommentary, generateContext, resetNarrative } from '../../engine/commentary.js';
import { computeEPA, formatEPA, epaLabel, formatKPA } from '../../engine/epa.js';
import { initPointsAnim, playPointsSequence } from '../effects/torchPointsAnim.js';
import { injectDevPanel, getForceResult, getForceConversion } from '../components/devPanel.js';
import { flameIconSVG, flameSilhouetteSVG, flameLayersMarkup, FLAME_SILHOUETTE_PATH } from '../../utils/flameIcon.js';
import { renderCardTray } from '../components/cardTray.js';
import { createHandState, afterSnap as handAfterSnap, canDiscard, discard as handDiscard, resetDriveDiscards, redeal as handRedeal } from '../../engine/handManager.js';
import { createSTDeck, burnPlayer, restorePlayer, aiPickST } from '../../engine/stDeck.js';
import { aiSelectPlay, aiSelectPlayer } from '../../engine/aiOpponent.js';
import { showSTSelect } from '../components/stSelect.js';
import { createFieldAnimator } from '../field/fieldAnimator.js';
import { checkCardCombo } from '../../engine/cardCombos.js';
import { getMomentumMultiplier } from '../../engine/momentumSystem.js';
import { Haptic } from '../../engine/haptics.js';
import { GAMEPLAY_CSS as CSS } from './gameplay.css.js';

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
// Natural language yard display
function yardText(yards) {
  if (yards > 0) return 'Gain of ' + yards;
  if (yards < 0) return 'Loss of ' + Math.abs(yards);
  return 'No gain';
}
function yardTextShort(yards) {
  if (yards > 0) return '+' + yards;
  if (yards < 0) return '-' + Math.abs(yards);
  return '0';
}

/* Build a placed player card for the field strip — uses shared buildMaddenPlayer */
function mkPlayerCardEl(p, team) {
  var tier = p.ovr >= 85 ? 'gold' : p.ovr >= 75 ? 'silver' : 'bronze';
  return buildMaddenPlayer({
    name: p.name, pos: p.pos, ovr: p.ovr,
    num: p.num || '', tier: tier, badge: p.badge, isStar: p.isStar,
    ability: p.ability || '', stars: p.stars, trait: p.trait,
    teamColor: team.colors ? team.colors.primary : (team.accent || '#FF4511'),
    teamId: GS.team
  }, 100, 120);
}

/* Risk classification matching cardDraft.js */
var HIGH_RISK_IDS = ['four_verts','go_route','y_corner','zero_cov','db_blitz'];
var MED_RISK_IDS = ['mesh','slant','overload','fire_zone','a_gap_mug','edge_crash','pa_post','pa_flat','man_press','zone_drop','triple_option','zone_read'];
function getRisk(id) { return HIGH_RISK_IDS.indexOf(id)>=0?'high':MED_RISK_IDS.indexOf(id)>=0?'med':'low'; }

/* Build a placed play card for the field strip — uses shared buildPlayV1 */
function mkPlayCardEl(play) {
  var cat = {SHORT:'SHORT',DEEP:'DEEP',RUN:'RUN',SCREEN:'SCREEN',OPTION:'OPTION',
    BLITZ:'BLITZ',ZONE:'ZONE',TRAP:'TRAP'}[play.playType||play.cardType] || 'RUN';
  return buildPlayV1({
    name: play.name,
    playType: cat,
    isRun: play.isRun === true || play.type === 'run',
    desc: play.desc || play.flavor || '',
    risk: play.risk || getRisk(play.id),
    cat: cat
  }, 100, 120);
}

function resolveRoster(ids, pool) {
  if (!ids || !Array.isArray(ids)) return pool;
  if (ids.length > 0 && typeof ids[0] === 'object') return ids;
  return ids.map(id => pool.find(p => p.id === id)).filter(Boolean);
}

/* ═══════════════════════════════════════════
   BUILDER
   ═══════════════════════════════════════════ */
export function buildGameplay() {
  AudioStateManager.setState('normal_play');
  initPointsAnim();
  // v0.21: Map new team IDs to engine CT/IR slots.
  // Human always maps to CT slot, opponent to IR slot.
  const hAbbr = 'CT';
  const hTeam = getTeam(GS.team);
  const oppId = GS.opponent || getOtherTeam(GS.team).id;
  const oTeam = getTeam(oppId);

  // engine
  if (!GS.engine) {
    // Human plays + roster
    var hOffPlays = getOffCards(GS.team);
    var hDefPlays = getDefCards(GS.team);
    var hOffRoster = getOffenseRoster(GS.team);
    var hDefRoster = getDefenseRoster(GS.team);
    // CPU plays + roster
    var cOffPlays = getOffCards(oppId);
    var cDefPlays = getDefCards(oppId);
    var cOffRoster = getOffenseRoster(oppId);
    var cDefRoster = getDefenseRoster(oppId);
    // Resolve rosters from IDs if needed
    var hOR = resolveRoster(GS.offRoster, hOffRoster);
    var hDR = resolveRoster(GS.defRoster, hDefRoster);
    GS.engine = new GameState({
      humanTeam: hAbbr, difficulty: GS.difficulty||'MEDIUM', coachBadge: GS.coachBadge||'SCHEMER',
      // Human = CT slot, Opponent = IR slot
      ctOffHand: hOffPlays.slice(0,4), ctDefHand: hDefPlays.slice(0,4),
      irOffHand: cOffPlays.slice(0,4), irDefHand: cDefPlays.slice(0,4),
      ctOffRoster: hOR, ctDefRoster: hDR,
      irOffRoster: cOffRoster, irDefRoster: cDefRoster,
      initialPossession: GS.humanReceives ? hAbbr : 'IR',
      ctTeamId: GS.team, irTeamId: oppId,
    });
    GS.engine.momentumEnabled = FEATURES.momentumSystem;
    // Seed TORCH points from previous game
    var carry = GS.season && GS.season.carryoverPoints ? GS.season.carryoverPoints : 0;
    if (carry > 0) GS.engine.ctTorchPts = carry;
    // Restore mid-game snapshot if resuming
    var snap = GS._engineSnapshot;
    if (snap) {
      GS.engine.ctScore = snap.ctScore || 0;
      GS.engine.irScore = snap.irScore || 0;
      GS.engine.possession = snap.possession || GS.engine.possession;
      GS.engine.ballPosition = snap.ballPosition !== undefined ? snap.ballPosition : GS.engine.ballPosition;
      GS.engine.down = snap.down || 1;
      GS.engine.distance = snap.distance || 10;
      GS.engine.half = snap.half || 1;
      GS.engine.playsUsed = snap.playsUsed || 0;
      GS.engine.totalPlays = snap.totalPlays || 0;
      GS.engine.twoMinActive = snap.twoMinActive || false;
      GS.engine.clockSeconds = snap.clockSeconds !== undefined ? snap.clockSeconds : 120;
      GS.engine.ctTorchPts = snap.ctTorchPts || 0;
      GS.engine.irTorchPts = snap.irTorchPts || 0;
      GS.engine.offHeatMap = snap.offHeatMap || {};
      GS.engine.defHeatMap = snap.defHeatMap || {};
      GS.engine.momentum = snap.momentum !== undefined ? snap.momentum : 50;
      GS._engineSnapshot = null; // Clear after applying
    }
    // Reset narrative tracking for this new game
    resetNarrative();
  }
  const gs = GS.engine;

  // Special teams burn decks
  var _humanFullRoster = getFullRoster(GS.team);
  var _cpuFullRoster = getFullRoster(GS.opponent || 'wolves');
  var _humanSTDeck = createSTDeck(_humanFullRoster);
  var _cpuSTDeck = createSTDeck(_cpuFullRoster);

  // Track new drive state for card deal animation
  var _isNewDrive = true; // first draw is always a new drive

  // Hand management state — initialized per side on first drawPanel
  var _offHandState = null;
  var _defHandState = null;
  function getHandState() {
    var isOff = gs.possession === hAbbr;
    if (isOff) {
      if (!_offHandState) {
        _offHandState = createHandState(getOffCards(GS.team), getOffenseRoster(GS.team));
      }
      return _offHandState;
    } else {
      if (!_defHandState) {
        _defHandState = createHandState(getDefCards(GS.team), getDefenseRoster(GS.team));
      }
      return _defHandState;
    }
  }

  // ui state
  let selP = null, selPl = null, selTorch = null;
  let phase = 'play'; // play | torch | ready | busy
  let driveSnaps = [];
  let prev2min = gs.twoMinActive;
  var _scoutActive = false; // Scout Report card effect
  var _lastPlayFlashed = false; // true after LAST PLAY flash fires, reset each half
  var _pbpVisible = false; // Play-by-play toggle state
  var snapCount = 0; // Track snap number for teach tooltips
  var _onboardingDone = true; // Onboarding disabled — will revisit
  var _tutorialStep = 0;
  var _torchTutorialShown = true; // Onboarding disabled — will revisit
  var twoMinTimer = null; // Real-time clock interval for 2-minute drill
  var _fourthDownDecided = false; // true after player clicks GO FOR IT (hides the bar)
  var _driveHeat = 0; // 0-120 momentum bar
  var _driveCardsUsed = []; // torch card IDs used this drive
  var _activeDriveCombo = null; // combo triggered this snap, applied post-executeSnap
  var _torchFanfareCount = 0; // scales fanfare duration on repeat usage

  // ── LAYER 6: Ambient mood — subtle brightness/vignette based on user momentum ──
  var _moodHistory = []; // last 4 plays: +1 good, -1 bad, 0 neutral
  var _moodVignette = null;
  function updateMood(isGoodForUser, isBadForUser) {
    _moodHistory.push(isGoodForUser ? 1 : isBadForUser ? -1 : 0);
    if (_moodHistory.length > 4) _moodHistory.shift();
    var sum = _moodHistory.reduce(function(a, b) { return a + b; }, 0);
    var momentum = sum / _moodHistory.length; // -1.0 to 1.0
    var brightness = 1.0 + momentum * 0.06; // 0.94 to 1.06 — subtle
    var vignette = momentum < 0 ? Math.abs(momentum) * 0.12 : 0;
    strip.style.filter = 'brightness(' + brightness.toFixed(3) + ')';
    if (!_moodVignette) {
      _moodVignette = document.createElement('div');
      _moodVignette.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:50;transition:opacity 0.8s;';
      _moodVignette.style.background = 'radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,0.4) 100%)';
      el.appendChild(_moodVignette);
    }
    _moodVignette.style.opacity = vignette.toFixed(3);
  }

  function updateDriveHeat(r, gameEvent) {
    if (gameEvent === 'interception' || gameEvent === 'fumble' || gameEvent === 'turnover_on_downs') {
      _driveHeat = 0; return;
    }
    if (r.isInterception || r.isFumbleLost) { _driveHeat = 0; return; }
    var delta = 0;
    if (r.isTouchdown) { _driveHeat = 100; return; }
    if (r.yards >= 15) delta = 20;
    else if (r.yards >= 8) delta = 12;
    else if (r.yards >= 4) delta = 8;
    else if (r.yards >= 1) delta = 4;
    else if (r.yards === 0) delta = -5;
    else delta = -10;
    if (r.isIncomplete) delta = -8;
    if (r.isSack) delta = -12;
    delta += 3;
    _driveHeat = Math.max(0, Math.min(120, _driveHeat + delta));
  }

  var _driveHeatFill = null; // cached fill element — avoid repeated getElementById calls
  function drawDriveHeat() {
    // Visual removed as per user request
    return;
  }

  // Start/stop the real-time 2-minute clock
  function start2MinClock() {
    if (twoMinTimer) return;
    AudioStateManager.setState('two_min_drill');
    twoMinTimer = setInterval(function() {
      if (!gs.twoMinActive || gs.gameOver || phase === 'busy') return;
      // Only tick when user is on offense (they control the clock)
      // When user is on defense, opponent controls clock — auto-tick between snaps only
      var userOnOff = gs.possession === hAbbr;
      if (!userOnOff && phase !== 'busy') return; // Don't tick on defense during card selection
      gs.clockSeconds = Math.max(0, gs.clockSeconds - 1);
      drawBug();
      // Heartbeat below 15 seconds + haptic pulse
      if (gs.clockSeconds <= 15 && gs.clockSeconds > 0) {
        SND.click();
        if (gs.clockSeconds <= 5) Haptic.sack(); else Haptic.hit();
      }
      // Time expired — end the half (but not during a PAT)
      if (gs.clockSeconds <= 0) {
        stop2MinClock();
        gs._checkHalfEnd(); // Always check — PAT happens via handleConversion which checks after
        if (!conversionMode) {
          checkEnd();
        }
      }
    }, 1000);
  }
  function stop2MinClock() {
    if (twoMinTimer) { clearInterval(twoMinTimer); twoMinTimer = null; }
  }

  // Progressive disclosure
  var isFirstGame = false; // tutorial system disabled — will be rebuilt

  // Game Day Conditions (v0.21)
  var weatherId = (GS.gameConditions && GS.gameConditions.weather) || 'clear';
  var condEffects = getConditionEffects(GS.gameConditions || { weather: 'clear', field: 'turf', crowd: 'home' });

  // Play Sequence Combos — track play history per drive
  var drivePlayHistory = []; // {cat, playId} entries for current drive

  // Drive summary tracking (play-by-play ticker resets per drive)
  var driveSummaryLog = []; // [{down, dist, playName, yards, isTD, isSack, isInc, isInt, isFumble}]
  var driveFirstDowns = 0;
  var driveCommLine1 = '', driveCommLine2 = '';

  // Game-wide stat accumulators (persist across drives AND halftime)
  // Restore from snapshot if resuming after halftime
  var _ss = GS._gameplayStats || null;
  // Human offense stats
  var hOffPassAtt = _ss ? _ss.hOffPassAtt : 0, hOffPassComp = _ss ? _ss.hOffPassComp : 0, hOffPassYds = _ss ? _ss.hOffPassYds : 0;
  var hOffRushAtt = _ss ? _ss.hOffRushAtt : 0, hOffRushYds = _ss ? _ss.hOffRushYds : 0;
  var hOffRecYds = _ss ? _ss.hOffRecYds : 0, hOffRec = _ss ? _ss.hOffRec : 0;
  var hOffQBName = _ss ? _ss.hOffQBName : '', hOffRBName = _ss ? _ss.hOffRBName : '', hOffWRName = _ss ? _ss.hOffWRName : '';
  // Human defense stats (tracking human's defensive players)
  var hDefStats = _ss ? _ss.hDefStats : {}; // { name: { pos, tkl, pbu, int, sack } }
  // CPU offense stats
  var cOffPassAtt = _ss ? _ss.cOffPassAtt : 0, cOffPassComp = _ss ? _ss.cOffPassComp : 0, cOffPassYds = _ss ? _ss.cOffPassYds : 0;
  var cOffRushAtt = _ss ? _ss.cOffRushAtt : 0, cOffRushYds = _ss ? _ss.cOffRushYds : 0;
  var cOffRecYds = _ss ? _ss.cOffRecYds : 0, cOffRec = _ss ? _ss.cOffRec : 0;
  var cOffQBName = _ss ? _ss.cOffQBName : '', cOffRBName = _ss ? _ss.cOffRBName : '', cOffWRName = _ss ? _ss.cOffWRName : '';
  // CPU defense stats (tracking CPU's defensive players)
  var cDefStats = _ss ? _ss.cDefStats : {}; // { name: { pos, tkl, pbu, int, sack } }
  // Per-player game stats for card display (keyed by player id)
  var _playerGameStats = _ss ? _ss._playerGameStats : {}; // { id: { yds, rec, recYds, rushAtt, rushYds, passAtt, passComp, passYds, tkl, pbu, int, sack, td } }
  // Game-wide EPA, turnover, and 3rd-down tracking (for Clipboard + halftime + end-of-game)
  var _hEpaSum    = _ss ? (_ss._hEpaSum || 0)   : 0;
  var _cEpaSum    = _ss ? (_ss._cEpaSum || 0)   : 0;
  var _hEpaPlays  = _ss ? (_ss._hEpaPlays || 0) : 0;
  var _cEpaPlays  = _ss ? (_ss._cEpaPlays || 0) : 0;
  var _hTurnovers = _ss ? (_ss._hTurnovers || 0): 0;
  var _cTurnovers = _ss ? (_ss._cTurnovers || 0): 0;
  var _h3rdAtt    = _ss ? (_ss._h3rdAtt || 0)   : 0;
  var _h3rdConv   = _ss ? (_ss._h3rdConv || 0)  : 0;
  var _c3rdAtt    = _ss ? (_ss._c3rdAtt || 0)   : 0;
  var _c3rdConv   = _ss ? (_ss._c3rdConv || 0)  : 0;
  var _hExplosive = _ss ? (_ss._hExplosive || 0): 0; // 15+ yard gains (for halftime)
  var _cExplosive = _ss ? (_ss._cExplosive || 0): 0;
  // TDs by play type, FGs, cards used, drive history (for the stats sheet)
  var _hTdsPass   = _ss ? (_ss._hTdsPass || 0)   : 0;
  var _hTdsRush   = _ss ? (_ss._hTdsRush || 0)   : 0;
  var _cTdsPass   = _ss ? (_ss._cTdsPass || 0)   : 0;
  var _cTdsRush   = _ss ? (_ss._cTdsRush || 0)   : 0;
  var _hFgMade    = _ss ? (_ss._hFgMade || 0)    : 0;
  var _cFgMade    = _ss ? (_ss._cFgMade || 0)    : 0;
  var _hCardsUsed = _ss ? (_ss._hCardsUsed || 0) : 0;
  var _cCardsUsed = _ss ? (_ss._cCardsUsed || 0) : 0;
  // Per-drive summary array: { team, plays, yards, epa, result }
  var _gameDriveHistory = _ss ? (_ss._gameDriveHistory || []) : [];
  var _hotStreak = 0; // consecutive positive plays (user offense)
  GS._gameplayStats = null; // Clear after restoring
  // CPU roster for QB lookup
  var cpuOffRoster = getOffenseRoster(oppId);

  function resetDriveSummary() {
    driveSummaryLog = [];
    driveFirstDowns = 0;
    driveCommLine1 = ''; driveCommLine2 = '';
    // Game-wide stats are NOT reset here
  }

  // TORCH card inventory (v0.21 — 3 slots, persisted in season)
  var torchInventory = (GS.season && GS.season.torchCards) ? GS.season.torchCards.slice() : [];
  var selectedPreSnap = null; // card object selected for current snap

  // Consume a torch card from both UI and engine inventories
  function consumeTorchCard(cardId) {
    var idx = torchInventory.findIndex(function(c) { return c.id === cardId; });
    if (idx >= 0) torchInventory.splice(idx, 1);
    if (GS.season) GS.season.torchCards = torchInventory.slice();
    var eIdx = gs ? gs.humanTorchCards.indexOf(cardId) : -1;
    if (eIdx >= 0) gs.humanTorchCards.splice(eIdx, 1);
  }

  // Helper: resolve kickoff with HOUSE_CALL auto-consumption
  function _resolveKickoff(humanReceives) {
    var opts = {};
    if (humanReceives) {
      var hcIdx = torchInventory.findIndex(function(c) { return c.id === 'house_call'; });
      if (hcIdx >= 0) { opts.houseCall = true; consumeTorchCard('house_call'); torchCardToast('HOUSE CALL', 'Guaranteed 50+ yard return'); }
    }
    return gs.constructor.resolveKickoff(null, opts);
  }

  // Star Heat Check (v0.21)
  var offRoster = getOffenseRoster(GS.team);
  var defRoster = getDefenseRoster(GS.team);
  var offStar = offRoster.find(function(p) { return p.isStar; });
  var defStar = defRoster.find(function(p) { return p.isStar; });
  var offStarHot = false;
  var defStarHot = false;

  function checkStarActivation(res) {
    // Heat Check hidden on first game
    if (isFirstGame) return;
    var r = res.result;
    var isOff = res._preSnap && res._preSnap.possession === hAbbr;
    if (isOff && offStar && res.featuredOff && res.featuredOff.id === offStar.id) {
      if (!offStarHot && (r.yards >= 10 || (r.comboFired))) {
        offStarHot = true;
        // +4 OVR boost applied visually (engine OVR stays — we fake it via combo bonus)
      }
    }
    if (!isOff && defStar && res.featuredDef && res.featuredDef.id === defStar.id) {
      if (!defStarHot && (r.isSack || r.isInterception || r.isFumbleLost)) {
        defStarHot = true;
      }
    }
    // Deactivation
    if (isOff && offStarHot && (r.isSack || r.isInterception || r.isFumbleLost)) {
      offStarHot = false;
    }
    if (!isOff && defStarHot && r.isTouchdown) {
      defStarHot = false;
    }
  }

  function getTorchPoints() {
    return hAbbr === 'CT' ? gs.ctTorchPts : gs.irTorchPts;
  }

  function spendTorchPoints(amount) {
    if (hAbbr === 'CT') gs.ctTorchPts = Math.max(0, gs.ctTorchPts - amount);
    else gs.irTorchPts = Math.max(0, gs.irTorchPts - amount);
  }

  // Trigger shop after a big moment
  function triggerShop(trigger, callback) {
    var pts = getTorchPoints();
    showShop(el, trigger, pts, torchInventory, function(card, newInv, spent) {
      torchInventory = newInv;
      spendTorchPoints(spent);
      // Persist to season state
      if (GS.season) GS.season.torchCards = torchInventory.slice();
      drawBug();
      if (callback) callback();
    }, function() {
      if (callback) callback();
    });
  }

  // Tutorial system disabled — will be rebuilt as v2 onboarding

  // dom
  const el = document.createElement('div');
  el.className = 'T';
  const sty = document.createElement('style'); sty.textContent = CSS; el.appendChild(sty);


  // ── SCOREBOARD ──
  const bug = document.createElement('div'); bug.className = 'T-sb'; bug.style.cursor = 'pointer'; el.appendChild(bug);
  // Tap scorebug to show stats sheet
  bug.addEventListener('click', function() {
    if (phase === 'busy') return;
    import('../components/statsSheet.js').then(function(mod) {
      // Aggregate sacks / PBUs / INTs / forced fumbles from per-player def stats
      var _hSacks = 0, _hPBUs = 0;
      var _cSacks = 0, _cPBUs = 0;
      Object.keys(hDefStats).forEach(function(k) { var d = hDefStats[k]; _hSacks += d.sack || 0; _hPBUs += d.pbu || 0; });
      Object.keys(cDefStats).forEach(function(k) { var d = cDefStats[k]; _cSacks += d.sack || 0; _cPBUs += d.pbu || 0; });
      var s = gs.getSummary();
      mod.showStatsSheet(el, {
        humanTeam: hTeam, oppTeam: oTeam,
        humanAbbr: hAbbr,
        humanScore: hAbbr === 'CT' ? s.ctScore : s.irScore,
        oppScore:   hAbbr === 'CT' ? s.irScore : s.ctScore,
        half: gs.half,
        playsUsed: gs.playsUsed,
        clockText: gs.twoMinActive ? fmtClock(gs.clockSeconds) + ' REMAINING' : '',
        // Passing / rushing
        hPassAtt: hOffPassAtt, hPassComp: hOffPassComp, hPassYds: hOffPassYds,
        hRushAtt: hOffRushAtt, hRushYds: hOffRushYds,
        cPassAtt: cOffPassAtt, cPassComp: cOffPassComp, cPassYds: cOffPassYds,
        cRushAtt: cOffRushAtt, cRushYds: cOffRushYds,
        // TDs by type
        hTdsPass: _hTdsPass, hTdsRush: _hTdsRush,
        cTdsPass: _cTdsPass, cTdsRush: _cTdsRush,
        // FGs
        hFgMade: _hFgMade, cFgMade: _cFgMade,
        // Defense
        hSacks: _hSacks, hPBUs: _hPBUs,
        cSacks: _cSacks, cPBUs: _cPBUs,
        // Turnovers
        hTurnovers: _hTurnovers, cTurnovers: _cTurnovers,
        // Key metrics
        hEpaSum: _hEpaSum, cEpaSum: _cEpaSum,
        h3rdAtt: _h3rdAtt, h3rdConv: _h3rdConv,
        c3rdAtt: _c3rdAtt, c3rdConv: _c3rdConv,
        hExplosive: _hExplosive, cExplosive: _cExplosive,
        // Economy
        hTorch: hAbbr === 'CT' ? s.ctTorchPts : s.irTorchPts,
        cTorch: hAbbr === 'CT' ? s.irTorchPts : s.ctTorchPts,
        hCardsUsed: _hCardsUsed, cCardsUsed: _cCardsUsed,
        // Drive history
        driveHistory: _gameDriveHistory,
      });
    });
  });
  // ── PLAY-BY-PLAY TICKER ──
  var ticker = document.createElement('div');
  ticker.style.cssText = "position:relative;height:0;overflow:hidden;background:transparent;border:none;flex-shrink:0;display:none;";
  var tickerInner = document.createElement('div');
  tickerInner.style.cssText = "position:absolute;white-space:nowrap;font-family:'Rajdhani';font-weight:700;font-size:10px;color:#888;letter-spacing:0.5px;line-height:18px;padding-left:100%;";
  ticker.appendChild(tickerInner);
  el.appendChild(ticker);

  var _tickerMessages = [];
  var _tickerAnim = null;

  function pushTicker(text, color) {
    _tickerMessages.push({ text: text, color: color || '#888' });
    updateTicker();
  }

  // Brief toast for auto-consumed torch cards (ST cards, kickoff cards)
  function torchCardToast(cardName, effectText) {
    var toast = document.createElement('div');
    toast.style.cssText = "position:fixed;top:10%;left:50%;transform:translateX(-50%);z-index:660;padding:8px 16px;border-radius:6px;background:rgba(14,10,4,0.92);border:1px solid #EBB01066;text-align:center;pointer-events:none;opacity:0;";
    toast.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:16px;color:#EBB010;letter-spacing:2px;\">" + cardName + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-size:10px;color:#aaa;margin-top:2px;\">" + effectText + "</div>";
    el.appendChild(toast);
    try {
      gsap.to(toast, { opacity: 1, duration: 0.15 });
      gsap.to(toast, { opacity: 0, duration: 0.3, delay: 1.2, onComplete: function() { if (toast.parentNode) toast.remove(); } });
    } catch(e) { toast.style.opacity = '1'; setTimeout(function() { if (toast.parentNode) toast.remove(); }, 1500); }
  }

  function updateTicker() {
    if (_tickerMessages.length === 0) return;
    var recent = _tickerMessages.slice(-5);
    var html = recent.map(function(m) {
      return '<span style="color:' + m.color + ';">' + m.text + '</span>';
    }).join(' <span style="color:#333;">|</span> ');
    tickerInner.innerHTML = html;

    if (_tickerAnim) { try { _tickerAnim.kill(); } catch(e) {} }
    var width = tickerInner.scrollWidth + ticker.offsetWidth;
    tickerInner.style.paddingLeft = ticker.offsetWidth + 'px';
    try {
      _tickerAnim = gsap.fromTo(tickerInner,
        { x: 0 },
        { x: -width, duration: Math.max(8, width / 40), ease: 'none', repeat: -1 }
      );
    } catch(e) {}
  }

  // Win probability model
  // Scorebug cached elements — built once by initBug(), updated by drawBug()
  var _bugEls = {};
  var _prevDown = 0;
  var _prevDist = 0;
  var _prevBallPos = -1;
  var _wasInRedZone = false;
  var _prevHScore = -1;
  var _prevCScore = -1;
  function initBug() {
    const ct = hTeam, ir = oTeam;

    // ── Top LED bar ──
    const ledTop = document.createElement('div'); ledTop.className = 'T-sb-led';
    bug.appendChild(ledTop);

    // ── Score row (3-column grid) ──
    const row = document.createElement('div'); row.className = 'T-sb-row';

    // Home panel (left)
    const ctPanel = document.createElement('div'); ctPanel.className = 'T-sb-panel T-sb-panel-home';
    // Scorebug wordmark — full mascot in team font at scorebugSize (per-team
    // tuned so long names still fit the panel). Rendered via T3 tier so
    // text-shadow is dropped; mascot flag swaps abbr for the full name.
    var _ctSize = (TEAM_WORDMARKS[ct.id] && TEAM_WORDMARKS[ct.id].scorebugSize) || 11;
    const ctNameEl = renderTeamWordmark(ct.id, 't3', { mascot: true, fontSize: _ctSize }) ||
      (function() { var e = document.createElement('div'); e.style.color = ct.accent; e.textContent = ct.name.toUpperCase(); return e; })();
    ctNameEl.classList.add('T-sb-name');
    const ctScoreEl = document.createElement('div'); ctScoreEl.className = 'T-sb-score';
    const ctDotEl = document.createElement('div'); ctDotEl.className = 'T-sb-poss-dot';
    ctPanel.appendChild(ctNameEl);
    ctPanel.appendChild(ctScoreEl);
    ctPanel.appendChild(ctDotEl);
    row.appendChild(ctPanel);

    // Center panel
    const center = document.createElement('div'); center.className = 'T-sb-center';
    const halfEl = document.createElement('div'); halfEl.className = 'T-sb-half';
    const snapEl = document.createElement('div'); snapEl.className = 'T-sb-snap';
    const clockEl = document.createElement('div'); clockEl.className = 'T-sb-clock';
    const clockLabel = document.createElement('div'); clockLabel.className = 'T-sb-clock-label';
    clockLabel.textContent = '2-MIN DRILL';
    const dividerEl = document.createElement('div'); dividerEl.className = 'T-sb-divider';
    const downEl = document.createElement('div'); downEl.className = 'T-sb-down';
    const ballEl = document.createElement('div'); ballEl.className = 'T-sb-ball';
    center.appendChild(halfEl);
    center.appendChild(snapEl);
    center.appendChild(clockEl);
    center.appendChild(clockLabel);
    center.appendChild(dividerEl);
    center.appendChild(downEl);
    center.appendChild(ballEl);
    row.appendChild(center);

    // Away panel (right) — full mascot + per-team scorebugSize
    const irPanel = document.createElement('div'); irPanel.className = 'T-sb-panel T-sb-panel-away';
    var _irSize = (TEAM_WORDMARKS[ir.id] && TEAM_WORDMARKS[ir.id].scorebugSize) || 11;
    const irNameEl = renderTeamWordmark(ir.id, 't3', { mascot: true, fontSize: _irSize }) ||
      (function() { var e = document.createElement('div'); e.style.color = ir.accent; e.textContent = ir.name.toUpperCase(); return e; })();
    irNameEl.classList.add('T-sb-name');
    const irScoreEl = document.createElement('div'); irScoreEl.className = 'T-sb-score'; irScoreEl.style.animationDelay = '1.7s';
    const irDotEl = document.createElement('div'); irDotEl.className = 'T-sb-poss-dot';
    irPanel.appendChild(irNameEl);
    irPanel.appendChild(irScoreEl);
    irPanel.appendChild(irDotEl);
    row.appendChild(irPanel);

    bug.appendChild(row);

    // ── Drive Stats Pill (Drive-at-a-Glance) ──
    const driveStatsEl = document.createElement('div');
    driveStatsEl.style.cssText = "position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:2px;padding:2px 8px;background:rgba(0,0,0,0.6);border-radius:10px;font-family:'Rajdhani';font-weight:700;font-size:9px;color:#888;letter-spacing:1px;opacity:0;transition:opacity 0.3s;white-space:nowrap;pointer-events:none;z-index:2;";
    bug.appendChild(driveStatsEl);

    // ── Bottom LED bar ──
    const ledBot = document.createElement('div'); ledBot.className = 'T-sb-led';
    bug.appendChild(ledBot);

    // Play clock bar (shows plays remaining in half)
    // Play clock bar removed — visual clutter below scorebug

    // Cache every mutable element reference
    _bugEls = {
      ledTop, ledBot,
      ctPanel, ctNameEl, ctScoreEl, ctDotEl,
      irPanel, irNameEl, irScoreEl, irDotEl,
      halfEl, snapEl, clockEl, clockLabel, dividerEl, downEl, ballEl,
      playClockFill: null,
      driveStatsEl,
    };
  }

  // ── 2-Minute Drill Heartbeat ──
  var _heartbeatInt = null;
  function startHeartbeat() {
    if (_heartbeatInt) return;
    _heartbeatInt = setInterval(function() {
      if (!gs.twoMinActive || phase === 'busy' || gs.gameOver) return;
      // Subtle double-thud haptic
      Haptic.selection();
      setTimeout(function() { Haptic.selection(); }, 150);
      // Low-frequency heartbeat sound (using sack sound at low volume/pitch)
      try { SND.error(); } catch(e) {} // Error sound is a low thud in this project
    }, 1500);
  }
  function stopHeartbeat() {
    if (_heartbeatInt) { clearInterval(_heartbeatInt); _heartbeatInt = null; }
  }

  function drawBug() {
    if (!_bugEls.ctScoreEl) initBug();
    const s = gs.getSummary();
    const ct = hTeam, ir = oTeam;

    var dn = ['','1ST','2ND','3RD','4TH'][s.down]||'';
    const ctHasBall = s.possession === 'CT';
    const possTeam = ctHasBall ? ct : ir;

    // ── LED bars (dynamic team color gradient + downward glow) ──
    var ledGrad = 'linear-gradient(90deg, ' + ct.accent + ', #EBB010, ' + ir.accent + ')';
    _bugEls.ledTop.style.background = ledGrad;
    _bugEls.ledTop.style.boxShadow = '0 4px 12px ' + possTeam.accent + '33';
    _bugEls.ledBot.style.background = ledGrad;
    _bugEls.ledBot.style.boxShadow = '0 -4px 12px ' + possTeam.accent + '33';

    // ── Scores (slide-up animation on change) ──
    var hScore = s.ctScore;
    var cScore = s.irScore;
    if (hScore !== _prevHScore && _prevHScore >= 0) {
      _animScoreChange(_bugEls.ctScoreEl, hScore, ct.accent || '#00ff44');
    } else {
      _bugEls.ctScoreEl.textContent = hScore;
    }
    if (cScore !== _prevCScore && _prevCScore >= 0) {
      _animScoreChange(_bugEls.irScoreEl, cScore, ir.accent || '#ff0040');
    } else {
      _bugEls.irScoreEl.textContent = cScore;
    }
    _prevHScore = hScore;
    _prevCScore = cScore;

    // ── Possession Dot ──
    if (ctHasBall) {
      _bugEls.irDotEl.innerHTML = '';
      _bugEls.irDotEl.style.cssText = 'background:transparent;box-shadow:none;';
      _bugEls.ctDotEl.innerHTML = '';
      _bugEls.ctDotEl.style.cssText = 'background:#00ff44;box-shadow:0 0 6px #00ff44;';
    } else {
      _bugEls.ctDotEl.innerHTML = '';
      _bugEls.ctDotEl.style.cssText = 'background:transparent;box-shadow:none;';
      _bugEls.irDotEl.innerHTML = '';
      _bugEls.irDotEl.style.cssText = 'background:#00ff44;box-shadow:0 0 6px #00ff44;';
    }

    // ── Drive Stats Pill (Drive-at-a-Glance) ──
    if (driveSnaps && driveSnaps.length > 0) {
      var driveYds = driveSnaps.reduce((acc, snap) => acc + (snap.result ? snap.result.yards : 0), 0);
      _bugEls.driveStatsEl.textContent = 'DRIVE: ' + driveSnaps.length + ' PLAYS, ' + driveYds + ' YDS';
      _bugEls.driveStatsEl.style.opacity = '1';
    } else {
      _bugEls.driveStatsEl.style.opacity = '0';
    }

    // ── Panel tint (possessing team gets subtle background) ──
    var ctColor = ct.accent;
    var irColor = ir.accent;
    if (ctHasBall) {
      _bugEls.ctPanel.style.background = 'linear-gradient(180deg,' + ctColor + '18,' + ctColor + '08)';
      _bugEls.ctScoreEl.style.textShadow = '0 0 12px ' + ctColor + '60';
      _bugEls.ctNameEl.style.textShadow = '0 0 8px ' + ctColor + '40';
      _bugEls.ctNameEl.style.opacity = '1';
      _bugEls.irPanel.style.background = 'transparent';
      _bugEls.irScoreEl.style.textShadow = '';
      _bugEls.irNameEl.style.textShadow = '';
      _bugEls.irNameEl.style.opacity = '0.6';
    } else {
      _bugEls.irPanel.style.background = 'linear-gradient(180deg,' + irColor + '18,' + irColor + '08)';
      _bugEls.irScoreEl.style.textShadow = '0 0 12px ' + irColor + '60';
      _bugEls.irNameEl.style.textShadow = '0 0 8px ' + irColor + '40';
      _bugEls.irNameEl.style.opacity = '1';
      _bugEls.ctPanel.style.background = 'transparent';
      _bugEls.ctScoreEl.style.textShadow = '';
      _bugEls.ctNameEl.style.textShadow = '';
      _bugEls.ctNameEl.style.opacity = '0.6';
    }

    // ── Center panel: normal vs 2-min mode ──
    if (s.twoMinActive) {
      // 2-min mode: show clock + label, hide half/snap
      startHeartbeat();
      _bugEls.halfEl.style.display = 'none';
      _bugEls.snapEl.style.display = 'none';
      _bugEls.clockEl.style.display = '';
      _bugEls.clockLabel.style.display = '';
      _bugEls.clockEl.textContent = fmtClock(Math.max(0, s.clockSeconds));
      var clockColor = s.clockSeconds > 60 ? '#e03050' : s.clockSeconds > 30 ? '#EBB010' : '#ff0040';
      _bugEls.clockEl.style.color = clockColor;
      if (s.clockSeconds <= 10 && s.clockSeconds > 0) {
        _bugEls.clockEl.style.animation = 'clockPulse 0.5s ease-in-out infinite';
      } else if (s.clockSeconds <= 30) {
        _bugEls.clockEl.style.animation = 'clockPulse 1s ease-in-out infinite';
      } else {
        _bugEls.clockEl.style.animation = '';
      }
    } else {
      // Normal mode: show half/snap, hide clock
      stopHeartbeat();
      _bugEls.halfEl.style.display = '';
      _bugEls.snapEl.style.display = '';
      _bugEls.clockEl.style.display = 'none';
      _bugEls.clockLabel.style.display = 'none';
      
      var halfText = s.half === 1 ? 'FIRST HALF' : s.half === 2 ? 'SECOND HALF' : 'OVERTIME';
      if (s.half === 4) halfText = '2ND OVERTIME';
      if (s.half === 5) halfText = '3RD OVERTIME';
      if (s.half > 5) halfText = (s.half - 2) + 'TH OVERTIME';
      _bugEls.halfEl.textContent = halfText;

      _bugEls.snapEl.textContent = s.playsUsed + '/' + (gs.playsPerHalf || 20);
    }

    // ── Down & distance + Ball position (Combined) ──
    // Field position is always shown from the USER's perspective so it's
    // consistent regardless of who has the ball. When the user is on defense,
    // "OPP 20" on the old label actually meant the opponent is 20 yards from
    // scoring — which is bad for the user but read like good field position.
    // Now: "OWN 20" = ball is in user's territory (20 yds from user's goal),
    //      "OPP 20" = ball is in opponent's territory,
    //      "50"     = midfield.
    const ydsToEz = s.yardsToEndzone;
    // Translate ballPosition (0-100 from CT's perspective) into user-relative
    var _rawBall = gs.ballPosition !== undefined ? gs.ballPosition
      : (hAbbr === 'CT' ? (100 - ydsToEz) : ydsToEz);
    var _userBall = hAbbr === 'CT' ? _rawBall : (100 - _rawBall);
    const ballPos = _userBall === 50 ? '50'
      : _userBall < 50 ? 'OWN ' + _userBall
      : 'OPP ' + (100 - _userBall);
    
    if (conversionMode) {
      _bugEls.downEl.textContent = (conversionMode.choice || '2pt').toUpperCase() + ' ATTEMPT \u2022 ' + ballPos;
    } else {
      const distStr = distLabel(s.distance, s.yardsToEndzone);
      _bugEls.downEl.textContent = dn + ' & ' + distStr + ' \u2022 ' + ballPos;
    }
    _bugEls.downEl.style.color = s.twoMinActive ? '#e03050' : '#FF6B00';

    var newDown = s.down;
    var newDist = s.distance;
    var downChanged = newDown !== _prevDown || newDist !== _prevDist;

    // ── 3rd/4th Down Crowd Swell ──
    // Skip if a post-play hold is active (TD celebration, turnover, big moment)
    // to prevent drawBug() from clobbering the holdThenSettle fade.
    if (!AudioStateManager.isCrowdHeld()) {
      if (newDown === 3 && !conversionMode) {
        AudioStateManager.setCrowdIntensity(0.85, 0.4);
      } else if (newDown === 4 && !conversionMode) {
        AudioStateManager.setCrowdIntensity(0.95, 0.3);
      } else {
        AudioStateManager.setCrowdIntensity(0.5, 1.0);
      }
    }

    if (downChanged && _prevDown > 0) {
      if (newDown === 1 && _prevDown > 1) {
        // Fresh set of downs — bigger animation + gold flash
        try {
          gsap.killTweensOf(_bugEls.downEl);
          gsap.fromTo(_bugEls.downEl,
            { x: 20, opacity: 0, scale: 1.25 },
            { x: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }
          );
          _bugEls.downEl.style.color = '#EBB010';
          setTimeout(function() { _bugEls.downEl.style.color = s.twoMinActive ? '#e03050' : '#FF6B00'; }, 600);
        } catch(e) {}
      } else {
        // Normal down change — crossfade: old fades down, new fades up
        try {
          gsap.killTweensOf(_bugEls.downEl);
          gsap.fromTo(_bugEls.downEl,
            { y: -4, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.2, ease: 'power2.out' }
          );
        } catch(e) {}
      }
    }
    _prevDown = newDown;
    _prevDist = newDist;

    // Red zone label + Scorebug Heat
    if (gs.possession === hAbbr && s.yardsToEndzone <= 20) {
      _bugEls.downEl.style.color = '#ff0040';
      _bugEls.downEl.style.textShadow = '0 0 8px rgba(255,0,64,0.4)';
      bug.style.boxShadow = '0 0 20px rgba(255,0,64,0.25)';
      bug.style.borderColor = '#ff004044';
    } else {
      _bugEls.downEl.style.textShadow = '';
      bug.style.boxShadow = '';
      bug.style.borderColor = '';
    }

    // Play clock bar update
    if (_bugEls.playClockFill) {
      if (s.twoMinActive) {
        // 2-minute drill: show time remaining as percentage
        var timePct = Math.max(0, Math.min(100, (s.clockSeconds / 120) * 100));
        _bugEls.playClockFill.style.width = timePct + '%';
        _bugEls.playClockFill.style.background = s.clockSeconds <= 30 ? '#ff0040' : s.clockSeconds <= 60 ? '#EBB010' : '#00ff44';
      } else {
        // Regular play: show plays remaining (20 per half)
        var playsLeft = Math.max(0, 20 - s.playsUsed);
        var playPct = (playsLeft / 20) * 100;
        _bugEls.playClockFill.style.width = playPct + '%';
        _bugEls.playClockFill.style.background = playsLeft <= 5 ? '#ff0040' : playsLeft <= 10 ? '#EBB010' : '#555';
      }
    }

    drawTorchBanner();

    // Onboarding: down & distance explanation (fire once at snap 3)
    if (snapCount === 3 && !_onboardingActive && shouldShowHint('torch_hint_down_distance')) {
      localStorage.setItem('torch_hint_down_distance', '1'); // Mark immediately to prevent re-queuing
      setTimeout(function() {
        var downEl = _bugEls.downEl;
        if (downEl) showOnboardingBubble(downEl, 'That\'s your down and distance. Get 10 yards in 4 plays for a first down.', null, { autoDismiss: 3000 });
      }, 800);
    }

    // Dim non-active UI during tutorial
    var _isTut = _tutorialStep > 0 && snapCount === 0;
    bug.style.opacity = _isTut ? '0.2' : '';
    bug.style.pointerEvents = _isTut ? 'none' : '';
    torchBanner.style.opacity = _isTut ? '0.2' : '';
    torchBanner.style.pointerEvents = _isTut ? 'none' : '';
    stripWrap.style.opacity = _isTut ? '0.3' : '';

    // One-time tooltip: play counter (after 3rd snap — give them time to settle in)
    if (!_playCounterTipShown && s.playsUsed >= 3 && !_isTut && !s.twoMinActive) {
      _playCounterTipShown = true;
      showBugTooltip(_bugEls.snapEl, s.playsUsed + ' of ' + (gs.playsPerHalf || 20) + ' plays used this half. Then the 2-minute drill begins.', 'torch_tip_playcounter');
    }

    // One-time hint: scorebug is tappable for stats (after 5th snap)
    if (!_statsTipShown && s.playsUsed >= 5 && !_isTut && !s.twoMinActive) {
      _statsTipShown = true;
      localStorage.setItem('torch_tip_stats', '1');
      var statHint = document.createElement('div');
      statHint.style.cssText = "text-align:center;padding:2px;font-family:'Rajdhani';font-weight:700;font-size:9px;color:#555;letter-spacing:1px;cursor:pointer;";
      statHint.textContent = 'TAP SCOREBOARD FOR GAME STATS';
      statHint.onclick = function() { bug.click(); };
      bug.appendChild(statHint);
      setTimeout(function() {
        if (statHint.parentNode) {
          try { gsap.to(statHint, { opacity: 0, duration: 0.3, onComplete: function() { statHint.remove(); } }); }
          catch(e) { statHint.remove(); }
        }
      }, 6000);
    }

    // One-time tooltip: 2-minute drill (first time it activates)
    if (!_2minTipShown && s.twoMinActive) {
      _2minTipShown = true;
      showBugTooltip(_bugEls.clockEl, '2-MINUTE DRILL! Clock runs on completions and runs. Incompletes and spikes stop it.', 'torch_tip_2min');
    }
  }
  var _playCounterTipShown = true; // Onboarding disabled — will revisit
  var _2minTipShown = true;
  var _statsTipShown = true;

  function showBugTooltip(anchor, text, storageKey) {
    if (!anchor) return;
    if (storageKey) localStorage.setItem(storageKey, '1');
    var tip = document.createElement('div');
    tip.style.cssText = "position:absolute;left:50%;transform:translateX(-50%);top:100%;margin-top:4px;z-index:100;padding:8px 12px;background:rgba(10,8,4,0.95);border:1px solid #EBB01044;border-radius:6px;max-width:260px;text-align:center;pointer-events:auto;";
    tip.innerHTML =
      "<div style=\"font-family:'Rajdhani';font-weight:600;font-size:12px;color:#ccc;line-height:1.3;\">" + text + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:9px;color:#EBB010;letter-spacing:1px;margin-top:4px;cursor:pointer;\">GOT IT</div>";
    tip.onclick = function(e) {
      e.stopPropagation();
      try { gsap.to(tip, { opacity: 0, y: -4, duration: 0.2, onComplete: function() { tip.remove(); } }); }
      catch(err) { tip.remove(); }
    };
    var parent = anchor.parentNode;
    if (parent) { parent.style.position = 'relative'; parent.appendChild(tip); }
    setTimeout(function() {
      if (tip.parentNode) {
        try { gsap.to(tip, { opacity: 0, y: -4, duration: 0.2, onComplete: function() { tip.remove(); } }); }
        catch(err) { tip.remove(); }
      }
    }, 8000);
  }

  // ── TORCH POINTS BANNER (built once, updated in place) ──
  const torchBanner = document.createElement('div'); torchBanner.className = 'T-torch-banner'; el.appendChild(torchBanner);
  var _torchDisplayFrozen = false;
  var _torchFrozenValue = 0;
  var _prevCardCount = -1;
  // Build once
  // Torch banner flame — always-on-screen HUD flame. Full 4-layer flame
  // for built-in color depth. Keep T-torch-banner-flame class for CSS hooks.
  var _tbFlameSvg = '<svg class="T-torch-banner-flame" viewBox="0 0 34 34" width="26" height="26">' + flameLayersMarkup() + '</svg>';
  torchBanner.innerHTML =
    '<div class="T-torch-banner-border"></div>' +
    '<div class="T-torch-banner-content">' +
      '<div style="position:absolute;inset:0;opacity:0.03;pointer-events:none;background:repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(255,255,255,0.5) 2px,rgba(255,255,255,0.5) 3px);"></div>' +
      _tbFlameSvg +
      '<div class="T-torch-banner-label">TORCH</div>' +
      '<div class="T-torch-banner-sep"></div>' +
      '<div class="T-torch-banner-pts">0</div>' +
      _tbFlameSvg +
      '<span id="torch-cards-btn" style="display:none;position:absolute;right:12px;top:50%;transform:translateY(-50%);font-family:\'Teko\';font-weight:700;font-size:11px;letter-spacing:1px;padding:3px 8px;border-radius:4px;border:1px solid ' + hTeam.accent + '88;background:rgba(255,69,17,0.06);color:' + hTeam.accent + ';cursor:pointer;text-shadow:0 0 6px ' + hTeam.accent + '40;box-shadow:0 0 8px ' + hTeam.accent + '20;"></span>' +
    '</div>' +
    '<div class="T-torch-banner-border"></div>';
  var torchBannerPtsEl = torchBanner.querySelector('.T-torch-banner-pts');
  var _torchCardsBtn = torchBanner.querySelector('#torch-cards-btn');
  // Set the team-accent RGB on the banner number so the Stacked Flame outer
  // halo tints to the user's team color. Parses the hex accent into "R, G, B".
  (function() {
    var hex = (hTeam.accent || '#EBB010').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function(c){return c+c;}).join('');
    var r = parseInt(hex.substring(0,2), 16);
    var g = parseInt(hex.substring(2,4), 16);
    var b = parseInt(hex.substring(4,6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      torchBannerPtsEl.style.setProperty('--team-accent-rgb', r + ', ' + g + ', ' + b);
    }
  })();

  function drawTorchBanner() {
    var _s = gs.getSummary();
    var hTorch = hAbbr === 'CT' ? _s.ctTorchPts : _s.irTorchPts;
    var displayVal = _torchDisplayFrozen ? _torchFrozenValue : hTorch;
    // Update points text only
    if (torchBannerPtsEl) torchBannerPtsEl.textContent = displayVal;
    // Update cards button only when count changes
    var cardCount = torchInventory.length;
    if (cardCount !== _prevCardCount) {
      _prevCardCount = cardCount;
      if (cardCount > 0) {
        _torchCardsBtn.textContent = cardCount + ' CARD' + (cardCount > 1 ? 'S' : '');
        _torchCardsBtn.style.display = '';
      } else {
        _torchCardsBtn.style.display = 'none';
      }
    }
  }
  drawTorchBanner();

  // CARDS button on torch banner opens inventory
  torchBanner.addEventListener('click', function(e) {
    if (!e.target.id || e.target.id !== 'torch-cards-btn') return;
    if (torchInventory.length === 0) return;
    var trayOv = document.createElement('div');
    trayOv.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;flex-direction:column;justify-content:flex-end;pointer-events:auto;';
    var trayBd = document.createElement('div');
    trayBd.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.5);';
    trayBd.onclick = function() { trayOv.remove(); };
    trayOv.appendChild(trayBd);
    var tray = document.createElement('div');
    tray.style.cssText = 'position:relative;z-index:1;background:#141008;border-top:2px solid #EBB010;border-radius:12px 12px 0 0;padding:14px 12px 20px;';
    var _s = gs.getSummary();
    var hTorch = hAbbr === 'CT' ? _s.ctTorchPts : _s.irTorchPts;
    tray.innerHTML = "<div style=\"display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;\"><div style=\"font-family:'Teko';font-weight:700;font-size:18px;color:#EBB010;letter-spacing:2px;\">YOUR TORCH CARDS</div><div style=\"font-family:'Rajdhani';font-weight:700;font-size:13px;color:#00ff44;\">" + hTorch + " PTS</div></div>";
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:10px;justify-content:center;';
    torchInventory.forEach(function(tc) {
      var ce = buildTorchCard(tc, 100, 140);
      row.appendChild(ce);
    });
    tray.appendChild(row);
    trayOv.appendChild(tray);
    el.appendChild(trayOv);
  });

  // Balatro-style TORCH points animation
  var _torchAnimating = false;
  function animateTorchBannerPts(earned) {
    if (!torchBannerPtsEl || _torchAnimating) return;
    _torchAnimating = true;
    var _s = gs.getSummary();
    var hTorch = hAbbr === 'CT' ? _s.ctTorchPts : _s.irTorchPts;
    var startVal = hTorch - earned;
    var endVal = hTorch;

    // Scale up + glow pulse
    torchBannerPtsEl.style.transform = 'scale(1.2)';
    torchBannerPtsEl.style.textShadow = '0 0 20px #EBB010, 0 0 40px rgba(235,176,16,0.5)';
    torchBanner.style.boxShadow = '0 0 16px rgba(235,176,16,0.3)';

    // Count up from old to new over 500ms
    var duration = 500;
    var start = performance.now();
    function tick(now) {
      var t = Math.min((now - start) / duration, 1);
      var val = Math.round(startVal + (endVal - startVal) * t);
      torchBannerPtsEl.textContent = val;
      if (t < 1) { requestAnimationFrame(tick); }
      else {
        // Settle back
        torchBannerPtsEl.style.transform = 'scale(1)';
        torchBannerPtsEl.style.textShadow = '0 0 12px #EBB010';
        torchBanner.style.boxShadow = '';
        _torchAnimating = false;
      }
    }
    requestAnimationFrame(tick);
  }

  // ── FIELD STRIP (Canvas + Card Overlay) ──
  var stripWrap = document.createElement('div');
  stripWrap.style.cssText = 'position:relative;flex-shrink:0;';
  const strip = document.createElement('div'); strip.className = 'T-strip';
  stripWrap.appendChild(strip);

  // Gutter-based LOS + FD indicator system (right 17% of strip)
  var _gutterBg = document.createElement('div');
  _gutterBg.style.cssText = 'position:absolute;top:0;bottom:0;left:83%;right:0;background:rgba(0,0,0,0.2);border-left:1px solid rgba(255,255,255,0.03);z-index:1;pointer-events:none;';
  // 5 evenly-spaced yard lines in the gutter
  for (var _gi = 1; _gi <= 5; _gi++) {
    var _yl = document.createElement('div');
    _yl.style.cssText = 'position:absolute;left:4px;right:0;height:1px;background:rgba(255,255,255,0.05);top:' + (_gi * (100/6)) + '%;';
    _gutterBg.appendChild(_yl);
  }
  stripWrap.appendChild(_gutterBg);
  var _losLine = document.createElement('div');
  _losLine.style.cssText = 'position:absolute;left:83%;right:0;height:2.5px;z-index:12;pointer-events:none;';
  stripWrap.appendChild(_losLine);
  var _fdLine = document.createElement('div');
  _fdLine.style.cssText = 'position:absolute;left:83%;right:0;height:2.5px;z-index:12;pointer-events:none;';
  stripWrap.appendChild(_fdLine);
  var _zoneFill = document.createElement('div');
  _zoneFill.style.cssText = 'position:absolute;left:83%;right:0;z-index:11;pointer-events:none;display:none;';
  stripWrap.appendChild(_zoneFill);
  var _pillWrap = document.createElement('div');
  _pillWrap.style.cssText = 'position:absolute;top:0;bottom:0;right:3px;z-index:13;pointer-events:none;';
  stripWrap.appendChild(_pillWrap);

  // Canvas field renderer — layered behind card drop zones
  var _fieldAnimator = null;
  var _fieldCanvas = null;
  function initFieldCanvas() {
    if (_fieldAnimator) return;
    var w = strip.offsetWidth || 375;
    var h = strip.offsetHeight || 160;
    if (w < 50 || h < 50) return; // Not mounted yet
    _fieldAnimator = createFieldAnimator(w, h);
    _fieldCanvas = _fieldAnimator.canvas;
    _fieldCanvas.style.cssText = 'position:absolute;inset:0;z-index:0;width:100%;height:100%;border-radius:inherit;';
    strip.insertBefore(_fieldCanvas, strip.firstChild);
  }
  // Weather audio removed — oscillator-based static replaced by silence.
  // Real weather audio can be added later with proper audio files.
  el.appendChild(stripWrap);
  function drawField() {
    const s = gs.getSummary();
    const isOff = gs.possession === hAbbr;
    const ct = hTeam, ir = oTeam;
    const homeTeam = getTeam(GS.team);
    const lp = 7 + s.ballPosition * .86;
    const td = s.possession==='CT' ? s.ballPosition+s.distance : s.ballPosition-s.distance;
    const tp = 7 + Math.max(0,Math.min(100,td)) * .86;
    const pc = s.possession==='CT' ? ct.accent : ir.accent;
    var res = driveSnaps.length > 0 ? driveSnaps[driveSnaps.length - 1] : null;

    // Canvas field render (behind DOM overlay)
    initFieldCanvas();
    if (_fieldAnimator) {
      var ballYard = s.ballPosition + 10; // 0-100 → 10-110 (matches canvas yard line scale)
      var firstDownYard = ballYard + (isOff ? s.distance : -s.distance);
      var offTeamId = isOff ? GS.team : (GS.opponent || 'wolves');
      var defTeamId = isOff ? (GS.opponent || 'wolves') : GS.team;
      var formation = 'shotgun_deuce';
      if (selPl && _fieldAnimator.PLAY_FORMATION_MAP) {
        formation = _fieldAnimator.pickFormation
          ? _fieldAnimator.pickFormation(selPl.playType || 'SHORT', offTeamId)
          : (_fieldAnimator.PLAY_FORMATION_MAP[selPl.playType] || 'shotgun_deuce');
      }
      _fieldAnimator.render({
        ballYard: Math.max(10, Math.min(110, ballYard)),
        losYard: null,
        firstDownYard: null,
        formation: formation,
        offTeam: offTeamId,
        defTeam: defTeamId,
        skipDots: true,
        skipLOS: true,
      });
    }

    // Ball position indicator bar
    var ydsToEz = gs.yardsToEndzone();
    var ballPct = 7 + s.ballPosition * 0.86; // same math as lp
    // Position LOS and FD lines to match canvas yard lines exactly.
    // Lines are children of stripWrap. Canvas is child of strip which is child of stripWrap.
    // We need pixel offset from stripWrap's top edge to where the yard line appears on screen.
    // Position LOS + FD lines to match canvas yard lines.
    // Canvas uses ballYard = ballPosition * 1.1 + 5 to map 0-100 → 5-115.
    // Canvas yard numbers: "20" is at absolute yard 30 (nyd-10 display).
    // For DOM overlay we use the same ballYard and same viewport math.
    var _byrd = s.ballPosition + 10; // same transform as canvas render call
    var _visYards = 25;
    var _cntr = Math.max(_visYards / 2, Math.min(120 - _visYards / 2, _byrd));
    var _topYard = _cntr - _visYards / 2;
    var _h = strip.clientHeight || 136;
    var _ypx = _h / _visYards;

    // LOS + FD lines — gutter only (right 17%)
    var _losPx = ((_byrd - _topYard) * _ypx) - 1;
    var _fdYard = _byrd + (isOff ? s.distance : -s.distance);
    var _fdPx = ((_fdYard - _topYard) * _ypx) - 1;
    var _fdVisible = _fdPx >= -3 && _fdPx <= _h + 3;
    var _gap = Math.abs(_fdPx - _losPx);
    var _mode = _gap < 8 ? 'merged' : _gap < 18 ? 'stacked' : 'separated';

    // Color rules
    var _isRedZone = ydsToEz <= 20 && gs.possession === hAbbr;
    var _losColor = _isRedZone ? '#ff0040' : '#4DA6FF';
    var _fdColor = (ydsToEz <= 10) ? '#ff0040' : '#EBB010';
    var _yardDisplay = ydsToEz <= 5 ? 'GL' : ydsToEz === 50 ? '50' : ydsToEz <= 50 ? ydsToEz : (100 - ydsToEz);
    var _fdText = ydsToEz <= 10 ? 'TD' : '1ST';

    // LOS line
    _losLine.style.top = _losPx + 'px';
    _losLine.style.background = _losColor;
    _losLine.style.boxShadow = '0 0 10px ' + _losColor + '66';

    // FD line
    if (_fdVisible && _mode !== 'merged') {
      _fdLine.style.top = _fdPx + 'px';
      _fdLine.style.background = _fdColor;
      _fdLine.style.boxShadow = '0 0 8px ' + _fdColor + '55';
      _fdLine.style.display = '';
    } else {
      _fdLine.style.display = 'none';
    }

    // Zone fill between lines
    if (_fdVisible && _mode !== 'merged') {
      var _zTop = Math.min(_losPx, _fdPx);
      var _zBot = Math.max(_losPx, _fdPx);
      _zoneFill.style.top = _zTop + 'px';
      _zoneFill.style.height = (_zBot - _zTop) + 'px';
      _zoneFill.style.background = _fdColor + '0a';
      _zoneFill.style.display = '';
    } else {
      _zoneFill.style.display = 'none';
    }

    // Pill labels
    var _losPillColor = _losColor;
    var _losPillTextColor = '#fff';
    var _fdPillColor = _fdColor;
    var _fdPillTextColor = _fdColor === '#ff0040' ? '#fff' : '#000';
    var _pillStyle = "font-family:'Oswald';font-weight:700;font-size:{FS}px;letter-spacing:0.5px;text-align:center;box-shadow:0 2px 4px rgba(0,0,0,0.5);padding:1px {PD}px;line-height:1.2;";

    if (_mode === 'separated' && _fdVisible) {
      // Individual pills above each line
      _pillWrap.innerHTML =
        '<div style="position:absolute;right:0;top:' + _losPx + 'px;transform:translateY(calc(-100% - 3px));' + _pillStyle.replace('{FS}','9').replace('{PD}','6') + 'color:' + _losPillTextColor + ';background:' + _losPillColor + ';border-radius:3px;">' + _yardDisplay + '</div>' +
        '<div style="position:absolute;right:0;top:' + _fdPx + 'px;transform:translateY(calc(-100% - 3px));' + _pillStyle.replace('{FS}','9').replace('{PD}','6') + 'color:' + _fdPillTextColor + ';background:' + _fdPillColor + ';border-radius:3px;">' + _fdText + '</div>';
    } else if (_mode === 'stacked' && _fdVisible) {
      // Stacked pills between the two lines
      var _mid = (_losPx + _fdPx) / 2;
      _pillWrap.innerHTML =
        '<div style="position:absolute;right:0;top:' + _mid + 'px;transform:translateY(-50%);display:flex;flex-direction:column;">' +
          '<div style="' + _pillStyle.replace('{FS}','8').replace('{PD}','4') + 'color:' + _losPillTextColor + ';background:' + _losPillColor + ';border-radius:3px 3px 0 0;">' + _yardDisplay + '</div>' +
          '<div style="' + _pillStyle.replace('{FS}','8').replace('{PD}','4') + 'color:' + _fdPillTextColor + ';background:' + _fdPillColor + ';border-radius:0 0 3px 3px;">' + _fdText + '</div>' +
        '</div>';
    } else {
      // Merged — stacked pills at LOS
      _pillWrap.innerHTML =
        '<div style="position:absolute;right:0;top:' + _losPx + 'px;transform:translateY(-50%);display:flex;flex-direction:column;">' +
          '<div style="' + _pillStyle.replace('{FS}','8').replace('{PD}','4') + 'color:' + _losPillTextColor + ';background:' + _losPillColor + ';border-radius:3px 3px 0 0;">' + _yardDisplay + '</div>' +
          (_fdVisible ? '<div style="' + _pillStyle.replace('{FS}','8').replace('{PD}','4') + 'color:' + _fdPillTextColor + ';background:' + _fdPillColor + ';border-radius:0 0 3px 3px;">' + _fdText + '</div>' : '') +
        '</div>';
    }

    // Red zone tint + glow
    var isInRedZone = _isRedZone;
    if (isInRedZone) {
      stripWrap.style.boxShadow = 'inset 0 0 20px rgba(255,0,64,0.05)';
      strip.style.background = 'rgba(255,0,64,0.03)';
      // Red zone: SNAP button shifts to red gradient
      el.classList.add('T-redzone');
    } else {
      stripWrap.style.boxShadow = '';
      strip.style.background = '';
      el.classList.remove('T-redzone');
    }

    // ── Defensive "Pressure" Vignette (Blitz Warning) ──
    if (!isOff && res && res.defPlay && res.defPlay.cardType === 'BLITZ' && phase === 'ready') {
      stripWrap.style.boxShadow = 'inset 0 0 30px rgba(77,166,255,0.15)';
      strip.style.background = 'rgba(77,166,255,0.05)';
    }

    // Subtle possession tint on field strip border
    stripWrap.style.borderBottom = '2px solid ' + (isOff ? hTeam.accent + '44' : oTeam.accent + '44');
    if (isInRedZone && !_wasInRedZone) {
      _wasInRedZone = true;
      var rzFlash = document.createElement('div');
      rzFlash.style.cssText = "position:fixed;top:35%;left:50%;transform:translateX(-50%);z-index:650;font-family:'Teko';font-weight:700;font-size:28px;color:#ff0040;letter-spacing:4px;text-shadow:0 0 20px rgba(255,0,64,0.6);pointer-events:none;opacity:0;";
      rzFlash.textContent = 'RED ZONE';
      el.appendChild(rzFlash);
      try {
        gsap.to(rzFlash, { opacity: 1, duration: 0.3, ease: 'back.out(1.5)' });
        gsap.to(rzFlash, { opacity: 0, y: -20, duration: 0.4, delay: 1.2, onComplete: function() { rzFlash.remove(); } });
      } catch(e) { setTimeout(function() { rzFlash.remove(); }, 2000); }
    } else if (!isInRedZone) {
      _wasInRedZone = false;
    }

    // Turf texture
    let h = '<div class="T-field-turf"></div>';
    // Both endzones customized for home team
    var homeColor = homeTeam.color || '#FF4511';
    var homeMascot = hTeam.mascot || hTeam.name;
    h += '<div class="T-ez T-ez-l" style="background:' + homeColor + '"><span class="T-ez-text">' + homeMascot + '</span></div>';
    h += '<div class="T-ez T-ez-r" style="background:' + homeColor + '"><span class="T-ez-text">' + homeMascot + '</span></div>';
    // Home team logo at midfield (large, featured)
    h += '<div class="T-midfield-logo">' + homeTeam.icon + '</div>';
    // Yard lines with numbers at top AND bottom
    var yardNums = {10:'10',20:'20',30:'30',40:'40',50:'50',60:'40',70:'30',80:'20',90:'10'};
    for (let i=5;i<=95;i+=5) {
      var xp = 7+i*.86;
      if (i%10===0) {
        h += '<div class="T-yard" style="left:'+xp+'%"></div>';
        h += '<div class="T-yard-num T-yard-num-top" style="left:'+xp+'%">'+(yardNums[i]||'')+'</div>';
        h += '<div class="T-yard-num T-yard-num-bot" style="left:'+xp+'%">'+(yardNums[i]||'')+'</div>';
      } else {
        h += '<div class="T-yard-5" style="left:'+xp+'%"></div>';
      }
    }
    // Hash marks
    h += '<div class="T-hash" style="top:30%"></div><div class="T-hash" style="top:70%"></div>';
    // LOS and LTG
    h += `<div class="T-los" style="left:${lp}%;background:${pc};box-shadow:0 0 10px ${pc}"></div>`;
    h += `<div class="T-ltg" style="left:${tp}%;border-color:#c8a030"></div>`;

    // Drop zones — empty outlines for unfilled, actual card for filled
    // During tutorial: show instructional text + flash on the active slot
    var isTut = _tutorialStep > 0 && snapCount === 0;
    var isTutPlay = _tutorialStep === 1 && snapCount === 0;
    var isTutPlayer = _tutorialStep === 2 && snapCount === 0;
    var isTutSnap = _tutorialStep === 3 && snapCount === 0;
    const playLbl = 'TAP<br><br>PLAY<br><br>CARD';
    if (selPl) {
      h += '<div class="T-placed T-placed-play" id="T-placed-play-slot"></div>';
    } else {
      var playDimStyle = (isTut && !isTutPlay) ? 'opacity:0.15;pointer-events:none;' : '';
      var playDropClass = 'T-drop T-drop-play T-drop-active' + (isTutPlay ? ' T-drop-tutorial' : '');
      h += '<div class="' + playDropClass + '" data-drop="play" style="' + playDimStyle + '"><span class="T-drop-lbl">' + playLbl + '</span></div>';
    }

    const playerLbl = 'TAP<br><br>PLAYER<br><br>CARD';
    if (selP) {
      h += '<div class="T-placed T-placed-player" id="T-placed-player-slot"></div>';
    } else {
      var playerDimStyle = (isTut && !isTutPlayer) ? 'opacity:0.15;pointer-events:none;' : '';
      var playerDropClass = 'T-drop T-drop-player T-drop-active' + (isTutPlayer ? ' T-drop-tutorial-player' : '');
      h += '<div class="' + playerDropClass + '" data-drop="player" style="' + playerDimStyle + '"><span class="T-drop-lbl">' + playerLbl + '</span></div>';
    }

    if (selTorch) {
      h += '<div class="T-placed T-placed-torch" id="T-placed-torch-slot"></div>';
    } else {
      const hasTorchCards = torchInventory.length > 0;
      // 4-layer flame — the native color depth replaces the old red→accent
      // gradient. Team accent glow applied via drop-shadow filter.
      var _flameSvg = flameSilhouetteSVG(18, hTeam.accent, 1, 'display:block;margin:0 auto 2px;animation:T-flame-pulse 2s ease-in-out infinite;filter:drop-shadow(0 0 4px ' + hTeam.accent + ');');
      const torchLbl = hasTorchCards
        ? (phase === 'torch' ? 'TAP<br><br>TORCH<br><br>CARD' : _flameSvg + '<span class="T-torch-brand" style="color:' + hTeam.accent + '">TORCH</span>')
        : _flameSvg + '<span class="T-torch-brand" style="color:' + hTeam.accent + '">TORCH</span>';
      var torchDimStyle = (isTut && !isTutSnap) ? 'opacity:0.15;pointer-events:none;' : '';
      h += '<div class="T-drop T-drop-torch' + (phase==='torch'?' T-drop-active':'') + '" data-drop="torch" style="' + torchDimStyle + '"><span class="T-drop-lbl">' + torchLbl + '</span></div>';
    }

    strip.innerHTML = h;

    // Re-insert canvas field behind everything (strip.innerHTML destroys it)
    if (_fieldCanvas && _fieldCanvas.parentNode !== strip) {
      strip.insertBefore(_fieldCanvas, strip.firstChild);
    }
    // Re-insert ball position indicator (also destroyed by innerHTML)
    // LOS/FD lines are on stripWrap, not strip — no re-insert needed

    // Append actual shared-builder DOM cards into placed slots with lock-in animation
    // Each placed slot is tappable to deselect the card
    if (selPl) {
      var playSlot = strip.querySelector('#T-placed-play-slot');
      if (playSlot) {
        if (_tutorialStep > 0 && snapCount === 0) {
          playSlot.style.opacity = '0.3';
          playSlot.style.pointerEvents = 'none';
        } else {
          playSlot.style.cursor = 'pointer';
          playSlot.onclick = function() {
            SND.cardThud();
            try { gsap.to(playSlot, { y: -30, opacity: 0, scale: 0.85, duration: 0.2, ease: 'power2.in', onComplete: function() {
              selPl = null; phase = 'play'; drawField(); drawPanel();
            }}); } catch(e) { selPl = null; phase = 'play'; drawField(); drawPanel(); }
          };
        }
        var playEl = mkPlayCardEl(selPl);
        playEl.style.width = '100%';
        playEl.style.height = '100%';
        playSlot.appendChild(playEl);
        try {
          gsap.from(playSlot, { y: 40, scale: 0.8, opacity: 0, duration: 0.35, ease: 'power2.out' });
          setTimeout(function() { SND.cardThud(); }, 300);
        } catch(e) {}
      }
    }
    if (selP) {
      var playerSlot = strip.querySelector('#T-placed-player-slot');
      if (playerSlot) {
        if (_tutorialStep > 0 && snapCount === 0) {
          playerSlot.style.opacity = '0.3';
          playerSlot.style.pointerEvents = 'none';
        } else {
          playerSlot.style.cursor = 'pointer';
          playerSlot.onclick = function() {
            SND.cardThud();
            try { gsap.to(playerSlot, { y: -30, opacity: 0, scale: 0.85, duration: 0.2, ease: 'power2.in', onComplete: function() {
              selP = null; phase = 'play'; drawField(); drawPanel();
            }}); } catch(e) { selP = null; phase = 'play'; drawField(); drawPanel(); }
          };
        }
        var playerEl = mkPlayerCardEl(selP, hTeam);
        playerEl.style.width = '100%';
        playerEl.style.height = '100%';
        playerSlot.appendChild(playerEl);
        // Add player game stats to placed card
        var _pStats = selP.id ? _playerGameStats[selP.id] : null;
        if (_pStats) {
          // Compact stat format for field card
          var _d = '<span style="opacity:0.55">', _e = '</span>';
          var _parts = [];
          if (_pStats.passComp || _pStats.passAtt) _parts.push((_pStats.passComp||0)+'/'+(_pStats.passAtt||0)+' '+(_pStats.passYds||0)+' '+_d+'YD'+_e);
          else if (_pStats.rec) _parts.push((_pStats.recYds||0)+' '+_d+'YD'+_e);
          else if (_pStats.rushAtt) _parts.push(_pStats.rushAtt+' '+_d+'CAR'+_e+' '+(_pStats.rushYds||0)+' '+_d+'YD'+_e);
          var _counts = [];
          if (_pStats.td) _counts.push(_pStats.td+' '+_d+'TD'+_e);
          if (_pStats.rec) _counts.push(_pStats.rec+' '+_d+'REC'+_e);
          if (_pStats.tkl) _counts.push(_pStats.tkl+' '+_d+'TKL'+_e);
          if (_pStats.sack) _counts.push(_pStats.sack+' '+_d+'SCK'+_e);
          if (_pStats.int) _counts.push(_pStats.int+' '+_d+'INT'+_e);
          if (_pStats.pbu) _counts.push(_pStats.pbu+' '+_d+'PBU'+_e);
          _parts = _parts.concat(_counts.slice(0, 2));
          if (_parts.length > 0) {
            var _statsBarEl = playerEl.querySelector('.player-stats-bar');
            if (_statsBarEl) {
              _statsBarEl.innerHTML = "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:10px;color:#fff;text-align:center;letter-spacing:0.3px;white-space:nowrap;line-height:1;\">" + _parts.join(' ') + "</div>";
            }
          }
        }
        try {
          gsap.from(playerSlot, { y: 40, scale: 0.8, opacity: 0, duration: 0.35, ease: 'power2.out' });
          setTimeout(function() { SND.cardThud(); }, 300);
        } catch(e) {}
      }
    }
    if (selTorch) {
      var torchSlot = strip.querySelector('#T-placed-torch-slot');
      if (torchSlot) {
        torchSlot.style.cursor = 'pointer';
        torchSlot.onclick = function() {
          SND.cardThud();
          try { gsap.to(torchSlot, { y: -30, opacity: 0, scale: 0.85, duration: 0.2, ease: 'power2.in', onComplete: function() {
            var tcObj = TORCH_CARDS.find(function(c) { return c.id === selTorch; });
            if (selectedPreSnap || tcObj) { torchInventory.push(selectedPreSnap || tcObj); if (GS.season) GS.season.torchCards = torchInventory.slice(); }
            selTorch = null; selectedPreSnap = null;
            phase = (selPl && selP) ? 'torch' : 'play';
            drawField(); drawPanel();
          }}); } catch(e) {
            var tcObj = TORCH_CARDS.find(function(c) { return c.id === selTorch; });
            if (selectedPreSnap || tcObj) { torchInventory.push(selectedPreSnap || tcObj); if (GS.season) GS.season.torchCards = torchInventory.slice(); }
            selTorch = null; selectedPreSnap = null; phase = (selPl && selP) ? 'torch' : 'play'; drawField(); drawPanel();
          }
        };
        var tc = TORCH_CARDS.find(function(c) { return c.id === selTorch; });
        if (tc) {
          var torchEl = buildTorchCard(tc, 80, 150);
          torchEl.style.width = '100%';
          torchEl.style.height = '100%';
          torchSlot.appendChild(torchEl);
        }
      }
    }
  }

  // ── PANEL ──
  const panel = document.createElement('div'); panel.className = 'T-panel'; el.appendChild(panel);

  // ── DRIVE SUMMARY PANEL (replaces old play-by-play booth) ──
  const driveSummaryEl = document.createElement('div'); driveSummaryEl.className = 'T-drive'; driveSummaryEl.style.display = 'none'; el.appendChild(driveSummaryEl);

  // ── Clipboard removed ──
  // The swipe-up Clipboard bottom sheet was consolidated into the stats sheet
  // (triggered by tapping the scorebug). One canonical stats destination with
  // all the hero metrics + detailed box score. See src/ui/components/statsSheet.js.

  // Keep narr as a virtual container for backward compat — content mirrored into drive summary commentary
  const narr = document.createElement('div'); narr.className = 'T-narr'; narr.style.display = 'none';
  el.appendChild(narr);

  function setNarr(a, b, opts) {
    driveCommLine1 = a || '';
    driveCommLine2 = b || '';
    opts = opts || {};
    var bc = opts.biasColor || '#EBB010';

    var html = '<div class="T-narr" style="border-left:3px solid ' + bc + ';background:linear-gradient(90deg,' + bc + '08,transparent 30%);border-radius:0 6px 6px 0;padding:10px 12px;margin:4px 0;">';
    html += '<div style="font-family:\'Rajdhani\';font-weight:700;font-size:14px;color:#fff;line-height:1.3;">' + (a || '') + '</div>';
    if (b) html += '<div style="font-family:\'Rajdhani\';font-weight:600;font-size:12px;color:rgba(255,255,255,0.45);line-height:1.25;margin-top:3px;">' + b + '</div>';
    // Badge row
    if (opts.yards !== undefined || opts.event) {
      html += '<div style="display:flex;align-items:center;gap:6px;margin-top:6px;">';
      if (opts.yards !== undefined) {
        var yBg = opts.yards > 0 ? '#00ff44' : opts.yards < 0 ? '#ff0040' : '#888';
        var yTxt = opts.yards > 0 ? '#000' : '#fff';
        var yLabel = opts.yards > 0 ? '+' + opts.yards + ' YDS' : opts.yards < 0 ? opts.yards + ' YDS' : 'NO GAIN';
        html += '<div style="font-family:\'Oswald\';font-weight:700;font-size:8px;padding:1px 5px;border-radius:3px;letter-spacing:0.5px;color:' + yTxt + ';background:' + yBg + ';">' + yLabel + '</div>';
      }
      if (opts.event) {
        html += '<div style="font-family:\'Rajdhani\';font-weight:700;font-size:9px;color:' + bc + ';letter-spacing:1px;">' + opts.event + '</div>';
      }
      if (opts.playName || opts.playerName) {
        var attr = [opts.playName, opts.playerName].filter(Boolean).join(' \u2192 ');
        html += '<div style="margin-left:auto;font-family:\'Rajdhani\';font-size:9px;color:#444;">' + attr + '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    narr.innerHTML = html;
    drawDriveSummary();
  }

  function drawDriveSummary() {
    var totalYds = 0, totalPlays = driveSummaryLog.length;
    driveSummaryLog.forEach(function(e) { totalYds += e.yards; });

    // Drive header — team-branded
    var possTeamObj = gs.possession === 'CT' ? hTeam : oTeam;
    var driveColor = possTeamObj.accent || '#FF6B00';
    var html = '<div class="T-drive-hdr">' +
      '<div class="T-drive-hdr-l" style="color:' + driveColor + '">' + possTeamObj.name + ' DRIVE</div>' +
      '<div class="T-drive-hdr-r" style="font-family:\'Teko\';font-size:16px;font-weight:700"><span style="color:' + driveColor + '">' + totalPlays + '</span> plays \u00b7 <span style="color:' + driveColor + '">' + totalYds + '</span> yds \u00b7 <span style="color:' + driveColor + '">' + driveFirstDowns + '</span> 1st dn</div>' +
      '</div>';

    // Play-by-play ticker rows — chronological order (oldest → newest),
    // matching traditional football PBP / ESPN gamecast format. The newest
    // play sits at the bottom with a highlight border so the eye still knows
    // where "now" is in the drive.
    if (driveSummaryLog.length > 0) {
      var logLen = driveSummaryLog.length;

      for (var _ti = 0; _ti < logLen; _ti++) {
        var e = driveSummaryLog[_ti];
        var isNewest = _ti === logLen - 1;
        var resColor, resText;
        if (e.isUserOff || e.isUserOff === undefined) {
          resColor = e.isTD ? '#EBB010' : e.yards > 0 ? '#00ff44' : e.yards < 0 || e.isSack ? '#ff0040' : '#fff';
          resText = e.isTD ? 'TD' : e.isSack ? 'SACK' : e.isInt ? 'INT' : e.isFumble ? 'FUM' : (e.isInc || e.yards === 0) ? 'NO GAIN' : (e.yards > 0 ? e.yards + ' YDS' : 'LOSS ' + Math.abs(e.yards));
        } else {
          if (e.isTD) { resColor = '#ff0040'; resText = 'TD'; }
          else if (e.isSack) { resColor = '#00ff44'; resText = 'SACK'; }
          else if (e.isInt) { resColor = '#00ff44'; resText = 'INT'; }
          else if (e.isFumble) { resColor = '#00ff44'; resText = 'FUM'; }
          else if (e.isInc || e.yards === 0) { resColor = '#00ff44'; resText = 'NO GAIN'; }
          else if (e.yards < 0) { resColor = '#00ff44'; resText = e.yards + ''; }
          else if (e.yards <= 3) { resColor = '#fff'; resText = '+' + e.yards; }
          else { resColor = '#ff0040'; resText = '+' + e.yards; }
        }
        var dn = ['','1st','2nd','3rd','4th'][e.down] || '';
        // Newest play highlighted with color tint + bigger text
        var drivePossColor = (gs.possession === 'CT' ? hTeam : oTeam).accent;
        var rowBg = isNewest ? 'background:' + resColor + '0d;' : '';
        var rowStyle = isNewest
          ? 'opacity:1;border-left:3px solid ' + drivePossColor + ';padding-left:6px;' + rowBg + 'animation:T-clash-yds 0.3s ease-out;'
          : 'opacity:0.5';
        var playFs = isNewest ? 'font-size:13px;font-weight:700;' : '';
        html += '<div class="T-drive-row" style="' + rowStyle + '">' +
          '<div class="T-drive-row-dd" style="color:' + drivePossColor + ';font-size:13px;font-weight:700">' + dn + ' & ' + (e.ydsToEz !== undefined && e.ydsToEz <= 10 ? 'GL' : e.dist) + '</div>' +
          '<div class="T-drive-row-play" style="' + playFs + '">' + e.playName + '</div>' +
          '<div class="T-drive-row-res" style="color:' + resColor + '">' + resText + '</div>' +
          '</div>';
      }
    }

    // Stat lines — show possessing team's OFF stats + defending team's DEF stats
    var isHumanBall = gs.possession === hAbbr;
    var offPA = isHumanBall ? hOffPassAtt : cOffPassAtt;
    var offPC = isHumanBall ? hOffPassComp : cOffPassComp;
    var offPY = isHumanBall ? hOffPassYds : cOffPassYds;
    var offRA = isHumanBall ? hOffRushAtt : cOffRushAtt;
    var offRY = isHumanBall ? hOffRushYds : cOffRushYds;
    var offRC = isHumanBall ? hOffRec : cOffRec;
    var offRCY = isHumanBall ? hOffRecYds : cOffRecYds;
    var offQB = isHumanBall ? hOffQBName : cOffQBName;
    var offRB = isHumanBall ? hOffRBName : cOffRBName;
    var offWR = isHumanBall ? hOffWRName : cOffWRName;
    var curDefStats = isHumanBall ? cDefStats : hDefStats;
    var offStatColor = (isHumanBall ? hTeam : oTeam).accent || '#FF6B00';
    var defStatColor = (isHumanBall ? oTeam : hTeam).accent || '#FF6B00';
    // Compact single-line stat bar: OFF stats (team color) | DEF stat (team color)
    var offParts = [];
    if (offPA > 0) offParts.push((offQB || 'QB') + ' ' + offPC + '/' + offPA + ', ' + offPY + ' YD');
    if (offRC > 0) offParts.push((offWR || 'WR') + ' ' + offRC + ' REC ' + offRCY + ' YD');
    else if (offRA > 0) offParts.push((offRB || 'RB') + ' ' + offRA + ' CAR ' + offRY + ' YD');

    var defPart = '';
    var bestDef = null, bestDefName = '';
    var defKeys = Object.keys(curDefStats);
    if (defKeys.length > 0) {
      var bestScore = -1;
      defKeys.forEach(function(name) {
        var d = curDefStats[name];
        var score = d.tkl + d.pbu * 2 + d.int * 5 + d.sack * 3;
        if (score > bestScore) { bestScore = score; bestDef = d; bestDefName = name; }
      });
      if (bestDef && bestScore > 0) {
        var dp = [];
        if (bestDef.tkl > 0) dp.push(bestDef.tkl + ' TKL');
        if (bestDef.pbu > 0) dp.push(bestDef.pbu + ' PBU');
        if (bestDef.int > 0) dp.push(bestDef.int + ' INT');
        if (bestDef.sack > 0) dp.push(bestDef.sack + ' SCK');
        defPart = bestDefName + ' ' + dp.join(' ');
      }
    }

    if (offParts.length > 0 || defPart) {
      var offTeamLabel = (isHumanBall ? hTeam : oTeam).name;
      var defTeamLabel = (isHumanBall ? oTeam : hTeam).name;
      html += '<div class="T-drive-stats" style="font-family:\'Rajdhani\';font-size:11px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;gap:6px;flex-wrap:nowrap">';
      if (offParts.length > 0) {
        html += '<span style="color:' + offStatColor + '">' + offParts.join(' · ') + '</span>';
      }
      if (offParts.length > 0 && defPart) {
        html += '<span style="color:#333">|</span>';
      }
      if (defPart) {
        html += '<span style="color:' + defStatColor + '">' + defPart + '</span>';
      }
      html += '</div>';
    }

    // Commentary text
    if (driveCommLine1) {
      html += '<div class="T-drive-comm">' + driveCommLine1 + '</div>';
      // Show yards + next down & distance instead of commentary sub-line
      if (driveSummaryLog.length > 0) {
        var _lastEntry = driveSummaryLog[driveSummaryLog.length - 1];
        var _ydsText = _lastEntry.isTD ? 'TOUCHDOWN' : _lastEntry.isSack ? 'SACK' : _lastEntry.isInt ? 'INTERCEPTION' : _lastEntry.isFumble ? 'FUMBLE' : _lastEntry.isInc ? 'NO GAIN' : (_lastEntry.yards > 0 ? '+' + _lastEntry.yards + ' yards' : _lastEntry.yards < 0 ? _lastEntry.yards + ' yards' : 'No gain');
        var _nextS = gs.getSummary();
        var _dnLabels = ['','1st','2nd','3rd','4th'];
        var _nextDn = fmtDownDist(_nextS.down, _nextS.distance, _nextS.yardsToEndzone);
        var _ydsColor = _lastEntry.isTD || _lastEntry.yards > 0 ? '#00ff44' : _lastEntry.yards < 0 || _lastEntry.isSack ? '#ff0040' : '#888';
        html += '<div class="T-drive-comm-sub"><span style="color:' + _ydsColor + ';">' + _ydsText + '</span> <span style="color:#666;">\u2014</span> <span style="color:' + driveColor + ';">' + _nextDn + '</span></div>';
      }
    } else {
      html += '<div class="T-drive-idle">Awaiting snap</div>';
    }

    driveSummaryEl.innerHTML = html;
    driveSummaryEl.scrollTop = driveSummaryEl.scrollHeight;
  }
  drawDriveSummary();

  function distLabel(dist, ydsToEz) {
    var yz = ydsToEz !== undefined ? ydsToEz : gs.getSummary().yardsToEndzone;
    if (yz <= 10) return 'GOAL';
    var s = gs.getSummary();
    if (s.down === 1 && dist > 10) dist = Math.min(10, yz);
    return dist;
  }
  // Format down & distance string with GL support
  function fmtDownDist(down, dist, ydsToEz) {
    if (conversionMode) return (conversionMode.choice || '2pt').toUpperCase() + ' ATTEMPT';
    var dnLabels = ['','1st','2nd','3rd','4th'];
    var dn = dnLabels[down] || '';
    var d = (ydsToEz !== undefined && ydsToEz <= 10) ? 'GL' : dist;
    return dn + ' & ' + d;
  }

  function ballSideLabel() {
    const s = gs.getSummary();
    const yds = s.yardsToEndzone;
    if (yds <= 50) return 'OPP ' + yds;
    return 'OWN ' + (100 - yds);
  }



  /** Animate torch points flying from commentary to scoreboard, then roll up the total */
  /** Animate torch points flying from commentary to banner, then roll up the total */
  /**
   * Flame Streak fly-in.
   *
   * Emerges from the hero result text (srcRect), streaks to the torch banner
   * as a glowing Stacked Flame "+N" popup, drops team-colored embers along
   * the path, and lands with a team-colored impact flash on the banner.
   *
   * @param {DOMRect|object} srcRect — rect with {left, top, width, height}
   *   captured BEFORE the result overlay fades out. Passing a live element
   *   doesn't work because by the time this fires, the overlay is gone and
   *   the element is detached (getBoundingClientRect returns zeros).
   * @param {number} pts — torch points to display
   * @param {function} onDone — called after fly + banner bump complete
   */
  function animateTorchFly(srcRect, pts, onDone) {
    if (!srcRect || pts <= 0) {
      _torchDisplayFrozen = false;
      drawTorchBanner();
      if (onDone) onDone();
      return;
    }
    var torchTarget = torchBanner.querySelector('.T-torch-banner-pts');
    if (!torchTarget) {
      _torchDisplayFrozen = false;
      drawTorchBanner();
      if (onDone) onDone();
      return;
    }
    var tgtRect = torchTarget.getBoundingClientRect();

    // Centers
    var srcX = srcRect.left + (srcRect.width || 0) / 2;
    var srcY = srcRect.top  + (srcRect.height || 0) / 2;
    var tgtX = tgtRect.left + tgtRect.width / 2;
    var tgtY = tgtRect.top  + tgtRect.height / 2;
    var deltaX = tgtX - srcX;
    var deltaY = tgtY - srcY;

    // Team accent — parse hex to RGB for rgba() opacity control
    var teamHex = (hTeam.accent || '#EBB010').replace('#', '');
    if (teamHex.length === 3) teamHex = teamHex.split('').map(function(c){return c+c;}).join('');
    var tR = parseInt(teamHex.substring(0,2), 16);
    var tG = parseInt(teamHex.substring(2,4), 16);
    var tB = parseInt(teamHex.substring(4,6), 16);
    if (isNaN(tR)) { tR = 235; tG = 176; tB = 16; }
    var teamAccent = 'rgb(' + tR + ',' + tG + ',' + tB + ')';
    var teamRgbStr = tR + ',' + tG + ',' + tB;

    // ── Fly element: Stacked Flame +N popup styling ──
    var fly = document.createElement('div');
    fly.className = 'T-torch-fly-hero';
    fly.style.cssText =
      'position:fixed;' +
      'left:' + srcX + 'px;top:' + srcY + 'px;' +
      'transform:translate(-50%,-50%) scale(0.6);' +
      'z-index:9999;' +
      "font-family:'Teko',sans-serif;font-weight:900;font-size:44px;line-height:0.9;letter-spacing:2px;" +
      'color:#FFE080;pointer-events:none;opacity:0;white-space:nowrap;' +
      'text-shadow:' +
        '0 0 6px #FFE080,' +
        '0 0 14px rgba(235,176,16,0.75),' +
        '0 -2px 14px rgba(255,69,17,0.6),' +
        '0 -4px 22px rgba(255,34,0,0.45),' +
        '0 0 32px rgba(' + teamRgbStr + ',0.4),' +
        '0 4px 10px rgba(0,0,0,0.9);';
    fly.textContent = '+' + pts;
    document.body.appendChild(fly);

    // ── Embers: 5 sparks in team color, positioned along the flight path ──
    var emberEls = [];
    for (var i = 0; i < 5; i++) {
      var t = 0.2 + i * 0.15;
      var eX = srcX + deltaX * t + (Math.random() - 0.5) * 12;
      var eY = srcY + deltaY * t + (Math.random() - 0.5) * 8;
      var ember = document.createElement('div');
      ember.style.cssText =
        'position:fixed;' +
        'left:' + eX + 'px;top:' + eY + 'px;' +
        'width:4px;height:4px;border-radius:50%;' +
        'background:' + teamAccent + ';' +
        'box-shadow:0 0 8px ' + teamAccent + ',0 0 3px rgba(255,255,255,0.7);' +
        'z-index:9998;opacity:0;pointer-events:none;';
      document.body.appendChild(ember);
      emberEls.push(ember);
    }

    // ── Impact flash: team-colored blur behind the banner on arrival ──
    var impact = document.createElement('div');
    impact.style.cssText =
      'position:fixed;' +
      'left:' + (tgtRect.left - 10) + 'px;' +
      'top:'  + (tgtRect.top  - 6)  + 'px;' +
      'width:'  + (tgtRect.width  + 20) + 'px;' +
      'height:' + (tgtRect.height + 12) + 'px;' +
      'border-radius:6px;' +
      'background:' + teamAccent + ';' +
      'z-index:9997;opacity:0;filter:blur(6px);pointer-events:none;';
    document.body.appendChild(impact);

    function cleanup() {
      if (fly.parentNode) fly.remove();
      if (impact.parentNode) impact.remove();
      emberEls.forEach(function(e) { if (e.parentNode) e.remove(); });
    }

    try {
      var tl = gsap.timeline({
        onComplete: function() {
          cleanup();
          _torchDisplayFrozen = false;
          animateTorchBannerPts(pts);
          Haptic.cardTap();
          if (onDone) onDone();
        },
      });

      // Puff in at source
      tl.to(fly, { opacity: 1, scale: 1.15, duration: 0.18, ease: 'power2.out' });
      // Streak to target — power2.in gives natural acceleration toward arrival
      tl.to(fly, {
        x: deltaX, y: deltaY,
        scale: 1.2,
        duration: 0.75,
        ease: 'power2.in',
      });
      // Fade out at arrival
      tl.to(fly, { opacity: 0, scale: 0.5, duration: 0.12, ease: 'power2.in' }, '-=0.04');

      // Embers: fade in staggered along the path, then fall and fade
      emberEls.forEach(function(ember, idx) {
        gsap.fromTo(ember,
          { opacity: 0, scale: 0.4 },
          {
            opacity: 0.95, scale: 1,
            duration: 0.2,
            delay: 0.22 + idx * 0.08,
            ease: 'power2.out',
            onComplete: function() {
              gsap.to(ember, {
                y: '+=52', x: '-=6', opacity: 0, scale: 0.35,
                duration: 0.75,
                ease: 'power1.in',
              });
            },
          }
        );
      });

      // Impact flash on arrival — pulse in at end of streak, fade out
      gsap.to(impact, {
        opacity: 0.5,
        scale: 1.25,
        duration: 0.14,
        delay: 0.86,
        ease: 'power2.out',
      });
      gsap.to(impact, {
        opacity: 0,
        scale: 1.4,
        duration: 0.24,
        delay: 1.0,
        ease: 'power2.in',
      });

      // Audio cue on arrival — subtle chime
      setTimeout(function() { try { SND.chime(); } catch(e) {} }, 880);
    } catch(e) {
      cleanup();
      _torchDisplayFrozen = false;
      drawTorchBanner();
      if (onDone) onDone();
    }
  }

  /** Screen shake */
  function shakeScreen(frames = 4) {
    el.classList.add('T-shaking');
    el.style.animationDuration = (frames * 0.1) + 's';
    setTimeout(function() { el.classList.remove('T-shaking'); }, frames * 100);
  }

  /**
   * Pressure predicate — true if the current snap is high-stakes.
   * Used by both the heartbeat haptic pulse (at snap commit) and the
   * snap button heartbeat animation (during card selection).
   */
  function isPressureSnap() {
    var d = gs.down, dist = gs.distance;
    var ytg = (typeof gs.yardsToEndzone === 'function') ? gs.yardsToEndzone() : gs.yardsToEndzone;
    var margin = Math.abs((gs.ctScore || 0) - (gs.irScore || 0));
    var inFinal = (gs.half === 2 && gs.playsThisHalf >= 14) || gs.twoMinActive;
    var thirdLong   = d >= 3 && dist >= 7;
    var fourthDown  = d === 4;
    var goalToGo    = ytg <= 5;
    var clutchTime  = inFinal && margin <= 8;
    return thirdLong || fourthDown || goalToGo || clutchTime;
  }

  /**
   * Trophy stamp — slams a labeled SVG badge onto the field on big defensive plays.
   * Uses game-icons (game-icons.net via torchCardIcons.js).
   * Fires only when user is on DEFENSE forcing a positive event.
   *
   * type: 'pickedOff' | 'strip' | 'sack' | 'stand'
   */
  function triggerTrophyStamp(type, defenderName) {
    var iconKey, label, color;
    if (type === 'pickedOff')      { iconKey = 'pickSix';    label = 'PICKED OFF'; color = '#EBB010'; }
    else if (type === 'strip')     { iconKey = 'truckStick'; label = 'STRIP!';     color = '#EBB010'; }
    else if (type === 'sack')      { iconKey = 'dominance';  label = 'TAKEDOWN';   color = '#FF4511'; }
    else if (type === 'stand')     { iconKey = 'ironWall';   label = 'STAND';      color = '#00ff44'; }
    else return;

    try {
      // Stamp container — slams to center
      var stamp = document.createElement('div');
      stamp.style.cssText =
        'position:absolute;top:50%;left:50%;z-index:30;pointer-events:none;' +
        'display:flex;flex-direction:column;align-items:center;gap:4px;' +
        'animation:T-trophy-slam 0.55s cubic-bezier(0.22,1.4,0.36,1) both;';

      // Outer ring
      var ring = document.createElement('div');
      ring.style.cssText =
        'width:140px;height:140px;border-radius:50%;' +
        'display:flex;align-items:center;justify-content:center;' +
        'background:radial-gradient(circle,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.6) 70%,transparent 100%);' +
        'border:3px solid ' + color + ';' +
        'box-shadow:0 0 40px ' + color + 'cc, inset 0 0 30px ' + color + '44;';
      var icon = renderTorchCardIcon(iconKey, 84, color);
      if (icon) ring.appendChild(icon);
      stamp.appendChild(ring);

      // Label
      var labelEl = document.createElement('div');
      labelEl.style.cssText =
        "font-family:'Teko';font-weight:900;font-size:32px;color:" + color + ";" +
        "letter-spacing:4px;text-shadow:0 0 16px " + color + "cc, 0 4px 12px rgba(0,0,0,0.95);" +
        "text-transform:uppercase;line-height:1;";
      labelEl.textContent = label;
      stamp.appendChild(labelEl);

      // Defender name
      if (defenderName) {
        var nameEl = document.createElement('div');
        nameEl.style.cssText =
          "font-family:'Rajdhani';font-weight:700;font-size:13px;color:#fff;letter-spacing:2px;" +
          "text-shadow:0 2px 6px rgba(0,0,0,0.95);";
        nameEl.textContent = defenderName.toUpperCase();
        stamp.appendChild(nameEl);
      }

      el.appendChild(stamp);

      // Dust kick — particles spraying out from impact point
      for (var di = 0; di < 14; di++) {
        var dust = document.createElement('div');
        var dx = (Math.random() - 0.5) * 200;
        dust.style.cssText =
          'position:absolute;top:50%;left:50%;width:6px;height:6px;border-radius:50%;' +
          'background:rgba(200,180,140,0.7);z-index:29;pointer-events:none;' +
          '--dx:' + dx + 'px;animation:T-trophy-dust ' + (500 + Math.random() * 300) + 'ms ease-out forwards;';
        el.appendChild(dust);
        (function(d) { setTimeout(function() { if (d.parentNode) d.remove(); }, 900); })(dust);
      }

      // Audio + haptic
      try { SND.anvilImpact(); } catch(e) {}
      try { Haptic.bigHit(); } catch(e) {}

      // Hold, then fade out (~1.4s total)
      setTimeout(function() {
        stamp.style.animation = 'T-trophy-fade 0.45s ease-in both';
        setTimeout(function() { if (stamp.parentNode) stamp.remove(); }, 500);
      }, 1400);
    } catch(e) {}
  }

  /**
   * Pressure pulse — heartbeat haptic + red vignette breath on high-stakes downs.
   * Fires once at snap commit, ~600ms total. Uses navigator.vibrate via Haptic.heartbeat.
   * Returns true if pressure was triggered (so callers can sync audio if desired).
   */
  function triggerPressurePulse() {
    if (!isPressureSnap()) return false;

    // Haptic — double thump
    try { Haptic.heartbeat(); } catch(e) {}

    // Visual — red radial vignette breathes once
    try {
      var vig = document.createElement('div');
      vig.style.cssText =
        'position:absolute;inset:0;z-index:60;pointer-events:none;' +
        'background:radial-gradient(ellipse at center,transparent 35%,rgba(255,0,64,0.55) 100%);' +
        'opacity:0;animation:T-pressure-pulse 0.65s ease-out both;';
      el.appendChild(vig);
      setTimeout(function() { if (vig.parentNode) vig.remove(); }, 720);
    } catch(e) {}

    return true;
  }

  /** Color flash overlay on the field */
  /** Score change: old slides up/fades, new slides up with bounce + team flash + particles */
  function _animScoreChange(scoreEl, newScore, teamColor) {
    try {
      var container = scoreEl.parentElement;
      container.style.position = 'relative';
      container.style.overflow = 'hidden';
      // Clone old score for exit
      var exitEl = scoreEl.cloneNode(true);
      exitEl.style.position = 'absolute';
      exitEl.style.left = '0'; exitEl.style.right = '0';
      exitEl.style.top = '0';
      container.appendChild(exitEl);
      // Set new score below
      scoreEl.textContent = newScore;
      gsap.set(scoreEl, { y: 30, opacity: 0 });
      // Exit: old slides up
      gsap.to(exitEl, { y: -25, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: function() { exitEl.remove(); } });
      // Enter: new slides up with bounce
      gsap.to(scoreEl, { y: 0, opacity: 1, duration: 0.4, ease: 'back.out(2)', delay: 0.08 });
      // Team-colored neon flash behind score
      var flash = document.createElement('div');
      flash.style.cssText = 'position:absolute;inset:-4px;border-radius:4px;background:' + teamColor + ';opacity:0;pointer-events:none;z-index:-1;';
      container.appendChild(flash);
      gsap.to(flash, { opacity: 0.25, duration: 0.1, delay: 0.15, ease: 'power1.out', onComplete: function() { gsap.to(flash, { opacity: 0, duration: 0.6, onComplete: function() { flash.remove(); } }); } });
      // Gold spark particles
      var rect = scoreEl.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      for (var si = 0; si < 8; si++) {
        var sp = document.createElement('div');
        var spSz = 2 + Math.random() * 3;
        var spAngle = (Math.PI * 2 / 8) * si + (Math.random() * 0.5);
        var spDist = 15 + Math.random() * 25;
        sp.style.cssText = 'position:fixed;left:' + cx + 'px;top:' + cy + 'px;width:' + spSz + 'px;height:' + spSz + 'px;border-radius:50%;background:' + teamColor + ';pointer-events:none;z-index:1000;mix-blend-mode:screen;';
        document.body.appendChild(sp);
        gsap.to(sp, { x: Math.cos(spAngle) * spDist, y: Math.sin(spAngle) * spDist - 10, opacity: 0, duration: 0.5 + Math.random() * 0.3, ease: 'power2.out', onComplete: function() { sp.remove(); } });
      }
    } catch(e) { scoreEl.textContent = newScore; }
  }

  function flashField(color, duration = 600) {
    // Disabled as per user request
    return;
  }

  /** Radial pulse at ball position on the field strip */
  function fieldPulseAtBall(color) {
    // Disabled as per user request
    return;
  }

  /** Impact burst on the field */
  function impactBurst(color) {
    var imp = document.createElement('div');
    imp.className = 'T-impact';
    imp.style.background = color;
    imp.style.boxShadow = '0 0 30px ' + color;
    strip.appendChild(imp);
    setTimeout(function() { imp.remove(); }, 400);
  }

  // ── ONBOARDING SYSTEM — learn by doing ──
  var _onboardingActive = false; // true while a hint bubble is showing
  var _onboardingCooldown = false; // 500ms gap between hints
  var _onboardingSkipped = !!localStorage.getItem('torch_onboarding_complete');
  var _idleTimer = null;

  function shouldShowHint(key) {
    if (_onboardingSkipped) return false;
    if (_onboardingActive) return false;
    if (_onboardingCooldown) return false;
    if (localStorage.getItem(key)) return false;
    return true;
  }

  function showOnboardingBubble(targetEl, text, storageKey, opts) {
    opts = opts || {};
    if (!targetEl) return null;
    if (storageKey && !shouldShowHint(storageKey)) return null;
    _onboardingActive = true;

    // Spotlight overlay — pointer-events:none so taps pass through to the target
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:800;background:rgba(0,0,0,0.6);pointer-events:auto;';

    // Store original styles
    var origZ = targetEl.style.zIndex;
    var origPos = targetEl.style.position;
    var origPE = targetEl.style.pointerEvents;

    // Bubble
    var bubble = document.createElement('div');
    bubble.style.cssText = "position:fixed;z-index:802;max-width:260px;background:rgba(10,8,4,0.95);border:1px solid rgba(255,255,255,0.08);border-left:3px solid #FF4511;border-radius:8px;padding:10px 14px;box-shadow:0 8px 24px rgba(0,0,0,0.6);font-family:'Rajdhani';font-weight:600;font-size:13px;color:#fff;line-height:1.3;pointer-events:none;";
    bubble.textContent = text;

    // Position bubble near target
    document.body.appendChild(overlay);
    document.body.appendChild(bubble);

    requestAnimationFrame(function() {
      var rect = targetEl.getBoundingClientRect();
      var bw = bubble.offsetWidth;
      var bh = bubble.offsetHeight;
      var left = Math.max(12, Math.min(window.innerWidth - bw - 12, rect.left + rect.width / 2 - bw / 2));

      // Place above or below target
      if (rect.top > window.innerHeight / 2) {
        // Target is in lower half — bubble goes above
        bubble.style.top = (rect.top - bh - 12) + 'px';
      } else {
        // Target is in upper half — bubble goes below
        bubble.style.top = (rect.bottom + 12) + 'px';
      }
      bubble.style.left = left + 'px';

      try {
        gsap.from(bubble, { opacity: 0, y: 8, scale: 0.95, duration: 0.25, ease: 'back.out(1.5)' });
      } catch(e) {}
    });

    // Dismiss function
    var dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      _onboardingActive = false;
      if (storageKey) localStorage.setItem(storageKey, '1');
      targetEl.style.zIndex = origZ || '';
      targetEl.style.position = origPos || '';
      targetEl.style.pointerEvents = origPE || '';
      try {
        gsap.to(bubble, { opacity: 0, duration: 0.15, onComplete: function() { if (bubble.parentNode) bubble.remove(); } });
      } catch(e) { if (bubble.parentNode) bubble.remove(); }
      if (overlay.parentNode) overlay.remove();
      // Cooldown
      _onboardingCooldown = true;
      setTimeout(function() { _onboardingCooldown = false; }, 500);
    }

    overlay.onclick = dismiss;

    // Auto-dismiss option
    if (opts.autoDismiss) {
      setTimeout(dismiss, opts.autoDismiss);
    }

    return { dismiss: dismiss };
  }

  // Skip tutorial button (persistent during first game)
  if (!_onboardingSkipped) {
    var skipBtn = document.createElement('div');
    skipBtn.style.cssText = "position:fixed;top:8px;right:12px;z-index:810;font-family:'Rajdhani';font-weight:600;font-size:9px;color:#555;letter-spacing:1px;cursor:pointer;padding:6px;";
    skipBtn.textContent = 'SKIP TUTORIAL';
    skipBtn.onclick = function() {
      localStorage.setItem('torch_onboarding_complete', '1');
      _onboardingSkipped = true;
      skipBtn.remove();
      // Dismiss any active bubble
      _onboardingActive = false;
      document.querySelectorAll('[style*="z-index:800"]').forEach(function(ov) { ov.remove(); });
      document.querySelectorAll('[style*="z-index:802"]').forEach(function(b) { b.remove(); });
    };
    el.appendChild(skipBtn);
  }

  /** Flame badge CONTINUE button — shared across overlays */
  function _flameBadgeContinue(text, onTap) {
    var btn = document.createElement('button');
    btn.style.cssText = "width:80%;max-width:300px;padding:0;border:none;border-radius:6px;background:linear-gradient(180deg,#EBB010,#FF4511);display:flex;align-items:stretch;overflow:hidden;cursor:pointer;box-shadow:0 4px 16px rgba(255,69,17,0.3),0 0 20px rgba(235,176,16,0.15);margin-top:16px;";
    btn.innerHTML =
      '<div style="background:rgba(0,0,0,0.2);padding:10px 12px;display:flex;align-items:center;justify-content:center;border-right:1px solid rgba(0,0,0,0.15);">' +
        flameSilhouetteSVG(18, '#fff') +
      '</div>' +
      "<div style=\"flex:1;padding:12px;font-family:'Teko';font-weight:700;font-size:18px;color:#fff;letter-spacing:4px;text-align:center;text-shadow:0 2px 4px rgba(0,0,0,0.3);line-height:1;\">" + (text || 'CONTINUE') + '</div>';
    btn.onclick = function(e) { e.stopPropagation(); if (onTap) onTap(); };
    return btn;
  }

  /** Show AI torch card usage announcement */
  function showAITorchCardUsed(cardName) {
    var _atcOv = document.createElement('div');
    _atcOv.style.cssText = "position:fixed;top:15%;left:50%;transform:translateX(-50%);z-index:660;text-align:center;pointer-events:none;opacity:0;";
    _atcOv.innerHTML =
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:9px;color:#ff0040;letter-spacing:2px;margin-bottom:2px;\">OPPONENT USED</div>" +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:20px;color:#ff0040;letter-spacing:3px;text-shadow:0 0 12px rgba(255,0,64,0.5);\">" + (cardName || '').toUpperCase() + "</div>";
    el.appendChild(_atcOv);
    try {
      gsap.to(_atcOv, { opacity: 1, duration: 0.2 });
      gsap.to(_atcOv, { opacity: 0, y: -10, duration: 0.3, delay: 1.5, onComplete: function() { _atcOv.remove(); } });
    } catch(e) { setTimeout(function() { _atcOv.remove(); }, 2000); }
    Haptic.cardSelect();
  }

  /** Stat milestone toast */
  function _checkMilestone(playerId) {
    var s = _playerGameStats[playerId];
    if (!s) return;
    var roster = getOffenseRoster(GS.team).concat(getDefenseRoster(GS.team));
    var player = roster.find(function(p) { return p.id === playerId; });
    if (!player) return;
    var name = player.firstName || player.name.split(' ')[0];
    var milestone = null;
    if (s.rushYds && s.rushYds >= 100 && !s._rush100) { s._rush100 = true; milestone = name + ': 100 RUSHING YARDS'; }
    else if (s.passYds && s.passYds >= 200 && !s._pass200) { s._pass200 = true; milestone = name + ': 200 PASSING YARDS'; }
    else if (s.recYds && s.recYds >= 100 && !s._rec100) { s._rec100 = true; milestone = name + ': 100 RECEIVING YARDS'; }
    else if (s.td && s.td >= 2 && !s._td2) { s._td2 = true; milestone = name + ': 2 TOUCHDOWNS'; }
    else if (s.td && s.td >= 3 && !s._td3) { s._td3 = true; milestone = name + ': 3 TOUCHDOWNS'; }
    if (milestone) {
      var _msToast = document.createElement('div');
      _msToast.style.cssText = "position:fixed;bottom:18%;left:50%;transform:translateX(-50%);z-index:660;padding:6px 14px;background:rgba(10,8,4,0.9);border:1px solid #EBB01044;border-radius:6px;pointer-events:none;opacity:0;white-space:nowrap;";
      _msToast.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#EBB010;letter-spacing:2px;text-align:center;\">" + milestone + "</div>";
      el.appendChild(_msToast);
      try {
        gsap.to(_msToast, { opacity: 1, y: -5, duration: 0.3, ease: 'back.out(1.5)' });
        gsap.to(_msToast, { opacity: 0, y: -15, duration: 0.4, delay: 2.0, onComplete: function() { _msToast.remove(); } });
        SND.chime();
      } catch(e) { setTimeout(function() { _msToast.remove(); }, 2500); }
    }
  }


  /** Stacked flex column result on field strip */
  function showFieldResult(heroText, heroColor, opts) {
    opts = opts || {};
    var container = document.createElement('div');
    container.style.cssText = 'position:absolute;inset:0;z-index:15;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;gap:4px;';

    // Hero text
    var hero = document.createElement('div');
    if (opts.chromeGradient) {
      hero.style.cssText = "font-family:'Teko';font-weight:900;font-size:" + (opts.heroSize || 56) + "px;letter-spacing:3px;line-height:1;background:" + opts.chromeGradient + ";-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 24px " + heroColor + "99) drop-shadow(0 6px 12px rgba(0,0,0,0.9));opacity:0;transform:scale(0.3);";
    } else {
      hero.style.cssText = "font-family:'Teko';font-weight:900;font-size:" + (opts.heroSize || 56) + "px;color:" + heroColor + ";letter-spacing:3px;line-height:1;text-shadow:0 0 20px " + heroColor + "60,0 2px 6px rgba(0,0,0,0.8);opacity:0;transform:scale(0.3);";
    }
    hero.textContent = heroText;
    container.appendChild(hero);

    // Context label
    if (opts.contextText) {
      var ctx = document.createElement('div');
      ctx.style.cssText = "font-family:'Oswald';font-weight:700;font-size:12px;color:" + (opts.contextColor || heroColor) + ";letter-spacing:3px;text-shadow:0 2px 4px rgba(0,0,0,0.8);opacity:0;transform:translateY(8px);";
      ctx.textContent = opts.contextText;
      container.appendChild(ctx);
    }

    // Divider
    if (opts.showDivider) {
      var div = document.createElement('div');
      div.style.cssText = "width:60px;height:1px;background:linear-gradient(90deg,transparent," + heroColor + "44,transparent);transform:scaleX(0);margin:4px 0;";
      container.appendChild(div);
    }

    // Commentary
    if (opts.commentary) {
      var comm = document.createElement('div');
      comm.style.cssText = "font-family:'Rajdhani';font-weight:600;font-size:12px;color:rgba(255,255,255,0.6);text-shadow:0 2px 4px rgba(0,0,0,0.8);max-width:280px;text-align:center;opacity:0;transform:translateY(6px);";
      comm.textContent = opts.commentary;
      container.appendChild(comm);
    }

    // TORCH points
    if (opts.torchPts && opts.torchPts > 0) {
      var pts = document.createElement('div');
      pts.style.cssText = "display:flex;align-items:center;gap:4px;opacity:0;transform:translateY(10px) scale(0.8);";
      pts.innerHTML = flameSilhouetteSVG(18, '#EBB010') +
        "<span style=\"font-family:'Teko';font-weight:700;font-size:18px;color:#EBB010;text-shadow:0 0 8px rgba(235,176,16,0.4);letter-spacing:1px;\">+" + opts.torchPts + "</span>";
      container.appendChild(pts);
    }

    // Down update
    if (opts.downText) {
      var dn = document.createElement('div');
      dn.style.cssText = "font-family:'Teko';font-weight:700;font-size:16px;color:" + (opts.downColor || '#FF6B00') + ";letter-spacing:2px;opacity:0;transform:translateY(6px);margin-top:2px;";
      dn.textContent = opts.downText;
      container.appendChild(dn);
    }

    strip.appendChild(container);

    // GSAP stagger animation
    try {
      var children = container.children;
      var delays = [0, 0.15, 0.25, 0.35, 0.5, 0.6];
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var d = delays[i] || (0.6 + i * 0.1);
        if (i === 0) { // Hero — scale bounce
          gsap.to(child, { opacity: 1, scale: 1, duration: 0.25, delay: d, ease: 'back.out(2.5)' });
        } else if (child.style.transform.indexOf('scaleX') >= 0) { // Divider
          gsap.to(child, { scaleX: 1, duration: 0.3, delay: d, ease: 'power2.out' });
        } else { // Everything else — slide up
          gsap.to(child, { opacity: 1, y: 0, scale: 1, duration: 0.2, delay: d, ease: 'power2.out' });
        }
      }
    } catch(e) {
      // Fallback: show everything immediately
      for (var j = 0; j < container.children.length; j++) {
        container.children[j].style.opacity = '1';
        container.children[j].style.transform = 'none';
      }
    }

    // Effects
    if (opts.effects) {
      if (opts.effects.flash) flashField(opts.effects.flash);
      if (opts.effects.shake) shakeScreen(opts.effects.shakeAmt || 4);
      if (opts.effects.burst) impactBurst(opts.effects.burst);
    }

    // Cleanup — use raw setTimeout (not _setTimeout) so visual cleanup
    // is never blocked by the screen-exit timer registry
    var dur = opts.duration || 1800;
    setTimeout(function() {
      try {
        gsap.to(container, { opacity: 0, duration: 0.4, onComplete: function() { if (container.parentNode) container.remove(); } });
      } catch(e) { if (container.parentNode) container.remove(); }
    }, dur);
    // Safety: force-remove after max display time regardless
    setTimeout(function() { if (container.parentNode) container.remove(); }, dur + 600);

    return container;
  }

  /** 5-Tier Celebration System — effects only (flash, shake, burst, sound, bg fade) */
  function triggerCelebration(tier, r, isDef) {
    if (tier === 1) return;

    if (tier === 2) {
      SND.hit();
      setTimeout(function(){ try { SND.helmetImpact(); } catch(e) {} }, 35);
      flashField(isDef ? 'rgba(48,192,224,0.4)' : 'rgba(61,245,138,0.4)', 400);
      return;
    }

    if (tier === 3) {
      SND.bigPlay();
      shakeScreen(4);
      flashField(isDef ? 'rgba(224,48,80,0.3)' : 'rgba(200,160,48,0.3)', 600);
      impactBurst(isDef ? 'rgba(224,48,80,0.4)' : 'rgba(200,160,48,0.4)');
      return;
    }

    if (tier >= 4) {
      var tDuration = tier === 5 ? 4500 : 3000;

      if (tier === 5) {
        var bgFade = document.createElement('div');
        bgFade.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:90;transition:opacity 0.5s;pointer-events:none;';
        el.appendChild(bgFade);
        setTimeout(function() { bgFade.style.opacity = '0'; setTimeout(function() { bgFade.remove(); }, 500); }, tDuration - 1000);
      }

      if (r.isTouchdown) {
        try { SND.anvilImpact(); } catch(e) {}
        setTimeout(function() { try { SND.td(); } catch(e) {} }, 100);
        if (tier === 5) { setTimeout(function() { try { SND.horn(); } catch(e) {} }, 400); }
        shakeScreen(6);
        var tColor = isDef ? '#ff0040' : '#00ff44';
        flashField(tColor + '88', 800);
        setTimeout(function() { flashField(tColor + '88', 800); }, 400);
      } else if (r.isInterception) {
        var intGood = isDef;
        SND.turnover();
        shakeScreen(intGood ? 8 : 5);
        flashField(intGood ? 'rgba(0,255,68,0.5)' : 'rgba(224,48,80,0.6)', 800);
        impactBurst(intGood ? 'rgba(0,255,68,0.6)' : 'rgba(224,48,80,0.8)');
      } else if (r.isFumbleLost) {
        var fumGood = isDef;
        SND.turnover();
        shakeScreen(fumGood ? 7 : 4);
        flashField(fumGood ? 'rgba(0,255,68,0.5)' : 'rgba(224,96,32,0.6)', 800);
        if (fumGood) impactBurst('rgba(0,255,68,0.6)');
      } else if (r.isSack) {
        SND.sack();
        shakeScreen(8);
        flashField('rgba(224,48,80,0.5)', 600);
        impactBurst('rgba(255,255,255,0.6)');
      } else {
        SND.turnover();
        shakeScreen(6);
        flashField('rgba(48,192,224,0.6)', 800);
      }
    }
  }

  // ── DRAG HANDLING ──
  let dragItem = null; // { type:'player'|'play', data: obj, ghost: el }

  function startDrag(type, data, sourceEl, e) {
    if (phase === 'busy') return;
    var touch = e.touches ? e.touches[0] : e;
    var rect = sourceEl.getBoundingClientRect();
    var ghost = sourceEl.cloneNode(true);
    ghost.className = 'T-drag-ghost';
    ghost.style.width = rect.width + 'px';
    ghost.style.left = (touch.clientX - rect.width/2) + 'px';
    ghost.style.top = (touch.clientY - rect.height/2) + 'px';
    document.body.appendChild(ghost);
    dragItem = { type: type, data: data, ghost: ghost };
    sourceEl.style.opacity = '0.3';
    dragItem._source = sourceEl;
  }

  function moveDrag(e) {
    if (!dragItem) return;
    e.preventDefault();
    var touch = e.touches ? e.touches[0] : e;
    dragItem.ghost.style.left = (touch.clientX - dragItem.ghost.offsetWidth/2) + 'px';
    dragItem.ghost.style.top = (touch.clientY - dragItem.ghost.offsetHeight/2) + 'px';
    // Highlight matching drop zone
    var drops = strip.querySelectorAll('.T-drop');
    drops.forEach(function(dz) {
      var r = dz.getBoundingClientRect();
      var over = touch.clientX >= r.left && touch.clientX <= r.right && touch.clientY >= r.top && touch.clientY <= r.bottom;
      dz.classList.toggle('T-drop-hover', over && dz.dataset.drop === dragItem.type);
    });
  }

  function endDrag(e) {
    if (!dragItem) return;
    var touch = e.changedTouches ? e.changedTouches[0] : e;
    dragItem.ghost.remove();
    if (dragItem._source) dragItem._source.style.opacity = '';
    // Check if dropped on matching zone
    var drops = strip.querySelectorAll('.T-drop');
    drops.forEach(function(dz) {
      dz.classList.remove('T-drop-hover');
      var r = dz.getBoundingClientRect();
      var hit = touch.clientX >= r.left && touch.clientX <= r.right && touch.clientY >= r.top && touch.clientY <= r.bottom;
      if (hit && dz.dataset.drop === dragItem.type) {
        SND.cardSnap();
        if (dragItem.type === 'play') { selPl = dragItem.data; phase = (selPl && selP) ? (torchInventory.length > 0 ? 'torch' : 'ready') : (selPl ? 'player' : 'play'); }
        else if (dragItem.type === 'player') { selP = dragItem.data; phase = (selPl && selP) ? (torchInventory.length > 0 ? 'torch' : 'ready') : 'play'; }
        else if (dragItem.type === 'torch') {
          selTorch = dragItem.data.id || dragItem.data;
          selectedPreSnap = dragItem.data;
          var tidx = torchInventory.indexOf(dragItem.data);
          if (tidx >= 0) torchInventory.splice(tidx, 1);
          if (GS.season) GS.season.torchCards = torchInventory.slice();
          phase = 'ready';
        }
        drawField();
        drawPanel();
      }
    });
    dragItem = null;
  }

  document.addEventListener('mousemove', moveDrag);
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchmove', moveDrag, { passive: false });
  document.addEventListener('touchend', endDrag);

  // ── SITUATIONAL HINT ──
  function getSituationalHint(gs) {
    var s = gs.getSummary();
    var isOff = gs.possession === hAbbr;
    if (!isOff) {
      if (s.yardsToEndzone <= 10) return { text: 'RED ZONE DEFENSE', color: '#ff0040' };
      if (s.down >= 3 && s.distance >= 8) return { text: 'PASSING SITUATION \u2014 BRING PRESSURE', color: '#4DA6FF' };
      if (s.down >= 3 && s.distance <= 3) return { text: 'SHORT YARDAGE \u2014 STACK THE BOX', color: '#EBB010' };
      return null;
    }
    if (s.yardsToEndzone <= 5) return { text: 'GOAL LINE \u2014 POWER RUNS OR QUICK PASSES', color: '#00ff44' };
    if (s.yardsToEndzone <= 20) return { text: 'RED ZONE \u2014 HIGH PERCENTAGE PLAYS', color: '#EBB010' };
    if (s.down === 1) return null;
    if (s.down === 2 && s.distance <= 4) return { text: 'SHORT YARDAGE \u2014 RUNS ARE STRONG', color: '#00ff44' };
    if (s.down === 3 && s.distance <= 3) return { text: '3RD & SHORT \u2014 RUN OR QUICK PASS', color: '#EBB010' };
    if (s.down === 3 && s.distance >= 8) return { text: '3RD & LONG \u2014 NEED A BIG PLAY', color: '#ff0040' };
    if (s.down === 4) return { text: '4TH DOWN \u2014 HIGH STAKES', color: '#ff0040' };
    return null;
  }

  // ── RENDER PANEL ──
  function drawPanel() {
    panel.innerHTML = '';
    // Dim scorebug during selection, restore during snap
    if (phase === 'busy') bug.classList.remove('T-sb-dim');
    else bug.classList.add('T-sb-dim');
    const isOff = gs.possession === hAbbr;
    const sides = gs.getCurrentSides();
    // Filter out OL/DL — only show skill position players, then take 4
    var allPlayers = isOff ? sides.offPlayers : sides.defPlayers;
    var skillPlayers = allPlayers.filter(function(p) { return p.pos !== 'OL' && p.pos !== 'DL'; });
    var players = skillPlayers.length >= 4 ? skillPlayers.slice(0, 4) : allPlayers.slice(0, 4);
    var plays = isOff ? sides.offHand : sides.defHand;
    // Safety: ensure hand has cards (refill from full pool if empty/short)
    if (!plays || plays.length < 3) {
      var fullPool = isOff ? getOffCards(GS.team) : getDefCards(GS.team);
      plays = fullPool.slice(0, 4);
      if (isOff) sides.offHand = plays; else sides.defHand = plays;
    }
    // Hide panel during play-by-play so commentary sits directly under field
    if (phase === 'busy') { panel.className = 'T-panel T-panel-hidden'; return; }
    panel.className = 'T-panel ' + (isOff ? 'T-panel-off' : 'T-panel-def');

    // Panel header — slot status indicator
    var panelHdr = document.createElement('div');
    var _sideColor = isOff ? '#00ff44' : '#4DA6FF';

    // Build slot indicator pills
    var _slotPlay = selPl
      ? "background:rgba(0,255,68,0.08);border:1px solid rgba(0,255,68,0.2);color:rgba(0,255,68,0.6);"
      : "background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.15);";
    var _slotPlayer = selP
      ? "background:rgba(77,166,255,0.08);border:1px solid rgba(77,166,255,0.2);color:rgba(77,166,255,0.6);"
      : "background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.15);";
    var _slotTorch = selectedPreSnap
      ? "background:rgba(255,69,17,0.08);border:1px solid rgba(255,69,17,0.2);color:rgba(255,69,17,0.6);"
      : "background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.15);";
    var _slotStyle = "display:inline-flex;align-items:center;padding:3px 10px;border-radius:4px;font-family:'Rajdhani';font-weight:700;font-size:8px;letter-spacing:1.5px;";

    panelHdr.style.cssText = 'display:flex;align-items:center;justify-content:center;padding:6px 12px;background:linear-gradient(90deg,' + _sideColor + '04,transparent 40%);border-top:2px solid ' + _sideColor + '44;border-bottom:1px solid rgba(255,255,255,0.08);flex-shrink:0;position:relative;';
    panelHdr.innerHTML =
      '<div style="display:flex;align-items:center;gap:6px;">' +
        '<div style="' + _slotStyle + _slotPlay + '">PLAY</div>' +
        '<div style="' + _slotStyle + _slotPlayer + '">PLAYER</div>' +
        '<div style="' + _slotStyle + _slotTorch + '">TORCH</div>' +
      '</div>';
    panel.appendChild(panelHdr);

    // 2min check + close game crowd
    if (gs.twoMinActive && !prev2min) { prev2min = true; _lastPlayFlashed = true; el.classList.add('T-urgent'); el.classList.add('T-2min-active'); show2MinWarn(); start2MinClock(); }
    if (gs.twoMinActive && Math.abs(gs.ctScore - gs.irScore) <= 7) {
      try { AudioStateManager.setCrowdIntensity(0.85, 0.5); } catch(e) {}
    }

    // LAST PLAY flash — fires once when playsUsed hits 19 (last regular play before 2-min drill)
    if (gs.playsUsed === 19 && !gs.twoMinActive && !_lastPlayFlashed && phase === 'play') {
      _lastPlayFlashed = true;
      var lpFlash = document.createElement('div');
      lpFlash.style.cssText = "position:fixed;top:30%;left:50%;transform:translateX(-50%);z-index:650;font-family:'Teko';font-weight:700;font-size:24px;color:#ff0040;letter-spacing:4px;text-shadow:0 0 16px rgba(255,0,64,0.5);pointer-events:none;opacity:0;";
      lpFlash.textContent = 'LAST PLAY';
      el.appendChild(lpFlash);
      try {
        gsap.to(lpFlash, { opacity: 1, duration: 0.3, ease: 'back.out(1.5)' });
        gsap.to(lpFlash, { opacity: 0, y: -15, duration: 0.4, delay: 1.2, onComplete: function() { lpFlash.remove(); } });
      } catch(e) { setTimeout(function() { lpFlash.remove(); }, 2000); }
    }

    // 4th down decision bar — appears ABOVE cards so player sees it first
    var is4thPastMid = gs.down === 4 && isOff && gs.canSpecialTeams() && !conversionMode && !_fourthDownDecided;
    if (is4thPastMid && phase === 'play') {
      var fourthBar = document.createElement('div');
      var ydsToEz = gs.yardsToEndzone();
      fourthBar.style.cssText = "display:flex;flex-direction:column;gap:6px;padding:10px 12px;flex-shrink:0;border-top:2px solid #e0305044;animation:urgentPulse 2s ease-in-out infinite;";

      // Header
      var fourthHdr = document.createElement('div');
      fourthHdr.style.cssText = 'text-align:center;margin-bottom:4px;';
      fourthHdr.innerHTML =
        "<div style=\"font-family:'Teko';font-weight:700;font-size:16px;color:#e03050;letter-spacing:3px;\">4TH DOWN DECISION</div>" +
        "<div style=\"font-family:'Rajdhani';font-weight:600;font-size:10px;color:#888;margin-top:2px;\">4th & " + (ydsToEz <= 10 ? 'Goal' : gs.distance) + " at " + (ydsToEz <= 50 ? 'OPP ' + ydsToEz : 'OWN ' + (100 - ydsToEz)) + "</div>";
      fourthBar.appendChild(fourthHdr);

      var goForIt = document.createElement('button');
      goForIt.style.cssText = "width:100%;padding:14px;border-radius:6px;border:none;cursor:pointer;margin-bottom:2px;background:linear-gradient(180deg," + hTeam.accent + "," + hTeam.accent + "88);box-shadow:0 4px 12px " + hTeam.accent + "33;font-family:'Teko';font-weight:700;font-size:22px;color:#fff;letter-spacing:4px;text-shadow:0 2px 4px rgba(0,0,0,0.3);";
      goForIt.textContent = 'GO FOR IT';
      goForIt.onclick = function() {
        SND.click();
        _fourthDownDecided = true;  // flag to hide the bar on redraw
        drawPanel();
      };

      var puntBtn = document.createElement('button');
      var stRow = document.createElement('div');
      stRow.style.cssText = 'display:flex;gap:6px;';
      puntBtn.style.cssText = "flex:1;padding:10px;border-radius:6px;text-align:center;cursor:pointer;border:1.5px solid #4DA6FF44;background:linear-gradient(180deg,#4DA6FF08,transparent);font-family:'Teko';font-weight:700;font-size:16px;color:#4DA6FF;letter-spacing:2px;";
      puntBtn.textContent = 'PUNT';
      puntBtn.onclick = function() {
        if (SND.snap) SND.snap(); else if (SND.click) SND.click();
        phase = 'busy';
        showSTSelect(el, {
          title: 'PUNT',
          subtitle: '4TH & ' + gs.distance,
          stType: 'punt',
          deck: _humanSTDeck,
          primaryRating: 'kickPower',
          primaryLabel: 'PWR',
          team: hTeam,
          onCancel: function() { phase = 'play'; drawPanel(); },
          onSelect: function(punter) {
            var prevPoss = gs.possession;
            SND.kickThud();
            // Check for ST torch cards: COFFIN CORNER, FAIR CATCH GHOST
            var puntOpts = {};
            var ccIdx = torchInventory.findIndex(function(c) { return c.id === 'coffin_corner'; });
            if (ccIdx >= 0) { puntOpts.coffinCorner = true; consumeTorchCard('coffin_corner'); torchCardToast('COFFIN CORNER', 'Punt guaranteed inside the 10'); }
            var fcIdx = torchInventory.findIndex(function(c) { return c.id === 'fair_catch_ghost'; });
            if (fcIdx >= 0) { puntOpts.fairCatchGhost = true; consumeTorchCard('fair_catch_ghost'); torchCardToast('FAIR CATCH GHOST', 'Forced fair catch'); }
            var puntResult = gs.punt(punter, puntOpts);
            burnPlayer(_humanSTDeck, punter, 'punter', puntResult.gross + '-yard punt');
            driveSummaryLog.push({ down: 4, dist: gs.distance, playName: puntResult.label, yards: 0, isUserOff: true });
            pushTicker('PUNT — ' + puntResult.label, '#4DA6FF');
            var _puntType = puntResult.blocked ? 'blocked_punt' : 'punt';
            showSpecialTeamsResult(puntResult.label, '#4DA6FF', function() {
              showDrive(driveSnaps, prevPoss, function() {
                driveSnaps = []; drivePlayHistory = []; resetDriveSummary();
                if (!checkEnd()) nextSnap();
              });
            }, _puntType);          }
        });
      };

      var fgBtn = document.createElement('button');
      var _hasCannonLeg = torchInventory.some(function(c) { return c.id === 'cannon_leg'; });
      var _hasRinger = torchInventory.some(function(c) { return c.id === 'ringer'; });
      if (gs.canAttemptFG(_hasCannonLeg)) {
        var fgDist = ydsToEz + 17;
        fgBtn.style.cssText = "flex:1;padding:10px;border-radius:6px;text-align:center;cursor:pointer;border:1.5px solid #EBB01044;background:linear-gradient(180deg,#EBB01008,transparent);font-family:'Teko';font-weight:700;font-size:16px;color:#EBB010;letter-spacing:2px;";
        fgBtn.textContent = 'FG (' + fgDist + 'yd)' + (_hasCannonLeg ? ' +10' : '');
        fgBtn.onclick = function() {
        if (SND.snap) SND.snap(); else if (SND.click) SND.click();
          phase = 'busy';
          // RINGER: use highest-star player regardless of deck
          if (_hasRinger) {
            var ringerIdx = torchInventory.findIndex(function(c) { return c.id === 'ringer'; });
            if (ringerIdx >= 0) { consumeTorchCard('ringer'); }
            var allPlayers = (isOff ? getOffenseRoster(GS.team) : getDefenseRoster(GS.team)).concat(isOff ? getDefenseRoster(GS.team) : getOffenseRoster(GS.team));
            var bestKicker = allPlayers.slice().sort(function(a, b) { return ((b.st && b.st.kickAccuracy) || 0) - ((a.st && a.st.kickAccuracy) || 0); })[0];
            if (bestKicker) {
              var prevPoss = gs.possession;
              SND.kickThud();
              var fgResult = gs.attemptFieldGoal(bestKicker);
              if (fgResult.made) { SND.kickGood(); _hFgMade++; }
              else { SND.goalPostClang(); setTimeout(function(){ SND.kickMiss(); }, 250); }
              burnPlayer(_humanSTDeck, bestKicker, 'kicker', 'RINGER ' + (fgResult.made ? 'Made ' : 'Missed ') + fgResult.distance + '-yard FG');
              driveSummaryLog.push({ down: 4, dist: gs.distance, playName: fgResult.label, yards: 0, isUserOff: true });
              var fgColor = fgResult.made ? '#00ff44' : '#ff0040';
              pushTicker('RINGER! FG ' + fgResult.distance + ' yds — ' + (fgResult.made ? 'GOOD' : 'NO GOOD'), fgColor);
              var _ringerFgType = fgResult.blocked ? 'blocked_fg' : (fgResult.made ? 'fg_good' : 'fg_miss');
              showSpecialTeamsResult('RINGER! ' + fgResult.label, fgColor, function() {
                showDrive(driveSnaps, prevPoss, function() {
                  driveSnaps = []; drivePlayHistory = []; resetDriveSummary();
                  if (!checkEnd()) nextSnap();
                });
              }, _ringerFgType);              return;
            }
          }
          // Show ST kicker selection
          showSTSelect(el, {
            title: 'FIELD GOAL ATTEMPT',
            subtitle: fgDist + '-YARD KICK',
            stType: 'fg',
            deck: _humanSTDeck,
            primaryRating: 'kickAccuracy',
            secondaryRating: 'kickPower',
            primaryLabel: 'ACC',
            secondaryLabel: 'PWR',
            team: hTeam,
            onCancel: function() { phase = 'play'; drawPanel(); },
            onSelect: function(kicker) {
              var prevPoss = gs.possession;
              SND.kickThud();
              // CANNON LEG: consume card if in inventory
              var clIdx = torchInventory.findIndex(function(c) { return c.id === 'cannon_leg'; });
              if (clIdx >= 0) { consumeTorchCard('cannon_leg'); torchCardToast('CANNON LEG', 'FG range extended +10 yards'); }
              var fgResult = gs.attemptFieldGoal(kicker);
              if (fgResult.made) { SND.kickGood(); _hFgMade++; }
              else { SND.goalPostClang(); setTimeout(function(){ SND.kickMiss(); }, 250); }
              var fgContext = (fgResult.made ? 'Made ' : 'Missed ') + fgResult.distance + '-yard FG';
              burnPlayer(_humanSTDeck, kicker, 'kicker', fgContext);
              driveSummaryLog.push({ down: 4, dist: gs.distance, playName: fgResult.label, yards: 0, isUserOff: true });
              var fgColor = fgResult.made ? '#00ff44' : '#ff0040';
              pushTicker('FG ' + fgResult.distance + ' yds — ' + (fgResult.made ? 'GOOD' : 'NO GOOD'), fgColor);
              var _humanFgType = fgResult.blocked ? 'blocked_fg' : (fgResult.made ? 'fg_good' : 'fg_miss');
              showSpecialTeamsResult(fgResult.label, fgColor, function() {
                showDrive(driveSnaps, prevPoss, function() {
                  driveSnaps = []; drivePlayHistory = []; resetDriveSummary();
                  if (!checkEnd()) nextSnap();
                });
              }, _humanFgType);            }
          });
        };
      } else {
        fgBtn.style.cssText = "flex:1;padding:10px;border-radius:6px;text-align:center;border:1.5px solid #1a1a1a;background:transparent;font-family:'Teko';font-weight:700;font-size:14px;color:#333;letter-spacing:1px;cursor:not-allowed;";
        fgBtn.textContent = 'OUT OF RANGE';
        fgBtn.disabled = true;
      }

      fourthBar.appendChild(goForIt);
      stRow.appendChild(puntBtn);
      stRow.appendChild(fgBtn);
      fourthBar.appendChild(stRow);
      panel.appendChild(fourthBar);

      // Onboarding: 4th down decision
      if (shouldShowHint('torch_hint_fourth_down')) {
        setTimeout(function() {
          showOnboardingBubble(fourthBar, '4th down — decision time. Go for it or play it safe.', 'torch_hint_fourth_down');
        }, 500);
      }
    }

    // ── 8-CARD TRAY (new component) ──
    var hs = getHandState();
    var preSnapCards = torchInventory.filter(function(c) { return c.type === 'pre-snap'; }).slice(0, 3);
    // hand = both sides, special_teams = auto-consumed only (never playable in snap phase)
    var offCats = ['amplification', 'information', 'hand'];
    var defCats = ['disruption', 'protection', 'hand'];
    var applicableCats = isOff ? offCats : defCats;
    var hasPlayableTorch = preSnapCards.some(function(c) { return c.category !== 'special_teams' && applicableCats.indexOf(c.category) >= 0; });
    var hS = hAbbr === 'CT' ? gs.ctScore : gs.irScore;
    var cS = hAbbr === 'CT' ? gs.irScore : gs.ctScore;

    // SCOUT REPORT: show all 7 players instead of just 4
    var trayPlayers = hs.playerHand;
    if (_scoutActive && isOff) {
      var fullRoster = getOffenseRoster(GS.team);
      trayPlayers = fullRoster.filter(function(p) { return !p.injured; });
    }

    var hint = FEATURES.smartHighlights ? getSituationalHint(gs) : null;
    if (hint && phase === 'play' && !selPl) {
      var hintEl = document.createElement('div');
      hintEl.style.cssText = "text-align:center;padding:3px 10px;font-family:'Rajdhani';font-weight:700;font-size:10px;color:" + hint.color + ";letter-spacing:1px;opacity:0.6;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:4px;display:inline-block;margin:0 auto;";
      hintEl.textContent = hint.text;
      panel.appendChild(hintEl);
    }

    var trayEl = renderCardTray({
      plays: hs.playHand,
      players: trayPlayers,
      selectedPlay: selPl,
      selectedPlayer: selP,
      isOffense: isOff,
      team: hTeam,
      teamId: GS.team,
      canDiscardPlays: canDiscard(hs, 'play'),
      canDiscardPlayers: canDiscard(hs, 'player'),
      torchCards: torchInventory.slice(0, 3),
      phase: phase,
      isConversion: !!conversionMode,
      is2Min: gs.twoMinActive,
      clockSeconds: gs.clockSeconds,
      offStar: offStar,
      offStarHot: offStarHot,
      defStar: defStar,
      defStarHot: defStarHot,
      momentumMap: isOff ? gs.offMomentumMap : gs.defMomentumMap,
      heatMap: isOff ? gs.offHeatMap : gs.defHeatMap,
      snapCount: snapCount,
      tutorialStep: _tutorialStep,
      selectedTorchCard: selectedPreSnap,
      down: gs.down,
      distance: gs.distance,
      is4thDownGo: gs.down === 4,
      pressureBeat: isPressureSnap(),
      yardsToEndzone: gs.yardsToEndzone(),
      playerGameStats: _playerGameStats,
      isNewDrive: _isNewDrive,
      onTogglePBP: function() {
        _pbpVisible = !_pbpVisible;
        driveSummaryEl.style.display = _pbpVisible ? '' : 'none';
      },
      onSelectPlay: function(play) {
        if (phase === 'busy') return;
        if (_idleTimer) { clearTimeout(_idleTimer); _idleTimer = null; }
        selPl = selPl === play ? null : play; // toggle
        if (_tutorialStep === 1) { _tutorialStep = 2; if (panel._tutOverlay) { panel._tutOverlay.remove(); panel._tutOverlay = null; } }
        // If both selected, show torch phase only if player has cards
        if (selPl && selP) {
          phase = torchInventory.length > 0 ? 'torch' : 'ready';
        } else if (selPl && !selP) {
          phase = 'player';
        } else {
          phase = 'play';
        }
        drawField(); drawPanel();
      },
      onSelectPlayer: function(p) {
        if (phase === 'busy') return;
        selP = selP === p ? null : p; // toggle
        if (_tutorialStep === 2) { _tutorialStep = 3; if (panel._tutOverlay) { panel._tutOverlay.remove(); panel._tutOverlay = null; } }
        if (selPl && selP) {
          phase = torchInventory.length > 0 ? 'torch' : 'ready';
        } else {
          phase = 'play';
        }
        drawField(); drawPanel();
      },
      onSnap: function() {
        if (conversionMode) { doConversionSnap(); } else { doSnap(); }
      },
      onDiscardPlays: function(marked) {
        handDiscard(hs, 'play', marked);
        selPl = null; phase = 'play';
        drawField(); drawPanel();
      },
      onDiscardPlayers: function(marked) {
        handDiscard(hs, 'player', marked);
        selP = null; phase = 'play';
        drawField(); drawPanel();
      },
      onTorchCard: function(tc) {
        if (selTorch === tc.id) {
          // Deselect — return card to inventory
          torchInventory.push(selectedPreSnap || tc);
          if (GS.season) GS.season.torchCards = torchInventory.slice();
          selTorch = null;
          selectedPreSnap = null;
          phase = (selPl && selP) ? 'torch' : 'play';
          drawField(); drawPanel();
          return;
        }
        selTorch = tc.id;
        selectedPreSnap = tc;
        var idx = torchInventory.indexOf(tc);
        if (idx >= 0) torchInventory.splice(idx, 1);
        if (GS.season) GS.season.torchCards = torchInventory.slice();
        phase = 'ready';

        // SCOUT TEAM: reveal opponent's play
        if (tc.id === 'scout_team') {
          var _stSides = gs.getCurrentSides();
          var _stOppPlay = isOff
            ? aiSelectPlay(_stSides.defHand, 'defense', gs.difficulty, { down: gs.down, distance: gs.distance, ballPos: gs.ballPosition })
            : aiSelectPlay(_stSides.offHand, 'offense', gs.difficulty, { down: gs.down, distance: gs.distance, ballPos: gs.ballPosition, teamId: oppId });
          if (_stOppPlay) {
            var _stOv = document.createElement('div');
            _stOv.style.cssText = "position:fixed;inset:0;z-index:660;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);pointer-events:auto;opacity:0;";
            _stOv.innerHTML =
              "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#EBB010;letter-spacing:3px;margin-bottom:6px;\">OPPONENT'S PLAY</div>" +
              "<div style=\"font-family:'Teko';font-weight:700;font-size:28px;color:#fff;letter-spacing:2px;\">" + (_stOppPlay.name || 'Unknown') + "</div>" +
              "<div style=\"font-family:'Rajdhani';font-size:12px;color:" + oTeam.accent + ";margin-top:4px;letter-spacing:1px;\">" + (_stOppPlay.cardType || _stOppPlay.playType || '') + "</div>";
            el.appendChild(_stOv);
            try { gsap.to(_stOv, { opacity: 1, duration: 0.2 }); } catch(e) { _stOv.style.opacity = '1'; }
            setTimeout(function() { try { gsap.to(_stOv, { opacity: 0, duration: 0.3, onComplete: function() { if (_stOv.parentNode) _stOv.remove(); } }); } catch(e) { if (_stOv.parentNode) _stOv.remove(); } }, 2500);
            setTimeout(function() { if (_stOv.parentNode) _stOv.remove(); }, 3000);
          }
        }

        // PERSONNEL_REPORT / PRE_SNAP_READ: reveal opponent's featured player
        if (tc.id === 'personnel_report' || tc.id === 'pre_snap_read') {
          var oppSides = gs.getCurrentSides();
          var oppPlay = isOff
            ? aiSelectPlay(oppSides.defHand, 'defense', gs.difficulty, { down: gs.down, distance: gs.distance, ballPos: gs.ballPosition })
            : aiSelectPlay(oppSides.offHand, 'offense', gs.difficulty, { down: gs.down, distance: gs.distance, ballPos: gs.ballPosition, teamId: oppId });
          var oppFeatured = isOff
            ? aiSelectPlayer(oppSides.defPlayers, oppPlay, gs.difficulty, false, gs.defHeatMap)
            : aiSelectPlayer(oppSides.offPlayers, oppPlay, gs.difficulty, true, gs.offHeatMap);
          if (oppFeatured) {
            var revealOv = document.createElement('div');
            revealOv.style.cssText = "position:fixed;inset:0;z-index:660;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);pointer-events:auto;opacity:0;";
            var starStr = '';
            for (var si = 0; si < (oppFeatured.stars || 3); si++) starStr += '\u2605';
            revealOv.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#EBB010;letter-spacing:3px;margin-bottom:6px;\">OPPONENT'S FEATURED PLAYER</div>" +
              "<div style=\"font-family:'Teko';font-weight:700;font-size:32px;color:#fff;letter-spacing:2px;\">" + (oppFeatured.name || 'Unknown') + "</div>" +
              "<div style=\"font-family:'Rajdhani';font-size:14px;color:#aaa;margin-top:4px;\">" + (oppFeatured.pos || '') + ' ' + starStr + "</div>" +
              "<div style=\"font-family:'Rajdhani';font-size:12px;color:#888;margin-top:2px;\">" + (oppFeatured.trait || '') + "</div>";
            el.appendChild(revealOv);
            try { gsap.to(revealOv, { opacity: 1, duration: 0.2 }); } catch(e) { revealOv.style.opacity = '1'; }
            setTimeout(function() { try { gsap.to(revealOv, { opacity: 0, duration: 0.3, onComplete: function() { if (revealOv.parentNode) revealOv.remove(); } }); } catch(e) { if (revealOv.parentNode) revealOv.remove(); } }, 2000);
            setTimeout(function() { if (revealOv.parentNode) revealOv.remove(); }, 2500);
          }
        }

        drawField(); drawPanel();
      },
      onSkipTorch: function() {
        selectedPreSnap = null; selTorch = null;
        phase = 'ready';
        drawField(); drawPanel();
      },
      onSpike: function() {
        SND.whistle();
        var spikeResult = gs.spike();
        stop2MinClock();
        driveSummaryLog.push({ down: gs.down - 1, dist: gs.distance, playName: 'SPIKE — clock stopped', yards: 0, isUserOff: true });
        selP = null; selPl = null; phase = 'play';
        drawBug(); drawField(); drawDriveSummary();
        // Brief splash like any other play
        showFieldResult('SPIKE', '#EBB010', { heroSize: 44, contextText: 'CLOCK STOPPED', contextColor: '#EBB010', duration: 1000 });
        setNarr('Ball spiked. Clock stopped.', fmtClock(Math.max(0, gs.clockSeconds)) + ' left');
        if (!checkEnd()) drawPanel();
      },
      onKneel: hS > cS ? function() {
        SND.click();
        gs.kneel();
        driveSummaryLog.push({ down: gs.down - 1, dist: gs.distance, playName: 'KNEEL — clock running', yards: 0, isUserOff: true });
        selP = null; selPl = null; phase = 'play';
        drawBug(); drawField(); drawDriveSummary();
        showFieldResult('KNEEL', '#888', { heroSize: 40, contextText: 'CLOCK RUNNING', contextColor: '#666', duration: 800 });
        setNarr('QB kneels.', fmtClock(Math.max(0, gs.clockSeconds)) + ' left');
        if (!checkEnd()) drawPanel();
      } : null,
    });
    panel.appendChild(trayEl);
    _isNewDrive = false; // consume the flag after rendering

    // ── ONBOARDING HINTS ──
    // Delay varies by hint to account for cooldown from previous hint dismissal
    if (!_onboardingSkipped) {
      var _hintDelay = _onboardingCooldown ? 600 : 400;
      setTimeout(function() {
        if (_onboardingActive || _onboardingSkipped) return;
        // Re-read current state (drawPanel may have been called again)
        var _curPhase = phase;
        var _curSelPl = selPl;
        var _curSelP = selP;

        // S1: Pick a play (first snap, offense)
        if (snapCount === 0 && isOff && _curPhase === 'play' && !_curSelPl && shouldShowHint('torch_hint_pick_play')) {
          var _pr = panel.querySelector('.CT-row');
          if (_pr) showOnboardingBubble(_pr, 'Pick a play to call it.', 'torch_hint_pick_play');
        }
        // S3: Pick a player (first snap, offense, play selected)
        else if (snapCount === 0 && isOff && _curPhase === 'player' && _curSelPl && !_curSelP && shouldShowHint('torch_hint_pick_player')) {
          var _rows = panel.querySelectorAll('.CT-row');
          var _plRow = _rows.length > 1 ? _rows[1] : _rows[0];
          if (_plRow) showOnboardingBubble(_plRow, 'Now pick your star player.', 'torch_hint_pick_player');
        }
        // S5: Snap button ready (first snap, both selected)
        else if (snapCount === 0 && isOff && _curSelPl && _curSelP && shouldShowHint('torch_hint_snap')) {
          var _sb = panel.querySelector('.CT-snap-btn');
          if (_sb) showOnboardingBubble(_sb, "Hit SNAP to run the play. Let's see what happens!", 'torch_hint_snap');
        }
        // D1: First defense
        else if (!isOff && _curPhase === 'play' && shouldShowHint('torch_hint_defense')) {
          var _dr = panel.querySelector('.CT-row');
          if (_dr) showOnboardingBubble(_dr, 'Other team has the ball now. Pick a defensive play to stop them.', 'torch_hint_defense');
        }
        // TC1: Torch cards (after snap 4, has cards, in torch phase)
        else if (snapCount >= 4 && torchInventory.length > 0 && _curPhase === 'torch' && shouldShowHint('torch_hint_torch_card')) {
          var _tr = panel.querySelector('.CT-row');
          if (_tr) showOnboardingBubble(_tr, 'Got a torch card? Tap here for a bonus this snap. Totally optional.', 'torch_hint_torch_card');
        }
      }, _hintDelay);

      // S6: Idle fallback (8s without action during play selection)
      if (phase === 'play' && !selPl) {
        if (_idleTimer) clearTimeout(_idleTimer);
        _idleTimer = setTimeout(function() {
          if (phase === 'play' && !selPl && !_onboardingActive && !_onboardingSkipped) {
            var _ir = panel.querySelector('.CT-row');
            if (_ir) showOnboardingBubble(_ir, "Pick a play — any play works, you'll get the hang of it.", null);
          }
        }, 8000);
      } else if (_idleTimer) {
        clearTimeout(_idleTimer);
        _idleTimer = null;
      }
    }

    // Torch card tutorial — disabled, will revisit
    if (false) {
      _torchTutorialShown = true;
      // Show informational overlay — tap to dismiss
      var torchTutOv = document.createElement('div');
      torchTutOv.style.cssText = 'position:fixed;inset:0;z-index:900;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(10,8,4,0.92);opacity:0;transition:opacity .3s;pointer-events:auto;';
      var _flameTutSvg = '<svg viewBox="0 0 34 34" width="46" height="46" style="animation:T-flame-pulse 2s ease-in-out infinite;filter:drop-shadow(0 0 12px ' + hTeam.accent + ')">' + flameLayersMarkup() + '</svg>';
      var _hasReactiveOnly2 = torchInventory.every(function(c) { return c.type === 'reactive'; });
      var _tutDesc2 = _hasReactiveOnly2
        ? 'Reactive cards activate automatically when triggered. Look for the prompt during play!'
        : 'When you have a playable card, tap it to power up your play before you snap.';
      torchTutOv.innerHTML =
        _flameTutSvg +
        "<div style=\"font-family:'Teko';font-weight:700;font-size:28px;color:" + hTeam.accent + ";letter-spacing:4px;text-shadow:0 0 20px " + hTeam.accent + "40;\">TORCH CARD EARNED!</div>" +
        "<div style=\"font-family:'Rajdhani';font-weight:600;font-size:14px;color:#999;letter-spacing:2px;text-align:center;max-width:280px;line-height:1.4;\">" + _tutDesc2 + "</div>" +
        "<button class='btn-blitz' style='margin-top:20px;font-size:16px;padding:14px 40px;background:#141008;color:" + hTeam.accent + ";border-color:" + hTeam.accent + ";letter-spacing:3px;'>GOT IT</button>";
      torchTutOv.querySelector('button').onclick = function() {
        torchTutOv.style.opacity = '0';
        setTimeout(function() { torchTutOv.remove(); }, 300);
      };
      el.appendChild(torchTutOv);
      requestAnimationFrame(function() { torchTutOv.style.opacity = '1'; });
    }

    if (_tutorialStep > 0 && snapCount === 0) {
      var tutEl = document.createElement('div');
      var tutText, tutSub, tutColor;
      if (_tutorialStep === 1) {
        tutText = 'PICK A PLAY';
        tutSub = 'Each card is a different offensive or defensive call';
        tutColor = '#FF4511';
      } else if (_tutorialStep === 2) {
        tutText = 'PICK A PLAYER';
        tutSub = 'Match player traits to your play for the biggest boost';
        tutColor = '#4DA6FF';
      } else if (phase === 'torch') {
        tutText = 'PLAY A TORCH CARD';
        tutSub = 'Tap a card to power up, or SKIP to snap';
        tutColor = '#EBB010';
      } else {
        tutText = 'TAP SNAP!';
        tutSub = 'Run the play and see what happens!';
        tutColor = '#00ff44';
      }
      tutEl.style.cssText = "text-align:center;padding:10px 12px;margin:0 8px;background:rgba(10,8,4,0.85);border:1px solid " + tutColor + "44;border-radius:8px;";
      tutEl.innerHTML =
        "<div style=\"font-family:'Teko';font-weight:700;font-size:24px;color:" + tutColor + ";letter-spacing:3px;text-shadow:0 0 16px " + tutColor + "60;animation:T-snap-pulse 1.2s ease-in-out infinite;\">" + tutText + "</div>" +
        "<div style=\"font-family:'Rajdhani';font-weight:600;font-size:14px;color:" + tutColor + "aa;margin-top:6px;line-height:1.3;letter-spacing:1px;\">" + tutSub + "</div>";
      panel.insertBefore(tutEl, panel.firstChild);
    }
  }

  // ── SNAP ──
  function doSnap() {
    if (phase === 'busy') return; // Prevent re-entrant snaps
    _tutorialStep = 0;
    if (!_onboardingDone) { _onboardingDone = true; localStorage.setItem('torch_onboarding_done', '1'); }
    phase = 'busy';
    // Heartbeat pressure pulse — haptic + red vignette on high-stakes downs
    triggerPressurePulse();
    // Restart real-time clock if it was stopped (spike/incomplete/out of bounds)
    if (gs.twoMinActive && !twoMinTimer) start2MinClock();

    var isOff = gs.possession === hAbbr;

    // AI 4th down decisions are handled in nextSnap() before cards are shown

    var prevPoss = gs.possession;
    const preSnap = gs.getSummary();
    var offCard = isOff ? selTorch : null;
    var defCard = isOff ? null : selTorch;
    var playedPlay = selPl;
    var playedPlayer = selP;

    // Torch card activation fanfare — tier-scaled (Bronze→Silver→Gold escalation)
    if (selectedPreSnap && selectedPreSnap.name) {
      var tcCard = selectedPreSnap;
      var tcTier = tcCard.tier;
      var tcTierCol = tcTier === 'GOLD' ? '#EBB010' : tcTier === 'SILVER' ? '#C0C0C0' : '#CD7F32';
      var tcGlowSize = tcTier === 'GOLD' ? 60 : tcTier === 'SILVER' ? 40 : 20;
      var tcCardSize = tcTier === 'GOLD' ? [120, 168] : tcTier === 'SILVER' ? [110, 154] : [100, 140];
      var tcOv = document.createElement('div');
      tcOv.style.cssText = 'position:fixed;inset:0;z-index:650;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;opacity:0;';
      // Tier-scaled backdrop darkness
      var tcBg = document.createElement('div');
      tcBg.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,' + (tcTier === 'GOLD' ? '0.8' : tcTier === 'SILVER' ? '0.7' : '0.5') + ');';
      tcOv.appendChild(tcBg);
      var tcVisual = buildTorchCard(tcCard, tcCardSize[0], tcCardSize[1]);
      tcVisual.style.cssText += ';position:relative;z-index:1;box-shadow:0 0 ' + tcGlowSize + 'px ' + tcTierCol + '66;';
      tcOv.appendChild(tcVisual);
      // Name + effect below card
      var tcInfo = document.createElement('div');
      tcInfo.style.cssText = 'position:relative;z-index:1;text-align:center;';
      tcInfo.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:" + (tcTier === 'GOLD' ? '26' : '20') + "px;color:" + tcTierCol + ";letter-spacing:3px;margin-top:10px;text-shadow:0 0 " + (tcGlowSize / 2) + "px " + tcTierCol + "60;\">" + tcCard.name + "</div>" +
        "<div style=\"font-family:'Rajdhani';font-size:11px;color:#ccc;margin-top:4px;max-width:260px;\">" + tcCard.effect + "</div>";
      tcOv.appendChild(tcInfo);
      el.appendChild(tcOv);
      try {
        // Tier-scaled animation
        if (tcTier === 'GOLD') {
          gsap.to(tcOv, { opacity: 1, duration: 0.2 });
          gsap.from(tcVisual, { scale: 0.3, rotation: -10, duration: 0.5, ease: 'back.out(2.5)' });
          gsap.from(tcVisual, { y: -30, duration: 0.5, ease: 'back.out(2.5)' });
          // Gold shimmer pulse
          gsap.to(tcVisual, { boxShadow: '0 0 80px ' + tcTierCol + 'aa, 0 0 120px ' + tcTierCol + '44', duration: 0.3, delay: 0.4, yoyo: true, repeat: 1 });
          SND.ignite();
          Haptic.bigPlay();
        } else if (tcTier === 'SILVER') {
          gsap.to(tcOv, { opacity: 1, duration: 0.15 });
          gsap.from(tcVisual, { scale: 0.4, rotation: -6, duration: 0.4, ease: 'back.out(2)' });
          gsap.to(tcVisual, { boxShadow: '0 0 50px ' + tcTierCol + '88', duration: 0.2, delay: 0.3, yoyo: true, repeat: 1 });
          SND.cardSnap();
          Haptic.cardSelect();
        } else {
          gsap.to(tcOv, { opacity: 1, duration: 0.12 });
          gsap.from(tcVisual, { scale: 0.5, rotation: -3, duration: 0.3, ease: 'back.out(1.7)' });
          SND.cardSnap();
        }
      } catch(e) {}
      var tcBaseDur = tcTier === 'GOLD' ? 1800 : tcTier === 'SILVER' ? 1200 : 800;
      var tcDur = _torchFanfareCount > 0 ? Math.round(tcBaseDur * 0.5) : tcBaseDur;
      _torchFanfareCount++;
      setTimeout(function() { try { gsap.to(tcOv, { opacity: 0, duration: 0.25, onComplete: function() { if (tcOv.parentNode) tcOv.remove(); } }); } catch(e) { if (tcOv.parentNode) tcOv.remove(); } }, tcDur);
      setTimeout(function() { if (tcOv.parentNode) tcOv.remove(); }, tcDur + 500);
    }

    // Pre-snap TORCH card effects
    if (offCard === 'hard_count' || defCard === 'hard_count') {
      // Force opponent to discard their play and get a random replacement
      var sides = gs.getCurrentSides();
      if (isOff) {
        // Human offense used hard count → CPU defense gets random replacement
        var defHand = sides.defHand;
        if (defHand.length > 0) {
          var ri = Math.floor(Math.random() * defHand.length);
          var pool = getDefCards(GS.team === gs.humanTeam ? gs.cpuTeam : GS.team);
          var avail = pool.filter(function(c) { return defHand.indexOf(c) === -1; });
          if (avail.length > 0) defHand[ri] = avail[Math.floor(Math.random() * avail.length)];
        }
      }
    }

    // FRESH LEGS: grant an extra discard this drive
    var selTorchId = offCard || defCard;
    if (selTorchId === 'fresh_legs') {
      var hs = getHandState();
      if (hs) {
        hs.maxPlayDiscards++;
        hs.maxPlayerDiscards++;
        torchCardToast('FRESH LEGS', 'Extra discard granted!');
        Haptic.cardTap();
        SND.cardDeal();
      }
    }

    // GAME PLAN: reset featured player's heat to zero
    if (selTorchId === 'game_plan' && selP) {
      var heatMap = isOff ? gs.offHeatMap : gs.defHeatMap;
      if (heatMap && selP.id) heatMap[selP.id] = 0;
    }

    // SCOUT REPORT: see all 7 players instead of 4
    if (selTorchId === 'scout_report') {
      _scoutActive = true;
      torchCardToast('SCOUT REPORT', 'Full roster revealed!');
      Haptic.cardSelect();
    }

    // TIMEOUT: add 30 seconds to 2-minute drill clock
    if (selTorchId === 'timeout') {
      if (gs.twoMinActive) {
        gs.clockSeconds = Math.min(120, (gs.clockSeconds || 0) + 30);
      } else {
        // 2-min drill not active — refund the card, it does nothing here
        var tcRefund = TORCH_CARDS.find(function(c) { return c.id === 'timeout'; });
        if (tcRefund) { torchInventory.push(tcRefund); if (GS.season) GS.season.torchCards = torchInventory.slice(); }
        selTorch = null; selectedPreSnap = null;
      }
    }

    // IRON MAN: restore the most recently burned player to ST deck
    if (selTorchId === 'iron_man') {
      if (_humanSTDeck.burned.length > 0) {
        var lastBurned = _humanSTDeck.burned[_humanSTDeck.burned.length - 1].player;
        restorePlayer(_humanSTDeck, lastBurned);
      } else {
        // No burned players — refund the card, it does nothing here
        var tcIronMan = TORCH_CARDS.find(function(c) { return c.id === 'iron_man'; });
        if (tcIronMan) { torchInventory.push(tcIronMan); if (GS.season) GS.season.torchCards = torchInventory.slice(); }
        selTorch = null; selectedPreSnap = null;
      }
    }

    // Torch card combo check
    if (selTorchId) {
      if (FEATURES.cardCombos) {
        var combo = checkCardCombo(_driveCardsUsed, selTorchId);
        if (combo) {
          // Store combo for post-snap bonus application
          _activeDriveCombo = combo;
        }
      }
      _driveCardsUsed.push(selTorchId);
    }

    var preTorchPts = getTorchPoints();
    // Freeze the display counter at the pre-snap value until animation plays
    _torchFrozenValue = preTorchPts;
    _torchDisplayFrozen = true;
    // Dev: check for forced result before executing snap
    var _devForce = getForceResult();
    var _devForceResult = null;
    if (_devForce) {
      _devForceResult = function(result, ydsToEz) {
        result.isTouchdown = false; result.isInterception = false; result.isFumble = false; result.isFumbleLost = false;
        result.isSack = false; result.isIncomplete = false; result.isComplete = false;
        if (_devForce === 'td') {
          result.isTouchdown = true; result.isComplete = true; result.yards = ydsToEz;
          result.description = 'DEV: Forced TOUCHDOWN!';
        } else if (_devForce === 'exploit') {
          result.isComplete = true; result.yards = Math.max(15, Math.min(30, ydsToEz - 1));
          result.description = 'DEV: Forced EXPLOIT — big gain!';
        } else if (_devForce === 'covered') {
          result.isIncomplete = true; result.yards = 0;
          result.description = 'DEV: Forced COVERED — no gain.';
        } else if (_devForce === 'turnover') {
          result.isInterception = true; result.yards = 0;
          result.description = 'DEV: Forced TURNOVER!';
        }
      };
    }
    // Build extras for engine: card combo bonus + star heat check
    var _snapExtras = {};
    if (_activeDriveCombo) {
      _snapExtras.cardComboBonus = _activeDriveCombo.bonus;
    }
    if (isOff && offStarHot && selP && offStar && selP.id === offStar.id) {
      _snapExtras.starHotBonus = 2;
    }

    const res = isOff
      ? gs.executeSnap(selPl, selP, null, null, offCard, defCard, _devForceResult, _snapExtras)
      : gs.executeSnap(null, null, selPl, selP, offCard, defCard, _devForceResult, _snapExtras);

    if (res) res._torchUsedThisSnap = !!(offCard || defCard);
    _scoutActive = false; // Reset card effect after snap

    // Show card combo notification (yards already applied by engine)
    if (_activeDriveCombo && res && res.result) {
      var comboOv = document.createElement('div');
      comboOv.style.cssText = "position:fixed;top:8%;left:50%;transform:translateX(-50%);z-index:660;font-family:'Teko';font-weight:700;font-size:18px;color:#00ff44;letter-spacing:3px;text-shadow:0 0 16px rgba(0,255,68,0.6);pointer-events:none;opacity:0;white-space:nowrap;";
      comboOv.textContent = _activeDriveCombo.name + '!';
      el.appendChild(comboOv);
      try {
        gsap.to(comboOv, { opacity: 1, y: -5, duration: 0.3, ease: 'back.out(1.5)' });
        gsap.to(comboOv, { opacity: 0, y: -20, duration: 0.4, delay: 1.5 });
        SND.bigPlay();
      } catch(e) {}
      setTimeout(function() { if (comboOv.parentNode) comboOv.remove(); }, 2500);
      _activeDriveCombo = null;
    }

    var postTorchPts = getTorchPoints();
    var torchEarned = postTorchPts - preTorchPts;
    // TORCH card multiplier (12TH MAN, card combos)
    if (res && res.result && res.result.torchMultiplier && res.result.torchMultiplier > 1) {
      var bonus = torchEarned * (res.result.torchMultiplier - 1);
      if (gs.possession === 'CT') gs.ctTorchPts += bonus;
      else gs.irTorchPts += bonus;
      torchEarned *= res.result.torchMultiplier;
    }
    // Momentum TORCH multiplier (1.1x at momentum 5)
    if (res && res.featuredOff && torchEarned > 0) {
      var _momLevel = (gs.offMomentumMap && res.featuredOff.id) ? (gs.offMomentumMap[res.featuredOff.id] || 0) : 0;
      var _momMult = getMomentumMultiplier(_momLevel);
      if (_momMult > 1) {
        var momBonus = Math.round(torchEarned * (_momMult - 1));
        if (gs.possession === 'CT') gs.ctTorchPts += momBonus;
        else gs.irTorchPts += momBonus;
        torchEarned += momBonus;
      }
    }
    if (res) res._torchEarned = torchEarned;

    // Build TORCH sources for sequential animation
    // Simple approach: use the actual diff. If points went up, animate it.
    if (res && torchEarned > 0) {
      var _r = res.result;
      var _sources = [];
      var _comboPts = Math.max(0, Math.floor(isOff ? (_r.offComboPts || 0) : (_r.defComboPts || 0)));
      var _bonusPts = 0;
      if (isOff) {
        if (_r.isTouchdown) _bonusPts += 15;
        if (res.gotFirstDown) _bonusPts += 2;
      } else {
        if (_r.isSafety) _bonusPts += 10;
      }
      // Clamp combo+bonus so they don't exceed the total
      if (_comboPts + _bonusPts > torchEarned) {
        _bonusPts = Math.max(0, torchEarned - _comboPts);
        if (_comboPts > torchEarned) { _comboPts = torchEarned; _bonusPts = 0; }
      }
      var _playPts = torchEarned - _comboPts - _bonusPts;
      if (_playPts > 0) _sources.push({ key: 'play', pts: _playPts });
      if (_comboPts > 0) _sources.push({ key: 'combo', pts: _comboPts });
      if (_bonusPts > 0) _sources.push({ key: 'bonus', pts: _bonusPts });
      // Guaranteed: at least one source if torchEarned > 0
      if (_sources.length === 0) _sources.push({ key: 'play', pts: torchEarned });
      res._torchSources = _sources;
    } else if (res) {
      res._torchSources = [];
    }

    // Apply Game Day Condition modifiers to result (weather, field, crowd)
    if (res && res.result) {
      var r = res.result;
      var isRun = playedPlay && (playedPlay.isRun === true || playedPlay.type === 'run');

      // Rain: completionMod turns completed passes into incompletions
      if (condEffects.completionMod && !isRun && r.isComplete && !r.isSack && !r.isInterception) {
        if (Math.random() < Math.abs(condEffects.completionMod)) {
          r.isComplete = false; r.isIncomplete = true;
          r.yards = 0;
          r.description = 'Ball slips in the rain — incomplete!';
        }
      }
      // Rain/Snow: fumble rate increase on completed plays
      if (condEffects.fumbleRateMod && !r.isIncomplete && !r.isSack && !r.isInterception && !r.isFumbleLost) {
        if (Math.random() < condEffects.fumbleRateMod) {
          r.isFumble = true; r.isFumbleLost = Math.random() < 0.5;
          if (r.isFumbleLost) r.description = 'Wet ball! FUMBLE — defense recovers!';
        }
      }
      // Run/pass mean modifiers (snow, grass, mud)
      var runMod = (condEffects.runMeanMod || 0) + (condEffects.allMeanMod || 0);
      var passMod = condEffects.allMeanMod || 0;
      if (r.yards !== undefined && !r.isTouchdown && !r.isSack && !r.isInterception && !r.isFumbleLost) {
        r.yards += isRun ? runMod : passMod;
        if (r.yards < 0 && !r.isSack) r.yards = 0;
      }
      // Wind: cap deep passes
      if (condEffects.deepCapYards && r.yards > condEffects.deepCapYards) {
        var isDeep = playedPlay && (playedPlay.playType === 'DEEP' || (playedPlay.cat && playedPlay.cat.indexOf('DEEP') >= 0));
        if (isDeep) r.yards = condEffects.deepCapYards;
      }
    }

    // Check play sequence combos (notification only — yard bonuses handled by engine)
    var playCat = playedPlay ? (playedPlay.cat || playedPlay.playType || 'RUN') : 'RUN';
    var lastDefCat = res.defPlay ? (res.defPlay.cat || res.defPlay.cardType || '') : '';
    var firedCombos = checkPlayCombos(drivePlayHistory, playCat, lastDefCat, playedPlay ? playedPlay.id : null);
    drivePlayHistory.push({ cat: playCat, playId: playedPlay ? playedPlay.id : null });

    // Combo names for UI flash (yards already applied by engine pipeline).
    // These celebrate OFFENSIVE synergy (trait matchups, play-call rhythm,
    // Hot Read trigger, stacked TORCH cards) — they only fire when the user
    // is ON OFFENSE. If the user is on defense, a "TEMPO" badge celebrating
    // the opponent's rhythm would feel wrong (they're hurting the user).
    // Order matters: this is the synergy chain played as ascending pitch pops in BEAT 3.
    var comboNames = [];
    var rr = res && res.result;
    if (isOff) {
      // 1. Personnel synergy (trait/star matchup landed)
      if (rr && rr.personnelMod && rr.personnelMod.totalMod >= 2) {
        comboNames.push('MATCHUP');
      }
      // 2. Tempo / play history rhythm
      if (rr && rr.historyBonus > 0) {
        comboNames.push('TEMPO');
      }
      // 3. Badge combos (offense)
      firedCombos.forEach(function(combo) { comboNames.push(combo.name); });
      // 4. Hot Read fired inside engine
      if (rr && rr.hotReadFired) {
        comboNames.push('HOT READ');
      }
      // 5. Card combo (TORCH cards stacked)
      if (rr && rr.cardComboFired) {
        comboNames.push('CARD COMBO');
      }
    }
    if (comboNames.length > 0) {
      res._combos = comboNames;
    }

    driveSnaps.push(res);

    // Track drive summary
    var r = res.result;
    var defName = res.featuredDef ? res.featuredDef.name : 'the defense';
    var isPassPlay = r.playType === 'pass';

    // Resolve QB and receiver/rusher names properly
    var currentOffRoster = isOff ? offRoster : cpuOffRoster;
    var teamQB = currentOffRoster.find(function(p) { return p.pos === 'QB'; });
    var qbName = teamQB ? teamQB.name : '';
    var featuredPos = res.featuredOff ? res.featuredOff.pos : '';
    var featuredName = res.featuredOff ? res.featuredOff.name : '';
    // On pass plays: receiver = featuredOff if not a QB, otherwise pick a WR from roster
    var receiverName = featuredName;
    if (isPassPlay && featuredPos === 'QB') {
      var wr = currentOffRoster.find(function(p) { return p.pos === 'WR' || p.pos === 'TE' || p.pos === 'SLOT'; });
      receiverName = wr ? wr.name : featuredName;
    }
    // On run plays: ball carrier = featuredOff
    var rusherName = featuredName;

    // Attach resolved names to res so commentary.js uses consistent names
    res._qbName = qbName;
    res._receiverName = receiverName;
    res._rusherName = rusherName;

    // ESPN-style play description with player names
    var espnDesc = '?';
    if (r.isTouchdown) espnDesc = r.yards + '-yd TD ' + (isPassPlay ? 'Pass to ' + receiverName : 'Run by ' + rusherName);
    else if (r.isInterception) espnDesc = 'INTERCEPTION by ' + defName;
    else if (r.isFumbleLost) espnDesc = 'FUMBLE \u2014 recovered by ' + defName;
    else if (r.isSack) espnDesc = 'SACK by ' + defName + (Math.abs(r.yards) > 0 ? ', loss of ' + Math.abs(r.yards) : '');
    else if (r.isIncomplete) {
      var incVariants = [
        'Incomplete \u2014 broken up by ' + defName,
        'Incomplete \u2014 overthrown, intended for ' + receiverName,
        'Incomplete \u2014 dropped by ' + receiverName,
        'Incomplete \u2014 ' + receiverName + ' couldn\'t hang on',
      ];
      espnDesc = incVariants[Math.floor(Math.random() * incVariants.length)];
    }
    else if (isPassPlay) {
      if (r.yards > 0) espnDesc = 'Pass to ' + receiverName + ', gain of ' + r.yards + (defName ? ', tackled by ' + defName : '');
      else if (r.yards < 0) espnDesc = 'Pass to ' + receiverName + ', loss of ' + Math.abs(r.yards) + (defName ? ', tackled by ' + defName : '');
      else espnDesc = 'Pass to ' + receiverName + ', no gain' + (defName ? ', tackled by ' + defName : '');
    }
    else {
      if (r.yards > 0) espnDesc = rusherName + ' runs for a gain of ' + r.yards + (defName ? ', tackled by ' + defName : '');
      else if (r.yards < 0) espnDesc = rusherName + ' runs for a loss of ' + Math.abs(r.yards) + (defName ? ', tackled by ' + defName : '');
      else espnDesc = rusherName + ' runs, no gain' + (defName ? ', tackled by ' + defName : '');
    }
    // Attach to res so run3BeatSnap/showPostPlay (sibling closures) can read it
    res._espnDesc = espnDesc;
    // Track game-wide stats for BOTH teams
    if (isOff) {
      // Human on offense → track human OFF stats + CPU DEF stats
      if (isPassPlay) {
        hOffPassAtt++;
        if (qbName && !hOffQBName) hOffQBName = qbName;
        if (r.isComplete) {
          hOffPassComp++; hOffPassYds += r.yards;
          if (!hOffWRName) hOffWRName = receiverName;
          hOffRec++; hOffRecYds += r.yards;
        }
      } else if (!r.isSack && res.featuredOff) {
        hOffRushAtt++; hOffRushYds += r.yards;
        if (!hOffRBName) hOffRBName = rusherName;
      }
      // CPU defensive player stats
      if (defName) {
        if (!cDefStats[defName]) cDefStats[defName] = { pos: res.featuredDef ? res.featuredDef.pos : '', tkl: 0, pbu: 0, int: 0, sack: 0 };
        var cds = cDefStats[defName];
        if (r.isSack) cds.sack++;
        else if (r.isInterception) cds.int++;
        else if (r.isIncomplete) cds.pbu++;
        else if (!r.isTouchdown) cds.tkl++;
      }
    } else {
      // Human on defense → track CPU OFF stats + human DEF stats
      if (isPassPlay) {
        cOffPassAtt++;
        if (qbName && !cOffQBName) cOffQBName = qbName;
        if (r.isComplete) {
          cOffPassComp++; cOffPassYds += r.yards;
          if (!cOffWRName) cOffWRName = receiverName;
          cOffRec++; cOffRecYds += r.yards;
        }
      } else if (!r.isSack && res.featuredOff) {
        cOffRushAtt++; cOffRushYds += r.yards;
        if (!cOffRBName) cOffRBName = rusherName;
      }
      // Human defensive player stats
      if (defName) {
        if (!hDefStats[defName]) hDefStats[defName] = { pos: res.featuredDef ? res.featuredDef.pos : '', tkl: 0, pbu: 0, int: 0, sack: 0 };
        var hds = hDefStats[defName];
        if (r.isSack) hds.sack++;
        else if (r.isInterception) hds.int++;
        else if (r.isIncomplete) hds.pbu++;
        else if (!r.isTouchdown) hds.tkl++;
      }
    }
    // Per-player stat accumulation for card display
    function _addStat(pid, key, val) {
      if (!pid) return;
      if (!_playerGameStats[pid]) _playerGameStats[pid] = {};
      _playerGameStats[pid][key] = (_playerGameStats[pid][key] || 0) + (val || 1);
    }
    var _offId = res.featuredOff ? res.featuredOff.id : null;
    var _defId = res.featuredDef ? res.featuredDef.id : null;

    if (isPassPlay) {
      if (_offId && res.featuredOff.pos === 'QB') { _addStat(_offId, 'passAtt'); if (r.isComplete) { _addStat(_offId, 'passComp'); _addStat(_offId, 'passYds', r.yards); } }
      if (_offId && res.featuredOff.pos !== 'QB' && r.isComplete) { _addStat(_offId, 'rec'); _addStat(_offId, 'recYds', r.yards); }
    } else if (!r.isSack) {
      if (_offId) { _addStat(_offId, 'rushAtt'); _addStat(_offId, 'rushYds', r.yards); }
    }
    if (r.isTouchdown && _offId) _addStat(_offId, 'td');
    if (r.isSack && _defId) _addStat(_defId, 'sack');
    if (r.isInterception && _defId) _addStat(_defId, 'int');
    if (r.isIncomplete && _defId) _addStat(_defId, 'pbu');
    if (!r.isTouchdown && !r.isSack && !r.isInterception && !r.isIncomplete && _defId) _addStat(_defId, 'tkl');

    // Stat milestone checks (only for user's team)
    if (isOff && _offId) _checkMilestone(_offId);
    if (!isOff && _defId) _checkMilestone(_defId);

    driveSummaryLog.push({
      down: preSnap.down, dist: preSnap.distance, ydsToEz: preSnap.yardsToEndzone,
      playName: espnDesc,
      yards: r.yards, isTD: r.isTouchdown, isSack: r.isSack,
      isInc: r.isIncomplete, isInt: r.isInterception, isFumble: r.isFumbleLost,
      isUserOff: isOff
    });
    var _tickerColor = r.isTouchdown ? '#EBB010' : (r.isInterception || r.isFumbleLost) ? '#ff0040' : r.yards >= 10 ? '#00ff44' : '#888';
    pushTicker(espnDesc || ('Play: ' + r.yards + ' yards'), _tickerColor);
    // Show TORCH points earned in ticker
    if (res._torchEarned && res._torchEarned > 0) {
      var _ptBreakdown = '+' + res._torchEarned + ' TORCH';
      if (r.isTouchdown) _ptBreakdown = 'BASE ' + Math.max(0, res._torchEarned - 50) + ' + TD BONUS = +' + res._torchEarned + ' TORCH';
      pushTicker(_ptBreakdown, '#EBB010');
    }
    if (res.gotFirstDown) driveFirstDowns++;

    // Replace used cards in hand manager
    var _snapHs = getHandState();
    handAfterSnap(_snapHs, selPl, selP);
    // Also cycle in engine hand for backward compat
    var sides = gs.getCurrentSides();
    var teamId = GS.team;
    if (isOff) {
      cycleCard(playedPlay, sides.offHand, getOffCards(teamId), teamId);
    } else {
      cycleCard(playedPlay, sides.defHand, getDefCards(teamId), teamId);
    }
    // Don't clear selP/selPl yet — keep placed cards visible on field during post-play
    selTorch = null;
    // Don't redraw field or panel — cards stay placed during result animation
    phase = 'busy';
    // Quick tier estimate for panel visibility during result
    var _r = res.result;
    var _quickTier = (_r.isTouchdown || _r.isInterception || _r.isFumbleLost) ? 3 : (_r.isSack || _r.yards >= 15 || _r.yards <= -3) ? 2 : 1;
    // Tier 1 plays: show card tray at reduced opacity so player can plan ahead
    if (_quickTier <= 1) {
      panel.className = 'T-panel';
      panel.style.opacity = '0.3';
      panel.style.pointerEvents = 'none';
    } else {
      panel.className = 'T-panel T-panel-hidden';
    }
    driveSummaryEl.style.display = ''; // Show PBP during snap result
    res._preSnap = preSnap;

    // Compute EPA (Expected Points Added) for this snap — positive = offense
    // helped themselves, negative = offense hurt themselves. Used by drive recap,
    // halftime, Clipboard, and end-of-game stat surfaces.
    try {
      var _postSnap = gs.getSummary();
      res._epa = computeEPA(preSnap, _postSnap, res.result);
    } catch(e) { res._epa = 0; }

    // Accumulate game-wide stats by possessing team
    var _resR = res.result || {};
    var _isPassPlay = _resR.playType === 'pass';
    if (isOff) {
      _hEpaSum += res._epa || 0;
      _hEpaPlays++;
      if (_resR.isInterception || _resR.isFumbleLost) _hTurnovers++;
      if (_resR.yards >= 15 && !_resR.isInterception && !_resR.isFumbleLost) _hExplosive++;
      if (preSnap.down === 3) {
        _h3rdAtt++;
        if (res.gotFirstDown || _resR.isTouchdown) _h3rdConv++;
      }
      if (_resR.isTouchdown) {
        if (_isPassPlay) _hTdsPass++; else _hTdsRush++;
      }
      if (selTorchId) _hCardsUsed++;
    } else {
      _cEpaSum += res._epa || 0;
      _cEpaPlays++;
      if (_resR.isInterception || _resR.isFumbleLost) _cTurnovers++;
      if (_resR.yards >= 15 && !_resR.isInterception && !_resR.isFumbleLost) _cExplosive++;
      if (preSnap.down === 3) {
        _c3rdAtt++;
        if (res.gotFirstDown || _resR.isTouchdown) _c3rdConv++;
      }
      if (_resR.isTouchdown) {
        if (_isPassPlay) _cTdsPass++; else _cTdsRush++;
      }
      if (selTorchId) _cCardsUsed++;
    }

    // Check star activation
    var wasOffHot = offStarHot, wasDefHot = defStarHot;
    checkStarActivation(res);

    // Stop real-time clock on clock-stopping plays (incomplete, spike already handled, turnovers)
    if (gs.twoMinActive && res.result && (res.result.isIncomplete || res.result.isInterception || res.result.isFumbleLost || res.result.isTouchdown)) {
      stop2MinClock();
    }

    run3BeatSnap(res, prevPoss, wasOffHot, wasDefHot);
  }

  // ── 4-PHASE CARD CLASH / REVEAL (v0.22 Phase 5) ──
  function run3BeatSnap(res, prevPoss, wasOffHot, wasDefHot) {
    var r = res.result;
    var isTD = r.isTouchdown;
    var isExplosive = r.yards >= 15;
    var isUserOff = prevPoss === hAbbr;

    // User-biased sentiment: green = good for user, red = bad for user
    var isGoodForUser, isBadForUser;
    if (isUserOff) {
      isGoodForUser = (r.yards >= 4 || isTD) && !r.isInterception && !r.isFumbleLost;
      isBadForUser = r.isSack || r.isInterception || r.isFumbleLost || r.isSafety || r.yards < 0;
    } else {
      // User on defense — flip: stops are good, opponent gains are bad
      isGoodForUser = r.isSack || r.isInterception || r.isFumbleLost || r.isSafety || r.yards <= 0 || r.isIncomplete;
      isBadForUser = (r.yards >= 4 || isTD) && !r.isInterception && !r.isFumbleLost;
    }
    // Legacy aliases for tier/card glow logic
    var isGood = isGoodForUser;
    var isBad = isBadForUser;

    // Determine drama tier (1=routine, 2=important, 3=game-changing)
    var tier = 1;
    var s = gs.getSummary();
    if (isTD || r.isInterception || r.isFumbleLost) tier = 3;
    else if (r.isSack || isExplosive || s.down >= 3 || s.yardsToEndzone <= 20) tier = 2;
    if (s.half === 2 && Math.abs(s.ctScore - s.irScore) <= 7 && tier < 3) tier = Math.min(3, tier + 1);

    // Drive heat momentum bar
    if (FEATURES.driveHeat) updateDriveHeat(r, res.gameEvent);
    drawDriveHeat();

    // Canvas field play animation
    if (_fieldAnimator) {
      var _s = gs.getSummary();
      var _ballYard = _s.ballPosition * 1.1 + 5;
      var _offTeamId = isUserOff ? GS.team : (GS.opponent || 'wolves');
      var _defTeamId = isUserOff ? (GS.opponent || 'wolves') : GS.team;
      var _formation = 'shotgun_deuce';
      if (res.offPlay && _fieldAnimator.pickFormation) {
        _formation = _fieldAnimator.pickFormation(res.offPlay.playType || 'SHORT', _offTeamId);
      }
      var _animType = isTD ? 'touchdown' : r.isSack ? 'sack' : r.isInterception ? 'interception' : r.isIncomplete ? 'incomplete' : (res.offPlay && res.offPlay.isRun) ? 'run' : 'complete';
      try {
        _fieldAnimator.playSequence(_animType, r.yards, {
          ballYard: Math.max(10, Math.min(110, _ballYard)),
          losYard: Math.max(10, Math.min(110, _ballYard)),
          firstDownYard: Math.max(10, Math.min(110, _ballYard + _s.distance)),
          formation: _formation,
          playType: res.offPlay ? res.offPlay.playType : 'SHORT',
          defScheme: res.defPlay ? res.defPlay.cardType : 'ZONE',
          offTeam: _offTeamId,
          defTeam: _defTeamId,
          skipDots: true,
          skipLOS: true,
        });
      } catch(e) { /* Field animation is non-critical */ }
    }

    // Tier-based timing
    var anticipationMs = tier === 1 ? 0 : tier === 2 ? 300 : 800;
    var hitstopMs = tier === 1 ? 33 : tier === 2 ? 67 : 133;
    var shakeAmt = tier === 1 ? 1 : tier === 2 ? 2 : 5;
    var dimLevel = tier === 1 ? 0.2 : tier === 2 ? 0.4 : 0.7;
    var particleCount = tier === 1 ? 0 : tier === 2 ? 15 : 35;
    var cardScale = tier === 1 ? 1.0 : tier === 2 ? 1.1 : 1.25;
    var aftermathDur = isTD ? 5000 : tier === 3 ? 3500 : tier === 2 ? 2500 : 1200;
    var _speedMult = getSpeedMultiplier();
    anticipationMs = Math.round(anticipationMs * _speedMult);
    hitstopMs = Math.round(hitstopMs * _speedMult);
    aftermathDur = Math.round(aftermathDur * _speedMult);

    // 5-beat cadence (non-TD only — TD flows have their own walkout structure).
    // Each beat gets an isolated anchor so the eye always has a single arrival:
    //   1 RESULT  2 CONTEXT  3 STORY  4 REWARD  5 SETTLE
    // Gap scales with tier so bigger plays breathe more.
    var _cadenceOn = FEATURES.cadenceBeats && !isTD;
    var _beatGap = _cadenceOn ? (tier === 3 ? 1100 : tier === 2 ? 900 : 750) : 0;
    if (_cadenceOn) {
      aftermathDur = Math.round(_beatGap * 5 * _speedMult);
    }

    // User-biased result display
    var resultColor, resultText;
    if (res._isConversion) {
      resultColor = r.isComplete ? '#00ff44' : '#ff0040';
      resultText = r.isComplete ? 'GOOD!' : 'NO GOOD';
    } else if (isUserOff) {
      resultColor = isTD ? '#EBB010' : isGoodForUser ? '#00ff44' : isBadForUser ? '#ff0040' : r.yards > 0 ? '#c8a030' : '#aaa';
      resultText = isTD ? 'TOUCHDOWN' : r.isSack ? 'SACK' : r.isInterception ? 'INTERCEPTED' : r.isFumbleLost ? 'FUMBLE' : r.isIncomplete ? 'INCOMPLETE' : r.isSafety ? 'SAFETY' : r.yards === 0 ? 'NO GAIN' : yardTextShort(r.yards);
    } else {
      // User on defense — show opponent gains as bad, stops as good
      if (isTD) { resultColor = '#ff0040'; resultText = 'TOUCHDOWN'; }
      else if (r.isSack) { resultColor = '#00ff44'; resultText = 'SACKED!'; }
      else if (r.isInterception) { resultColor = '#00ff44'; resultText = 'PICKED OFF!'; }
      else if (r.isFumbleLost) { resultColor = '#00ff44'; resultText = 'FUMBLE!'; }
      else if (r.isIncomplete) { resultColor = '#00ff44'; resultText = 'INCOMPLETE'; }
      else if (r.isSafety) { resultColor = '#00ff44'; resultText = 'SAFETY!'; }
      else if (r.yards <= 0) { resultColor = '#00ff44'; resultText = 'STUFFED!'; }
      else if (r.yards <= 3) { resultColor = '#c8a030'; resultText = '+' + r.yards; }
      else { resultColor = '#ff0040'; resultText = '+' + r.yards; }
    }
    var flashColor = isGoodForUser ? '#00ff44' : isBadForUser ? '#ff0040' : 'transparent';

    // Layer 6: update ambient mood
    updateMood(isGoodForUser, isBadForUser);

    panel.style.display = 'none';
    snapCount++;

    // Allow tap-to-skip
    var skipped = false;
    var _settled = false; // guard: doSettle fires at most once
    var _settledTime = 0;
    function onSkip() { skipped = true; }

    // ── OVERLAY CONTAINER ──
    var overlay = document.createElement('div');
    overlay.className = 'T-clash-overlay';
    overlay.onclick = onSkip;
    var dim = document.createElement('div');
    dim.className = 'T-clash-dim';
    dim.style.opacity = '1';
    overlay.appendChild(dim);

    // ── PHASE 4: SETTLE ──
    function doSettle(onFinished) {
      if (_settled) return;
      _settled = true;
      _settledTime = Date.now();
      overlay.onclick = null;
      overlay.style.pointerEvents = 'none';

      // ── Dead Ball Whistle ──
      SND.whistle();

      // ── Big Hit Audio Logic ──
      // Use heavy thud for TFLs or stuffed runs, layered with a helmet crunch
      if (r.yards <= 0 && !r.isIncomplete && !r.isInterception && !r.isFumbleLost) {
        SND.sack();
        setTimeout(function(){ try { SND.helmetImpact(); } catch(e) {} }, 40);
      }

      // ── Capture fly source rect BEFORE the overlay fades ──
      // On non-TD plays, the source is the #tp-result-torch pill (the "+N TORCH"
      // indicator in BEAT 4 REWARD). On TDs, it's the "TOUCHDOWN" hero text.
      // Either way, the element is marked with .T-torch-fly-source. We must
      // capture the rect here — after overlay.remove() the element is detached
      // and getBoundingClientRect() returns zeros.
      var _heroSrcRect = null;
      var _srcEl = overlay.querySelector('.T-torch-fly-source');
      if (_srcEl) {
        var _hr = _srcEl.getBoundingClientRect();
        _heroSrcRect = { left: _hr.left, top: _hr.top, width: _hr.width, height: _hr.height };
      }

      if (_ovClockInt) clearInterval(_ovClockInt);
      try {
        gsap.to(overlay, { opacity: 0, duration: 0.35, ease: 'power2.in', onComplete: function() {
          if (overlay.parentNode) overlay.remove();

          // Trigger animations after overlay is gone
          drawBug();
          if (_heroSrcRect && res._torchEarned > 0) {
            animateTorchFly(_heroSrcRect, res._torchEarned, onFinished);
          } else {
            drawTorchBanner();
            if (onFinished) onFinished();
          }
        }});
      } catch(e) {
        overlay.remove();
        drawBug();
        drawTorchBanner();
        if (onFinished) onFinished();
      }
    }
    // 2-minute drill: persistent clock on result overlay
    if (gs.twoMinActive) {
      var _ovClock = document.createElement('div');
      _ovClock.style.cssText = "position:absolute;top:12px;right:12px;z-index:10;font-family:'Teko';font-weight:700;font-size:22px;color:#e03050;letter-spacing:1px;text-shadow:0 0 10px rgba(224,48,80,0.5);padding:4px 10px;background:rgba(0,0,0,0.5);border:1px solid rgba(224,48,80,0.3);border-radius:4px;pointer-events:none;";
      _ovClock.textContent = fmtClock(Math.max(0, gs.clockSeconds));
      overlay.appendChild(_ovClock);
      // Update clock on overlay if it ticks during result
      var _ovClockInt = setInterval(function() {
        if (!overlay.parentNode) { clearInterval(_ovClockInt); return; }
        _ovClock.textContent = fmtClock(Math.max(0, gs.clockSeconds));
      }, 500);
    }
    document.body.appendChild(overlay);

    // ── PHASE 1: COMMIT (0.2s) — screen dims, snap sound ──
    if (SND.snap) SND.snap(); else if (SND.cardSnap) SND.cardSnap(); else if (SND.click) SND.click();
    // Pass whoosh mid-animation (ball in the air). Skip on sacks — ball never released.
    if (r.playType === 'pass' && !r.isSack) { setTimeout(function(){ try { SND.passWhoosh(); } catch(e) {} }, 180); }

    // ── PHASE 2: BLACKOUT (tier-scaled tension) — field animates underneath ──
    var blackoutMs = Math.round((tier === 1 ? 50 : tier === 2 ? 400 : 700) * _speedMult);
    var blackout = document.createElement('div');
    blackout.style.cssText = 'position:absolute;inset:0;background:#000;z-index:1;opacity:0;transition:opacity ' + (blackoutMs * 0.4) + 'ms;';
    overlay.appendChild(blackout);
    requestAnimationFrame(function() { blackout.style.opacity = tier === 1 ? '0.6' : tier === 2 ? '0.8' : '0.95'; });

    setTimeout(function() {
    if (skipped) { showPostPlay(); return; }

      // ── HITSTOP — brief freeze before result visuals (sound fires first) ──
      var _hitstopMs = tier <= 1 ? 0 : tier === 2 ? 40 : isTD ? 80 : 65;
      if (_hitstopMs > 0) {
        try { gsap.set(el, { scale: 1.02 }); } catch(e) {}
        if (tier >= 3) {
          var _hsFlash = document.createElement('div');
          _hsFlash.style.cssText = 'position:fixed;inset:0;background:#fff;opacity:0.12;z-index:999;pointer-events:none;';
          document.body.appendChild(_hsFlash);
          setTimeout(function() { _hsFlash.remove(); }, _hitstopMs);
        }
      }

      setTimeout(function() {
      if (_hitstopMs > 0) { try { gsap.to(el, { scale: 1, duration: 0.15, ease: 'power2.out' }); } catch(e) {} }

      // ── PHASE 3: RESULT SLAM — result text slams in, screen shake, particles ──
      blackout.style.opacity = '0';

      // Torch card activation flash — brief orange glow when a torch card was used
      if (res._torchUsedThisSnap) {
        var _tcFlash = document.createElement('div');
        _tcFlash.style.cssText = 'position:absolute;inset:0;background:rgba(235,176,16,0.15);z-index:2;pointer-events:none;';
        overlay.appendChild(_tcFlash);
        try { gsap.to(_tcFlash, { opacity: 0, duration: 0.4, delay: 0.15, onComplete: function() { _tcFlash.remove(); } }); } catch(e) { _tcFlash.remove(); }
      }

      // Dim stays at opacity 1 (set on creation) — no hit-stop modification

      // Screen shake
      if (shakeAmt > 0) {
        var shakeAnim = tier === 1 ? 'T-micro-shake 0.15s ease-out' : 'T-clash-shake ' + (tier === 3 ? '0.4s' : '0.2s') + ' ease-out';
        el.style.animation = shakeAnim;
        setTimeout(function() { el.style.animation = ''; }, tier === 1 ? 180 : tier === 3 ? 450 : 250);
      }

      // Flash
      if (flashColor !== 'transparent') {
        var flash = document.createElement('div');
        flash.className = 'T-clash-flash';
        flash.style.background = flashColor;
        overlay.appendChild(flash);
        setTimeout(function() { flash.remove(); }, 300);
      }

      // Particles
      for (var i = 0; i < particleCount; i++) {
        var spark = document.createElement('div');
        var angle = (i / particleCount) * 360 + Math.random() * 30;
        var dist = 20 + Math.random() * (tier === 3 ? 80 : 40);
        var sz = 2 + Math.random() * 3;
        spark.style.cssText = 'position:absolute;width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;background:' + (Math.random() > 0.5 ? '#EBB010' : '#fff') + ';z-index:5;top:50%;left:50%;--sx:' + (Math.cos(angle * Math.PI / 180) * dist) + 'px;--sy:' + (Math.sin(angle * Math.PI / 180) * dist) + 'px;animation:T-clash-spark ' + (300 + Math.random() * 400) + 'ms ease-out both;';
        overlay.appendChild(spark);
      }

      // Haptic
      if (tier === 3) Haptic.bigPlay(); else if (tier === 2) Haptic.hit(); else Haptic.cardTap();

      // ── HITSTOP 2.0 — sack brutality: rotational shake + sub-bass + heavy haptic ──
      if (r.isSack && isUserOff) {
        // Rotational shake (translation + rotation, not just translateX)
        try {
          el.style.animation = 'T-rot-shake 0.55s ease-out';
          setTimeout(function() { el.style.animation = ''; }, 600);
        } catch(e) {}
        // Red vignette flash
        var sackVig = document.createElement('div');
        sackVig.style.cssText = 'position:absolute;inset:0;z-index:4;pointer-events:none;background:radial-gradient(ellipse at center,transparent 30%,rgba(255,0,64,0.32) 100%);opacity:0;';
        overlay.appendChild(sackVig);
        try {
          gsap.to(sackVig, { opacity: 1, duration: 0.12 });
          gsap.to(sackVig, { opacity: 0, duration: 0.65, delay: 0.3, onComplete: function() { sackVig.remove(); } });
        } catch(e) {}
        // Sub-bass thud (sound) + heavy haptic (Hitstop 2.0 stack)
        try { SND.bassDrop(); } catch(e) {}
        Haptic.bigHit();
      }
      // Turnover gut punch — screen recoils + offender player card "shame card"
      if ((r.isInterception || r.isFumbleLost) && isUserOff) {
        try {
          gsap.to(el, { scaleY: 0.97, duration: 0.04 });
          gsap.to(el, { scaleY: 1, duration: 0.15, delay: 0.04, ease: 'elastic.out(1, 0.5)' });
        } catch(e) {}
        Haptic.turnover();

        // ── SHAME CARD — show offender card desaturated + red shake, with verdict text
        try {
          var offender = res.featuredOff;
          if (offender) {
            var shameWrap = document.createElement('div');
            shameWrap.style.cssText =
              'position:absolute;top:50%;left:50%;z-index:25;pointer-events:none;' +
              'display:flex;flex-direction:column;align-items:center;gap:8px;' +
              'transform:translate(-50%,-50%) scale(0.6);opacity:0;';
            var shameCard = mkPlayerCardEl(offender, hTeam);
            shameCard.style.filter = 'grayscale(0.85) brightness(0.6)';
            shameCard.style.boxShadow = '0 0 30px rgba(255,0,64,0.8), 0 8px 24px rgba(0,0,0,0.85)';
            shameCard.style.border = '2px solid #ff0040';
            shameWrap.appendChild(shameCard);
            var verdictEl = document.createElement('div');
            verdictEl.style.cssText =
              "font-family:'Teko';font-weight:900;font-size:30px;color:#ff0040;letter-spacing:5px;" +
              "text-shadow:0 0 14px rgba(255,0,64,0.9), 0 4px 10px rgba(0,0,0,0.95);";
            verdictEl.textContent = r.isInterception ? 'PICKED' : 'FUMBLED';
            shameWrap.appendChild(verdictEl);
            overlay.appendChild(shameWrap);

            // Slam in + violent shake
            gsap.to(shameWrap, { opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' });
            gsap.to(shameWrap, {
              x: '+=8', duration: 0.04, repeat: 7, yoyo: true, delay: 0.3, ease: 'none'
            });
            // Hold then exit (drift down + fade)
            setTimeout(function() {
              try {
                gsap.to(shameWrap, { opacity: 0, y: 30, duration: 0.4, ease: 'power2.in',
                  onComplete: function() { if (shameWrap.parentNode) shameWrap.remove(); } });
              } catch(e) { if (shameWrap.parentNode) shameWrap.remove(); }
            }, 1700);
          }
        } catch(e) {}
      }

      // ── TROPHY STAMPS — fire on user-positive defensive moments ──
      // (User is on defense, CPU is on offense, user just made a play)
      if (!isUserOff) {
        var defenderName = res.featuredDef && res.featuredDef.name;
        if (r.isInterception)       triggerTrophyStamp('pickedOff', defenderName);
        else if (r.isFumbleLost)    triggerTrophyStamp('strip',     defenderName);
        else if (r.isSack && Math.abs(r.yards) >= 6) triggerTrophyStamp('sack', defenderName);
        else if (r._fourthDownStop) triggerTrophyStamp('stand',     defenderName);
      }

      // Sound — crowd spikes on big plays, holds, then settles
      var _settleState = gs.twoMinActive ? 'two_min_drill' : 'normal_play';
      if (isTD && isUserOff) { SND.td(); AudioStateManager.setState('touchdown'); AudioStateManager.holdThenSettle(4000, _settleState); }
      else if (isTD && !isUserOff) { SND.turnover(); AudioStateManager.setState('turnover'); AudioStateManager.holdThenSettle(3000, _settleState); }
      else if (isGoodForUser && tier >= 2) { SND.bigPlay(); AudioStateManager.setState('big_moment'); AudioStateManager.holdThenSettle(2000, _settleState); }
      else if (isBadForUser) { SND.turnover(); AudioStateManager.setState('turnover'); AudioStateManager.holdThenSettle(3000, _settleState); }
      else if (r.isIncomplete) { SND.incomp(); setTimeout(function(){ try { SND.crowdOoh(); } catch(e) {} }, 350); AudioStateManager.setState(_settleState); }
      else if (tier === 1 && r.yards > 0) { SND.hit(); AudioStateManager.setState(_settleState); }
      else { AudioStateManager.setState(_settleState); }
      // Zero or negative yards = no result sound (silence is intentional), but
      // we still reset the crowd state so it doesn't float from the previous play

      // Ambient particle intensity boost
      if (tier >= 3 && isGoodForUser) _boostParticles(true);
      else if (tier >= 3 && isBadForUser) _boostParticles(false);

      // Field pulse at ball position
      if (isTD) fieldPulseAtBall('rgba(235,176,16,0.4)');
      else if (r.isInterception || r.isFumbleLost) fieldPulseAtBall('rgba(255,36,36,0.4)');
      else if (isGoodForUser && tier >= 2) fieldPulseAtBall('rgba(0,255,68,0.3)');

      // ── PHASE 4: SETTLE — proceed to result display ──
      var settleDelay = tier === 1 ? 100 : tier === 2 ? 300 : 500;
      setTimeout(function() {
      if (skipped) { showPostPlay(); return; }
      showPostPlay();
      }, settleDelay);
      }, _hitstopMs); // hitstop delay
    }, blackoutMs); // result slam after blackout

    // ── POST-PLAY 4-BEAT DISPLAY (Phase 6) ──
  function showPostPlay() {
    if (_settled) return;
      overlay.onclick = null;
    if (blackout) blackout.style.opacity = '0';
      // Dim stays at opacity 1 — solid dark background for result text

      // ── LAYER 4: Visual weight — size based on user sentiment, not raw yards ──
      var level = tier;
      var gotFirstDown = res.gotFirstDown;
      // Scale font — hero text should DOMINATE the screen
      var textLen = resultText.length;
      var ydsFontSize, resultGlow, resultAnim, resultPos;
      if (isGoodForUser) {
        var goodBase = level === 3 ? 72 : level === 2 ? 64 : 56;
        if (textLen > 12) goodBase = Math.min(goodBase, 48);
        else if (textLen > 8) goodBase = Math.min(goodBase, 56);
        ydsFontSize = goodBase + 'px';
        resultGlow = 'text-shadow:0 0 24px ' + resultColor + '60,0 0 48px ' + resultColor + '30;';
        resultAnim = 'animation:T-clash-yds 0.4s cubic-bezier(0.34,1.56,0.64,1) both;';
        resultPos = '';
      } else if (isBadForUser) {
        var badBase = level === 3 ? 52 : 44;
        if (textLen > 12) badBase = Math.min(badBase, 36);
        ydsFontSize = badBase + 'px';
        resultGlow = 'text-shadow:0 0 16px ' + resultColor + '40;';
        resultAnim = 'animation:T-clash-yds 0.25s ease-out both;';
        resultPos = '';
      } else {
        ydsFontSize = textLen > 10 ? '44px' : '52px';
        resultGlow = '';
        resultAnim = 'animation:T-clash-yds 0.3s ease-out both;';
        resultPos = '';
      }

      // ── LAYER 5: Timing — good lingers, bad moves on fast ──
      var holdMultiplier = isGoodForUser ? 1.5 : isBadForUser ? 0.9 : 1.0;
      var totalDur = Math.round((level === 3 ? 6000 : level === 2 ? 4500 : 3200) * holdMultiplier * getSpeedMultiplier());

      // Enforce minimum display times per result type
      if (r.isIncomplete && totalDur > 1500) totalDur = 1500;
      if (r.yards === 0 && !r.isSack && !r.isIncomplete && totalDur > 1800) totalDur = 1800;

      // Detect game-winning/go-ahead score
      var preSnapScore = res._preSnap;
      var wasTrailing = false;
      var wasLead = false;
      if (preSnapScore && isUserOff) {
        var userScorePre = preSnapScore.ctScore;
        var oppScorePre = preSnapScore.irScore;
        wasTrailing = userScorePre <= oppScorePre;
        var userScoreNow = gs.ctScore;
        var oppScoreNow = gs.irScore;
        wasLead = userScoreNow > oppScoreNow;
      }
      var isGoAhead = wasTrailing && wasLead;
      var isClutch = isGoAhead && (gs.half === 2 || gs.twoMinActive);

      // ── TD CELEBRATION — separate flow for touchdowns ──
      if (isTD && isUserOff && !res._isConversion) {
        // USER SCORES — 4-beat cinematic
        totalDur = 5500;
        var teamAccent = hTeam.accent || '#EBB010';

        // ── Beat 1: Impact (0-0.3s) ──
        var tdDim = document.createElement('div');
        tdDim.style.cssText = 'position:absolute;inset:0;background:#0A0804;opacity:0.75;z-index:8;';
        overlay.appendChild(tdDim);

        var tdFlash = document.createElement('div');
        tdFlash.style.cssText = 'position:absolute;inset:0;background:rgba(0,255,68,0.35);z-index:12;pointer-events:none;';
        overlay.appendChild(tdFlash);
        try { gsap.to(tdFlash, { opacity: 0, duration: 0.3, onComplete: function() { tdFlash.remove(); } }); } catch(e) { tdFlash.remove(); }

        shakeScreen(7);

        var accentTop = document.createElement('div');
        accentTop.style.cssText = 'position:absolute;top:0;left:0;right:0;height:4px;background:' + teamAccent + ';z-index:13;opacity:0;';
        var accentBot = document.createElement('div');
        accentBot.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:4px;background:' + teamAccent + ';z-index:13;opacity:0;';
        overlay.appendChild(accentTop); overlay.appendChild(accentBot);
        try { gsap.to([accentTop, accentBot], { opacity: 1, duration: 0.15 }); } catch(e) { accentTop.style.opacity='1'; accentBot.style.opacity='1'; }

        // Radial particle ring burst (Rocket League style)
        for (var _pi = 0; _pi < 40; _pi++) {
          var _part = document.createElement('div');
          var _angle = (_pi / 40) * 360;
          var _dist = 120 + Math.random() * 80;
          var _pSz = 2 + Math.random() * 3;
          var _pColor = [teamAccent, '#00ff44', '#EBB010', '#fff', '#FF4511'][_pi % 5];
          _part.style.cssText = 'position:absolute;top:50%;left:50%;width:' + _pSz + 'px;height:' + _pSz + 'px;border-radius:50%;background:' + _pColor + ';z-index:14;pointer-events:none;opacity:0;';
          overlay.appendChild(_part);
          try {
            gsap.to(_part, {
              x: Math.cos(_angle * Math.PI / 180) * _dist,
              y: Math.sin(_angle * Math.PI / 180) * _dist,
              opacity: 1, duration: 0.15, delay: 0.1
            });
            gsap.to(_part, {
              opacity: 0, scale: 0, duration: 0.4, delay: 0.3,
              onComplete: function() { if (_part.parentNode) _part.remove(); }
            });
          } catch(e) { _part.remove(); }
        }

        // Haptic
        Haptic.touchdown();

        // ── WALKOUT — final beat AFTER the TD result has fully read ──
        // Scorer = whoever the user featured on the snap. CSS transitions only
        // (no GSAP percent math) so it works regardless of speed mode.
        // Lands at 2500ms, exits at 4200ms — safely inside aftermathDur (5000ms).
        var scorer = res.featuredOff || (offRoster && offRoster[0]);
        if (scorer) {
          var walkoutCard = mkPlayerCardEl(scorer, hTeam);
          walkoutCard.style.position = 'absolute';
          walkoutCard.style.left = '50%';
          walkoutCard.style.top = '50%';
          walkoutCard.style.transform = 'translate(-50%, -50%)';
          walkoutCard.style.zIndex = '20';
          walkoutCard.style.pointerEvents = 'none';
          walkoutCard.style.opacity = '0';
          walkoutCard.style.boxShadow =
            '0 0 60px 8px ' + teamAccent +
            ', 0 0 120px 18px ' + teamAccent + '66' +
            ', 0 14px 44px rgba(0,0,0,0.85)';
          overlay.appendChild(walkoutCard);

          // Fly in
          setTimeout(function() {
            walkoutCard.style.transition = 'opacity 0.5s ease-out, transform 0.55s cubic-bezier(0.34,1.56,0.64,1)';
            walkoutCard.style.opacity = '1';
            walkoutCard.style.transform = 'translate(-50%, -50%) scale(1.45)';
            try { SND.shimmer(); } catch(e) {}
            // Fade existing TD text/commentary/score so the card owns the frame
            try { if (resultWrap) { resultWrap.style.transition = 'opacity 0.35s ease-out'; resultWrap.style.opacity = '0'; } } catch(e) {}
          }, 2500);

          // Exit — slide up and fade
          setTimeout(function() {
            walkoutCard.style.transition = 'opacity 0.5s ease-in, transform 0.5s ease-in';
            walkoutCard.style.opacity = '0';
            walkoutCard.style.transform = 'translate(-50%, -150%) scale(1.0)';
            setTimeout(function() { if (walkoutCard.parentNode) walkoutCard.remove(); }, 600);
          }, 4200);
        }

        // ── Beat 2: Reveal (0.3-0.9s) ──
        var resultWrap = document.createElement('div');
        resultWrap.className = 'T-clash-result';
        resultWrap.style.cssText = 'z-index:10;gap:6px;';
        overlay.appendChild(resultWrap);

        // Team name — per-team wordmark, T1 hero at ~60% of heroSize so it
        // pairs visually with the TOUCHDOWN 56px treatment without crowding.
        var _tdWmCfg = TEAM_WORDMARKS[hTeam.id] || {};
        var _tdWmSize = Math.max(20, Math.round((_tdWmCfg.heroSize || 40) * 0.6));
        var teamNameEl = renderTeamWordmark(hTeam.id, 't1', { mascot: true, fontSize: _tdWmSize });
        if (!teamNameEl) {
          teamNameEl = document.createElement('div');
          teamNameEl.style.cssText = "font-family:'Oswald';font-weight:700;font-size:18px;color:" + teamAccent + ";letter-spacing:6px;text-shadow:0 0 16px " + teamAccent + "66;";
          teamNameEl.textContent = hTeam.name.toUpperCase();
        }
        teamNameEl.style.opacity = '0';
        teamNameEl.style.transform = 'translateY(8px)';
        resultWrap.appendChild(teamNameEl);
        try { gsap.to(teamNameEl, { opacity: 1, y: 0, duration: 0.2, delay: 0.3, ease: 'power2.out' }); } catch(e) { teamNameEl.style.opacity='1'; }

        // "TOUCHDOWN" — chrome green gradient. TDs don't have a pill, so the
        // TD hero text doubles as the torch fly source.
        var tdTextEl = document.createElement('div');
        tdTextEl.className = 'T-torch-fly-source';
        tdTextEl.style.cssText = "font-family:'Teko';font-weight:900;font-size:56px;letter-spacing:3px;line-height:1;background:linear-gradient(180deg,#fff 0%,#00ff44 30%,#fff 50%,#00ff44 70%,#fff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 24px rgba(0,255,68,0.6)) drop-shadow(0 0 48px rgba(0,255,68,0.3)) drop-shadow(0 6px 12px rgba(0,0,0,0.9));opacity:0;transform:scale(0.3);white-space:nowrap;";
        tdTextEl.textContent = 'TOUCHDOWN';
        resultWrap.appendChild(tdTextEl);
        try { gsap.to(tdTextEl, { opacity: 1, scale: 1, duration: 0.25, delay: 0.35, ease: 'back.out(2.5)' }); } catch(e) { tdTextEl.style.opacity='1'; tdTextEl.style.transform='scale(1)'; }

        // Auto-size to fit
        requestAnimationFrame(function() {
          var maxW = (overlay.offsetWidth || 375) - 40;
          var fs = 56;
          while (tdTextEl.scrollWidth > maxW && fs > 28) { fs -= 2; tdTextEl.style.fontSize = fs + 'px'; }
        });

        // Second green flash on text slam
        setTimeout(function() {
          var flash2 = document.createElement('div');
          flash2.style.cssText = 'position:absolute;inset:0;background:rgba(0,255,68,0.2);z-index:12;pointer-events:none;';
          overlay.appendChild(flash2);
          try { gsap.to(flash2, { opacity: 0, duration: 0.2, onComplete: function() { flash2.remove(); } }); } catch(e) { flash2.remove(); }
        }, 350);

        // Radial glow expanding behind
        var glow = document.createElement('div');
        glow.style.cssText = 'position:absolute;top:50%;left:50%;width:0;height:0;border-radius:50%;background:radial-gradient(circle,rgba(0,255,68,0.15),transparent 70%);z-index:9;transform:translate(-50%,-50%);pointer-events:none;';
        overlay.appendChild(glow);
        try { gsap.to(glow, { width: 700, height: 700, duration: 0.8, delay: 0.3, ease: 'power2.out' }); } catch(e) {}

        // ── Beat 3: Context (0.9-1.5s) ──
        setTimeout(function() {
          if (!overlay.parentNode) return;
          // Gradient divider
          var divider = document.createElement('div');
          divider.style.cssText = "width:60px;height:1px;background:linear-gradient(90deg,transparent,rgba(0,255,68,0.27),transparent);transform:scaleX(0);margin:4px 0;";
          resultWrap.appendChild(divider);
          try { gsap.to(divider, { scaleX: 1, duration: 0.3, ease: 'power2.out' }); } catch(e) { divider.style.transform='scaleX(1)'; }

          // Commentary
          var gameCtx = gs.getSummary();
          gameCtx.preSnapPossession = prevPoss;
          var comm = generateCommentary(res, gameCtx, hTeam.name, oTeam.name);
          setNarr(comm.line1, comm.line2 || '');

          var commEl = document.createElement('div');
          commEl.style.cssText = "font-family:'Rajdhani';font-weight:600;font-size:12px;color:rgba(255,255,255,0.6);text-shadow:0 2px 4px rgba(0,0,0,0.8);max-width:280px;text-align:center;opacity:0;transform:translateY(6px);";
          commEl.textContent = comm.line1;
          resultWrap.appendChild(commEl);
          try { gsap.to(commEl, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }); } catch(e) { commEl.style.opacity='1'; }

          // Score update
          var hS = hAbbr === 'CT' ? gs.ctScore : gs.irScore;
          var oS = hAbbr === 'CT' ? gs.irScore : gs.ctScore;
          var scoreEl = document.createElement('div');
          scoreEl.style.cssText = "display:flex;align-items:baseline;gap:8px;margin-top:6px;opacity:0;";
          scoreEl.innerHTML =
            "<span style=\"font-family:'Teko';font-weight:900;font-size:28px;color:#fff;text-shadow:0 0 12px " + teamAccent + "66;\">" + hTeam.name + " " + hS + "</span>" +
            "<span style=\"font-family:'Rajdhani';font-weight:600;font-size:14px;color:#555;\">\u2014</span>" +
            "<span style=\"font-family:'Teko';font-weight:700;font-size:20px;color:rgba(255,255,255,0.4);\">" + oS + " " + oTeam.name + "</span>";
          resultWrap.appendChild(scoreEl);
          try { gsap.to(scoreEl, { opacity: 1, duration: 0.3, delay: 0.15, ease: 'power2.out' }); } catch(e) { scoreEl.style.opacity='1'; }
        }, 900);

        // Team phrase
        var celeb = getTeam(GS.team).celebration;
        setTimeout(function() {
          if (!overlay.parentNode) return;
          var phraseEl = document.createElement('div');
          phraseEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:14px;color:" + teamAccent + ";letter-spacing:2px;opacity:0;text-shadow:0 0 12px " + teamAccent + "40;";
          phraseEl.textContent = celeb.phrases[Math.floor(Math.random() * celeb.phrases.length)];
          resultWrap.appendChild(phraseEl);
          try { gsap.to(phraseEl, { opacity: 1, duration: 0.3 }); } catch(e) { phraseEl.style.opacity = '1'; }
        }, 1000);

        // ── Beat 4: Reward (1.5-2.5s) — TORCH cascade ──
        var cascadeWrap = document.createElement('div');
        cascadeWrap.style.cssText = 'position:absolute;bottom:22%;left:50%;transform:translateX(-50%);z-index:11;text-align:center;pointer-events:none;';
        overlay.appendChild(cascadeWrap);

        var cascadeItems = [{ label: 'TD', pts: 6, delay: 1500 }];
        var bonusPts = Math.max(0, (res._torchEarned || 0) - 6);
        if (bonusPts > 0) cascadeItems.push({ label: 'BONUS', pts: bonusPts, delay: 1900 });

        cascadeItems.forEach(function(item) {
          setTimeout(function() {
            var line = document.createElement('div');
            line.style.cssText = "display:flex;align-items:center;gap:4px;justify-content:center;opacity:0;transform:translateY(10px) scale(0.8);";
            line.innerHTML = flameSilhouetteSVG(18, '#EBB010') +
              "<span style=\"font-family:'Teko';font-weight:700;font-size:20px;color:#EBB010;letter-spacing:3px;text-shadow:0 0 8px rgba(235,176,16,0.4);\">" + item.label + " +" + item.pts + "</span>";
            cascadeWrap.appendChild(line);
            try { gsap.to(line, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(1.5)' }); } catch(e) { line.style.opacity='1'; line.style.transform='none'; }
            try { SND.chime(); } catch(e) {}
          }, item.delay);
        });

        // Confetti — 3 waves of 12 particles
        function spawnTdConfetti(ov, tAccent, count, delay) {
          var colors = ['#00ff44', '#EBB010', '#FF4511', '#fff', tAccent];
          setTimeout(function() {
            if (!ov.parentNode) return;
            for (var i = 0; i < count; i++) {
              var c = document.createElement('div');
              var x = 5 + Math.random() * 90;
              var sz = 3 + Math.random() * 5;
              var dur = 1800 + Math.random() * 1500;
              var drift = (Math.random() - 0.5) * 80;
              var rot = 360 + Math.random() * 1080;
              var col = colors[i % colors.length];
              c.style.cssText = 'position:absolute;top:-10px;left:' + x + '%;width:' + sz + 'px;height:' + sz + 'px;background:' + col + ';border-radius:1px;opacity:0.9;z-index:11;--drift:' + drift + 'px;--rot:' + rot + 'deg;animation:T-td-confetti ' + dur + 'ms ease-in both;';
              ov.appendChild(c);
              c.addEventListener('animationend', function() { if (c.parentNode) c.remove(); }, { once: true });
            }
          }, delay);
        }
        spawnTdConfetti(overlay, teamAccent, 12, 200);
        spawnTdConfetti(overlay, teamAccent, 12, 800);
        spawnTdConfetti(overlay, teamAccent, 12, 1400);

        // ── CLUTCH CELEBRATION — go-ahead score in 2nd half or 2-minute drill ──
        if (isClutch) {
          totalDur = 6000;

          setTimeout(function() {
            var clutchEl = document.createElement('div');
            clutchEl.style.cssText = "position:absolute;top:12%;left:50%;transform:translateX(-50%);z-index:13;font-family:'Teko';font-weight:700;font-size:20px;letter-spacing:4px;opacity:0;white-space:nowrap;pointer-events:none;" +
              "color:#00ff44;text-shadow:0 0 20px rgba(0,255,68,0.6);";
            var _clutchText = gs.twoMinActive ? 'CLUTCH DRIVE!' : 'GO-AHEAD SCORE!';
            if (preSnapScore) {
              var _trailingBy = oppScorePre - userScorePre;
              if (_trailingBy >= 14 && isGoAhead) _clutchText = 'COMEBACK!';
            }
            clutchEl.textContent = _clutchText;
            overlay.appendChild(clutchEl);
            try {
              gsap.to(clutchEl, { opacity: 1, y: -5, duration: 0.4, ease: 'back.out(1.5)' });
              gsap.to(clutchEl, { opacity: 0, duration: 0.3, delay: 2.5 });
            } catch(e) { clutchEl.style.opacity = '1'; }
          }, 1000);

          // Extra confetti burst (30 more green particles)
          setTimeout(function() {
            for (var ci2 = 0; ci2 < 30; ci2++) {
              (function() {
                var conf2 = document.createElement('div');
                var cx2 = 10 + Math.random() * 80;
                var cs2 = 3 + Math.random() * 5;
                conf2.style.cssText = 'position:absolute;top:-10px;left:' + cx2 + '%;width:' + cs2 + 'px;height:' + cs2 + 'px;background:#00ff44;border-radius:1px;z-index:11;pointer-events:none;--drift:' + ((Math.random()-0.5)*60) + 'px;--rot:' + (360+Math.random()*1080) + 'deg;';
                overlay.appendChild(conf2);
                try {
                  gsap.to(conf2, { y: window.innerHeight + 20, rotation: 720, duration: 2 + Math.random() * 2, ease: 'power1.in', delay: Math.random() * 0.5, onComplete: function() { if (conf2.parentNode) conf2.remove(); } });
                } catch(e) {}
              })();
            }
          }, 1200);

          Haptic.touchdown();
        }

        // First-ever TD explainer (one-time, teaches economy)
        var _firstTdExplained = localStorage.getItem('torch_first_td_done');
        if (!_firstTdExplained) {
          localStorage.setItem('torch_first_td_done', '1');
          setTimeout(function() {
            if (!overlay.parentNode) return;
            var explainer = document.createElement('div');
            explainer.style.cssText = "position:absolute;bottom:12%;left:50%;transform:translateX(-50%);z-index:14;text-align:center;max-width:300px;padding:12px 16px;background:rgba(0,0,0,0.85);border:1px solid #EBB01044;border-radius:8px;opacity:0;pointer-events:none;";
            explainer.innerHTML =
              "<div style=\"font-family:'Teko';font-weight:700;font-size:16px;color:#EBB010;letter-spacing:2px;\">YOUR SCORE IS YOUR WALLET</div>" +
              "<div style=\"font-family:'Rajdhani';font-size:11px;color:#ccc;margin-top:4px;line-height:1.3;\">TORCH points are earned every play. Spend them on powerful single-use cards in the TORCH Store.</div>" +
              "<div style=\"font-family:'Rajdhani';font-size:9px;color:#888;margin-top:6px;\">The store opens after big plays</div>";
            overlay.appendChild(explainer);
            try {
              gsap.to(explainer, { opacity: 1, duration: 0.3 });
              gsap.to(explainer, { opacity: 0, duration: 0.3, delay: 3.5, onComplete: function() { explainer.remove(); } });
            } catch(e) { explainer.style.opacity = '1'; setTimeout(function() { explainer.remove(); }, 4000); }
          }, 3000);
        }

        // drawBug deferred — score updates after overlay clears
        drawField();

      } else if (isTD && !isUserOff && !res._isConversion) {
        // OPPONENT SCORES — impactful disappointment
        totalDur = 3200;
        
        // Red alert flash
        var failFlash = document.createElement('div');
        failFlash.style.cssText = 'position:absolute;inset:0;background:rgba(255,0,64,0.25);z-index:12;pointer-events:none;';
        overlay.appendChild(failFlash);
        try { gsap.to(failFlash, { opacity: 0, duration: 0.4, onComplete: function() { failFlash.remove(); } }); } catch(e) { failFlash.remove(); }
        
        shakeScreen(4);
        Haptic.hit();

        var oppTdWrap = document.createElement('div');
        oppTdWrap.className = 'T-clash-result';
        oppTdWrap.style.cssText = 'z-index:10;gap:4px;';
        overlay.appendChild(oppTdWrap);

        oppTdWrap.innerHTML = 
          "<div style=\"font-family:'Teko';font-weight:900;font-size:48px;color:#fff;letter-spacing:2px;line-height:1;text-shadow:0 0 30px rgba(255,0,64,0.5);opacity:0;transform:scale(0.8);\" id='opp-td-main'>TOUCHDOWN!</div>" +
          "<div style=\"font-family:'Oswald';font-weight:700;font-size:14px;color:" + oTeam.accent + ";letter-spacing:4px;margin-top:8px;opacity:0;\" id='opp-td-team'>" + oTeam.name.toUpperCase() + "</div>";
        
        var om = oppTdWrap.querySelector('#opp-td-main');
        var ot = oppTdWrap.querySelector('#opp-td-team');

        try {
          gsap.to(om, { opacity: 1, scale: 1, duration: 0.4, delay: 0.1, ease: 'back.out(1.5)' });
          gsap.to(ot, { opacity: 1, duration: 0.3, delay: 0.3 });
        } catch(e) { om.style.opacity='1'; om.style.transform='none'; ot.style.opacity='1'; }

        // Red vignette
        var vig = document.createElement('div');
        vig.style.cssText = 'position:absolute;inset:0;background:radial-gradient(circle, transparent 40%, rgba(255,0,64,0.15) 100%);z-index:9;opacity:0;pointer-events:none;';
        overlay.appendChild(vig);
        try { gsap.to(vig, { opacity: 1, duration: 0.6 }); } catch(e) {}

        setTimeout(function() {
          var gameCtx = gs.getSummary();
          gameCtx.preSnapPossession = prevPoss;
          var comm = generateCommentary(res, gameCtx, hTeam.name, oTeam.name);
          setNarr(comm.line1, '');
        }, 400);

        // drawBug deferred — score updates after overlay clears
        drawField();

      } else if (res._isConversion) {
        // ── CONVERSION RESULT ──
        var convIsGood = r.isComplete || r.isTouchdown;
        var _convPreSnap = res._preSnap || {};
        var convIs3pt = _convPreSnap.distance === 10 || _convPreSnap.yardsToEndzone === 10;
        var convLabel = convIs3pt ? '3-POINT' : '2-POINT';
        var convPts = convIs3pt ? 3 : 2;

        if (convIsGood) {
          totalDur = 3500;
          // GOOD! — chrome green gradient
          var convWrap = document.createElement('div');
          convWrap.className = 'T-clash-result';
          convWrap.style.cssText = 'z-index:10;gap:6px;';
          overlay.appendChild(convWrap);

          var convTypeEl = document.createElement('div');
          convTypeEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#888;letter-spacing:3px;opacity:0;transform:translateY(8px);";
          convTypeEl.textContent = convLabel + ' CONVERSION';
          convWrap.appendChild(convTypeEl);
          try { gsap.to(convTypeEl, { opacity: 1, y: 0, duration: 0.2, delay: 0.1 }); } catch(e) { convTypeEl.style.opacity='1'; }

          var convHero = document.createElement('div');
          convHero.style.cssText = "font-family:'Teko';font-weight:900;font-size:56px;letter-spacing:3px;line-height:1;background:linear-gradient(180deg,#fff 0%,#00ff44 30%,#fff 50%,#00ff44 70%,#fff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 24px rgba(0,255,68,0.6)) drop-shadow(0 6px 12px rgba(0,0,0,0.9));opacity:0;transform:scale(0.3);";
          convHero.textContent = 'GOOD!';
          convWrap.appendChild(convHero);
          try { gsap.to(convHero, { opacity: 1, scale: 1, duration: 0.25, delay: 0.15, ease: 'back.out(2.5)' }); } catch(e) { convHero.style.opacity='1'; convHero.style.transform='scale(1)'; }

          var convPtsEl = document.createElement('div');
          convPtsEl.style.cssText = "display:flex;align-items:center;gap:4px;opacity:0;transform:translateY(10px) scale(0.8);margin-top:4px;";
          convPtsEl.innerHTML = flameSilhouetteSVG(18, '#EBB010') +
            "<span style=\"font-family:'Teko';font-weight:700;font-size:22px;color:#EBB010;text-shadow:0 0 8px rgba(235,176,16,0.4);letter-spacing:1px;\">+" + convPts + "</span>";
          convWrap.appendChild(convPtsEl);
          try { gsap.to(convPtsEl, { opacity: 1, y: 0, scale: 1, duration: 0.3, delay: 0.4, ease: 'back.out(1.5)' }); } catch(e) { convPtsEl.style.opacity='1'; convPtsEl.style.transform='none'; }

          flashField('rgba(0,255,68,0.3)', 400);
          shakeScreen(3);

          // Confetti — 1 wave of 12
          var convColors = ['#00ff44', '#EBB010', '#FF4511', '#fff'];
          setTimeout(function() {
            if (!overlay.parentNode) return;
            for (var ci = 0; ci < 12; ci++) {
              var c = document.createElement('div');
              var x = 5 + Math.random() * 90;
              var sz = 3 + Math.random() * 5;
              var dur = 1800 + Math.random() * 1500;
              var drift = (Math.random() - 0.5) * 80;
              var rot = 360 + Math.random() * 1080;
              c.style.cssText = 'position:absolute;top:-10px;left:' + x + '%;width:' + sz + 'px;height:' + sz + 'px;background:' + convColors[ci % convColors.length] + ';border-radius:1px;opacity:0.9;z-index:11;--drift:' + drift + 'px;--rot:' + rot + 'deg;animation:T-td-confetti ' + dur + 'ms ease-in both;';
              overlay.appendChild(c);
              c.addEventListener('animationend', function() { if (c.parentNode) c.remove(); }, { once: true });
            }
          }, 200);

          var resultWrap = convWrap;
        } else {
          totalDur = 2200;
          // NO GOOD
          var convWrap2 = document.createElement('div');
          convWrap2.className = 'T-clash-result';
          convWrap2.style.cssText = 'z-index:10;gap:6px;';
          overlay.appendChild(convWrap2);

          var convTypeEl2 = document.createElement('div');
          convTypeEl2.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#888;letter-spacing:3px;opacity:0;transform:translateY(8px);";
          convTypeEl2.textContent = convLabel + ' CONVERSION';
          convWrap2.appendChild(convTypeEl2);
          try { gsap.to(convTypeEl2, { opacity: 1, y: 0, duration: 0.2, delay: 0.1 }); } catch(e) { convTypeEl2.style.opacity='1'; }

          var convHero2 = document.createElement('div');
          convHero2.style.cssText = "font-family:'Teko';font-weight:900;font-size:56px;color:#ff0040;letter-spacing:3px;line-height:1;text-shadow:0 0 20px rgba(255,0,64,0.4),0 2px 6px rgba(0,0,0,0.8);opacity:0;transform:scale(0.3);";
          convHero2.textContent = 'NO GOOD';
          convWrap2.appendChild(convHero2);
          try { gsap.to(convHero2, { opacity: 1, scale: 1, duration: 0.25, delay: 0.15, ease: 'back.out(2.5)' }); } catch(e) { convHero2.style.opacity='1'; convHero2.style.transform='scale(1)'; }

          flashField('rgba(255,0,64,0.3)', 400);

          var resultWrap = convWrap2;
        }

        setTimeout(function() {
          var gameCtx = gs.getSummary();
          gameCtx.preSnapPossession = prevPoss;
          var comm = generateCommentary(res, gameCtx, hTeam.name, oTeam.name);
          setNarr(comm.line1, '');
        }, 400);

        // drawBug deferred — score updates after overlay clears
        drawField();

      } else {
        // ── NON-TD: Normal result display ──
        // Single flex column container — all elements flow vertically, no absolute overlap
        //
        // Beat schedule (cadence flag ON → real 5-beat cadence, OFF → legacy cluster):
        //   BEAT 1 (0ms)        = hero slam + shake/particles/flash (runs synchronously below)
        //   BEAT 2 (BEAT_CTX)   = FIRST DOWN stamp or down & distance, narrative strip audio cue
        //   BEAT 3 (BEAT_STORY) = single commentary line, milestone
        //   BEAT 4 (BEAT_REWARD)= TORCH points card + sources breakdown + combo pops
        //   BEAT 5 (aftermathDur) = doSettle (already scheduled below)
        var BEAT_CTX    = _cadenceOn ? _beatGap     : 800;
        var BEAT_STORY  = _cadenceOn ? _beatGap * 2 : 800;
        var BEAT_REWARD = _cadenceOn ? _beatGap * 3 : 2000;
        // Hoisted so BEAT 3 (story) can read what BEAT 2 (context) generated
        var _commLine1 = '', _commLine2 = '';
        // FIRST DOWN moves to BEAT 2 as its own anchor instead of piling onto the hero
        var _firstDownStamp = false;

        var nonTdWrap = document.createElement('div');
        nonTdWrap.style.cssText = 'position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;gap:4px;pointer-events:none;max-width:90%;';

        // Hero text — the fly source on non-TD plays is the TORCH pill below
        // (see BEAT 4 REWARD), NOT this hero text. Hero stays clean.
        var heroEl = document.createElement('div');
        heroEl.style.cssText = "font-family:'Teko';font-weight:900;font-size:" + ydsFontSize + ";color:" + resultColor + ";letter-spacing:3px;line-height:1;text-shadow:0 0 24px " + resultColor + "60,0 0 48px " + resultColor + "20,0 2px 6px rgba(0,0,0,0.8);opacity:0;transform:scale(0.3);text-align:center;";
        heroEl.textContent = resultText;
        nonTdWrap.appendChild(heroEl);

        // Safety gets chrome red gradient like TD gets chrome green
        if (r.isSafety) {
          heroEl.style.background = 'linear-gradient(180deg,#fff 0%,#ff0040 30%,#fff 50%,#ff0040 70%,#fff 100%)';
          heroEl.style.webkitBackgroundClip = 'text';
          heroEl.style.webkitTextFillColor = 'transparent';
          heroEl.style.backgroundClip = 'text';
          heroEl.style.filter = 'drop-shadow(0 0 16px rgba(255,0,64,0.5))';
        }

        // Context label (below hero)
        var ctxLabel = document.createElement('div');
        ctxLabel.style.cssText = "font-family:'Oswald';font-weight:700;font-size:18px;letter-spacing:3px;text-shadow:0 2px 4px rgba(0,0,0,0.8);opacity:0;transform:translateY(8px);";
        if (r.isSack) {
          // Hero: "SACK" or "SACKED!" — context adds the yardage detail
          ctxLabel.textContent = r.yards !== 0 ? 'LOSS OF ' + Math.abs(r.yards) : '';
          ctxLabel.style.color = resultColor;
        } else if (r.isSafety) {
          ctxLabel.textContent = '+2 POINTS';
          ctxLabel.style.color = '#ff0040';
        } else if (r.isInterception || r.isFumbleLost) {
          // Hero: "INTERCEPTED"/"PICKED OFF!"/"FUMBLE!" — turnover sub below handles the rest
          ctxLabel.textContent = '';
        } else if (r.isIncomplete) {
          // Hero: "INCOMPLETE" — implies no gain, no need to say it
          ctxLabel.textContent = '';
        } else if (r.yards === 0 && !isUserOff) {
          // Hero: "STUFFED!" on defense — no context needed (same word)
          ctxLabel.textContent = '';
        } else if (r.yards === 0) {
          // Hero: "NO GAIN" on offense — add "STUFFED" for flavor
          ctxLabel.textContent = 'STUFFED';
          ctxLabel.style.color = '#FF6B00';
        } else if (r.yards > 0 && gotFirstDown) {
          // FIRST DOWN lands in BEAT 2 as its own stamp — not piled on the hero
          ctxLabel.textContent = '';
          _firstDownStamp = true;
        } else {
          // Hero already shows "+X" or "-X" — no context needed
          ctxLabel.textContent = '';
        }
        if (ctxLabel.textContent) nonTdWrap.appendChild(ctxLabel);

        // Gradient divider after hero+context
        var divider = document.createElement('div');
        divider.style.cssText = "width:80px;height:1px;background:linear-gradient(90deg,transparent," + resultColor + "44,transparent);margin:8px 0;transform:scaleX(0);";
        nonTdWrap.appendChild(divider);

        // On user turnovers (INT thrown / fumble lost), the Shame Card is the
        // hero — fired earlier in run3BeatSnap. We HIDE the hero text, divider,
        // and turnover subtitle here so the screen isn't cluttered with 4
        // overlapping elements (big "FUMBLE" + shame card + "Possession lost."
        // + "FUMBLED" verdict). On defense-forced turnovers (good for user),
        // there's no shame card and the hero + "YOUR BALL!" celebration stays.
        var isUserTurnover = (r.isInterception || r.isFumbleLost) && isUserOff && !res._isConversion;
        if (isUserTurnover) {
          heroEl.style.display = 'none';
          divider.style.display = 'none';
        }

        // Turnover sub-label (inside the flow, not absolute).
        // Suppressed on user turnovers — the shame card shows "FUMBLED"/"PICKED" already.
        if ((r.isInterception || r.isFumbleLost) && !res._isConversion && !isUserTurnover) {
          var turnoverSub = document.createElement('div');
          turnoverSub.style.cssText = "font-family:'Teko';font-weight:700;font-size:18px;letter-spacing:3px;text-shadow:0 0 12px rgba(0,255,68,0.4);opacity:0;transform:translateY(6px);margin-top:4px;";
          turnoverSub.style.color = '#00ff44';
          turnoverSub.textContent = 'YOUR BALL!';
          nonTdWrap.appendChild(turnoverSub);
        }

        // Radial glow for big plays (tier >= 2)
        if (tier >= 2 && !r.isIncomplete) {
          var glow = document.createElement('div');
          glow.style.cssText = 'position:absolute;top:50%;left:50%;width:0;height:0;border-radius:50%;background:radial-gradient(circle,' + resultColor + '20,transparent 70%);z-index:0;transform:translate(-50%,-50%);pointer-events:none;';
          overlay.appendChild(glow);
          try { gsap.to(glow, { width: 400, height: 400, duration: 0.6, ease: 'power2.out' }); } catch(e) {}
        }

        overlay.appendChild(nonTdWrap);
        var resultWrap = nonTdWrap;

        // GSAP stagger — sequential delays
        try {
          gsap.to(heroEl, { opacity: 1, scale: 1, duration: 0.25, delay: 0, ease: 'back.out(2.5)' });
          var _d2 = 0.15;
          if (ctxLabel.textContent) { gsap.to(ctxLabel, { opacity: 1, y: 0, duration: 0.2, delay: _d2, ease: 'power2.out' }); _d2 += 0.15; }
          gsap.to(divider, { scaleX: 1, duration: 0.3, delay: _d2, ease: 'power2.out' }); _d2 += 0.1;
          if (turnoverSub) { gsap.to(turnoverSub, { opacity: 1, y: 0, duration: 0.25, delay: _d2, ease: 'back.out(1.5)' }); }
        } catch(e) {
          heroEl.style.opacity = '1'; heroEl.style.transform = 'scale(1)';
          if (ctxLabel.textContent) { ctxLabel.style.opacity = '1'; ctxLabel.style.transform = 'none'; }
          divider.style.transform = 'scaleX(1)';
          if (turnoverSub) { turnoverSub.style.opacity = '1'; turnoverSub.style.transform = 'none'; }
        }

        // Turnover vignette (this is a background effect, absolute is fine)
        if ((r.isInterception || r.isFumbleLost) && !res._isConversion) {
          var turnoverColor = isUserTurnover ? '#ff0040' : '#00ff44';
          var vignetteEl = document.createElement('div');
          vignetteEl.style.cssText = 'position:absolute;inset:0;z-index:1;pointer-events:none;' +
            'background:radial-gradient(ellipse at center, transparent 40%, ' + turnoverColor + '20 100%);opacity:0;';
          overlay.appendChild(vignetteEl);
          try { gsap.to(vignetteEl, { opacity: 1, duration: 0.3 }); } catch(e) { vignetteEl.style.opacity = '1'; }
        }

        // drawBug deferred — score updates after overlay clears
        drawField();
      }

      // Onboarding: first result explanation
      if (snapCount <= 1 && shouldShowHint('torch_hint_result')) {
        setTimeout(function() {
          var resultEl = overlay.querySelector('.T-clash-result') || nonTdWrap || overlay;
          showOnboardingBubble(resultEl, "Green means good for you. Red means bad. That's all you need to know.", 'torch_hint_result', { autoDismiss: 3000 });
        }, 1500);
      }

      // ── GAME OVER — dramatic freeze for close games ──
      if (gs.gameOver && !res._isConversion) {
        var _margin = Math.abs(gs.ctScore - gs.irScore);
        // Close game (within 7 pts): extend hold for drama
        if (_margin <= 7) totalDur = Math.max(totalDur, 6000);
        var goEl = document.createElement('div');
        goEl.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-15deg);z-index:3;font-family:'Teko';font-weight:700;font-size:64px;color:rgba(255,255,255,0.04);letter-spacing:8px;pointer-events:none;white-space:nowrap;";
        goEl.textContent = 'GAME OVER';
        overlay.appendChild(goEl);
      }

      // First down gold bar removed — distracting on frosted overlay

      // First down chain chime + confetti — delayed to BEAT 2 so audio lands
      // with the FIRST DOWN stamp instead of piling on the hero slam
      if (res.gotFirstDown && !isTD && !r.isInterception && !r.isFumbleLost && isUserOff) {
        var _fdCount = driveFirstDowns || 1;
        setTimeout(function() {
          if (!overlay.parentNode) return;
          try { SND.chime(); setTimeout(function(){ SND.chainGang(); }, 120); } catch(e) {}
          flashField('rgba(0,255,68,0.2)', 300);
          Haptic.cardTap();
          // 3rd+ first down: gold flash
          if (_fdCount >= 3) flashField('rgba(235,176,16,0.15)', 400);
          // 5th+ first down: mini confetti burst
          if (_fdCount >= 5) {
            var _fdCols = ['#00ff44', '#EBB010', '#fff'];
            for (var _fi = 0; _fi < 8; _fi++) {
              var _fc = document.createElement('div');
              _fc.style.cssText = 'position:absolute;top:-10px;left:' + (20 + Math.random() * 60) + '%;width:' + (2 + Math.random() * 3) + 'px;height:' + (2 + Math.random() * 3) + 'px;background:' + _fdCols[_fi % 3] + ';border-radius:1px;opacity:0.9;z-index:11;pointer-events:none;';
              overlay.appendChild(_fc);
              try { gsap.to(_fc, { y: 200, rotation: 360 + Math.random() * 720, opacity: 0, duration: 1.5 + Math.random(), ease: 'power1.in', delay: Math.random() * 0.3, onComplete: function() { if (_fc.parentNode) _fc.remove(); } }); } catch(e) { _fc.remove(); }
            }
          }
        }, BEAT_CTX);
      }

      // Hot streak tracking
      if (isUserOff && !res._isConversion) {
        if (isGoodForUser) { _hotStreak++; } else if (isBadForUser) { _hotStreak = 0; }
        // "ON FIRE" toast at 5-streak
        if (_hotStreak === 5) {
          var _fireToast = document.createElement('div');
          _fireToast.style.cssText = "position:fixed;top:12%;left:50%;transform:translateX(-50%);z-index:660;font-family:'Teko';font-weight:700;font-size:18px;color:#EBB010;letter-spacing:4px;text-shadow:0 0 16px rgba(235,176,16,0.6);pointer-events:none;opacity:0;";
          _fireToast.textContent = 'ON FIRE';
          el.appendChild(_fireToast);
          try {
            gsap.to(_fireToast, { opacity: 1, y: -5, duration: 0.3, ease: 'back.out(1.5)' });
            gsap.to(_fireToast, { opacity: 0, y: -15, duration: 0.4, delay: 1.5, onComplete: function() { _fireToast.remove(); } });
          } catch(e) { setTimeout(function() { _fireToast.remove(); }, 2000); }
        }
      }

      // ── BEAT 2: CONTEXT — FIRST DOWN stamp OR down & distance, narrative strip audio cue ──
      setTimeout(function() {
        if (isTD) return; // TD has its own commentary flow above
        if (!overlay.parentNode) return; // screen exited

        if (_firstDownStamp) {
          // FIRST DOWN lands as its own anchor — big, gold, punctuated
          var fdStamp = document.createElement('div');
          var _fdCol = isUserOff ? '#EBB010' : '#ff0040';
          fdStamp.style.cssText = "font-family:'Teko';font-weight:900;font-size:36px;color:" + _fdCol + ";letter-spacing:6px;margin-top:8px;text-shadow:0 0 24px " + _fdCol + "99,0 0 48px " + _fdCol + "44,0 2px 6px rgba(0,0,0,0.9);opacity:0;transform:scale(0.6);";
          fdStamp.textContent = 'FIRST DOWN';
          resultWrap.appendChild(fdStamp);
          try {
            gsap.to(fdStamp, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.5)' });
          } catch(e) { fdStamp.style.opacity = '1'; fdStamp.style.transform = 'none'; }
        } else if (!r.isInterception && !r.isFumbleLost && !res._isConversion) {
          // New down & distance (only when we didn't already stamp FIRST DOWN)
          var newS = gs.getSummary();
          var dnLabels = ['','1ST','2ND','3RD','4TH'];
          var dnText = (dnLabels[newS.down] || '') + ' & ' + (newS.yardsToEndzone <= 10 ? 'GOAL' : newS.distance);
          var dnPossTeam = newS.possession === 'CT' ? hTeam : oTeam;
          var dnColor = dnPossTeam.accent;
          var dnEl = document.createElement('div');
          dnEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:22px;color:" + dnColor + ";letter-spacing:3px;margin-top:6px;opacity:0;transform:translateY(6px);";
          dnEl.textContent = dnText;
          resultWrap.appendChild(dnEl);
          try { gsap.to(dnEl, { opacity: 1, y: 0, duration: 0.2, delay: 0.1, ease: 'power2.out' }); } catch(e) { dnEl.style.opacity = '1'; }
        }

        // Generate commentary once — BEAT 3 reads _commLine1 from outer scope
        if (res._isConversion) {
          _commLine1 = r.description;
          _commLine2 = '';
        } else {
          var gameCtx = gs.getSummary();
          gameCtx.preSnapPossession = prevPoss;
          var comm = generateCommentary(res, gameCtx, hTeam.name, oTeam.name);
          var ctx = generateContext(gameCtx, hTeam.name, oTeam.name, res);
          _commLine1 = comm.line1;
          _commLine2 = comm.line2 || ctx || '';
        }
        // Narrative strip audio cue lands here in BEAT 2 (context punctuation)
        var _narrBias = isGoodForUser ? '#00ff44' : isBadForUser ? '#ff0040' : '#EBB010';
        var _narrEvent = r.isTouchdown ? 'TOUCHDOWN' : r.isSack ? 'SACK' : r.isInterception ? 'INTERCEPTION' : r.isFumbleLost ? 'FUMBLE' : r.isIncomplete ? 'INCOMPLETE' : res.gotFirstDown ? 'FIRST DOWN' : null;
        var _narrPlay = res.offPlay ? res.offPlay.name : null;
        var _narrPlayer = res.featuredOff ? res.featuredOff.name : null;
        setNarr(_commLine1, _commLine2, {
          biasColor: _narrBias,
          yards: r.yards,
          event: _narrEvent,
          playName: _narrPlay,
          playerName: _narrPlayer
        });
      }, BEAT_CTX);

      // ── BEAT 3: STORY — single narrative line (commentary), milestone only ──
      setTimeout(function() {
        if (isTD) return;
        if (!overlay.parentNode) return;

        // The ONLY text line in the story beat — keep it clean, let it breathe
        if (_commLine1 && !res._isConversion) {
          var commEl = document.createElement('div');
          commEl.style.cssText = "font-family:'Rajdhani';font-weight:600;font-size:15px;color:rgba(255,255,255,0.75);text-shadow:0 2px 4px rgba(0,0,0,0.8);max-width:300px;text-align:center;margin-top:10px;opacity:0;transform:translateY(6px);line-height:1.3;";
          commEl.textContent = _commLine1;
          resultWrap.appendChild(commEl);
          try { gsap.to(commEl, { opacity: 1, y: 0, duration: 0.3, delay: 0.05, ease: 'power2.out' }); } catch(e) { commEl.style.opacity = '1'; }
        }

        // Milestone stat pop-ups (rare, non-blocking flourish)
        if (res.featuredOff && _playerGameStats[res.featuredOff.id]) {
          var pStats = _playerGameStats[res.featuredOff.id];
          var milestoneText = null;
          if (pStats.rushYds >= 100 && pStats.rushYds - r.yards < 100) milestoneText = '100 YD RUSHING MILESTONE';
          else if (pStats.recYds >= 100 && pStats.recYds - r.yards < 100) milestoneText = '100 YD RECEIVING MILESTONE';
          else if (pStats.td >= 3 && pStats.td - (r.isTouchdown ? 1 : 0) < 3) milestoneText = '3 TD GAME MILESTONE';

          if (milestoneText) {
            var msEl = document.createElement('div');
            msEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:14px;color:#EBB010;letter-spacing:2px;margin-top:8px;padding:2px 10px;border:1px solid rgba(235,176,16,0.3);background:rgba(235,176,16,0.05);border-radius:4px;opacity:0;transform:scale(0.8);";
            msEl.textContent = milestoneText;
            resultWrap.appendChild(msEl);
            try { gsap.to(msEl, { opacity: 1, scale: 1, duration: 0.3, delay: 0.3, ease: 'back.out(2)' }); } catch(e) { msEl.style.opacity = '1'; }
          }
        }
      }, BEAT_STORY);

      // ── BEAT 4: REWARD — TORCH points pill, sources breakdown, combo pops ──
      // The pill (#tp-result-torch, .T-torch-fly-source) is the fly source.
      // When doSettle fires, the "+N TORCH" number floats up DIRECTLY from
      // this pill to the torch banner at the top.
      setTimeout(function() {
        if (isTD) return;
        if (!overlay.parentNode) return;

        // TORCH points pill — only show on human-earned points
        var isHumanBall = prevPoss === hAbbr;
        var _showTorchOnOverlay = res._torchEarned && res._torchEarned > 0 && isHumanBall && !res._isConversion;
        if (_showTorchOnOverlay) {
          var tpEl = document.createElement('div');
          tpEl.id = 'tp-result-torch';
          tpEl.className = 'T-torch-fly-source';
          tpEl.style.cssText = "display:flex;align-items:center;gap:6px;justify-content:center;margin-top:10px;opacity:0;transform:translateY(14px) scale(0.6);padding:6px 16px;background:rgba(235,176,16,0.06);border:1px solid rgba(235,176,16,0.15);border-radius:6px;";
          tpEl.innerHTML = flameIconSVG(23, 1, 'filter:drop-shadow(0 0 6px rgba(235,176,16,0.5))') + "<span style=\"font-family:'Teko';font-weight:700;font-size:28px;color:#EBB010;text-shadow:0 0 12px rgba(235,176,16,0.5);letter-spacing:2px;\">+" + res._torchEarned + "</span><span style=\"font-family:'Rajdhani';font-weight:700;font-size:10px;color:rgba(235,176,16,0.5);letter-spacing:2px;\">TORCH</span>";
          resultWrap.appendChild(tpEl);
          try {
            gsap.to(tpEl, { opacity: 1, y: 0, scale: 1, duration: 0.4, delay: 0.05, ease: 'back.out(2.5)' });
            // Glow pulse after landing
            gsap.to(tpEl, { boxShadow: '0 0 20px rgba(235,176,16,0.3)', duration: 0.3, delay: 0.45, yoyo: true, repeat: 1 });
            // Gold sparks from flame icon
            setTimeout(function() {
              try {
                var tpRect = tpEl.getBoundingClientRect();
                var tcx = tpRect.left + 18;
                var tcy = tpRect.top + tpRect.height / 2;
                for (var _tsi = 0; _tsi < 6; _tsi++) {
                  var _tsp = document.createElement('div');
                  var _tsAngle = (Math.PI * 2 / 6) * _tsi + Math.random() * 0.5;
                  var _tsDist = 12 + Math.random() * 18;
                  _tsp.style.cssText = 'position:fixed;left:' + tcx + 'px;top:' + tcy + 'px;width:3px;height:3px;border-radius:50%;background:#EBB010;pointer-events:none;z-index:300;';
                  document.body.appendChild(_tsp);
                  gsap.to(_tsp, { x: Math.cos(_tsAngle) * _tsDist, y: Math.sin(_tsAngle) * _tsDist - 8, opacity: 0, duration: 0.4 + Math.random() * 0.2, ease: 'power2.out', onComplete: function() { _tsp.remove(); } });
                }
              } catch(e2) {}
            }, 250);
          } catch(e) { tpEl.style.opacity = '1'; tpEl.style.transform = 'none'; }
        }

        // TORCH points earned — color-coded breakdown on the narrative strip
        if (res._torchSources && res._torchSources.length > 0) {
          var srcColors = { play: '#F1F5F9', combo: '#FF6B2B', bonus: '#22D3EE' };
          var srcLabels = { play: 'PLAY', combo: 'COMBO', bonus: 'BONUS' };
          var ptDiv = document.createElement('div');
          ptDiv.style.cssText = "display:flex;align-items:center;justify-content:center;gap:6px;margin-top:8px;flex-wrap:wrap;";
          var parts = [];
          res._torchSources.forEach(function(src, si) {
            var col = srcColors[src.key] || '#F1F5F9';
            parts.push("<span style=\"font-family:'Teko';font-weight:700;font-size:15px;color:" + col + ";letter-spacing:1px;text-shadow:0 0 8px " + col + "44;\">+" + src.pts + " " + (srcLabels[src.key] || src.key.toUpperCase()) + "</span>");
          });
          // Join with + separators then show total
          ptDiv.innerHTML = parts.join("<span style=\"color:#555;font-family:'Teko';font-size:13px;\"> + </span>") +
            "<span style=\"font-family:'Teko';font-weight:700;font-size:15px;color:#EBB010;letter-spacing:1px;margin-left:4px;\">= +" + res._torchEarned + " TORCH</span>";
          narr.appendChild(ptDiv);
        } else if (res._torchEarned && res._torchEarned > 0) {
          var ptSimple = document.createElement('div');
          ptSimple.style.cssText = "font-family:'Teko';font-weight:700;font-size:15px;color:#EBB010;letter-spacing:2px;text-shadow:0 0 12px rgba(235,176,16,0.5);margin-top:8px;text-align:center;";
          ptSimple.textContent = '+' + res._torchEarned + ' TORCH';
          narr.appendChild(ptSimple);
        }

        // Combo flash + ascending pop chain (Balatro feel) — fires on the reward beat
        // so it punctuates the TORCH arrival instead of firing into dead air.
        if (res._combos && res._combos.length > 0) {
          var comboEl = document.createElement('div');
          comboEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:20px;color:#EBB010;letter-spacing:2px;text-shadow:0 0 12px rgba(235,176,16,0.5);margin-top:6px;animation:T-clash-yds 0.4s ease-out both;";
          comboEl.textContent = res._combos.join(' + ');
          resultWrap.appendChild(comboEl);

          // Pitch-shifted pop per synergy: each step +1 semitone, 110ms apart.
          // Skip on negative-result plays — joy stings should only fire on user wins.
          var rOK = res.result && !res.result.isInterception && !res.result.isFumbleLost && !res.result.isSack;
          if (rOK) {
            res._combos.forEach(function(_n, i) {
              setTimeout(function() { SND.pop(i); }, i * 110);
            });
          }
        }
      }, BEAT_REWARD);

      // ── BEAT 4: READY (cleanup + proceed) ──
      // Uses raw setTimeout — this timer MUST fire to continue the game
      setTimeout(function() {
        if (!overlay.parentNode) return; // already settled or skipped
        
        doSettle(function() {
          // ── REACTIVE TORCH CARD CHECK ──
          // After seeing result, OFFER reactive cards with player choice (not auto-fire)
          var isHumanOff = prevPoss === hAbbr;

          // Check if any reactive cards can trigger
          var reactiveCard = null;
          var reactiveIdx = -1;
          if (isHumanOff && !res._isConversion) {
            // SURE HANDS: on turnover
            if ((r.isInterception || r.isFumbleLost)) {
              reactiveIdx = torchInventory.findIndex(function(c) { return c.id === 'sure_hands'; });
              if (reactiveIdx >= 0) reactiveCard = { id: 'sure_hands', idx: reactiveIdx, label: 'SURE HANDS', desc: 'Cancel the turnover? Your drive continues.', cost: 'FREE (already purchased)', color: '#EBB010' };
            }
            // CHALLENGE FLAG: on negative yards (sack, loss)
            if (!reactiveCard && r.yards < 0 && !r.isTouchdown) {
              reactiveIdx = torchInventory.findIndex(function(c) { return c.id === 'challenge_flag'; });
              if (reactiveIdx >= 0) reactiveCard = { id: 'challenge_flag', idx: reactiveIdx, label: 'CHALLENGE FLAG', desc: 'Challenge the play? 50% chance of a better outcome.', cost: 'FREE (already purchased)', color: '#C0C0C0' };
            }
          }

          // Show reactive card decision prompt
          if (reactiveCard) {
            var _reactiveOv = document.createElement('div');
            _reactiveOv.style.cssText = 'position:fixed;inset:0;z-index:750;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.8);';
            var _reactiveCard = document.createElement('div');
            _reactiveCard.style.cssText = "background:#141008;border:2px solid " + reactiveCard.color + ";border-radius:12px;padding:20px;max-width:300px;text-align:center;box-shadow:0 0 30px " + reactiveCard.color + "44;";
            _reactiveCard.innerHTML =
              "<div style=\"font-family:'Teko';font-weight:700;font-size:22px;color:" + reactiveCard.color + ";letter-spacing:3px;\">" + reactiveCard.label + "</div>" +
              "<div style=\"font-family:'Rajdhani';font-size:12px;color:#ccc;margin:8px 0 16px;line-height:1.4;\">" + reactiveCard.desc + "</div>" +
              "<div style='display:flex;gap:10px;justify-content:center;'>" +
                "<button id='reactive-yes' style=\"flex:1;padding:12px;border-radius:6px;border:2px solid " + reactiveCard.color + ";background:" + reactiveCard.color + ";color:#000;font-family:'Teko';font-weight:700;font-size:16px;letter-spacing:2px;cursor:pointer;\">USE IT</button>" +
                "<button id='reactive-no' style=\"flex:1;padding:12px;border-radius:6px;border:1px solid #333;background:transparent;color:#666;font-family:'Teko';font-weight:700;font-size:16px;letter-spacing:2px;cursor:pointer;\">SAVE IT</button>" +
              "</div>";
            _reactiveOv.appendChild(_reactiveCard);
            el.appendChild(_reactiveOv);
            try { SND.cardSnap(); } catch(e) {}

            var _reactiveResolved = false;
            function resolveReactive(useIt) {
              if (_reactiveResolved) return;
              _reactiveResolved = true;
              _reactiveOv.remove();

              if (useIt) {
                // Consume the card from both UI and engine inventories
                torchInventory.splice(reactiveCard.idx, 1);
                if (GS.season) GS.season.torchCards = torchInventory.slice();
                var _engineIdx = gs.humanTorchCards.indexOf(reactiveCard.id);
                if (_engineIdx >= 0) gs.humanTorchCards.splice(_engineIdx, 1);

                if (reactiveCard.id === 'sure_hands') {
                  // Cancel the turnover
                  r.isInterception = false; r.isFumble = false; r.isFumbleLost = false;
                  r.yards = Math.max(0, r.yards);
                  r.description = 'SURE HANDS! Turnover cancelled — drive continues!';
                  if (gs.possession !== prevPoss) {
                    gs.flipPossession(res._preSnap ? res._preSnap.ballPosition : gs.ballPosition);
                  }
                  res.gameEvent = null;
                  setNarr('SURE HANDS!', 'Turnover cancelled — your drive continues.');
                } else if (reactiveCard.id === 'challenge_flag') {
                  // 50% reroll
                  if (Math.random() < 0.5) {
                    r.yards = Math.max(0, Math.abs(r.yards));
                    r.isSack = false;
                    r.description = 'CHALLENGE FLAG! Play overturned — gain of ' + r.yards + '!';
                    setNarr('CHALLENGE FLAG!', 'Overturned! Gain of ' + r.yards + ' yards.');
                  } else {
                    r.description = 'CHALLENGE FLAG! Review stands. Original call confirmed.';
                    setNarr('CHALLENGE FLAG!', 'Review stands. Original call confirmed.');
                  }
                }
              }
              // Continue to shop/next play flow
              continueAfterReactive();
            }

            _reactiveOv.querySelector('#reactive-yes').onclick = function() { resolveReactive(true); };
            _reactiveOv.querySelector('#reactive-no').onclick = function() { resolveReactive(false); };
            // Safety timeout (8s)
            setTimeout(function() { if (!_reactiveResolved) resolveReactive(false); }, 8000);

            // Wrap the rest of the post-play flow in a continuation
            function continueAfterReactive() {
              var shopTrigger = null;
              if (!gs.gameOver && !res._isConversion) {
                var isHumanPoss = prevPoss === hAbbr;
                if (res.gameEvent === 'touchdown' && isHumanPoss) shopTrigger = 'touchdown';
                else if ((r.isInterception || r.isFumbleLost) && !isHumanPoss) shopTrigger = 'turnover';
                else if (res.gameEvent === 'turnover_on_downs' && !isHumanPoss) shopTrigger = 'fourthDownStop';
                else if ((!wasOffHot && offStarHot) || (!wasDefHot && defStarHot)) shopTrigger = 'starActivation';
              }
              if (shopTrigger) { triggerShop(shopTrigger, afterShop); }
              else { afterShop(); }
            }
            return; // Exit — continuation handles the rest
          }

          var shopTrigger = null;
          if (!gs.gameOver && !res._isConversion) {
            var isHumanPoss = prevPoss === hAbbr;
            if (res.gameEvent === 'touchdown' && isHumanPoss) shopTrigger = 'touchdown';
            else if ((r.isInterception || r.isFumbleLost) && !isHumanPoss) shopTrigger = 'turnover';
            else if (res.gameEvent === 'turnover_on_downs' && !isHumanPoss) shopTrigger = 'fourthDownStop';
            else if ((!wasOffHot && offStarHot) || (!wasDefHot && defStarHot)) shopTrigger = 'starActivation';
          }
          function afterShop() {
            if (res.gameEvent === 'touchdown' && !res._isConversion) { showConv(res.scoringTeam); return; }
            
            if (posChanged(res.gameEvent, prevPoss)) {
              // End of drive recap — includes TD conversions if they just finished
              showDrive(driveSnaps, prevPoss, function() { 
                driveSnaps=[]; drivePlayHistory=[]; resetDriveSummary(); 
                if(!checkEnd()) {
                  // Determine possession change label for ticker
                  var s = gs.getSummary();
                  var newPossTeam = s.possession === 'CT' ? hTeam : oTeam;
                  pushTicker(newPossTeam.name.toUpperCase() + ' BALL', newPossTeam.accent);
                  nextSnap(); 
                }
              });
            } else {
              if (!checkEnd()) {
                // Auto-advance: animate placed cards off, then go to next snap
                drawDriveSummary();
                setTimeout(function() {
                  var placedCards = strip.querySelectorAll('.T-placed');
                  try {
                    gsap.to(placedCards, { y: -40, opacity: 0, scale: 0.8, duration: 0.25, stagger: 0.05, ease: 'power2.in', onComplete: function() {
                      selP = null; selPl = null;
                      nextSnap();
                    }});
                  } catch(e) {
                    selP = null; selPl = null;
                    nextSnap();
                  }
                }, 300); // 300ms delay before auto-advance
              }
            }
          }
          if (shopTrigger) {
            triggerShop(shopTrigger, afterShop);
          } else { afterShop(); }
        });
      }, aftermathDur);
    }
  }

  /** Cycle a played card — return it to deck, draw a replacement */
  function cycleCard(playedCard, hand, fullPool, teamId) {
    if (!playedCard || !hand || !fullPool) return;
    var idx = hand.indexOf(playedCard);
    if (idx === -1) return;
    // Cards NOT in hand — weighted by team scheme identity
    var available = fullPool.filter(function(c) { return hand.indexOf(c) === -1; });
    if (available.length > 0) {
      var weights = available.map(function(c) { return getDrawWeight(teamId, c.playType); });
      var total = weights.reduce(function(a, b) { return a + b; }, 0);
      var r = Math.random() * total;
      var replacement = available[available.length - 1];
      for (var i = 0; i < available.length; i++) {
        r -= weights[i];
        if (r <= 0) { replacement = available[i]; break; }
      }
      hand[idx] = replacement;
    }
  }

  /**
   * Brief possession handoff banner — shows new team name + "HAVE THE BALL"
   * as a centered hero toast. Non-blocking; fades in/holds/fades out in ~1s.
   * All four team names (Boars/Dolphins/Spectres/Serpents) are plural, so the
   * verb is always "HAVE" — no conditional needed.
   */
  function showPossessionBanner(newPossTeam) {
    var accent = newPossTeam.accent || '#EBB010';
    var banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:42%;left:50%;transform:translate(-50%,-50%);z-index:660;text-align:center;pointer-events:none;opacity:0;';
    // Per-team wordmark replaces the old Teko uppercase name. Size tuned to
    // match the previous 40px Teko visual weight across fonts.
    var _pbCfg = TEAM_WORDMARKS[newPossTeam.id] || {};
    var _pbSize = Math.max(24, Math.round((_pbCfg.heroSize || 40) * 0.7));
    var _pbWm = renderTeamWordmark(newPossTeam.id, 't1', { mascot: true, fontSize: _pbSize });
    banner.innerHTML =
      "<div style=\"width:120px;height:1px;margin:0 auto 8px;background:linear-gradient(90deg,transparent," + accent + ",transparent);opacity:0;\" data-bar='top'></div>" +
      '<div id="pbName" style="display:flex;justify-content:center;"></div>' +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:11px;color:#aaa;letter-spacing:4px;margin-top:6px;\">HAVE THE BALL</div>" +
      "<div style=\"width:120px;height:1px;margin:8px auto 0;background:linear-gradient(90deg,transparent," + accent + ",transparent);opacity:0;\" data-bar='bot'></div>";
    var _pbSlot = banner.querySelector('#pbName');
    if (_pbSlot && _pbWm) _pbSlot.appendChild(_pbWm);
    else if (_pbSlot) _pbSlot.innerHTML = "<div style=\"font-family:'Teko';font-weight:900;font-size:40px;color:" + accent + ";letter-spacing:5px;line-height:1;text-shadow:0 0 24px " + accent + "80,0 0 48px " + accent + "40,0 4px 12px rgba(0,0,0,0.9);\">" + newPossTeam.name.toUpperCase() + "</div>";
    el.appendChild(banner);
    var bars = banner.querySelectorAll('[data-bar]');
    try {
      gsap.to(banner, { opacity: 1, y: '-50%', duration: 0.3, ease: 'power2.out' });
      gsap.fromTo(bars, { scaleX: 0 }, { scaleX: 1, opacity: 1, duration: 0.35, delay: 0.1, ease: 'power2.out' });
      gsap.to(banner, { opacity: 0, y: '-60%', duration: 0.3, delay: 0.9, ease: 'power2.in',
        onComplete: function() { if (banner.parentNode) banner.remove(); } });
    } catch(e) { setTimeout(function() { if (banner.parentNode) banner.remove(); }, 1300); }
    Haptic.cardTap();
  }

  var _lastPossession = gs.possession;
  function nextSnap() {
    // Card replacement already happened in doSnap post-processing
    // On possession change, redeal the hand for the new drive
    if (gs.possession !== _lastPossession) {
      _lastPossession = gs.possession;
      _isNewDrive = true;
      _hotStreak = 0; // Reset hot streak on possession change
      try { SND.possessionSwoosh(); } catch(e) {}
      var newHs = getHandState();
      handRedeal(newHs);
      resetDriveDiscards(newHs);
      _driveHeat = 0; drawDriveHeat();
      _driveCardsUsed = [];
      // Possession handoff banner — brief hero moment before the new tray arrives
      var _newPossTeam = gs.possession === hAbbr ? hTeam : oTeam;
      showPossessionBanner(_newPossTeam);
      // Crossfade the card tray — delayed so it layers UNDER the banner's hold
      try {
        var trayEl = panel.querySelector('.CT-wrap');
        if (trayEl) {
          // Hold the old tray at low opacity during the banner, then crossfade to new
          gsap.to(trayEl, { opacity: 0, y: 4, duration: 0.2, delay: 0.25, ease: 'power2.in', onComplete: function() {
            drawPanel();
            var newTray = panel.querySelector('.CT-wrap');
            if (newTray) { newTray.style.opacity = '0'; newTray.style.transform = 'translateY(4px)'; gsap.to(newTray, { opacity: 1, y: 0, duration: 0.3, delay: 0.1, ease: 'power2.out' }); }
          }});
        }
      } catch(e) {}
    }
    phase = 'play';
    selP = null; selPl = null; selTorch = null; selectedPreSnap = null;
    _fourthDownDecided = false;
    panel.style.display = '';
    panel.style.opacity = '1';
    panel.style.pointerEvents = '';
    // Hide PBP unless user toggled it on
    if (!_pbpVisible) driveSummaryEl.style.display = 'none';
    // Don't force-reset crowd here — holdThenSettle handles it after big plays.
    // Only set state if we're not in an elevated hold (the hold timer will settle naturally).
    // For 2-min drill, always ensure it's set since it's a persistent state.
    if (gs.twoMinActive) AudioStateManager.setState('two_min_drill');

    // AI 4th down decision — resolve BEFORE showing cards to the player
    var isUserDef = gs.possession !== hAbbr;
    if (isUserDef && gs.down === 4) {
      var aiDec = gs.ai4thDownDecision();
      if (aiDec === 'punt') {
        var prevPoss = gs.possession;
        phase = 'busy';
        // Three-and-out celebration (3 or fewer opponent plays → punt)
        if (driveSnaps.length <= 3) {
          var _3aoEl = document.createElement('div');
          _3aoEl.style.cssText = "position:fixed;top:30%;left:50%;transform:translateX(-50%);z-index:660;font-family:'Teko';font-weight:700;font-size:24px;color:#4DA6FF;letter-spacing:4px;text-shadow:0 0 20px rgba(77,166,255,0.5);pointer-events:none;opacity:0;white-space:nowrap;";
          _3aoEl.textContent = 'THREE AND OUT';
          el.appendChild(_3aoEl);
          try {
            gsap.to(_3aoEl, { opacity: 1, y: -5, duration: 0.3, ease: 'back.out(1.5)' });
            gsap.to(_3aoEl, { opacity: 0, y: -20, duration: 0.4, delay: 1.5, onComplete: function() { _3aoEl.remove(); } });
            SND.bigPlay();
          } catch(e) { setTimeout(function() { _3aoEl.remove(); }, 2000); }
          Haptic.cardSelect();
        }
        // BLOCKED KICK: auto-consume from inventory if available
        var _bkPuntIdx = torchInventory.findIndex(function(c) { return c.id === 'blocked_kick'; });
        var _bkPuntOpts = {};
        if (_bkPuntIdx >= 0) { _bkPuntOpts.blockedKick = true; consumeTorchCard('blocked_kick'); torchCardToast('BLOCKED KICK', 'Chance to block the punt'); }
        // AI punt announcement overlay
        var puntOv = document.createElement('div');
        puntOv.style.cssText = 'position:fixed;inset:0;z-index:650;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:rgba(10,8,4,0.92);opacity:0;transition:opacity 0.3s;pointer-events:auto;';
        var _pBarT = document.createElement('div');
        _pBarT.style.cssText = 'position:absolute;top:0;left:0;right:0;height:3px;background:' + (oTeam.accent || '#4DA6FF') + ';';
        var _pBarB = document.createElement('div');
        _pBarB.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:3px;background:' + (oTeam.accent || '#4DA6FF') + ';';
        puntOv.appendChild(_pBarT); puntOv.appendChild(_pBarB);
        puntOv.innerHTML += '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 35%,' + (oTeam.colors ? oTeam.colors.primary : oTeam.accent) + '15,transparent 60%);pointer-events:none;"></div>';
        var _pLabel = document.createElement('div');
        _pLabel.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#888;letter-spacing:3px;z-index:1;";
        _pLabel.textContent = '4TH DOWN';
        puntOv.appendChild(_pLabel);
        var _pTitle = document.createElement('div');
        _pTitle.style.cssText = "font-family:'Oswald';font-weight:700;font-size:22px;color:" + (oTeam.accent || '#4DA6FF') + ";letter-spacing:4px;text-shadow:0 0 16px " + (oTeam.accent || '#4DA6FF') + "40;z-index:1;";
        _pTitle.textContent = oTeam.name.toUpperCase() + ' PUNT';
        puntOv.appendChild(_pTitle);
        var _pBtn = _flameBadgeContinue('CONTINUE', function() {
          puntOv.style.opacity = '0';
          setTimeout(function() {
            if (puntOv.parentNode) puntOv.remove();
            var aiPunter = aiPickST(_cpuSTDeck, 'kickPower', gs.difficulty);
            if (aiPunter) burnPlayer(_cpuSTDeck, aiPunter, 'punter', 'AI punt');
            var puntResult = gs.punt(aiPunter, _bkPuntOpts);
            var puntColor = puntResult.blocked ? '#00ff44' : '#4DA6FF';
            var _aiPuntType = puntResult.blocked ? 'blocked_punt' : 'punt';
            showSpecialTeamsResult(puntResult.label, puntColor, function() {
              showDrive(driveSnaps, prevPoss, function() {
                driveSnaps = []; drivePlayHistory = []; resetDriveSummary();
                if (!checkEnd()) nextSnap();
              });
            }, _aiPuntType);
          }, 250);
        });
        puntOv.appendChild(_pBtn);
        el.appendChild(puntOv);
        requestAnimationFrame(function() { puntOv.style.opacity = '1'; });
        return;
      }
      if (aiDec === 'field_goal') {
        var prevPoss = gs.possession;
        phase = 'busy';
        var fgDist3 = gs.yardsToEndzone() + 17;
        // ICE THE KICKER + BLOCKED KICK: auto-consume from inventory
        var _aiFgOpts = {};
        var _iceIdx = torchInventory.findIndex(function(c) { return c.id === 'ice_the_kicker'; });
        if (_iceIdx >= 0) { _aiFgOpts.iceTheKicker = true; consumeTorchCard('ice_the_kicker'); torchCardToast('ICE THE KICKER', 'Kicker accuracy reduced'); }
        var _bkFgIdx = torchInventory.findIndex(function(c) { return c.id === 'blocked_kick'; });
        if (_bkFgIdx >= 0) { _aiFgOpts.blockedKick = true; consumeTorchCard('blocked_kick'); torchCardToast('BLOCKED KICK', 'Chance to block the kick'); }
        var _iceLabel = _aiFgOpts.iceTheKicker ? 'ICE THE KICKER! ' : '';
        // AI FG announcement overlay
        var fgOv = document.createElement('div');
        fgOv.style.cssText = 'position:fixed;inset:0;z-index:650;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:rgba(10,8,4,0.92);opacity:0;transition:opacity 0.3s;pointer-events:auto;';
        var _fBarT = document.createElement('div');
        _fBarT.style.cssText = 'position:absolute;top:0;left:0;right:0;height:3px;background:#EBB010;';
        var _fBarB = document.createElement('div');
        _fBarB.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:3px;background:#EBB010;';
        fgOv.appendChild(_fBarT); fgOv.appendChild(_fBarB);
        fgOv.innerHTML += '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 35%,' + (oTeam.colors ? oTeam.colors.primary : oTeam.accent) + '15,transparent 60%);pointer-events:none;"></div>';
        var _fLabel = document.createElement('div');
        _fLabel.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#888;letter-spacing:3px;z-index:1;";
        _fLabel.textContent = '4TH DOWN';
        fgOv.appendChild(_fLabel);
        var _fTitle = document.createElement('div');
        _fTitle.style.cssText = "font-family:'Oswald';font-weight:700;font-size:22px;color:#EBB010;letter-spacing:4px;text-shadow:0 0 16px #EBB01040;z-index:1;";
        _fTitle.textContent = _iceLabel + fgDist3 + '-YARD FIELD GOAL';
        fgOv.appendChild(_fTitle);
        var _fBtn = _flameBadgeContinue('CONTINUE', function() {
          fgOv.style.opacity = '0';
          setTimeout(function() {
            if (fgOv.parentNode) fgOv.remove();
            var aiKicker = aiPickST(_cpuSTDeck, 'kickAccuracy', gs.difficulty);
            if (aiKicker) burnPlayer(_cpuSTDeck, aiKicker, 'kicker', 'AI FG');
            SND.kickThud();
            var fgResult = gs.attemptFieldGoal(aiKicker, _aiFgOpts);
            if (fgResult.made) _cFgMade++;
            setTimeout(function() {
              if (fgResult.made) { SND.turnover(); AudioStateManager.setState('turnover'); AudioStateManager.holdThenSettle(2000, _settleState); }
              else { SND.goalPostClang(); setTimeout(function(){ SND.kickMiss(); }, 250); }
            }, 300);
            var fgColor = fgResult.made ? '#ff0040' : '#00ff44';
            var fgLabel = fgResult.blocked ? 'BLOCKED!' : (fgResult.made ? 'IT\'S GOOD! +3' : 'NO GOOD!');
            var _aiFgType = fgResult.blocked ? 'blocked_fg' : (fgResult.made ? 'fg_good' : 'fg_miss');
            showSpecialTeamsResult(fgLabel, fgColor, function() {
              showDrive(driveSnaps, prevPoss, function() {
                driveSnaps = []; drivePlayHistory = []; resetDriveSummary();
                if (!checkEnd()) nextSnap();
              });
            }, _aiFgType);
          }, 250);
        });
        fgOv.appendChild(_fBtn);
        el.appendChild(fgOv);
        requestAnimationFrame(function() { fgOv.style.opacity = '1'; });
        return;
      }
      if (aiDec === 'go_for_it') {
        // Brief flash then proceed to normal card selection
        var goFlash = document.createElement('div');
        goFlash.style.cssText = "position:fixed;top:30%;left:0;right:0;z-index:650;font-family:'Teko';font-weight:700;font-size:24px;color:#e03050;letter-spacing:3px;text-shadow:0 0 16px rgba(224,48,80,0.4);pointer-events:none;opacity:0;transition:opacity 0.3s;text-align:center;white-space:nowrap;";
        goFlash.textContent = oTeam.name + ' GO FOR IT!';
        el.appendChild(goFlash);
        requestAnimationFrame(function() { goFlash.style.opacity = '1'; });
        setTimeout(function() { goFlash.style.opacity = '0'; setTimeout(function() { goFlash.remove(); }, 200); }, 1200);
      }
    }

    drawBug(); drawField(); drawPanel(); drawDriveSummary();
    // Human always picks cards — on offense they pick offPlay+player,
    // on defense they pick defPlay+player. doSnap() passes them in the right slots.
    // No auto-CPU here — the human taps SNAP every time.
  }

  // ── POSSESSION CUT ──
  function posChanged(ev, prev) {
    if (ev && ['interception','fumble_lost','turnover_on_downs','safety','turnover_td','punt','missed_fg'].includes(ev)) return true;
    return gs.possession !== prev;
  }

  function showPossCut(ev, done) {
    driveCommLine1 = ''; driveCommLine2 = '';
    drawDriveSummary();
    narr.innerHTML = '<div class="T-pbp-idle">Awaiting snap<span class="T-pbp-cursor"></span></div>';
    var s = gs.getSummary();
    var newPossTeam = s.possession === 'CT' ? hTeam : oTeam;
    var newPossId = s.possession === 'CT' ? GS.team : GS.opponent;
    var otherTeam = s.possession === 'CT' ? oTeam : hTeam;
    var otherId = s.possession === 'CT' ? GS.opponent : GS.team;
    var isYourBall = s.possession === hAbbr;

    // Determine if this is good or bad for the user
    var isGoodForUser = false;
    if (ev === 'interception' || ev === 'fumble_lost' || ev === 'turnover_on_downs' || ev === 'safety') {
      isGoodForUser = isYourBall; // user forced the turnover and now has the ball
    } else if (ev === 'touchdown' || ev === 'turnover_td' || ev === 'score') {
      isGoodForUser = !isYourBall; // user just scored, now opponent gets ball (user had a good drive)
    }

    // Title and subtitle based on user perspective
    var title, subtitle;
    if (isGoodForUser) {
      if (ev === 'interception') { title = 'PICKED OFF!'; subtitle = newPossTeam.name + ' ball!'; }
      else if (ev === 'fumble_lost') { title = 'FUMBLE RECOVERY!'; subtitle = newPossTeam.name + ' ball!'; }
      else if (ev === 'turnover_on_downs') { title = 'DEFENSE HOLDS!'; subtitle = 'Stopped on 4th down.'; }
      else if (ev === 'punt') { title = newPossTeam.name.toUpperCase() + ' BALL!'; subtitle = 'After the punt.'; }
      else if (ev === 'missed_fg') { title = 'NO GOOD!'; subtitle = 'Missed field goal. ' + newPossTeam.name + ' ball!'; }
      else if (ev === 'safety') { title = 'SAFETY!'; subtitle = newPossTeam.name + ' get the ball back!'; }
      else { title = newPossTeam.name.toUpperCase() + ' BALL!'; subtitle = 'New drive.'; }
    } else {
      if (ev === 'interception') { title = 'TURNOVER'; subtitle = otherTeam.name + ' intercept.'; }
      else if (ev === 'fumble_lost') { title = 'TURNOVER'; subtitle = 'Fumble. ' + otherTeam.name + ' recover.'; }
      else if (ev === 'turnover_on_downs') { title = 'TURNOVER ON DOWNS'; subtitle = 'Failed to convert.'; }
      else if (ev === 'punt') { title = 'PUNT'; subtitle = newPossTeam.name + ' ball.'; }
      else if (ev === 'missed_fg') { title = 'MISSED FIELD GOAL'; subtitle = newPossTeam.name + ' ball.'; }
      else if (ev === 'touchdown' || ev === 'turnover_td' || ev === 'score') { title = 'NEW DRIVE'; subtitle = newPossTeam.name + ' ball.'; }
      else { title = 'CHANGE OF POSSESSION'; subtitle = newPossTeam.name + ' ball.'; }
    }

    // Next situation context
    var nextCtx = '1st & 10';
    if (s.down && s.distance) nextCtx = fmtDownDist(s.down, s.distance, s.yardsToEndzone);
    var fieldPos = s.yardsToEndzone ? (s.yardsToEndzone <= 50 ? 'OPP ' + s.yardsToEndzone : 'OWN ' + (100 - s.yardsToEndzone)) : '';

    // Build overlay
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:900;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;opacity:0;transition:opacity .3s;pointer-events:auto;background:rgba(10,8,4,0.9);';

    // 2-minute drill: clock on possession overlay
    if (gs.twoMinActive) {
      var _pcClock = document.createElement('div');
      _pcClock.style.cssText = "position:absolute;top:12px;right:12px;z-index:10;font-family:'Teko';font-weight:700;font-size:22px;color:#e03050;letter-spacing:1px;text-shadow:0 0 10px rgba(224,48,80,0.5);padding:4px 10px;background:rgba(0,0,0,0.5);border:1px solid rgba(224,48,80,0.3);border-radius:4px;pointer-events:none;";
      _pcClock.textContent = fmtClock(Math.max(0, gs.clockSeconds));
      ov.appendChild(_pcClock);
    }

    // Team color accent bars top and bottom
    var barTop = document.createElement('div');
    barTop.style.cssText = 'position:absolute;top:0;left:0;right:0;height:3px;background:' + newPossTeam.accent + ';z-index:2;';
    var barBot = document.createElement('div');
    barBot.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:3px;background:' + newPossTeam.accent + ';z-index:2;';
    ov.appendChild(barTop); ov.appendChild(barBot);

    // Background radial glow
    var bgGlow = document.createElement('div');
    bgGlow.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 35%,' + (newPossTeam.colors ? newPossTeam.colors.primary : newPossTeam.accent) + '18 0%,transparent 60%);pointer-events:none;';
    ov.appendChild(bgGlow);

    // Event label (small)
    var evLabel = document.createElement('div');
    evLabel.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#888;letter-spacing:3px;z-index:1;opacity:0;transform:translateY(8px);";
    var evText = 'CHANGE OF POSSESSION';
    if (ev === 'interception' || ev === 'fumble_lost') evText = 'TURNOVER';
    else if (ev === 'turnover_on_downs') evText = 'TURNOVER ON DOWNS';
    else if (ev === 'punt') evText = 'PUNT';
    else if (ev === 'score' || ev === 'touchdown') evText = 'NEW DRIVE';
    else if (ev === 'missed_fg') evText = 'MISSED FIELD GOAL';
    evLabel.textContent = evText;
    ov.appendChild(evLabel);

    // Score display
    var hS = hAbbr === 'CT' ? s.ctScore : s.irScore;
    var oS = hAbbr === 'CT' ? s.irScore : s.ctScore;
    var scoreEl = document.createElement('div');
    scoreEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:22px;color:#666;letter-spacing:2px;z-index:1;opacity:0;";
    scoreEl.textContent = hS + ' \u2014 ' + oS;
    ov.appendChild(scoreEl);

    // Team name — big hero
    var teamNameEl = document.createElement('div');
    teamNameEl.style.cssText = "font-family:'Oswald';font-weight:700;font-size:26px;color:" + newPossTeam.accent + ";letter-spacing:5px;text-shadow:0 0 20px " + newPossTeam.accent + "50;z-index:1;opacity:0;transform:scale(0.3);";
    teamNameEl.textContent = newPossTeam.name.toUpperCase() + ' BALL';
    ov.appendChild(teamNameEl);

    // Field position
    if (fieldPos) {
      var posEl = document.createElement('div');
      posEl.style.cssText = "font-family:'Rajdhani';font-weight:600;font-size:13px;color:rgba(255,255,255,0.5);z-index:1;opacity:0;transform:translateY(6px);";
      posEl.textContent = 'Ball at the ' + fieldPos.replace('OWN ', '').replace('OPP ', '');
      ov.appendChild(posEl);
    }

    // Continue button (flame badge)
    var contBtn = _flameBadgeContinue('CONTINUE', null);
    contBtn.style.cssText += 'margin-top:16px;z-index:1;opacity:0;transform:translateY(10px);';
    ov.appendChild(contBtn);

    // Sound
    if (isGoodForUser) { try { SND.chime(); } catch(e) {} }
    else { try { SND.whooshIn(); } catch(e) {} }

    // Animate in
    var dismissed = false;
    function dismiss() { if (dismissed) return; dismissed = true; ov.style.opacity = '0'; setTimeout(function() { if (ov.parentNode) ov.remove(); done(); }, 300); }
    contBtn.onclick = function(e) { e.stopPropagation(); dismiss(); };
    ov.onclick = dismiss;
    el.appendChild(ov);
    requestAnimationFrame(function() {
      ov.style.opacity = '1';
      try {
        gsap.to(evLabel, { opacity: 1, y: 0, duration: 0.2, delay: 0.1 });
        gsap.to(scoreEl, { opacity: 1, duration: 0.2, delay: 0.2 });
        gsap.to(teamNameEl, { opacity: 1, scale: 1, duration: 0.25, delay: 0.25, ease: 'back.out(2.5)' });
        if (fieldPos) gsap.to(posEl, { opacity: 1, y: 0, duration: 0.2, delay: 0.4 });
        gsap.to(contBtn, { opacity: 1, y: 0, duration: 0.2, delay: 0.5 });
      } catch(e) { evLabel.style.opacity='1';scoreEl.style.opacity='1';teamNameEl.style.opacity='1';teamNameEl.style.transform='scale(1)';contBtn.style.opacity='1'; }
    });

    // Push ticker
    pushTicker(newPossTeam.name.toUpperCase() + ' BALL \u2014 ' + nextCtx + (fieldPos ? ' at ' + fieldPos : ''), newPossTeam.accent);
  }

  // ── DRIVE SUMMARY ──
  function showDrive(log, poss, done) {
    if (log.length < 1) { done(); return; }

    // ── Classify drive ──
    var nonConv = log.filter(function(r) { return !r._isConversion; });
    var totalYds = nonConv.reduce(function(s,r) { return s + (r.result ? r.result.yards || 0 : r.yards || 0); }, 0);
    var totalPlays = nonConv.length;
    var firstDowns = nonConv.filter(function(r) { return r.gotFirstDown; }).length;
    var td = nonConv.some(function(r) { return r.result ? r.result.isTouchdown : r.isTD; });
    var hasInt = nonConv.some(function(r) { return r.result ? r.result.isInterception : r.isInt; });
    var hasFum = nonConv.some(function(r) { return r.result ? r.result.isFumbleLost : r.isFumble; });
    var to = hasInt || hasFum;

    // Check driveSummaryLog tail for punt/FG classification (showDrive is called after
    // punt/FG results are pushed there, but those don't appear in driveSnaps).
    // Engine labels look like:
    //   Made FG:    "42-yard field goal is GOOD! +3"
    //   Missed FG:  "42-yard field goal NO GOOD!"
    //   Blocked FG: "BLOCKED! 42-yard field goal is BLOCKED!"
    //   Punt:       "Punt — 45 yards — Short return to the 25"
    // We search for "FIELD GOAL" (not "FG" — that substring never appears)
    // and "NO GOOD" must be checked BEFORE "GOOD" since it contains "GOOD".
    var lastSumEntry = driveSummaryLog.length > 0 ? driveSummaryLog[driveSummaryLog.length - 1] : null;
    var isPunt = false, isFgGood = false, isFgMiss = false;
    if (lastSumEntry && lastSumEntry.playName) {
      var pn = lastSumEntry.playName.toUpperCase();
      if (pn.indexOf('PUNT') >= 0) {
        isPunt = true;
      } else if (pn.indexOf('FIELD GOAL') >= 0) {
        if (pn.indexOf('NO GOOD') >= 0 || pn.indexOf('BLOCKED') >= 0) {
          isFgMiss = true;
        } else if (pn.indexOf('GOOD') >= 0) {
          isFgGood = true;
        }
      }
    }

    var pTeam = poss === 'CT' ? hTeam : oTeam;
    var pAccent = pTeam.accent || '#EBB010';
    var isUserTeam = poss === hAbbr;

    // Drive point total — compute from first-snap pre-drive score vs current gs score.
    // Includes the TD + XP/2pt/3pt conversion since showDrive is called AFTER the conversion resolves.
    var firstSnapPre = nonConv.length > 0 ? nonConv[0]._preSnap : null;
    var drivePoints = 0;
    if (firstSnapPre) {
      var _startScore = poss === 'CT' ? (firstSnapPre.ctScore || 0) : (firstSnapPre.irScore || 0);
      var _endScore = poss === 'CT' ? gs.ctScore : gs.irScore;
      drivePoints = Math.max(0, _endScore - _startScore);
    }
    var _ptSuffix = drivePoints === 1 ? 'POINT' : 'POINTS';

    // Result classification — hero stamp text + color
    var resText, resColor, resSub;
    if (td) {
      // Real point total including XP/2pt/3pt (e.g. "7 POINTS ON THE BOARD")
      resText = 'TOUCHDOWN';
      resColor = isUserTeam ? '#00ff44' : '#ff0040';
      resSub = drivePoints + ' ' + _ptSuffix + ' ON THE BOARD';
    } else if (hasInt) {
      resText = 'INTERCEPTION'; resColor = isUserTeam ? '#ff0040' : '#00ff44'; resSub = 'Drive ends with a pick';
    } else if (hasFum) {
      resText = 'FUMBLE'; resColor = isUserTeam ? '#ff0040' : '#00ff44'; resSub = 'Ball comes loose';
    } else if (isFgGood) {
      resText = 'FIELD GOAL'; resColor = '#EBB010'; resSub = drivePoints + ' ' + _ptSuffix;
    } else if (isFgMiss) {
      resText = 'NO GOOD'; resColor = isUserTeam ? '#ff0040' : '#00ff44'; resSub = 'Field goal missed';
    } else if (isPunt) {
      resText = 'PUNT'; resColor = '#888'; resSub = 'Flipping the field';
    } else {
      // 4th down stop, no score — neutral result
      resText = 'TURNOVER ON DOWNS'; resColor = isUserTeam ? '#ff0040' : '#00ff44'; resSub = 'Came up short';
    }

    // ── Backdrop ──
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:950;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0A0804;pointer-events:auto;';

    // Top/bottom team color accent bars
    var topBar = document.createElement('div');
    topBar.style.cssText = 'position:absolute;top:0;left:0;right:0;height:3px;background:' + pAccent + ';opacity:0;';
    ov.appendChild(topBar);
    var botBar = document.createElement('div');
    botBar.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:3px;background:' + pAccent + ';opacity:0;';
    ov.appendChild(botBar);

    // Ambient glow (team color, subtle)
    var glow = document.createElement('div');
    glow.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 30%,' + pAccent + '18 0%,transparent 55%);pointer-events:none;';
    ov.appendChild(glow);

    // ── Content column ──
    var content = document.createElement('div');
    content.style.cssText = 'position:relative;width:88%;max-width:340px;z-index:1;display:flex;flex-direction:column;align-items:center;gap:14px;';
    ov.appendChild(content);

    // ── HERO: Result stamp (giant, color-coded) ──
    var heroWrap = document.createElement('div');
    heroWrap.style.cssText = 'text-align:center;opacity:0;transform:scale(0.75);';
    var heroFont = resText.length > 12 ? 44 : resText.length > 9 ? 52 : 60;
    heroWrap.innerHTML =
      "<div style=\"font-family:'Teko';font-weight:900;font-size:" + heroFont + "px;color:" + resColor + ";letter-spacing:3px;line-height:0.95;text-shadow:0 0 30px " + resColor + "70,0 0 60px " + resColor + "30,0 4px 12px rgba(0,0,0,0.9);\">" + resText + "</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:600;font-size:11px;color:#888;letter-spacing:2px;margin-top:4px;\">" + resSub.toUpperCase() + "</div>";
    content.appendChild(heroWrap);

    // ── Team strip (team wordmark + accent bar) ──
    var teamStrip = document.createElement('div');
    teamStrip.style.cssText = 'text-align:center;opacity:0;';
    var _tsCfg = TEAM_WORDMARKS[pTeam.id] || {};
    var _tsSize = Math.max(16, Math.round((_tsCfg.heroSize || 40) * 0.42));
    var _tsWm = renderTeamWordmark(pTeam.id, 't2', { mascot: true, fontSize: _tsSize });
    var _tsNameSlot = document.createElement('div');
    _tsNameSlot.style.cssText = 'display:flex;justify-content:center;';
    if (_tsWm) _tsNameSlot.appendChild(_tsWm);
    else _tsNameSlot.innerHTML = "<div style=\"font-family:'Oswald';font-weight:700;font-size:18px;color:" + pAccent + ";letter-spacing:6px;text-shadow:0 0 14px " + pAccent + "66;\">" + pTeam.name.toUpperCase() + "</div>";
    teamStrip.appendChild(_tsNameSlot);
    var _tsBar = document.createElement('div');
    _tsBar.style.cssText = 'width:48px;height:1px;margin:6px auto 0;background:linear-gradient(90deg,transparent,' + pAccent + ',transparent);';
    teamStrip.appendChild(_tsBar);
    content.appendChild(teamStrip);

    // ── Stat row (one line: PLAYS · YARDS · 1ST DOWNS · EPA) ──
    // EPA = sum of per-snap Expected Points Added across the drive.
    // Positive = offense helped themselves. Negative = offense hurt themselves.
    var driveEPA = nonConv.reduce(function(s, r) { return s + (r._epa || 0); }, 0);
    var _epaColor = driveEPA >= 1.0 ? '#00ff44' : driveEPA >= 0 ? '#ccc' : driveEPA >= -1.0 ? '#FF6B00' : '#ff0040';

    // Push a summary to the game-wide drive history (for the stats sheet)
    var _driveResultTag = td ? 'TD' : hasInt ? 'INT' : hasFum ? 'FUM' : isFgGood ? 'FG' : isFgMiss ? 'NO GOOD' : isPunt ? 'PUNT' : 'DOWNS';
    _gameDriveHistory.push({
      team: poss,
      plays: totalPlays,
      yards: totalYds,
      epa: driveEPA,
      result: _driveResultTag,
      points: drivePoints,
    });

    var statRow = document.createElement('div');
    statRow.style.cssText = 'display:flex;justify-content:center;align-items:center;gap:12px;opacity:0;transform:translateY(6px);';
    function _statCell(val, lbl, valColor) {
      var col = valColor || '#fff';
      return "<div style='text-align:center;'>" +
        "<div style=\"font-family:'Teko';font-weight:700;font-size:22px;color:" + col + ";line-height:1;\">" + val + "</div>" +
        "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:9px;color:#666;letter-spacing:1.5px;margin-top:2px;\">" + lbl + "</div>" +
      "</div>";
    }
    function _statDivider() {
      return "<div style='width:1px;height:22px;background:rgba(255,255,255,0.12);'></div>";
    }
    statRow.innerHTML =
      _statCell(totalPlays, 'PLAYS') + _statDivider() +
      _statCell((totalYds >= 0 ? '' : '-') + Math.abs(totalYds), 'YARDS') + _statDivider() +
      _statCell(firstDowns, '1ST DNS') + _statDivider() +
      _statCell(formatKPA(driveEPA), 'KPA', _epaColor);
    content.appendChild(statRow);

    // ── Play timeline — compact rows, one per play ──
    var timelineWrap = document.createElement('div');
    timelineWrap.style.cssText = 'width:100%;margin-top:4px;display:flex;flex-direction:column;gap:3px;max-height:240px;overflow-y:auto;padding:0 4px;';

    // Helpers for compact row text
    function _dnOrd(d) { return d === 1 ? 'ST' : d === 2 ? 'ND' : d === 3 ? 'RD' : 'TH'; }
    // Express yard line from the possessing team's perspective ("OWN 35" / "OPP 35" / "50")
    function _yardLineText(yte) {
      if (yte === undefined || yte === null) return '';
      if (yte > 50) return 'OWN ' + (100 - yte);
      if (yte === 50) return '50';
      if (yte > 0)  return 'OPP ' + yte;
      return 'GOAL';
    }
    // Compact play description — no yardage (shown in the yards column), no tackler filler
    function _compactDesc(snap) {
      var res = snap.result || {};
      var off = snap.featuredOff;
      var def = snap.featuredDef;
      var offPlay = snap.offPlay;
      var isRun = offPlay && (offPlay.isRun || offPlay.type === 'run');
      var offName = off && off.name ? off.name : (isRun ? 'Rush' : 'Pass');
      var defName = def && def.name ? def.name : 'defense';
      if (res.isInterception) return 'Intercepted by ' + defName;
      if (res.isFumbleLost)   return 'Fumble recovered by ' + defName;
      if (res.isSack)         return 'Sacked by ' + defName;
      if (res.isIncomplete)   return 'Incomplete pass';
      if (isRun) return offName + ' run';
      // Pass play — name receiver if featured player isn't the QB
      if (off && off.pos !== 'QB') return 'Pass to ' + offName;
      return 'Pass complete';
    }

    // Build rows from nonConv snaps (+ append punt/FG tail entry from driveSummaryLog if present)
    var rows = [];
    nonConv.forEach(function(r) {
      var res = r.result || {};
      var preSnap = r._preSnap || {};
      var dn = preSnap.down || 1;
      var dst = preSnap.distance || 10;
      var yTe = preSnap.yardsToEndzone;
      var dsText = dn + _dnOrd(dn) + ' & ' + (yTe !== undefined && yTe <= 10 ? 'GOAL' : dst);
      var yLine = _yardLineText(yTe);
      var y = res.yards || 0;
      var isInc = res.isIncomplete;
      var isSack = res.isSack;
      var isInt = res.isInterception;
      var isFum = res.isFumbleLost;
      var isTd = res.isTouchdown;
      var yardColor = isTd ? '#EBB010' : (isInt || isFum || isSack) ? '#ff0040' : y >= 10 ? '#00ff44' : y > 0 ? '#ccc' : '#888';
      var yardText = isInt ? 'INT' : isFum ? 'FUM' : isSack ? (y || '—') : isInc ? '—' : (y > 0 ? '+' + y : y === 0 ? '—' : y);
      // Right-side marker pill
      var marker = '';
      if (isTd) marker = "<span style=\"font-family:'Teko';font-weight:700;font-size:10px;color:#EBB010;letter-spacing:1px;padding:1px 5px;background:rgba(235,176,16,0.12);border:1px solid rgba(235,176,16,0.35);border-radius:3px;margin-left:6px;white-space:nowrap;\">TD</span>";
      else if (r.gotFirstDown) marker = "<span style=\"font-family:'Teko';font-weight:700;font-size:10px;color:#00ff44;letter-spacing:1px;padding:1px 5px;background:rgba(0,255,68,0.12);border:1px solid rgba(0,255,68,0.35);border-radius:3px;margin-left:6px;white-space:nowrap;\">1ST</span>";
      rows.push({ dsText: dsText, yLine: yLine, pd: _compactDesc(r), yardText: yardText, yardColor: yardColor, marker: marker });
    });
    // Append punt/FG tail row if present — yard line from last snap in the drive
    if ((isPunt || isFgGood || isFgMiss) && lastSumEntry) {
      var _lastSnap = nonConv[nonConv.length - 1];
      var _lastYte = _lastSnap && _lastSnap._preSnap ? _lastSnap._preSnap.yardsToEndzone : undefined;
      rows.push({
        dsText: (lastSumEntry.down || 4) + _dnOrd(lastSumEntry.down || 4) + ' & ' + (lastSumEntry.dist || '—'),
        yLine: _yardLineText(_lastYte),
        pd: lastSumEntry.playName || '',
        yardText: '',
        yardColor: '#888',
        marker: '',
      });
    }

    rows.forEach(function(row, idx) {
      var rowEl = document.createElement('div');
      rowEl.style.cssText = 'display:flex;align-items:center;gap:10px;padding:7px 10px;background:rgba(255,255,255,0.02);border-left:2px solid ' + pAccent + '33;border-radius:2px;opacity:0;transform:translateX(-8px);';
      // D&D cell — two stacked lines (down & distance + yard line)
      var dndCell =
        "<div style=\"min-width:62px;line-height:1.15;\">" +
          "<div style=\"font-family:'Teko';font-weight:700;font-size:13px;color:#888;letter-spacing:0.5px;\">" + row.dsText + "</div>" +
          (row.yLine ? "<div style=\"font-family:'Rajdhani';font-weight:600;font-size:9px;color:#555;letter-spacing:0.5px;margin-top:1px;\">" + row.yLine + "</div>" : '') +
        "</div>";
      // Description cell — flex, allow wrap, no truncation
      var descCell = "<div style=\"flex:1;min-width:0;font-family:'Rajdhani';font-weight:500;font-size:11px;color:#bbb;line-height:1.3;word-break:break-word;\">" + row.pd + "</div>";
      // Yards cell + marker
      var ydsCell = row.yardText !== '' ? "<div style=\"font-family:'Teko';font-weight:700;font-size:16px;color:" + row.yardColor + ";letter-spacing:0.5px;min-width:30px;text-align:right;white-space:nowrap;\">" + row.yardText + "</div>" : '';
      rowEl.innerHTML = dndCell + descCell + ydsCell + row.marker;
      timelineWrap.appendChild(rowEl);
    });
    content.appendChild(timelineWrap);

    // ── Continue button ──
    var btnWrap = document.createElement('div');
    btnWrap.style.cssText = 'opacity:0;transform:translateY(8px);width:100%;display:flex;justify-content:center;';
    var btn = _flameBadgeContinue('CONTINUE', function() {
      try { gsap.to(ov, { opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: function() { if (ov.parentNode) ov.remove(); done(); } }); }
      catch(e) { if (ov.parentNode) ov.remove(); done(); }
    });
    btnWrap.appendChild(btn);
    content.appendChild(btnWrap);

    el.appendChild(ov);

    // ── Cascading entry animation ──
    // 0-200ms: backdrop fades in, accent bars slide in
    // 150-500ms: hero stamp scales in with overshoot
    // 400-600ms: team strip fades in
    // 500-700ms: stat row lifts in
    // 650ms+: play rows stagger in left-to-right
    // (last row + 200ms): continue button fades in
    try {
      ov.style.opacity = '0';
      gsap.to(ov, { opacity: 1, duration: 0.2, ease: 'power2.out' });
      gsap.to([topBar, botBar], { opacity: 1, duration: 0.25, delay: 0.05 });
      gsap.to(heroWrap, { opacity: 1, scale: 1, duration: 0.45, delay: 0.15, ease: 'back.out(2.2)' });
      gsap.to(teamStrip, { opacity: 1, duration: 0.3, delay: 0.4, ease: 'power2.out' });
      gsap.to(statRow, { opacity: 1, y: 0, duration: 0.3, delay: 0.5, ease: 'power2.out' });
      var _rowEls = timelineWrap.querySelectorAll('div');
      gsap.to(_rowEls, { opacity: 1, x: 0, duration: 0.25, delay: 0.65, stagger: 0.06, ease: 'power2.out' });
      var _btnDelay = 0.65 + _rowEls.length * 0.06 + 0.15;
      gsap.to(btnWrap, { opacity: 1, y: 0, duration: 0.3, delay: _btnDelay, ease: 'power2.out' });
    } catch(e) {
      ov.style.opacity = '1';
      heroWrap.style.opacity = '1'; heroWrap.style.transform = 'scale(1)';
      teamStrip.style.opacity = '1';
      statRow.style.opacity = '1'; statRow.style.transform = 'none';
      btnWrap.style.opacity = '1'; btnWrap.style.transform = 'none';
      var _rowEls2 = timelineWrap.querySelectorAll('div');
      for (var _i = 0; _i < _rowEls2.length; _i++) { _rowEls2[_i].style.opacity = '1'; _rowEls2[_i].style.transform = 'none'; }
    }
  }

  // ── CONVERSION ──
  var conversionMode = null; // null or {choice:'2pt'|'3pt', team:'CT'|'IR'}

  function showConv(team) {
    panel.style.display = ''; // Restore panel for conversion UI
    const isH = team === hAbbr;
    if (!isH) {
      const choice = gs.aiConversionDecision();
      if (choice === 'xp') {
        gs.handleConversion('xp'); drawBug();
        setNarr('Extra point is good.', '+1 point');
        showDrive(driveSnaps, team, () => { driveSnaps=[]; drivePlayHistory=[]; resetDriveSummary(); if(!checkEnd()) nextSnap(); });
      } else {
        // AI goes for 2 or 3 — user needs to defend!
        conversionMode = { choice: choice, team: team };
        var convYards = choice === '2pt' ? 5 : 10;
        // Position ball for CPU offense (opposite of human scoring team logic)
        gs.ballPosition = team === 'CT' ? (100 - convYards) : convYards;
        gs.down = 1;
        gs.distance = convYards;
        setNarr(choice.toUpperCase() + ' attempt', oTeam.name + ' going for it! Select your defense.');
        phase = 'play';
        drawBug(); drawField(); drawPanel();
      }
      return;
    }
    // Show conversion choice in the panel
    panel.className = 'T-panel T-panel-off';
    panel.innerHTML = '';
    var scoringTeamObj = team === hAbbr ? hTeam : oTeam;
    var scAccent = scoringTeamObj.accent || '#EBB010';

    // TD header
    var inst = document.createElement('div');
    inst.style.cssText = "text-align:center;padding:12px 0 8px;background:radial-gradient(ellipse at 50% 100%," + scAccent + "08,transparent 70%);";
    inst.innerHTML =
      "<div style=\"font-family:'Teko';font-weight:900;font-size:24px;color:" + scAccent + ";letter-spacing:4px;text-shadow:0 0 16px " + scAccent + "40;\">TOUCHDOWN!</div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:11px;color:#888;letter-spacing:3px;margin-top:2px;\">CHOOSE CONVERSION</div>";
    panel.appendChild(inst);

    // Three conversion cards
    var w = document.createElement('div');
    w.style.cssText = 'display:flex;gap:6px;padding:8px 10px 14px;';

    var convOptions = [
      { id: 'xp', pts: '+1', label: 'EXTRA POINT', desc: 'Automatic', risk: 'SAFE', color: '#00ff44' },
      { id: '2pt', pts: '+2', label: '2-POINT', desc: 'From the 5 yd line', risk: 'BALANCED', color: '#EBB010' },
      { id: '3pt', pts: '+3', label: '3-POINT', desc: 'From the 10 yd line', risk: 'RISKY', color: '#e03050' },
    ];

    convOptions.forEach(function(c) {
      var card = document.createElement('div');
      card.style.cssText = "flex:1;border-radius:6px;padding:12px 6px;text-align:center;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;border:1.5px solid " + c.color + "44;background:linear-gradient(170deg," + c.color + "10,#0a0804 60%);";
      card.innerHTML =
        "<div style=\"font-family:'Teko';font-weight:700;font-size:28px;color:" + c.color + ";line-height:0.85;\">" + c.pts + "</div>" +
        "<div style=\"font-family:'Oswald';font-weight:700;font-size:9px;color:" + c.color + ";letter-spacing:1px;\">" + c.label + "</div>" +
        "<div style=\"font-family:'Rajdhani';font-size:9px;color:#555;margin-top:2px;\">" + c.desc + "</div>" +
        "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:8px;color:" + c.color + ";letter-spacing:1px;padding:2px 6px;border:1px solid " + c.color + "33;border-radius:3px;margin-top:4px;\">" + c.risk + "</div>";

      card.onclick = function() {
        SND.click();
        if (c.id === 'xp') {
          gs.handleConversion('xp'); drawBug();
          setNarr('Extra point is GOOD!', '+1 point');
          showDrive(driveSnaps, team, function() { driveSnaps=[]; drivePlayHistory=[]; resetDriveSummary(); if(!checkEnd()) nextSnap(); });
        } else {
          conversionMode = { choice: c.id, team: team };
          var convYards = c.id === '2pt' ? 5 : 10;
          gs.ballPosition = gs.possession === 'CT' ? (100 - convYards) : convYards;
          gs.down = 1;
          gs.distance = convYards;
          setNarr(c.label + ' attempt', 'Select your play, player, and snap');
          phase = 'play';
          drawBug(); drawField(); drawPanel();
        }
      };
      w.appendChild(card);
    });
    panel.appendChild(w);
  }

  function doConversionSnap() {
    phase = 'busy';
    var cm = conversionMode;
    var scoringTeam = gs.possession; // capture before handleConversion flips it
    var isUserScoring = scoringTeam === hAbbr;

    var offPlay = isUserScoring ? selPl : null;
    var featuredOff = isUserScoring ? selP : null;
    var defPlay = isUserScoring ? null : selPl;
    var featuredDef = isUserScoring ? null : selP;

    var convResult = gs.handleConversion(cm.choice, offPlay, featuredOff, defPlay, featuredDef);
    // Dev: force conversion outcome
    var _devConv = getForceConversion();
    if (_devConv) {
      var pts = cm.choice === '2pt' ? 2 : 3;
      if (_devConv === 'good' && !convResult.success) {
        convResult.success = true; convResult.points = pts;
        if (scoringTeam === 'CT') gs.ctScore += pts; else gs.irScore += pts;
      } else if (_devConv === 'fail' && convResult.success) {
        convResult.success = false; convResult.points = 0;
        if (scoringTeam === 'CT') gs.ctScore -= pts; else gs.irScore -= pts;
      }
    }
    conversionMode = null;
    selP = null; selPl = null; selTorch = null;

    // Build a fake result object for the play-by-play system
    var fakeRes = {
      offPlay: offPlay || { name: 'CONVERSION', playType: 'SHORT', completionRate: 0.5, coverageMods: {} },
      defPlay: { name: 'GOAL LINE', cardType: 'ZONE', baseCoverage: 'cover_1' },
      featuredOff: featuredOff || { name: 'QB', pos: 'QB', ovr: 78, badge: '' },
      featuredDef: { name: 'Defense', pos: 'LB', ovr: 78, badge: '' },
      result: {
        yards: convResult.success ? (cm.choice === '2pt' ? 5 : 10) : 0,
        isTouchdown: false,
        isComplete: convResult.success,
        isIncomplete: !convResult.success,
        isSack: false, isInterception: false, isFumbleLost: false, isSafety: false,
        offComboPts: 0, defComboPts: 0, historyBonus: 0,
        description: convResult.success ? cm.choice.toUpperCase() + ' conversion is GOOD!' : cm.choice.toUpperCase() + ' conversion FAILED'
      },
      gotFirstDown: false,
      playType: 'pass',
      _torchEarned: 0,
      _torchSources: [],
      _preSnap: {
        down: 1, distance: cm.choice === '2pt' ? 5 : 10,
        yardsToEndzone: cm.choice === '2pt' ? 5 : 10,
        possession: cm.team, half: gs.half, playsUsed: gs.playsUsed,
        ctScore: cm.team === 'CT' ? gs.ctScore - (convResult.success ? convResult.points : 0) : gs.ctScore,
        irScore: cm.team === 'IR' ? gs.irScore - (convResult.success ? convResult.points : 0) : gs.irScore,
      }
    };

    // Get actual defender from opponent roster
    var defSides = gs.getCurrentSides();
    if (defSides.defPlayers && defSides.defPlayers.length > 0) {
      fakeRes.featuredDef = defSides.defPlayers[Math.floor(Math.random() * Math.min(4, defSides.defPlayers.length))];
    }

    drawField(); drawPanel();

    // Conversion-specific commentary — route through engine for variety
    var convLabel = cm.choice === '2pt' ? '2-point' : '3-point';
    var offName = fakeRes.featuredOff.name || 'QB';
    var defName = fakeRes.featuredDef.name || 'Defense';
    var isRun = offPlay && (offPlay.isRun || offPlay.type === 'run');
    var convGameState = { down: 1, distance: cm.choice === '2pt' ? 5 : 10, yardsToEndzone: cm.choice === '2pt' ? 5 : 10, half: gs.half, ctScore: gs.ctScore, irScore: gs.irScore, possession: cm.team, playsUsed: gs.playsUsed, twoMinActive: gs.twoMinActive };
    var convComm = generateCommentary(fakeRes, convGameState, hTeam.name, oTeam.name);
    if (convResult.success) {
      fakeRes.result.description = (convComm && convComm.line1) ? convComm.line1 + ' ' + convLabel + ' GOOD!'
        : isRun ? offName + ' punches it in! ' + convLabel + ' conversion is GOOD!'
        : offName + ' fires to the end zone — CAUGHT! ' + convLabel + ' conversion GOOD!';
    } else {
      fakeRes.result.description = (convComm && convComm.line1) ? convComm.line1 + ' ' + convLabel + ' no good.'
        : isRun ? offName + ' is stopped at the line. ' + convLabel + ' conversion fails.'
        : defName + ' breaks it up! ' + convLabel + ' conversion NO GOOD.';
    }
    // Mark as conversion so Beat 4 skips the TD celebration + conversion loop
    fakeRes._isConversion = true;
    fakeRes.gameEvent = 'conversion';

    drawField(); drawPanel();

    // Run through the full 3-beat snap display (clash, result, commentary)
    var prevPossConv = cm.team;
    run3BeatSnap(fakeRes, prevPossConv, false, false);
    // Safety: reset phase if still busy after max animation time
    setTimeout(function() { if (phase === 'busy') { phase = 'play'; drawBug(); drawField(); drawPanel(); } }, 8000);
  }

  // ── 2-MIN WARNING (dramatic overlay) ──
  function show2MinWarn() {
    SND.whistle();
    setTimeout(function() { try { SND.horn(); } catch(e) {} }, 300);
    shakeScreen(4);
    flashField('rgba(224,48,80,.3)');

    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:600;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:rgba(10,8,4,0.92);opacity:0;transition:opacity .25s;pointer-events:auto;cursor:pointer;';

    // Red accent bars
    var barT = document.createElement('div');
    barT.style.cssText = 'position:absolute;top:0;left:0;right:0;height:3px;background:#e03050;';
    var barB = document.createElement('div');
    barB.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:3px;background:#e03050;';
    ov.appendChild(barT); ov.appendChild(barB);

    // "2-MINUTE"
    var hero = document.createElement('div');
    hero.style.cssText = "font-family:'Teko';font-weight:900;font-size:52px;color:#e03050;letter-spacing:4px;text-shadow:0 0 30px rgba(224,48,80,0.5);opacity:0;transform:scale(0.3);";
    hero.textContent = '2-MINUTE';
    ov.appendChild(hero);

    // "WARNING"
    var sub = document.createElement('div');
    sub.style.cssText = "font-family:'Teko';font-weight:700;font-size:28px;color:#e03050;letter-spacing:6px;opacity:0;transform:translateY(8px);";
    sub.textContent = 'WARNING';
    ov.appendChild(sub);

    // Description
    var desc = document.createElement('div');
    desc.style.cssText = "font-family:'Rajdhani';font-weight:600;font-size:12px;color:#888;letter-spacing:2px;margin-top:8px;opacity:0;";
    desc.textContent = 'Clock stops at 2:00';
    ov.appendChild(desc);

    ov.onclick = function() { ov.style.opacity = '0'; setTimeout(function() { if (ov.parentNode) ov.remove(); }, 250); };
    el.appendChild(ov);
    requestAnimationFrame(function() {
      ov.style.opacity = '1';
      try {
        gsap.to(hero, { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2.5)' });
        gsap.to(sub, { opacity: 0.8, y: 0, duration: 0.2, delay: 0.15 });
        gsap.to(desc, { opacity: 1, duration: 0.2, delay: 0.3 });
      } catch(e) { hero.style.opacity='1';hero.style.transform='scale(1)'; sub.style.opacity='0.8'; desc.style.opacity='1'; }
    });
    setTimeout(function() { if (ov.parentNode) { ov.style.opacity = '0'; setTimeout(function() { if (ov.parentNode) ov.remove(); }, 250); } }, 2500);

    // Onboarding: 2-minute drill
    if (shouldShowHint('torch_hint_two_min')) {
      setTimeout(function() {
        var clockEl = _bugEls.clockEl || _bugEls.snapEl;
        if (clockEl) showOnboardingBubble(clockEl, '2-minute drill! Clock runs on completions and runs. Incompletes stop it.', 'torch_hint_two_min', { autoDismiss: 3000 });
      }, 2500);
    }
  }

  // ── COIN TOSS OVERLAY ──
  // Generate 3 face-down torch card offers (55% Bronze, 35% Silver, 10% Gold)
  function rollCoinTossCards() {
    var cards = [];
    for (var i = 0; i < 3; i++) {
      var r = Math.random();
      var tier = r < 0.55 ? 'BRONZE' : r < 0.90 ? 'SILVER' : 'GOLD';
      var pool = TORCH_CARDS.filter(function(c) { return c.tier === tier; });
      cards.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return cards;
  }

  function showCoinToss(onDone) {
    _driveHeat = 0;
    var humanWins = Math.random() < 0.5;
    var offers = rollCoinTossCards();

    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:700;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:rgba(10,8,4,0.95);opacity:0;transition:opacity .3s;pointer-events:auto;';
    el.appendChild(ov);
    requestAnimationFrame(function() { ov.style.opacity = '1'; });

    // Phase 1: Tap to flip — 3D coin with team logos on each side
    var tossTitle = document.createElement('div');
    tossTitle.style.cssText = "font-family:'Teko';font-weight:900;font-size:28px;letter-spacing:4px;margin-bottom:16px;background:linear-gradient(180deg,#FFD060,#EBB010,#8B4A1F,#EBB010);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 12px rgba(235,176,16,0.5)) drop-shadow(0 6px 12px rgba(0,0,0,0.9));";
    tossTitle.textContent = 'COIN TOSS';
    ov.appendChild(tossTitle);

    var coin = document.createElement('div');
    coin.style.cssText = 'width:110px;height:110px;perspective:400px;cursor:pointer;';
    var coinInner = document.createElement('div');
    coinInner.style.cssText = 'width:100%;height:100%;position:relative;transform-style:preserve-3d;transition:transform 1.5s cubic-bezier(0.22,1,0.36,1);';
    // Front: user's team
    var coinFront = document.createElement('div');
    coinFront.style.cssText = 'position:absolute;inset:0;border-radius:50%;background:linear-gradient(135deg,#EBB010,#B8860B);display:flex;align-items:center;justify-content:center;backface-visibility:hidden;animation:coinGlow 3s ease-in-out infinite;';
    coinFront.innerHTML = renderTeamBadge(GS.team, 70);
    // Back: opponent's team
    var coinBack = document.createElement('div');
    coinBack.style.cssText = 'position:absolute;inset:0;border-radius:50%;background:linear-gradient(135deg,#B8860B,#EBB010);display:flex;align-items:center;justify-content:center;backface-visibility:hidden;transform:rotateY(180deg);animation:coinGlow 3s ease-in-out infinite;';
    coinBack.innerHTML = renderTeamBadge(GS.opponent, 70);
    coinInner.appendChild(coinFront);
    coinInner.appendChild(coinBack);
    coin.appendChild(coinInner);
    var coinEdge = document.createElement('div');
    coinEdge.style.cssText = 'position:absolute;inset:-3px;border-radius:50%;border:1px solid rgba(255,215,0,0.15);pointer-events:none;';
    coin.appendChild(coinEdge);
    var label = document.createElement('div');
    label.style.cssText = "font-family:'Teko';font-weight:700;font-size:22px;color:#EBB010;letter-spacing:3px;margin-top:8px;animation:pulseHint 1.5s ease-in-out infinite;";
    label.textContent = 'TAP TO FLIP';
    ov.appendChild(coin);
    ov.appendChild(label);

    // Onboarding: coin toss
    if (shouldShowHint('torch_hint_coin_toss')) {
      setTimeout(function() {
        showOnboardingBubble(coin, 'Tap to flip. Winner chooses: draw a free torch card or receive the kickoff.', 'torch_hint_coin_toss');
      }, 800);
    }

    coin.onclick = function() {
      coin.onclick = null;
      // Land on winner's side: even rotations = front (human), odd half = back (opponent)
      var rotations = humanWins ? 1800 : 1980; // 1800 = 5 full turns (front), 1980 = 5.5 turns (back)
      coinInner.style.transform = 'rotateY(' + rotations + 'deg)';
      label.textContent = '';
      // Defer 80ms — this is often the very first interaction, so AudioContext.resume()
      // needs a tick to settle before Howler can play.
      setTimeout(function() { SND.coinFlip(); }, 80);
      // Coin lands in palm just before Phase 2 reveal (~1600ms total spin time)
      setTimeout(function() { SND.coinCatch(); }, 1400);

      setTimeout(function() {
        // Phase 2: Result + Choice
        ov.innerHTML = '';
        ov.style.background = '#0A0804';
        var winner = humanWins ? hTeam.name : oTeam.name;
        var winnerColor = humanWins ? hTeam.accent : oTeam.accent;
        var winnerTeam = humanWins ? hTeam : oTeam;

        // Background glow in team color
        var tossGlow = document.createElement('div');
        tossGlow.style.cssText = 'position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,' + winnerColor + '15 0%,transparent 70%);pointer-events:none;';
        ov.appendChild(tossGlow);

        // Container for structured layout
        var content = document.createElement('div');
        content.style.cssText = 'width:95%;max-width:400px;z-index:1;display:flex;flex-direction:column;gap:32px;align-items:center;';
        ov.appendChild(content);

        // Header
        var hdr = document.createElement('div');
        hdr.style.cssText = 'text-align:center;width:100%;';
        var titleText = humanWins ? 'YOU WON THE TOSS!' : winner.toUpperCase() + ' WON THE TOSS';
        hdr.innerHTML =
          "<div style=\"font-family:'Teko';font-weight:900;font-size:30px;color:" + winnerColor + ";letter-spacing:2px;line-height:1;text-shadow:0 0 30px " + winnerColor + "40;opacity:0;transform:scale(0.8);white-space:nowrap;\" id='toss-team'>" + titleText + "</div>";
        content.appendChild(hdr);

        if (humanWins) {
          var choiceWrap = document.createElement('div');
          choiceWrap.style.cssText = 'display:flex;flex-direction:column;gap:16px;width:100%;z-index:1;opacity:0;transform:translateY(10px);';
          choiceWrap.id = 'toss-res'; // for animation

          var cardOpt = document.createElement('div');
          cardOpt.style.cssText = 'width:100%;border-radius:12px;padding:20px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;border:1.5px solid #EBB01044;background:linear-gradient(180deg,rgba(235,176,16,0.08),transparent);position:relative;overflow:hidden;text-align:center;';
          cardOpt.innerHTML =
            '<div style="position:absolute;inset:0;pointer-events:none;background:linear-gradient(105deg,transparent 30%,rgba(235,176,16,0.04) 48%,transparent 70%);background-size:200px 100%;animation:shimmer 4s ease-in-out infinite;"></div>' +
            "<div style=\"font-family:'Teko';font-weight:700;font-size:24px;color:#EBB010;letter-spacing:2px;line-height:1.1;\">FREE TORCH CARD</div>" +
            "<div style=\"font-family:'Rajdhani';font-size:13px;color:#888;white-space:nowrap;\">Pick 1 of 3 mystery cards \u2014 but you kick off</div>";
          cardOpt.onclick = function() { showFaceDownCards(ov, offers, true, onDone); };

          var recvOpt = document.createElement('div');
          recvOpt.style.cssText = 'width:100%;border-radius:12px;padding:20px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;border:1.5px solid #00ff4444;background:linear-gradient(180deg,rgba(0,255,68,0.08),transparent);text-align:center;';
          recvOpt.innerHTML =
            "<div style=\"font-family:'Teko';font-weight:700;font-size:24px;color:#00ff44;letter-spacing:2px;line-height:1.1;\">RECEIVE THE KICK</div>" +
            "<div style=\"font-family:'Rajdhani';font-size:13px;color:#888;white-space:nowrap;\">Start with the ball \u2014 no free card until halftime</div>";
          recvOpt.onclick = function() {
            if (SND.snap) SND.snap(); else if (SND.click) SND.click();
            ov.style.opacity = '0';
            setTimeout(function() { ov.remove(); onDone({ chose: 'receive' }); }, 250);
          };

          choiceWrap.appendChild(cardOpt);
          choiceWrap.appendChild(recvOpt);
          content.appendChild(choiceWrap);

          requestAnimationFrame(function() {
            var t = ov.querySelector('#toss-team');
            var r = ov.querySelector('#toss-res');
            try {
              gsap.to(t, { opacity: 1, scale: 1, duration: 0.4, delay: 0.1, ease: 'back.out(1.5)' });
              gsap.to(r, { opacity: 1, y: 0, duration: 0.3, delay: 0.3 });
            } catch(e) { 
              t.style.opacity='1'; t.style.transform='none';
              r.style.opacity='1'; r.style.transform='none';
            }
          });
        } else {
          // CPU won — AI chooses
          var aiTakesCard = Math.random() < ({ EASY: 0.6, MEDIUM: 0.5, HARD: 0.4 }[gs.difficulty] || 0.5);

          // Result Highlight Box
          var resBox = document.createElement('div');
          resBox.style.cssText = 'width:100%;padding:24px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.05);text-align:center;opacity:0;transform:translateY(10px);display:flex;flex-direction:column;align-items:center;gap:12px;';
          resBox.id = 'toss-res';
          
          var badge = document.createElement('div');
          badge.innerHTML = renderTeamBadge(GS.opponent, 56);
          resBox.appendChild(badge);

          var choiceMsg = document.createElement('div');
          choiceMsg.style.cssText = "font-family:'Teko';font-weight:700;font-size:20px;color:#fff;letter-spacing:2px;";
          choiceMsg.textContent = aiTakesCard
            ? oTeam.name.toUpperCase() + ' TAKE A TORCH CARD'
            : oTeam.name.toUpperCase() + ' CHOOSE TO RECEIVE';
          resBox.appendChild(choiceMsg);

          content.appendChild(resBox);

          // What you get — full 4-layer flame (built-in color depth
          // replaces the old red→gold gradient).
          var youIcon = aiTakesCard
            ? ''
            : flameIconSVG(26, 1, 'margin-bottom:4px;');
          var youGetMsg = document.createElement('div');
          youGetMsg.style.cssText = "text-align:center;z-index:1;opacity:0;transform:translateY(10px);";
          youGetMsg.id = 'toss-you';
          youGetMsg.innerHTML = youIcon +
            "<div style=\"font-family:'Teko';font-weight:700;font-size:22px;color:#EBB010;letter-spacing:3px;text-shadow:0 0 16px rgba(235,176,16,0.3);\">" + (aiTakesCard ? 'YOU RECEIVE THE KICK' : 'YOU DRAW A FREE TORCH CARD') + "</div>";
          content.appendChild(youGetMsg);

          var contBtn = _flameBadgeContinue('CONTINUE', function() {
            contBtn.onclick = null;
            if (!aiTakesCard) {
              showFaceDownCards(ov, offers, false, onDone);
            } else {
              showAICardPick(ov, offers, onDone);
            }
          });
          contBtn.style.opacity = '0';
          contBtn.id = 'toss-btn';
          content.appendChild(contBtn);

          requestAnimationFrame(function() {
            var l = ov.querySelector('#toss-label');
            var t = ov.querySelector('#toss-team');
            var r = ov.querySelector('#toss-res');
            var y = ov.querySelector('#toss-you');
            var b = ov.querySelector('#toss-btn');
            try {
              gsap.to(l, { opacity: 1, y: 0, duration: 0.3, delay: 0.1 });
              gsap.to(t, { opacity: 1, scale: 1, duration: 0.4, delay: 0.15, ease: 'back.out(1.5)' });
              gsap.to(r, { opacity: 1, y: 0, duration: 0.3, delay: 0.3 });
              gsap.to(y, { opacity: 1, y: 0, duration: 0.3, delay: 0.4 });
              gsap.to(b, { opacity: 1, y: 0, duration: 0.3, delay: 0.5 });
            } catch(e) {
              l.style.opacity='1'; t.style.opacity='1'; t.style.transform='none';
              r.style.opacity='1'; r.style.transform='none'; y.style.opacity='1'; y.style.transform='none';
              b.style.opacity='1';
            }
          });
        }
      }, 1600);
    };
  }

  // Face-down card selection (used by coin toss and halftime)
  function showFaceDownCards(ov, offers, humanKicks, onDone) {
    ov.innerHTML = '';
    ov.style.cssText += 'background:radial-gradient(ellipse at 50% 30%,rgba(235,176,16,0.06) 0%,transparent 60%),rgba(10,8,4,0.95);';

    var title = document.createElement('div');
    title.style.cssText = "font-family:'Teko';font-weight:700;font-size:28px;color:#EBB010;letter-spacing:5px;text-align:center;text-shadow:0 0 20px rgba(235,176,16,0.4);";
    title.textContent = 'FREE TORCH CARD';
    ov.appendChild(title);

    var subtitle = document.createElement('div');
    subtitle.style.cssText = "font-family:'Rajdhani';font-size:13px;font-weight:600;color:#888;text-align:center;margin-top:6px;max-width:260px;line-height:1.4;letter-spacing:1px;";
    subtitle.textContent = 'Pick one. Single-use power-ups that boost your plays.';
    ov.appendChild(subtitle);

    var tapHint = document.createElement('div');
    tapHint.style.cssText = "font-family:'Rajdhani';font-size:11px;font-weight:700;color:#EBB01088;text-align:center;margin-top:12px;letter-spacing:2px;";
    tapHint.textContent = 'TAP A CARD TO REVEAL';
    ov.appendChild(tapHint);

    var cardRow = document.createElement('div');
    cardRow.style.cssText = 'display:flex;gap:14px;justify-content:center;margin-top:16px;';

    var cardWraps = [];
    offers.forEach(function(card, idx) {
      var wrap = document.createElement('div');
      wrap.style.cssText = 'cursor:pointer;opacity:0;transform:translateY(30px);transition:opacity 0.3s,transform 0.3s;animation:floatCard 3s ease-in-out infinite;animation-delay:' + (idx * 0.4) + 's;position:relative;will-change:transform;';
      var backCard = buildHomeCard('torch', 95, 133);
      wrap.appendChild(backCard);
      wrap._card = card;
      wrap._idx = idx;

      // Stagger entrance
      setTimeout(function() { wrap.style.opacity = '1'; wrap.style.transform = 'translateY(0)'; }, 400 + idx * 150);

      wrap.onclick = function() {
        // Disable all cards
        cardWraps.forEach(function(w) { w.onclick = null; w.style.cursor = 'default'; });
        tapHint.style.display = 'none';

        // Dim non-selected
        cardWraps.forEach(function(w) {
          if (w !== wrap) {
            try { gsap.to(w, { opacity: 0.15, scale: 0.9, duration: 0.3 }); } catch(e) { w.style.opacity = '0.15'; }
          }
        });

        // Flip the selected card: center on screen → scaleX squeeze → swap content → expand
        var isDramatic = card.tier === 'GOLD';
        var flipDur = isDramatic ? 0.18 : 0.12;

        // Simple flip: scaleX squeeze → swap content → expand. No center animation.
        wrap.style.animation = 'none';

        try {
          // Lift + squeeze
          gsap.to(wrap, { y: -10, scale: 1.1, duration: 0.2, ease: 'power2.out', onComplete: function() {
            // Squeeze to line
            gsap.to(wrap, { scaleX: 0, duration: isDramatic ? 0.18 : 0.12, ease: 'power2.in', onComplete: function() {
              // Swap content
              wrap.innerHTML = '';
              var revealed = buildTorchCard(card, 120, 168);
              wrap.appendChild(revealed);
              // Sound
              if (card.tier === 'GOLD') { try { SND.ignite(); } catch(e2) {} }
              else if (card.tier === 'SILVER') { try { SND.flipDramatic(); } catch(e2) {} }
              else { try { SND.flip(); } catch(e2) {} }
              // Expand back
              gsap.to(wrap, { scaleX: 1, duration: isDramatic ? 0.18 : 0.12, ease: 'power2.out', onComplete: function() {
                gsap.to(wrap, { y: 0, scale: 1, duration: 0.2, ease: 'back.out(2)' });
                // Glow burst
                if (isDramatic) {
                  gsap.fromTo(wrap, { boxShadow: '0 0 0 rgba(235,176,16,0)' }, { boxShadow: '0 0 40px rgba(235,176,16,0.7)', duration: 0.3, yoyo: true, repeat: 1 });
                }
              }});
            }});
          }});
        } catch(e) {
          wrap.innerHTML = '';
          wrap.appendChild(buildTorchCard(card, 120, 168));
        }

        // Show card name + effect below
        setTimeout(function() {
          var tierColors = { GOLD: '#EBB010', SILVER: '#C0C0C0', BRONZE: '#B87333' };
          var tierCol = tierColors[card.tier] || '#EBB010';
          var info = document.createElement('div');
          info.style.cssText = 'text-align:center;margin-top:16px;opacity:0;transform:translateY(10px);transition:opacity 0.4s,transform 0.4s;';
          info.innerHTML =
            "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:10px;color:" + tierCol + ";letter-spacing:2px;\">" + card.tier + "</div>" +
            "<div style=\"font-family:'Teko';font-weight:700;font-size:22px;color:#fff;letter-spacing:2px;margin-top:2px;\">" + card.name + "</div>" +
            "<div style=\"font-family:'Rajdhani';font-size:13px;color:#ccc;margin-top:4px;max-width:260px;line-height:1.4;\">" + card.effect + "</div>";
          ov.appendChild(info);
          requestAnimationFrame(function() { info.style.opacity = '1'; info.style.transform = 'translateY(0)'; });
        }, 700);

        // Award card
        if (gs.humanTorchCards.length < 3) gs.humanTorchCards.push(card.id);
        var cardObj = TORCH_CARDS.find(function(tc) { return tc.id === card.id; });
        if (cardObj) torchInventory.push(cardObj);
        if (GS.season) GS.season.torchCards = torchInventory.slice();

        // Continue button
        var dismissFn = function() {
          ov.style.opacity = '0';
          setTimeout(function() {
            ov.remove();
            onDone({ chose: humanKicks ? 'card' : 'card_cpu_receives', card: card });
          }, 250);
        };
        var continueBtn = _flameBadgeContinue('CONTINUE', dismissFn);
        continueBtn.style.opacity = '0';
        continueBtn.style.transition = 'opacity 0.3s';
        ov.appendChild(continueBtn);
        setTimeout(function() { continueBtn.style.opacity = '1'; }, 1500);
      };
      cardRow.appendChild(wrap);
      cardWraps.push(wrap);
    });
    ov.appendChild(cardRow);

    // Onboarding: face-down cards
    if (shouldShowHint('torch_hint_face_down')) {
      setTimeout(function() {
        showOnboardingBubble(cardRow, 'Torch cards are single-use power-ups. Pick one — you\'ll see what it does.', 'torch_hint_face_down');
      }, 1200);
    }
  }

  // AI picks a face-down card — shows card backs, auto-selects one, flips to reveal
  function showAICardPick(ov, offers, onDone) {
    ov.innerHTML = '';
    ov.onclick = null;
    ov.style.cssText = 'position:fixed;inset:0;z-index:700;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:#0A0804;pointer-events:auto;';

    var pickIdx = Math.floor(Math.random() * offers.length);
    var pickedCard = offers[pickIdx];

    var badge = document.createElement('div');
    badge.innerHTML = renderTeamBadge(GS.opponent, 48);
    ov.appendChild(badge);

    var title = document.createElement('div');
    title.style.cssText = "font-family:'Teko';font-weight:700;font-size:22px;color:" + oTeam.accent + ";letter-spacing:3px;text-align:center;";
    title.textContent = oTeam.name + ' ARE CHOOSING...';
    ov.appendChild(title);

    // 3 proper card backs
    var cardRow = document.createElement('div');
    cardRow.style.cssText = 'display:flex;gap:14px;justify-content:center;margin-top:16px;';
    var aiWraps = [];
    offers.forEach(function(card, idx) {
      var w = document.createElement('div');
      w.appendChild(buildHomeCard('torch', 95, 133));
      cardRow.appendChild(w);
      aiWraps.push(w);
    });
    ov.appendChild(cardRow);

    // After 1.5s: fade non-selected, flip selected
    setTimeout(function() {
      if (!ov.parentNode) return;

      // Dim non-selected
      aiWraps.forEach(function(w, i) {
        if (i !== pickIdx) {
          try { gsap.to(w, { opacity: 0.15, duration: 0.3 }); } catch(e) { w.style.opacity = '0.15'; }
        }
      });

      // Flip selected with scaleX
      var picked = aiWraps[pickIdx];
      try {
        var tl = gsap.timeline();
        tl.to(picked, { y: -6, scale: 1.05, duration: 0.15, ease: 'power2.out' });
        tl.to(picked, { scaleX: 0, duration: 0.12, ease: 'power2.in' });
        tl.call(function() {
          picked.innerHTML = '';
          picked.appendChild(buildTorchCard(pickedCard, 100, 140));
          if (pickedCard.tier === 'GOLD') { try { SND.ignite(); } catch(e) {} }
          else if (pickedCard.tier === 'SILVER') { try { SND.flipDramatic(); } catch(e) {} }
          else { try { SND.flip(); } catch(e) {} }
          title.textContent = oTeam.name + ' DREW:';
        });
        tl.to(picked, { scaleX: 1, duration: 0.12, ease: 'power2.out' });
        tl.to(picked, { y: 0, scale: 1, duration: 0.2, ease: 'back.out(2)' });
      } catch(e) {
        picked.innerHTML = '';
        picked.appendChild(buildTorchCard(pickedCard, 100, 140));
        title.textContent = oTeam.name + ' DREW:';
      }

      // Always show card info + CONTINUE button after flip (independent of GSAP)
      gs.cpuTorchCards.push(pickedCard.id);

      setTimeout(function() {
        if (!ov.parentNode) return;
        // Card face already shows the name + effect via buildTorchCard. No
        // duplicate info panel beneath — just the continue button.
        var btn = _flameBadgeContinue('CONTINUE', function() {
          btn.onclick = null;
          ov.style.transition = 'opacity 0.25s';
          ov.style.opacity = '0';
          setTimeout(function() { if (ov.parentNode) ov.remove(); onDone({ chose: 'receive' }); }, 250);
        });
        ov.appendChild(btn);
      }, 800); // 800ms = enough time for flip animation to complete
    }, 1500);
  }

  // Special teams result overlay (punt, FG, kickoff)
  /**
   * Show a special-teams result (punt / FG / blocked kick).
   * @param {string} text  — the full descriptive label (goes in the details box)
   * @param {string} color — accent color for the hero text + ambient glow
   * @param {function} onDone — callback after the user dismisses the overlay
   * @param {string} type  — explicit result type. Pass one of:
   *   'punt' | 'fg_good' | 'fg_miss' | 'blocked_fg' | 'blocked_punt'
   *   Omit to fall back to string-matching on `text`. Prefer explicit — the
   *   old string matching failed on short AI FG labels like "BLOCKED!" or
   *   "NO GOOD!" which didn't contain "PUNT" / "FIELD GOAL".
   */
  function showSpecialTeamsResult(text, color, onDone, type) {
    var stOv = document.createElement('div');
    var _stFired = false;
    function _stDone() { if (_stFired) return; _stFired = true; if (stOv.parentNode) stOv.remove(); if (onDone) onDone(); }
    stOv.style.cssText = 'position:fixed;inset:0;z-index:950;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;background:rgba(10,8,4,0.96);opacity:0;transition:opacity 0.4s;pointer-events:auto;';

    // Glow background
    var glow = document.createElement('div');
    glow.style.cssText = 'position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,' + color + '15 0%,transparent 70%);z-index:0;';
    stOv.appendChild(glow);

    var content = document.createElement('div');
    content.style.cssText = 'width:90%;max-width:320px;z-index:1;display:flex;flex-direction:column;gap:24px;align-items:center;';
    stOv.appendChild(content);

    // ── Resolve type ──
    // Prefer the explicit type parameter. Fall back to string-match on `text`
    // for legacy call sites (but all 5 internal call sites now pass it).
    var resolvedType = type;
    if (!resolvedType) {
      var upper = (text || '').toUpperCase();
      if (upper.indexOf('BLOCKED') >= 0 && upper.indexOf('PUNT') >= 0) resolvedType = 'blocked_punt';
      else if (upper.indexOf('BLOCKED') >= 0) resolvedType = 'blocked_fg';
      else if (upper.indexOf('PUNT') >= 0) resolvedType = 'punt';
      else if (upper.indexOf('NO GOOD') >= 0) resolvedType = 'fg_miss';
      else if (upper.indexOf('FIELD GOAL') >= 0 || upper.indexOf("IT'S GOOD") >= 0 || upper.indexOf('GOOD') >= 0) resolvedType = 'fg_good';
      else resolvedType = 'special_teams';
    }

    // Hero text per type
    var typeText;
    switch (resolvedType) {
      case 'punt':         typeText = 'PUNT'; break;
      case 'fg_good':      typeText = 'FIELD GOAL'; break;
      case 'fg_miss':      typeText = 'NO GOOD'; break;
      case 'blocked_fg':   typeText = 'BLOCKED!'; break;
      case 'blocked_punt': typeText = 'BLOCKED!'; break;
      default:             typeText = 'SPECIAL TEAMS';
    }

    // Main Title (the hero). No separate "SPECIAL TEAMS" header — it was
    // redundant with the hero and caused the "SPECIAL TEAMS / SPECIAL TEAMS"
    // double-display when classification failed on short AI labels.
    var resultEl = document.createElement('div');
    resultEl.style.cssText = "font-family:'Teko';font-weight:900;font-size:52px;color:" + color + ";letter-spacing:2px;text-align:center;line-height:1;text-shadow:0 0 30px " + color + "40,0 0 60px " + color + "20,0 4px 12px rgba(0,0,0,0.9);opacity:0;transform:scale(0.8);";
    resultEl.textContent = typeText;
    content.appendChild(resultEl);

    // Details Box
    var resBox = document.createElement('div');
    resBox.style.cssText = 'width:100%;padding:22px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.08);text-align:center;opacity:0;transform:translateY(10px);';
    // Clean up the text: remove the redundant type prefix if it exists
    var displayDetails = text.replace(/^(Punt|Field Goal|FG) [\u2014\u2013-] /i, '').toUpperCase();
    resBox.innerHTML = "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:15px;color:#fff;letter-spacing:1px;line-height:1.4;\">" + displayDetails + "</div>";
    content.appendChild(resBox);

    // Continue button
    var contBtn = _flameBadgeContinue('CONTINUE', function() { stOv.style.opacity = '0'; setTimeout(_stDone, 200); });
    contBtn.style.opacity = '0';
    contBtn.style.transform = 'translateY(10px)';
    content.appendChild(contBtn);

    stOv.onclick = function() { stOv.style.opacity = '0'; setTimeout(_stDone, 200); };
    el.appendChild(stOv);
    requestAnimationFrame(function() {
      stOv.style.opacity = '1';
      try {
        gsap.to(resultEl, { opacity: 1, scale: 1, duration: 0.4, delay: 0.1, ease: 'back.out(1.5)' });
        gsap.to(resBox, { opacity: 1, y: 0, duration: 0.3, delay: 0.25 });
        gsap.to(contBtn, { opacity: 1, y: 0, duration: 0.3, delay: 0.4 });
      } catch(e) {
        resultEl.style.opacity='1'; resultEl.style.transform='none';
        resBox.style.opacity='1'; resBox.style.transform='none'; contBtn.style.opacity='1'; contBtn.style.transform='none';
      }
    });
  }

  // Brief kickoff result overlay
  function showKickoffResult(resultText, onDone) {
    var recTeam = gs.possession === hAbbr ? hTeam : oTeam;
    var recColor = recTeam.accent || '#EBB010';
    var kov = document.createElement('div');
    var _kovFired = false;
    function _kovDone() { if (_kovFired) return; _kovFired = true; if (kov.parentNode) kov.remove(); if (onDone) onDone(); }
    kov.style.cssText = 'position:fixed;inset:0;z-index:950;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;background:rgba(10,8,4,0.96);opacity:0;transition:opacity 0.4s;pointer-events:auto;';

    // Background radial glow
    var bgGlow = document.createElement('div');
    bgGlow.style.cssText = 'position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,' + (recTeam.colors ? recTeam.colors.primary : recColor) + '15 0%,transparent 70%);pointer-events:none;';
    kov.appendChild(bgGlow);

    // Container for structured layout
    var content = document.createElement('div');
    content.style.cssText = 'width:90%;max-width:320px;z-index:1;display:flex;flex-direction:column;gap:30px;align-items:center;';
    kov.appendChild(content);

    // Header
    var hdr = document.createElement('div');
    hdr.style.cssText = 'text-align:center;';
    hdr.innerHTML = 
      "<div style=\"font-family:'Oswald';font-weight:700;font-size:11px;color:#888;letter-spacing:4px;margin-bottom:6px;opacity:0;transform:translateY(10px);\" id='kov-label'>KICKOFF</div>" +
      "<div style=\"font-family:'Teko';font-weight:900;font-size:42px;color:" + recColor + ";letter-spacing:2px;line-height:1;text-shadow:0 0 30px " + recColor + "40;opacity:0;transform:scale(0.8);\" id='kov-team'>" + recTeam.name.toUpperCase() + " RECEIVE</div>";
    content.appendChild(hdr);

    // Result Highlight Box
    var resBox = document.createElement('div');
    resBox.style.cssText = 'width:100%;padding:20px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid rgba(255,255,255,0.05);text-align:center;opacity:0;transform:translateY(10px);';
    resBox.id = 'kov-res';
    resBox.innerHTML = 
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:16px;color:#fff;letter-spacing:1px;\">" + resultText.toUpperCase() + "</div>";
    content.appendChild(resBox);

    // Continue button
    var contBtn = _flameBadgeContinue('START DRIVE', function() { kov.style.opacity = '0'; setTimeout(_kovDone, 200); });
    contBtn.style.opacity = '0';
    contBtn.style.transform = 'translateY(10px)';
    contBtn.id = 'kov-btn';
    content.appendChild(contBtn);

    kov.onclick = function() { kov.style.opacity = '0'; setTimeout(_kovDone, 200); };
    el.appendChild(kov);
    
    requestAnimationFrame(function() {
      kov.style.opacity = '1';
      var l = kov.querySelector('#kov-label');
      var t = kov.querySelector('#kov-team');
      var r = kov.querySelector('#kov-res');
      var b = kov.querySelector('#kov-btn');
      try {
        gsap.to(l, { opacity: 1, y: 0, duration: 0.3, delay: 0.1 });
        gsap.to(t, { opacity: 1, scale: 1, duration: 0.4, delay: 0.15, ease: 'back.out(1.5)' });
        gsap.to(r, { opacity: 1, y: 0, duration: 0.3, delay: 0.3 });
        gsap.to(b, { opacity: 1, y: 0, duration: 0.3, delay: 0.45 });
      } catch(e) { 
        l.style.opacity='1'; t.style.opacity='1'; t.style.transform='none';
        r.style.opacity='1'; r.style.transform='none'; b.style.opacity='1'; b.style.transform='none';
      }
    });

    // Onboarding: kickoff
    if (gs.possession === hAbbr && shouldShowHint('torch_hint_kickoff')) {
      setTimeout(function() {
        var contEl = kov.querySelector('button') || kov;
        showOnboardingBubble(contEl, "You've got the ball. Time to drive.", 'torch_hint_kickoff');
      }, 800);
    }
  }

  // ── TRANSITIONS ──
  function showHalfEnd(isGameEnd, onDone) {
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:700;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:rgba(10,8,4,0);pointer-events:auto;';
    el.appendChild(ov);

    try { gsap.to(ov, { backgroundColor: 'rgba(10,8,4,0.92)', duration: 0.4 }); } catch(e) { ov.style.background = 'rgba(10,8,4,0.92)'; }

    // Gold accent bars
    var barT = document.createElement('div');
    barT.style.cssText = 'position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#8B4A1F,#EBB010,#FFD060,#EBB010,#8B4A1F);z-index:2;opacity:0;';
    var barB = document.createElement('div');
    barB.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#8B4A1F,#EBB010,#FFD060,#EBB010,#8B4A1F);z-index:2;opacity:0;';
    ov.appendChild(barT); ov.appendChild(barB);

    var label = isGameEnd ? 'FINAL' : 'HALFTIME';

    // Determine chrome gradient — game end uses result color, halftime uses gold
    var hScoreCheck = hAbbr === 'CT' ? gs.ctScore : gs.irScore;
    var cScoreCheck = hAbbr === 'CT' ? gs.irScore : gs.ctScore;
    var heroSize = isGameEnd ? 48 : 40;
    var chromeGrad, chromeShadow;
    if (isGameEnd && hScoreCheck > cScoreCheck) {
      chromeGrad = 'linear-gradient(180deg,#66FF88,#00ff44,#008822,#00ff44)';
      chromeShadow = 'rgba(0,255,68,0.5)';
    } else if (isGameEnd && hScoreCheck < cScoreCheck) {
      chromeGrad = 'linear-gradient(180deg,#FF6680,#ff0040,#880022,#ff0040)';
      chromeShadow = 'rgba(255,0,64,0.5)';
    } else {
      chromeGrad = 'linear-gradient(180deg,#FFD060,#EBB010,#8B4A1F,#EBB010)';
      chromeShadow = 'rgba(235,176,16,0.5)';
    }

    // Hero text with metallic chrome
    var textEl = document.createElement('div');
    textEl.style.cssText = "font-family:'Teko';font-weight:900;font-size:" + heroSize + "px;letter-spacing:4px;line-height:1;background:" + chromeGrad + ";-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 12px " + chromeShadow + ") drop-shadow(0 6px 12px rgba(0,0,0,0.9));opacity:0;transform:scale(0.3);z-index:1;";
    textEl.textContent = label;
    ov.appendChild(textEl);

    // Score: "BOARS 21 · SERPENTS 14"
    var hScore = hAbbr === 'CT' ? gs.ctScore : gs.irScore;
    var cScore = hAbbr === 'CT' ? gs.irScore : gs.ctScore;
    var scoreEl = document.createElement('div');
    scoreEl.style.cssText = "font-family:'Oswald';font-weight:700;font-size:16px;color:rgba(255,255,255,0.7);letter-spacing:3px;z-index:1;opacity:0;margin-top:4px;";
    scoreEl.textContent = hTeam.name.toUpperCase() + ' ' + hScore + ' \u00b7 ' + oTeam.name.toUpperCase() + ' ' + cScore;
    ov.appendChild(scoreEl);

    var contBtn = _flameBadgeContinue('CONTINUE', null);
    contBtn.style.cssText += 'margin-top:20px;opacity:0;z-index:1;transform:translateY(10px);';
    ov.appendChild(contBtn);

    var dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      try { gsap.to(ov, { opacity: 0, duration: 0.3, onComplete: function() { ov.remove(); onDone(); } }); }
      catch(e) { ov.remove(); onDone(); }
    }
    contBtn.onclick = function(e) { e.stopPropagation(); dismiss(); };
    ov.onclick = dismiss;

    try {
      gsap.to([barT, barB], { opacity: 1, duration: 0.3, delay: 0.2 });
      gsap.to(textEl, { opacity: 1, scale: 1, duration: 0.3, delay: 0.3, ease: 'back.out(2.5)' });
      gsap.to(scoreEl, { opacity: 1, duration: 0.25, delay: 0.5 });
      gsap.to(contBtn, { opacity: 1, y: 0, duration: 0.25, delay: 0.7 });
    } catch(e) { textEl.style.opacity = '1'; textEl.style.transform = 'scale(1)'; scoreEl.style.opacity = '1'; contBtn.style.opacity = '1'; barT.style.opacity = '1'; barB.style.opacity = '1'; }
  }

  function checkEnd() {
    if (gs.gameOver) {
      SND.whistleEndHalf();
      AudioStateManager.stopCrowd(2);
      // Attach final game-wide stat accumulators to the engine so endGame can
      // surface efficiency metrics (EPA, turnover margin, 3rd down %)
      gs._finalStats = {
        _hEpaSum: _hEpaSum, _cEpaSum: _cEpaSum,
        _hEpaPlays: _hEpaPlays, _cEpaPlays: _cEpaPlays,
        _hTurnovers: _hTurnovers, _cTurnovers: _cTurnovers,
        _h3rdAtt: _h3rdAtt, _h3rdConv: _h3rdConv,
        _c3rdAtt: _c3rdAtt, _c3rdConv: _c3rdConv,
        _hExplosive: _hExplosive, _cExplosive: _cExplosive,
        _hTdsPass: _hTdsPass, _hTdsRush: _hTdsRush,
        _cTdsPass: _cTdsPass, _cTdsRush: _cTdsRush,
        _hFgMade: _hFgMade, _cFgMade: _cFgMade,
        _hCardsUsed: _hCardsUsed, _cCardsUsed: _cCardsUsed,
        _gameDriveHistory: _gameDriveHistory,
      };
      showHalfEnd(true, function() { setGs(s => ({...s, screen:'end_game', finalEngine:gs, humanAbbr:hAbbr})); });
      return true;
    }
    if (gs.needsHalftime) {
      SND.whistleEndHalf();
      // Persist stat accumulators across halftime rebuild
      GS._gameplayStats = {
        hOffPassAtt: hOffPassAtt, hOffPassComp: hOffPassComp, hOffPassYds: hOffPassYds,
        hOffRushAtt: hOffRushAtt, hOffRushYds: hOffRushYds,
        hOffRecYds: hOffRecYds, hOffRec: hOffRec,
        hOffQBName: hOffQBName, hOffRBName: hOffRBName, hOffWRName: hOffWRName,
        hDefStats: hDefStats,
        cOffPassAtt: cOffPassAtt, cOffPassComp: cOffPassComp, cOffPassYds: cOffPassYds,
        cOffRushAtt: cOffRushAtt, cOffRushYds: cOffRushYds,
        cOffRecYds: cOffRecYds, cOffRec: cOffRec,
        cOffQBName: cOffQBName, cOffRBName: cOffRBName, cOffWRName: cOffWRName,
        cDefStats: cDefStats,
        _playerGameStats: _playerGameStats,
        _hEpaSum: _hEpaSum, _cEpaSum: _cEpaSum,
        _hEpaPlays: _hEpaPlays, _cEpaPlays: _cEpaPlays,
        _hTurnovers: _hTurnovers, _cTurnovers: _cTurnovers,
        _h3rdAtt: _h3rdAtt, _h3rdConv: _h3rdConv,
        _c3rdAtt: _c3rdAtt, _c3rdConv: _c3rdConv,
        _hExplosive: _hExplosive, _cExplosive: _cExplosive,
        _hTdsPass: _hTdsPass, _hTdsRush: _hTdsRush,
        _cTdsPass: _cTdsPass, _cTdsRush: _cTdsRush,
        _hFgMade: _hFgMade, _cFgMade: _cFgMade,
        _hCardsUsed: _hCardsUsed, _cCardsUsed: _cCardsUsed,
        _gameDriveHistory: _gameDriveHistory,
      };
      showHalfEnd(false, function() { setGs(s => ({...s, screen:'halftime'})); });
      return true;
    }
    return false;
  }

  // ── BROADCAST POLISH: AMBIENT SYSTEMS ──

  // A. Ambient gold particle drift
  var _ambientParticles = [];
  var _ambientContainer = null;
  function _boostParticles() {} // no-op — ambient particles removed

  // B. Shimmer sweep helper for gold UI elements
  var _shimmerEls = [];
  function _addShimmer(target) {
    if (!target) return;
    var sh = document.createElement('div');
    sh.style.cssText = 'position:absolute;inset:0;background:linear-gradient(105deg,transparent 30%,rgba(235,176,16,0.08) 45%,rgba(255,255,255,0.12) 50%,rgba(235,176,16,0.08) 55%,transparent 70%);background-size:200% 100%;pointer-events:none;border-radius:inherit;';
    target.style.position = 'relative';
    target.style.overflow = 'hidden';
    target.appendChild(sh);
    _shimmerEls.push(sh);
    function sweep() {
      gsap.fromTo(sh, { backgroundPosition: '200% 0' }, { backgroundPosition: '-200% 0', duration: 1.2, ease: 'power1.inOut', delay: 5 + Math.random() * 3, onComplete: sweep });
    }
    sweep();
  }

  // ── INIT ──
  drawBug(); drawField();
  // Apply shimmer to gold elements after they exist
  setTimeout(function() {
    var _tbContent = el.querySelector('.T-torch-banner-content');
    if (_tbContent) _addShimmer(_tbContent);
  }, 500);
  if (gs.twoMinActive) { prev2min = true; el.classList.add('T-urgent'); el.classList.add('T-2min-active'); }

  // Shared helper — resolves the opening kickoff and enters the play phase.
  // Called from BOTH paths: the legacy inline coin toss (fallback for
  // dev quick play) and the new runway path where the coin toss was
  // already handled in pregame.js before arriving here.
  function _enterPlayAfterOpeningKickoff(humanReceives) {
    // Resolve kickoff and set field position (HOUSE_CALL auto-consumed if human receives)
    var kickResult = _resolveKickoff(humanReceives);
    var startYard = kickResult === -1 ? 25 : kickResult; // return TD = rare, treat as touchback for simplicity
    if (humanReceives) {
      gs.possession = 'CT';
      gs.ballPosition = startYard; // CT at own yard line
    } else {
      gs.possession = 'IR';
      gs.ballPosition = 100 - startYard; // IR at own yard line (from CT perspective)
    }
    gs.down = 1;
    gs.distance = 10;

    var posLabel = startYard === 25 ? 'Touchback \u2014 ball on the 25' : 'Returned to the ' + startYard;
    showKickoffResult(posLabel, function() {
      drawBug(); drawField();
      phase = 'play';
      panel.style.display = '';
      drawPanel();
    });
  }

  // First load: coin toss → kickoff → play
  // Two entry paths:
  //   (a) Runway already ran the coin toss in pregame.js. GS._coinTossDone
  //       is true, GS.humanReceives is set. Skip showCoinToss, go straight
  //       to kickoff resolution.
  //   (b) Legacy path (dev quick play, tests): _coinTossDone is false. Run
  //       the old inline showCoinToss for backwards compat.
  if (GS._coinTossDone && !GS._openingKickoffResolved) {
    // (a) Runway path — coin toss was handled in pregame.js
    GS._openingKickoffResolved = true;
    panel.style.display = 'none';
    _enterPlayAfterOpeningKickoff(GS.humanReceives === true);
  } else if (!GS._coinTossDone) {
    // (b) Legacy inline coin toss fallback
    GS._coinTossDone = true;
    GS._openingKickoffResolved = true;
    panel.style.display = 'none'; // Hide card tray until after kickoff
    showCoinToss(function(result) {
      // result.chose = 'receive' | 'card' | 'card_cpu_receives'
      // Determine who receives the opening kickoff
      // 'receive' = human chose to receive. 'card' = human drew card, kicks off (CPU receives).
      // 'card_cpu_receives' = CPU won toss and chose to receive, human got card (CPU receives).
      var humanReceives = result.chose === 'receive';

      // Resolve kickoff and set field position (HOUSE_CALL auto-consumed if human receives)
      var kickResult = _resolveKickoff(humanReceives);
      var startYard = kickResult === -1 ? 25 : kickResult; // return TD = rare, treat as touchback for simplicity
      if (humanReceives) {
        gs.possession = 'CT';
        gs.ballPosition = startYard; // CT at own yard line
      } else {
        gs.possession = 'IR';
        gs.ballPosition = 100 - startYard; // IR at own yard line (from CT perspective)
      }
      gs.down = 1;
      gs.distance = 10;

      var posLabel = startYard === 25 ? 'Touchback \u2014 ball on the 25' : 'Returned to the ' + startYard;
      showKickoffResult(posLabel, function() {
        drawBug(); drawField();
        // Torch tutorial — disabled, will revisit
        if (false) {
          _torchTutorialShown = true;
          var torchTutOv = document.createElement('div');
          torchTutOv.style.cssText = 'position:fixed;inset:0;z-index:900;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(10,8,4,0.92);opacity:0;transition:opacity .3s;pointer-events:auto;';
          var _ftSvg = '<svg viewBox="0 0 34 34" width="46" height="46" style="animation:T-flame-pulse 2s ease-in-out infinite;filter:drop-shadow(0 0 12px ' + hTeam.accent + ')">' + flameLayersMarkup() + '</svg>';
          var _hasReactiveOnly = torchInventory.every(function(c) { return c.type === 'reactive'; });
          var _tutDesc = _hasReactiveOnly
            ? 'Reactive cards activate automatically when triggered. Look for the prompt during play!'
            : 'When you have a playable card, tap it to power up your play before you snap.';
          torchTutOv.innerHTML =
            _ftSvg +
            "<div style=\"font-family:'Teko';font-weight:700;font-size:28px;color:" + hTeam.accent + ";letter-spacing:4px;text-shadow:0 0 20px " + hTeam.accent + "40;\">TORCH CARD EARNED!</div>" +
            "<div style=\"font-family:'Rajdhani';font-weight:600;font-size:14px;color:#999;letter-spacing:2px;text-align:center;max-width:280px;line-height:1.4;\">" + _tutDesc + "</div>" +
            "<button class='btn-blitz' style='margin-top:20px;font-size:16px;padding:14px 40px;background:#141008;color:" + hTeam.accent + ";border-color:" + hTeam.accent + ";letter-spacing:3px;'>GOT IT</button>";
          torchTutOv.querySelector('button').onclick = function() {
            torchTutOv.style.opacity = '0';
            setTimeout(function() {
              torchTutOv.remove();
              phase = 'play';
              panel.style.display = '';
              drawPanel();
            }, 300);
          };
          el.appendChild(torchTutOv);
          requestAnimationFrame(function() { torchTutOv.style.opacity = '1'; });
        } else {
          phase = 'play';
          panel.style.display = '';
          drawPanel();
        }
      });
    });
  } else if (gs.half === 2 && GS._halftimeCardDone === false) {
    // Halftime card pick: kicking team gets a face-down card
    GS._halftimeCardDone = true;
    var humanKicks2nd = !GS.humanReceives;
    if (humanKicks2nd) {
      // Human kicks off — show face-down card pick, then kickoff
      var offers = rollCoinTossCards();
      var ov = document.createElement('div');
      ov.style.cssText = 'position:fixed;inset:0;z-index:700;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.92);opacity:0;transition:opacity 0.3s;';
      el.appendChild(ov);
      requestAnimationFrame(function() { ov.style.opacity = '1'; });
      showFaceDownCards(ov, offers, true, function() {
        resolveHalftimeKickoff();
      });
    } else {
      // CPU kicks off — AI auto-picks a card, then kickoff
      var offers = rollCoinTossCards();
      var ov = document.createElement('div');
      ov.style.cssText = 'position:fixed;inset:0;z-index:700;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.92);opacity:0;transition:opacity 0.3s;';
      el.appendChild(ov);
      requestAnimationFrame(function() { ov.style.opacity = '1'; });
      showAICardPick(ov, offers, function() {
        resolveHalftimeKickoff();
      });
    }
  } else {
    drawPanel();
  }

  function resolveHalftimeKickoff() {
    // Reset half-scoped state for second half
    _lastPlayFlashed = false;
    prev2min = false;
    var kickResult = _resolveKickoff(GS.humanReceives);
    var startYard = kickResult === -1 ? 25 : kickResult;
    if (GS.humanReceives) {
      gs.possession = 'CT';
      gs.ballPosition = startYard;
    } else {
      gs.possession = 'IR';
      gs.ballPosition = 100 - startYard;
    }
    gs.down = 1; gs.distance = 10;
    var posLabel = startYard === 25 ? 'Touchback \u2014 ball on the 25' : 'Returned to the ' + startYard;
    showKickoffResult(posLabel, function() {
      drawBug(); drawField();
      phase = 'play';
      drawPanel();
    });
  }

  // ── DEV PANEL ──
  injectDevPanel(el, gs, {
    refresh: function() { drawBug(); drawField(); drawPanel(); drawDriveSummary(); },
    redealHand: function() {
      var hs = getHandState();
      handRedeal(hs);
      selP = null; selPl = null; phase = 'play';
      drawBug(); drawField(); drawPanel();
    },
    resetDiscards: function() {
      var hs = getHandState();
      resetDriveDiscards(hs);
      drawPanel();
    },
    showSTInfo: function() {
      var avail = _humanSTDeck.available.length;
      var burned = _humanSTDeck.burned.length;
      var info = 'ST Deck: ' + avail + ' available, ' + burned + ' burned\n';
      _humanSTDeck.burned.forEach(function(b) { info += '  ' + b.player.pos + ' ' + b.player.name + ' — ' + b.context + '\n'; });
      alert(info);
    },
    burnSTPlayers: function() {
      var count = Math.min(10, _humanSTDeck.available.length);
      for (var i = 0; i < count; i++) {
        var p = _humanSTDeck.available[0];
        burnPlayer(_humanSTDeck, p, 'test', 'Dev burn');
      }
      alert('Burned ' + count + '. ' + _humanSTDeck.available.length + ' remaining.');
    },
    setTorchInventory: function(inv) { torchInventory = inv; if (GS.season) GS.season.torchCards = inv.slice(); },
    applyState: function(s) {
      if (s.down) gs.down = s.down;
      if (s.distance) gs.distance = s.distance;
      if (s.ballPosition) gs.ballPosition = s.ballPosition;
      if (s.ctScore !== undefined) gs.ctScore = s.ctScore;
      if (s.irScore !== undefined) gs.irScore = s.irScore;
      drawBug(); drawField(); drawPanel(); drawDriveSummary();
    },
    showPossCut: function(ev) {
      showPossCut(ev, function() { nextSnap(); });
    },
    flipPossession: function() {
      gs.flipPossession(gs.ballPosition);
      drawBug(); drawField(); drawPanel(); drawDriveSummary();
    },
    reset4thDown: function() { _fourthDownDecided = false; },
    showCoinToss: function() {
      showCoinToss(function(result) {
        // 'receive' = human chose to receive. 'card' = human drew card, kicks off (CPU receives).
      // 'card_cpu_receives' = CPU won toss and chose to receive, human got card (CPU receives).
      var humanReceives = result.chose === 'receive';
        var kickResult = _resolveKickoff(humanReceives);
        var startYard = kickResult === -1 ? 25 : kickResult;
        gs.ballPosition = humanReceives ? startYard : 100 - startYard;
        gs.possession = humanReceives ? 'CT' : 'IR';
        gs.down = 1; gs.distance = 10;
        drawBug(); drawField(); drawPanel();
      });
    },
    showKickoff: function() {
      var kickResult = _resolveKickoff(gs.possession !== hAbbr);
      var startYard = kickResult === -1 ? 25 : kickResult;
      var posLabel = startYard === 25 ? 'Touchback \u2014 ball on the 25' : 'Returned to the ' + startYard;
      showKickoffResult(posLabel, function() { drawBug(); drawField(); drawPanel(); });
    },
    openBooster: function() {
      triggerShop('halftime', function() { drawBug(); drawField(); drawPanel(); });
    },
    advanceSeason: function() {
      setGs(function(s) {
        var cur = (s && s.season && s.season.currentGame != null) ? s.season.currentGame : 0;
        return Object.assign({}, s, {
          season: Object.assign({}, (s && s.season) || {}, { currentGame: Math.min(cur + 1, 2) }),
        });
      });
    },
    maxMomentumP1: function() {
      var firstId = gs.ctOffRoster && gs.ctOffRoster[0] ? (gs.ctOffRoster[0].id || gs.ctOffRoster[0]) : null;
      if (firstId) { gs.offMomentumMap = gs.offMomentumMap || {}; gs.offMomentumMap[firstId] = 5; }
      drawBug(); drawField(); drawPanel();
    },
    maxHeatP1: function() {
      var firstId = gs.ctOffRoster && gs.ctOffRoster[0] ? (gs.ctOffRoster[0].id || gs.ctOffRoster[0]) : null;
      if (firstId) { gs.offHeatMap = gs.offHeatMap || {}; gs.offHeatMap[firstId] = 5; }
      drawBug(); drawField(); drawPanel();
    },
    resetAllHeat: function() {
      gs.offHeatMap = {};
      gs.defHeatMap = {};
      drawBug(); drawField(); drawPanel();
    },
  });

  // ── CLEANUP: remove document listeners + kill timers on screen exit ──
  var _cleanup = function() {
    if (_driveHeatFill && _driveHeatFill.parentNode) { _driveHeatFill.parentNode.remove(); _driveHeatFill = null; }
    document.removeEventListener('mousemove', moveDrag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', moveDrag);
    document.removeEventListener('touchend', endDrag);
    if (twoMinTimer) { clearInterval(twoMinTimer); twoMinTimer = null; }
    if (_tickerAnim) { try { _tickerAnim.kill(); } catch(e) {} _tickerAnim = null; }
    // Kill ambient tweens
    try { _shimmerEls.forEach(function(s) { gsap.killTweensOf(s); }); } catch(e) {}
    // Remove any lingering clash overlays from document.body
    document.querySelectorAll('.T-clash-overlay').forEach(function(ov) { ov.remove(); });
    try { gsap.killTweensOf(el.querySelectorAll('*')); } catch(e) {}
  };
  // Expose cleanup so the router can call it directly before swapping screens
  el._cleanup = _cleanup;

  // Attach cleanup to a MutationObserver that fires when el is removed from DOM
  var _cleanupObs = new MutationObserver(function(mutations) {
    for (var m = 0; m < mutations.length; m++) {
      for (var n = 0; n < mutations[m].removedNodes.length; n++) {
        if (mutations[m].removedNodes[n] === el || mutations[m].removedNodes[n].contains(el)) {
          _cleanup();
          _cleanupObs.disconnect();
          return;
        }
      }
    }
  });
  if (el.parentNode) _cleanupObs.observe(el.parentNode, { childList: true });
  else {
    // Fallback: observe document.body once el is added
    var _attachObs = new MutationObserver(function() {
      if (el.parentNode) { _cleanupObs.observe(el.parentNode, { childList: true }); _attachObs.disconnect(); }
    });
    _attachObs.observe(document.body, { childList: true, subtree: true });
  }

  return el;
}
