/**
 * TORCH — Shared Card Components
 * Extracted from cardMockup.js for reuse across all game screens.
 * Card backs, Madden-style player cards, play cards, torch cards.
 */

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
    outer.style.cssText = 'position:relative;width:'+(w+framePad*2)+'px;height:'+(h+framePad*2)+'px;border-radius:'+Math.round(12*sc)+'px;background:linear-gradient(135deg,#FFB800,#fff,#FFB800);padding:'+framePad+'px;box-shadow:0 0 '+Math.round(20*sc)+'px rgba(255,184,0,0.4),0 4px 16px rgba(0,0,0,0.5);';
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

// ====== PLAYER CARD — Madden Style ======
var TIER_COLORS = { bronze:'#A0522D', silver:'#B0C4D4', gold:'#FFB800' };
var POS_NAMES = {QB:'QB',WR:'WR',RB:'RB',FB:'FB',TE:'TE',SLOT:'SLOT',
  CB:'CB',S:'S',LB:'LB',DL:'DL',DE:'DE'};

export function buildMaddenPlayer(p, w, h) {
  var tc = TIER_COLORS[p.tier] || '#B0C4D4';
  var lg = w > 90;
  var card = document.createElement('div');
  card.style.cssText = 'width:'+w+'px;height:'+h+'px;border-radius:'+(lg?8:6)+'px;border:2px solid '+tc+'44;background:radial-gradient(ellipse at 50% 25%,#141008,#0A0804);position:relative;box-shadow:0 '+(lg?'4px 16px':'3px 10px')+' rgba(0,0,0,0.5);display:flex;flex-direction:column;';
  var fullPos = POS_NAMES[p.pos] || p.pos;
  // Top row: OVR centered, #number and position flanking
  var topArea = '<div style="position:relative;padding:'+(lg?'6':'4')+'px 0 '+(lg?'2':'1')+'px;z-index:2;text-align:center;">'
    +'<div style="font-family:\'Teko\';font-weight:700;font-size:'+(lg?32:20)+'px;color:'+tc+';line-height:1;text-shadow:0 0 '+(lg?'10':'6')+'px '+tc+'44;">'+p.ovr+'</div>'
    +'<div style="position:absolute;left:'+(lg?'8':'5')+'px;top:50%;transform:translateY(-50%);font-family:\'Teko\';font-weight:700;font-size:'+(lg?11:8)+'px;color:#fff;opacity:0.7;line-height:1;">#'+(p.num||'')+'</div>'
    +'<div style="position:absolute;right:'+(lg?'8':'5')+'px;top:50%;transform:translateY(-50%);font-family:\'Teko\';font-weight:700;font-size:'+(lg?11:8)+'px;color:#fff;opacity:0.7;line-height:1;">'+fullPos+'</div>'
    +'</div>';
  // Football helmet art
  var helmW = lg ? 80 : 52;
  var helmH = lg ? 64 : 42;
  var artArea = '<div style="position:absolute;top:'+(lg?'30':'20')+'px;left:0;right:0;bottom:'+(lg?'26':'18')+'px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 '+(lg?'14':'10')+'px '+tc+'88);">'
    +'<svg viewBox="0 0 512 411" width="'+helmW+'" height="'+helmH+'" fill="none" style="position:absolute;">'
    +'<path fill="'+tc+'" opacity="0.7" fill-rule="nonzero" d="M214.67 410.6c-14.73-1.18-28.57-6.54-42.64-11.99-25.84-10-52.68-20.39-81.81 4.8-5.1 4.41-12.82 3.85-17.24-1.25l-.81-1.04c-12.22-16.33-23.15-33.53-32.57-51.2-9.54-17.9-17.53-36.25-23.76-54.66-2.2-6.51-4.16-12.94-5.88-19.27C-5.5 218.91-3.09 163.75 18.1 117.61 39.44 71.12 79.58 34.13 139.37 13.89c5.45-1.85 11.01-3.55 16.65-5.08 52.22-14.14 109.49-11.57 157.51 9.95 43.22 19.37 78.9 53.94 96.85 105.29 2.02 5.82-.61 12.14-5.94 14.88-40.41 22.46-66.27 38.89-82.33 53.19l2.36 7.35v.05c6.51 20.34 13.65 42.65 22.23 63.66 16.25-6.42 32-13.62 47.07-21.33 18.65-9.55 36.55-20.02 53.33-30.86 5.1-3.27 11.89-1.79 15.16 3.31.39.6.72 1.24.97 1.88l47.89 111.61c2.04 4.79.41 10.22-3.63 13.16-14.42 11.8-29.24 20-44.13 24.67-15.62 4.89-31.33 5.92-46.8 3.12-19.86-3.58-36.19-14.08-49.89-28.82-20.42 6.63-40.86 11.65-59.62 14.43-4.39 10.72-11.18 20.58-19.66 28.96-13.84 13.67-32.34 23.48-52.39 26.55a88.224 88.224 0 0 1-20.33.74zm-5.19-119.43c15.25 0 27.6 12.36 27.6 27.6 0 15.25-12.35 27.6-27.6 27.6-15.24 0-27.6-12.35-27.6-27.6 0-15.24 12.36-27.6 27.6-27.6zM430 348.27l-13.38-27.88c-7.45 3.44-15.09 6.71-22.83 9.77l-4.08 1.59c9.07 7.9 19.23 13.36 30.71 15.43 3.17.57 6.37.94 9.58 1.09zm-22.89-47.69-15.86-33.03c-11.63 5.61-23.54 10.88-35.65 15.69 5.47 11.3 11.5 21.83 18.24 30.98 3.98-1.44 7.94-2.94 11.88-4.5a441.89 441.89 0 0 0 21.39-9.14zm3.69-42.91 15.95 33.21c13.14-6.98 25.12-14.42 35.2-22.05l-13.93-32.46a632.569 632.569 0 0 1-37.22 21.3zm25.46 53.03 16.82 35.04c1.25-.33 2.5-.69 3.75-1.08 10.26-3.21 20.57-8.55 30.79-16.02l-16.78-39.09c-10.24 7.35-21.96 14.47-34.58 21.15zm-130.93-99.16c-10.71 18.13-7.02 35.74-1.3 63.05l.62 2.94 2.22-.64a429.55 429.55 0 0 0 19.26-6.13c-7.98-19.65-14.68-40.11-20.8-59.22zm3.63 87.55c1.01 5.45 2 11.14 2.91 17.1.77 5.03.96 10.07.63 15.04 12.68-2.31 26.09-5.64 39.67-9.77-6.34-9.4-12.02-19.72-17.19-30.55-7.23 2.5-14.57 4.86-22.01 7.03l-4.01 1.15zm-30.49 56.97c-4.35.29-8.67.52-12.47.65-3.79.12-6.98-2.82-7.19-6.6-.92-16.66-2.73-33.15-4.47-49.06-3.86-35.28-7.44-67.91-.7-95.91 4.65-19.3 20.43-38.98 40.59-56.85 22.96-20.37 51.8-38.64 75.92-51.17-16.8-25.63-40.05-44.15-66.59-56.05-42.76-19.16-94.13-21.36-141.22-8.6-5.26 1.42-10.31 2.96-15.12 4.59C94.25 55 58.89 87.32 40.32 127.77c-18.74 40.8-20.7 90.24-6.7 141.9 1.61 5.95 3.42 11.87 5.4 17.74 5.86 17.31 13.3 34.44 22.13 51.02 7 13.13 14.89 25.98 23.58 38.38 35.7-24.37 66.43-12.48 96.12-.99 12.3 4.76 24.4 9.45 35.74 10.36 4.97.39 9.93.19 14.77-.55 14.85-2.28 28.58-9.58 38.88-19.75 3.08-3.04 5.85-6.34 8.23-9.82z"/>'
    +'</svg>'
    +'</div>';
  // Bottom gradient
  var botGrad = '<div style="position:absolute;bottom:0;left:0;right:0;height:35%;background:linear-gradient(transparent,#0A0804);z-index:1;"></div>';
  // Name bar
  var nameBar = '<div style="position:absolute;bottom:0;left:0;right:0;z-index:2;background:'+p.teamColor+'33;padding:'+(lg?'6px 8px':'4px 5px')+';border-top:1px solid '+p.teamColor+'44;border-bottom:2px solid '+p.teamColor+';border-radius:0 0 '+(lg?'6':'4')+'px '+(lg?'6':'4')+'px;">'
    +'<div style="font-family:\'Teko\';font-weight:700;font-size:'+(lg?12:9)+'px;color:#fff;letter-spacing:'+(lg?'1':'0.5')+'px;text-align:center;line-height:1;white-space:nowrap;">'+(lg?p.name:p.name.split(' ').pop())+'</div></div>';
  card.innerHTML = topArea + artArea + botGrad + nameBar;
  return card;
}

// ====== PLAY CARD — V1 (name bar top, icon center, category+risk bottom) ======
var RISK_ICONS = { high:'\u26A1 HIGH', med:'\u25C6 MED', low:'\u25CF LOW' };

export function buildPlayV1(p, w, h) {
  var svgTag = p.svg.replace('CATFILL', p.catColor)
    .replace('SVGW', Math.round(w*0.75)).replace('SVGH', Math.round(h*0.45))
    .replace('fill="none">', 'width="'+Math.round(w*0.75)+'" height="'+Math.round(h*0.45)+'" fill="none">');
  var card = document.createElement('div');
  card.style.cssText = 'width:'+w+'px;height:'+h+'px;border-radius:7px;border:2px solid '+p.catColor+'44;background:radial-gradient(ellipse at 50% 50%,'+p.bg+',#0E0A06);overflow:hidden;box-shadow:0 3px 12px rgba(0,0,0,0.5);display:flex;flex-direction:column;';
  card.innerHTML = '<div style="height:3px;background:'+p.catColor+';border-radius:5px 5px 0 0;"></div>'
    +'<div style="background:'+p.catColor+'22;padding:4px 6px;border-bottom:1px solid '+p.catColor+'33;">'
    +'<div style="font-family:\'Teko\';font-weight:700;font-size:'+(w>90?14:11)+'px;color:#fff;letter-spacing:1px;line-height:1;white-space:nowrap;">'+p.name+'</div></div>'
    +'<div style="flex:1;display:flex;align-items:center;justify-content:center;">'+svgTag+'</div>'
    +'<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 6px;background:rgba(0,0,0,0.3);border-top:1px solid #1E1610;">'
    +'<div style="font-family:\'Rajdhani\';font-weight:700;font-size:'+(w>90?8:6)+'px;color:'+p.catColor+';letter-spacing:0.5px;">'+p.cat+'</div>'
    +'<div style="font-family:\'Rajdhani\';font-weight:700;font-size:'+(w>90?8:6)+'px;color:'+(p.riskColor||p.catColor)+';">'+RISK_ICONS[p.risk]+'</div></div>';
  return card;
}

// ====== TORCH CARD — Centered Flame V1 ======
var TIER_BORDER_COLORS = { GOLD:'#FFB800', SILVER:'#B0C4D4', BRONZE:'#A0522D' };
var FLAME_PATH = 'M22 2C22 2 10 14 9 22C8 30 13 36 17 38C17 38 14 32 17 26C19 22 21 18 22 14C23 18 25 22 27 26C30 32 27 38 27 38C31 36 36 30 35 22C34 14 22 2 22 2Z';

export function buildTorchCard(tc, w, h) {
  w = w || 100;
  h = h || 140;
  var bc = TIER_BORDER_COLORS[tc.tier] || '#B0C4D4';
  var card = document.createElement('div');
  card.style.cssText = 'width:'+w+'px;height:'+h+'px;border-radius:7px;border:3px solid '+bc+';background:radial-gradient(ellipse at 50% 35%,#1a0800,#0A0804);position:relative;box-shadow:0 4px 16px rgba(0,0,0,0.5),0 0 12px rgba(255,69,17,0.15);display:flex;flex-direction:column;align-items:center;';
  card.innerHTML = '<div style="font-family:\'Rajdhani\';font-weight:700;font-size:8px;color:'+bc+';letter-spacing:2px;text-align:center;padding:8px 0 0;opacity:0.7;">'+tc.tier+'</div>'
    +'<div style="display:flex;align-items:center;justify-content:center;height:56px;margin-top:2px;"><svg viewBox="0 0 44 44" width="42" height="42" fill="none"><defs><linearGradient id="tg_'+tc.tier+'_'+(_uid++)+'" x1="22" y1="40" x2="22" y2="0"><stop offset="0%" stop-color="#FF4511"/><stop offset="100%" stop-color="#FFB800"/></linearGradient></defs><path d="'+FLAME_PATH+'" fill="url(#tg_'+tc.tier+'_'+(_uid)+'" stroke="#FF4511" stroke-width="0.8"/></svg></div>'
    +'<div style="font-family:\'Teko\';font-weight:700;font-size:14px;color:#fff;text-align:center;letter-spacing:1px;line-height:1;padding:0 6px;white-space:nowrap;">'+tc.name+'</div>'
    +'<div style="font-family:\'Rajdhani\';font-size:9px;color:#aaa;text-align:center;padding:2px 6px;line-height:1;white-space:nowrap;">'+tc.effect+'</div>'
    +'<div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:'+bc+';opacity:0.6;border-radius:0 0 5px 5px;"></div>';
  return card;
}
