import { SND } from '../../engine/sound.js';
import { render, setGs, getOffCards, getDefCards, VERSION, VERSION_NAME } from '../../state.js';

var DEV_LOG = [
  "v0.19.0 \u2014 Premium UI: Layered atmosphere home screen, torch-pass football SVG, playing-card fan with football art, entrance choreography, Teko+Rajdhani font system, ember particles, title shimmer, CTA glow breathe.",
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
  el.style.cssText='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:50px 30px;position:relative;overflow:hidden;gap:6px;';

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

  // === EMBER PARTICLES — prominent, emanating from logo area ===
  var emberWrap=document.createElement('div');
  emberWrap.style.cssText='position:absolute;top:30%;left:50%;transform:translateX(-50%);width:300px;height:160px;z-index:1;pointer-events:none;';
  var drifts=[-30,-18,12,25,-10,18,-24,8,15,-22,10,-15,22,-8,28,-28,14,-20];
  for(var e=0;e<22;e++){
    var ember=document.createElement('div');
    var sz=2+Math.random()*4;
    var dur=2+Math.random()*3.5;
    var delay=Math.random()*5;
    var left=20+Math.random()*60;
    ember.style.cssText='position:absolute;bottom:0;left:'+left+'%;width:'+sz+'px;height:'+sz+'px;border-radius:50%;background:radial-gradient(circle,#FF8C00,rgba(255,94,26,0.6),transparent);opacity:0;animation:emberRise '+dur+'s '+delay+'s ease-out infinite;--drift:'+drifts[e%drifts.length]+'px;';
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

  // Cards go ABOVE the title — they are the hero element

  // === CARD FAN — playing card style with football art ===
  var cardFan=document.createElement('div');
  cardFan.style.cssText='position:relative;display:flex;align-items:center;justify-content:center;width:320px;height:160px;margin-top:10px;margin-bottom:16px;z-index:2;opacity:0;animation:homeRevealScale 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both;overflow:visible;';
  // Card data: accent color, bg tint, label, pip color, card type, art SVG
  var fanData=[
    {accent:'#F5B800',bg:'#0a1a08',label:'OFFENSE',pip:'#00E5C0',
     art:'<svg viewBox="0 0 448 512" width="40" height="46" style="margin-top:2px;">'
       +'<defs><linearGradient id="boltGrad" x1="100" y1="500" x2="350" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#F5B800"/><stop offset="100%" stop-color="#FFFACD"/></linearGradient>'
       +'<filter id="boltGlow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'
       +'<path fill="url(#boltGrad)" filter="url(#boltGlow)" d="M349.4 44.6c5.9-13.7 1.5-29.7-10.6-38.5s-28.6-8-39.9 1.8l-256 224c-10 8.8-13.6 22.9-8.9 35.3S50.7 288 64 288l111.5 0L98.6 467.4c-5.9 13.7-1.5 29.7 10.6 38.5s28.6 8 39.9-1.8l256-224c10-8.8 13.6-22.9 8.9-35.3s-16.6-20.7-30-20.7l-111.5 0L349.4 44.6z"/>'
       +'</svg>',
     cornerPip:'<svg viewBox="0 0 448 512" width="5" height="6"><path d="M349.4 44.6c5.9-13.7 1.5-29.7-10.6-38.5s-28.6-8-39.9 1.8l-256 224c-10 8.8-13.6 22.9-8.9 35.3S50.7 288 64 288l111.5 0L98.6 467.4c-5.9 13.7-1.5 29.7 10.6 38.5s28.6 8 39.9-1.8l256-224c10-8.8 13.6-22.9 8.9-35.3s-16.6-20.7-30-20.7l-111.5 0L349.4 44.6z" fill="#FFD700"/></svg>'},
    {accent:'#FF5E1A',bg:'#1a0800',label:'TORCH',pip:'#FF5E1A',
     art:'<svg viewBox="-8 -10 60 72" fill="none" width="48" height="58" style="margin-top:-4px;">'
       +'<defs><linearGradient id="noGrad" x1="22" y1="50" x2="22" y2="0"><stop offset="0%" stop-color="#FF5E1A"/><stop offset="100%" stop-color="#FFD700"/></linearGradient>'
       +'<linearGradient id="noInner" x1="22" y1="44" x2="22" y2="8"><stop offset="0%" stop-color="#FFAA00"/><stop offset="100%" stop-color="#FFFBE6"/></linearGradient>'
       +'<filter id="fGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'
       +'<path d="M22 0C22 0 6 16 4 28C2 40 12 48 18 52C18 52 13 42 18 30C20 24 21 19 22 13C23 19 24 24 26 30C31 42 26 52 26 52C32 48 42 40 40 28C38 16 22 0 22 0Z" fill="url(#noGrad)" filter="url(#fGlow)" style="animation:flameSway 2.5s ease-in-out infinite;transform-origin:50% 100%;"/>'
       +'<path d="M22 12C22 12 13 24 12 32C11 40 15 46 19 49C19 49 16 41 19 32C20 28 21 25 22 20C23 25 24 28 25 32C28 41 25 49 25 49C29 46 33 40 32 32C31 24 22 12 22 12Z" fill="url(#noInner)" opacity="0.6" style="animation:flameInnerSway 1.8s ease-in-out infinite;transform-origin:50% 100%;"/>'
       +'<ellipse cx="22" cy="52" rx="9" ry="3" fill="#FF5E1A" opacity="0.25"/>'
       +'</svg>',
     cornerPip:'<svg viewBox="0 0 5 6" width="5" height="6"><path d="M2.5 0C2.5 0 0.5 2 0.5 3.5C0.5 5 2 5.5 2.5 5.5C3 5.5 4.5 5 4.5 3.5C4.5 2 2.5 0 2.5 0Z" fill="#FF5E1A"/></svg>'},
    {accent:'#00E5C0',bg:'#041518',label:'DEFENSE',pip:'#8B5CF6',
     art:'<svg viewBox="0 0 512 512" width="38" height="38" style="margin-top:4px;">'
       +'<defs><linearGradient id="shieldGrad" x1="256" y1="512" x2="256" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#008B74"/><stop offset="100%" stop-color="#80FFF0"/></linearGradient>'
       +'<filter id="shieldGlow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'
       +'<path fill="url(#shieldGrad)" filter="url(#shieldGlow)" d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8l0 378.1C394 378 431.1 230.1 432 141.4L256 66.8s0 0 0 0z"/>'
       +'</svg>',
     cornerPip:'<svg viewBox="0 0 512 512" width="5" height="6"><path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0z" fill="#00FFDD"/></svg>'},
  ];
  var fanAngles=[-16,0,16];
  var fanX=[-62,0,62];
  var fanY=[10,0,10];
  var fanZ=[1,3,1];
  var fanScale=[1,1.06,1];
  for(var c=0;c<3;c++){
    var d=fanData[c];
    var isCenter=c===1;
    var card=document.createElement('div');
    card.style.cssText='position:absolute;width:82px;height:114px;border-radius:6px;'
      +'background:linear-gradient(170deg,'+d.bg+' 0%,#09081A 100%);'
      +'display:flex;flex-direction:column;align-items:center;justify-content:center;'
      +'transform:rotate('+fanAngles[c]+'deg) translateX('+fanX[c]+'px) translateY('+fanY[c]+'px) scale('+fanScale[c]+');'
      +'z-index:'+fanZ[c]+';'
      +'box-shadow:0 4px 16px rgba(0,0,0,0.5)'+(isCenter?',0 0 12px rgba(245,184,0,0.15)':'')+';'
      +'overflow:hidden;position:absolute;';
    // Gradient border wrapper
    var borderWrap=document.createElement('div');
    borderWrap.style.cssText='position:absolute;inset:-2px;border-radius:8px;background:linear-gradient(135deg,'+d.accent+',#F5B800,'+d.accent+');z-index:-1;';
    card.appendChild(borderWrap);
    // Card margin (2px inset light border — "bleed margin")
    var margin=document.createElement('div');
    margin.style.cssText='position:absolute;inset:3px;border-radius:4px;border:1px solid '+d.accent+'66;pointer-events:none;z-index:4;';
    card.appendChild(margin);
    // Corner pip — top left
    var pipTL=document.createElement('div');
    pipTL.style.cssText='position:absolute;top:6px;left:6px;z-index:5;';
    pipTL.innerHTML=d.cornerPip;
    card.appendChild(pipTL);
    // Corner pip — bottom right (rotated 180)
    var pipBR=document.createElement('div');
    pipBR.style.cssText='position:absolute;bottom:20px;right:6px;z-index:5;transform:rotate(180deg);';
    pipBR.innerHTML=d.cornerPip;
    card.appendChild(pipBR);
    // Center art area
    var artArea=document.createElement('div');
    artArea.style.cssText='margin-top:2px;z-index:3;';
    artArea.innerHTML=d.art;
    card.appendChild(artArea);
    // Bottom nameplate
    var nameplate=document.createElement('div');
    var isTorch=d.label==='TORCH';
    nameplate.style.cssText='position:absolute;bottom:0;left:0;right:0;height:'+(isTorch?'18':'16')+'px;background:'+d.accent+(isTorch?'ee':'dd')+';display:flex;align-items:center;justify-content:center;z-index:5;border-radius:0 0 4px 4px;';
    var npText=document.createElement('div');
    if(isTorch){
      npText.style.cssText="font-family:'Teko',sans-serif;font-weight:700;font-size:14px;color:#09081A;letter-spacing:3px;transform:skewX(-8deg);";
    } else {
      npText.style.cssText="font-family:'Rajdhani',sans-serif;font-weight:700;font-size:9px;color:#000;letter-spacing:2px;text-shadow:0 0 4px rgba(255,255,255,0.3);";
    }
    npText.textContent=d.label;
    nameplate.appendChild(npText);
    card.appendChild(nameplate);
    // Shimmer sweep
    var shimmer=document.createElement('div');
    shimmer.style.cssText='position:absolute;inset:0;border-radius:6px;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.06) 50%,transparent 60%);animation:cardShimmer 4s '+(c*0.5)+'s ease-in-out infinite;pointer-events:none;z-index:6;';
    card.appendChild(shimmer);
    cardFan.appendChild(card);
  }
  el.append(cardFan);

  // === TITLE: T(football)RCH FOOTBALL ===
  var title=document.createElement('h1');
  title.style.cssText="font-family:'Teko',sans-serif;font-weight:700;font-size:96px;line-height:0.85;color:#FFD54F;text-shadow:2px 2px 0 rgba(0,0,0,0.9),4px 4px 0 #1a0a00,0 0 30px rgba(255,204,0,0.4);transform:skewX(-8deg);margin-bottom:0;text-align:center;letter-spacing:8px;z-index:2;animation:homeRevealUp 0.5s ease-out 0.4s both,titleShimmer 4s ease-in-out 2s infinite;position:relative;";
  // Football-O: Font Awesome football (CC BY 4.0) rotated to vertical
  var footballO='<span style="position:relative;display:inline-flex;align-items:center;justify-content:center;width:54px;height:72px;vertical-align:middle;margin:0 -2px 6px;">'
    +'<svg viewBox="0 0 512 512" width="52" height="52" fill="none" style="transform:rotate(-45deg);filter:drop-shadow(0 0 6px rgba(255,140,0,0.5)) drop-shadow(0 0 12px rgba(255,94,26,0.3));">'
    +'<defs><linearGradient id="oGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#D4893B"/><stop offset="45%" stop-color="#B5652B"/><stop offset="100%" stop-color="#8B4A1F"/></linearGradient>'
    +'<filter id="oGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'
    +'<path fill="url(#oGrad)" d="M247.5 25.4c-13.5 3.3-26.4 7.2-38.6 11.7C142.9 61.6 96.7 103.6 66 153.6C47.8 183.4 35.1 215.9 26.9 249L264.5 486.6c13.5-3.3 26.4-7.2 38.6-11.7c66-24.5 112.2-66.5 142.9-116.5c18.3-29.8 30.9-62.3 39.1-95.3L247.5 25.4zM495.2 205.3c6.1-56.8 1.4-112.2-7.7-156.4c-2.7-12.9-13-22.9-26.1-25.1c-58.2-9.7-109.9-12-155.6-7.9L495.2 205.3zM206.1 496L16.8 306.7c-6.1 56.8-1.4 112.2 7.7 156.4c2.7 12.9 13 22.9 26.1 25.1c58.2 9.7 109.9 12 155.6 7.9z"/>'
    +'<path fill="#FFFBE6" filter="url(#oGlow)" d="M260.7 164.7c6.2-6.2 16.4-6.2 22.6 0l64 64c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-64-64c-6.2-6.2-6.2-16.4 0-22.6zm-48 48c6.2-6.2 16.4-6.2 22.6 0l64 64c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-64-64c-6.2-6.2-6.2-16.4 0-22.6zm-48 48c6.2-6.2 16.4-6.2 22.6 0l64 64c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-64-64c-6.2-6.2-6.2-16.4 0-22.6z"/>'
    +'</svg></span>';
  title.innerHTML='T'+footballO+'RCH<span style="display:block;color:white;font-family:\'Barlow Condensed\',sans-serif;font-weight:600;font-size:40px;letter-spacing:10px;text-shadow:2px 2px 0 rgba(0,0,0,0.8);margin-top:4px;transform:skewX(0deg);">FOOTBALL</span>';
  el.append(title);

  // === TAGLINE ===
  var tagline=document.createElement('div');
  tagline.style.cssText="font-family:'Rajdhani',sans-serif;font-weight:600;font-size:13px;color:var(--cyan);letter-spacing:5px;text-align:center;margin-top:8px;margin-bottom:12px;z-index:2;opacity:0;animation:homeRevealUp 0.4s ease-out 0.6s both;text-shadow:0 0 12px rgba(0,234,255,0.3);text-transform:uppercase;";
  tagline.textContent='DEAL THE PLAY';
  el.append(tagline);

  // === CTA BUTTON ===
  var playWrap=document.createElement('div');
  playWrap.style.cssText='width:100%;z-index:2;position:relative;display:flex;flex-direction:column;gap:20px;opacity:0;animation:homeRevealBtn 0.4s ease-out 1.0s both;';
  var playBtn=document.createElement('button');
  playBtn.className='btn-blitz';
  playBtn.style.cssText='border-color:var(--cyan);color:#000;background:linear-gradient(180deg,#00ffcc 0%,#00c8aa 100%);font-size:20px;padding:18px 20px;animation:ctaGlow 3s ease-in-out 2s infinite;letter-spacing:4px;';
  playBtn.textContent='PLAY';
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
