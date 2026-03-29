/**
 * TORCH v0.23.1 — Pregame Sequence ("Broadcast Clash")
 * Full-screen broadcast-style matchup: TORCH header → Away panel → VS slam → Home panel → Conditions
 * Deceleration easing, weighted team panels, VS slam animation.
 * 4.5s display, tap-to-skip, progressive shortening after 5 games.
 */

import { SND } from '../../engine/sound.js';
import { GS, setGs } from '../../state.js';
import { TEAMS, COUNTER_PLAY } from '../../data/teams.js';
import { renderTeamBadge } from '../../data/teamLogos.js';
import { renderFlamePips } from '../components/cards.js';
import AudioStateManager from '../../engine/audioManager.js';
import { getH2H, getStreak } from '../../engine/streaks.js';
import { getOffenseRoster, getDefenseRoster } from '../../data/players.js';

// Weather → temperature mapping
var WEATHER_TEMP = { clear: '72°', rain: '58°', windy: '64°', snow: '28°' };
var WEATHER_ICON = { clear: '☀️', rain: '🌧️', windy: '💨', snow: '❄️' };
var FIELD_LABEL = { turf: 'TURF', grass: 'GRASS', mud: 'MUD', dome: 'DOME' };

export function buildPregame() {
  AudioStateManager.setState('pre_game');

  var el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;background:#0A0804;z-index:1000;display:flex;flex-direction:column;overflow:hidden;cursor:pointer;';

  var team = TEAMS[GS.team];
  var opp = TEAMS[GS.opponent];
  if (!team || !opp) { setGs(function(s) { return Object.assign({}, s, { screen: 'gameplay' }); }); return el; }

  var conditions = GS.gameConditions || { weather: 'clear', field: 'turf', crowd: 'home' };
  var gamesPlayed = parseInt(localStorage.getItem('torch_games_played') || '0');
  var isFast = gamesPlayed >= 2;

  // Determine home/away: crowd field tells us
  var isHome = conditions.crowd === 'home';
  var homeTeam = isHome ? team : opp;
  var homeId = isHome ? GS.team : GS.opponent;
  var awayTeam = isHome ? opp : team;
  var awayId = isHome ? GS.opponent : GS.team;

  // Flame SVG path
  var FLAME = 'M22 2C22 2 10 14 9 22C8 30 13 36 17 38C17 38 14 32 17 26C19 22 21 18 22 14C23 18 25 22 27 26C30 32 27 38 27 38C31 36 36 30 35 22C34 14 22 2 22 2Z';

  // ── Timing (fast mode: ~1.5s total vs ~5.5s first-game) ──
  var t = isFast
    ? { hdr:0.0,  away:0.05, vs:0.15, home:0.1, wx:0.25, dur:0.15, vsDur:0.15, auto:1800 }
    : { hdr:0.1,  away:0.3,  vs:0.7,  home:0.5, wx:1.0,  dur:0.5,  vsDur:0.4,  auto:5500 };

  // ── STYLES ──
  var sty = document.createElement('style');
  sty.textContent =
    '@keyframes pgFlame{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}' +
    '@keyframes pgFadeDown{0%{opacity:0;transform:translateY(-12px)}100%{opacity:1;transform:translateY(0)}}' +
    '@keyframes pgFadeUp{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}' +
    '@keyframes pgSlideL{0%{opacity:0;transform:translateX(-100%)}100%{opacity:1;transform:translateX(0)}}' +
    '@keyframes pgSlideR{0%{opacity:0;transform:translateX(100%)}100%{opacity:1;transform:translateX(0)}}' +
    '@keyframes pgVsSlam{0%{opacity:0;transform:scale(2.5)}70%{opacity:1;transform:scale(0.95)}100%{opacity:1;transform:scale(1)}}' +
    '@keyframes pgVsGlow{0%,100%{opacity:0.5;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}' +
    '@keyframes pgShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}' +
    '@keyframes pgPulse{0%,100%{opacity:0.15}50%{opacity:0.3}}';
  el.appendChild(sty);

  // Deceleration easing
  var ease = 'cubic-bezier(0.22,1,0.36,1)';

  // ── BACKGROUND ──
  var bgNoise = document.createElement('div');
  bgNoise.style.cssText = 'position:absolute;inset:0;background-image:radial-gradient(ellipse at 50% 30%,rgba(255,69,17,0.06) 0%,transparent 60%),radial-gradient(ellipse at 50% 70%,rgba(235,176,16,0.04) 0%,transparent 60%);pointer-events:none;z-index:0;';
  el.appendChild(bgNoise);
  var bgLine = document.createElement('div');
  bgLine.style.cssText = 'position:absolute;top:0;bottom:0;left:50%;width:1px;background:linear-gradient(180deg,transparent 0%,rgba(235,176,16,0.06) 30%,rgba(255,69,17,0.10) 50%,rgba(235,176,16,0.06) 70%,transparent 100%);pointer-events:none;z-index:0;';
  el.appendChild(bgLine);

  // ── A) TORCH HEADER ──
  var header = document.createElement('div');
  header.style.cssText = 'flex-shrink:0;display:flex;flex-direction:column;align-items:center;padding:28px 0 10px;z-index:1;opacity:0;animation:pgFadeDown ' + t.dur + 's ease-out ' + t.hdr + 's both;';
  header.innerHTML =
    '<svg viewBox="0 0 44 44" width="56" height="64" fill="none" style="animation:pgFlame 2s ease-in-out infinite;filter:drop-shadow(0 0 12px rgba(255,69,17,0.5));"><defs><linearGradient id="pgf" x1="22" y1="40" x2="22" y2="0"><stop offset="0%" stop-color="#FF4511"/><stop offset="100%" stop-color="#EBB010"/></linearGradient></defs><path d="' + FLAME + '" fill="url(#pgf)"/></svg>' +
    "<div style=\"font-family:'Teko';font-weight:700;font-size:36px;color:#EBB010;letter-spacing:12px;margin-top:8px;text-shadow:0 0 20px rgba(235,176,16,0.3);\">GAME DAY</div>" +
    "<div style=\"font-family:'Teko';font-weight:700;font-size:20px;color:#FF6B00;letter-spacing:8px;opacity:0.7;\">TORCH FOOTBALL</div>";
  el.appendChild(header);

  // ── MATCHUP CONTAINER (fills remaining space, centers panels) ──
  var matchup = document.createElement('div');
  matchup.style.cssText = 'flex:1;z-index:1;display:flex;flex-direction:column;justify-content:center;gap:0;';

  // ── B) AWAY TEAM PANEL ──
  var awayPanel = document.createElement('div');
  awayPanel.style.cssText =
    'position:relative;display:flex;align-items:center;padding:18px 20px;min-height:120px;overflow:hidden;' +
    'border-left:4px solid ' + awayTeam.accent + ';' +
    'background:linear-gradient(100deg,' + awayTeam.colors.primary + ' 0%,rgba(10,8,4,0.95) 70%);' +
    'opacity:0;animation:pgSlideL ' + t.dur + 's ' + ease + ' ' + t.away + 's both;';
  // Edge fade overlay (inner side)
  var awayFade = document.createElement('div');
  awayFade.style.cssText = 'position:absolute;right:0;top:0;bottom:0;width:60px;background:linear-gradient(90deg,transparent,rgba(10,8,4,0.8));pointer-events:none;';
  awayPanel.appendChild(awayFade);
  // Content layout: badge → info
  var awayLayout = document.createElement('div');
  awayLayout.style.cssText = 'display:flex;align-items:center;gap:16px;width:100%;position:relative;z-index:1;';
  awayLayout.innerHTML = renderTeamBadge(awayId, 80) + buildTeamInfo(awayTeam, 'AWAY', 'left');
  awayPanel.appendChild(awayLayout);
  matchup.appendChild(awayPanel);

  // ── C) VS COLLISION ZONE ──
  var vsZone = document.createElement('div');
  vsZone.style.cssText =
    'flex-shrink:0;display:flex;align-items:center;justify-content:center;padding:10px 24px;position:relative;' +
    'opacity:0;animation:pgVsSlam ' + t.vsDur + 's ' + ease + ' ' + t.vs + 's both;';
  // Radial glow behind VS
  var vsGlow = document.createElement('div');
  vsGlow.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;';
  vsGlow.innerHTML = '<div style="width:80px;height:80px;background:radial-gradient(circle,rgba(235,176,16,0.15) 0%,transparent 70%);animation:pgVsGlow 2.5s ease-in-out infinite;"></div>';
  vsZone.appendChild(vsGlow);
  // Bars + VS text
  vsZone.innerHTML +=
    '<div style="flex:1;height:2px;border-radius:1px;background:linear-gradient(90deg,transparent 10%,#FF4511 50%,#EBB010);"></div>' +
    "<div style=\"position:relative;padding:0 16px;font-family:'Teko';font-weight:900;font-size:48px;color:#fff;letter-spacing:6px;line-height:1;\">" +
      "<span style=\"position:absolute;inset:0;display:flex;align-items:center;justify-content:center;-webkit-text-stroke:2px #EBB010;color:transparent;font-family:'Teko';font-weight:900;font-size:48px;letter-spacing:6px;\">VS</span>" +
      'VS' +
    '</div>' +
    '<div style="flex:1;height:2px;border-radius:1px;background:linear-gradient(270deg,transparent 10%,#FF4511 50%,#EBB010);"></div>';
  matchup.appendChild(vsZone);

  // ── C2) RIVALRY CONTEXT ──
  var cp = COUNTER_PLAY[GS.team] || {};
  var matchupColor, matchupLabel, matchupType;
  if (cp.strong === GS.opponent) {
    matchupColor = '#00ff44'; matchupLabel = 'Favorable matchup'; matchupType = 'FAVORABLE';
  } else if (cp.weak === GS.opponent) {
    matchupColor = '#ff0040'; matchupLabel = 'Tough matchup'; matchupType = 'TOUGH';
  } else {
    matchupColor = '#EBB010'; matchupLabel = 'Even matchup'; matchupType = 'EVEN';
  }

  var h2h = getH2H(GS.team, GS.opponent);
  var rivalWrap = document.createElement('div');
  rivalWrap.style.cssText =
    'flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:4px;padding:4px 0 2px;z-index:1;' +
    'opacity:0;animation:pgFadeUp ' + t.dur + 's ease-out ' + t.vs + 's both;';

  if (h2h.wins + h2h.losses > 0) {
    var h2hEl = document.createElement('div');
    h2hEl.style.cssText = "font-family:'Rajdhani';font-size:12px;font-weight:600;color:#555;letter-spacing:2px;";
    h2hEl.textContent = 'HEAD-TO-HEAD  ' + h2h.wins + '-' + h2h.losses;
    rivalWrap.appendChild(h2hEl);
  }

  var matchupEl = document.createElement('div');
  matchupEl.style.cssText = "font-family:'Rajdhani';font-size:11px;font-weight:700;color:" + matchupColor + ";letter-spacing:2px;opacity:0.85;";
  matchupEl.textContent = matchupLabel.toUpperCase();
  rivalWrap.appendChild(matchupEl);

  var streak = getStreak(GS.team);
  if (streak.currentWin >= 2) {
    var streakEl = document.createElement('div');
    streakEl.style.cssText = "font-family:'Rajdhani';font-size:11px;font-weight:700;color:#EBB010;letter-spacing:2px;margin-top:2px;";
    streakEl.textContent = streak.currentWin + '-GAME WIN STREAK';
    rivalWrap.appendChild(streakEl);
  }

  matchup.appendChild(rivalWrap);

  // ── C3) SCOUTING REPORT ──
  var oppOffRoster = getOffenseRoster(GS.opponent);
  var oppDefRoster = getDefenseRoster(GS.opponent);
  var oppStarOff = oppOffRoster.find(function(p) { return p.isStar; });
  var oppStarDef = oppDefRoster.find(function(p) { return p.isStar; });

  var scoutDelay = isFast ? t.wx - 0.05 : t.wx - 0.2;

  var scoutCard = document.createElement('div');
  scoutCard.style.cssText =
    'flex-shrink:0;z-index:1;width:90%;max-width:320px;margin:0 auto 4px;padding:8px 12px;' +
    'background:rgba(255,255,255,0.02);border:1px solid #1a1a1a;border-left:3px solid ' + opp.accent + '66;border-radius:8px;' +
    'opacity:0;animation:pgFadeUp ' + t.dur + 's ease-out ' + scoutDelay + 's both;';

  // Header row
  var scoutHeader = document.createElement('div');
  scoutHeader.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;";
  scoutHeader.innerHTML =
    "<span style=\"font-family:'Rajdhani';font-size:10px;font-weight:700;color:#444;letter-spacing:3px;\">SCOUTING REPORT</span>";
  scoutCard.appendChild(scoutHeader);

  // Divider
  var scoutDiv = document.createElement('div');
  scoutDiv.style.cssText = 'height:1px;background:#1a1a1a;margin-bottom:6px;';
  scoutCard.appendChild(scoutDiv);

  // Scheme rows
  var schemeLines = [
    { label: 'OFFENSE', value: opp.offScheme },
    { label: 'DEFENSE', value: opp.defScheme },
  ];
  schemeLines.forEach(function(line) {
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:baseline;justify-content:space-between;margin-bottom:3px;';
    row.innerHTML =
      "<span style=\"font-family:'Rajdhani';font-size:11px;font-weight:600;color:" + opp.accent + "99;letter-spacing:2px;\">" + line.label + "</span>" +
      "<span style=\"font-family:'Teko';font-size:14px;font-weight:700;color:" + opp.accent + ";letter-spacing:1px;\">" + line.value + "</span>";
    scoutCard.appendChild(row);
  });

  // Vibe row
  var vibeRow = document.createElement('div');
  vibeRow.style.cssText = 'margin-bottom:5px;';
  vibeRow.innerHTML =
    "<span style=\"font-family:'Rajdhani';font-size:10px;font-weight:600;color:#555;font-style:italic;\">" + opp.vibe + "</span>";
  scoutCard.appendChild(vibeRow);

  // Star players
  if (oppStarOff || oppStarDef) {
    var starDiv = document.createElement('div');
    starDiv.style.cssText = 'height:1px;background:#1a1a1a;margin-bottom:5px;';
    scoutCard.appendChild(starDiv);

    [oppStarOff, oppStarDef].forEach(function(p) {
      if (!p) return;
      var starRow = document.createElement('div');
      starRow.style.cssText = 'display:flex;align-items:baseline;gap:4px;margin-bottom:2px;';
      starRow.innerHTML =
        "<span style=\"font-family:'Rajdhani';font-size:10px;font-weight:700;color:#EBB010;letter-spacing:2px;opacity:0.5;\">WATCH</span>" +
        "<span style=\"font-family:'Teko';font-size:13px;color:#EBB010;letter-spacing:1px;\">" + p.firstName + ' ' + p.name + " <span style=\"font-size:11px;color:#888;\">(" + p.pos + ")</span> — " + p.trait + "</span>";
      scoutCard.appendChild(starRow);
    });
  }

  matchup.appendChild(scoutCard);

  // ── D) HOME TEAM PANEL ──
  var homePanel = document.createElement('div');
  homePanel.style.cssText =
    'position:relative;display:flex;align-items:center;padding:18px 20px;min-height:120px;overflow:hidden;' +
    'border-right:4px solid ' + homeTeam.accent + ';' +
    'background:linear-gradient(260deg,' + homeTeam.colors.primary + ' 0%,rgba(10,8,4,0.95) 70%);' +
    'opacity:0;animation:pgSlideR ' + t.dur + 's ' + ease + ' ' + t.home + 's both;';
  // Edge fade overlay (inner side)
  var homeFade = document.createElement('div');
  homeFade.style.cssText = 'position:absolute;left:0;top:0;bottom:0;width:60px;background:linear-gradient(270deg,transparent,rgba(10,8,4,0.8));pointer-events:none;';
  homePanel.appendChild(homeFade);
  // Content layout: info ← badge (reversed)
  var homeLayout = document.createElement('div');
  homeLayout.style.cssText = 'display:flex;align-items:center;gap:16px;width:100%;position:relative;z-index:1;flex-direction:row-reverse;';
  homeLayout.innerHTML = renderTeamBadge(homeId, 80) + buildTeamInfo(homeTeam, 'HOME', 'right');
  homePanel.appendChild(homeLayout);
  matchup.appendChild(homePanel);

  el.appendChild(matchup);

  // ── E) CONDITIONS CARD ──
  var condWrap = document.createElement('div');
  condWrap.style.cssText = 'flex-shrink:0;z-index:1;display:flex;flex-direction:column;align-items:center;padding:12px 24px 24px;opacity:0;animation:pgFadeUp 0.5s ease-out ' + t.wx + 's both;';

  var wxIcon = WEATHER_ICON[conditions.weather] || '☀️';
  var wxName = (conditions.weather || 'clear').toUpperCase();
  var wxTemp = WEATHER_TEMP[conditions.weather] || '72°';
  var fieldSurface = FIELD_LABEL[conditions.field] || (conditions.field || 'TURF').toUpperCase();

  var wxCard = document.createElement('div');
  wxCard.style.cssText = 'display:flex;align-items:center;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);padding:12px 0;width:100%;max-width:300px;';
  wxCard.innerHTML =
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">' +
      '<div style="font-size:22px;line-height:1;">' + wxIcon + '</div>' +
      "<div style=\"font-family:'Teko';font-size:13px;color:#EBB010;letter-spacing:2px;\">" + wxName + '</div>' +
    '</div>' +
    '<div style="width:1px;height:36px;background:rgba(255,255,255,0.06);"></div>' +
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">' +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:24px;color:#fff;\">" + wxTemp + '</div>' +
      "<div style=\"font-family:'Rajdhani';font-size:9px;font-weight:600;color:#555;letter-spacing:3px;\">TEMPERATURE</div>" +
    '</div>' +
    '<div style="width:1px;height:36px;background:rgba(255,255,255,0.06);"></div>' +
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">' +
      "<div style=\"font-family:'Teko';font-size:20px;color:#888;\">" + fieldSurface + '</div>' +
      "<div style=\"font-family:'Rajdhani';font-size:9px;font-weight:600;color:#555;letter-spacing:3px;\">SURFACE</div>" +
    '</div>';
  condWrap.appendChild(wxCard);

  // Shimmer bar
  var shimmer = document.createElement('div');
  shimmer.style.cssText = 'width:70%;height:2px;margin-top:14px;border-radius:1px;background:linear-gradient(90deg,#FF4511,#EBB010,#FF4511);background-size:200% 100%;animation:pgShimmer 3s linear infinite;';
  condWrap.appendChild(shimmer);

  // Tap hint
  var tapHint = document.createElement('div');
  tapHint.style.cssText = "font-family:'Rajdhani';font-size:10px;font-weight:600;color:rgba(255,255,255,0.15);letter-spacing:4px;margin-top:10px;animation:pgPulse 2s ease-in-out infinite;";
  tapHint.textContent = 'TAP TO CONTINUE';
  condWrap.appendChild(tapHint);

  el.appendChild(condWrap);

  // ── SOUNDS ──
  SND.click();
  setTimeout(function() { SND.hit(); }, isFast ? 300 : 700);

  // ── TAP TO SKIP (after 3s hold) ──
  var skipped = false;
  var canSkip = false;
  setTimeout(function() { canSkip = true; }, 3000);
  function skip() {
    if (skipped || !canSkip) return;
    skipped = true;
    localStorage.setItem('torch_games_played', String(gamesPlayed + 1));
    el.style.transition = 'opacity 0.3s';
    el.style.opacity = '0';
    setTimeout(function() {
      setGs(function(s) { return Object.assign({}, s, { screen: 'gameplay' }); });
    }, 300);
  }
  el.onclick = skip;

  // ── AUTO-ADVANCE ──
  setTimeout(function() {
    if (!skipped) skip();
  }, t.auto);

  return el;
}

// ── Helper: build team info block ──
function buildTeamInfo(tm, label, align) {
  var isRight = align === 'right';
  var ta = isRight ? 'text-align:right;' : '';
  var pillBg = label === 'HOME'
    ? 'background:rgba(235,176,16,0.15);color:#EBB010;'
    : 'background:rgba(255,255,255,0.06);color:#777;';

  var schoolName = (tm.school || '').toUpperCase();

  // Auto-scale team name for long names (DOLPHINS = 10 chars)
  var nameLen = (tm.name || '').length;
  var nameFontSize = nameLen <= 5 ? 44 : nameLen <= 7 ? 38 : nameLen <= 9 ? 32 : 26;

  // Flame pips
  var offPips = renderFlamePips(tm.ratings.offense, 5, '#00ff44', 13);
  var defPips = renderFlamePips(tm.ratings.defense, 5, '#4488ff', 13);

  var pipsJustify = isRight ? 'justify-content:flex-end;' : '';
  var pipsRow =
    '<div style="display:flex;align-items:center;gap:14px;margin-top:6px;' + pipsJustify + '">' +
      '<div style="display:flex;align-items:center;gap:4px;">' +
        "<span style=\"font-family:'Rajdhani';font-size:10px;font-weight:600;color:#666;letter-spacing:2px;\">OFF</span>" + offPips +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:4px;">' +
        "<span style=\"font-family:'Rajdhani';font-size:10px;font-weight:600;color:#666;letter-spacing:2px;\">DEF</span>" + defPips +
      '</div>' +
    '</div>';

  return '<div style="' + ta + 'flex:1;min-width:0;">' +
    "<div style=\"display:inline-block;padding:2px 10px;border-radius:3px;font-family:'Rajdhani';font-weight:700;font-size:10px;letter-spacing:3px;" + pillBg + "\">" + label + '</div>' +
    "<div style=\"font-family:'Rajdhani';font-size:12px;color:rgba(255,255,255,0.35);letter-spacing:3px;margin-top:4px;" + ta + "\">" + schoolName + '</div>' +
    "<div style=\"font-family:'Teko';font-weight:900;font-size:" + nameFontSize + "px;color:#fff;letter-spacing:3px;line-height:1;margin-top:-2px;text-shadow:0 2px 12px " + tm.colors.primary + ";" + ta + "\">" + tm.name + '</div>' +
    "<div style=\"font-family:'Teko';font-weight:500;font-size:13px;color:" + tm.accent + ";letter-spacing:4px;opacity:0.9;" + ta + "\">" + tm.offScheme + '</div>' +
    pipsRow +
    '</div>';
}
