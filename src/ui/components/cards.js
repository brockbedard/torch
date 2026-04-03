/**
 * TORCH v0.21 — Shared Card Components
 * Single source of truth for all card visuals.
 * Card backs, Madden-style player cards, play cards, torch cards,
 * team helmets, flame pip ratings.
 */

import { gsap } from 'gsap';
import { TEAMS } from '../../data/teams.js';
import { renderTorchCardIcon, TORCH_CARD_ICONS } from '../../data/torchCardIcons.js';
import { CATEGORY_COLORS, TIER_COLORS } from '../../data/torchCards.js';
import { attachDetailListeners } from './detailTooltip.js';

// renderTeamBadge removed — player cards no longer use team badges

// ====== CARD ANIMATIONS (inject once) ======
var _stylesInjected = false;
export function injectCardStyles() {
  if (_stylesInjected) return;
  _stylesInjected = true;
  var s = document.createElement('style');
  s.id = 'shared-card-styles';
  s.textContent =
    '@keyframes flipSnap { 0%{transform:rotateY(0)} 50%{transform:rotateY(90deg)} 51%{transform:rotateY(90deg)} 100%{transform:rotateY(180deg)} }' +
    '@keyframes dealSlide { 0%{opacity:0;transform:translateX(-120px) rotate(-18deg) scale(0.5)} 70%{opacity:1;transform:translateX(5px) rotate(1deg) scale(1.02)} 100%{transform:translateX(0) rotate(0deg) scale(1)} }' +
    '@keyframes dealMulti { 0%{opacity:0;transform:translateY(-60px) scale(0.6)} 50%{opacity:1;transform:translateY(4px) scale(1.02)} 100%{opacity:1;transform:translateY(0) scale(1)} }';
  document.head.appendChild(s);
}

// ====== CARD BACK — Unified TORCH Brand Design ======

var _uid = 0;
export var FLAME_PATH = 'M22 2C22 2 10 14 9 22C8 30 13 36 17 38C17 38 14 32 17 26C19 22 21 18 22 14C23 18 25 22 27 26C30 32 27 38 27 38C31 36 36 30 35 22C34 14 22 2 22 2Z';

// Inject card back keyframes once
var _cardBackStylesInjected = false;
function injectCardBackStyles() {
  if (_cardBackStylesInjected) return;
  _cardBackStylesInjected = true;
  var s = document.createElement('style');
  s.textContent =
    '@keyframes emblemGlow{0%,100%{filter:drop-shadow(0 0 4px rgba(255,255,255,0.1))}50%{filter:drop-shadow(0 0 8px rgba(255,255,255,0.3))}}' +
    '@keyframes breathe{0%,100%{opacity:0.12}50%{opacity:0.25}}' +
    '@keyframes spark{0%{opacity:0;transform:translateY(0)}20%{opacity:1}100%{opacity:0;transform:translateY(-30px) translateX(5px)}}';
  document.head.appendChild(s);
}

function cornerPip(accent, size, top, left, right, bottom) {
  var style = 'position:absolute;';
  if (top !== null) style += 'top:' + top + ';';
  if (bottom !== null) style += 'bottom:' + bottom + ';';
  if (left !== null) style += 'left:' + left + ';';
  if (right !== null) style += 'right:' + right + ';';
  return '<div style="' + style + '"><svg viewBox="0 0 44 56" width="' + size + '" fill="' + accent + '"><path d="' + FLAME_PATH + '"/></svg></div>';
}

export function buildHomeCard(type, w, h) {
  injectCardBackStyles();
  injectShimmer(); // reuse from player card
  var isTorch = type === 'torch';
  var isOff = type === 'offense';
  var sc = w / 100;

  var accent = isTorch ? '#FF4511' : isOff ? '#44dd66' : '#4DA6FF';
  var label = isOff ? 'OFFENSE' : type === 'defense' ? 'DEFENSE' : null;

  // Outer wrapper — TORCH gets gold frame
  var outer = document.createElement('div');
  if (isTorch) {
    var fp = Math.max(2, Math.round(4 * sc));
    outer.style.cssText = 'position:relative;width:' + (w + fp * 2) + 'px;height:' + (h + fp * 2) + 'px;border-radius:' + Math.round(12 * sc) + 'px;background:linear-gradient(135deg,#EBB010,#fff,#EBB010);padding:' + fp + 'px;box-shadow:0 0 ' + Math.round(20 * sc) + 'px rgba(235,176,16,0.35),0 4px 16px rgba(0,0,0,0.5);';
  } else {
    outer.style.cssText = 'position:relative;width:' + w + 'px;height:' + h + 'px;';
  }

  // Card inner
  var card = document.createElement('div');
  card.className = 'torch-card-inner';
  var bg = isTorch
    ? 'linear-gradient(170deg,#FF451130 0%,#EBB01010 25%,#0a0804 50%,#FF45110a 100%)'
    : 'linear-gradient(170deg,' + accent + '18 0%,#0a0804 50%,' + accent + '0a 100%)';
  var shadow = isTorch
    ? '0 0 24px rgba(255,69,17,0.2),0 4px 16px rgba(0,0,0,0.5)'
    : '0 4px 16px rgba(0,0,0,0.5)';
  card.style.cssText = 'position:absolute;width:' + w + 'px;height:' + h + 'px;border-radius:8px;border:2px solid ' + accent + (isTorch ? '66' : '44') + ';background:' + bg + ';box-shadow:' + shadow + ';overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;';

  // Breathing glow (torch only)
  if (isTorch) {
    var glow = document.createElement('div');
    glow.style.cssText = 'position:absolute;inset:-6px;border-radius:14px;background:#FF4511;filter:blur(10px);opacity:0.12;z-index:-1;pointer-events:none;animation:breathe 3s ease-in-out infinite;';
    card.appendChild(glow);
  }

  // Corner flame pips
  var pipSz = Math.round((isTorch ? 18 : 15) * sc);
  var pipOp = isTorch ? '0.08' : '0.05';
  var pipsHtml =
    '<div style="position:absolute;inset:0;pointer-events:none;opacity:' + pipOp + ';">' +
    cornerPip(accent, pipSz, '6px', '7px', null, null) +
    cornerPip(accent, pipSz, '6px', null, '7px', null) +
    cornerPip(accent, pipSz, null, '7px', null, '6px') +
    cornerPip(accent, pipSz, null, null, '7px', '6px') +
    '</div>';
  var pipsEl = document.createElement('div');
  pipsEl.innerHTML = pipsHtml;
  card.appendChild(pipsEl.firstChild);

  // Center flame emblem
  var embW = Math.round((isTorch ? 70 : 32) * sc);
  var embH = Math.round((isTorch ? 80 : 38) * sc);
  var embOp = isTorch ? '0.85' : '0.6';
  var embGlow = isTorch ? 'drop-shadow(0 0 12px #FF451188)' : 'drop-shadow(0 0 8px ' + accent + '55)';
  var emblem = document.createElement('div');
  emblem.style.cssText = 'z-index:2;animation:emblemGlow 3s ease-in-out infinite;';
  emblem.innerHTML = '<svg viewBox="0 0 44 56" width="' + embW + '" height="' + embH + '" fill="' + accent + '" style="opacity:' + embOp + ';filter:' + embGlow + ';"><path d="' + FLAME_PATH + '"/></svg>';
  card.appendChild(emblem);

  // "TORCH" text
  var torchText = document.createElement('div');
  if (isTorch) {
    torchText.style.cssText = "font-family:'Teko';font-weight:700;font-size:" + Math.round(16 * sc) + "px;letter-spacing:4px;margin-top:-4px;opacity:0.7;z-index:2;background:linear-gradient(180deg,#FFD060,#FF4511);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;";
  } else {
    torchText.style.cssText = "font-family:'Teko';font-weight:700;font-size:" + Math.round(14 * sc) + "px;color:" + accent + ";letter-spacing:4px;margin-top:4px;opacity:0.4;z-index:2;";
  }
  torchText.textContent = 'TORCH';
  card.appendChild(torchText);

  // Type label (offense/defense only)
  if (label) {
    var typeLabel = document.createElement('div');
    typeLabel.style.cssText = "font-family:'Rajdhani';font-weight:600;font-size:" + Math.round(8 * sc) + "px;color:" + accent + ";letter-spacing:1.5px;opacity:0.3;z-index:2;margin-top:1px;";
    typeLabel.textContent = label;
    card.appendChild(typeLabel);
  }

  // Shimmer sweep
  var shimColor1 = isTorch ? 'rgba(255,180,80,0.1)' : 'rgba(255,255,255,0.06)';
  var shimColor2 = isTorch ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)';
  var shimDur = isTorch ? '4' : '5';
  var shim = document.createElement('div');
  shim.style.cssText = 'position:absolute;inset:0;border-radius:6px;pointer-events:none;z-index:8;background:linear-gradient(105deg,transparent 35%,' + shimColor1 + ' 48%,' + shimColor2 + ' 52%,transparent 65%);background-size:200px 100%;animation:cardShimmer ' + shimDur + 's ease-in-out infinite;';
  card.appendChild(shim);

  // Ember sparks (torch only)
  if (isTorch) {
    for (var si = 0; si < 5; si++) {
      var spark = document.createElement('div');
      spark.style.cssText = 'position:absolute;top:15px;left:' + (20 + Math.random() * 60) + '%;width:2px;height:2px;border-radius:50%;background:#FF8C00;z-index:9;pointer-events:none;opacity:0;animation:spark ' + (1.2 + Math.random() * 1.5) + 's ' + (Math.random() * 3) + 's ease-out infinite;';
      card.appendChild(spark);
    }
  }

  outer.appendChild(card);
  return outer;
}

// ====== PLAYER CARD — Madden Style (v0.21: badge replaces OVR) ======
var POS_NAMES = {QB:'QB',WR:'WR',RB:'RB',FB:'FB',TE:'TE',SLOT:'SLOT',SB:'SB',OL:'OL',
  CB:'CB',S:'S',LB:'LB',DL:'DL',DE:'DE',EDGE:'EDGE'};

// Helmet SVG shell path (reused across all teams)
var HELMET_PATH = 'M214.67 410.6c-14.73-1.18-28.57-6.54-42.64-11.99-25.84-10-52.68-20.39-81.81 4.8-5.1 4.41-12.82 3.85-17.24-1.25l-.81-1.04c-12.22-16.33-23.15-33.53-32.57-51.2-9.54-17.9-17.53-36.25-23.76-54.66-2.2-6.51-4.16-12.94-5.88-19.27C-5.5 218.91-3.09 163.75 18.1 117.61 39.44 71.12 79.58 34.13 139.37 13.89c5.45-1.85 11.01-3.55 16.65-5.08 52.22-14.14 109.49-11.57 157.51 9.95 43.22 19.37 78.9 53.94 96.85 105.29 2.02 5.82-.61 12.14-5.94 14.88-40.41 22.46-66.27 38.89-82.33 53.19l2.36 7.35v.05c6.51 20.34 13.65 42.65 22.23 63.66 16.25-6.42 32-13.62 47.07-21.33 18.65-9.55 36.55-20.02 53.33-30.86 5.1-3.27 11.89-1.79 15.16 3.31.39.6.72 1.24.97 1.88l47.89 111.61c2.04 4.79.41 10.22-3.63 13.16-14.42 11.8-29.24 20-44.13 24.67-15.62 4.89-31.33 5.92-46.8 3.12-19.86-3.58-36.19-14.08-49.89-28.82-20.42 6.63-40.86 11.65-59.62 14.43-4.39 10.72-11.18 20.58-19.66 28.96-13.84 13.67-32.34 23.48-52.39 26.55a88.224 88.224 0 0 1-20.33.74zm-5.19-119.43c15.25 0 27.6 12.36 27.6 27.6 0 15.25-12.35 27.6-27.6 27.6-15.24 0-27.6-12.35-27.6-27.6 0-15.24 12.36-27.6 27.6-27.6zM430 348.27l-13.38-27.88c-7.45 3.44-15.09 6.71-22.83 9.77l-4.08 1.59c9.07 7.9 19.23 13.36 30.71 15.43 3.17.57 6.37.94 9.58 1.09zm-22.89-47.69-15.86-33.03c-11.63 5.61-23.54 10.88-35.65 15.69 5.47 11.3 11.5 21.83 18.24 30.98 3.98-1.44 7.94-2.94 11.88-4.5a441.89 441.89 0 0 0 21.39-9.14zm3.69-42.91 15.95 33.21c13.14-6.98 25.12-14.42 35.2-22.05l-13.93-32.46a632.569 632.569 0 0 1-37.22 21.3zm25.46 53.03 16.82 35.04c1.25-.33 2.5-.69 3.75-1.08 10.26-3.21 20.57-8.55 30.79-16.02l-16.78-39.09c-10.24 7.35-21.96 14.47-34.58 21.15zm-130.93-99.16c-10.71 18.13-7.02 35.74-1.3 63.05l.62 2.94 2.22-.64a429.55 429.55 0 0 0 19.26-6.13c-7.98-19.65-14.68-40.11-20.8-59.22zm3.63 87.55c1.01 5.45 2 11.14 2.91 17.1.77 5.03.96 10.07.63 15.04 12.68-2.31 26.09-5.64 39.67-9.77-6.34-9.4-12.02-19.72-17.19-30.55-7.23 2.5-14.57 4.86-22.01 7.03l-4.01 1.15zm-30.49 56.97c-4.35.29-8.67.52-12.47.65-3.79.12-6.98-2.82-7.19-6.6-.92-16.66-2.73-33.15-4.47-49.06-3.86-35.28-7.44-67.91-.7-95.91 4.65-19.3 20.43-38.98 40.59-56.85 22.96-20.37 51.8-38.64 75.92-51.17-16.8-25.63-40.05-44.15-66.59-56.05-42.76-19.16-94.13-21.36-141.22-8.6-5.26 1.42-10.31 2.96-15.12 4.59C94.25 55 58.89 87.32 40.32 127.77c-18.74 40.8-20.7 90.24-6.7 141.9 1.61 5.95 3.42 11.87 5.4 17.74 5.86 17.31 13.3 34.44 22.13 51.02 7 13.13 14.89 25.98 23.58 38.38 35.7-24.37 66.43-12.48 96.12-.99 12.3 4.76 24.4 9.45 35.74 10.36 4.97.39 9.93.19 14.77-.55 14.85-2.28 28.58-9.58 38.88-19.75 3.08-3.04 5.85-6.34 8.23-9.82z';

// Compute tier from OVR (spec: star 80-84, starter 76-78, reserve 72-74)
function playerTier(ovr) {
  if (ovr >= 80) return 'star';
  if (ovr >= 76) return 'starter';
  return 'reserve';
}

// Tier border colors
function tierBorderStyle(tier, isStar, teamColor) {
  if (isStar) return '2px solid #EBB010';
  if (tier === 'star') return '2px solid #EBB010';
  if (tier === 'starter') return '2px solid ' + (teamColor || '#aaa');
  return '1px solid ' + (teamColor ? teamColor + '80' : '#aaa80');
}

// Tier glow color for helmet/badge
function tierColor(tier, isStar) {
  if (isStar || tier === 'star') return '#EBB010';
  if (tier === 'starter') return '#B0C4D4';
  return '#A0522D';
}

// Render team-colored helmet SVG — confident illustration style
export function teamHelmetSvg(teamId, size) {
  size = size || 48;
  var team = TEAMS[teamId];
  var baseColor = team ? team.helmet.base : '#888';
  var fmColor = team ? team.helmet.facemask : '#ccc';
  var stripeColor = team ? team.helmet.stripe : '#888';
  return '<svg viewBox="0 0 512 411" width="' + size + '" height="' + Math.round(size * 0.8) + '" fill="none" style="filter:drop-shadow(2px 3px 4px rgba(0,0,0,0.6));">'
    // Semi-transparent filled background for visual weight
    + '<path fill="' + baseColor + '" fill-rule="nonzero" d="' + HELMET_PATH + '"/>'
    // Darker edge stroke for definition
    + '<path fill="none" stroke="' + baseColor + '" stroke-width="6" stroke-opacity="0.4" fill-rule="nonzero" d="' + HELMET_PATH + '"/>'
    // Highlight edge (top-left light catch)
    + '<path fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="3" fill-rule="nonzero" d="' + HELMET_PATH + '" style="clip-path:inset(0 50% 50% 0);"/>'
    // Facemask bars — thicker, team accent color
    + '<rect x="375" y="232" width="95" height="12" rx="6" fill="' + fmColor + '" opacity="0.8"/>'
    + '<rect x="375" y="260" width="85" height="12" rx="6" fill="' + fmColor + '" opacity="0.8"/>'
    + '<rect x="380" y="288" width="70" height="10" rx="5" fill="' + fmColor + '" opacity="0.6"/>'
    // Center stripe
    + '<rect x="195" y="25" width="22" height="130" rx="6" fill="' + stripeColor + '" opacity="0.6"/>'
    + '</svg>';
}

// Position color map
var POS_COLORS = {
  QB:'#EBB010', WR:'#00ff44', SLOT:'#44dd66', RB:'#FF6B00', FB:'#FF6B00',
  SB:'#FF6B00', TE:'#22aa44', OL:'#888888',
  LB:'#ff4444', CB:'#4488ff', S:'#44ddff', DL:'#cc4444', DE:'#cc4444',
  EDGE:'#ff4444', NB:'#6688ff'
};

// Side-of-ball colors
var OFF_POSITIONS = ['QB','WR','SLOT','RB','FB','SB','TE','OL'];
var SIDE_COLORS = { offense: '#00ff44', defense: '#4DA6FF' };
function getSideColor(pos) { return OFF_POSITIONS.indexOf(pos) >= 0 ? SIDE_COLORS.offense : SIDE_COLORS.defense; }

// Trait synergy colors
var SYNERGY_COLORS = {
  'TRUCK STICK':'#FF6B00','POWER BACK':'#FF6B00','ROAD GRADER':'#FF6B00',
  'BRICK WALL':'#FF6B00','ANCHOR':'#FF6B00','TACKLER':'#FF6B00',
  'RUN STUFFER':'#FF6B00','RUN SUPPORT':'#FF6B00','ENFORCER':'#FF6B00',
  'INTERIOR BULL':'#FF6B00',
  'BURNER':'#00ff44','ELUSIVE':'#00ff44','YAC BEAST':'#00ff44',
  'ESCAPE ARTIST':'#00ff44','EDGE SPEED':'#00ff44','PASS RUSHER':'#00ff44',
  'BLITZ SPECIALIST':'#00ff44',
  'ROUTE IQ':'#4488ff','SURE HANDS':'#4488ff','CONTESTED CATCH':'#4488ff',
  'PASS CATCHER':'#4488ff','MISMATCH':'#4488ff','QUICK RELEASE':'#4488ff',
  'DEEP BALL':'#4488ff','PLAY ACTION PRO':'#4488ff',
  'SHUTDOWN':'#9955cc','PRESS CORNER':'#9955cc','ZONE READER':'#9955cc',
  'BALL HAWK':'#9955cc','CENTERFIELDER':'#9955cc','COVERAGE LB':'#9955cc',
};

// Inject shimmer keyframe once
var _shimmerInjected = false;
function injectShimmer() {
  if (_shimmerInjected) return;
  _shimmerInjected = true;
  var s = document.createElement('style');
  s.textContent =
    '@keyframes cardShimmer{0%,100%{background-position:-200px 0}50%{background-position:200px 0}}' +
    '@keyframes goldPulse{0%,100%{box-shadow:0 0 8px #FFB80033,0 4px 12px rgba(0,0,0,0.5)}50%{box-shadow:0 0 20px #FFB80055,0 0 36px #FFB80022,0 4px 12px rgba(0,0,0,0.5)}}' +
    '@keyframes silverShimmer{0%,100%{box-shadow:0 0 6px rgba(192,192,192,0.15),0 4px 12px rgba(0,0,0,0.5)}50%{box-shadow:0 0 14px rgba(192,192,192,0.3),0 4px 12px rgba(0,0,0,0.5)}}' +
    '@keyframes tcShimmer{0%,100%{background-position:-150px 0}50%{background-position:150px 0}}';
  document.head.appendChild(s);
}

export function buildMaddenPlayer(p, w, h) {
  injectShimmer();
  var stars = p.stars || (p.isStar ? 4 : 3);
  var trait = p.trait || '';
  var teamColor = p.teamColor || '#FF4511';
  var sideColor = getSideColor(p.pos);
  var traitColor = SYNERGY_COLORS[trait] || '#aaa';
  var fullPos = POS_NAMES[p.pos] || p.pos;
  var card = document.createElement('div');

  // Container
  var borderStyle, bgStyle, shadowStyle;
  if (p.isStar) {
    borderStyle = '2px solid #EBB010';
    bgStyle = 'linear-gradient(170deg,#EBB01025 0%,#EBB01012 20%,' + teamColor + '10 45%,#0a0804 75%)';
    shadowStyle = '0 0 8px rgba(235,176,16,0.4),0 0 24px rgba(235,176,16,0.2),0 0 48px rgba(235,176,16,0.1),0 2px 8px rgba(0,0,0,0.5)';
  } else {
    borderStyle = '1.5px solid ' + teamColor + '66';
    bgStyle = 'linear-gradient(170deg,' + teamColor + '30 0%,' + teamColor + '12 35%,#0a0804 75%)';
    shadowStyle = '0 2px 8px rgba(0,0,0,0.5)';
  }
  card.style.cssText = 'width:'+w+'px;height:'+h+'px;border-radius:8px;border:'+borderStyle+';border-top:2px solid '+sideColor+';background:'+bgStyle+';overflow:hidden;box-shadow:'+shadowStyle+';display:flex;flex-direction:column;position:relative;';

  // Shimmer overlay
  var shimmer = document.createElement('div');
  shimmer.style.cssText = 'position:absolute;inset:0;border-radius:8px;pointer-events:none;z-index:10;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,0.06) 48%,rgba(255,255,255,0.02) 52%,transparent 65%);background-size:200px 100%;animation:cardShimmer 4s ease-in-out infinite;';
  card.appendChild(shimmer);

  // Header row: position + number
  var header = document.createElement('div');
  header.style.cssText = 'display:flex;justify-content:space-between;align-items:baseline;padding:5px 7px 0;flex-shrink:0;';
  header.innerHTML =
    "<div style=\"font-family:'Oswald',sans-serif;font-weight:700;font-size:14px;color:" + sideColor + ";line-height:1;\">" + fullPos + "</div>" +
    "<div style=\"font-family:'Teko',sans-serif;font-weight:700;font-size:24px;line-height:0.85;background:linear-gradient(180deg,#fff 0%," + teamColor + " 40%,#fff 80%," + teamColor + " 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;\">#" + (p.num || '') + "</div>";
  card.appendChild(header);

  // Center group: name + stars + trait
  var center = document.createElement('div');
  center.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 5px 10px;gap:4px;';

  // Name (auto-shrink)
  var nameLen = (p.name || '').length;
  var nameFs = nameLen > 9 ? 11 : nameLen > 7 ? 12 : 14;
  var nameEl = document.createElement('div');
  nameEl.style.cssText = "font-family:'Oswald',sans-serif;font-weight:700;font-size:" + nameFs + "px;color:#fff;line-height:1;letter-spacing:0.5px;text-transform:uppercase;white-space:nowrap;";
  nameEl.textContent = p.name || '';
  center.appendChild(nameEl);

  // Stars (flame pips with outline empties)
  var pipsEl = document.createElement('div');
  pipsEl.style.cssText = 'display:flex;gap:2px;';
  pipsEl.innerHTML = renderFlamePips(stars, 5, '#EBB010', 8);
  center.appendChild(pipsEl);

  // Trait badge
  if (trait) {
    var traitLen = trait.length;
    var traitFs = traitLen > 14 ? 9 : traitLen > 10 ? 10 : 11;
    var traitEl = document.createElement('div');
    traitEl.style.cssText = "border-radius:2px;padding:2px 5px;display:flex;align-items:center;justify-content:center;white-space:nowrap;background:" + traitColor + "14;border:1px solid " + traitColor + "33;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:" + traitFs + "px;color:" + traitColor + ";letter-spacing:0.5px;line-height:1;";
    traitEl.textContent = trait;
    center.appendChild(traitEl);
  }

  card.appendChild(center);

  // Stats bar (always renders)
  var statsBar = document.createElement('div');
  statsBar.style.cssText = 'background:linear-gradient(90deg,' + teamColor + 'cc,' + teamColor + '88);border-top:1px solid ' + teamColor + ';padding:6px 5px;flex-shrink:0;border-radius:0 0 6px 6px;min-height:24px;';
  statsBar.className = 'player-stats-bar';
  card.appendChild(statsBar);

  return card;
}

// ====== FLAME PIP RATING ======
var FLAME_PIP_PATH = 'M6 0C6 0 2 5 1.5 8C1 11 3 13.5 5 14.5C5 14.5 3.5 11 5 8C5.5 6.5 6 5 6 3.5C6 5 6.5 6.5 7 8C8.5 11 7 14.5 7 14.5C9 13.5 11 11 10.5 8C10 5 6 0 6 0Z';

// Renders a row of flame pips (e.g., 4 out of 5 filled)
// Returns an HTML string
export function renderFlamePips(filled, total, filledColor, size) {
  total = total || 5;
  filledColor = filledColor || '#EBB010';
  size = size || 10;
  var h = Math.round(size * 1.3);
  var html = '';
  for (var i = 0; i < total; i++) {
    if (i < filled) {
      html += '<svg viewBox="0 0 12 16" width="' + size + '" height="' + h + '" style="margin-right:1px;"><path d="' + FLAME_PIP_PATH + '" fill="' + filledColor + '"/></svg>';
    } else {
      html += '<svg viewBox="0 0 12 16" width="' + size + '" height="' + h + '" style="margin-right:1px;opacity:0.4;"><path d="' + FLAME_PIP_PATH + '" fill="none" stroke="' + filledColor + '" stroke-width="1.2"/></svg>';
    }
  }
  return html;
}

// ====== PLAY CARD — Redesigned with accent color system ======

var PLAY_COLORS = {
  offPass: '#44dd66', offRun: '#FF4511',
  defZone: '#4DA6FF', defBlitz: '#FF4466', defTrap: '#AA66DD',
};

// Inject edge sweep keyframe once
var _edgeSweepInjected = false;
function injectEdgeSweep() {
  if (_edgeSweepInjected) return;
  _edgeSweepInjected = true;
  var s = document.createElement('style');
  s.textContent = '@keyframes edgeSweep{0%{background-position:-100% 0}100%{background-position:200% 0}}';
  document.head.appendChild(s);
}

function getPlayAccent(typeKey, isRun) {
  var defMap = { ZONE: PLAY_COLORS.defZone, BLITZ: PLAY_COLORS.defBlitz, TRAP: PLAY_COLORS.defTrap };
  if (defMap[typeKey]) return defMap[typeKey];
  return isRun ? PLAY_COLORS.offRun : PLAY_COLORS.offPass;
}

export function buildPlayV1(p, w, h) {
  injectEdgeSweep();
  var card = document.createElement('div');
  var typeKey = p.playType || p.cardType || p.cat || 'RUN';
  if (typeKey.indexOf(' ') >= 0) typeKey = typeKey.split(' ')[0];
  var isRun = p.isRun === true;
  var accent = getPlayAccent(typeKey, isRun);
  var sub = p.sub || (isRun ? 'RUN' : 'PASS');
  var strength = p.strength || '';
  var riskWord = p.risk === 'high' ? 'RISKY' : p.risk === 'med' ? 'BALANCED' : 'SAFE';
  var riskColor = p.risk === 'high' ? '#ff0040' : p.risk === 'med' ? '#EBB010' : '#00ff44';

  // Container
  card.style.cssText = 'width:'+w+'px;height:'+h+'px;border-radius:8px;border:1.5px solid '+accent+'55;background:linear-gradient(170deg,'+accent+'30 0%,'+accent+'12 35%,#0a0804 75%);overflow:hidden;box-shadow:0 0 12px '+accent+'18,0 2px 8px rgba(0,0,0,0.5);display:flex;flex-direction:column;';

  card.innerHTML =
    // 1. Top accent edge with light sweep
    '<div style="height:2px;flex-shrink:0;background:'+accent+'88;position:relative;overflow:hidden;">' +
      '<div style="position:absolute;inset:0;background:linear-gradient(90deg,transparent 30%,#fff 50%,transparent 70%);background-size:200% 100%;animation:edgeSweep 2.5s ease-in-out infinite;opacity:0.4;"></div>' +
    '</div>' +
    // 2. Type banner (compact)
    '<div style="background:linear-gradient(180deg,'+accent+'28,'+accent+'10);border-bottom:1px solid '+accent+'33;padding:3px 0;text-align:center;flex-shrink:0;">' +
      "<div style=\"font-family:'Oswald',sans-serif;font-weight:700;font-size:10px;letter-spacing:2.5px;line-height:1;background:linear-gradient(180deg,#fff 0%,"+accent+" 50%,#fff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;\">" + typeKey + "</div>" +
    '</div>' +
    // 3. Center group — play name (flex:1, fills remaining space)
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 4px;overflow:hidden;min-height:0;">' +
      "<div style=\"font-family:'Oswald',sans-serif;font-weight:700;font-size:12px;color:#fff;text-align:center;line-height:1.15;letter-spacing:0.5px;text-transform:uppercase;\">" + (p.name || '') + "</div>" +
      (strength ? "<div style=\"font-family:'Rajdhani',sans-serif;font-weight:600;font-size:7px;color:"+accent+";opacity:0.6;letter-spacing:0.3px;line-height:1;margin-top:2px;white-space:nowrap;text-transform:uppercase;\">" + strength + "</div>" : '') +
    '</div>' +
    // 4. Secondary badge (above divider)
    '<div style="display:flex;justify-content:center;padding:2px 5px 4px;flex-shrink:0;">' +
      '<div style="background:'+accent+'14;border:1px solid '+accent+'33;border-radius:2px;padding:1px 6px;">' +
        "<div style=\"font-family:'Rajdhani',sans-serif;font-size:9px;font-weight:700;color:"+accent+";letter-spacing:1px;line-height:1;\">" + sub + "</div>" +
      '</div>' +
    '</div>' +
    // 5. Risk footer (below divider)
    '<div style="border-top:1px solid '+accent+'33;padding:4px 6px;flex-shrink:0;border-radius:0 0 6px 6px;text-align:center;background:rgba(0,0,0,0.3);">' +
      "<div style=\"font-family:'Rajdhani',sans-serif;font-weight:700;font-size:9px;color:"+riskColor+";letter-spacing:1px;line-height:1;\">" + riskWord + "</div>" +
    '</div>';
  return card;
}

// ====== TORCH CARD — Icon + Category Colors ======

export function buildTorchCard(tc, w, h) {
  injectShimmer();
  w = w || 100;
  h = h || 140;
  var catColor = (tc.category && CATEGORY_COLORS && CATEGORY_COLORS[tc.category]) || '#EBB010';
  var isReactive = tc.type === 'reactive';
  var isGold = tc.tier === 'GOLD';
  var isSilver = tc.tier === 'SILVER';

  // Tier-driven config
  var tierAccent, borderW, borderCol, bgGrad, cardAnim, shimmerColor, shimmerDur, tierLabelStyle, iconSize, nameColor, effectColor, footerBg, footerBorder, shadowStyle;
  if (isGold) {
    tierAccent = '#EBB010';
    borderW = '1px'; borderCol = '#EBB01044';
    bgGrad = 'linear-gradient(170deg,#EBB01020,' + catColor + '10,#0a0804 55%)';
    cardAnim = 'goldPulse 3s ease-in-out infinite';
    shimmerColor = 'rgba(255,200,80,0.1)'; shimmerDur = '3s';
    tierLabelStyle = "font-family:'Oswald';font-weight:700;font-size:9px;letter-spacing:3px;background:linear-gradient(180deg,#FFD060,#EBB010,#8B4A1F);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;";
    nameColor = '#fff'; effectColor = '#ddd';
    footerBg = 'rgba(0,0,0,0.4)'; footerBorder = '1px solid #EBB01022';
    shadowStyle = '';
  } else if (isSilver) {
    tierAccent = '#C0C0C0';
    borderW = '1.5px'; borderCol = '#C0C0C044';
    bgGrad = 'linear-gradient(170deg,#C0C0C012,' + catColor + '08,#0a0804 55%)';
    cardAnim = 'silverShimmer 3s ease-in-out infinite';
    shimmerColor = 'rgba(192,192,192,0.06)'; shimmerDur = '4s';
    tierLabelStyle = "font-family:'Oswald';font-weight:700;font-size:9px;letter-spacing:2px;color:#C0C0C0;opacity:0.6;";
    nameColor = '#fff'; effectColor = '#bbb';
    footerBg = 'rgba(0,0,0,0.3)'; footerBorder = '1px solid #C0C0C015';
    shadowStyle = '0 4px 12px rgba(0,0,0,0.5)';
  } else {
    tierAccent = '#B87333';
    borderW = '1.5px'; borderCol = '#B8733333';
    bgGrad = 'linear-gradient(170deg,#B8733310,#0a0804 50%)';
    cardAnim = ''; shimmerColor = ''; shimmerDur = '';
    tierLabelStyle = "font-family:'Oswald';font-weight:700;font-size:9px;letter-spacing:2px;color:#B87333;opacity:0.5;";
    nameColor = '#ddd'; effectColor = '#aaa';
    footerBg = 'rgba(0,0,0,0.25)'; footerBorder = '1px solid #B8733318';
    shadowStyle = '0 4px 12px rgba(0,0,0,0.5)';
  }

  // Icon scales with card width — fills the center zone
  var iconSize = Math.round(w * (isGold ? 0.4 : isSilver ? 0.36 : 0.33));

  // Gold gets an outer double frame
  var outer;
  if (isGold) {
    outer = document.createElement('div');
    outer.style.cssText = 'width:' + (w + 6) + 'px;height:' + (h + 6) + 'px;border-radius:9px;background:linear-gradient(135deg,#EBB010,#fff,#EBB010);padding:3px;box-shadow:0 0 20px rgba(235,176,16,0.3),0 4px 12px rgba(0,0,0,0.5);position:relative;';
  }

  // Inner card
  var card = document.createElement('div');
  var bStyle = isReactive ? borderW + ' dashed ' + borderCol : borderW + ' solid ' + borderCol;
  card.style.cssText = 'width:' + w + 'px;height:' + h + 'px;border-radius:6px;border:' + bStyle + ';background:' + bgGrad + ';position:relative;overflow:hidden;display:flex;flex-direction:column;' + (shadowStyle ? 'box-shadow:' + shadowStyle + ';' : '') + (cardAnim ? 'animation:' + cardAnim + ';' : '');

  // Shimmer overlay (gold + silver only)
  if (shimmerColor) {
    var shimmer = document.createElement('div');
    shimmer.style.cssText = 'position:absolute;inset:0;pointer-events:none;background:linear-gradient(105deg,transparent 35%,' + shimmerColor + ' 48%,transparent 65%);background-size:300px 100%;animation:tcShimmer ' + shimmerDur + ' ease-in-out infinite;border-radius:5px;';
    card.appendChild(shimmer);
  }

  // Tier label (pinned top)
  var tierEl = document.createElement('div');
  tierEl.style.cssText = tierLabelStyle + "text-align:center;padding:4px 0 0;flex-shrink:0;position:relative;z-index:1;";
  tierEl.textContent = tc.tier;
  card.appendChild(tierEl);

  // Icon + name zone (flex:1, centered)
  var centerZone = document.createElement('div');
  centerZone.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:0;position:relative;z-index:1;gap:2px;';

  if (tc.iconKey && TORCH_CARD_ICONS[tc.iconKey]) {
    var iconSvg = renderTorchCardIcon(tc.iconKey, iconSize, catColor);
    if (iconSvg) {
      iconSvg.style.filter = 'drop-shadow(0 0 ' + (isGold ? '12' : '8') + 'px ' + catColor + (isGold ? '66' : '55') + ')';
      centerZone.appendChild(iconSvg);
    }
  }

  var nameLen = (tc.name || '').length;
  var _baseNameFs = Math.round(w * 0.14);
  var nameFs = nameLen >= 13 ? Math.max(9, _baseNameFs - 3) : nameLen >= 10 ? Math.max(10, _baseNameFs - 2) : Math.max(11, _baseNameFs);
  var nameEl = document.createElement('div');
  nameEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:" + nameFs + "px;color:" + nameColor + ";text-align:center;letter-spacing:0.5px;line-height:1;padding:0 4px;" + (isGold ? "text-shadow:0 0 8px rgba(235,176,16,0.3);" : "");
  nameEl.textContent = tc.name;
  centerZone.appendChild(nameEl);

  card.appendChild(centerZone);

  // Effect footer (pinned bottom)
  var _effectFs = Math.max(7, Math.round(w * 0.085));
  var _effectPad = Math.max(4, Math.round(w * 0.06));
  var footer = document.createElement('div');
  footer.style.cssText = 'flex-shrink:0;background:' + footerBg + ';border-top:' + footerBorder + ';padding:' + _effectPad + 'px ' + (_effectPad + 2) + 'px;border-radius:0 0 4px 4px;position:relative;z-index:1;';
  var effectEl = document.createElement('div');
  effectEl.style.cssText = "font-family:'Rajdhani';font-weight:600;font-size:" + _effectFs + "px;color:" + effectColor + ";text-align:center;line-height:1.3;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;";
  effectEl.textContent = tc.effect;
  footer.appendChild(effectEl);
  card.appendChild(footer);

  // Reactive label — inside footer, below effect text
  if (isReactive) {
    var reactLabel = document.createElement('div');
    reactLabel.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:7px;color:#4488FF;letter-spacing:1.5px;text-align:center;margin-top:2px;opacity:0.7;";
    reactLabel.textContent = 'REACTIVE';
    footer.appendChild(reactLabel);
  }

  // Attach to outer frame or return card directly
  var root = outer || card;
  if (outer) outer.appendChild(card);

  // Tooltip
  attachDetailListeners(root, {
    title: tc.name,
    text: tc.effect,
    keywords: [
      { word: tc.tier, definition: 'Card quality tier. Gold cards are game-breakingly powerful.' },
      { word: tc.category, definition: 'Strategic classification — ' + (tc.category === 'information' ? 'reveal hidden data' : tc.category === 'amplification' ? 'boost your own success' : tc.category === 'disruption' ? 'sabotage the opponent' : 'negate bad outcomes') }
    ]
  });

  return root;
}

/** Flip-to-reveal a torch card from card back to face. Uses 2D scaleX flip. */
export function flipRevealTorchCard(cardData, container, w, h, options) {
  options = options || {};
  var delay = options.delay || 0;
  var dramatic = options.dramatic !== undefined ? options.dramatic : cardData.tier === 'GOLD';

  var slot = document.createElement('div');
  slot.style.cssText = 'display:inline-block;';

  var backEl = buildHomeCard('torch', w, h);
  var frontEl = buildTorchCard(cardData, w, h);
  frontEl.style.display = 'none';

  slot.appendChild(backEl);
  slot.appendChild(frontEl);
  container.appendChild(slot);

  var flipDur = dramatic ? 0.18 : 0.12;

  var tl = gsap.timeline({ delay: delay });
  tl.to(slot, { y: -6, scale: 1.05, duration: 0.15, ease: 'power2.out' });
  tl.to(slot, { scaleX: 0, duration: flipDur, ease: 'power2.in' });
  tl.call(function() { backEl.style.display = 'none'; frontEl.style.display = ''; });
  tl.to(slot, { scaleX: 1, duration: flipDur, ease: 'power2.out' });
  tl.to(slot, { y: 0, scale: 1, duration: 0.2, ease: 'back.out(2)' });

  if (dramatic) {
    tl.fromTo(slot, { boxShadow: '0 0 0 rgba(235,176,16,0)' }, { boxShadow: '0 0 30px rgba(235,176,16,0.6)', duration: 0.2, yoyo: true, repeat: 1 }, '-=0.3');
  }

  return { el: slot, timeline: tl };
}
