/**
 * TORCH — Gameplay Screen (Landscape)
 * Top: scorebug. Right panel: player cards + play cards + SNAP. Bottom: narrative.
 * Left: field placeholder (yard line + ball marker).
 */

import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, getOtherTeam, fmtClock } from '../../state.js';
import { TEAMS } from '../../data/teams.js';
import { GameState } from '../../engine/gameState.js';
import { CT_OFF_PLAYS } from '../../data/ctOffensePlays.js';
import { IR_OFF_PLAYS } from '../../data/irOffensePlays.js';
import { CT_DEF_PLAYS } from '../../data/ctDefensePlays.js';
import { IR_DEF_PLAYS } from '../../data/irDefensePlays.js';
import { badgeSvg } from '../../data/badges.js';

// === HELPERS ===

/** Map drafted player IDs to engine-compatible player objects */
function mapRoster(playerIds, teamData, side) {
  var pool = side === 'offense' ? teamData.players : teamData.defPlayers;
  var mapped = [];
  // Add drafted starters first
  playerIds.forEach(function(id) {
    var p = pool.find(function(pl) { return pl.id === id; });
    if (p) {
      mapped.push({
        name: p.name.split(' ').pop(), // Last name for engine
        pos: p.pos, ovr: p.ovr, badge: p.badge,
        fullName: p.name, nick: p.nick, id: p.id,
      });
    }
  });
  // Add remaining as bench
  pool.forEach(function(p) {
    if (playerIds.indexOf(p.id) < 0) {
      mapped.push({
        name: p.name.split(' ').pop(),
        pos: p.pos, ovr: p.ovr, badge: p.badge,
        fullName: p.name, nick: p.nick, id: p.id,
      });
    }
  });
  return mapped;
}

/** Map drafted play card IDs to engine play data */
function mapPlayHand(draftedCards, enginePlays) {
  return draftedCards.map(function(card) {
    // Match by card.id to engine play id
    var eng = enginePlays.find(function(ep) { return ep.id === card.id; });
    if (eng) return eng;
    // Fallback: try matching IR QB sneak
    if (card.id === 'qb_sneak') {
      var irSneak = enginePlays.find(function(ep) { return ep.id === 'ir_qb_sneak'; });
      if (irSneak) return irSneak;
    }
    return enginePlays[0]; // Last resort
  });
}

// === MAIN BUILD ===

export function buildGameplay() {
  var el = document.createElement('div');
  el.className = 'sup';
  el.style.cssText =
    'height:100vh;display:flex;flex-direction:column;background:var(--bg);overflow:hidden;' +
    'user-select:none;-webkit-user-select:none;';

  // Inject gameplay animations
  var styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes snapPulse { 0%,100% { box-shadow:0 0 10px rgba(255,204,0,0.3); } 50% { box-shadow:0 0 30px rgba(255,204,0,0.7); } }' +
    '@keyframes resultFlash { 0% { opacity:0;transform:scale(0.7); } 50% { opacity:1;transform:scale(1.1); } 100% { opacity:1;transform:scale(1); } }' +
    '@keyframes slideDown { from { opacity:0;transform:translateY(-20px); } to { opacity:1;transform:translateY(0); } }' +
    '@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }' +
    '@keyframes cardPop { from { opacity:0;transform:scale(0.9); } to { opacity:1;transform:scale(1); } }' +
    '@keyframes yardFlash { 0%,100% { color:var(--a-gold); } 50% { color:#fff; } }';
  el.appendChild(styleEl);

  // === INITIALIZE GAME STATE ===
  var team = getTeam(GS.team);
  var opp = getOtherTeam(GS.team);
  var isHumanCT = GS.team === 'canyon_tech';
  var humanAbbr = isHumanCT ? 'CT' : 'IR';
  var cpuAbbr = isHumanCT ? 'IR' : 'CT';

  // Map rosters
  var humanOffRoster = mapRoster(GS.offRoster, team, 'offense');
  var humanDefRoster = mapRoster(GS.defRoster, team, 'defense');
  var cpuOffRoster = mapRoster(opp.players.map(function(p) { return p.id; }).slice(0, 4), opp, 'offense');
  var cpuDefRoster = mapRoster(opp.defPlayers.map(function(p) { return p.id; }).slice(0, 4), opp, 'defense');

  // Map play hands
  var humanOffEngPlays = isHumanCT ? CT_OFF_PLAYS : IR_OFF_PLAYS;
  var humanDefEngPlays = isHumanCT ? CT_DEF_PLAYS : IR_DEF_PLAYS;
  var cpuOffEngPlays = isHumanCT ? IR_OFF_PLAYS : CT_OFF_PLAYS;
  var cpuDefEngPlays = isHumanCT ? CT_DEF_PLAYS : IR_DEF_PLAYS;

  var humanOffHand = mapPlayHand(GS.offHand, humanOffEngPlays);
  var humanDefHand = mapPlayHand(GS.defHand, humanDefEngPlays);
  var cpuOffHand = cpuOffEngPlays.slice(0, 5);
  var cpuDefHand = cpuDefEngPlays.slice(0, 5);

  // Create GameState
  var gs = new GameState({
    humanTeam: humanAbbr,
    difficulty: 'MEDIUM',
    ctOffHand: isHumanCT ? humanOffHand : cpuOffHand,
    ctDefHand: isHumanCT ? humanDefHand : cpuDefHand,
    irOffHand: isHumanCT ? cpuOffHand : humanOffHand,
    irDefHand: isHumanCT ? cpuDefHand : humanDefHand,
    ctOffRoster: isHumanCT ? humanOffRoster : cpuOffRoster,
    ctDefRoster: isHumanCT ? humanDefRoster : cpuDefRoster,
    irOffRoster: isHumanCT ? cpuOffRoster : humanOffRoster,
    irDefRoster: isHumanCT ? cpuDefRoster : humanDefRoster,
  });

  // If human receives, flip so human has ball first
  if (GS.humanReceives) {
    gs.possession = humanAbbr;
    gs.ballPosition = 50;
  }

  // UI state
  var selectedPlayer = null;
  var selectedPlay = null;
  var waitingForTap = false;
  var lastResult = null;

  // === SCOREBUG (top) ===
  var scorebug = document.createElement('div');
  scorebug.style.cssText =
    'background:rgba(0,0,0,0.85);padding:8px 12px;display:flex;justify-content:space-between;' +
    'align-items:center;flex-shrink:0;border-bottom:2px solid var(--bdr);z-index:10;';

  function renderScorebug() {
    scorebug.innerHTML = '';
    var sum = gs.getSummary();
    var ctTeam = getTeam('canyon_tech');
    var irTeam = getTeam('iron_ridge');

    // CT score
    var ctBlock = document.createElement('div');
    ctBlock.style.cssText = 'display:flex;align-items:center;gap:6px;';
    var ctName = document.createElement('div');
    ctName.style.cssText = "font-family:'Bebas Neue',sans-serif;font-size:18px;color:" + ctTeam.accent + ";letter-spacing:1px;";
    ctName.textContent = 'CT';
    var ctScore = document.createElement('div');
    ctScore.style.cssText = "font-family:'Press Start 2P',monospace;font-size:16px;color:#fff;";
    ctScore.textContent = sum.ctScore;
    ctBlock.append(ctName, ctScore);

    // Center info
    var center = document.createElement('div');
    center.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:2px;';
    var downDist = document.createElement('div');
    downDist.style.cssText = "font-family:'Press Start 2P',monospace;font-size:8px;color:var(--a-gold);letter-spacing:1px;";
    var downStr = sum.down === 1 ? '1ST' : sum.down === 2 ? '2ND' : sum.down === 3 ? '3RD' : '4TH';
    downDist.textContent = downStr + ' & ' + sum.distance;

    var halfClock = document.createElement('div');
    halfClock.style.cssText = "font-family:'Courier New',monospace;font-size:7px;color:var(--muted);letter-spacing:0.5px;";
    if (sum.twoMinActive) {
      halfClock.textContent = (sum.half === 1 ? 'H1' : 'H2') + ' 2MIN ' + fmtClock(sum.clockSeconds);
    } else {
      halfClock.textContent = (sum.half === 1 ? 'H1' : 'H2') + ' PLAY ' + sum.playsUsed + '/' + 20;
    }

    var possession = document.createElement('div');
    possession.style.cssText = "font-family:'Courier New',monospace;font-size:7px;color:" +
      (sum.possession === humanAbbr ? '#00ff88' : '#ff4444') + ";letter-spacing:0.5px;";
    possession.textContent = (sum.possession === humanAbbr ? 'YOUR' : 'OPP') + ' BALL @ ' + sum.ballPosition;

    center.append(downDist, halfClock, possession);

    // IR score
    var irBlock = document.createElement('div');
    irBlock.style.cssText = 'display:flex;align-items:center;gap:6px;';
    var irName = document.createElement('div');
    irName.style.cssText = "font-family:'Bebas Neue',sans-serif;font-size:18px;color:" + irTeam.accent + ";letter-spacing:1px;";
    irName.textContent = 'IR';
    var irScore = document.createElement('div');
    irScore.style.cssText = "font-family:'Press Start 2P',monospace;font-size:16px;color:#fff;";
    irScore.textContent = sum.irScore;
    irBlock.append(irScore, irName);

    scorebug.append(ctBlock, center, irBlock);
  }

  el.appendChild(scorebug);

  // === MAIN AREA (field + hand) ===
  var mainArea = document.createElement('div');
  mainArea.style.cssText = 'flex:1;display:flex;overflow:hidden;position:relative;';

  // === LEFT: Field (placeholder) ===
  var fieldArea = document.createElement('div');
  fieldArea.style.cssText =
    'flex:0 0 45%;background:#0a3d0a;position:relative;overflow:hidden;' +
    'display:flex;align-items:center;justify-content:center;';

  function renderField() {
    fieldArea.innerHTML = '';
    var sum = gs.getSummary();

    // Yard lines
    for (var yd = 10; yd <= 90; yd += 10) {
      var line = document.createElement('div');
      line.style.cssText =
        'position:absolute;top:0;bottom:0;width:1px;' +
        'background:rgba(255,255,255,0.12);left:' + yd + '%;';
      fieldArea.appendChild(line);

      if (yd % 10 === 0 && yd !== 50) {
        var label = document.createElement('div');
        label.style.cssText =
          "position:absolute;top:4px;font-family:'Courier New',monospace;" +
          "font-size:8px;color:rgba(255,255,255,0.2);left:" + yd + "%;transform:translateX(-50%);";
        label.textContent = yd <= 50 ? yd : 100 - yd;
        fieldArea.appendChild(label);
      }
    }

    // 50 yard line
    var midline = document.createElement('div');
    midline.style.cssText =
      'position:absolute;top:0;bottom:0;width:2px;background:rgba(255,255,255,0.25);left:50%;';
    fieldArea.appendChild(midline);

    // End zones
    var leftEZ = document.createElement('div');
    leftEZ.style.cssText =
      'position:absolute;top:0;bottom:0;left:0;width:5%;' +
      'background:rgba(255,0,0,0.15);border-right:2px solid rgba(255,0,0,0.3);';
    var rightEZ = document.createElement('div');
    rightEZ.style.cssText =
      'position:absolute;top:0;bottom:0;right:0;width:5%;' +
      'background:rgba(0,100,255,0.15);border-left:2px solid rgba(0,100,255,0.3);';
    fieldArea.append(leftEZ, rightEZ);

    // Line of scrimmage
    var losLeft = 5 + sum.ballPosition * 0.9; // 5-95% range
    var los = document.createElement('div');
    los.style.cssText =
      'position:absolute;top:0;bottom:0;width:2px;background:#ffcc00;' +
      'left:' + losLeft + '%;box-shadow:0 0 8px rgba(255,204,0,0.5);';
    fieldArea.appendChild(los);

    // First down marker
    var fdYards = sum.possession === 'CT' ?
      Math.min(sum.ballPosition + sum.distance, 100) :
      Math.max(sum.ballPosition - sum.distance, 0);
    var fdLeft = 5 + fdYards * 0.9;
    var fdLine = document.createElement('div');
    fdLine.style.cssText =
      'position:absolute;top:0;bottom:0;width:2px;background:#ff4444;' +
      'left:' + fdLeft + '%;opacity:0.6;';
    fieldArea.appendChild(fdLine);

    // Ball marker
    var ball = document.createElement('div');
    ball.style.cssText =
      'position:absolute;top:50%;left:' + losLeft + '%;transform:translate(-50%,-50%);' +
      'font-size:20px;filter:drop-shadow(0 0 8px var(--a-gold));z-index:2;';
    ball.textContent = '\uD83C\uDFC8';
    fieldArea.appendChild(ball);

    // Yard line label
    var yardLabel = document.createElement('div');
    yardLabel.style.cssText =
      "position:absolute;bottom:8px;left:50%;transform:translateX(-50%);" +
      "font-family:'Press Start 2P',monospace;font-size:8px;color:rgba(255,255,255,0.4);";
    yardLabel.textContent = sum.yardsToEndzone + ' YDS TO GO';
    fieldArea.appendChild(yardLabel);
  }

  mainArea.appendChild(fieldArea);

  // === RIGHT: Hand Panel ===
  var handPanel = document.createElement('div');
  handPanel.style.cssText =
    'flex:1;display:flex;flex-direction:column;overflow-y:auto;' +
    'background:var(--bg);padding:8px;gap:6px;';

  // Player cards area
  var playerArea = document.createElement('div');
  playerArea.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:4px;';

  // Play cards area
  var playArea = document.createElement('div');
  playArea.style.cssText = 'display:flex;flex-direction:column;gap:3px;';

  // Combo preview + SNAP
  var comboArea = document.createElement('div');
  comboArea.style.cssText =
    'margin-top:auto;padding-top:6px;border-top:1px solid var(--bdr);';

  // Narrative bar
  var narrativeBar = document.createElement('div');
  narrativeBar.style.cssText =
    'background:rgba(0,0,0,0.9);padding:8px 12px;flex-shrink:0;' +
    'border-top:1px solid var(--bdr);min-height:44px;';

  function getPlayTypeColor(pt) {
    var colors = {
      SHORT: '#00ff44', QUICK: '#00eaff', DEEP: '#ff0040', RUN: '#ff4d00',
      SCREEN: '#ff66aa', OPTION: '#ff4d00',
    };
    return colors[pt] || '#aaa';
  }

  function renderHand() {
    playerArea.innerHTML = '';
    playArea.innerHTML = '';
    comboArea.innerHTML = '';

    var sum = gs.getSummary();
    var isOnOffense = sum.possession === humanAbbr;
    var players, plays;

    if (isOnOffense) {
      players = gs[humanAbbr === 'CT' ? 'ctOffRoster' : 'irOffRoster'].slice(0, 4);
      plays = gs[humanAbbr === 'CT' ? 'ctOffHand' : 'irOffHand'];
    } else {
      players = gs[humanAbbr === 'CT' ? 'ctDefRoster' : 'irDefRoster'].slice(0, 4);
      plays = gs[humanAbbr === 'CT' ? 'ctDefHand' : 'irDefHand'];
    }

    // Section label — remove existing one first
    var oldLabel = handPanel.querySelector('.side-label');
    if (oldLabel) oldLabel.remove();
    var sideLabel = document.createElement('div');
    sideLabel.className = 'side-label';
    sideLabel.style.cssText =
      "font-family:'Press Start 2P',monospace;font-size:7px;letter-spacing:1px;" +
      "color:" + (isOnOffense ? '#00ff88' : '#ff4444') + ";margin-bottom:4px;text-align:center;";
    sideLabel.textContent = isOnOffense ? 'YOUR OFFENSE' : 'YOUR DEFENSE';
    handPanel.insertBefore(sideLabel, playerArea);

    // Player cards (2x2)
    players.forEach(function(p) {
      var isSel = selectedPlayer === p;
      var card = document.createElement('div');
      card.style.cssText =
        'background:var(--bg-surface);border:2px solid ' + (isSel ? '#00ff88' : 'var(--bdr)') + ';' +
        'border-radius:4px;padding:6px;cursor:pointer;position:relative;' +
        'transition:all 0.1s;' +
        (p.injured ? 'opacity:0.35;pointer-events:none;' : '') +
        (isSel ? 'box-shadow:0 0 12px rgba(0,255,136,0.3);' : '');

      var nameRow = document.createElement('div');
      nameRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;';

      var nameEl = document.createElement('div');
      nameEl.style.cssText = "font-family:'Bebas Neue',sans-serif;font-size:13px;color:#fff;line-height:1;";
      nameEl.textContent = p.name;

      var ovrEl = document.createElement('div');
      ovrEl.style.cssText = "font-family:'Courier New',monospace;font-size:11px;font-weight:bold;color:#00eaff;";
      ovrEl.textContent = p.ovr;

      nameRow.append(nameEl, ovrEl);
      card.appendChild(nameRow);

      var bottomRow = document.createElement('div');
      bottomRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-top:2px;';

      var posEl = document.createElement('div');
      posEl.style.cssText = "font-family:'Courier New',monospace;font-size:8px;font-weight:bold;color:#ff0040;letter-spacing:1px;";
      posEl.textContent = p.pos;

      var badgeEl = document.createElement('div');
      badgeEl.style.cssText = 'width:12px;height:12px;';
      badgeEl.innerHTML = badgeSvg(p.badge, team.accent);

      bottomRow.append(posEl, badgeEl);
      card.appendChild(bottomRow);

      if (p.injured) {
        var injLabel = document.createElement('div');
        injLabel.style.cssText = "position:absolute;top:2px;right:2px;font-family:'Courier New',monospace;font-size:6px;color:#ff0040;";
        injLabel.textContent = 'INJ';
        card.appendChild(injLabel);
      }

      card.onclick = function() {
        if (waitingForTap || p.injured) return;
        SND.click();
        selectedPlayer = selectedPlayer === p ? null : p;
        renderHand();
      };

      playerArea.appendChild(card);
    });

    // Play cards
    plays.forEach(function(play) {
      var isSel = selectedPlay === play;
      var card = document.createElement('div');
      var ptColor = getPlayTypeColor(play.playType || play.cardType || 'RUN');
      card.style.cssText =
        'background:var(--bg-surface);border:2px solid ' + (isSel ? '#00ff88' : 'var(--bdr)') + ';' +
        'border-radius:4px;padding:5px 8px;cursor:pointer;' +
        'display:flex;align-items:center;gap:6px;transition:all 0.1s;' +
        (isSel ? 'box-shadow:0 0 10px rgba(0,255,136,0.3);' : '');

      var ptBadge = document.createElement('div');
      ptBadge.style.cssText =
        "font-family:'Courier New',monospace;font-size:6px;font-weight:bold;" +
        "color:" + ptColor + ";border:1px solid " + ptColor + "44;" +
        "padding:1px 4px;border-radius:6px;letter-spacing:0.5px;flex-shrink:0;";
      ptBadge.textContent = play.playType || play.cardType || '';

      var nameEl = document.createElement('div');
      nameEl.style.cssText = "font-family:'Bebas Neue',sans-serif;font-size:13px;color:#fff;line-height:1;flex:1;";
      nameEl.textContent = play.name;

      card.append(ptBadge, nameEl);

      card.onclick = function() {
        if (waitingForTap) return;
        SND.click();
        selectedPlay = selectedPlay === play ? null : play;
        renderHand();
      };

      playArea.appendChild(card);
    });

    // Combo preview + SNAP button
    var snapReady = selectedPlayer && selectedPlay;

    if (snapReady) {
      var preview = document.createElement('div');
      preview.style.cssText =
        'display:flex;align-items:center;gap:6px;margin-bottom:6px;' +
        'animation:cardPop 0.2s ease-out;';

      var prevPlayer = document.createElement('div');
      prevPlayer.style.cssText =
        "font-family:'Courier New',monospace;font-size:9px;color:#00eaff;";
      prevPlayer.textContent = selectedPlayer.name + ' (' + selectedPlayer.badge + ')';

      var prevPlus = document.createElement('div');
      prevPlus.style.cssText = "font-family:'Bebas Neue',sans-serif;font-size:14px;color:var(--muted);";
      prevPlus.textContent = '+';

      var prevPlay = document.createElement('div');
      prevPlay.style.cssText =
        "font-family:'Courier New',monospace;font-size:9px;color:" +
        getPlayTypeColor(selectedPlay.playType || selectedPlay.cardType) + ";";
      prevPlay.textContent = selectedPlay.name;

      preview.append(prevPlayer, prevPlus, prevPlay);
      comboArea.appendChild(preview);
    }

    // SNAP / SPIKE / KNEEL buttons
    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:4px;';

    var snapBtn = document.createElement('button');
    snapBtn.className = 'btn-blitz';
    snapBtn.style.cssText =
      'flex:1;font-size:12px;padding:10px;' +
      (snapReady
        ? 'background:var(--a-gold);border-color:var(--a-gold);color:#000;animation:snapPulse 1.5s infinite;'
        : 'opacity:0.3;');
    snapBtn.disabled = !snapReady;
    snapBtn.textContent = 'SNAP';
    snapBtn.onclick = snapReady ? function() { executeHumanSnap(); } : null;
    btnRow.appendChild(snapBtn);

    // 2-minute drill: spike + kneel
    if (gs.twoMinActive && gs.possession === humanAbbr) {
      var spikeBtn = document.createElement('button');
      spikeBtn.className = 'btn-blitz';
      spikeBtn.style.cssText = 'font-size:9px;padding:10px 8px;background:#333;border-color:#555;color:#fff;';
      spikeBtn.textContent = 'SPIKE';
      spikeBtn.onclick = function() { executeSpike(); };
      btnRow.appendChild(spikeBtn);

      var humanScore = humanAbbr === 'CT' ? gs.ctScore : gs.irScore;
      var cpuScore = humanAbbr === 'CT' ? gs.irScore : gs.ctScore;
      if (humanScore > cpuScore) {
        var kneelBtn = document.createElement('button');
        kneelBtn.className = 'btn-blitz';
        kneelBtn.style.cssText = 'font-size:9px;padding:10px 8px;background:#333;border-color:#555;color:#fff;';
        kneelBtn.textContent = 'KNEEL';
        kneelBtn.onclick = function() { executeKneel(); };
        btnRow.appendChild(kneelBtn);
      }
    }

    comboArea.appendChild(btnRow);

    // TORCH points display
    var torchRow = document.createElement('div');
    torchRow.style.cssText =
      'display:flex;justify-content:space-between;margin-top:4px;' +
      "font-family:'Courier New',monospace;font-size:7px;color:var(--muted);";
    var humanPts = humanAbbr === 'CT' ? gs.ctTorchPts : gs.irTorchPts;
    var cpuPts = humanAbbr === 'CT' ? gs.irTorchPts : gs.ctTorchPts;
    torchRow.innerHTML =
      '<span style="color:var(--a-gold);">TORCH ' + humanPts + '</span>' +
      '<span>OPP TORCH ' + cpuPts + '</span>';
    comboArea.appendChild(torchRow);
  }

  function renderNarrative(text, subtext) {
    narrativeBar.innerHTML = '';
    if (text) {
      var line1 = document.createElement('div');
      line1.style.cssText =
        "font-family:'Barlow Condensed',sans-serif;font-size:14px;color:#fff;line-height:1.3;";
      line1.textContent = text;
      narrativeBar.appendChild(line1);
    }
    if (subtext) {
      var line2 = document.createElement('div');
      line2.style.cssText =
        "font-family:'Courier New',monospace;font-size:8px;color:var(--muted);margin-top:2px;";
      line2.textContent = subtext;
      narrativeBar.appendChild(line2);
    }
  }

  // === GAME ACTIONS ===

  function executeHumanSnap() {
    if (!selectedPlayer || !selectedPlay) return;
    waitingForTap = true;

    var isOnOffense = gs.possession === humanAbbr;
    var snapResult;

    if (isOnOffense) {
      // Human on offense: pass offPlay + featuredOff, AI picks defense
      snapResult = gs.executeSnap(selectedPlay, selectedPlayer, null, null);
    } else {
      // Human on defense: pass defPlay + featuredDef, AI picks offense
      snapResult = gs.executeSnap(null, null, selectedPlay, selectedPlayer);
    }

    lastResult = snapResult;
    selectedPlayer = null;
    selectedPlay = null;

    // Show result
    showResult(snapResult);
  }

  function executeCPUSnap() {
    waitingForTap = true;
    var snapResult = gs.executeSnap(); // AI picks everything
    lastResult = snapResult;
    showResult(snapResult);
  }

  function executeSpike() {
    waitingForTap = true;
    gs.clockSeconds -= 3;
    renderScorebug();
    renderField();
    renderNarrative('Spike! Clock stops.', 'Clock: ' + fmtClock(gs.clockSeconds));
    showTapToContinue(function() {
      waitingForTap = false;
      afterSnap(null);
    });
  }

  function executeKneel() {
    waitingForTap = true;
    gs.clockSeconds -= 30;
    renderScorebug();
    renderField();
    renderNarrative('Kneel. Clock runs.', 'Clock: ' + fmtClock(Math.max(0, gs.clockSeconds)));
    showTapToContinue(function() {
      waitingForTap = false;
      afterSnap(null);
    });
  }

  function showResult(snapResult) {
    var r = snapResult.result;

    // Flash result text on field
    var resultOverlay = document.createElement('div');
    resultOverlay.style.cssText =
      'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
      'z-index:20;pointer-events:none;';

    var resultText = document.createElement('div');
    resultText.style.cssText =
      "font-family:'Bebas Neue',sans-serif;font-size:28px;text-align:center;" +
      "padding:12px 20px;border-radius:8px;animation:resultFlash 0.5s ease-out;max-width:90%;";

    if (r.isTouchdown) {
      resultText.style.color = '#00ff44';
      resultText.style.textShadow = '0 0 20px rgba(0,255,68,0.6)';
      resultText.textContent = 'TOUCHDOWN!';
    } else if (r.isInterception) {
      resultText.style.color = '#ff0040';
      resultText.style.textShadow = '0 0 20px rgba(255,0,64,0.6)';
      resultText.textContent = 'INTERCEPTED!';
    } else if (r.isFumbleLost) {
      resultText.style.color = '#ff0040';
      resultText.style.textShadow = '0 0 20px rgba(255,0,64,0.6)';
      resultText.textContent = 'FUMBLE LOST!';
    } else if (r.isSack) {
      resultText.style.color = '#ff4d00';
      resultText.style.textShadow = '0 0 20px rgba(255,77,0,0.6)';
      resultText.textContent = 'SACK! ' + r.yards + ' YDS';
    } else if (r.isSafety) {
      resultText.style.color = '#ff0040';
      resultText.style.textShadow = '0 0 20px rgba(255,0,64,0.6)';
      resultText.textContent = 'SAFETY!';
    } else if (r.isIncomplete) {
      resultText.style.color = '#aaa';
      resultText.textContent = 'INCOMPLETE';
    } else if (r.yards >= 15) {
      resultText.style.color = 'var(--a-gold)';
      resultText.style.textShadow = '0 0 20px rgba(255,204,0,0.6)';
      resultText.textContent = 'EXPLOSIVE! +' + r.yards;
    } else if (r.yards >= 8) {
      resultText.style.color = '#00eaff';
      resultText.textContent = 'BIG GAIN +' + r.yards;
    } else if (r.yards > 0) {
      resultText.style.color = '#fff';
      resultText.textContent = '+' + r.yards + ' YARDS';
    } else {
      resultText.style.color = '#ff4d00';
      resultText.textContent = r.yards + ' YARDS';
    }

    resultOverlay.appendChild(resultText);
    fieldArea.appendChild(resultOverlay);

    // Narrative
    var comboText = '';
    if (r.offComboPts > 0) comboText += 'OFF COMBO +' + r.offComboYards + 'y ';
    if (r.defComboPts > 0) comboText += 'DEF COMBO ' + r.defComboYards + 'y ';
    if (r.historyBonus > 0) comboText += 'HISTORY +' + r.historyBonus;
    else if (r.historyBonus < 0) comboText += 'REPEAT ' + r.historyBonus;

    renderNarrative(
      r.description,
      (snapResult.offPlay.name + ' + ' + snapResult.featuredOff.name +
       ' vs ' + snapResult.defPlay.name + ' + ' + snapResult.featuredDef.name +
       (comboText ? '  |  ' + comboText : ''))
    );

    renderScorebug();
    renderField();

    // Fade out hand panel during result
    handPanel.style.opacity = '0.15';
    handPanel.style.pointerEvents = 'none';

    showTapToContinue(function() {
      resultOverlay.remove();
      handPanel.style.opacity = '1';
      handPanel.style.pointerEvents = 'auto';
      waitingForTap = false;
      afterSnap(snapResult);
    });
  }

  function showTapToContinue(callback) {
    var tapHint = document.createElement('div');
    tapHint.style.cssText =
      "position:absolute;bottom:12px;left:50%;transform:translateX(-50%);" +
      "font-family:'Press Start 2P',monospace;font-size:7px;color:var(--muted);" +
      "letter-spacing:1px;z-index:25;animation:fadeIn 0.5s 0.8s both;cursor:pointer;";
    tapHint.textContent = 'TAP TO CONTINUE';
    fieldArea.appendChild(tapHint);

    var handler = function() {
      tapHint.remove();
      fieldArea.removeEventListener('click', handler);
      el.removeEventListener('click', elHandler);
      callback();
    };
    var elHandler = function(e) {
      if (e.target === tapHint || fieldArea.contains(e.target)) return;
      tapHint.remove();
      fieldArea.removeEventListener('click', handler);
      el.removeEventListener('click', elHandler);
      callback();
    };
    // Delay to prevent immediate tap
    setTimeout(function() {
      fieldArea.addEventListener('click', handler);
      el.addEventListener('click', elHandler);
    }, 500);
  }

  function afterSnap(snapResult) {
    // Check for game events
    if (snapResult && snapResult.gameEvent === 'touchdown') {
      showConversionChoice(snapResult.scoringTeam);
      return;
    }

    if (gs.gameOver) {
      showEndGame();
      return;
    }

    // Check half transition
    var sum = gs.getSummary();

    // Possession change announcement
    if (snapResult && (snapResult.gameEvent === 'interception' ||
        snapResult.gameEvent === 'fumble_lost' ||
        snapResult.gameEvent === 'turnover_on_downs' ||
        snapResult.gameEvent === 'safety' ||
        snapResult.gameEvent === 'turnover_td')) {
      showPossessionChange();
      return;
    }

    // Continue game
    continueGame();
  }

  function showPossessionChange() {
    var isHumanBall = gs.possession === humanAbbr;
    var transText = isHumanBall ? 'YOUR BALL' : "OPPONENT'S BALL";
    var transColor = isHumanBall ? '#00ff88' : '#ff4444';

    renderNarrative(transText, 'Ball at the ' + gs.ballPosition);

    var overlay = document.createElement('div');
    overlay.style.cssText =
      'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:20;';
    var txt = document.createElement('div');
    txt.style.cssText =
      "font-family:'Bebas Neue',sans-serif;font-size:32px;color:" + transColor + ";" +
      "letter-spacing:3px;animation:resultFlash 0.5s ease-out;" +
      "text-shadow:0 0 20px " + transColor + ";";
    txt.textContent = transText;
    overlay.appendChild(txt);
    fieldArea.appendChild(overlay);

    showTapToContinue(function() {
      overlay.remove();
      continueGame();
    });
  }

  function showConversionChoice(scoringTeam) {
    var isHumanScoring = scoringTeam === humanAbbr;

    if (!isHumanScoring) {
      // CPU auto-picks XP
      gs.handleConversion('xp');
      renderScorebug();
      renderNarrative('Extra point is GOOD.', scoringTeam + ' adds the free point.');
      showTapToContinue(function() {
        if (gs.gameOver) { showEndGame(); return; }
        showPossessionChange();
      });
      return;
    }

    // Human chooses
    waitingForTap = false;
    handPanel.style.opacity = '1';
    handPanel.style.pointerEvents = 'auto';

    comboArea.innerHTML = '';
    playerArea.innerHTML = '';
    playArea.innerHTML = '';

    var choiceLabel = document.createElement('div');
    choiceLabel.style.cssText =
      "font-family:'Press Start 2P',monospace;font-size:8px;color:var(--a-gold);" +
      "letter-spacing:1px;text-align:center;margin-bottom:8px;";
    choiceLabel.textContent = 'CONVERSION';
    comboArea.appendChild(choiceLabel);

    var choices = [
      { id: 'xp', label: 'EXTRA POINT', sub: 'FREE 1 PT', color: '#00ff88' },
      { id: '2pt', label: '2-POINT', sub: 'FROM THE 5', color: '#00eaff' },
      { id: '3pt', label: '3-POINT', sub: 'FROM THE 10', color: 'var(--a-gold)' },
    ];

    choices.forEach(function(ch) {
      var btn = document.createElement('button');
      btn.className = 'btn-blitz';
      btn.style.cssText =
        'width:100%;font-size:11px;margin-bottom:4px;padding:10px;' +
        'background:transparent;border-color:' + ch.color + ';color:' + ch.color + ';';
      btn.innerHTML = ch.label + ' <span style="font-size:8px;opacity:0.6;">' + ch.sub + '</span>';
      btn.onclick = function() {
        SND.snap();
        var convResult = gs.handleConversion(ch.id);
        renderScorebug();
        if (ch.id === 'xp') {
          renderNarrative('Extra point is GOOD.', '+1 point');
        } else {
          var pts = ch.id === '2pt' ? 2 : 3;
          if (convResult.success) {
            renderNarrative(pts + '-POINT CONVERSION GOOD!', '+' + pts + ' points');
          } else {
            renderNarrative(pts + '-point conversion FAILED.', 'No good.');
          }
        }
        waitingForTap = true;
        showTapToContinue(function() {
          waitingForTap = false;
          if (gs.gameOver) { showEndGame(); return; }
          showPossessionChange();
        });
      };
      comboArea.appendChild(btn);
    });

    renderScorebug();
  }

  function showEndGame() {
    setGs(function(s) {
      return Object.assign({}, s, {
        screen: 'end_game',
        finalState: gs,
        humanAbbr: humanAbbr,
      });
    });
  }

  function continueGame() {
    if (gs.gameOver) {
      showEndGame();
      return;
    }

    renderScorebug();
    renderField();

    var isHumanBall = gs.possession === humanAbbr;
    if (isHumanBall) {
      // Human's turn on offense — show hand
      renderHand();
      renderNarrative(
        gs.down + (gs.down === 1 ? 'st' : gs.down === 2 ? 'nd' : gs.down === 3 ? 'rd' : 'th') +
        ' & ' + gs.distance + ' at the ' + gs.ballPosition,
        'Select a player and a play, then SNAP.'
      );
    } else {
      // CPU's turn on offense, human on defense — show defense hand
      renderHand();
      renderNarrative(
        'Opponent ball. ' + gs.down + (gs.down === 1 ? 'st' : gs.down === 2 ? 'nd' : gs.down === 3 ? 'rd' : 'th') +
        ' & ' + gs.distance,
        'Select a defender and a defensive call, then SNAP.'
      );
    }
  }

  // === ASSEMBLE ===
  handPanel.append(playerArea, playArea, comboArea);
  mainArea.append(fieldArea, handPanel);
  el.append(mainArea, narrativeBar);

  // Initial render
  renderScorebug();
  renderField();
  continueGame();

  return el;
}
