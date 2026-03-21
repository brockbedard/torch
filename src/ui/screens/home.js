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

  // === HERO: "The Torch Pass" — football fused with flame ===
  var logoWrap=document.createElement('div');
  logoWrap.style.cssText='position:relative;display:flex;align-items:center;justify-content:center;width:160px;height:220px;margin-bottom:4px;z-index:2;animation:homeRevealScale 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both;';

  var fireEl=document.createElement('div');
  fireEl.style.cssText='width:160px;height:220px;animation:flameSway 2.5s ease-in-out infinite;z-index:1;';
  fireEl.innerHTML='<svg viewBox="0 0 120 180" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">'
    +'<defs>'
    +'<linearGradient id="flameOuter" x1="60" y1="180" x2="60" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FF5E1A"/><stop offset="50%" stop-color="#FF8C00"/><stop offset="100%" stop-color="#FFD700"/></linearGradient>'
    +'<linearGradient id="flameInner" x1="60" y1="150" x2="60" y2="20" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FF5E1A"/><stop offset="40%" stop-color="#FFAA00"/><stop offset="100%" stop-color="#FFFBE6"/></linearGradient>'
    +'<linearGradient id="ballGrad" x1="36" y1="140" x2="84" y2="165" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#D4893B"/><stop offset="50%" stop-color="#B5652B"/><stop offset="100%" stop-color="#8B4A1F"/></linearGradient>'
    +'<linearGradient id="laceGlow" x1="55" y1="140" x2="65" y2="155" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FFFBE6"/><stop offset="100%" stop-color="#FFD080"/></linearGradient>'
    +'<filter id="flameGlow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
    +'<filter id="hotGlow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
    +'</defs>'
    // Flame erupts from the football
    +'<path d="M60 2C60 2 28 40 22 75C16 110 32 138 42 148C42 148 36 122 45 100C50 88 56 78 60 65C64 78 70 88 75 100C84 122 78 148 78 148C88 138 104 110 98 75C92 40 60 2 60 2Z" fill="url(#flameOuter)" filter="url(#flameGlow)"/>'
    +'<path d="M60 28C60 28 42 58 38 82C34 106 44 128 52 136C52 136 46 115 52 98C56 88 58 80 60 70C62 80 64 88 68 98C74 115 68 136 68 136C76 128 86 106 82 82C78 58 60 28 60 28Z" fill="url(#flameInner)" opacity="0.9" style="animation:flameInnerSway 1.8s ease-in-out infinite;transform-origin:50% 100%;"/>'
    // Football at the base — pointed oval (not ellipse), tilted 30deg
    +'<g transform="translate(60,153) rotate(-30)">'
    // Pointed football body shape
    +'<path d="M-26 0C-26 -5 -20 -13 -10 -14C-3 -14.5 3 -14.5 10 -14C20 -13 26 -5 26 0C26 5 20 13 10 14C3 14.5 -3 14.5 -10 14C-20 13 -26 5 -26 0Z" fill="url(#ballGrad)" stroke="#6B3410" stroke-width="0.8"/>'
    // Specular highlight — upper left
    +'<ellipse cx="-6" cy="-5" rx="10" ry="4" fill="white" opacity="0.1" transform="rotate(-15)"/>'
    // White tip stripes (college football)
    +'<path d="M-23 -3C-22 -7 -20 -10 -17 -11.5" stroke="#F5F0E0" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.85"/>'
    +'<path d="M-23 3C-22 7 -20 10 -17 11.5" stroke="#F5F0E0" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.85"/>'
    +'<path d="M23 -3C22 -7 20 -10 17 -11.5" stroke="#F5F0E0" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.85"/>'
    +'<path d="M23 3C22 7 20 10 17 11.5" stroke="#F5F0E0" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.85"/>'
    // Center seam (curved along top contour)
    +'<path d="M-14 -2.5C-7 -6.5 7 -6.5 14 -2.5" stroke="#FFFBE6" stroke-width="1.3" stroke-linecap="round" fill="none" filter="url(#hotGlow)"/>'
    // 5 cross-stitches
    +'<line x1="-9" y1="-6.5" x2="-9" y2="-0.5" stroke="#FFFBE6" stroke-width="0.9" stroke-linecap="round" filter="url(#hotGlow)"/>'
    +'<line x1="-4.5" y1="-7.5" x2="-4.5" y2="-1.5" stroke="#FFFBE6" stroke-width="0.9" stroke-linecap="round" filter="url(#hotGlow)"/>'
    +'<line x1="0" y1="-7.8" x2="0" y2="-1.8" stroke="#FFFBE6" stroke-width="0.9" stroke-linecap="round" filter="url(#hotGlow)"/>'
    +'<line x1="4.5" y1="-7.5" x2="4.5" y2="-1.5" stroke="#FFFBE6" stroke-width="0.9" stroke-linecap="round" filter="url(#hotGlow)"/>'
    +'<line x1="9" y1="-6.5" x2="9" y2="-0.5" stroke="#FFFBE6" stroke-width="0.9" stroke-linecap="round" filter="url(#hotGlow)"/>'
    +'</g>'
    // Speed lines trailing behind the nose
    +'<path d="M38 161Q30 166 24 163" stroke="#FF8C00" stroke-width="1.2" fill="none" opacity="0.35"/>'
    +'<path d="M36 165Q26 170 20 167" stroke="#FF5E1A" stroke-width="0.9" fill="none" opacity="0.25"/>'
    +'<path d="M40 157Q34 160 28 158" stroke="#FFD700" stroke-width="0.7" fill="none" opacity="0.2"/>'
    // Base glow
    +'<ellipse cx="60" cy="167" rx="22" ry="7" fill="#FF5E1A" opacity="0.15"/>'
    +'</svg>';

  logoWrap.append(fireEl);
  el.appendChild(logoWrap);

  // === TITLE LOCKUP: TORCH + FOOTBALL as one composed unit ===
  var title=document.createElement('h1');
  title.style.cssText="font-family:'Teko',sans-serif;font-weight:700;font-size:88px;line-height:0.85;color:#FFD54F;text-shadow:2px 2px 0 rgba(0,0,0,0.9),4px 4px 0 #1a0a00,0 0 30px rgba(255,204,0,0.4);transform:skewX(-8deg);margin-bottom:0;text-align:center;letter-spacing:6px;z-index:2;animation:homeRevealUp 0.5s ease-out 0.4s both,titleShimmer 4s ease-in-out 2s infinite;";
  title.innerHTML='TORCH<span style="display:block;color:white;font-family:\'Barlow Condensed\',sans-serif;font-weight:600;font-size:36px;letter-spacing:8px;text-shadow:2px 2px 0 rgba(0,0,0,0.8);margin-top:4px;transform:skewX(0deg);">FOOTBALL</span>';
  el.append(title);

  // === TAGLINE ===
  var tagline=document.createElement('div');
  tagline.style.cssText="font-family:'Rajdhani',sans-serif;font-weight:600;font-size:11px;color:var(--cyan);letter-spacing:4px;text-align:center;margin-top:10px;margin-bottom:8px;z-index:2;opacity:0;animation:homeRevealUp 0.4s ease-out 0.7s both;text-shadow:0 0 12px rgba(0,234,255,0.3);text-transform:uppercase;";
  tagline.textContent='DEAL THE PLAY.';
  el.append(tagline);

  // === CARD FAN — playing card style with football art ===
  var cardFan=document.createElement('div');
  cardFan.style.cssText='position:relative;display:flex;align-items:center;justify-content:center;width:240px;height:100px;margin-top:12px;margin-bottom:20px;z-index:2;opacity:0;animation:homeRevealUp 0.4s ease-out 0.9s both;overflow:visible;';
  // Card data: accent color, bg tint, label, pip color, card type, art SVG
  var fanData=[
    {accent:'#F5B800',bg:'#0a1a08',label:'OFFENSE',pip:'#00E5C0',
     art:'<svg viewBox="0 0 36 38" fill="none" width="36" height="38">'
       +'<defs><linearGradient id="boltGrad" x1="18" y1="36" x2="18" y2="2"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#FFFACD"/></linearGradient></defs>'
       +'<path d="M20 2L10 18L16 18L12 36L26 16L19 16L24 2Z" fill="url(#boltGrad)" stroke="#FFE066" stroke-width="0.5"/>'
       +'<path d="M19 8L14 20L17.5 20L15 32L23 18L19.5 18L22 8Z" fill="#FFFACD" opacity="0.5"/>'
       +'</svg>',
     cornerPip:'<svg viewBox="0 0 6 8" width="4" height="5"><path d="M3.5 0L1 4L2.5 4L1.5 8L5 3L3.2 3L4.5 0Z" fill="#FFD700"/></svg>'},
    {accent:'#FF5E1A',bg:'#1a0800',label:'TORCH',pip:'#FF5E1A',
     art:'<svg viewBox="0 0 36 38" fill="none" width="36" height="38">'
       +'<path d="M18 4C18 4 10 14 9 20C8 26 12 31 15 33C15 33 13 27 15 22C16 19 17 17 18 14C19 17 20 19 21 22C23 27 21 33 21 33C24 31 28 26 27 20C26 14 18 4 18 4Z" fill="url(#noGrad)" stroke="#FF5E1A" stroke-width="0.5" opacity="0.9"/>'
       +'<path d="M18 12C18 12 14 18 13 22C12 26 14 30 16 32C16 32 15 28 16 24C17 21 18 19 18 16C18 19 19 21 20 24C21 28 20 32 20 32C22 30 24 26 23 22C22 18 18 12 18 12Z" fill="#FFD700" opacity="0.5"/>'
       +'<line x1="14" y1="36" x2="22" y2="36" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>'
       +'<path d="M16 2L18 0L20 2" stroke="rgba(255,255,255,0.2)" stroke-width="0.5" fill="none"/>'
       +'<defs><linearGradient id="noGrad" x1="18" y1="33" x2="18" y2="4"><stop offset="0%" stop-color="#FF5E1A"/><stop offset="100%" stop-color="#FFD700"/></linearGradient></defs>'
       +'</svg>',
     cornerPip:'<svg viewBox="0 0 5 6" width="4" height="5"><path d="M2.5 0C2.5 0 0.5 2 0.5 3.5C0.5 5 2 5.5 2.5 5.5C3 5.5 4.5 5 4.5 3.5C4.5 2 2.5 0 2.5 0Z" fill="#FF5E1A"/></svg>'},
    {accent:'#00E5C0',bg:'#041518',label:'DEFENSE',pip:'#8B5CF6',
     art:'<svg viewBox="0 0 36 38" fill="none" width="36" height="38">'
       +'<defs><linearGradient id="shieldGrad" x1="18" y1="36" x2="18" y2="2"><stop offset="0%" stop-color="#00FFDD"/><stop offset="100%" stop-color="#80FFF0"/></linearGradient></defs>'
       +'<path d="M18 2C18 2 6 4 6 10C6 18 8 26 18 36C28 26 30 18 30 10C30 4 18 2 18 2Z" fill="url(#shieldGrad)" stroke="#80FFF0" stroke-width="0.5"/>'
       +'<path d="M18 8C18 8 11 9.5 11 13C11 18 12.5 24 18 31C23.5 24 25 18 25 13C25 9.5 18 8 18 8Z" fill="#80FFF0" opacity="0.35"/>'
       +'<line x1="18" y1="10" x2="18" y2="28" stroke="#80FFF0" stroke-width="0.5" opacity="0.2"/>'
       +'</svg>',
     cornerPip:'<svg viewBox="0 0 6 7" width="4" height="5"><path d="M3 0C3 0 0.5 0.5 0.5 2C0.5 3.5 1.5 5 3 7C4.5 5 5.5 3.5 5.5 2C5.5 0.5 3 0 3 0Z" fill="#00FFDD"/></svg>'},
  ];
  var fanAngles=[-18,0,18];
  var fanX=[-42,0,42];
  var fanY=[5,0,5];
  var fanZ=[1,3,1];
  var fanScale=[1,1.06,1];
  for(var c=0;c<3;c++){
    var d=fanData[c];
    var isCenter=c===1;
    var card=document.createElement('div');
    card.style.cssText='position:absolute;width:56px;height:78px;border-radius:5px;'
      +'background:linear-gradient(170deg,'+d.bg+' 0%,#09081A 100%);'
      +'display:flex;flex-direction:column;align-items:center;justify-content:center;'
      +'transform:rotate('+fanAngles[c]+'deg) translateX('+fanX[c]+'px) translateY('+fanY[c]+'px) scale('+fanScale[c]+');'
      +'z-index:'+fanZ[c]+';'
      +'box-shadow:0 4px 16px rgba(0,0,0,0.5)'+(isCenter?',0 0 12px rgba(245,184,0,0.15)':'')+';'
      +'overflow:hidden;position:absolute;';
    // Gradient border wrapper
    var borderWrap=document.createElement('div');
    borderWrap.style.cssText='position:absolute;inset:-2px;border-radius:7px;background:linear-gradient(135deg,'+d.accent+',#F5B800,'+d.accent+');z-index:-1;';
    card.appendChild(borderWrap);
    // Card margin (2px inset light border — "bleed margin")
    var margin=document.createElement('div');
    margin.style.cssText='position:absolute;inset:2px;border-radius:3px;border:1px solid '+d.accent+'66;pointer-events:none;z-index:4;';
    card.appendChild(margin);
    // Corner pip — top left
    var pipTL=document.createElement('div');
    pipTL.style.cssText='position:absolute;top:4px;left:4px;z-index:5;';
    pipTL.innerHTML=d.cornerPip;
    card.appendChild(pipTL);
    // Corner pip — bottom right (rotated 180)
    var pipBR=document.createElement('div');
    pipBR.style.cssText='position:absolute;bottom:14px;right:4px;z-index:5;transform:rotate(180deg);';
    pipBR.innerHTML=d.cornerPip;
    card.appendChild(pipBR);
    // Center art area
    var artArea=document.createElement('div');
    artArea.style.cssText='margin-top:2px;z-index:3;';
    artArea.innerHTML=d.art;
    card.appendChild(artArea);
    // Bottom nameplate
    var nameplate=document.createElement('div');
    nameplate.style.cssText='position:absolute;bottom:0;left:0;right:0;height:12px;background:'+d.accent+'dd;display:flex;align-items:center;justify-content:center;z-index:5;border-radius:0 0 3px 3px;';
    var npText=document.createElement('div');
    npText.style.cssText="font-family:'Rajdhani',sans-serif;font-weight:700;font-size:6px;color:#09081A;letter-spacing:1.5px;";
    npText.textContent=d.label;
    nameplate.appendChild(npText);
    card.appendChild(nameplate);
    // Shimmer sweep
    var shimmer=document.createElement('div');
    shimmer.style.cssText='position:absolute;inset:0;border-radius:5px;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.06) 50%,transparent 60%);animation:cardShimmer 4s '+(c*0.5)+'s ease-in-out infinite;pointer-events:none;z-index:6;';
    card.appendChild(shimmer);
    cardFan.appendChild(card);
  }
  el.append(cardFan);

  // === CTA BUTTON ===
  var playWrap=document.createElement('div');
  playWrap.style.cssText='width:100%;z-index:2;position:relative;display:flex;flex-direction:column;gap:20px;opacity:0;animation:homeRevealBtn 0.4s ease-out 1.0s both;';
  var playBtn=document.createElement('button');
  playBtn.className='btn-blitz';
  playBtn.style.cssText='border-color:var(--cyan);color:#000;background:linear-gradient(180deg,#00ffcc 0%,#00c8aa 100%);font-size:24px;padding:22px 20px;animation:ctaGlow 3s ease-in-out 2s infinite;letter-spacing:4px;';
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
