/**
 * TORCH — End Game Screen (Replay Loop Design)
 * Three zones: Result (top) → MVP + Points + Open Loop (middle) → PLAY AGAIN (bottom).
 * Every element drives a replay or gets out of the way.
 */

import { gsap } from 'gsap';
import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam } from '../../state.js';
import { TORCH_CARDS } from '../../data/torchCards.js';
import { getFullRoster } from '../../data/players.js';
import { renderTeamBadge } from '../../data/teamLogos.js';
import { buildMaddenPlayer } from '../components/cards.js';
import AudioStateManager from '../../engine/audioManager.js';

// ── MVP CALCULATION ──
function calculateMVP(snapLog, teamId) {
  var scores = {};
  if (!snapLog) return null;

  snapLog.forEach(function(snap) {
    if (!snap) return;
    // Score offensive featured players on CT snaps
    if (snap.team === 'CT' && snap.featuredOffId) {
      var id = snap.featuredOffId;
      if (!scores[id]) scores[id] = 0;
      if (snap.event === 'touchdown') scores[id] += 25;
      if (snap.yards >= 15) scores[id] += 10;
      if (snap.gotFirstDown) scores[id] += 5;
      if (snap.yards >= 5) scores[id] += 2;
    }
    // Score defensive featured players on IR snaps (user on defense)
    if (snap.team === 'IR' && snap.featuredDefId) {
      var did = snap.featuredDefId;
      if (!scores[did]) scores[did] = 0;
      if (snap.event === 'interception') scores[did] += 15;
      if (snap.event === 'fumble_lost') scores[did] += 12;
      if (snap.yards <= 0) scores[did] += 5;
      if (snap.yards <= -3) scores[did] += 5;
    }
  });

  var entries = Object.entries(scores).sort(function(a, b) { return b[1] - a[1]; });
  if (!entries.length || entries[0][1] < 10) return null;

  var mvpId = entries[0][0];
  var roster = getFullRoster(teamId);
  return roster.find(function(p) { return p.id === mvpId; }) || null;
}

function getMVPStatLine(mvpId, snapLog) {
  var tds = 0, yards = 0, ints = 0, sacks = 0, bigPlays = 0;
  if (!snapLog) return '';

  snapLog.forEach(function(snap) {
    if (!snap) return;
    if (snap.featuredOffId === mvpId || snap.featuredDefId === mvpId) {
      if (snap.event === 'touchdown') tds++;
      yards += snap.yards || 0;
      if (snap.event === 'interception' && snap.featuredDefId === mvpId) ints++;
      if (snap.yards <= -3 && snap.featuredDefId === mvpId) sacks++;
      if (snap.yards >= 15) bigPlays++;
    }
  });

  var parts = [];
  if (tds > 0) parts.push(tds + ' TD' + (tds > 1 ? 's' : ''));
  if (Math.abs(yards) > 30) parts.push(Math.abs(yards) + ' yards');
  if (ints > 0) parts.push(ints + ' INT' + (ints > 1 ? 's' : ''));
  if (sacks > 0) parts.push(sacks + ' sack' + (sacks > 1 ? 's' : ''));
  if (bigPlays > 1 && parts.length < 2) parts.push(bigPlays + ' big plays');
  return parts.slice(0, 2).join(' \u00b7 ');
}

// ── OPEN LOOP ──
function getOpenLoop(torchPoints) {
  // Can afford right now?
  var buyable = TORCH_CARDS.filter(function(c) { return c.cost <= torchPoints; }).sort(function(a, b) { return b.cost - a.cost; });
  if (buyable.length > 0) {
    return { icon: '\uD83D\uDD25', text: 'You can afford ' + buyable[0].name + '!', canBuy: true };
  }
  // Nearest card can't yet afford
  var nearest = TORCH_CARDS.filter(function(c) { return c.cost > torchPoints; }).sort(function(a, b) { return (a.cost - torchPoints) - (b.cost - torchPoints); });
  if (nearest.length > 0) {
    var gap = nearest[0].cost - torchPoints;
    return { icon: '\uD83D\uDD13', text: gap + ' more \u2192 ' + nearest[0].name, canBuy: false };
  }
  return null;
}

// ── PER-TEAM RECORDS ──
function updateTeamRecord(teamId, won, tied) {
  var records = JSON.parse(localStorage.getItem('torch_team_records') || '{}');
  if (!records[teamId]) records[teamId] = { wins: 0, losses: 0, ties: 0 };
  if (tied) records[teamId].ties++;
  else if (won) records[teamId].wins++;
  else records[teamId].losses++;
  localStorage.setItem('torch_team_records', JSON.stringify(records));
}

export function getTeamRecord(teamId) {
  var records = JSON.parse(localStorage.getItem('torch_team_records') || '{}');
  return records[teamId] || { wins: 0, losses: 0, ties: 0 };
}

// ── FILM ROOM MODAL ──
function showFilmRoom(parent, gs) {
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;flex-direction:column;justify-content:flex-end;pointer-events:auto;';
  var bd = document.createElement('div');
  bd.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.5);';
  bd.onclick = function() { gsap.to(ov, { opacity: 0, duration: 0.2, onComplete: function() { ov.remove(); } }); };
  ov.appendChild(bd);

  var sheet = document.createElement('div');
  sheet.style.cssText = "position:relative;z-index:1;background:#141008;border-top:2px solid #FF6B00;border-radius:12px 12px 0 0;padding:14px 12px 24px;max-height:60vh;overflow-y:auto;";
  sheet.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:18px;color:#FF6B00;letter-spacing:2px;margin-bottom:8px;\">FILM ROOM</div>";

  var moments = [];
  if (gs.snapLog) {
    gs.snapLog.forEach(function(log, i) {
      if (!log || log.team !== 'CT') return;
      var text = log.result || '';
      var isGood = text.indexOf('TD') >= 0 || text.indexOf('TOUCHDOWN') >= 0 || (parseInt((text.match(/\+(\d+)/) || [])[1]) >= 10);
      var isBad = text.indexOf('SACK') >= 0 || text.indexOf('INT') >= 0 || text.indexOf('FUMBLE') >= 0;
      if (isGood || isBad) moments.push({ snap: i + 1, text: text, good: isGood });
    });
  }

  if (moments.length === 0) {
    sheet.innerHTML += "<div style=\"font-family:'Rajdhani';font-size:12px;color:#00ff44;text-align:center;padding:8px;\">Clean game, Coach. Nothing to review.</div>";
  } else {
    moments.slice(0, 6).forEach(function(m) {
      var color = m.good ? '#00ff44' : '#ff0040';
      sheet.innerHTML += "<div style=\"font-family:'Rajdhani';font-size:11px;color:#ccc;padding:6px 0;border-bottom:1px solid #1a1a1a;line-height:1.4;\">" +
        "<span style='color:" + color + ";font-weight:700;'>Snap " + m.snap + ":</span> " + m.text + "</div>";
    });
  }

  ov.appendChild(sheet);
  parent.appendChild(ov);
  gsap.from(sheet, { y: 300, duration: 0.3, ease: 'power2.out' });
}

// ── BUILD END GAME ──
export function buildEndGame() {
  AudioStateManager.setState('game_over');

  var gs = GS.finalEngine;
  var team = getTeam(GS.team);
  var oppId = GS.opponent || 'wolves';
  var opp = getTeam(oppId);
  var humanScore = gs.ctScore;
  var cpuScore = gs.irScore;
  var humanWon = humanScore > cpuScore;
  var tied = humanScore === cpuScore;
  var humanTorch = gs.ctTorchPts;
  var winBonus = humanWon ? 20 : 0;
  var totalEarned = humanTorch + winBonus;

  // Persist
  var season = GS.season || { torchCards: [], carryoverPoints: 0 };
  season.carryoverPoints = totalEarned;
  updateTeamRecord(GS.team, humanWon, tied);

  // Result colors
  var resultColor = humanWon ? '#00ff44' : tied ? '#EBB010' : '#ff0040';
  var resultText = humanWon ? 'VICTORY' : tied ? 'TIE' : 'DEFEAT';

  // MVP
  var mvp = calculateMVP(gs.snapLog, GS.team);
  var mvpStats = mvp ? getMVPStatLine(mvp.id, gs.snapLog) : '';

  // Open loop
  var openLoop = getOpenLoop(totalEarned);

  // Button text
  var btnText = humanWon ? 'PLAY AGAIN' : tied ? 'SETTLE IT' : 'RUN IT BACK';
  var filmText = humanWon ? 'Film Room \u2192' : tied ? 'What happened? \u2192' : 'What went wrong? \u2192';

  // ── BUILD DOM ──
  var el = document.createElement('div');
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:var(--bg);overflow:hidden;';

  // Top bar (Menu + Share)
  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;justify-content:space-between;padding:8px 16px;flex-shrink:0;';
  var menuBtn = document.createElement('div');
  menuBtn.style.cssText = "font-family:'Rajdhani';font-size:10px;color:#444;cursor:pointer;padding:4px;";
  menuBtn.textContent = 'Menu';
  menuBtn.onclick = function() { setGs(null); };
  topBar.appendChild(menuBtn);
  var shareBtn = document.createElement('div');
  shareBtn.style.cssText = "font-family:'Rajdhani';font-size:10px;color:#444;cursor:pointer;padding:4px;";
  shareBtn.textContent = 'Share';
  shareBtn.onclick = function() {
    var txt = 'TORCH \uD83D\uDD25 ' + resultText + ' ' + humanScore + '-' + cpuScore + ' as the ' + team.name + '! +' + totalEarned + ' pts';
    if (navigator.share) navigator.share({ text: txt }).catch(function() {});
    else if (navigator.clipboard) navigator.clipboard.writeText(txt);
  };
  topBar.appendChild(shareBtn);
  el.appendChild(topBar);

  // ── TOP ZONE: Result ──
  var topZone = document.createElement('div');
  topZone.style.cssText = 'text-align:center;padding:8px 16px 12px;flex-shrink:0;';

  var scoreEl = document.createElement('div');
  scoreEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:48px;color:" + resultColor + ";letter-spacing:3px;line-height:1;opacity:0;";
  scoreEl.textContent = resultText + ' ' + humanScore + '-' + cpuScore;
  topZone.appendChild(scoreEl);

  var teamLine = document.createElement('div');
  teamLine.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;margin-top:4px;opacity:0;';
  teamLine.innerHTML = renderTeamBadge(GS.team, 28) + "<span style=\"font-family:'Teko';font-size:16px;color:" + team.accent + ";letter-spacing:2px;\">" + team.name + "</span>";
  topZone.appendChild(teamLine);

  el.appendChild(topZone);

  // ── MIDDLE ZONE: MVP + Points + Open Loop ──
  var midZone = document.createElement('div');
  midZone.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;padding:0 16px;gap:10px;overflow-y:auto;';

  // MVP card
  var mvpWrap = document.createElement('div');
  mvpWrap.style.cssText = 'text-align:center;opacity:0;';
  if (mvp) {
    mvpWrap.innerHTML = "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#EBB010;letter-spacing:3px;margin-bottom:6px;\">\u2605 GAME MVP \u2605</div>";
    var card = buildMaddenPlayer({
      name: mvp.name, firstName: mvp.firstName, pos: mvp.pos, ovr: mvp.ovr,
      num: mvp.num || '', badge: mvp.badge, isStar: mvp.isStar,
      ability: mvp.ability || '', stars: mvp.stars, trait: mvp.trait,
      teamColor: team.colors ? team.colors.primary : team.accent, teamId: GS.team
    }, 100, 140);
    mvpWrap.appendChild(card);
    if (mvpStats) {
      var statLine = document.createElement('div');
      statLine.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:12px;color:#ccc;margin-top:6px;";
      statLine.textContent = mvpStats;
      mvpWrap.appendChild(statLine);
    }
  } else {
    mvpWrap.innerHTML =
      "<div style=\"font-family:'Teko';font-weight:700;font-size:14px;color:#EBB010;letter-spacing:3px;margin-bottom:6px;\">TEAM EFFORT</div>" +
      '<div style="display:flex;justify-content:center;">' + renderTeamBadge(GS.team, 64) + '</div>';
  }
  midZone.appendChild(mvpWrap);

  // Points
  var ptsWrap = document.createElement('div');
  ptsWrap.style.cssText = 'text-align:center;width:100%;max-width:280px;opacity:0;';

  var ptsLabel = document.createElement('div');
  ptsLabel.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:9px;color:#EBB010;letter-spacing:2px;";
  ptsLabel.textContent = humanWon ? 'TORCH POINTS EARNED' : 'EVEN IN DEFEAT';
  ptsWrap.appendChild(ptsLabel);

  var ptsNum = document.createElement('div');
  ptsNum.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:36px;color:#EBB010;text-shadow:0 0 16px rgba(235,176,16,0.4);line-height:1;margin-top:2px;";
  ptsNum.textContent = '+' + totalEarned;
  ptsWrap.appendChild(ptsNum);

  var ptsBreak = document.createElement('div');
  ptsBreak.style.cssText = "font-family:'Rajdhani';font-size:9px;color:#666;margin-top:4px;";
  ptsBreak.textContent = 'Base: ' + humanTorch + (winBonus ? ' | Win: +' + winBonus : '');
  ptsWrap.appendChild(ptsBreak);

  var ptsTotal = document.createElement('div');
  ptsTotal.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:12px;color:#888;margin-top:4px;";
  ptsTotal.textContent = 'Total: ' + totalEarned;
  ptsWrap.appendChild(ptsTotal);

  midZone.appendChild(ptsWrap);

  // Open loop
  var loopEl = null;
  if (openLoop) {
    loopEl = document.createElement('div');
    loopEl.style.cssText = "background:rgba(235,176,16,0.06);border:1px solid #EBB01033;border-radius:6px;padding:8px 14px;text-align:center;opacity:0;max-width:280px;width:100%;";
    loopEl.innerHTML = "<span style=\"font-size:14px;\">" + openLoop.icon + "</span> <span style=\"font-family:'Rajdhani';font-weight:700;font-size:12px;color:" + (openLoop.canBuy ? '#00ff44' : '#EBB010') + ";letter-spacing:1px;\">" + openLoop.text + "</span>";
    midZone.appendChild(loopEl);
  }

  el.appendChild(midZone);

  // ── BOTTOM ZONE: PLAY AGAIN + Film Room ──
  var botZone = document.createElement('div');
  botZone.style.cssText = 'padding:12px 16px 24px;flex-shrink:0;text-align:center;';

  var playBtn = document.createElement('button');
  playBtn.style.cssText = "width:100%;padding:18px;border-radius:8px;border:none;font-family:'Teko';font-weight:700;font-size:22px;letter-spacing:4px;color:#fff;cursor:pointer;background:" + team.accent + ";opacity:0;";
  playBtn.textContent = btnText;
  playBtn.onclick = function() {
    SND.snap();
    setGs(function(s) {
      return Object.assign({}, s, {
        screen: 'teamSelect', opponent: null, engine: null, finalEngine: null,
        _lastTeam: GS.team,
        season: { torchCards: season.torchCards || [], carryoverPoints: season.carryoverPoints }
      });
    });
  };
  botZone.appendChild(playBtn);

  var filmLink = document.createElement('div');
  filmLink.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:11px;color:#555;letter-spacing:1px;margin-top:10px;cursor:pointer;opacity:0;";
  filmLink.textContent = filmText;
  filmLink.onclick = function() { showFilmRoom(el, gs); };
  botZone.appendChild(filmLink);

  el.appendChild(botZone);

  // ── GSAP ANIMATION SEQUENCE ──
  var tl = gsap.timeline();
  var skipped = false;

  function skipAll() {
    if (skipped) return;
    skipped = true;
    tl.progress(1);
  }
  el.addEventListener('touchstart', skipAll, { once: true, passive: true });
  el.addEventListener('click', function(e) {
    // Don't skip if tapping buttons
    if (e.target === playBtn || e.target === filmLink || e.target === menuBtn || e.target === shareBtn) return;
    skipAll();
  }, { once: true });

  // Step 1: Score flies in
  tl.to(scoreEl, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)' });
  tl.from(scoreEl, { scale: 1.4, duration: 0.3, ease: 'back.out(1.7)' }, '<');
  tl.to(teamLine, { opacity: 1, duration: 0.2, ease: 'power2.out' }, '-=0.1');

  // Step 2: MVP deals in
  tl.to(mvpWrap, { opacity: 1, duration: 0.3, ease: 'power2.out' }, '+=0.15');
  tl.from(mvpWrap, { y: -80, rotation: -3, scale: 0.85, duration: 0.3, ease: 'back.out(1.7)' }, '<');

  // Step 3: Points
  tl.to(ptsWrap, { opacity: 1, duration: 0.25, ease: 'power2.out' }, '+=0.15');

  // Step 4: Open loop
  if (loopEl) {
    tl.to(loopEl, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }, '+=0.15');
    tl.from(loopEl, { y: 10, duration: 0.25, ease: 'power2.out' }, '<');
  }

  // Step 5: PLAY AGAIN pulses to life
  tl.to(playBtn, { opacity: 1, duration: 0.3, ease: 'back.out(1.5)' }, '+=0.1');
  tl.from(playBtn, { scale: 0.9, duration: 0.3, ease: 'back.out(1.5)' }, '<');
  tl.to(filmLink, { opacity: 1, duration: 0.2 }, '-=0.1');
  tl.call(function() {
    gsap.to(playBtn, { scale: 1.02, duration: 1, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  });

  return el;
}
