/**
 * TORCH — Team Select Screen (Stadium Tunnel)
 * Full-width horizontal team panels stacked vertically. TORCH-branded header.
 * Tap to select → confirmation → VS → pregame.
 */

import { gsap } from 'gsap';
import { SND } from '../../engine/sound.js';
import AudioStateManager from '../../engine/audioManager.js';
import { GS, setGs, getTeam, getOffCards, getDefCards, shuffle } from '../../state.js';
import { TEAMS, getSeasonOpponents } from '../../data/teams.js';
import { getOffenseRoster, getDefenseRoster } from '../../data/players.js';
import { buildMaddenPlayer, teamHelmetSvg, renderFlamePips } from '../components/cards.js';
import { FLAME_PATH, buildTorchHeader, buildFlameBadgeButton } from '../components/brand.js';
import { renderTeamBadge } from '../../data/teamLogos.js';
import { generateConditions, WEATHER, FIELD, CROWD } from '../../data/gameConditions.js';
import { getTeamRecord } from './endGame.js';
// getStreak removed — no longer shown on team select

var TEAM_VIBES = {
  sentinels: 'Run-first. Physical. Patient football.',
  wolves: 'Speed kills. Zone read. Ride the current.',
  stags: 'Explosive. Electric. Outscore everyone.',
  serpents: 'Cerebral and methodical. Death by paper cuts.',
};

// ============================================================
// INJECT KEYFRAMES
// ============================================================
function injectAnimations() {
  if (document.getElementById('ts-anims')) return;
  var s = document.createElement('style');
  s.id = 'ts-anims';
  s.textContent =
    '@keyframes shimmer{0%,100%{background-position:-200px 0}50%{background-position:200px 0}}' +
    '@keyframes tsFlash{0%{opacity:0.7}100%{opacity:0}}' +
    '@keyframes tsHelmetZoom{0%{transform:scale(0.5);opacity:0}60%{transform:scale(1.15);opacity:1}100%{transform:scale(1);opacity:1}}' +
    '@keyframes tsPlayerFan{0%{opacity:0;transform:translateY(20px) scale(0.7)}100%{opacity:1;transform:none}}' +
    '@keyframes tsVsSlam{0%{transform:scale(2.5);opacity:0}60%{transform:scale(0.9);opacity:1}100%{transform:scale(1)}}' +
    '@keyframes tsShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-3px)}40%{transform:translateX(3px)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}}';
  document.head.appendChild(s);
}

// ============================================================
// BUILD
// ============================================================
export function buildTeamSelect() {
  injectAnimations();
  AudioStateManager.setState('pre_game');

  var el = document.createElement('div');
  el.style.cssText = 'height:100vh;height:100dvh;max-height:100dvh;display:flex;flex-direction:column;background:#0A0804;position:relative;overflow:hidden;padding-top:env(safe-area-inset-top,0px);';

  // Season state
  var _existingSeason = GS && GS.season && GS.season.opponents && GS.season.opponents.length > 0;
  var _seasonGame = _existingSeason ? (GS.season.currentGame || 0) + 1 : 0;
  var isFirst = !GS || GS.isFirstSeason !== false;

  // ── HEADER — TORCH branded ──
  var header = buildTorchHeader('CHOOSE YOUR TEAM', _seasonGame >= 2 && _seasonGame <= 3 ? { subtitle: 'GAME ' + _seasonGame + ' OF 3' } : null);
  el.appendChild(header);

  // ── TEAM PANELS ──
  var panelContainer = document.createElement('div');
  panelContainer.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:8px;padding:12px 10px;min-height:0;';

  var selectedTeamId = null;
  var selectedTeam = null;
  var panels = [];
  var teamIds = Object.keys(TEAMS);

  teamIds.forEach(function(tid) {
    var team = TEAMS[tid];
    var accent = team.accent || team.colors.primary;

    var panel = document.createElement('div');
    panel.style.cssText = 'flex:1;border-radius:8px;border:1.5px solid ' + accent + '33;background:linear-gradient(90deg,' + accent + '15,#0a0804 60%);box-shadow:0 2px 12px rgba(0,0,0,0.4);display:flex;align-items:center;gap:14px;padding:0 16px;cursor:pointer;position:relative;overflow:hidden;transition:border-color 0.2s,box-shadow 0.2s,opacity 0.2s;';
    panel.dataset.team = tid;

    // Left accent edge
    var edge = document.createElement('div');
    edge.style.cssText = 'position:absolute;left:0;top:0;bottom:0;width:3px;background:' + accent + ';';
    panel.appendChild(edge);

    // Team badge
    var badgeWrap = document.createElement('div');
    badgeWrap.style.cssText = 'flex-shrink:0;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.5));';
    badgeWrap.innerHTML = renderTeamBadge(tid, 64);
    panel.appendChild(badgeWrap);

    // Info column
    var info = document.createElement('div');
    info.style.cssText = 'flex:1;min-width:0;display:flex;flex-direction:column;';

    // School
    var schoolEl = document.createElement('div');
    schoolEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:9px;color:rgba(255,255,255,0.3);letter-spacing:2px;";
    schoolEl.textContent = (team.school || '').toUpperCase();
    info.appendChild(schoolEl);

    // Team name
    var nameEl = document.createElement('div');
    nameEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:28px;color:#fff;letter-spacing:3px;line-height:0.9;text-shadow:0 2px 6px rgba(0,0,0,0.8);";
    nameEl.textContent = team.name;
    info.appendChild(nameEl);

    // Info row: scheme + divider + vibe + record
    var infoRow = document.createElement('div');
    infoRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:4px;flex-wrap:wrap;';

    var schemeEl = document.createElement('span');
    schemeEl.style.cssText = "font-family:'Oswald';font-weight:700;font-size:10px;color:" + accent + ";letter-spacing:1.5px;";
    schemeEl.textContent = team.offScheme;
    infoRow.appendChild(schemeEl);

    var infoDivider = document.createElement('span');
    infoDivider.style.cssText = 'width:1px;height:10px;background:rgba(255,255,255,0.1);';
    infoRow.appendChild(infoDivider);

    var vibeEl = document.createElement('span');
    vibeEl.style.cssText = "font-family:'Rajdhani';font-weight:500;font-size:10px;color:rgba(255,255,255,0.35);";
    vibeEl.textContent = TEAM_VIBES[tid] || '';
    infoRow.appendChild(vibeEl);

    // Record
    var rec = getTeamRecord(tid);
    var titles = JSON.parse(localStorage.getItem('torch_titles') || '{}');
    var teamTitles = titles[tid] || 0;
    if (rec.wins + rec.losses + rec.ties > 0 || teamTitles > 0) {
      var recEl = document.createElement('span');
      recEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:9px;color:rgba(255,255,255,0.25);letter-spacing:0.5px;";
      var recText = rec.wins + '-' + rec.losses + (rec.ties > 0 ? '-' + rec.ties : '');
      if (teamTitles > 0) recText += ' \u00b7 ' + teamTitles + '\u00d7 CHAMP';
      recEl.textContent = recText;
      infoRow.appendChild(recEl);
    }

    info.appendChild(infoRow);
    panel.appendChild(info);

    // Right chevron
    var chevron = document.createElement('div');
    chevron.style.cssText = "color:" + accent + ";opacity:0.3;font-size:14px;flex-shrink:0;font-family:'Rajdhani';";
    chevron.textContent = '\u203A';
    panel.appendChild(chevron);

    // Shimmer overlay
    var shimmer = document.createElement('div');
    shimmer.style.cssText = 'position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,' + accent + '08 48%,transparent 65%);background-size:200px 100%;animation:shimmer 5s ease-in-out infinite;pointer-events:none;';
    panel.appendChild(shimmer);

    // Touch feedback
    panel.addEventListener('touchstart', function() {
      if (selectedTeamId && selectedTeamId !== tid) return;
      panel.style.borderColor = accent + '66';
      panel.style.boxShadow = '0 0 16px ' + accent + '22, 0 2px 12px rgba(0,0,0,0.4)';
      try { gsap.to(panel, { scale: 0.96, duration: 0.08 }); } catch(e) {}
    }, { passive: true });
    panel.addEventListener('touchend', function() {
      try { gsap.to(panel, { scale: 1, duration: 0.15, ease: 'back.out(2)' }); } catch(e) {}
      if (selectedTeamId === tid) return; // keep highlight
      panel.style.borderColor = accent + '33';
      panel.style.boxShadow = '0 2px 12px rgba(0,0,0,0.4)';
    }, { passive: true });

    // Tap handler
    panel.onclick = function() {
      SND.click();
      selectedTeamId = tid;
      selectedTeam = team;

      // Highlight selected, dim others
      panels.forEach(function(p) {
        var ptid = p.dataset.team;
        var pt = TEAMS[ptid];
        var pa = pt.accent || pt.colors.primary;
        if (ptid === tid) {
          p.style.border = '2px solid ' + pa;
          p.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5),0 0 20px ' + pa + '33';
          p.style.background = 'linear-gradient(90deg,' + pa + '30,#0a0804 70%)';
          p.style.opacity = '1';
          p.style.filter = '';
          try { gsap.fromTo(p, { scale: 1 }, { scale: 1.02, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out' }); } catch(e) {}
        } else {
          p.style.opacity = '0.4';
          p.style.filter = '';
          p.style.boxShadow = '0 2px 12px rgba(0,0,0,0.4)';
        }
      });

      // Show KICK OFF button
      kickOffBtn.style.opacity = '1';
      kickOffBtn.style.pointerEvents = 'auto';
    };

    panelContainer.appendChild(panel);
    panels.push(panel);

    // Pre-highlight last team played
    if (GS && GS._lastTeam === tid) {
      setTimeout(function() {
        panel.style.boxShadow = '0 0 16px ' + accent + '22, 0 2px 12px rgba(0,0,0,0.4)';
        panel.style.borderColor = accent + '55';
      }, 400);
    }
  });

  el.appendChild(panelContainer);

  // ── KICK OFF BUTTON ──
  var kickOffBtn = buildFlameBadgeButton('KICK OFF', function() {
    if (!selectedTeamId) return;
    SND.click();

    var existingSeason = GS && GS.season && GS.season.opponents && GS.season.opponents.length > 0;
    var opponents = existingSeason ? GS.season.opponents : getSeasonOpponents(selectedTeamId);
    var currentGame = existingSeason ? (GS.season.currentGame || 0) : 0;
    var opponentId = opponents[Math.min(currentGame, opponents.length - 1)];
    var humanReceives = Math.random() < 0.5;
    var difficulty = GS && GS.difficulty ? GS.difficulty : 'EASY';
    var gamesPlayed = parseInt(localStorage.getItem('torch_games_played') || '0');
    var conditions = generateConditions(gamesPlayed === 0);

    setGs(function(s) {
      return Object.assign({}, s || {}, {
        screen: 'pregame',
        team: selectedTeamId,
        difficulty: difficulty,
        opponent: opponentId,
        humanReceives: humanReceives,
        _coinTossDone: false,
        offRoster: getOffenseRoster(selectedTeamId).slice(0, 4).map(function(p) { return p.id; }),
        defRoster: getDefenseRoster(selectedTeamId).slice(0, 4).map(function(p) { return p.id; }),
        offHand: getOffCards(selectedTeamId).slice(0, 4),
        defHand: getDefCards(selectedTeamId).slice(0, 4),
        gameConditions: conditions,
        isFirstSeason: s ? s.isFirstSeason : true,
        season: s && s.season ? s.season : {
          opponents: opponents,
          currentGame: 0,
          results: [],
          totalScore: 0,
          torchCards: [],
          carryoverPoints: 0,
        },
      });
    });
  }, { breathe: false });
  kickOffBtn.style.cssText += 'flex-shrink:0;margin:0 10px 6px;opacity:0.3;pointer-events:none;transition:opacity 0.3s;';
  el.appendChild(kickOffBtn);

  // ── DIFFICULTY ROW ──
  if (!isFirst) {
    var diffRow = document.createElement('div');
    diffRow.style.cssText = 'flex-shrink:0;display:flex;gap:6px;justify-content:center;padding:0 10px 4px;';
    var diffs = [
      { id: 'EASY', label: 'EASY', color: '#00ff44' },
      { id: 'MEDIUM', label: 'MEDIUM', color: '#EBB010' },
      { id: 'HARD', label: 'HARD', color: '#ff0040' },
    ];
    var selDiff = GS && GS.difficulty ? GS.difficulty : 'MEDIUM';
    diffs.forEach(function(d) {
      var btn = document.createElement('button');
      var isSel = selDiff === d.id;
      btn.style.cssText = "font-family:'Teko';font-weight:700;font-size:12px;letter-spacing:2px;padding:8px 16px;flex:1;border-radius:4px;cursor:pointer;border:1.5px solid " +
        (isSel ? d.color : '#222') + ";background:" + (isSel ? d.color + '22' : 'transparent') + ";color:" + (isSel ? d.color : '#555') + ";";
      btn.textContent = d.label;
      btn.onclick = function(e) {
        e.stopPropagation();
        SND.click();
        selDiff = d.id;
        setGs(function(s) { return Object.assign({}, s, { difficulty: d.id }); });
      };
      diffRow.appendChild(btn);
    });
    el.appendChild(diffRow);
  }

  // ── FOOTER ──
  var footer = document.createElement('div');
  footer.style.cssText = 'flex-shrink:0;padding:0 0 8px;padding-bottom:max(8px,env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;align-items:center;gap:6px;';

  var footDivider = document.createElement('div');
  footDivider.style.cssText = 'width:100%;height:1px;background:linear-gradient(90deg,transparent,#EBB01022,transparent);margin-bottom:2px;';
  footer.appendChild(footDivider);

  var brandMark = document.createElement('div');
  brandMark.style.cssText = "display:flex;align-items:center;gap:6px;";
  brandMark.innerHTML =
    "<svg viewBox='0 0 44 56' width='8' height='10' fill='#FF4511' style='opacity:0.3;'><path d='" + FLAME_PATH + "'/></svg>" +
    "<span style=\"font-family:'Rajdhani';font-weight:600;font-size:9px;color:#333;letter-spacing:1.5px;\">TORCH FOOTBALL</span>" +
    "<svg viewBox='0 0 44 56' width='8' height='10' fill='#FF4511' style='opacity:0.3;'><path d='" + FLAME_PATH + "'/></svg>";
  footer.appendChild(brandMark);

  el.appendChild(footer);

  // ── ENTRANCE ANIMATION ──
  // Set initial hidden state inline so elements are invisible before DOM insert
  header.style.opacity = '0';
  panels.forEach(function(p) { p.style.opacity = '0'; p.style.transform = 'translateX(-30px)'; });
  footer.style.opacity = '0';
  // Animate after DOM is ready (double-rAF ensures layout pass complete)
  requestAnimationFrame(function() { requestAnimationFrame(function() {
    try {
      gsap.to(header, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
      gsap.to(panels, { x: 0, opacity: 1, duration: 0.3, stagger: 0.08, delay: 0.15, ease: 'power2.out' });
      gsap.to(footer, { opacity: 1, duration: 0.25, delay: 0.6 });
    } catch(e) {
      // Fallback: show everything if GSAP fails
      header.style.opacity = '1';
      panels.forEach(function(p) { p.style.opacity = '1'; p.style.transform = ''; });
      footer.style.opacity = '1';
    }
  }); });

  // Onboarding: team select hint
  if (!localStorage.getItem('torch_onboarding_complete') && !localStorage.getItem('torch_hint_team_select')) {
    setTimeout(function() {
      if (panels.length > 0 && !localStorage.getItem('torch_hint_team_select')) {
        var ov = document.createElement('div');
        ov.style.cssText = 'position:fixed;inset:0;z-index:800;background:rgba(0,0,0,0.5);';
        var bub = document.createElement('div');
        bub.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:802;max-width:260px;background:rgba(10,8,4,0.95);border:1px solid #1a1a1a;border-left:3px solid #FF4511;border-radius:8px;padding:12px 16px;box-shadow:0 8px 24px rgba(0,0,0,0.6);font-family:'Rajdhani';font-weight:600;font-size:13px;color:#fff;line-height:1.3;text-align:center;";
        bub.textContent = 'Pick your squad. Each team plays a little different.';
        ov.onclick = function() { localStorage.setItem('torch_hint_team_select', '1'); ov.remove(); bub.remove(); };
        el.appendChild(ov);
        el.appendChild(bub);
        try { gsap.from(bub, { opacity: 0, y: 8, scale: 0.95, duration: 0.25, ease: 'back.out(1.5)' }); } catch(e) {}
      }
    }, 1200);
  }

  return el;
}
