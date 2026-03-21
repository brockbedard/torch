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
    @keyframes dealSlide { 0%{opacity:0;transform:translateX(-120px) rotate(-30deg) scale(0.5)} 70%{opacity:1;transform:translateX(5px) rotate(2deg) scale(1.02)} 100%{transform:translateX(0) rotate(0deg) scale(1)} }
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
    offense: {accent:'#7ACC00',bg:'#5A9E00',bgEdge:'#2A4A00',label:'OFFENSE',spotColor:'rgba(255,255,255,0.1)',
      art:'<svg viewBox="0 0 448 512" width="52" height="56">'
        +'<path fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.4)" stroke-width="6" d="M349.4 44.6c5.9-13.7 1.5-29.7-10.6-38.5s-28.6-8-39.9 1.8l-256 224c-10 8.8-13.6 22.9-8.9 35.3S50.7 288 64 288l111.5 0L98.6 467.4c-5.9 13.7-1.5 29.7 10.6 38.5s28.6 8 39.9-1.8l256-224c10-8.8 13.6-22.9 8.9-35.3s-16.6-20.7-30-20.7l-111.5 0L349.4 44.6z"/></svg>',
      pip:'<div style="width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.3);"></div>'},
    torch: {accent:'#FF4511',bg:'#CC3A10',bgEdge:'#6A1A08',label:'TORCH',spotColor:'rgba(255,255,255,0.1)',
      art:'<svg viewBox="-8 -10 60 72" fill="none" width="52" height="56">'
        +'<defs><linearGradient id="nG_t'+w+'" x1="22" y1="50" x2="22" y2="0"><stop offset="0%" stop-color="#FF8844"/><stop offset="100%" stop-color="#FFDD88"/></linearGradient>'
        +'<linearGradient id="nI_t'+w+'" x1="22" y1="44" x2="22" y2="8"><stop offset="0%" stop-color="#FFCC66"/><stop offset="100%" stop-color="#FFFBE6"/></linearGradient></defs>'
        +'<path d="M22 0C22 0 6 16 4 28C2 40 12 48 18 52C18 52 13 42 18 30C20 24 21 19 22 13C23 19 24 24 26 30C31 42 26 52 26 52C32 48 42 40 40 28C38 16 22 0 22 0Z" fill="url(#nG_t'+w+')" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>'
        +'<path d="M22 12C22 12 13 24 12 32C11 40 15 46 19 49C19 49 16 41 19 32C20 28 21 25 22 20C23 25 24 28 25 32C28 41 25 49 25 49C29 46 33 40 32 32C31 24 22 12 22 12Z" fill="url(#nI_t'+w+')" opacity="0.7"/></svg>',
      pip:'<div style="width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.3);"></div>'},
    defense: {accent:'#4DA6FF',bg:'#3A7ACC',bgEdge:'#1A3A66',label:'DEFENSE',spotColor:'rgba(255,255,255,0.1)',
      art:'<svg viewBox="0 0 512 512" width="52" height="56">'
        +'<path fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.4)" stroke-width="6" d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8l0 378.1C394 378 431.1 230.1 432 141.4L256 66.8z"/></svg>',
      pip:'<div style="width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.3);"></div>'},
  };
  var d = configs[type];
  var isTorch = type === 'torch';
  var bw = isTorch ? 4 : 3;

  // Wrapper provides the stacking context (position:relative)
  // so the card's z-index:-1 border shows correctly
  var outer = document.createElement('div');
  outer.style.cssText = 'position:relative;width:'+w+'px;height:'+h+'px;';

  // Card — position:absolute inside the wrapper, exactly like home.js
  var card = document.createElement('div');
  card.style.cssText = 'position:absolute;width:'+w+'px;height:'+h+'px;border-radius:8px;'
    +'background:radial-gradient(ellipse at 50% 40%,'+d.bg+' 0%,'+d.bgEdge+' 100%);'
    +'display:flex;flex-direction:column;align-items:center;justify-content:center;'
    +'box-shadow:0 2px 4px rgba(0,0,0,0.4),'+(isTorch?'0 16px 40px rgba(0,0,0,0.4)':'0 8px 20px rgba(0,0,0,0.25)')+';'
    +'overflow:hidden;';

  // TORCH: breathing glow
  if(isTorch){
    var glow = document.createElement('div');
    glow.style.cssText = 'position:absolute;inset:-8px;border-radius:16px;background:#FF4511;filter:blur(12px);opacity:0.15;z-index:-2;pointer-events:none;animation:torchGlow 3s ease-in-out infinite;';
    card.appendChild(glow);
  }

  // Bevel
  var bevel = document.createElement('div');
  bevel.style.cssText = 'position:absolute;inset:0;border-radius:8px;box-shadow:inset 1px 1px 3px rgba(255,255,255,0.06),inset -1px -1px 3px rgba(0,0,0,0.3);pointer-events:none;z-index:7;';
  card.appendChild(bevel);

  // Gradient border — z-index:-1 works because card is position:absolute in positioned parent
  var border = document.createElement('div');
  border.style.cssText = 'position:absolute;inset:-'+bw+'px;border-radius:'+(8+bw)+'px;background:linear-gradient(135deg,'+d.accent+',rgba(255,255,255,0.4),'+d.accent+');z-index:-1;';
  card.appendChild(border);

  // Inner margin — subtle inset shadow for depth, not a visible border
  var margin = document.createElement('div');
  margin.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:'+(isTorch?'20':'18')+'px;border-radius:8px 8px 0 0;box-shadow:inset 0 0 8px rgba(0,0,0,0.2);pointer-events:none;z-index:4;';
  card.appendChild(margin);

  // Corner pips
  var pTL = document.createElement('div');
  pTL.style.cssText = 'position:absolute;top:8px;left:8px;z-index:5;';
  pTL.innerHTML = d.pip;
  card.appendChild(pTL);
  var pBR = document.createElement('div');
  pBR.style.cssText = 'position:absolute;bottom:'+(isTorch?'24':'22')+'px;right:8px;z-index:5;transform:rotate(180deg);';
  pBR.innerHTML = d.pip;
  card.appendChild(pBR);

  // Spotlight — subtle on vivid backgrounds
  var spot = document.createElement('div');
  spot.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-55%);width:80px;height:80px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.1) 0%,transparent 70%);z-index:2;pointer-events:none;';
  card.appendChild(spot);

  // Divider
  var div = document.createElement('div');
  div.style.cssText = 'position:absolute;bottom:'+(isTorch?'22':'20')+'px;left:15%;right:15%;height:1px;background:'+d.accent+'22;z-index:5;';
  card.appendChild(div);

  // Art icon
  var artWrap = document.createElement('div');
  artWrap.style.cssText = 'display:flex;align-items:center;justify-content:center;width:56px;height:60px;z-index:3;';
  if(isTorch){
    artWrap.innerHTML = d.art.replace('stroke="#FF4511" stroke-width="1.5"','stroke="#FF4511" stroke-width="1.5" style="animation:flameSway 2.5s ease-in-out infinite;transform-origin:50% 100%;"');
  } else {
    artWrap.innerHTML = d.art;
  }
  card.appendChild(artWrap);

  // Nameplate
  var npH = isTorch ? 20 : 18;
  var np = document.createElement('div');
  np.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:'+npH+'px;background:'+d.accent+(isTorch?'ee':'dd')+';display:flex;align-items:center;justify-content:center;z-index:5;border-radius:0 0 6px 6px;';
  var npT = document.createElement('div');
  if(isTorch){
    npT.style.cssText = "font-family:'Teko';font-weight:700;font-size:"+(w>=100?'16':'12')+"px;color:#09081A;letter-spacing:3px;transform:skewX(-8deg);";
  } else {
    npT.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:"+(w>=100?'11':'9')+"px;color:#000;letter-spacing:2px;";
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
  // PLAYER CARDS — Madden Style (chosen)
  // ============================================================
  el.appendChild(sec('PLAYER CARDS — Madden Style (chosen)'));
  var playerRow = row();

  var players = [
    { name:'COLT AVERY', pos:'QB', ovr:78, num:7, tier:'silver', teamColor:'#FF4511' },
    { name:'QUEZ SAMPSON', pos:'WR', ovr:80, num:1, tier:'gold', teamColor:'#FF4511' },
    { name:'MACK TORRES', pos:'FB', ovr:82, num:44, tier:'gold', teamColor:'#CC1A1A' },
    { name:'BO KENDRICK', pos:'QB', ovr:80, num:12, tier:'gold', teamColor:'#CC1A1A' },
  ];
  var tierC = { bronze:'#A0522D', silver:'#B0C4D4', gold:'#FFB800' };

  var posNames = {QB:'QUARTERBACK',WR:'WIDE RECEIVER',RB:'RUNNING BACK',FB:'FULLBACK',TE:'TIGHT END',SLOT:'SLOT RECEIVER',
    CB:'CORNERBACK',S:'SAFETY',LB:'LINEBACKER',DL:'DEFENSIVE LINE',DE:'DEFENSIVE END'};
  function buildMaddenPlayer(p, w, h) {
    var tc = tierC[p.tier] || '#B0C4D4';
    var card = document.createElement('div');
    card.style.cssText = 'width:'+w+'px;height:'+h+'px;border-radius:8px;border:2px solid '+tc+'44;background:radial-gradient(ellipse at 50% 25%,#141008,#0A0804);position:relative;box-shadow:0 4px 16px rgba(0,0,0,0.5);display:flex;flex-direction:column;';
    var fullPos = posNames[p.pos] || p.pos;
    // OVR centered top
    var topArea = '<div style="text-align:center;padding:'+(w>90?'6':'4')+'px 0 0;position:relative;z-index:2;">'
      +'<div style="font-family:\'Teko\';font-weight:700;font-size:'+(w>90?36:24)+'px;color:'+tc+';line-height:0.85;text-shadow:0 0 10px '+tc+'44;">'+p.ovr+'</div>'
      +'<div style="font-family:\'Rajdhani\';font-weight:600;font-size:'+(w>90?7:6)+'px;color:#fff;letter-spacing:1px;margin-top:-1px;opacity:0.7;">'+fullPos+'</div></div>';
    // Jersey number (left-aligned below OVR/position block)
    var numArea = '<div style="position:absolute;top:'+(w>90?'48':'34')+'px;left:'+(w>90?'8':'5')+'px;font-family:\'Teko\';font-weight:700;font-size:'+(w>90?14:11)+'px;color:#fff;opacity:0.7;line-height:1;z-index:2;">#'+(p.num||'')+'</div>';
    // Art placeholder
    var artArea = '<div style="flex:1;display:flex;align-items:center;justify-content:center;"><div style="width:'+(w*0.55)+'px;height:'+(h*0.4)+'px;border-radius:50% 50% 0 0;background:linear-gradient(180deg,'+p.teamColor+'33,transparent);opacity:0.4;"></div></div>';
    // Bottom gradient
    var botGrad = '<div style="position:absolute;bottom:0;left:0;right:0;height:35%;background:linear-gradient(transparent,#0A0804);z-index:1;"></div>';
    // Name bar
    var nameBar = '<div style="position:absolute;bottom:0;left:0;right:0;z-index:2;background:'+p.teamColor+'22;padding:'+(w>90?'5px 6px':'3px 4px')+';border-top:1px solid '+p.teamColor+'44;border-bottom:2px solid '+p.teamColor+';">'
      +'<div style="font-family:\'Teko\';font-weight:700;font-size:'+(w>90?12:9)+'px;color:#fff;letter-spacing:1px;text-align:center;line-height:1.1;">'+(w>90?p.name:p.name.split(' ').pop())+'</div></div>';
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
  var routeSvg = '<svg viewBox="0 0 50 40" fill="none">'
    +'<circle cx="25" cy="35" r="3" fill="#FFB800" opacity="0.8"/>'
    +'<circle cx="12" cy="32" r="2" fill="#FFB800" opacity="0.6"/>'
    +'<circle cx="38" cy="32" r="2" fill="#FFB800" opacity="0.6"/>'
    +'<path d="M12 32L8 18" stroke="#FFB800" stroke-width="1.2" opacity="0.7"/>'
    +'<path d="M38 32L42 15" stroke="#FFB800" stroke-width="1.2" opacity="0.7"/>'
    +'<polygon points="8,17 9.5,19 6.5,19" fill="#FFB800" opacity="0.6"/>'
    +'<polygon points="42,14 43.5,16 40.5,16" fill="#FFB800" opacity="0.6"/></svg>';
  var defSvg = '<svg viewBox="0 0 50 40" fill="none">'
    +'<circle cx="15" cy="10" r="2" fill="#4DA6FF" opacity="0.7"/>'
    +'<circle cx="35" cy="10" r="2" fill="#4DA6FF" opacity="0.7"/>'
    +'<circle cx="25" cy="15" r="2" fill="#4DA6FF" opacity="0.7"/>'
    +'<path d="M8 8Q25 28 42 8" stroke="#4DA6FF" stroke-width="1" stroke-dasharray="2 1.5" fill="none" opacity="0.5"/>'
    +'<circle cx="25" cy="34" r="2.5" fill="#4DA6FF" opacity="0.6"/></svg>';
  var riskI = { high:'\u26A1 HIGH', med:'\u25C6 MED', low:'\u25CF LOW' };
  var riskC = { high:'#ff0040', med:'#ff8800', low:'#00ff44' };

  var plays = [
    { name:'HAIL MARY', cat:'DEEP PASS', catColor:'#ff0040', risk:'high', desc:'Go deep, big play or bust', svg:routeSvg, bg:'#0A1A06' },
    { name:'MESH', cat:'SHORT PASS', catColor:'#00ff44', risk:'low', desc:'Man coverage killer', svg:routeSvg, bg:'#0A1A06' },
    { name:'COVER 0 BLITZ', cat:'BLITZ', catColor:'#ff0040', risk:'high', desc:'All out rush, no safety', svg:defSvg, bg:'#0A1420' },
    { name:'COVER 3 SKY', cat:'ZONE', catColor:'#4DA6FF', risk:'low', desc:'Deep thirds coverage', svg:defSvg, bg:'#0A1420' },
  ];

  // 3 play card layout options
  function buildPlayV1(p, w, h) {
    // V1: Nameplate top, diagram fills center, category+risk bottom bar
    var svgTag = p.svg.replace('fill="none">', 'width="'+(w*0.75)+'" height="'+(h*0.45)+'" fill="none">');
    var card = document.createElement('div');
    card.style.cssText = 'width:'+w+'px;height:'+h+'px;border-radius:7px;border:2px solid '+p.catColor+'44;background:radial-gradient(ellipse at 50% 50%,'+p.bg+',#0E0A06);overflow:hidden;box-shadow:0 3px 12px rgba(0,0,0,0.5);display:flex;flex-direction:column;';
    // Name bar top
    card.innerHTML = '<div style="background:'+p.catColor+'22;padding:4px 6px;border-bottom:1px solid '+p.catColor+'33;">'
      +'<div style="font-family:\'Teko\';font-weight:700;font-size:'+(w>90?14:11)+'px;color:#fff;letter-spacing:1px;line-height:1;">'+p.name+'</div></div>'
      // Diagram fills center
      +'<div style="flex:1;display:flex;align-items:center;justify-content:center;">'+svgTag+'</div>'
      // Bottom bar: category + risk
      +'<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 6px;background:rgba(0,0,0,0.3);border-top:1px solid #1E1610;">'
      +'<div style="font-family:\'Rajdhani\';font-weight:700;font-size:'+(w>90?8:6)+'px;color:'+p.catColor+';letter-spacing:0.5px;">'+p.cat+'</div>'
      +'<div style="font-family:\'Rajdhani\';font-weight:700;font-size:'+(w>90?8:6)+'px;color:'+riskC[p.risk]+';">'+riskI[p.risk]+'</div></div>';
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
    { name:'CHALLENGE FLAG', tier:'GOLD', effect:'Challenge a play call' },
    { name:'MOMENTUM SHIFT', tier:'SILVER', effect:'+3 yards next play' },
    { name:'AUDIBLE', tier:'BRONZE', effect:'Change your play at the line' },
  ];
  var flamePath = 'M22 2C22 2 10 14 9 22C8 30 13 36 17 38C17 38 14 32 17 26C19 22 21 18 22 14C23 18 25 22 27 26C30 32 27 38 27 38C31 36 36 30 35 22C34 14 22 2 22 2Z';
  torchCards.forEach(function(tc) {
    var bc = tTiers[tc.tier];
    var card = document.createElement('div');
    card.style.cssText = 'width:100px;height:140px;border-radius:7px;border:3px solid '+bc+';background:radial-gradient(ellipse at 50% 35%,#1a0800,#0A0804);position:relative;box-shadow:0 4px 16px rgba(0,0,0,0.5),0 0 12px rgba(255,69,17,0.15);display:flex;flex-direction:column;align-items:center;';
    card.innerHTML = '<div style="font-family:\'Rajdhani\';font-weight:700;font-size:8px;color:'+bc+';letter-spacing:2px;text-align:center;padding:8px 0 0;opacity:0.7;">'+tc.tier+'</div>'
      +'<div style="display:flex;align-items:center;justify-content:center;height:56px;margin-top:2px;"><svg viewBox="0 0 44 44" width="42" height="42" fill="none"><defs><linearGradient id="tg_'+tc.tier+'" x1="22" y1="40" x2="22" y2="0"><stop offset="0%" stop-color="#FF4511"/><stop offset="100%" stop-color="#FFB800"/></linearGradient></defs><path d="'+flamePath+'" fill="url(#tg_'+tc.tier+')" stroke="#FF4511" stroke-width="0.8"/></svg></div>'
      +'<div style="font-family:\'Teko\';font-weight:700;font-size:14px;color:#fff;text-align:center;letter-spacing:1px;line-height:1.1;padding:0 8px;">'+tc.name+'</div>'
      +'<div style="font-family:\'Rajdhani\';font-size:9px;color:#aaa;text-align:center;padding:4px 10px;line-height:1.3;">'+tc.effect+'</div>'
      +'<div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:'+bc+';opacity:0.6;border-radius:0 0 5px 5px;"></div>';
    torchRow.appendChild(wrap(card, tc.tier + ' TIER'));
  });
  el.appendChild(torchRow);

  // ============================================================
  // FLIP + DEAL DEMO
  // ============================================================
  el.appendChild(sec('SNAP FLIP + SLIDE DEAL (chosen animations)'));
  var demoRow = row();

  // Flip demo
  var flipCard = document.createElement('div');
  flipCard.style.cssText = 'width:90px;height:126px;perspective:900px;cursor:pointer;';
  var flipInner = document.createElement('div');
  flipInner.style.cssText = 'width:100%;height:100%;position:relative;transform-style:preserve-3d;transition:transform 0.5s ease-in-out;';
  var flipFront = buildMaddenPlayer({name:'COLT AVERY',pos:'QB',ovr:78,num:7,tier:'silver',teamColor:'#FF4511'},90,126);
  flipFront.style.cssText += ';position:absolute;inset:0;backface-visibility:hidden;';
  var flipBack = buildHomeCard('offense',90,126);
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

  // Deal demo
  var dealWrap = document.createElement('div');
  dealWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;';
  var deckEl = document.createElement('div');
  deckEl.style.cssText = 'width:70px;height:98px;position:relative;cursor:pointer;';
  for (var s = 2; s >= 0; s--) {
    var sc = buildHomeCard('torch',62,86);
    sc.style.cssText += ';position:absolute;top:'+s*2+'px;left:'+s+'px;width:62px;height:86px;';
    deckEl.appendChild(sc);
  }
  var dealTarget = document.createElement('div');
  dealTarget.style.cssText = 'width:80px;height:110px;border:1px dashed #1E1610;border-radius:6px;display:flex;align-items:center;justify-content:center;';
  dealTarget.innerHTML = '<div style="font-family:\'Rajdhani\';font-size:8px;color:#333;">tap deck</div>';
  var dealt = false;
  deckEl.onclick = function() {
    if (dealt) { dealTarget.innerHTML = '<div style="font-family:\'Rajdhani\';font-size:8px;color:#333;">tap deck</div>'; dealTarget.style.border = '1px dashed #1E1610'; dealt = false; return; }
    dealt = true;
    var dc = buildMaddenPlayer({name:'RIO VASQUEZ',pos:'SLOT',ovr:82,num:3,tier:'gold',teamColor:'#FF4511'},76,106);
    dc.style.animation = 'dealSlide 0.5s cubic-bezier(0.22,1.3,0.36,1) both';
    dealTarget.innerHTML = '';
    dealTarget.style.border = 'none';
    dealTarget.appendChild(dc);
  };
  dealWrap.appendChild(deckEl);
  dealWrap.appendChild(dealTarget);
  demoRow.appendChild(wrap(dealWrap, 'TAP DECK TO DEAL'));
  el.appendChild(demoRow);

  // ============================================================
  // MULTI-CARD DEAL
  // ============================================================
  el.appendChild(sec('MULTI-CARD DEAL — Tap deck to deal 4 cards'));
  var multiRow = row();

  var multiWrap = document.createElement('div');
  multiWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:12px;';

  // Deck
  var multiDeck = document.createElement('div');
  multiDeck.style.cssText = 'width:70px;height:98px;position:relative;cursor:pointer;';
  for (var ms = 3; ms >= 0; ms--) {
    var msc = buildHomeCard('torch', 62, 86);
    msc.style.cssText += ';position:absolute;top:'+ms*2+'px;left:'+ms+'px;width:62px;height:86px;';
    multiDeck.appendChild(msc);
  }

  // Target hand area
  var multiHand = document.createElement('div');
  multiHand.style.cssText = 'display:flex;gap:6px;min-height:110px;align-items:flex-end;';
  var multiHandInner = document.createElement('div');
  multiHandInner.style.cssText = 'display:flex;gap:6px;';
  multiHand.appendChild(multiHandInner);

  // Label
  var multiLabel = document.createElement('div');
  multiLabel.style.cssText = "font-family:'Rajdhani';font-size:9px;color:#666;text-align:center;";
  multiLabel.textContent = 'Tap deck to deal hand';

  var multiDealt = false;
  var multiPlayers = [
    { name:'COLT AVERY', pos:'QB', ovr:78, num:7, tier:'silver', teamColor:'#FF4511' },
    { name:'QUEZ SAMPSON', pos:'WR', ovr:80, num:1, tier:'gold', teamColor:'#FF4511' },
    { name:'RIO VASQUEZ', pos:'SLOT', ovr:82, num:3, tier:'gold', teamColor:'#FF4511' },
    { name:'KIRBY WALSH', pos:'RB', ovr:72, num:22, tier:'bronze', teamColor:'#FF4511' },
  ];

  multiDeck.onclick = function() {
    if (multiDealt) {
      multiHandInner.innerHTML = '';
      multiLabel.textContent = 'Tap deck to deal hand';
      multiDealt = false;
      return;
    }
    multiDealt = true;
    multiLabel.textContent = 'Tap again to reset';
    multiPlayers.forEach(function(mp, idx) {
      var pc = buildMaddenPlayer(mp, 76, 106);
      pc.style.opacity = '0';
      pc.style.animation = 'dealMulti 0.4s cubic-bezier(0.22,1.3,0.36,1) ' + (idx * 0.12) + 's both';
      multiHandInner.appendChild(pc);
    });
  };

  multiWrap.appendChild(multiDeck);
  multiWrap.appendChild(multiHand);
  multiWrap.appendChild(multiLabel);
  multiRow.appendChild(multiWrap);
  el.appendChild(multiRow);

  // Footer
  var foot = document.createElement('div');
  foot.style.cssText = "position:fixed;bottom:8px;left:0;right:0;text-align:center;font-family:'Rajdhani',sans-serif;font-size:10px;color:#ffffff33;letter-spacing:1px;z-index:100;";
  foot.textContent = 'CARD MOCKUPS v3 \u00b7 v' + VERSION;
  el.appendChild(foot);
  return el;
}
