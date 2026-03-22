/**
 * TORCH — Card Design Mockup Page v3
 * Final selections + home page card style matching
 * Access via ?mockup URL param
 */

import { VERSION } from '../../state.js';

function injectStyles() {
  if (document.getElementById('mockup-styles')) return;
  var s = document.createElement('style');
  s.id = 'mockup-styles';
  s.textContent = `
    @keyframes flipSnap { 0%{transform:rotateY(0)} 50%{transform:rotateY(90deg)} 51%{transform:rotateY(90deg)} 100%{transform:rotateY(180deg)} }
    @keyframes torchPulseA { 0%,100%{background:radial-gradient(circle at 50% 40%,rgba(255,140,0,0.15),transparent 60%);} 50%{background:radial-gradient(circle at 50% 40%,rgba(255,140,0,0.3),transparent 70%);} }
    @keyframes torchSweepB { 0%{background-position:-200px 0;} 100%{background-position:200px 0;} }
    @keyframes torchRotateC { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
    @keyframes dealSlide { 0%{opacity:0;transform:translateX(-120px) rotate(-18deg) scale(0.5)} 70%{opacity:1;transform:translateX(5px) rotate(1deg) scale(1.02)} 100%{transform:translateX(0) rotate(0deg) scale(1)} }
    @keyframes dealMulti { 0%{opacity:0;transform:translateY(-60px) scale(0.6)} 50%{opacity:1;transform:translateY(4px) scale(1.02)} 100%{opacity:1;transform:translateY(0) scale(1)} }
  `;
  document.head.appendChild(s);
}

// ====== HOME PAGE CARD — uses EXACT same DOM structure as home.js ======
// The key: card is position:absolute inside a position:relative wrapper.
// The gradient border uses inset:-Npx + z-index:-1, which only works
// when the parent provides the stacking context.
function buildHomeCard(type, w, h) {
  var configs = {
    offense: {accent:'#7ACC00',bg:'#96CC50',bgEdge:'#4A6A20',label:'OFFENSE',spotColor:'rgba(122,204,0,0.25)',
      art:'<svg viewBox="0 0 448 512" width="48" height="52">'
        +'<defs><linearGradient id="bG_o'+w+'" x1="100" y1="450" x2="350" y2="50"><stop offset="0%" stop-color="#90E040"/><stop offset="100%" stop-color="#D4FF80"/></linearGradient></defs>'
        +'<path fill="url(#bG_o'+w+')" stroke="#7ACC00" stroke-width="8" d="M349.4 44.6c5.9-13.7 1.5-29.7-10.6-38.5s-28.6-8-39.9 1.8l-256 224c-10 8.8-13.6 22.9-8.9 35.3S50.7 288 64 288l111.5 0L98.6 467.4c-5.9 13.7-1.5 29.7 10.6 38.5s28.6 8 39.9-1.8l256-224c10-8.8 13.6-22.9 8.9-35.3s-16.6-20.7-30-20.7l-111.5 0L349.4 44.6z"/></svg>',
      pip:'<svg viewBox="0 0 448 512" width="12" height="14"><path d="M349.4 44.6c5.9-13.7 1.5-29.7-10.6-38.5s-28.6-8-39.9 1.8l-256 224c-10 8.8-13.6 22.9-8.9 35.3S50.7 288 64 288l111.5 0L98.6 467.4c-5.9 13.7-1.5 29.7 10.6 38.5s28.6 8 39.9-1.8l256-224c10-8.8 13.6-22.9 8.9-35.3s-16.6-20.7-30-20.7l-111.5 0L349.4 44.6z" fill="#FFB800" opacity="0.8"/></svg>'},
    torch: {accent:'#FF4511',bg:'#E88050',bgEdge:'#904028',label:'TORCH',spotColor:'rgba(255,69,17,0.25)',
      art:'<svg viewBox="0 -2 44 56" fill="none" width="48" height="52" style="overflow:visible;">'
        +'<defs><linearGradient id="nG_t'+w+'" x1="22" y1="50" x2="22" y2="0"><stop offset="0%" stop-color="#FF6A30"/><stop offset="100%" stop-color="#FFD060"/></linearGradient>'
        +'<linearGradient id="nI_t'+w+'" x1="22" y1="44" x2="22" y2="8"><stop offset="0%" stop-color="#FFAA44"/><stop offset="100%" stop-color="#FFFBE6"/></linearGradient></defs>'
        +'<path d="M22 0C22 0 6 16 4 28C2 40 12 48 18 52C18 52 13 42 18 30C20 24 21 19 22 13C23 19 24 24 26 30C31 42 26 52 26 52C32 48 42 40 40 28C38 16 22 0 22 0Z" fill="url(#nG_t'+w+')" stroke="#FF4511" stroke-width="1.5"/>'
        +'<path d="M22 12C22 12 13 24 12 32C11 40 15 46 19 49C19 49 16 41 19 32C20 28 21 25 22 20C23 25 24 28 25 32C28 41 25 49 25 49C29 46 33 40 32 32C31 24 22 12 22 12Z" fill="url(#nI_t'+w+')" opacity="0.7"/></svg>',
      pip:'<svg viewBox="0 0 5 6" width="12" height="14"><path d="M2.5 0C2.5 0 0.5 2 0.5 3.5C0.5 5 2 5.5 2.5 5.5C3 5.5 4.5 5 4.5 3.5C4.5 2 2.5 0 2.5 0Z" fill="#FFB800" opacity="0.8"/></svg>'},
    defense: {accent:'#4DA6FF',bg:'#6AAAEE',bgEdge:'#385890',label:'DEFENSE',spotColor:'rgba(77,166,255,0.2)',
      art:'<svg viewBox="0 0 512 512" width="48" height="52">'
        +'<defs><linearGradient id="sG_d'+w+'" x1="256" y1="512" x2="256" y2="0"><stop offset="0%" stop-color="#3080D0"/><stop offset="100%" stop-color="#A0D4FF"/></linearGradient></defs>'
        +'<path fill="url(#sG_d'+w+')" stroke="#4DA6FF" stroke-width="8" d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8l0 378.1C394 378 431.1 230.1 432 141.4L256 66.8z"/></svg>',
      pip:'<svg viewBox="0 0 512 512" width="12" height="14"><path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0z" fill="#FFB800" opacity="0.8"/></svg>'},
  };
  var d = configs[type];
  var isTorch = type === 'torch';
  var sc = w / 100; // scale factor relative to 100px reference
  var bw = Math.max(2, Math.round((isTorch ? 4 : 3) * sc));
  var npH = Math.max(12, Math.round((isTorch ? 28 : 24) * sc));

  // Wrapper — TORCH gets gold double frame, others get simple positioning
  var outer = document.createElement('div');
  if(isTorch){
    var framePad = Math.max(2, Math.round(4 * sc));
    outer.style.cssText = 'position:relative;width:'+(w+framePad*2)+'px;height:'+(h+framePad*2)+'px;border-radius:'+Math.round(12*sc)+'px;background:linear-gradient(135deg,#FFB800,#fff,#FFB800);padding:'+framePad+'px;box-shadow:0 0 '+Math.round(20*sc)+'px rgba(255,184,0,0.4),0 4px 16px rgba(0,0,0,0.5);';
  } else {
    outer.style.cssText = 'position:relative;width:'+w+'px;height:'+h+'px;';
  }

  // Card — position:absolute inside the wrapper, exactly like home.js
  var card = document.createElement('div');
  card.style.cssText = 'position:absolute;width:'+w+'px;height:'+h+'px;border-radius:8px;'
    +'background:'+d.bgEdge+';background-image:radial-gradient(ellipse at 50% 40%,'+d.bg+' 0%,'+d.bgEdge+' 100%);'
    +'display:flex;flex-direction:column;align-items:center;justify-content:center;'
    +'box-shadow:0 2px 4px rgba(0,0,0,0.4),'+(isTorch?'0 16px 40px rgba(0,0,0,0.4)':'0 8px 20px rgba(0,0,0,0.25)')+';'
    +'overflow:hidden;position:relative;';

  // TORCH: breathing glow
  if(isTorch){
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

  // Gradient border — z-index:-1 works because card is position:absolute in positioned parent
  var border = document.createElement('div');
  border.style.cssText = 'position:absolute;inset:-'+bw+'px;border-radius:'+(8+bw)+'px;background:linear-gradient(135deg,'+d.accent+',rgba(255,255,255,0.4),'+d.accent+');z-index:-1;';
  card.appendChild(border);

  // Inner margin — subtle inset shadow for depth
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

  // Art icon — scaled to card size
  var artW = Math.round((isTorch ? 60 : 48) * sc);
  var artH = Math.round((isTorch ? 65 : 52) * sc);
  var artWrap = document.createElement('div');
  artWrap.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:'+npH+'px;display:flex;align-items:center;justify-content:center;z-index:3;';
  var scaledArt = d.art.replace(/width="\d+"/, 'width="'+artW+'"').replace(/height="\d+"/, 'height="'+artH+'"');
  if(isTorch){
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
  if(isTorch){
    npT.style.cssText = "font-family:'Teko';font-weight:700;font-size:"+npFs+"px;color:#09081A;letter-spacing:"+npLs+"px;transform:skewX(-8deg);";
  } else {
    npT.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:"+npFs+"px;color:#000;letter-spacing:"+npLs+"px;";
  }
  npT.textContent = d.label;
  np.appendChild(npT);
  card.appendChild(np);

  // Shimmer
  var shim = document.createElement('div');
  if(isTorch){
    shim.style.cssText = 'position:absolute;inset:0;border-radius:8px;background:linear-gradient(105deg,transparent 35%,rgba(255,180,80,0.12) 48%,rgba(255,255,255,0.08) 52%,transparent 65%);animation:torchShimmer 4.5s ease-in-out infinite;pointer-events:none;z-index:8;';
  } else {
    shim.style.cssText = 'position:absolute;inset:0;border-radius:8px;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.06) 50%,transparent 60%);animation:cardShimmer 6s ease-in-out infinite;pointer-events:none;z-index:8;';
  }
  card.appendChild(shim);

  // TORCH: ember sparks
  if(isTorch){
    [-12,8,-6,14,-10].forEach(function(drift){
      var spark = document.createElement('div');
      spark.style.cssText = 'position:absolute;top:10px;left:'+(25+Math.random()*50)+'%;width:'+(1.5+Math.random()*1.5)+'px;height:'+(1.5+Math.random()*1.5)+'px;border-radius:50%;background:#FF8C00;z-index:9;pointer-events:none;opacity:0;animation:torchSpark '+(1.2+Math.random()*1.5)+'s '+(Math.random()*3)+'s ease-out infinite;--sx:'+drift+'px;';
      card.appendChild(spark);
    });
  }

  outer.appendChild(card);
  return outer;
}

export function buildCardMockup() {
  injectStyles();
  var el = document.createElement('div');
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:#0A0804;padding:20px 14px 80px;overflow-y:auto;';

  function sec(text) {
    var t = document.createElement('div');
    t.style.cssText = "font-family:'Teko',sans-serif;font-weight:700;font-size:22px;color:var(--a-gold);letter-spacing:3px;margin:32px 0 12px;border-bottom:1px solid #1E1610;padding-bottom:6px;";
    t.textContent = text;
    return t;
  }
  function row() {
    var r = document.createElement('div');
    r.style.cssText = 'display:flex;flex-wrap:wrap;gap:14px;align-items:flex-end;justify-content:center;';
    return r;
  }
  function lbl(text) {
    var l = document.createElement('div');
    l.style.cssText = "font-family:'Rajdhani',sans-serif;font-weight:600;font-size:9px;color:#aaa;letter-spacing:1px;text-align:center;margin-top:6px;max-width:120px;";
    l.textContent = text;
    return l;
  }
  function wrap(cardEl, labelText) {
    var w = document.createElement('div');
    w.style.cssText = 'text-align:center;';
    w.appendChild(cardEl);
    w.appendChild(lbl(labelText));
    return w;
  }

  // Header
  var hdr = document.createElement('div');
  hdr.style.cssText = "font-family:'Teko',sans-serif;font-weight:700;font-size:32px;color:var(--a-gold);letter-spacing:4px;text-align:center;margin-bottom:16px;text-shadow:2px 2px 0 rgba(0,0,0,0.9);";
  hdr.textContent = 'FINAL CARD DESIGNS';
  el.appendChild(hdr);

  // ============================================================
  // CARD BACKS (= home page cards)
  // ============================================================
  el.appendChild(sec('CARD BACKS — Same as Home Page'));
  var backWrap = document.createElement('div');
  backWrap.style.cssText = 'background:radial-gradient(circle at 50% 50%,#1A1208 0%,#0A0804 70%);border-radius:12px;padding:30px 20px;display:flex;flex-wrap:wrap;gap:20px;align-items:flex-end;justify-content:center;position:relative;overflow:visible;';
  // Warm light pool behind cards (like home page)
  backWrap.innerHTML = '<div style="position:absolute;top:30%;left:50%;transform:translateX(-50%);width:300px;height:200px;background:radial-gradient(circle,rgba(255,120,20,0.08) 0%,transparent 70%);pointer-events:none;"></div>';
  backWrap.appendChild(wrap(buildHomeCard('offense',100,140), 'OFFENSE BACK'));
  backWrap.appendChild(wrap(buildHomeCard('torch',100,140), 'TORCH BACK'));
  backWrap.appendChild(wrap(buildHomeCard('defense',100,140), 'DEFENSE BACK'));
  el.appendChild(backWrap);

  // ============================================================
  // ICON ALTERNATIVES — Offense & Defense
  // ============================================================

  // ============================================================
  // PLAYER CARDS — Madden Style (chosen)
  // ============================================================
  el.appendChild(sec('PLAYER CARDS — Madden Style (chosen)'));
  var playerRow = row();

  var players = [
    { name:'COLT AVERY', pos:'QB', ovr:78, num:7, tier:'silver', teamColor:'#FF4511', img:'/img/players/ct-off-qb-avery.png' },
    { name:'QUEZ SAMPSON', pos:'WR', ovr:80, num:1, tier:'gold', teamColor:'#FF4511', img:'/img/players/ct-off-wr-sampson.png' },
    { name:'MACK TORRES', pos:'FB', ovr:82, num:44, tier:'gold', teamColor:'#CC1A1A', img:'/img/players/ir-off-fb-torres.png' },
    { name:'BO KENDRICK', pos:'QB', ovr:80, num:12, tier:'gold', teamColor:'#CC1A1A', img:'/img/players/ir-off-qb-kendrick.png' },
  ];
  var tierC = { bronze:'#A0522D', silver:'#B0C4D4', gold:'#FFB800' };

  // Abbreviated positions — universally understood by football fans
  var posNames = {QB:'QB',WR:'WR',RB:'RB',FB:'FB',TE:'TE',SLOT:'SLOT',
    CB:'CB',S:'S',LB:'LB',DL:'DL',DE:'DE'};
  function buildMaddenPlayer(p, w, h) {
    var tc = tierC[p.tier] || '#B0C4D4';
    var lg = w > 90;
    var card = document.createElement('div');
    card.style.cssText = 'width:'+w+'px;height:'+h+'px;border-radius:'+(lg?8:6)+'px;border:2px solid '+tc+'44;background:radial-gradient(ellipse at 50% 25%,#141008,#0A0804);position:relative;box-shadow:0 '+(lg?'4px 16px':'3px 10px')+' rgba(0,0,0,0.5);display:flex;flex-direction:column;';
    var fullPos = posNames[p.pos] || p.pos;
    // Top row: OVR centered, #number and position flanking
    var topArea = '<div style="position:relative;padding:'+(lg?'6':'4')+'px 0 '+(lg?'2':'1')+'px;z-index:2;text-align:center;">'
      +'<div style="font-family:\'Teko\';font-weight:700;font-size:'+(lg?32:20)+'px;color:'+tc+';line-height:1;text-shadow:0 0 '+(lg?'10':'6')+'px '+tc+'44;">'+p.ovr+'</div>'
      +'<div style="position:absolute;left:'+(lg?'8':'5')+'px;top:50%;transform:translateY(-50%);font-family:\'Teko\';font-weight:700;font-size:'+(lg?11:8)+'px;color:#fff;opacity:0.7;line-height:1;">#'+(p.num||'')+'</div>'
      +'<div style="position:absolute;right:'+(lg?'8':'5')+'px;top:50%;transform:translateY(-50%);font-family:\'Teko\';font-weight:700;font-size:'+(lg?11:8)+'px;color:#fff;opacity:0.7;line-height:1;">'+fullPos+'</div>'
      +'</div>';
    var numArea = '';
    // Football helmet with football logo inside
    var helmW = lg ? 80 : 52;
    var helmH = lg ? 64 : 42;
    var fbW = lg ? 28 : 18;
    var artArea = '<div style="position:absolute;top:'+(lg?'30':'20')+'px;left:0;right:0;bottom:'+(lg?'26':'18')+'px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 '+(lg?'14':'10')+'px '+tc+'88);">'
      // Helmet
      +'<svg viewBox="0 0 512 411" width="'+helmW+'" height="'+helmH+'" fill="none" style="position:absolute;">'
      +'<path fill="'+tc+'" opacity="0.7" fill-rule="nonzero" d="M214.67 410.6c-14.73-1.18-28.57-6.54-42.64-11.99-25.84-10-52.68-20.39-81.81 4.8-5.1 4.41-12.82 3.85-17.24-1.25l-.81-1.04c-12.22-16.33-23.15-33.53-32.57-51.2-9.54-17.9-17.53-36.25-23.76-54.66-2.2-6.51-4.16-12.94-5.88-19.27C-5.5 218.91-3.09 163.75 18.1 117.61 39.44 71.12 79.58 34.13 139.37 13.89c5.45-1.85 11.01-3.55 16.65-5.08 52.22-14.14 109.49-11.57 157.51 9.95 43.22 19.37 78.9 53.94 96.85 105.29 2.02 5.82-.61 12.14-5.94 14.88-40.41 22.46-66.27 38.89-82.33 53.19l2.36 7.35v.05c6.51 20.34 13.65 42.65 22.23 63.66 16.25-6.42 32-13.62 47.07-21.33 18.65-9.55 36.55-20.02 53.33-30.86 5.1-3.27 11.89-1.79 15.16 3.31.39.6.72 1.24.97 1.88l47.89 111.61c2.04 4.79.41 10.22-3.63 13.16-14.42 11.8-29.24 20-44.13 24.67-15.62 4.89-31.33 5.92-46.8 3.12-19.86-3.58-36.19-14.08-49.89-28.82-20.42 6.63-40.86 11.65-59.62 14.43-4.39 10.72-11.18 20.58-19.66 28.96-13.84 13.67-32.34 23.48-52.39 26.55a88.224 88.224 0 0 1-20.33.74zm-5.19-119.43c15.25 0 27.6 12.36 27.6 27.6 0 15.25-12.35 27.6-27.6 27.6-15.24 0-27.6-12.35-27.6-27.6 0-15.24 12.36-27.6 27.6-27.6zM430 348.27l-13.38-27.88c-7.45 3.44-15.09 6.71-22.83 9.77l-4.08 1.59c9.07 7.9 19.23 13.36 30.71 15.43 3.17.57 6.37.94 9.58 1.09zm-22.89-47.69-15.86-33.03c-11.63 5.61-23.54 10.88-35.65 15.69 5.47 11.3 11.5 21.83 18.24 30.98 3.98-1.44 7.94-2.94 11.88-4.5a441.89 441.89 0 0 0 21.39-9.14zm3.69-42.91 15.95 33.21c13.14-6.98 25.12-14.42 35.2-22.05l-13.93-32.46a632.569 632.569 0 0 1-37.22 21.3zm25.46 53.03 16.82 35.04c1.25-.33 2.5-.69 3.75-1.08 10.26-3.21 20.57-8.55 30.79-16.02l-16.78-39.09c-10.24 7.35-21.96 14.47-34.58 21.15zm-130.93-99.16c-10.71 18.13-7.02 35.74-1.3 63.05l.62 2.94 2.22-.64a429.55 429.55 0 0 0 19.26-6.13c-7.98-19.65-14.68-40.11-20.8-59.22zm3.63 87.55c1.01 5.45 2 11.14 2.91 17.1.77 5.03.96 10.07.63 15.04 12.68-2.31 26.09-5.64 39.67-9.77-6.34-9.4-12.02-19.72-17.19-30.55-7.23 2.5-14.57 4.86-22.01 7.03l-4.01 1.15zm-30.49 56.97c-4.35.29-8.67.52-12.47.65-3.79.12-6.98-2.82-7.19-6.6-.92-16.66-2.73-33.15-4.47-49.06-3.86-35.28-7.44-67.91-.7-95.91 4.65-19.3 20.43-38.98 40.59-56.85 22.96-20.37 51.8-38.64 75.92-51.17-16.8-25.63-40.05-44.15-66.59-56.05-42.76-19.16-94.13-21.36-141.22-8.6-5.26 1.42-10.31 2.96-15.12 4.59C94.25 55 58.89 87.32 40.32 127.77c-18.74 40.8-20.7 90.24-6.7 141.9 1.61 5.95 3.42 11.87 5.4 17.74 5.86 17.31 13.3 34.44 22.13 51.02 7 13.13 14.89 25.98 23.58 38.38 35.7-24.37 66.43-12.48 96.12-.99 12.3 4.76 24.4 9.45 35.74 10.36 4.97.39 9.93.19 14.77-.55 14.85-2.28 28.58-9.58 38.88-19.75 3.08-3.04 5.85-6.34 8.23-9.82z"/>'
      +'</svg>'
      +'</div>';
    // Bottom gradient
    var botGrad = '<div style="position:absolute;bottom:0;left:0;right:0;height:35%;background:linear-gradient(transparent,#0A0804);z-index:1;"></div>';
    // Name bar
    var nameBar = '<div style="position:absolute;bottom:0;left:0;right:0;z-index:2;background:'+p.teamColor+'33;padding:'+(lg?'6px 8px':'4px 5px')+';border-top:1px solid '+p.teamColor+'44;border-bottom:2px solid '+p.teamColor+';border-radius:0 0 '+(lg?'6':'4')+'px '+(lg?'6':'4')+'px;">'
      +'<div style="font-family:\'Teko\';font-weight:700;font-size:'+(lg?12:9)+'px;color:#fff;letter-spacing:'+(lg?'1':'0.5')+'px;text-align:center;line-height:1;white-space:nowrap;">'+(lg?p.name:p.name.split(' ').pop())+'</div></div>';
    card.innerHTML = topArea + numArea + artArea + botGrad + nameBar;
    return card;
  }

  // Draft size
  players.forEach(function(p) {
    playerRow.appendChild(wrap(buildMaddenPlayer(p,110,154), p.name+' (draft)'));
  });
  el.appendChild(playerRow);

  // Gameplay size
  el.appendChild(sec('PLAYER CARDS — Gameplay Size'));
  var compRow = row();
  players.forEach(function(p) {
    compRow.appendChild(wrap(buildMaddenPlayer(p,80,110), p.name.split(' ').pop()+' (gameplay)'));
  });
  el.appendChild(compRow);

  // ============================================================
  // PLAY CARDS — Split V3
  // ============================================================
  // Offense placeholder: Runner (FA person-running) — uses CATFILL as placeholder
  var routeSvg = '<svg viewBox="0 0 448 512" fill="none"><path fill="CATFILL" opacity="0.7" d="M320 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM125.7 175.5c9.9-9.9 23.4-15.5 37.5-15.5c1.9 0 3.8 .1 5.6 .3L137.6 254c-9.3 28 1.7 58.8 26.8 74.5l86.2 53.9-25.4 88.8c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l28.7-100.4c5.9-20.6-2.6-42.6-20.7-53.9L238 299l30.9-82.4 5.1 12.3C289 264.7 323.9 288 362.7 288l21.3 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-21.3 0c-12.9 0-24.6-7.8-29.5-19.7l-6.3-15c-14.6-35.1-44.1-61.9-80.5-73.1l-48.7-15c-11.1-3.4-22.7-5.2-34.4-5.2c-31 0-60.8 12.3-82.7 34.3L57.4 153.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l23.1-23.1zM91.2 352L32 352c-17.7 0-32 14.3-32 32s14.3 32 32 32l69.6 0c19 0 36.2-11.2 43.9-28.5L157 361.6l-9.5-6c-17.5-10.9-30.5-26.8-37.9-44.9L91.2 352z"/></svg>';
  // Defense placeholder: Lock (FA lock) — uses CATFILL as placeholder
  var defSvg = '<svg viewBox="0 0 448 512" fill="none"><path fill="CATFILL" opacity="0.7" d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"/></svg>';
  var riskI = { high:'\u26A1 HIGH', med:'\u25C6 MED', low:'\u25CF LOW' };
  var riskC = { high:'#ff0040', med:'#ff8800', low:'#00ff44' };

  var plays = [
    { name:'HAIL MARY', cat:'DEEP', catColor:'#7ACC00', risk:'high', riskColor:'#7ACC00', desc:'Go deep or bust', svg:routeSvg, bg:'#0A1A06' },
    { name:'MESH', cat:'SHORT', catColor:'#7ACC00', risk:'low', riskColor:'#7ACC00', desc:'Man killer', svg:routeSvg, bg:'#0A1A06' },
    { name:'COVER 0', cat:'BLITZ', catColor:'#4DA6FF', risk:'high', riskColor:'#4DA6FF', desc:'All out rush', svg:defSvg, bg:'#0A1420' },
    { name:'COVER 3', cat:'ZONE', catColor:'#4DA6FF', risk:'low', riskColor:'#4DA6FF', desc:'Deep thirds', svg:defSvg, bg:'#0A1420' },
  ];

  // 3 play card layout options
  function buildPlayV1(p, w, h) {
    // V1: Nameplate top, diagram fills center, category+risk bottom bar
    var svgTag = p.svg.replace('CATFILL', p.catColor).replace('fill="none">', 'width="'+(w*0.75)+'" height="'+(h*0.45)+'" fill="none">');
    var card = document.createElement('div');
    card.style.cssText = 'width:'+w+'px;height:'+h+'px;border-radius:7px;border:2px solid '+p.catColor+'44;background:radial-gradient(ellipse at 50% 50%,'+p.bg+',#0E0A06);overflow:hidden;box-shadow:0 3px 12px rgba(0,0,0,0.5);display:flex;flex-direction:column;';
    // Category stripe + Name bar top
    card.innerHTML = '<div style="height:3px;background:'+p.catColor+';border-radius:5px 5px 0 0;"></div>'
      +'<div style="background:'+p.catColor+'22;padding:4px 6px;border-bottom:1px solid '+p.catColor+'33;">'
      +'<div style="font-family:\'Teko\';font-weight:700;font-size:'+(w>90?14:11)+'px;color:#fff;letter-spacing:1px;line-height:1;white-space:nowrap;">'+p.name+'</div></div>'
      // Diagram fills center
      +'<div style="flex:1;display:flex;align-items:center;justify-content:center;">'+svgTag+'</div>'
      // Bottom bar: category + risk
      +'<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 6px;background:rgba(0,0,0,0.3);border-top:1px solid #1E1610;">'
      +'<div style="font-family:\'Rajdhani\';font-weight:700;font-size:'+(w>90?8:6)+'px;color:'+p.catColor+';letter-spacing:0.5px;">'+p.cat+'</div>'
      +'<div style="font-family:\'Rajdhani\';font-weight:700;font-size:'+(w>90?8:6)+'px;color:'+(p.riskColor||p.catColor)+';">'+riskI[p.risk]+'</div></div>';
    return card;
  }

  // Play cards — Option A chosen
  el.appendChild(sec('PLAY CARDS — Selection Size (100x150)'));
  var pSelRow = row();
  plays.forEach(function(p) { pSelRow.appendChild(wrap(buildPlayV1(p,100,150), p.name)); });
  el.appendChild(pSelRow);

  el.appendChild(sec('PLAY CARDS — Gameplay Size (80x110)'));
  var pGameRow = row();
  plays.forEach(function(p) { pGameRow.appendChild(wrap(buildPlayV1(p,80,110), p.name)); });
  el.appendChild(pGameRow);

  // ============================================================
  // TORCH CARDS — Centered Flame V1 (chosen)
  // ============================================================
  el.appendChild(sec('TORCH CARDS — Centered Flame V1'));
  var torchRow = row();
  var tTiers = { GOLD:'#FFB800', SILVER:'#B0C4D4', BRONZE:'#A0522D' };
  var torchCards = [
    { name:'CHALLENGE', tier:'GOLD', effect:'Challenge a play' },
    { name:'MOMENTUM', tier:'SILVER', effect:'+3 yards next play' },
    { name:'AUDIBLE', tier:'BRONZE', effect:'Change your play' },
  ];
  var flamePath = 'M22 2C22 2 10 14 9 22C8 30 13 36 17 38C17 38 14 32 17 26C19 22 21 18 22 14C23 18 25 22 27 26C30 32 27 38 27 38C31 36 36 30 35 22C34 14 22 2 22 2Z';
  torchCards.forEach(function(tc) {
    var bc = tTiers[tc.tier];
    var card = document.createElement('div');
    card.style.cssText = 'width:100px;height:140px;border-radius:7px;border:3px solid '+bc+';background:radial-gradient(ellipse at 50% 35%,#1a0800,#0A0804);position:relative;box-shadow:0 4px 16px rgba(0,0,0,0.5),0 0 12px rgba(255,69,17,0.15);display:flex;flex-direction:column;align-items:center;';
    card.innerHTML = '<div style="font-family:\'Rajdhani\';font-weight:700;font-size:8px;color:'+bc+';letter-spacing:2px;text-align:center;padding:8px 0 0;opacity:0.7;">'+tc.tier+'</div>'
      +'<div style="display:flex;align-items:center;justify-content:center;height:56px;margin-top:2px;"><svg viewBox="0 0 44 44" width="42" height="42" fill="none"><defs><linearGradient id="tg_'+tc.tier+'" x1="22" y1="40" x2="22" y2="0"><stop offset="0%" stop-color="#FF4511"/><stop offset="100%" stop-color="#FFB800"/></linearGradient></defs><path d="'+flamePath+'" fill="url(#tg_'+tc.tier+')" stroke="#FF4511" stroke-width="0.8"/></svg></div>'
      +'<div style="font-family:\'Teko\';font-weight:700;font-size:14px;color:#fff;text-align:center;letter-spacing:1px;line-height:1;padding:0 6px;white-space:nowrap;">'+tc.name+'</div>'
      +'<div style="font-family:\'Rajdhani\';font-size:9px;color:#aaa;text-align:center;padding:2px 6px;line-height:1;white-space:nowrap;">'+tc.effect+'</div>'
      +'<div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:'+bc+';opacity:0.6;border-radius:0 0 5px 5px;"></div>';
    torchRow.appendChild(wrap(card, tc.tier + ' TIER'));
  });
  el.appendChild(torchRow);

  // ============================================================
  // FLIP + DEAL DEMO
  // ============================================================
  el.appendChild(sec('SNAP FLIP + SLIDE DEAL'));
  var demoRow = row();

  // Flip demo
  var flipCard = document.createElement('div');
  flipCard.style.cssText = 'width:80px;height:110px;perspective:900px;cursor:pointer;';
  var flipInner = document.createElement('div');
  flipInner.style.cssText = 'width:100%;height:100%;position:relative;transform-style:preserve-3d;transition:transform 0.5s ease-out;';
  var flipFront = buildMaddenPlayer({name:'COLT AVERY',pos:'QB',ovr:78,num:7,tier:'silver',teamColor:'#FF4511'},80,110);
  flipFront.style.cssText += ';position:absolute;inset:0;backface-visibility:hidden;';
  var flipBack = buildHomeCard('offense',80,110);
  flipBack.style.cssText += ';position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(180deg);';
  flipInner.appendChild(flipFront);
  flipInner.appendChild(flipBack);
  var isFlipped = false;
  flipCard.onclick = function() {
    isFlipped = !isFlipped;
    flipInner.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
  };
  flipCard.appendChild(flipInner);
  demoRow.appendChild(wrap(flipCard, 'TAP TO FLIP'));

  el.appendChild(demoRow);

  // Slide deal — all 3 types
  el.appendChild(sec('SLIDE DEAL — All 3 Types (tap each deck)'));
  var dealRow = row();
  var dealTypes = [
    {type:'offense',player:{name:'QUEZ SAMPSON',pos:'WR',ovr:80,num:1,tier:'gold',teamColor:'#FF4511',img:'/img/players/ct-off-wr-sampson.png'},label:'OFFENSE'},
    {type:'torch',player:{name:'RIO VASQUEZ',pos:'SLOT',ovr:82,num:3,tier:'gold',teamColor:'#FF4511',img:'/img/players/ct-off-slot-vasquez.png'},label:'TORCH'},
    {type:'defense',player:{name:'ZION CREWS',pos:'CB',ovr:82,num:24,tier:'gold',teamColor:'#FF4511',img:'/img/players/ct-def-cb-crews.png'},label:'DEFENSE'},
  ];
  dealTypes.forEach(function(dt) {
    var dw = document.createElement('div');
    dw.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;';
    var deck = document.createElement('div');
    deck.style.cssText = 'width:70px;height:98px;position:relative;cursor:pointer;';
    for (var s = 2; s >= 0; s--) {
      var sc = buildHomeCard(dt.type,62,86);
      sc.style.cssText += ';position:absolute;top:'+s*2+'px;left:'+s+'px;';
      deck.appendChild(sc);
    }
    var target = document.createElement('div');
    target.style.cssText = 'width:80px;height:110px;border:1px dashed #1E1610;border-radius:6px;display:flex;align-items:center;justify-content:center;';
    target.innerHTML = '<div style="font-family:\'Rajdhani\';font-size:8px;color:#333;">tap deck</div>';
    var isDealt = false;
    deck.onclick = function() {
      if (isDealt) { target.innerHTML = '<div style="font-family:\'Rajdhani\';font-size:8px;color:#333;">tap deck</div>'; target.style.border = '1px dashed #1E1610'; isDealt = false; return; }
      isDealt = true;
      var dc = buildMaddenPlayer(dt.player,80,110);
      dc.style.animation = 'dealSlide 0.5s cubic-bezier(0.22,1.3,0.36,1) both';
      target.innerHTML = '';
      target.style.border = 'none';
      target.appendChild(dc);
    };
    dw.appendChild(deck);
    dw.appendChild(target);
    dealRow.appendChild(wrap(dw, dt.label));
  });
  el.appendChild(dealRow);

  // ============================================================
  // MULTI-CARD DEAL — 3 deck types
  // ============================================================
  el.appendChild(sec('MULTI-CARD DEAL — All 3 Types (tap each deck)'));
  var multiRow = row();

  var multiTypes = [
    {type:'offense',label:'OFFENSE',players:[
      {name:'COLT AVERY',pos:'QB',ovr:78,num:7,tier:'silver',teamColor:'#FF4511',img:'/img/players/ct-off-qb-avery.png'},
      {name:'QUEZ SAMPSON',pos:'WR',ovr:80,num:1,tier:'gold',teamColor:'#FF4511',img:'/img/players/ct-off-wr-sampson.png'},
      {name:'RIO VASQUEZ',pos:'SLOT',ovr:82,num:3,tier:'gold',teamColor:'#FF4511',img:'/img/players/ct-off-slot-vasquez.png'},
      {name:'KIRBY WALSH',pos:'RB',ovr:72,num:22,tier:'bronze',teamColor:'#FF4511',img:'/img/players/ct-off-rb-walsh.png'},
    ]},
    {type:'torch',label:'TORCH',players:[
      {name:'MACK TORRES',pos:'FB',ovr:82,num:44,tier:'gold',teamColor:'#CC1A1A',img:'/img/players/ir-off-fb-torres.png'},
      {name:'JAYLEN SIMS',pos:'RB',ovr:78,num:5,tier:'silver',teamColor:'#CC1A1A',img:'/img/players/ir-off-rb-sims.png'},
      {name:'BO KENDRICK',pos:'QB',ovr:80,num:12,tier:'gold',teamColor:'#CC1A1A',img:'/img/players/ir-off-qb-kendrick.png'},
      {name:'CADE BUCKLEY',pos:'TE',ovr:74,num:88,tier:'bronze',teamColor:'#CC1A1A',img:'/img/players/ir-off-te-buckley.png'},
    ]},
    {type:'defense',label:'DEFENSE',players:[
      {name:'ZION CREWS',pos:'CB',ovr:82,num:24,tier:'gold',teamColor:'#FF4511',img:'/img/players/ct-def-cb-crews.png'},
      {name:'ANDRE KNOX',pos:'S',ovr:80,num:34,tier:'gold',teamColor:'#FF4511',img:'/img/players/ct-def-s-knox.png'},
      {name:'JACE WILDER',pos:'LB',ovr:78,num:55,tier:'silver',teamColor:'#FF4511',img:'/img/players/ct-def-lb-wilder.png'},
      {name:'KAI OROZCO',pos:'S',ovr:72,num:8,tier:'bronze',teamColor:'#FF4511',img:'/img/players/ct-def-s-orozco.png'},
    ]},
  ];

  multiTypes.forEach(function(mt) {
    var mWrap = document.createElement('div');
    mWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:10px;';

    var mDeck = document.createElement('div');
    mDeck.style.cssText = 'width:70px;height:98px;position:relative;cursor:pointer;';
    for (var ms = 3; ms >= 0; ms--) {
      var msc = buildHomeCard(mt.type, 62, 86);
      msc.style.cssText += ';position:absolute;top:'+ms*2+'px;left:'+ms+'px;';
      mDeck.appendChild(msc);
    }

    var mHand = document.createElement('div');
    mHand.style.cssText = 'display:flex;gap:4px;min-height:110px;align-items:flex-end;';
    var mHandInner = document.createElement('div');
    mHandInner.style.cssText = 'display:flex;gap:4px;';
    mHand.appendChild(mHandInner);

    var mLabel = document.createElement('div');
    mLabel.style.cssText = "font-family:'Rajdhani';font-size:9px;color:#666;text-align:center;";
    mLabel.textContent = 'Tap to deal';

    var mDealt = false;
    mDeck.onclick = function() {
      if (mDealt) {
        mHandInner.innerHTML = '';
        mLabel.textContent = 'Tap to deal';
        mDealt = false;
        return;
      }
      mDealt = true;
      mLabel.textContent = 'Tap to reset';
      mt.players.forEach(function(mp, idx) {
        var pc = buildMaddenPlayer(mp, 68, 95);
        pc.style.opacity = '0';
        pc.style.animation = 'dealMulti 0.4s cubic-bezier(0.22,1.3,0.36,1) ' + (idx * 0.12) + 's both';
        mHandInner.appendChild(pc);
      });
    };

    mWrap.appendChild(mDeck);
    mWrap.appendChild(mHand);
    mWrap.appendChild(lbl(mt.label));
    multiRow.appendChild(mWrap);
  });
  el.appendChild(multiRow);

  // Footer
  var foot = document.createElement('div');
  foot.style.cssText = "position:fixed;bottom:8px;left:0;right:0;text-align:center;font-family:'Rajdhani',sans-serif;font-size:10px;color:#ffffff33;letter-spacing:1px;z-index:100;";
  foot.textContent = 'CARD MOCKUPS v3 \u00b7 v' + VERSION;
  el.appendChild(foot);
  return el;
}
