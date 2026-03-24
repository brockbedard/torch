/**
 * TORCH v0.22.1 — Pregame Sequence ("Banded Clash")
 * Full-screen symmetrical layout: TORCH header → Away band → VS → Home band → Weather card
 * 4.5s display, tap-to-skip, progressive shortening after 5 games.
 */

import { SND } from '../../engine/sound.js';
import { GS, setGs } from '../../state.js';
import { TEAMS } from '../../data/teams.js';
import { renderTeamBadge } from '../../data/teamLogos.js';
import { renderFlamePips } from '../components/cards.js';
import AudioStateManager from '../../engine/audioManager.js';

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
  var isFast = gamesPlayed >= 5;

  // Determine home/away: crowd field tells us
  var isHome = conditions.crowd === 'home';
  var homeTeam = isHome ? team : opp;
  var homeId = isHome ? GS.team : GS.opponent;
  var awayTeam = isHome ? opp : team;
  var awayId = isHome ? GS.opponent : GS.team;

  // Flame SVG path
  var FLAME = 'M22 2C22 2 10 14 9 22C8 30 13 36 17 38C17 38 14 32 17 26C19 22 21 18 22 14C23 18 25 22 27 26C30 32 27 38 27 38C31 36 36 30 35 22C34 14 22 2 22 2Z';

  // ── STYLES ──
  var sty = document.createElement('style');
  sty.textContent =
    '@keyframes pgFlame{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}' +
    '@keyframes pgSlideL{0%{transform:translateX(-100%);opacity:0}100%{transform:translateX(0);opacity:1}}' +
    '@keyframes pgSlideR{0%{transform:translateX(100%);opacity:0}100%{transform:translateX(0);opacity:1}}' +
    '@keyframes pgVsGlow{0%,100%{text-shadow:0 0 20px rgba(255,184,0,0.4),0 0 40px rgba(255,69,17,0.2)}50%{text-shadow:0 0 30px rgba(255,184,0,0.8),0 0 60px rgba(255,69,17,0.4)}}' +
    '@keyframes pgFadeUp{0%{opacity:0;transform:translateY(12px)}100%{opacity:1;transform:translateY(0)}}' +
    '@keyframes pgShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}' +
    '@keyframes pgVsSlam{0%{transform:scale(3);opacity:0}60%{transform:scale(0.9);opacity:1}100%{transform:scale(1)}}';
  el.appendChild(sty);

  // ── BACKGROUND ELEMENTS ──
  var bgGlow = document.createElement('div');
  bgGlow.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:300px;height:300px;background:radial-gradient(circle,rgba(255,69,17,0.10) 0%,rgba(255,184,0,0.04) 40%,transparent 70%);pointer-events:none;z-index:0;';
  el.appendChild(bgGlow);
  var bgLine = document.createElement('div');
  bgLine.style.cssText = 'position:absolute;top:0;bottom:0;left:50%;width:1px;background:linear-gradient(180deg,transparent 5%,rgba(255,184,0,0.08) 25%,rgba(255,69,17,0.12) 50%,rgba(255,184,0,0.08) 75%,transparent 95%);pointer-events:none;z-index:0;';
  el.appendChild(bgLine);

  // ── A) TORCH HEADER ──
  var header = document.createElement('div');
  header.style.cssText = 'flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 0 12px;z-index:1;opacity:0;animation:pgFadeUp 0.6s ease-out both;';
  header.innerHTML =
    '<svg viewBox="0 0 44 44" width="36" height="44" fill="none" style="animation:pgFlame 2s ease-in-out infinite;"><defs><linearGradient id="pgf" x1="22" y1="40" x2="22" y2="0"><stop offset="0%" stop-color="#FF4511"/><stop offset="100%" stop-color="#FFB800"/></linearGradient></defs><path d="' + FLAME + '" fill="url(#pgf)"/></svg>' +
    "<div style=\"font-family:'Teko';font-weight:700;font-size:16px;color:#FFB800;letter-spacing:10px;margin-top:6px;\">GAME DAY</div>" +
    "<div style=\"font-family:'Teko';font-size:11px;color:#FF6B00;letter-spacing:6px;opacity:0.7;\">TORCH FOOTBALL</div>";
  el.appendChild(header);

  // ── B) AWAY TEAM BAND ──
  var awayBand = document.createElement('div');
  var ad = isFast ? '0.2s' : '0.5s';
  var awayDelay = isFast ? '0.1s' : '0.4s';
  awayBand.style.cssText = 'flex-shrink:0;display:flex;align-items:center;gap:14px;padding:20px 22px;border-left:5px solid ' + awayTeam.accent + ';z-index:1;' +
    'background:linear-gradient(90deg,' + awayTeam.colors.primary + ' 0%,' + awayTeam.colors.primary + '80 85%,transparent 100%);' +
    'opacity:0;animation:pgSlideL ' + ad + ' ease-out ' + awayDelay + ' both;';
  awayBand.innerHTML = renderTeamBadge(awayId, 72) + buildTeamInfo(awayTeam, 'AWAY', 'left');
  el.appendChild(awayBand);

  // ── C) VS COLLISION ZONE ──
  var vsZone = document.createElement('div');
  var vsDelay = isFast ? '0.3s' : '0.8s';
  vsZone.style.cssText = 'flex-shrink:0;display:flex;align-items:center;justify-content:center;gap:12px;padding:16px 24px;z-index:1;' +
    'background:linear-gradient(90deg,transparent 5%,rgba(255,69,17,0.06) 50%,transparent 95%);' +
    'opacity:0;animation:pgFadeUp 0.4s ease-out ' + vsDelay + ' both;';
  vsZone.innerHTML =
    '<div style="flex:1;height:3px;background:linear-gradient(90deg,#FF4511,#FFB800);border-radius:2px;"></div>' +
    "<div style=\"font-family:'Teko';font-weight:900;font-size:56px;color:#fff;-webkit-text-stroke:2px #FFB800;letter-spacing:4px;line-height:1;animation:pgVsGlow 2.5s ease-in-out infinite;\">VS</div>" +
    '<div style="flex:1;height:3px;background:linear-gradient(90deg,#FFB800,#FF4511);border-radius:2px;"></div>';
  el.appendChild(vsZone);

  // ── D) HOME TEAM BAND ──
  var homeBand = document.createElement('div');
  var homeDelay = isFast ? '0.2s' : '0.6s';
  homeBand.style.cssText = 'flex-shrink:0;display:flex;align-items:center;gap:14px;padding:20px 22px;border-right:5px solid ' + homeTeam.accent + ';z-index:1;' +
    'background:linear-gradient(270deg,' + homeTeam.colors.primary + ' 0%,' + homeTeam.colors.primary + '80 85%,transparent 100%);' +
    'justify-content:flex-end;' +
    'opacity:0;animation:pgSlideR ' + ad + ' ease-out ' + homeDelay + ' both;';
  homeBand.innerHTML = buildTeamInfo(homeTeam, 'HOME', 'right') + renderTeamBadge(homeId, 72);
  el.appendChild(homeBand);

  // ── E) WEATHER / CONDITIONS CARD ──
  var weatherWrap = document.createElement('div');
  var wxDelay = isFast ? '0.4s' : '1.2s';
  weatherWrap.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:1;padding:16px 24px;opacity:0;animation:pgFadeUp 0.5s ease-out ' + wxDelay + ' both;';

  var wxIcon = WEATHER_ICON[conditions.weather] || '☀️';
  var wxName = (conditions.weather || 'clear').toUpperCase();
  var wxTemp = WEATHER_TEMP[conditions.weather] || '72°';
  var fieldSurface = FIELD_LABEL[conditions.field] || (conditions.field || 'TURF').toUpperCase();

  var wxCard = document.createElement('div');
  wxCard.style.cssText = 'display:flex;align-items:center;border-radius:14px;background:rgba(255,184,0,0.04);border:1px solid #2a2a2a;padding:14px 0;width:100%;max-width:320px;';
  wxCard.innerHTML =
    // Column 1: Weather
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">' +
      '<div style="font-size:28px;line-height:1;">' + wxIcon + '</div>' +
      "<div style=\"font-family:'Teko';font-size:14px;color:#FFB800;letter-spacing:2px;\">" + wxName + '</div>' +
    '</div>' +
    // Divider
    '<div style="width:1px;height:40px;background:#2a2a2a;"></div>' +
    // Column 2: Temperature
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">' +
      "<div style=\"font-family:'Teko';font-weight:700;font-size:28px;color:#fff;\">" + wxTemp + '</div>' +
      "<div style=\"font-family:'Rajdhani';font-size:10px;color:#555;letter-spacing:3px;\">TEMPERATURE</div>" +
    '</div>' +
    // Divider
    '<div style="width:1px;height:40px;background:#2a2a2a;"></div>' +
    // Column 3: Surface
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">' +
      "<div style=\"font-family:'Teko';font-size:24px;color:#888;\">" + fieldSurface + '</div>' +
      "<div style=\"font-family:'Rajdhani';font-size:10px;color:#555;letter-spacing:3px;\">SURFACE</div>" +
    '</div>';
  weatherWrap.appendChild(wxCard);

  // Shimmer bar
  var shimmer = document.createElement('div');
  shimmer.style.cssText = 'width:80%;height:2px;margin-top:16px;border-radius:1px;background:linear-gradient(90deg,#FF4511,#FFB800,#FF4511);background-size:200% 100%;animation:pgShimmer 3s linear infinite;';
  weatherWrap.appendChild(shimmer);
  el.appendChild(weatherWrap);

  // ── SOUNDS ──
  SND.click();
  setTimeout(function() { SND.hit(); }, isFast ? 300 : 800);

  // ── TAP TO SKIP ──
  var skipped = false;
  function skip() {
    if (skipped) return;
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
  }, isFast ? 2500 : 4500);

  return el;
}

// ── Helper: build team info block ──
function buildTeamInfo(t, label, align) {
  var isRight = align === 'right';
  var ta = isRight ? 'text-align:right;' : '';
  var pillBg = label === 'HOME' ? 'background:rgba(255,184,0,0.2);color:#FFB800;' : 'background:rgba(255,255,255,0.08);color:#888;';

  // School name without mascot — use school field
  var schoolName = (t.school || '').toUpperCase();

  // Flame pips
  var offPips = renderFlamePips(t.ratings.offense, 5, '#00ff44', 13);
  var defPips = renderFlamePips(t.ratings.defense, 5, '#4488ff', 13);

  var pipsRow = isRight
    ? '<div style="display:flex;align-items:center;gap:16px;justify-content:flex-end;margin-top:4px;">' +
        "<span style=\"font-family:'Rajdhani';font-size:10px;color:#888;letter-spacing:1px;\">DEF</span>" + defPips +
        "<span style=\"font-family:'Rajdhani';font-size:10px;color:#888;letter-spacing:1px;margin-left:4px;\">OFF</span>" + offPips +
      '</div>'
    : '<div style="display:flex;align-items:center;gap:16px;margin-top:4px;">' +
        "<span style=\"font-family:'Rajdhani';font-size:10px;color:#888;letter-spacing:1px;\">OFF</span>" + offPips +
        "<span style=\"font-family:'Rajdhani';font-size:10px;color:#888;letter-spacing:1px;margin-left:4px;\">DEF</span>" + defPips +
      '</div>';

  return '<div style="' + ta + 'flex:1;min-width:0;">' +
    "<div style=\"display:inline-block;padding:2px 8px;border-radius:3px;font-family:'Rajdhani';font-weight:700;font-size:10px;letter-spacing:2px;" + pillBg + "\">" + label + '</div>' +
    "<div style=\"font-family:'Rajdhani';font-size:12px;color:rgba(255,255,255,0.45);letter-spacing:2px;margin-top:4px;" + ta + "\">" + schoolName + '</div>' +
    "<div style=\"font-family:'Teko';font-weight:700;font-size:38px;color:#fff;letter-spacing:2px;line-height:1;text-shadow:0 2px 8px " + t.colors.primary + ";" + ta + "\">" + t.name + '</div>' +
    "<div style=\"font-family:'Teko';font-size:13px;color:" + t.accent + ";letter-spacing:3px;" + ta + "\">" + t.offScheme + '</div>' +
    pipsRow +
    '</div>';
}
