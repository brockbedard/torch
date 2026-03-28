/**
 * TORCH v0.21 — Shared Card Components
 * Single source of truth for all card visuals.
 * Card backs, Madden-style player cards, play cards, torch cards,
 * team helmets, flame pip ratings.
 */

import { BADGE_ICON_PATHS } from '../../data/badgeIcons.js';
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

// ====== CARD BACK CONFIGS ======
var CARD_CONFIGS = {
  offense: {accent:'#7ACC00',bg:'#96CC50',bgEdge:'#4A6A20',label:'OFFENSE',spotColor:'rgba(122,204,0,0.25)',
    art:'<svg viewBox="0 0 448 512" width="48" height="52">'
      +'<defs><linearGradient id="bG_o{U}" x1="100" y1="450" x2="350" y2="50"><stop offset="0%" stop-color="#90E040"/><stop offset="100%" stop-color="#D4FF80"/></linearGradient></defs>'
      +'<path fill="url(#bG_o{U})" stroke="#7ACC00" stroke-width="8" d="M349.4 44.6c5.9-13.7 1.5-29.7-10.6-38.5s-28.6-8-39.9 1.8l-256 224c-10 8.8-13.6 22.9-8.9 35.3S50.7 288 64 288l111.5 0L98.6 467.4c-5.9 13.7-1.5 29.7 10.6 38.5s28.6 8 39.9-1.8l256-224c10-8.8 13.6-22.9 8.9-35.3s-16.6-20.7-30-20.7l-111.5 0L349.4 44.6z"/></svg>'},
  torch: {accent:'#FF4511',bg:'#E88050',bgEdge:'#904028',label:'TORCH',spotColor:'rgba(255,69,17,0.25)',
    art:'<svg viewBox="0 -2 44 56" fill="none" width="48" height="52" style="overflow:visible;">'
      +'<defs><linearGradient id="nG_t{U}" x1="22" y1="50" x2="22" y2="0"><stop offset="0%" stop-color="#FF6A30"/><stop offset="100%" stop-color="#FFD060"/></linearGradient>'
      +'<linearGradient id="nI_t{U}" x1="22" y1="44" x2="22" y2="8"><stop offset="0%" stop-color="#FFAA44"/><stop offset="100%" stop-color="#FFFBE6"/></linearGradient></defs>'
      +'<path d="M22 0C22 0 6 16 4 28C2 40 12 48 18 52C18 52 13 42 18 30C20 24 21 19 22 13C23 19 24 24 26 30C31 42 26 52 26 52C32 48 42 40 40 28C38 16 22 0 22 0Z" fill="url(#nG_t{U})" stroke="#FF4511" stroke-width="1.5"/>'
      +'<path d="M22 12C22 12 13 24 12 32C11 40 15 46 19 49C19 49 16 41 19 32C20 28 21 25 22 20C23 25 24 28 25 32C28 41 25 49 25 49C29 46 33 40 32 32C31 24 22 12 22 12Z" fill="url(#nI_t{U})" opacity="0.7"/></svg>'},
  defense: {accent:'#4DA6FF',bg:'#6AAAEE',bgEdge:'#385890',label:'DEFENSE',spotColor:'rgba(77,166,255,0.2)',
    art:'<svg viewBox="0 0 512 512" width="48" height="52">'
      +'<defs><linearGradient id="sG_d{U}" x1="256" y1="512" x2="256" y2="0"><stop offset="0%" stop-color="#3080D0"/><stop offset="100%" stop-color="#A0D4FF"/></linearGradient></defs>'
      +'<path fill="url(#sG_d{U})" stroke="#4DA6FF" stroke-width="8" d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8l0 378.1C394 378 431.1 230.1 432 141.4L256 66.8z"/></svg>'},
};

// Unique ID counter to avoid SVG gradient ID collisions
var _uid = 0;

// ====== CARD BACK ======
// Builds a card back with vivid background, texture, border, shimmer, torch premium treatment.
// Returns outer wrapper div. For torch, includes gold double frame.
export function buildHomeCard(type, w, h) {
  var d = CARD_CONFIGS[type];
  if (!d) return document.createElement('div');
  var uid = _uid++;
  var isTorch = type === 'torch';
  var sc = w / 100;
  var bw = Math.max(2, Math.round((isTorch ? 4 : 3) * sc));
  var npH = Math.max(12, Math.round((isTorch ? 28 : 24) * sc));

  // Wrapper — TORCH gets gold double frame
  var outer = document.createElement('div');
  if (isTorch) {
    var framePad = Math.max(2, Math.round(4 * sc));
    outer.style.cssText = 'position:relative;width:'+(w+framePad*2)+'px;height:'+(h+framePad*2)+'px;border-radius:'+Math.round(12*sc)+'px;background:linear-gradient(135deg,#EBB010,#fff,#EBB010);padding:'+framePad+'px;box-shadow:0 0 '+Math.round(20*sc)+'px rgba(235,176,16,0.4),0 4px 16px rgba(0,0,0,0.5);';
  } else {
    outer.style.cssText = 'position:relative;width:'+w+'px;height:'+h+'px;';
  }

  // Card
  var card = document.createElement('div');
  card.className = 'torch-card-inner';
  card.style.cssText = 'position:absolute;width:'+w+'px;height:'+h+'px;border-radius:8px;'
    +'background:'+d.bgEdge+';background-image:radial-gradient(ellipse at 50% 40%,'+d.bg+' 0%,'+d.bgEdge+' 100%);'
    +'display:flex;flex-direction:column;align-items:center;justify-content:center;'
    +'box-shadow:0 2px 4px rgba(0,0,0,0.4),'+(isTorch?'0 16px 40px rgba(0,0,0,0.4)':'0 8px 20px rgba(0,0,0,0.25)')+';'
    +'overflow:hidden;';

  // TORCH: breathing glow
  if (isTorch) {
    var glow = document.createElement('div');
    glow.style.cssText = 'position:absolute;inset:-8px;border-radius:16px;background:#FF4511;filter:blur(12px);opacity:0.15;z-index:-2;pointer-events:none;animation:torchGlow 3s ease-in-out infinite;';
    card.appendChild(glow);
  }

  // Subtle diagonal texture
  var texture = document.createElement('div');
  texture.style.cssText = 'position:absolute;inset:0;border-radius:8px;opacity:0.04;pointer-events:none;z-index:1;background:repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(255,255,255,0.5) 3px,rgba(255,255,255,0.5) 4px);';
  card.appendChild(texture);
  // Bevel
  var bevel = document.createElement('div');
  bevel.style.cssText = 'position:absolute;inset:0;border-radius:8px;box-shadow:inset 1px 1px 3px rgba(255,255,255,0.06),inset -1px -1px 3px rgba(0,0,0,0.3);pointer-events:none;z-index:7;';
  card.appendChild(bevel);

  // Gradient border
  var border = document.createElement('div');
  border.style.cssText = 'position:absolute;inset:-'+bw+'px;border-radius:'+(8+bw)+'px;background:linear-gradient(135deg,'+d.accent+',rgba(255,255,255,0.4),'+d.accent+');z-index:-1;';
  card.appendChild(border);

  // Inner margin — inset shadow for depth
  var margin = document.createElement('div');
  margin.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:'+npH+'px;border-radius:'+Math.round(8*sc)+'px '+Math.round(8*sc)+'px 0 0;box-shadow:inset 0 0 '+Math.round(8*sc)+'px rgba(0,0,0,0.2);pointer-events:none;z-index:4;';
  card.appendChild(margin);

  // Spotlight — centered in art area (above nameplate)
  var artCenterY = (h - npH) / 2;
  var spot = document.createElement('div');
  var spotSz = Math.round(80 * sc);
  spot.style.cssText = 'position:absolute;top:'+artCenterY+'px;left:50%;transform:translate(-50%,-50%);width:'+spotSz+'px;height:'+spotSz+'px;border-radius:50%;background:radial-gradient(circle,'+d.spotColor+',transparent 70%);z-index:2;pointer-events:none;';
  card.appendChild(spot);

  // Divider
  var div = document.createElement('div');
  div.style.cssText = 'position:absolute;bottom:'+npH+'px;left:15%;right:15%;height:1px;background:'+d.accent+'22;z-index:5;';
  card.appendChild(div);

  // Art icon — scaled
  var artW = Math.round((isTorch ? 60 : 48) * sc);
  var artH = Math.round((isTorch ? 65 : 52) * sc);
  var artWrap = document.createElement('div');
  artWrap.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:'+npH+'px;display:flex;align-items:center;justify-content:center;z-index:3;';
  var artSvg = d.art.replace(/\{U\}/g, uid);
  var scaledArt = artSvg.replace(/width="\d+"/, 'width="'+artW+'"').replace(/height="\d+"/, 'height="'+artH+'"');
  if (isTorch) {
    scaledArt = scaledArt.replace('stroke="#FF4511" stroke-width="1.5"','stroke="#FF4511" stroke-width="1.5" style="animation:flameSway 2.5s ease-in-out infinite;transform-origin:50% 100%;"');
  }
  artWrap.innerHTML = scaledArt;
  card.appendChild(artWrap);

  // Nameplate
  var np = document.createElement('div');
  var npRad = Math.round(6 * sc);
  np.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:'+npH+'px;background:'+d.accent+(isTorch?'ee':'dd')+';display:flex;align-items:center;justify-content:center;z-index:5;border-radius:0 0 '+npRad+'px '+npRad+'px;';
  var npT = document.createElement('div');
  var npFs = isTorch ? Math.max(10, Math.round(22 * sc)) : Math.max(8, Math.round(16 * sc));
  var npLs = isTorch ? Math.max(2, Math.round(4 * sc)) : Math.max(1, Math.round(3 * sc));
  if (isTorch) {
    npT.style.cssText = "font-family:'Teko';font-weight:700;font-size:"+npFs+"px;color:#09081A;letter-spacing:"+npLs+"px;transform:skewX(-8deg);";
  } else {
    npT.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:"+npFs+"px;color:#000;letter-spacing:"+npLs+"px;";
  }
  npT.textContent = d.label;
  np.appendChild(npT);
  card.appendChild(np);

  // Shimmer
  var shim = document.createElement('div');
  if (isTorch) {
    shim.style.cssText = 'position:absolute;inset:0;border-radius:8px;background:linear-gradient(105deg,transparent 35%,rgba(255,180,80,0.12) 48%,rgba(255,255,255,0.08) 52%,transparent 65%);animation:torchShimmer 4.5s ease-in-out infinite;pointer-events:none;z-index:8;';
  } else {
    shim.style.cssText = 'position:absolute;inset:0;border-radius:8px;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.06) 50%,transparent 60%);animation:cardShimmer 6s ease-in-out infinite;pointer-events:none;z-index:8;';
  }
  card.appendChild(shim);

  // TORCH: ember sparks
  if (isTorch) {
    [-12,8,-6,14,-10].forEach(function(drift) {
      var spark = document.createElement('div');
      spark.style.cssText = 'position:absolute;top:10px;left:'+(25+Math.random()*50)+'%;width:'+(1.5+Math.random()*1.5)+'px;height:'+(1.5+Math.random()*1.5)+'px;border-radius:50%;background:#FF8C00;z-index:9;pointer-events:none;opacity:0;animation:torchSpark '+(1.2+Math.random()*1.5)+'s '+(Math.random()*3)+'s ease-out infinite;--sx:'+drift+'px;';
      card.appendChild(spark);
    });
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

export function buildMaddenPlayer(p, w, h) {
  var isStar = p.isStar || false;
  var teamColor = p.teamColor || '#FF4511';
  var posColor = POS_COLORS[p.pos] || '#aaa';
  var fullPos = POS_NAMES[p.pos] || p.pos;
  var card = document.createElement('div');

  card.style.cssText = 'width:'+w+'px;height:'+h+'px;border-radius:8px;border-top:3px solid '+posColor+';border-left:1px solid #2a2a2a;border-right:1px solid #2a2a2a;border-bottom:1px solid #2a2a2a;background:linear-gradient(180deg,'+teamColor+'14 0%,#0a0906 60%);overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.5);display:flex;flex-direction:column;position:relative;';

  // Star badge
  var starIcon = '';
  if (isStar) {
    starIcon = '<div style="position:absolute;top:3px;right:4px;z-index:5;filter:drop-shadow(0 1px 2px rgba(235,176,16,0.6));">'
      + '<svg viewBox="0 0 24 24" width="10" height="10"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01z" fill="#EBB010"/></svg>'
      + '</div>';
  }

  // Content
  var nameFs = p.name.length > 8 ? 13 : 16;
  card.innerHTML = starIcon +
    '<div style="padding:4px 6px 6px;display:flex;flex-direction:column;flex:1;min-height:0;">' +
      // Position + Number row
      "<div style=\"display:flex;align-items:baseline;gap:4px;\">" +
        "<div style=\"font-family:'Teko';font-weight:900;font-size:22px;color:"+posColor+";line-height:1;\">"+fullPos+'</div>' +
        "<div style=\"font-family:'Teko';font-size:12px;color:rgba(255,255,255,0.25);line-height:1;\">#"+(p.num||'')+'</div>' +
      '</div>' +
      // Player name
      "<div style=\"font-family:'Teko';font-weight:700;font-size:"+nameFs+"px;color:#fff;letter-spacing:0.5px;line-height:1;margin-top:1px;\">"+p.name+'</div>' +
      // Position color accent line
      '<div style="height:2px;background:linear-gradient(90deg,'+posColor+',transparent);margin:4px 0;flex-shrink:0;"></div>' +
      // Ability text
      (p.ability ? "<div style=\"font-family:'Rajdhani';font-size:8.5px;color:rgba(255,255,255,0.45);line-height:1.25;\">"+p.ability+'</div>' : '') +
    '</div>';
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
    var color = i < filled ? filledColor : '#333';
    html += '<svg viewBox="0 0 12 16" width="' + size + '" height="' + h + '" style="margin-right:1px;"><path d="' + FLAME_PIP_PATH + '" fill="' + color + '"/></svg>';
  }
  return html;
}

// ====== PLAY CARD — Style 2 (Type-Colored, Top Stripe + Type Pill) ======

// Type color configs: bg, border, accent
var TYPE_COLORS = {
  DEEP:     { bg: '#0a1230', border: '#2255cc', accent: '#4488ff' },
  SHORT:    { bg: '#0a2010', border: '#22aa44', accent: '#44dd66' },
  QUICK:    { bg: '#1a1a05', border: '#aa8822', accent: '#ddbb44' },
  SCREEN:   { bg: '#1a1205', border: '#cc8800', accent: '#ffaa22' },
  RUN:      { bg: '#1a0f0a', border: '#8B4513', accent: '#c4733b' },
  ZONE:     { bg: '#0a1225', border: '#2266aa', accent: '#4499dd' },
  BLITZ:    { bg: '#200a0a', border: '#aa2222', accent: '#dd4444' },
  HYBRID:   { bg: '#150a20', border: '#7733aa', accent: '#9955cc' },
  PRESSURE: { bg: '#1a0f0a', border: '#aa5522', accent: '#cc7744' },
};

// Risk pip colors
var RISK_PIP_COLORS = ['#3df58a', '#EBB010', '#e03050']; // 1=green, 2=orange, 3=red

export function buildPlayV1(p, w, h) {
  var card = document.createElement('div');
  // Resolve type colors
  var typeKey = p.playType || p.cat || 'RUN';
  // Normalize: "SHORT PASS" → "SHORT", "DEEP PASS" → "DEEP", etc.
  if (typeKey.indexOf(' ') >= 0) typeKey = typeKey.split(' ')[0];
  var tc = TYPE_COLORS[typeKey] || TYPE_COLORS['RUN'];
  var isRunCard = p.isRun === true;
  var borderW = isRunCard ? 3 : 2;

  // Background pattern: diagonal lines for pass, horizontal for run
  var bgPattern = isRunCard
    ? 'repeating-linear-gradient(0deg,transparent,transparent 6px,rgba(255,255,255,0.03) 6px,rgba(255,255,255,0.03) 7px)'
    : 'repeating-linear-gradient(135deg,transparent,transparent 4px,rgba(255,255,255,0.03) 4px,rgba(255,255,255,0.03) 5px)';
  var stripeStyle = isRunCard
    ? 'background:' + tc.accent + ';'
    : 'background:linear-gradient(90deg,' + tc.accent + ',' + tc.border + ');';

  card.style.cssText = 'width:'+w+'px;height:'+h+'px;border-radius:8px;border:'+borderW+'px solid '+tc.border+';background:'+tc.bg+';background-image:'+bgPattern+';overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.5);display:flex;flex-direction:column;';

  // Risk: convert string to number (1-3)
  var riskNum = p.risk === 'high' ? 3 : p.risk === 'med' ? 2 : typeof p.risk === 'number' ? p.risk : 1;
  var riskPips = '';
  for (var ri = 0; ri < 3; ri++) {
    var pipColor = ri < riskNum ? RISK_PIP_COLORS[riskNum - 1] : 'rgba(255,255,255,0.08)';
    riskPips += '<svg viewBox="0 0 12 16" width="8" height="11" style="margin-right:1px;"><path d="'+FLAME_PIP_PATH+'" fill="'+pipColor+'"/></svg>';
  }

  // Name font size — auto-shrink for long names
  var nameFs = p.name.length > 16 ? 10 : p.name.length > 12 ? 11 : 13;

  card.innerHTML =
    // 1. Color stripe
    '<div style="height:3px;flex-shrink:0;'+stripeStyle+'"></div>' +
    // 2. Header: Play name + type pill on same row
    '<div style="display:flex;align-items:baseline;gap:4px;padding:5px 5px 2px;">' +
      "<div style=\"flex:1;min-width:0;font-family:'Teko';font-weight:700;font-size:"+nameFs+"px;color:#fff;letter-spacing:0.5px;line-height:1.1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;\">"+p.name+'</div>' +
      '<div style="flex-shrink:0;padding:1px 3px;border-radius:2px;background:'+tc.accent+'22;border:1px solid '+tc.accent+'44;">' +
        "<div style=\"font-family:'Teko';font-weight:700;font-size:8px;color:"+tc.accent+";letter-spacing:1px;line-height:1;\">"+typeKey+'</div></div>' +
    '</div>' +
    // 3. Description
    "<div style=\"padding:0 5px;font-family:'Rajdhani';font-size:8.5px;color:rgba(255,255,255,0.45);line-height:1.25;flex:1;overflow:hidden;\">"+(p.desc || '')+'</div>' +
    // 4. Footer bar: RISK + pips
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 5px;background:rgba(0,0,0,0.3);border-top:1px solid '+tc.accent+'22;flex-shrink:0;">' +
      "<div style=\"font-family:'Teko';font-size:8px;color:#555;letter-spacing:1px;\">RISK</div>" +
      '<div style="display:flex;align-items:center;">'+riskPips+'</div></div>';
  return card;
}

// ====== TORCH CARD — Icon + Category Colors ======

export function buildTorchCard(tc, w, h) {
  w = w || 100;
  h = h || 140;
  var bc = (TIER_COLORS && TIER_COLORS[tc.tier]) || '#B0C4D4';
  var catColor = (tc.category && CATEGORY_COLORS && CATEGORY_COLORS[tc.category]) || '#EBB010';
  var isReactive = tc.type === 'reactive';
  var isGold = tc.tier === 'GOLD';
  var isSilver = tc.tier === 'SILVER';

  var card = document.createElement('div');
  var borderStyle = isReactive ? '2px dashed ' + bc : '2px solid ' + bc;
  var glowStyle = isGold ? '0 0 12px ' + bc + '44,0 4px 16px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.5)';
  if (isSilver) glowStyle = '0 0 8px rgba(192,192,192,0.2),' + glowStyle;

  card.style.cssText = 'width:'+w+'px;height:'+h+'px;border-radius:7px;border:'+borderStyle+';background:radial-gradient(ellipse at 50% 30%,'+catColor+'0d,#0A0804 70%),#0A0804;position:relative;box-shadow:'+glowStyle+';display:flex;flex-direction:column;align-items:center;overflow:hidden;';

  // Gold shimmer animation
  if (isGold) card.style.animation = 'T-pulse 3s ease-in-out infinite';
  // Silver shimmer
  if (isSilver) card.style.animation = 'T-shimmer 3s ease-in-out infinite';

  var iconSize = Math.max(20, Math.round(h * 0.28));
  var nameFs = Math.max(9, Math.min(13, Math.round(w * 0.13)));
  var effectFs = Math.max(6, Math.min(8, Math.round(w * 0.08)));
  var tierFs = Math.max(6, Math.min(8, Math.round(w * 0.07)));

  // Tier label
  var tierEl = document.createElement('div');
  tierEl.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:"+tierFs+"px;color:"+bc+";letter-spacing:2px;text-align:center;padding:3px 0 0;opacity:0.7;";
  tierEl.textContent = tc.tier;
  card.appendChild(tierEl);

  // Icon (from torchCardIcons.js, colored by category)
  var iconWrap = document.createElement('div');
  iconWrap.style.cssText = 'display:flex;align-items:center;justify-content:center;height:'+Math.round(h*0.35)+'px;flex-shrink:0;';
  if (tc.iconKey && TORCH_CARD_ICONS[tc.iconKey]) {
    var iconSvg = renderTorchCardIcon(tc.iconKey, iconSize, catColor);
    if (iconSvg) {
      iconSvg.style.filter = 'drop-shadow(0 0 6px ' + catColor + '44)';
      iconWrap.appendChild(iconSvg);
    }
  }
  card.appendChild(iconWrap);

  // Name
  var nameEl = document.createElement('div');
  nameEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:"+nameFs+"px;color:#fff;text-align:center;letter-spacing:0.5px;line-height:1.1;padding:0 4px;overflow:hidden;text-overflow:ellipsis;max-width:100%;";
  nameEl.textContent = tc.name;
  card.appendChild(nameEl);

  // Effect text
  var effectEl = document.createElement('div');
  effectEl.style.cssText = "font-family:'Rajdhani';font-size:"+effectFs+"px;color:#999;text-align:center;padding:1px 4px;line-height:1.15;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;max-width:100%;";
  effectEl.textContent = tc.effect;
  card.appendChild(effectEl);

  // Reactive label
  if (isReactive) {
    var reactLabel = document.createElement('div');
    reactLabel.style.cssText = "position:absolute;top:2px;right:3px;font-family:'Rajdhani';font-weight:700;font-size:5px;color:#4488FF;letter-spacing:1px;opacity:0.8;";
    reactLabel.textContent = 'REACTIVE';
    card.appendChild(reactLabel);
  }

  // Bottom tier bar
  var bottom = document.createElement('div');
  bottom.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:2px;background:'+bc+';opacity:0.5;border-radius:0 0 5px 5px;';
  card.appendChild(bottom);

  // v0.23: Balatro-style details
  attachDetailListeners(card, {
    title: tc.name,
    text: tc.effect,
    keywords: [
      { word: tc.tier, definition: 'Card quality tier. Gold cards are game-breakingly powerful.' },
      { word: tc.category, definition: 'Strategic classification — ' + (tc.category === 'information' ? 'reveal hidden data' : tc.category === 'amplification' ? 'boost your own success' : tc.category === 'disruption' ? 'sabotage the opponent' : 'negate bad outcomes') }
    ]
  });

  return card;
}
