/**
 * TORCH — Card Design Mockup Page v3
 * Final selections + home page card style matching
 * Access via ?mockup URL param
 */

import { VERSION } from '../../state.js';
import { buildHomeCard, buildMaddenPlayer, buildPlayV1, buildTorchCard, injectCardStyles, teamHelmetSvg, renderFlamePips } from '../components/cards.js';

function injectStyles() {
  injectCardStyles();
  if (document.getElementById('mockup-styles')) return;
  var s = document.createElement('style');
  s.id = 'mockup-styles';
  s.textContent = `
    @keyframes torchPulseA { 0%,100%{background:radial-gradient(circle at 50% 40%,rgba(255,140,0,0.15),transparent 60%);} 50%{background:radial-gradient(circle at 50% 40%,rgba(255,140,0,0.3),transparent 70%);} }
    @keyframes torchSweepB { 0%{background-position:-200px 0;} 100%{background-position:200px 0;} }
    @keyframes torchRotateC { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
  `;
  document.head.appendChild(s);
}

// buildHomeCard, buildMaddenPlayer, buildPlayV1, buildTorchCard imported from shared cards.js

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
  el.appendChild(sec('PLAYER CARDS — v0.21 (Badge + Tier Borders)'));
  var playerRow = row();

  // Sample players from each team showing all 3 tiers + star
  var players = [
    { name:'MONROE', pos:'WR', ovr:84, num:1, badge:'SPEED_LINES', isStar:true, teamColor:'#8B0000' },
    { name:'CALLOWAY', pos:'QB', ovr:80, num:7, badge:'CROSSHAIR', isStar:false, teamColor:'#8B0000' },
    { name:'THORNE', pos:'FB', ovr:84, num:34, badge:'HELMET', isStar:true, teamColor:'#1B3A2D' },
    { name:'BRIGGS', pos:'QB', ovr:78, num:12, badge:'CLIPBOARD', isStar:false, teamColor:'#1B3A2D' },
    { name:'STRAND', pos:'QB', ovr:84, num:1, badge:'FLAME', isStar:true, teamColor:'#F28C28' },
    { name:'HAYWARD', pos:'SLOT', ovr:84, num:3, badge:'GLOVE', isStar:true, teamColor:'#2E0854' },
    { name:'TRAN', pos:'QB', ovr:74, num:14, badge:'BOLT', isStar:false, teamColor:'#8B0000' },
    { name:'REYES', pos:'RB', ovr:72, num:28, badge:'CLEAT', isStar:false, teamColor:'#F28C28' },
  ];

  // Draft size
  players.forEach(function(p) {
    var label = p.name + (p.isStar ? ' STAR' : '') + ' (' + p.ovr + ')';
    playerRow.appendChild(wrap(buildMaddenPlayer(p,110,154), label));
  });
  el.appendChild(playerRow);

  // Gameplay size
  el.appendChild(sec('PLAYER CARDS — Gameplay Size'));
  var compRow = row();
  players.slice(0,4).forEach(function(p) {
    compRow.appendChild(wrap(buildMaddenPlayer(p,80,110), p.name));
  });
  el.appendChild(compRow);

  // Flame pip ratings demo
  el.appendChild(sec('FLAME PIP RATINGS'));
  var pipRow = row();
  var pipData = [
    { label: 'Boars OFF 4/5', filled: 4, color: '#C4A265' },
    { label: 'Wolves DEF 4/5', filled: 4, color: '#D4D4D4' },
    { label: 'Stags OFF 5/5', filled: 5, color: '#F28C28' },
    { label: 'Serpents DEF 4/5', filled: 4, color: '#39FF14' },
    { label: 'Stags DEF 2/5', filled: 2, color: '#F28C28' },
  ];
  pipData.forEach(function(pd) {
    var w2 = document.createElement('div');
    w2.style.cssText = 'text-align:center;';
    var pipWrap = document.createElement('div');
    pipWrap.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:2px;padding:8px;background:var(--bg-surface);border-radius:6px;';
    pipWrap.innerHTML = renderFlamePips(pd.filled, 5, pd.color, 12);
    w2.appendChild(pipWrap);
    w2.appendChild(lbl(pd.label));
    pipRow.appendChild(w2);
  });
  el.appendChild(pipRow);

  // Team helmets demo
  el.appendChild(sec('TEAM HELMETS'));
  var helmRow = row();
  var teamIds = ['sentinels', 'wolves', 'stags', 'serpents'];
  teamIds.forEach(function(tid) {
    var hw = document.createElement('div');
    hw.style.cssText = 'text-align:center;';
    var h48 = document.createElement('div');
    h48.style.cssText = 'display:flex;align-items:center;justify-content:center;padding:8px;background:var(--bg-surface);border-radius:6px;';
    h48.innerHTML = teamHelmetSvg(tid, 48);
    hw.appendChild(h48);
    hw.appendChild(lbl(tid.toUpperCase() + ' (48px)'));
    helmRow.appendChild(hw);
  });
  // Small sizes
  teamIds.forEach(function(tid) {
    var hw = document.createElement('div');
    hw.style.cssText = 'text-align:center;';
    var h24 = document.createElement('div');
    h24.style.cssText = 'display:flex;align-items:center;justify-content:center;padding:8px;background:var(--bg-surface);border-radius:6px;';
    h24.innerHTML = teamHelmetSvg(tid, 24);
    hw.appendChild(h24);
    hw.appendChild(lbl(tid.toUpperCase() + ' (24px)'));
    helmRow.appendChild(hw);
  });
  el.appendChild(helmRow);

  // ============================================================
  // PLAY CARDS — Split V3
  // ============================================================
  var routeSvg = '<svg viewBox="0 0 448 512" fill="none"><path fill="CATFILL" opacity="0.7" d="M320 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM125.7 175.5c9.9-9.9 23.4-15.5 37.5-15.5c1.9 0 3.8 .1 5.6 .3L137.6 254c-9.3 28 1.7 58.8 26.8 74.5l86.2 53.9-25.4 88.8c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l28.7-100.4c5.9-20.6-2.6-42.6-20.7-53.9L238 299l30.9-82.4 5.1 12.3C289 264.7 323.9 288 362.7 288l21.3 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-21.3 0c-12.9 0-24.6-7.8-29.5-19.7l-6.3-15c-14.6-35.1-44.1-61.9-80.5-73.1l-48.7-15c-11.1-3.4-22.7-5.2-34.4-5.2c-31 0-60.8 12.3-82.7 34.3L57.4 153.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l23.1-23.1zM91.2 352L32 352c-17.7 0-32 14.3-32 32s14.3 32 32 32l69.6 0c19 0 36.2-11.2 43.9-28.5L157 361.6l-9.5-6c-17.5-10.9-30.5-26.8-37.9-44.9L91.2 352z"/></svg>';
  var defSvg = '<svg viewBox="0 0 448 512" fill="none"><path fill="CATFILL" opacity="0.7" d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"/></svg>';

  var plays = [
    { name:'HAIL MARY', cat:'DEEP', catColor:'#7ACC00', risk:'high', riskColor:'#7ACC00', desc:'Go deep or bust', svg:routeSvg, bg:'#0A1A06' },
    { name:'MESH', cat:'SHORT', catColor:'#7ACC00', risk:'low', riskColor:'#7ACC00', desc:'Man killer', svg:routeSvg, bg:'#0A1A06' },
    { name:'COVER 0', cat:'BLITZ', catColor:'#4DA6FF', risk:'high', riskColor:'#4DA6FF', desc:'All out rush', svg:defSvg, bg:'#0A1420' },
    { name:'COVER 3', cat:'ZONE', catColor:'#4DA6FF', risk:'low', riskColor:'#4DA6FF', desc:'Deep thirds', svg:defSvg, bg:'#0A1420' },
  ];

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
  var torchCards = [
    { name:'CHALLENGE', tier:'GOLD', effect:'Challenge a play' },
    { name:'MOMENTUM', tier:'SILVER', effect:'+3 yards next play' },
    { name:'AUDIBLE', tier:'BRONZE', effect:'Change your play' },
  ];
  torchCards.forEach(function(tc) {
    torchRow.appendChild(wrap(buildTorchCard(tc, 100, 140), tc.tier + ' TIER'));
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
