import { SND } from '../../engine/sound.js';
import { render, setGs, getOffCards, getDefCards, VERSION, VERSION_NAME } from '../../state.js';

var DEV_LOG = [
  "v0.18.0 \u2014 Gameday Build: CM3-style paced commentary, 5-tier celebration system, overhauled pre-game UI with kinetic progress stepper, vertically scrolling 'Your Squad'/'Your Plays' trophy rooms, and purple-themed gameplay drop zones.",
  "v0.17.6 \u2014 Removed clash animation, VS centered as flex child, big torch popup, brighter field, proportional scoreboard.",
  "v0.17.0 — Complete Gameplay Rebuild: Tecmo-style field with home endzones, drag-and-drop card selection (play\u2192player\u2192torch\u2192SNAP), broadcast play-by-play commentary with variable pacing, celebrations (TD rain, turnover crack, sack impact), TORCH points fly animation, 4-card clash display, conversion card selection, offense/defense energy shift, 2-minute drill transformation, btn-blitz consistency throughout.",
  "v0.16.0 — Team Selection Overhaul: Full-width team cards with SVG helmets (CT angular cactus, IR bulky trident), coach portraits (Vance/Burris), stadium cutouts (The Furnace/The Forge), star ratings, mottos, signature plays. Removed coach specialty, difficulty descriptions. Clean difficulty row.",
  "v0.14.1 — 8-Bug Fix: Conversion UI after TDs (XP/2pt/3pt), defense hand rendering, endGame data pipeline, snap log team tracking, auto-draft key fix, audible import fix, version sync, Torch Cards count correction.",
  "v0.14.0 — Gameday UI: Full stadium overhaul! Textured field turf, broadcast narrative ticker with portraits, vertical crowd noise gauge, neon LOS/LTG lines, and physical mini-card system for the snap panel.",
  "v0.13.1 — Engine Fix: Resolved syntax errors in gameState.js that were breaking the Vite build.",
  "v0.13.0 — Ultimate Polish: Weather engine (Rain/Wind/Snow), Momentum Meter (Home Noise), Coach Specializations, Halftime Locker Room & Shop, Audible mechanic, Matchup Intel, and Post-Game Play Log.",
  "v0.12.0 — UX Polish: Added pre-game progress bar, sequential BACK navigation, AUTO-PICK for drafting, difficulty tooltips, and animated coin toss rewards.",
  "v0.11.1 — UI & Animation Polish: Fixed home screen ball ignition timing, upscaled logo/text visuals, removed 'Free Play' placeholder, and cleaned up drafting labels.",
  "v0.11.0 — Franchise Edition: Balanced Python sim engine ported to JS, 50/50 team parity reached, Dual-side drafting (Offense + Defense), consolidated Team/Difficulty setup, 75% Challenge Flag buff, and legacy code removal.",
  "v0.10.0 Fixes — Defensive override resolved, scorebug integrated, ball reset to 50 fixed, explicit turnover alerts, UI/state sync improvements.",
  "v0.10.0+ — Gameplay engine built: snap resolver, AI opponent, game state manager, badge combos, play history, TORCH points, injuries. UI integration complete.",
  "Codebase cleanup: removed dead files, untracked dist/, deduplicated badgeSvg, cleaned dead CSS",
  "Phase 3 — UI integration: coin toss, gameplay screen, conversion choice, end game screen",
  "Phase 2 — Engine core: snapResolver, gameState, aiOpponent, ovrSystem, redZone, playHistory",
  "Phase 1 — Data layer: players, plays (offense+defense per team), torchCards, badges",
  "0.10.0 — Gameday Edition: arcade broadcast redesign, player art, Vite modular architecture",
];

export function buildHome(){
  var el=document.createElement('div');
  el.style.cssText='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 30px;position:relative;overflow:hidden;';

  // === LAYERED BACKGROUND ===
  // Base: deep purple radial
  var bgBase=document.createElement('div');
  bgBase.style.cssText='position:absolute;inset:0;background:radial-gradient(circle at 50% 30%,#2A0055 0%,#06001A 70%);z-index:0;';
  // Drifting layer for subtle movement
  var bgDrift=document.createElement('div');
  bgDrift.style.cssText='position:absolute;inset:-25%;width:150%;height:150%;background:radial-gradient(circle at 50% 40%,#2A0055 0%,transparent 60%);z-index:0;animation:bgDrift 15s ease-in-out infinite;opacity:0.6;';
  // Warm light pool behind flame area
  var bgWarm=document.createElement('div');
  bgWarm.style.cssText='position:absolute;top:15%;left:50%;transform:translateX(-50%);width:350px;height:350px;background:radial-gradient(circle,rgba(255,120,20,0.1) 0%,rgba(255,80,0,0.04) 40%,transparent 70%);z-index:0;pointer-events:none;';
  // Subtle magenta accent in corners
  var bgMagenta=document.createElement('div');
  bgMagenta.style.cssText='position:absolute;bottom:0;left:0;right:0;height:50%;background:radial-gradient(ellipse at 20% 100%,rgba(255,0,110,0.04) 0%,transparent 50%),radial-gradient(ellipse at 80% 100%,rgba(255,0,110,0.03) 0%,transparent 50%);z-index:0;pointer-events:none;';
  // Noise texture overlay
  var bgNoise=document.createElement('div');
  bgNoise.style.cssText='position:absolute;inset:0;z-index:0;opacity:0.03;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E");background-size:128px 128px;';
  el.append(bgBase,bgDrift,bgWarm,bgMagenta,bgNoise);

  // === EMBER PARTICLES ===
  var emberWrap=document.createElement('div');
  emberWrap.style.cssText='position:absolute;top:20%;left:50%;transform:translateX(-50%);width:200px;height:100px;z-index:1;pointer-events:none;';
  var drifts=[-25,-15,10,20,-8,15,-20,5,12,-18,8,-12,18,-5,22,-22];
  for(var e=0;e<14;e++){
    var ember=document.createElement('div');
    var sz=2+Math.random()*3;
    var dur=2.5+Math.random()*3;
    var delay=Math.random()*4;
    var left=30+Math.random()*40;
    ember.style.cssText='position:absolute;bottom:0;left:'+left+'%;width:'+sz+'px;height:'+sz+'px;border-radius:50%;background:radial-gradient(circle,var(--orange),transparent);opacity:0;animation:emberRise '+dur+'s '+delay+'s ease-out infinite;--drift:'+drifts[e%drifts.length]+'px;';
    emberWrap.appendChild(ember);
  }
  el.appendChild(emberWrap);

  // Dev changelog banner — localhost only
  var host=window.location.hostname;
  var isDev=host==='localhost'||host==='127.0.0.1'||/^192\.168\.\d+\.\d+$/.test(host)||/^10\.\d+\.\d+\.\d+$/.test(host);
  if(isDev){
    var dismissed=false;
    var expanded=false;
    var banner=document.createElement('div');
    banner.style.cssText=
      'position:absolute;top:0;left:0;right:0;z-index:100;background:rgba(0,0,0,0.85);'+
      'border-left:4px solid var(--cyan);padding:8px 12px;cursor:pointer;'+
      'font-family:"Courier New",monospace;font-size:9px;color:var(--muted);line-height:1.5;';

    function renderBanner(){
      if(dismissed){banner.style.display='none';return;}
      var html='<div style="display:flex;justify-content:space-between;align-items:center;">'+
        '<span style="color:var(--cyan);">DEV BUILD</span> · '+DEV_LOG[0]+
        '<span id="dev-dismiss" style="color:var(--muted);cursor:pointer;padding:0 4px;font-size:12px;">×</span></div>';
      if(expanded){
        html+='<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.08);">';
        DEV_LOG.forEach(function(entry,i){
          html+='<div style="opacity:'+(i===0?'1':'0.6')+';margin-bottom:2px;">'+entry+'</div>';
        });
        html+='</div>';
      }
      banner.innerHTML=html;
      banner.querySelector('#dev-dismiss').onclick=function(e){
        e.stopPropagation();dismissed=true;renderBanner();
      };
    }
    banner.onclick=function(){expanded=!expanded;renderBanner();};
    renderBanner();
    el.appendChild(banner);
  }

  // === HERO: Single flame with football inside ===
  var logoWrap=document.createElement('div');
  logoWrap.style.cssText='position:relative;display:flex;align-items:center;justify-content:center;width:160px;height:200px;margin-bottom:8px;z-index:2;animation:homeRevealScale 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both;';

  // Main flame SVG — sole hero element
  var fireEl=document.createElement('div');
  fireEl.style.cssText='width:160px;height:200px;animation:flameSway 2.5s ease-in-out infinite;z-index:1;';
  fireEl.innerHTML='<svg viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">'
    +'<defs>'
    +'<linearGradient id="flameOuter" x1="50" y1="140" x2="50" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FF5E1A"/><stop offset="50%" stop-color="#FF8C00"/><stop offset="100%" stop-color="#FFD700"/></linearGradient>'
    +'<linearGradient id="flameInner" x1="50" y1="120" x2="50" y2="20" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FF5E1A"/><stop offset="40%" stop-color="#FFAA00"/><stop offset="100%" stop-color="#FFFBE6"/></linearGradient>'
    +'<filter id="flameGlow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
    +'</defs>'
    +'<path d="M50 2C50 2 20 35 15 65C10 95 25 120 35 128C35 128 30 105 38 85C42 75 48 68 50 55C52 68 58 75 62 85C70 105 65 128 65 128C75 120 90 95 85 65C80 35 50 2 50 2Z" fill="url(#flameOuter)" filter="url(#flameGlow)"/>'
    +'<path d="M50 25C50 25 35 50 32 72C29 94 38 112 45 118C45 118 40 100 45 85C48 76 50 70 50 60C50 70 52 76 55 85C60 100 55 118 55 118C62 112 71 94 68 72C65 50 50 25 50 25Z" fill="url(#flameInner)" opacity="0.9" style="animation:flameInnerSway 1.8s ease-in-out infinite;transform-origin:50% 100%;"/>'
    +'<ellipse cx="50" cy="125" rx="18" ry="8" fill="#FF5E1A" opacity="0.3"/>'
    +'</svg>';

  // Football nestled inside the flame
  var ballCont=document.createElement('div');
  ballCont.style.cssText='position:absolute;top:45%;left:50%;transform:translate(-50%,-50%);z-index:10;pointer-events:none;animation:ballHover 3s ease-in-out infinite;';
  var ballIcon=document.createElement('div');
  ballIcon.style.cssText='font-size:50px;filter:drop-shadow(0 0 12px rgba(0,0,0,0.8)) drop-shadow(0 0 20px rgba(255,140,0,0.4));';
  ballIcon.textContent='\uD83C\uDFC8';
  var ballFire=document.createElement('div');
  ballFire.style.cssText='position:absolute;inset:-10px;width:80px;height:80px;animation:ballIgnite 2s ease-in-out infinite;pointer-events:none;mix-blend-mode:screen;';
  ballFire.innerHTML='<svg viewBox="0 0 100 140" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><linearGradient id="bfOuter" x1="50" y1="140" x2="50" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FF5E1A"/><stop offset="50%" stop-color="#FF8C00"/><stop offset="100%" stop-color="#FFD700"/></linearGradient></defs><path d="M50 2C50 2 20 35 15 65C10 95 25 120 35 128C35 128 30 105 38 85C42 75 48 68 50 55C52 68 58 75 62 85C70 105 65 128 65 128C75 120 90 95 85 65C80 35 50 2 50 2Z" fill="url(#bfOuter)" opacity="0.6"/></svg>';
  ballCont.append(ballIcon,ballFire);

  logoWrap.append(fireEl,ballCont);
  el.appendChild(logoWrap);

  // === TITLE LOCKUP: TORCH + FOOTBALL as one composed unit ===
  var title=document.createElement('h1');
  title.style.cssText="font-family:'Teko',sans-serif;font-weight:700;font-size:88px;line-height:0.85;color:#FFD54F;text-shadow:2px 2px 0 rgba(0,0,0,0.9),4px 4px 0 #1a0a00,0 0 30px rgba(255,204,0,0.4);transform:skewX(-8deg);margin-bottom:0;text-align:center;letter-spacing:6px;z-index:2;animation:homeRevealUp 0.5s ease-out 0.4s both,titleShimmer 4s ease-in-out 2s infinite;";
  title.innerHTML='TORCH<span style="display:block;color:white;font-family:\'Barlow Condensed\',sans-serif;font-weight:600;font-size:36px;letter-spacing:8px;text-shadow:2px 2px 0 rgba(0,0,0,0.8);margin-top:4px;transform:skewX(0deg);">FOOTBALL</span>';
  el.append(title);

  // === TAGLINE ===
  var tagline=document.createElement('div');
  tagline.style.cssText="font-family:'Press Start 2P',monospace;font-size:7px;color:var(--cyan);letter-spacing:3px;text-align:center;margin-top:10px;margin-bottom:8px;z-index:2;opacity:0;animation:homeRevealUp 0.4s ease-out 0.7s both;text-shadow:0 0 12px rgba(0,234,255,0.3);";
  tagline.textContent='DRAFT. SNAP. SCORE.';
  el.append(tagline);

  // === TEAM VS TEASER ===
  var vsWrap=document.createElement('div');
  vsWrap.style.cssText='display:flex;align-items:center;justify-content:center;gap:12px;margin-top:12px;margin-bottom:16px;z-index:2;opacity:0;animation:homeRevealUp 0.4s ease-out 0.9s both;';
  // CT icon
  var ctIcon=document.createElement('div');
  ctIcon.style.cssText='width:36px;height:36px;border-radius:50%;background:#1a0800;border:2px solid #FF5E1A;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 0 12px rgba(255,94,26,0.3);';
  ctIcon.textContent='\uD83C\uDF35';
  // VS
  var vsLabel=document.createElement('div');
  vsLabel.style.cssText="font-family:'Teko',sans-serif;font-weight:700;font-size:20px;color:var(--muted);letter-spacing:2px;";
  vsLabel.textContent='VS';
  // IR icon
  var irIcon=document.createElement('div');
  irIcon.style.cssText='width:36px;height:36px;border-radius:50%;background:#1a0000;border:2px solid #CC1A1A;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 0 12px rgba(204,26,26,0.3);';
  irIcon.textContent='\uD83D\uDD31';
  vsWrap.append(ctIcon,vsLabel,irIcon);
  el.append(vsWrap);

  // === CARD FAN PREVIEW ===
  var cardFan=document.createElement('div');
  cardFan.style.cssText='position:relative;display:flex;align-items:center;justify-content:center;width:200px;height:60px;margin-bottom:20px;z-index:2;opacity:0;animation:homeRevealUp 0.4s ease-out 1.0s both;';
  var fanCards=['HAIL MARY','COVER 0','BLITZ'];
  var fanAngles=[-12,0,12];
  var fanX=[-28,0,28];
  for(var c=0;c<3;c++){
    var card=document.createElement('div');
    card.style.cssText='position:absolute;width:52px;height:72px;border-radius:6px;border:2px solid rgba(255,255,255,0.2);background:linear-gradient(145deg,#1a1030 0%,#0f0d1a 100%);display:flex;align-items:center;justify-content:center;text-align:center;transform:rotate('+fanAngles[c]+'deg) translateX('+fanX[c]+'px);box-shadow:0 4px 12px rgba(0,0,0,0.4);';
    card.innerHTML='<span style="font-family:\'Press Start 2P\',monospace;font-size:5px;color:rgba(255,255,255,0.5);line-height:1.4;padding:4px;">'+fanCards[c]+'</span>';
    cardFan.appendChild(card);
  }
  el.append(cardFan);

  // === CTA BUTTON ===
  var playWrap=document.createElement('div');
  playWrap.style.cssText='width:100%;z-index:2;position:relative;display:flex;flex-direction:column;gap:20px;opacity:0;animation:homeRevealBtn 0.4s ease-out 1.1s both;';
  var playBtn=document.createElement('button');
  playBtn.className='btn-blitz';
  playBtn.style.cssText='border-color:var(--cyan);color:#000;background:linear-gradient(180deg,#00ffcc 0%,#00c8aa 100%);font-size:20px;padding:24px 20px;animation:ctaGlow 3s ease-in-out 2s infinite;';
  playBtn.textContent='PICK YOUR TEAM';
  playBtn.onclick=function(){
    SND.click();
    setGs(function(s){ return Object.assign({}, s, {screen:'setup', team:null, side:null}); });
  };

  var devBtn=document.createElement('button');
  devBtn.className='btn-blitz';
  devBtn.style.cssText='display:none;border-color:var(--muted);color:var(--muted);background:transparent;box-shadow:none;font-size:8px;padding:10px;margin-top:20px;';
  devBtn.textContent='DEV: RESET DAILY LOCK';
  devBtn.onclick=function(){localStorage.clear(); render();};

  playWrap.append(playBtn,devBtn);
  el.appendChild(playWrap);

  // DEV-ONLY: Quick Play — skip all drafts, straight to gameplay
  if(isDev){
    var quickBtn=document.createElement('button');
    quickBtn.style.cssText=
      'position:absolute;bottom:12px;right:12px;z-index:9999;'+
      'background:rgba(0,0,0,0.85);border:1px solid var(--cyan);border-radius:20px;'+
      'padding:5px 10px;cursor:pointer;'+
      'font-family:"Courier New",monospace;font-size:9px;color:var(--cyan);'+
      'letter-spacing:0.5px;opacity:0.6;transition:opacity 0.15s;';
    quickBtn.textContent='\u26A1 QP';
    quickBtn.onmouseenter=function(){quickBtn.style.opacity='1';};
    quickBtn.onmouseleave=function(){quickBtn.style.opacity='0.6';};
    quickBtn.onclick=function(){
      SND.click();
      var offRoster=['ct_q1','ct_s1','ct_s3','ct_s4'];
      var defRoster=['ct_db1','ct_db3','ct_dl1','ct_db4'];
      var offHand=getOffCards('canyon_tech').slice(0,4);
      var defHand=getDefCards('canyon_tech').slice(0,4);
      setGs(function(){
        return {
          screen:'gameplay',
          team:'canyon_tech',
          offRoster:offRoster,
          defRoster:defRoster,
          offHand:offHand,
          defHand:defHand,
          humanReceives:true,
          _coinTossDone:true,
        };
      });
    };
    el.appendChild(quickBtn);
  }

  var buildLabel=document.createElement('div');
  buildLabel.style.cssText='position:absolute;bottom:12px;width:100%;text-align:center;font-family:"Courier New",monospace;font-size:8px;color:#ffffff22;letter-spacing:1px;z-index:2;opacity:0;animation:fi 0.3s ease-out 1.5s both;';
  buildLabel.textContent='v' + VERSION + ' \u00b7 ' + VERSION_NAME;
  el.appendChild(buildLabel);

  return el;
}
