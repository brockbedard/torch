/**
 * TORCH — Card Design Mockup Page v2
 * Access via ?mockup URL param
 * Shows variations of: player card backs, player cards, play cards, torch cards,
 * flip animations, and deal-from-deck animations.
 */

import { VERSION } from '../../state.js';

// Inject mockup-specific animations
function injectStyles() {
  if (document.getElementById('mockup-styles')) return;
  var s = document.createElement('style');
  s.id = 'mockup-styles';
  s.textContent = `
    /* Flip animations */
    @keyframes flipA { 0%{transform:rotateY(0)} 50%{transform:rotateY(90deg)} 51%{transform:rotateY(90deg)} 100%{transform:rotateY(180deg)} }
    @keyframes flipB { 0%{transform:rotateY(0) translateY(0)} 40%{transform:rotateY(90deg) translateY(-15px)} 60%{transform:rotateY(90deg) translateY(-15px)} 100%{transform:rotateY(180deg) translateY(0)} }
    @keyframes flipC { 0%{transform:rotateY(0) scale(1)} 30%{transform:rotateY(60deg) scale(1.1)} 50%{transform:rotateY(90deg) scale(1.15)} 70%{transform:rotateY(120deg) scale(1.1)} 100%{transform:rotateY(180deg) scale(1)} }
    /* Deal animations */
    @keyframes dealA { 0%{opacity:0;transform:translateY(-80px) scale(0.6)} 60%{opacity:1;transform:translateY(8px) scale(1.03)} 100%{transform:translateY(0) scale(1)} }
    @keyframes dealB { 0%{opacity:0;transform:translateX(-120px) rotate(-30deg) scale(0.5)} 70%{opacity:1;transform:translateX(5px) rotate(2deg) scale(1.02)} 100%{transform:translateX(0) rotate(0deg) scale(1)} }
    @keyframes dealC { 0%{opacity:0;transform:scale(0.2) rotate(180deg)} 50%{opacity:1;transform:scale(1.1) rotate(-5deg)} 100%{transform:scale(1) rotate(0deg)} }
  `;
  document.head.appendChild(s);
}

export function buildCardMockup() {
  injectStyles();
  var el = document.createElement('div');
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:#0A0804;padding:20px 14px 80px;overflow-y:auto;';

  // Helpers
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
    l.style.cssText = "font-family:'Rajdhani',sans-serif;font-weight:600;font-size:9px;color:#aaa;letter-spacing:1px;text-align:center;margin-top:6px;max-width:110px;";
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
  hdr.style.cssText = "font-family:'Teko',sans-serif;font-weight:700;font-size:32px;color:var(--a-gold);letter-spacing:4px;text-align:center;margin-bottom:8px;text-shadow:2px 2px 0 rgba(0,0,0,0.9);";
  hdr.textContent = 'CARD DESIGN MOCKUPS';
  el.appendChild(hdr);
  var sub = document.createElement('div');
  sub.style.cssText = "font-family:'Rajdhani',sans-serif;font-size:11px;color:#aaa;text-align:center;margin-bottom:16px;";
  sub.textContent = 'Scroll to see all sections. Tap flip cards to interact.';
  el.appendChild(sub);

  // ============================================================
  // PLAYER CARD BACKS (3 options)
  // ============================================================
  el.appendChild(sec('PLAYER CARD BACKS'));
  var backRow = row();

  // Back A: Dual flame (original)
  function makeBackA(w,h) {
    var c = document.createElement('div');
    c.style.cssText = 'width:'+w+'px;height:'+h+'px;border-radius:8px;border:2px solid #FFB800;background:#0A0804;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.5);';
    c.innerHTML = '<svg viewBox="0 0 60 80" fill="none" width="100%" height="100%">'
      +'<defs><linearGradient id="bfA" x1="30" y1="60" x2="30" y2="20"><stop offset="0%" stop-color="#FF4511"/><stop offset="100%" stop-color="#FFB800"/></linearGradient>'
      +'<pattern id="hatchA" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#1A1408" stroke-width="0.5"/></pattern></defs>'
      +'<rect width="60" height="80" fill="url(#hatchA)"/>'
      +'<path d="M30 14C30 14 22 24 21 30C20 36 24 40 27 42C27 42 25 37 27 32C28 29 29 27 30 24C31 27 32 29 33 32C35 37 33 42 33 42C36 40 40 36 39 30C38 24 30 14 30 14Z" fill="url(#bfA)" opacity="0.9"/>'
      +'<path d="M30 66C30 66 38 56 39 50C40 44 36 40 33 38C33 38 35 43 33 48C32 51 31 53 30 56C29 53 28 51 27 48C25 43 27 38 27 38C24 40 20 44 21 50C22 56 30 66 30 66Z" fill="url(#bfA)" opacity="0.9"/>'
      +'<circle cx="30" cy="40" r="2" fill="#FFB800" opacity="0.4"/></svg>';
    return c;
  }

  // Back B: Football laces pattern + central torch emblem
  function makeBackB(w,h) {
    var c = document.createElement('div');
    c.style.cssText = 'width:'+w+'px;height:'+h+'px;border-radius:8px;border:2px solid #FFB800;background:linear-gradient(180deg,#120E06,#0A0804,#120E06);overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.5);';
    c.innerHTML = '<svg viewBox="0 0 60 80" fill="none" width="100%" height="100%">'
      // Lace pattern (vertical center line + cross stitches)
      +'<line x1="30" y1="8" x2="30" y2="72" stroke="#2A2010" stroke-width="1.5"/>'
      +'<line x1="26" y1="18" x2="34" y2="18" stroke="#2A2010" stroke-width="1"/>'
      +'<line x1="26" y1="28" x2="34" y2="28" stroke="#2A2010" stroke-width="1"/>'
      +'<line x1="26" y1="38" x2="34" y2="38" stroke="#2A2010" stroke-width="1"/>'
      +'<line x1="26" y1="48" x2="34" y2="48" stroke="#2A2010" stroke-width="1"/>'
      +'<line x1="26" y1="58" x2="34" y2="58" stroke="#2A2010" stroke-width="1"/>'
      // Central torch emblem
      +'<circle cx="30" cy="40" r="12" stroke="#FFB800" stroke-width="0.8" fill="none" opacity="0.3"/>'
      +'<path d="M30 30C30 30 25 36 25 40C25 44 27 46 30 46C33 46 35 44 35 40C35 36 30 30 30 30Z" fill="#FF4511" opacity="0.6"/>'
      +'</svg>';
    return c;
  }

  // Back C: Geometric diamond pattern with flame corners
  function makeBackC(w,h) {
    var c = document.createElement('div');
    c.style.cssText = 'width:'+w+'px;height:'+h+'px;border-radius:8px;border:2px solid #FFB800;background:#0A0804;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.5);';
    c.innerHTML = '<svg viewBox="0 0 60 80" fill="none" width="100%" height="100%">'
      +'<defs><linearGradient id="bfC" x1="30" y1="60" x2="30" y2="20"><stop offset="0%" stop-color="#FF4511"/><stop offset="100%" stop-color="#FFB800"/></linearGradient></defs>'
      // Diamond grid
      +'<pattern id="diamonds" width="10" height="10" patternUnits="userSpaceOnUse">'
      +'<path d="M5 0L10 5L5 10L0 5Z" stroke="#1E1610" stroke-width="0.5" fill="none"/></pattern>'
      +'<rect width="60" height="80" fill="url(#diamonds)"/>'
      // Inner border
      +'<rect x="6" y="8" width="48" height="64" rx="4" stroke="#FFB800" stroke-width="0.5" fill="none" opacity="0.2"/>'
      // Central T monogram
      +'<text x="30" y="46" text-anchor="middle" font-family="Teko" font-weight="700" font-size="28" fill="url(#bfC)" opacity="0.7">T</text>'
      +'</svg>';
    return c;
  }

  backRow.appendChild(wrap(makeBackA(100,140), 'A: DUAL FLAME'));
  backRow.appendChild(wrap(makeBackB(100,140), 'B: LACES + EMBLEM'));
  backRow.appendChild(wrap(makeBackC(100,140), 'C: DIAMOND GRID + T'));
  el.appendChild(backRow);

  // ============================================================
  // PLAYER CARDS (3 versions)
  // ============================================================
  el.appendChild(sec('PLAYER CARDS — 3 LAYOUTS'));

  var pData = { name:'COLT AVERY', pos:'QB', ovr:78, badge:'ARM', teamColor:'#FF4511', tier:'silver' };
  var tc = '#C0C0C0';

  // Version 1: FUT-style (OVR top-left, POS below, name bottom)
  var pRow1 = row();
  var p1 = document.createElement('div');
  p1.style.cssText = 'width:110px;height:154px;border-radius:8px;border:2px solid '+tc+'44;background:radial-gradient(ellipse at 50% 30%,#141008,#0A0804);overflow:hidden;position:relative;box-shadow:0 4px 16px rgba(0,0,0,0.5);';
  p1.innerHTML = '<div style="padding:6px 8px;display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:2;">'
    +'<div><div style="font-family:\'Rajdhani\';font-weight:700;font-size:26px;color:'+tc+';line-height:1;">78</div>'
    +'<div style="font-family:\'Rajdhani\';font-weight:700;font-size:9px;color:#ff0040;letter-spacing:2px;">QB</div></div>'
    +'<div style="width:16px;height:16px;border-radius:50%;background:'+tc+'22;border:1px solid '+tc+'44;display:flex;align-items:center;justify-content:center;font-family:\'Rajdhani\';font-size:8px;color:'+tc+';">A</div></div>'
    +'<div style="flex:1;display:flex;align-items:center;justify-content:center;"><div style="width:60px;height:75px;border-radius:50% 50% 0 0;background:linear-gradient(180deg,#FF451133,transparent);opacity:0.4;"></div></div>'
    +'<div style="position:absolute;bottom:0;left:0;right:0;height:40%;background:linear-gradient(transparent,#0A0804);z-index:1;"></div>'
    +'<div style="position:absolute;bottom:0;left:0;right:0;padding:5px 8px;z-index:2;border-bottom:2px solid #FF4511;">'
    +'<div style="font-family:\'Teko\';font-weight:700;font-size:14px;color:#fff;letter-spacing:1px;">COLT AVERY</div></div>';
  pRow1.appendChild(wrap(p1, 'V1: FUT STYLE (OVR top-left)'));

  // Version 2: Madden-style (OVR centered top, large, name + pos bottom)
  var p2 = document.createElement('div');
  p2.style.cssText = 'width:110px;height:154px;border-radius:8px;border:2px solid '+tc+'44;background:radial-gradient(ellipse at 50% 25%,#141008,#0A0804);overflow:hidden;position:relative;box-shadow:0 4px 16px rgba(0,0,0,0.5);';
  p2.innerHTML = '<div style="text-align:center;padding:6px 0 0;position:relative;z-index:2;">'
    +'<div style="font-family:\'Teko\';font-weight:700;font-size:36px;color:'+tc+';line-height:0.85;text-shadow:0 0 10px '+tc+'44;">78</div>'
    +'<div style="font-family:\'Rajdhani\';font-weight:700;font-size:8px;color:#ff0040;letter-spacing:2px;margin-top:-2px;">QUARTERBACK</div></div>'
    +'<div style="flex:1;display:flex;align-items:center;justify-content:center;"><div style="width:60px;height:70px;border-radius:50% 50% 0 0;background:linear-gradient(180deg,#FF451133,transparent);opacity:0.4;"></div></div>'
    +'<div style="position:absolute;bottom:0;left:0;right:0;height:35%;background:linear-gradient(transparent,#0A0804);z-index:1;"></div>'
    +'<div style="position:absolute;bottom:0;left:0;right:0;z-index:2;background:#FF451122;padding:5px 8px;border-top:1px solid #FF451144;">'
    +'<div style="font-family:\'Teko\';font-weight:700;font-size:14px;color:#fff;letter-spacing:1px;text-align:center;">COLT AVERY</div></div>';
  pRow1.appendChild(wrap(p2, 'V2: MADDEN STYLE (OVR top-center)'));

  // Version 3: Sports card style (Name top banner, art dominant, OVR bottom-right badge)
  var p3 = document.createElement('div');
  p3.style.cssText = 'width:110px;height:154px;border-radius:8px;border:2px solid '+tc+'44;background:radial-gradient(ellipse at 50% 40%,#141008,#0A0804);overflow:hidden;position:relative;box-shadow:0 4px 16px rgba(0,0,0,0.5);';
  p3.innerHTML = '<div style="background:#FF4511dd;padding:3px 8px;display:flex;justify-content:space-between;align-items:center;">'
    +'<div style="font-family:\'Teko\';font-weight:700;font-size:13px;color:#fff;letter-spacing:1px;">COLT AVERY</div>'
    +'<div style="font-family:\'Rajdhani\';font-weight:700;font-size:9px;color:#FFB800;">QB</div></div>'
    +'<div style="flex:1;display:flex;align-items:center;justify-content:center;"><div style="width:65px;height:85px;border-radius:50% 50% 0 0;background:linear-gradient(180deg,#FF451133,transparent);opacity:0.4;"></div></div>'
    +'<div style="position:absolute;bottom:0;left:0;right:0;height:30%;background:linear-gradient(transparent,#0A0804);z-index:1;"></div>'
    +'<div style="position:absolute;bottom:6px;right:6px;z-index:2;width:32px;height:32px;border-radius:50%;background:#0A0804;border:2px solid '+tc+';display:flex;align-items:center;justify-content:center;">'
    +'<div style="font-family:\'Rajdhani\';font-weight:700;font-size:16px;color:'+tc+';line-height:1;">78</div></div>'
    +'<div style="position:absolute;bottom:8px;left:8px;z-index:2;width:14px;height:14px;border-radius:50%;background:'+tc+'33;border:1px solid '+tc+'44;display:flex;align-items:center;justify-content:center;font-family:\'Rajdhani\';font-size:7px;color:'+tc+';">A</div>';
  pRow1.appendChild(wrap(p3, 'V3: SPORTS CARD (name top, OVR badge)'));
  el.appendChild(pRow1);

  // ============================================================
  // PLAY CARDS (3 versions)
  // ============================================================
  el.appendChild(sec('PLAY CARDS — 3 LAYOUTS'));
  var playRow = row();
  var riskIcons = { high:'\u26A1', med:'\u25C6', low:'\u25CF' };
  var riskColors = { high:'#ff0040', med:'#ff8800', low:'#00ff44' };

  // Simple route SVG
  var routeSvg = '<svg viewBox="0 0 50 40" width="58" height="44" fill="none">'
    +'<circle cx="25" cy="35" r="3" fill="#FFB800" opacity="0.8"/>'
    +'<circle cx="12" cy="32" r="2" fill="#FFB800" opacity="0.6"/>'
    +'<circle cx="38" cy="32" r="2" fill="#FFB800" opacity="0.6"/>'
    +'<path d="M12 32L8 18" stroke="#FFB800" stroke-width="1.2" opacity="0.7"/>'
    +'<path d="M38 32L42 15" stroke="#FFB800" stroke-width="1.2" opacity="0.7"/>'
    +'<polygon points="8,17 9.5,19 6.5,19" fill="#FFB800" opacity="0.6"/>'
    +'<polygon points="42,14 43.5,16 40.5,16" fill="#FFB800" opacity="0.6"/></svg>';

  // V1: Top stripe + diagram dominant
  var pl1 = document.createElement('div');
  pl1.style.cssText = 'width:80px;height:120px;border-radius:6px;border:2px solid #ff004033;background:radial-gradient(ellipse at 50% 40%,#0A1A06,#0A0804);overflow:hidden;position:relative;box-shadow:0 3px 10px rgba(0,0,0,0.5);';
  pl1.innerHTML = '<div style="height:3px;background:#ff0040;"></div>'
    +'<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 5px 0;">'
    +'<div style="font-family:\'Teko\';font-weight:700;font-size:11px;color:#fff;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">HAIL MARY</div>'
    +'<div style="font-family:\'Rajdhani\';font-weight:700;font-size:6px;color:#ff0040;">DEEP</div></div>'
    +'<div style="flex:1;display:flex;align-items:center;justify-content:center;padding:2px;">'+routeSvg+'</div>'
    +'<div style="display:flex;justify-content:space-between;padding:2px 5px 4px;">'
    +'<div style="font-family:\'Rajdhani\';font-size:8px;color:#aaa;">Go deep</div>'
    +'<div style="font-size:8px;color:#ff0040;">\u26A1</div></div>';
  playRow.appendChild(wrap(pl1, 'V1: STRIPE + DIAGRAM'));

  // V2: Full-bleed diagram, name overlay at bottom
  var pl2 = document.createElement('div');
  pl2.style.cssText = 'width:80px;height:120px;border-radius:6px;border:2px solid #ff004033;background:radial-gradient(ellipse at 50% 50%,#0A1A06,#0A0804);overflow:hidden;position:relative;box-shadow:0 3px 10px rgba(0,0,0,0.5);';
  pl2.innerHTML = '<div style="position:absolute;top:4px;right:4px;font-family:\'Rajdhani\';font-weight:700;font-size:7px;color:#ff0040;background:#0A080488;padding:1px 4px;border-radius:3px;z-index:2;">DEEP</div>'
    +'<div style="position:absolute;top:4px;left:4px;font-size:8px;color:#ff0040;z-index:2;">\u26A1</div>'
    +'<div style="display:flex;align-items:center;justify-content:center;height:100%;padding:8px;">'+routeSvg+'</div>'
    +'<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,#0A0804ee);padding:16px 6px 5px;z-index:2;">'
    +'<div style="font-family:\'Teko\';font-weight:700;font-size:13px;color:#fff;letter-spacing:1px;">HAIL MARY</div></div>';
  playRow.appendChild(wrap(pl2, 'V2: FULL BLEED DIAGRAM'));

  // V3: Split layout — diagram top, info panel bottom
  var pl3 = document.createElement('div');
  pl3.style.cssText = 'width:80px;height:120px;border-radius:6px;border:2px solid #ff004033;background:#0A0804;overflow:hidden;position:relative;box-shadow:0 3px 10px rgba(0,0,0,0.5);';
  pl3.innerHTML = '<div style="height:3px;background:#ff0040;"></div>'
    +'<div style="height:65px;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 50%,#0A1A06,#0A0804);border-bottom:1px solid #1E1610;">'+routeSvg+'</div>'
    +'<div style="padding:4px 6px;">'
    +'<div style="font-family:\'Teko\';font-weight:700;font-size:12px;color:#fff;letter-spacing:1px;line-height:1;">HAIL MARY</div>'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px;">'
    +'<div style="font-family:\'Rajdhani\';font-weight:700;font-size:7px;color:#ff0040;letter-spacing:0.5px;">DEEP PASS</div>'
    +'<div style="font-size:7px;color:#ff0040;">\u26A1 HIGH</div></div>'
    +'<div style="font-family:\'Rajdhani\';font-size:7px;color:#666;margin-top:1px;">Go deep, big play or bust</div></div>';
  playRow.appendChild(wrap(pl3, 'V3: SPLIT (diagram + info)'));
  el.appendChild(playRow);

  // ============================================================
  // TORCH CARDS (3 versions, fix gold/bronze)
  // ============================================================
  el.appendChild(sec('TORCH CARDS — 3 LAYOUTS'));
  var torchRow = row();

  // New tier colors: GOLD stays, SILVER stays, BRONZE shifted to dark copper to avoid gold confusion
  var tTiers = { GOLD:'#FFB800', SILVER:'#B0C4D4', BRONZE:'#A0522D' };
  var flamePathSmall = '<path d="M22 2C22 2 10 14 9 22C8 30 13 36 17 38C17 38 14 32 17 26C19 22 21 18 22 14C23 18 25 22 27 26C30 32 27 38 27 38C31 36 36 30 35 22C34 14 22 2 22 2Z"';

  // V1: Centered flame, tier badge top
  var t1 = document.createElement('div');
  t1.style.cssText = 'width:90px;height:126px;border-radius:7px;border:2px solid '+tTiers.GOLD+';background:radial-gradient(ellipse at 50% 35%,#1a0800,#0A0804);overflow:hidden;position:relative;box-shadow:0 4px 16px rgba(0,0,0,0.5),0 0 12px rgba(255,69,17,0.15);';
  t1.innerHTML = '<div style="font-family:\'Rajdhani\';font-weight:700;font-size:7px;color:'+tTiers.GOLD+';letter-spacing:1.5px;text-align:center;padding:5px 0 0;opacity:0.7;">GOLD</div>'
    +'<div style="display:flex;align-items:center;justify-content:center;height:50px;"><svg viewBox="0 0 44 44" width="36" height="36" fill="none"><defs><linearGradient id="tg1" x1="22" y1="40" x2="22" y2="0"><stop offset="0%" stop-color="#FF4511"/><stop offset="100%" stop-color="#FFB800"/></linearGradient></defs>'+flamePathSmall+' fill="url(#tg1)" stroke="#FF4511" stroke-width="0.8"/></svg></div>'
    +'<div style="font-family:\'Teko\';font-weight:700;font-size:12px;color:#fff;text-align:center;letter-spacing:1px;line-height:1;">CHALLENGE FLAG</div>'
    +'<div style="font-family:\'Rajdhani\';font-size:8px;color:#aaa;text-align:center;padding:2px 6px;">Challenge a play call</div>'
    +'<div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:'+tTiers.GOLD+';opacity:0.6;"></div>';
  torchRow.appendChild(wrap(t1, 'V1: CENTERED FLAME'));

  // V2: Horizontal layout, flame left, text right
  var t2 = document.createElement('div');
  t2.style.cssText = 'width:90px;height:126px;border-radius:7px;border:2px solid '+tTiers.SILVER+';background:radial-gradient(ellipse at 30% 40%,#1a0800,#0A0804);overflow:hidden;position:relative;box-shadow:0 4px 16px rgba(0,0,0,0.5);';
  t2.innerHTML = '<div style="display:flex;height:100%;padding:8px 6px;gap:4px;">'
    +'<div style="display:flex;align-items:center;"><svg viewBox="0 0 44 44" width="30" height="30" fill="none"><defs><linearGradient id="tg2" x1="22" y1="40" x2="22" y2="0"><stop offset="0%" stop-color="#FF4511"/><stop offset="100%" stop-color="#FFB800"/></linearGradient></defs>'+flamePathSmall+' fill="url(#tg2)"/></svg></div>'
    +'<div style="flex:1;display:flex;flex-direction:column;justify-content:center;">'
    +'<div style="font-family:\'Rajdhani\';font-weight:700;font-size:6px;color:'+tTiers.SILVER+';letter-spacing:1px;opacity:0.7;">SILVER</div>'
    +'<div style="font-family:\'Teko\';font-weight:700;font-size:11px;color:#fff;line-height:1;letter-spacing:0.5px;margin-top:2px;">MOMENTUM SHIFT</div>'
    +'<div style="font-family:\'Rajdhani\';font-size:7px;color:#aaa;line-height:1.2;margin-top:3px;">+3 yards next play</div></div></div>'
    +'<div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:'+tTiers.SILVER+';opacity:0.4;"></div>';
  torchRow.appendChild(wrap(t2, 'V2: HORIZONTAL LAYOUT'));

  // V3: Full flame bg, text overlay
  var t3 = document.createElement('div');
  t3.style.cssText = 'width:90px;height:126px;border-radius:7px;border:2px solid '+tTiers.BRONZE+';background:radial-gradient(ellipse at 50% 50%,#2a1000,#0A0804);overflow:hidden;position:relative;box-shadow:0 4px 16px rgba(0,0,0,0.5);';
  t3.innerHTML = '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0.15;"><svg viewBox="0 0 44 44" width="70" height="70" fill="none">'+flamePathSmall+' fill="#FF4511"/></svg></div>'
    +'<div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:8px;">'
    +'<div style="font-family:\'Rajdhani\';font-weight:700;font-size:7px;color:'+tTiers.BRONZE+';letter-spacing:1.5px;">BRONZE</div>'
    +'<div style="font-family:\'Teko\';font-weight:700;font-size:14px;color:#fff;letter-spacing:1px;margin-top:6px;text-align:center;line-height:1;">AUDIBLE</div>'
    +'<div style="width:20px;height:1px;background:#FF4511;opacity:0.5;margin:6px 0;"></div>'
    +'<div style="font-family:\'Rajdhani\';font-size:8px;color:#ccc;text-align:center;line-height:1.3;">Change your play at the line</div></div>'
    +'<div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:'+tTiers.BRONZE+';opacity:0.5;"></div>';
  torchRow.appendChild(wrap(t3, 'V3: FULL FLAME BG'));
  el.appendChild(torchRow);

  // ============================================================
  // FLIP ANIMATIONS (3 styles)
  // ============================================================
  el.appendChild(sec('CARD FLIP — 3 ANIMATIONS (tap each)'));
  var flipRow = row();

  var flipNames = ['A: SNAP FLIP','B: LIFT & FLIP','C: SCALE FLIP'];
  var flipAnims = ['flipA 0.5s ease-in-out','flipB 0.6s ease-out','flipC 0.7s cubic-bezier(0.34,1.56,0.64,1)'];

  flipNames.forEach(function(fname, i) {
    var flipCard = document.createElement('div');
    flipCard.style.cssText = 'width:90px;height:126px;perspective:900px;cursor:pointer;';
    var inner = document.createElement('div');
    inner.style.cssText = 'width:100%;height:100%;position:relative;transform-style:preserve-3d;transition:transform 0.5s;';

    // Front
    var front = document.createElement('div');
    front.style.cssText = 'position:absolute;inset:0;backface-visibility:hidden;border-radius:7px;border:2px solid #FFB80044;background:radial-gradient(ellipse at 50% 30%,#141008,#0A0804);display:flex;flex-direction:column;overflow:hidden;';
    front.innerHTML = '<div style="padding:5px 7px;display:flex;justify-content:space-between;"><div style="font-family:\'Rajdhani\';font-weight:700;font-size:10px;color:#ff0040;">WR</div><div style="font-family:\'Rajdhani\';font-weight:700;font-size:20px;color:#FFB800;line-height:1;">80</div></div>'
      +'<div style="flex:1;display:flex;align-items:center;justify-content:center;"><div style="width:45px;height:55px;border-radius:50% 50% 0 0;background:linear-gradient(180deg,#FF451122,transparent);opacity:0.4;"></div></div>'
      +'<div style="position:absolute;bottom:0;left:0;right:0;height:30%;background:linear-gradient(transparent,#0A0804);"></div>'
      +'<div style="position:absolute;bottom:0;left:0;right:0;padding:4px 7px;z-index:2;border-bottom:2px solid #FF4511;"><div style="font-family:\'Teko\';font-weight:700;font-size:11px;color:#fff;">SAMPSON</div></div>';
    inner.appendChild(front);

    // Back
    var back = document.createElement('div');
    back.style.cssText = 'position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(180deg);border-radius:7px;border:2px solid #FFB800;background:#0A0804;overflow:hidden;';
    back.innerHTML = makeBackA(86,122).innerHTML;
    inner.appendChild(back);

    var flipped = false;
    flipCard.onclick = function() {
      flipped = !flipped;
      if (flipped) {
        inner.style.transition = 'none';
        inner.style.animation = flipAnims[i];
        inner.addEventListener('animationend', function handler() {
          inner.removeEventListener('animationend', handler);
          inner.style.animation = '';
          inner.style.transform = 'rotateY(180deg)';
        });
      } else {
        inner.style.transition = 'transform 0.4s ease-out';
        inner.style.animation = '';
        inner.style.transform = 'rotateY(0deg)';
      }
    };
    flipCard.appendChild(inner);
    flipRow.appendChild(wrap(flipCard, fname));
  });
  el.appendChild(flipRow);

  // ============================================================
  // DEAL FROM DECK (3 animations)
  // ============================================================
  el.appendChild(sec('DEAL FROM DECK — 3 ANIMATIONS (tap deck to deal)'));
  var dealRow = row();

  var dealNames = ['A: DROP IN','B: SLIDE IN','C: SPIN IN'];
  var dealAnims = ['dealA 0.5s cubic-bezier(0.22,1.3,0.36,1)','dealB 0.5s cubic-bezier(0.22,1.3,0.36,1)','dealC 0.6s cubic-bezier(0.34,1.56,0.64,1)'];

  dealNames.forEach(function(dname, i) {
    var dealWrap = document.createElement('div');
    dealWrap.style.cssText = 'text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;';

    // Deck (stack of card backs)
    var deck = document.createElement('div');
    deck.style.cssText = 'width:70px;height:98px;position:relative;cursor:pointer;';
    for (var s = 2; s >= 0; s--) {
      var stackCard = document.createElement('div');
      stackCard.style.cssText = 'position:absolute;top:' + (s*2) + 'px;left:' + (s*1) + 'px;width:66px;height:92px;border-radius:6px;border:2px solid #FFB800;background:#0A0804;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.4);';
      stackCard.innerHTML = '<svg viewBox="0 0 60 80" fill="none" width="100%" height="100%"><defs><linearGradient id="df'+i+''+s+'" x1="30" y1="60" x2="30" y2="20"><stop offset="0%" stop-color="#FF4511"/><stop offset="100%" stop-color="#FFB800"/></linearGradient></defs>'
        +'<path d="M30 20C30 20 24 28 23 32C22 36 25 39 27 40C27 40 26 36 27 33C28 31 29 29 30 27C31 29 32 31 33 33C34 36 33 40 33 40C35 39 38 36 37 32C36 28 30 20 30 20Z" fill="url(#df'+i+''+s+')" opacity="0.7"/></svg>';
      deck.appendChild(stackCard);
    }

    // Target area for dealt cards
    var target = document.createElement('div');
    target.style.cssText = 'width:70px;height:98px;border:1px dashed #1E1610;border-radius:6px;display:flex;align-items:center;justify-content:center;position:relative;';
    target.innerHTML = '<div style="font-family:\'Rajdhani\';font-size:8px;color:#333;">dealt here</div>';

    var dealt = false;
    deck.onclick = function() {
      if (dealt) {
        target.innerHTML = '<div style="font-family:\'Rajdhani\';font-size:8px;color:#333;">dealt here</div>';
        dealt = false;
        return;
      }
      dealt = true;
      var dealtCard = document.createElement('div');
      dealtCard.style.cssText = 'width:66px;height:92px;border-radius:6px;border:2px solid #7ACC0044;background:radial-gradient(ellipse at 50% 30%,#0A1A06,#0A0804);overflow:hidden;position:relative;animation:' + dealAnims[i] + ' both;';
      dealtCard.innerHTML = '<div style="padding:3px 5px;display:flex;justify-content:space-between;">'
        +'<div style="font-family:\'Rajdhani\';font-weight:700;font-size:8px;color:#ff0040;">RB</div>'
        +'<div style="font-family:\'Rajdhani\';font-weight:700;font-size:16px;color:#7ACC00;line-height:1;">72</div></div>'
        +'<div style="position:absolute;bottom:0;left:0;right:0;padding:3px 5px;border-bottom:2px solid #CC1A1A;z-index:2;">'
        +'<div style="font-family:\'Teko\';font-weight:700;font-size:9px;color:#fff;">WALSH</div></div>';
      target.innerHTML = '';
      target.style.border = 'none';
      target.appendChild(dealtCard);
    };

    dealWrap.appendChild(deck);
    dealWrap.appendChild(target);
    dealWrap.appendChild(lbl(dname));
    dealRow.appendChild(dealWrap);
  });
  el.appendChild(dealRow);

  // Build label
  var buildLabel = document.createElement('div');
  buildLabel.style.cssText = "position:fixed;bottom:8px;left:0;right:0;text-align:center;font-family:'Rajdhani',sans-serif;font-size:10px;color:#ffffff33;letter-spacing:1px;z-index:100;";
  buildLabel.textContent = 'CARD MOCKUPS v2 \u00b7 v' + VERSION;
  el.appendChild(buildLabel);

  return el;
}
