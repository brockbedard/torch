/**
 * TORCH — Pregame Screen ("Card Matchup")
 * Two oversized team cards stacked vertically with VS between them.
 * TORCH card design language: dark bg, team-tinted gradient, accent edge, shimmer.
 */

import { gsap } from 'gsap';
import { SND } from '../../engine/sound.js';
import { GS, setGs } from '../../state.js';
import { TEAMS, COUNTER_PLAY } from '../../data/teams.js';
import { renderTeamBadge } from '../../data/teamLogos.js';
import { renderFlamePips } from '../components/cards.js';
import { FLAME_PATH, buildTorchHeader, buildAccentBar } from '../components/brand.js';
import AudioStateManager from '../../engine/audioManager.js';
var WEATHER_TEMP = { clear: '72\u00b0', rain: '58\u00b0', windy: '64\u00b0', snow: '28\u00b0' };
var FIELD_LABEL = { turf: 'TURF', grass: 'GRASS', mud: 'MUD', dome: 'DOME' };

var TEAM_VIBES = {
  sentinels: 'Run-first. Physical. Patient football.',
  wolves: 'Speed kills. Zone read. Ride the current.',
  stags: 'Explosive. Electric. Outscore everyone.',
  serpents: 'Cerebral and methodical. Death by paper cuts.',
};

function injectPregameStyles() {
  if (document.getElementById('pg-anims')) return;
  var s = document.createElement('style');
  s.id = 'pg-anims';
  s.textContent =
    '@keyframes vsGlow{0%,100%{text-shadow:0 0 16px rgba(235,176,16,0.3)}50%{text-shadow:0 0 32px rgba(235,176,16,0.6),0 0 64px rgba(255,69,17,0.2)}}' +
    '@keyframes shimmer{0%,100%{background-position:-200px 0}50%{background-position:200px 0}}' +
    '@keyframes breathe{0%,100%{opacity:0.25}50%{opacity:0.5}}';
  document.head.appendChild(s);
}

export function buildPregame() {
  injectPregameStyles();
  AudioStateManager.setState('pre_game');

  var team = TEAMS[GS.team];
  var opp = TEAMS[GS.opponent];
  if (!team || !opp) { setGs(function(s) { return Object.assign({}, s, { screen: 'roster' }); }); return document.createElement('div'); }

  var conditions = GS.gameConditions || { weather: 'clear', field: 'turf', crowd: 'home' };
  var gamesPlayed = parseInt(localStorage.getItem('torch_games_played') || '0');
  var isFast = gamesPlayed >= 2;
  var speedMult = isFast ? 0.5 : 1;

  // Home/away from crowd
  var isHome = conditions.crowd === 'home';
  var homeTeam = isHome ? team : opp;
  var homeId = isHome ? GS.team : GS.opponent;
  var awayTeam = isHome ? opp : team;
  var awayId = isHome ? GS.opponent : GS.team;
  var awayColor = awayTeam.accent || awayTeam.colors.primary;
  var homeColor = homeTeam.accent || homeTeam.colors.primary;

  // Matchup type
  var cp = COUNTER_PLAY[GS.team] || {};
  var matchupColor, matchupLabel;
  if (cp.strong === GS.opponent) { matchupColor = '#00ff44'; matchupLabel = 'FAVORABLE MATCHUP'; }
  else if (cp.weak === GS.opponent) { matchupColor = '#ff0040'; matchupLabel = 'TOUGH MATCHUP'; }
  else { matchupColor = '#EBB010'; matchupLabel = 'EVEN MATCHUP'; }

  var el = document.createElement('div');
  el.style.cssText = 'height:100vh;height:100dvh;display:flex;flex-direction:column;background:#0A0804;overflow:hidden;position:relative;padding-top:env(safe-area-inset-top,0px);cursor:pointer;';

  // ── 1. TORCH BRAND HEADER ──
  var header = buildTorchHeader('GAME DAY');
  el.appendChild(header);

  // ── 2. CARDS AREA ──
  var cardsArea = document.createElement('div');
  cardsArea.style.cssText = 'flex:1;display:flex;flex-direction:column;padding:8px 14px;gap:8px;min-height:0;';

  // ── 3. AWAY TEAM CARD ──
  var awayCard = buildTeamCard(awayTeam, awayId, awayColor, 'away');
  cardsArea.appendChild(awayCard);

  // ── 4. VS ROW ──
  var vsRow = document.createElement('div');
  vsRow.style.cssText = 'flex-shrink:0;display:flex;align-items:center;padding:0 4px;';

  var vsLineL = document.createElement('div');
  vsLineL.style.cssText = 'flex:1;height:2px;background:linear-gradient(90deg,' + awayColor + '44,#EBB010);';
  var vsText = document.createElement('div');
  vsText.style.cssText = "padding:0 12px;font-family:'Teko';font-weight:900;font-size:36px;letter-spacing:6px;line-height:1;background:linear-gradient(180deg,#FFD060 0%,#EBB010 30%,#8B4A1F 60%,#EBB010 80%,#FFD060 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:vsGlow 2.5s ease-in-out infinite;";
  vsText.textContent = 'VS';
  var vsLineR = document.createElement('div');
  vsLineR.style.cssText = 'flex:1;height:2px;background:linear-gradient(270deg,' + homeColor + '44,#EBB010);';

  vsRow.appendChild(vsLineL);
  vsRow.appendChild(vsText);
  vsRow.appendChild(vsLineR);
  cardsArea.appendChild(vsRow);

  // ── 5. HOME TEAM CARD ──
  var homeCard = buildTeamCard(homeTeam, homeId, homeColor, 'home');
  cardsArea.appendChild(homeCard);

  el.appendChild(cardsArea);

  // ── 6. BOTTOM INFO BAR ──
  var bottomBar = document.createElement('div');
  bottomBar.style.cssText = 'flex-shrink:0;padding:4px 14px 12px;padding-bottom:max(12px,env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;align-items:center;gap:6px;';

  // Matchup + conditions row
  var infoRow = document.createElement('div');
  infoRow.style.cssText = 'display:flex;align-items:center;gap:8px;';

  var matchupEl = document.createElement('span');
  matchupEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:" + matchupColor + ";letter-spacing:1.5px;";
  matchupEl.textContent = matchupLabel;
  infoRow.appendChild(matchupEl);

  var infoDivider = document.createElement('span');
  infoDivider.style.cssText = 'width:1px;height:10px;background:#333;';
  infoRow.appendChild(infoDivider);

  var wxTemp = WEATHER_TEMP[conditions.weather] || '72\u00b0';
  var fieldSurface = FIELD_LABEL[conditions.field] || 'TURF';
  var condEl = document.createElement('span');
  condEl.style.cssText = "font-family:'Rajdhani';font-weight:600;font-size:10px;color:#555;";
  condEl.textContent = wxTemp + ' \u00b7 ' + fieldSurface;
  infoRow.appendChild(condEl);

  bottomBar.appendChild(infoRow);

  // Tap hint
  var tapHint = document.createElement('div');
  tapHint.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:9px;color:#EBB01044;letter-spacing:3px;animation:breathe 2s ease-in-out infinite;";
  tapHint.textContent = 'TAP TO CONTINUE';
  bottomBar.appendChild(tapHint);

  el.appendChild(bottomBar);

  // ── 7. BOTTOM ACCENT BAR ──
  el.appendChild(buildAccentBar(awayColor, homeColor));

  // ── ENTRANCE ANIMATION ──
  header.style.opacity = '0';
  awayCard.style.opacity = '0'; awayCard.style.transform = 'translateX(-30px)';
  vsRow.style.opacity = '0'; vsRow.style.transform = 'scale(2)';
  homeCard.style.opacity = '0'; homeCard.style.transform = 'translateX(30px)';
  bottomBar.style.opacity = '0';

  requestAnimationFrame(function() { requestAnimationFrame(function() {
    try {
      gsap.to(header, { opacity: 1, y: 0, duration: 0.25 * speedMult, ease: 'power2.out' });
      gsap.to(awayCard, { opacity: 1, x: 0, duration: 0.35 * speedMult, ease: 'power2.out', delay: 0.15 * speedMult });
      gsap.to(vsRow, { opacity: 1, scale: 1, duration: 0.3 * speedMult, ease: 'back.out(2)', delay: 0.4 * speedMult });
      gsap.to(homeCard, { opacity: 1, x: 0, duration: 0.35 * speedMult, ease: 'power2.out', delay: 0.5 * speedMult });
      gsap.to(bottomBar, { opacity: 1, duration: 0.2 * speedMult, delay: 0.7 * speedMult });
    } catch(e) {
      header.style.opacity = '1';
      awayCard.style.opacity = '1'; awayCard.style.transform = '';
      vsRow.style.opacity = '1'; vsRow.style.transform = '';
      homeCard.style.opacity = '1'; homeCard.style.transform = '';
      bottomBar.style.opacity = '1';
    }
  }); });

  // ── SOUNDS ──
  SND.whooshIn();
  setTimeout(function() { try { SND.whooshIn(); } catch(e) {} }, isFast ? 300 : 700);

  // ── TAP TO CONTINUE ──
  var skipped = false;
  var canSkip = false;
  setTimeout(function() { canSkip = true; }, isFast ? 1200 : 2500);
  function skip() {
    if (skipped || !canSkip) return;
    skipped = true;
    localStorage.setItem('torch_games_played', String(gamesPlayed + 1));
    el.style.transition = 'opacity 0.3s';
    el.style.opacity = '0';
    setTimeout(function() {
      setGs(function(s) { return Object.assign({}, s, { screen: 'roster' }); });
    }, 300);
  }
  el.onclick = skip;

  // Auto-advance
  setTimeout(function() { if (!skipped) skip(); }, isFast ? 2500 : 6000);

  return el;
}

// ── Build a team card — both cards use same layout (badge left, text right) ──
function buildTeamCard(tm, tmId, accent, side) {
  var isHome = side === 'home';
  var card = document.createElement('div');
  card.style.cssText = 'flex:1;border-radius:8px;border:1.5px solid ' + accent + '44;overflow:hidden;position:relative;display:flex;align-items:center;padding:0 20px;' +
    'background:linear-gradient(170deg,' + accent + '18,' + accent + '08,#0a0804 60%);';

  // Left accent edge (both cards)
  var edge = document.createElement('div');
  edge.style.cssText = 'position:absolute;left:0;top:0;bottom:0;width:3px;background:' + accent + ';';
  card.appendChild(edge);

  // Shimmer
  var shimmer = document.createElement('div');
  shimmer.style.cssText = 'position:absolute;inset:0;pointer-events:none;background:linear-gradient(105deg,transparent 30%,' + accent + '06 48%,transparent 70%);background-size:200px 100%;animation:shimmer 5s ease-in-out infinite;';
  card.appendChild(shimmer);

  // Badge (left, vertically centered)
  var badgeWrap = document.createElement('div');
  badgeWrap.style.cssText = 'flex-shrink:0;position:relative;z-index:1;filter:drop-shadow(0 6px 16px rgba(0,0,0,0.6)) drop-shadow(0 0 20px ' + accent + '33);';
  badgeWrap.innerHTML = renderTeamBadge(tmId, 72);
  card.appendChild(badgeWrap);

  // Info column (right of badge)
  var info = document.createElement('div');
  info.style.cssText = 'flex:1;min-width:0;position:relative;z-index:1;margin-left:16px;';

  var schoolName = (tm.school || '').toUpperCase();
  var label = document.createElement('div');
  label.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:9px;color:rgba(255,255,255,0.25);letter-spacing:3px;";
  label.textContent = (isHome ? 'HOME' : 'AWAY') + ' \u00b7 ' + schoolName;
  info.appendChild(label);

  var nameEl = document.createElement('div');
  nameEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:34px;color:#fff;letter-spacing:3px;line-height:0.85;text-shadow:0 2px 8px rgba(0,0,0,0.8);";
  nameEl.textContent = tm.name;
  info.appendChild(nameEl);

  // Scheme (single line with dot separator) + vibe
  var schemeStr = (tm.offScheme || '').replace(/\s+/g, ' ');
  var vibeStr = TEAM_VIBES[tmId] || tm.vibe || '';

  var infoRow = document.createElement('div');
  infoRow.style.cssText = "font-family:'Rajdhani';font-size:10px;color:rgba(255,255,255,0.35);margin-top:4px;line-height:1.3;";
  infoRow.innerHTML = "<span style=\"font-family:'Oswald';font-weight:700;color:" + accent + ";letter-spacing:1.5px;\">" + schemeStr + "</span>" +
    (vibeStr ? " <span style='color:rgba(255,255,255,0.12);'>\u00b7</span> " + vibeStr : '');
  info.appendChild(infoRow);

  // Ratings row
  var ratingsRow = document.createElement('div');
  ratingsRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-top:6px;';
  ratingsRow.innerHTML =
    '<div style="display:flex;align-items:center;gap:4px;">' +
      "<span style=\"font-family:'Rajdhani';font-weight:600;font-size:9px;color:#888;letter-spacing:1px;\">OFF</span>" +
      renderFlamePips(tm.ratings.offense, 5, '#00ff44', 9) +
    '</div>' +
    '<div style="display:flex;align-items:center;gap:4px;">' +
      "<span style=\"font-family:'Rajdhani';font-weight:600;font-size:9px;color:#888;letter-spacing:1px;\">DEF</span>" +
      renderFlamePips(tm.ratings.defense, 5, '#4DA6FF', 9) +
    '</div>';
  info.appendChild(ratingsRow);

  card.appendChild(info);
  return card;
}
