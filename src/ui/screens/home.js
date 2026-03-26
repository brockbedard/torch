import { SND } from '../../engine/sound.js';
import { render, setGs, getOffCards, getDefCards, VERSION, VERSION_NAME } from '../../state.js';
import { getOffenseRoster, getDefenseRoster } from '../../data/players.js';
import { buildHomeCard } from '../components/cards.js';
import AudioStateManager from '../../engine/audioManager.js';

var DEV_LOG = [
  "v0.26.1 \u2014 Game Flow: End game single-game format with TORCH point carryover. Conversion display (GOOD!/NO GOOD, play commentary). Halftime 2nd-half card pick + kickoff. 2-min clock expiry ends half. Dev panel: force result + force conversion buttons. No shop on conversions. PAT doesn't say TOUCHDOWN.",
  "v0.26.0 \u2014 Playtest: Tier 1-3 fixes. Rebrands: Dolphins (pink) + Spectres (ice blue). TD drama + confetti. First down slide-in. Torch card activation moment. 2-min warning slam. Card clash uses team colors. Possession screen with badges. Drive log compression. Store skip if broke. Single-game format. Weather variation. Torch inventory tray. Player synergy indicators. Commentary attribution fix. Spike costs a down.",
  "v0.25.2 \u2014 Economy rebalance (pts down, card costs up). AI Wolves archetype weighting. Red zone onboarding tutorial. Detail tooltips on torch cards. Conversion plays through full 3-beat flow. Removed API commentary (saves 4s/snap). Git workflow: dev/main branches + Vercel preview deploys.",
  "v0.25.0 \u2014 Torch Cards: 12 cards (2 Gold, 5 Silver, 5 Bronze) with real SVG icons + category colors. The Torch Store with deal-in animation. AI card behavior (Easy=0, Medium=1 Bronze, Hard=1 Silver). Dev test harness (?dev). User perspective bias (colors, commentary, visual weight, timing, ambient mood). Broadcast possession changes. TD celebration (confetti, team name slam, 5.5s hold). Warm gold #EBB010. Conversion crash fixed. Compact stat bar.",
  "v0.24.0 \u2014 Scheme Identity: 6 real formations + 19 route concepts from 7v7 research. Team scheme identity (Boars power, Wolves option, Spectres air raid, Serpents multiple). Weighted draft pools + formation tendencies. All 8 TORCH cards functional. Sequential points fly-in animation. Bug fixes (ovrSystem, conditions, card effects). Team select redesign with badges + KICK OFF. Wolves rename. Bigger home/pregame.",
  "v0.22.2 \u2014 Drive summary with player names, UI cleanup. ESPN-style descriptions now include player names (12-yd Pass to Monroe, SACK by Tillery). QB/RB stat line shows player names with color-coded stats, hidden until first play. Drive header stats enlarged to Teko 16px bold. Removed instruction text (SELECT PLAY/SCHEME) \u2014 YOUR OFFENSE/DEFENSE header is sufficient. Pregame Banded Clash layout, TORCH banner, team logo badges.",
  "v0.20.0 \u2014 Fire & Steel: Cards-hero layout, football-O wordmark, green offense/orange torch/blue defense triad, TORCH card premium treatment (animated flame, breathing glow, light cast, warm shimmer, ember sparks), warm scorched-black bg, steel blue defense, torch orange replaces purple, Font Awesome icons, Teko+Rajdhani font system.",
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
  el.style.cssText='height:100vh;height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;padding:20px 20px 24px;position:relative;overflow:hidden;';

  // === LAYERED BACKGROUND ===
  // Base: deep purple radial
  var bgBase=document.createElement('div');
  bgBase.style.cssText='position:absolute;inset:0;background:radial-gradient(circle at 50% 30%,#1A1208 0%,#0A0804 70%);z-index:0;';
  // Drifting layer for subtle movement
  var bgDrift=document.createElement('div');
  bgDrift.style.cssText='position:absolute;inset:-25%;width:150%;height:150%;background:radial-gradient(circle at 50% 40%,#1A1208 0%,transparent 60%);z-index:0;animation:bgDrift 15s ease-in-out infinite;opacity:0.6;';
  // Warm light pool behind flame area
  var bgWarm=document.createElement('div');
  bgWarm.style.cssText='position:absolute;top:15%;left:50%;transform:translateX(-50%);width:85%;max-width:400px;height:350px;background:radial-gradient(circle,rgba(255,120,20,0.1) 0%,rgba(255,80,0,0.04) 40%,transparent 70%);z-index:0;pointer-events:none;';
  // Noise texture overlay
  var bgNoise=document.createElement('div');
  bgNoise.style.cssText='position:absolute;inset:0;z-index:0;opacity:0.03;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E");background-size:128px 128px;';
  el.append(bgBase,bgDrift,bgWarm,bgNoise);

  // === EMBER PARTICLES — prominent, emanating from logo area ===
  var emberWrap=document.createElement('div');
  emberWrap.style.cssText='position:absolute;top:25%;left:50%;transform:translateX(-50%);width:300px;height:200px;z-index:1;pointer-events:none;';
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

  // Dev tools — only visible when localStorage torch_dev is set
  // Enable in console: localStorage.setItem('torch_dev','1')
  var isDev=!!localStorage.getItem('torch_dev');
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

  // === CARD FAN — premium cards using shared buildHomeCard ===
  var cardFan=document.createElement('div');
  cardFan.style.cssText='position:relative;display:flex;align-items:center;justify-content:center;width:340px;height:200px;z-index:2;overflow:visible;animation:fanFloat 5s ease-in-out 1.5s infinite;flex-shrink:0;';
  var fanTypes=['offense','torch','defense'];
  var fanAngles=[-18,0,18];
  var fanX=[-72,0,72];
  var fanY=[12,0,12];
  var fanZ=[1,3,1];
  var fanScale=[1,1.2,1];
  var dealDelay=[0,0.12,0.24];
  for(var c=0;c<3;c++){
    var isTorch=fanTypes[c]==='torch';
    var isOff=fanTypes[c]==='offense';
    var isDef=fanTypes[c]==='defense';

    // Build card back from shared component
    var cardOuter=buildHomeCard(fanTypes[c],100,140);

    // Apply fan positioning to the outer wrapper
    cardOuter.style.cssText+='position:absolute;'
      +'transform:rotate('+fanAngles[c]+'deg) translateX('+fanX[c]+'px) translateY('+fanY[c]+'px) scale('+fanScale[c]+');'
      +'z-index:'+fanZ[c]+';'
      +'opacity:0;animation:cardDealIn 0.4s cubic-bezier(0.22,1.3,0.36,1) '+dealDelay[c]+'s both;';

    // Add light cast from torch onto adjacent cards
    var innerCard=cardOuter.querySelector('.torch-card-inner');
    if(isOff && innerCard){
      var warmCast=document.createElement('div');
      warmCast.style.cssText='position:absolute;top:0;right:0;width:40%;height:100%;background:linear-gradient(to left,rgba(255,120,40,0.06),transparent);border-radius:0 8px 8px 0;z-index:1;pointer-events:none;';
      innerCard.appendChild(warmCast);
    }
    if(isDef && innerCard){
      var warmCast2=document.createElement('div');
      warmCast2.style.cssText='position:absolute;top:0;left:0;width:40%;height:100%;background:linear-gradient(to right,rgba(255,120,40,0.06),transparent);border-radius:8px 0 0 8px;z-index:1;pointer-events:none;';
      innerCard.appendChild(warmCast2);
    }

    cardFan.appendChild(cardOuter);
  }
  el.append(cardFan);

  // === TITLE: T(football)RCH ===
  // Create the football SVG element programmatically (avoids data URI encoding issues).
  // The span is sized to match a Teko O. The SVG inside uses overflow:visible + contain.
  var title=document.createElement('h1');
  title.style.cssText="font-family:'Teko',sans-serif;font-weight:700;font-size:116px;line-height:0.85;color:#EBB010;text-shadow:2px 2px 0 rgba(0,0,0,0.9),4px 4px 0 #1a0a00,0 0 25px rgba(235,176,16,0.35);transform:skewX(-8deg);text-align:center;letter-spacing:7px;z-index:2;animation:homeRevealUp 0.5s ease-out 0.4s both,titleShimmer 4s ease-in-out 2s infinite;position:relative;flex-shrink:0;";
  title.textContent='T';
  // Football O span
  var oSpan=document.createElement('span');
  oSpan.style.cssText='display:inline-block;width:0.52em;height:0.72em;vertical-align:top;position:relative;margin:0 3px 0 -2px;overflow:visible;';
  var oSvg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  oSvg.setAttribute('viewBox','0 0 100 100');
  oSvg.setAttribute('fill','none');
  oSvg.setAttribute('preserveAspectRatio','xMidYMid meet');
  oSvg.style.cssText='width:100%;height:100%;overflow:visible;filter:drop-shadow(0 0 5px rgba(255,140,0,0.5));';
  oSvg.innerHTML='<defs><linearGradient id="oG" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#D4893B"/><stop offset="45%" stop-color="#B5652B"/><stop offset="100%" stop-color="#8B4A1F"/></linearGradient></defs>'
    +'<g transform="translate(50,50) rotate(-45) scale(0.22) translate(-256,-256)">'
    +'<path fill="url(#oG)" d="M247.5 25.4c-13.5 3.3-26.4 7.2-38.6 11.7C142.9 61.6 96.7 103.6 66 153.6C47.8 183.4 35.1 215.9 26.9 249L264.5 486.6c13.5-3.3 26.4-7.2 38.6-11.7c66-24.5 112.2-66.5 142.9-116.5c18.3-29.8 30.9-62.3 39.1-95.3L247.5 25.4zM495.2 205.3c6.1-56.8 1.4-112.2-7.7-156.4c-2.7-12.9-13-22.9-26.1-25.1c-58.2-9.7-109.9-12-155.6-7.9L495.2 205.3zM206.1 496L16.8 306.7c-6.1 56.8-1.4 112.2 7.7 156.4c2.7 12.9 13 22.9 26.1 25.1c58.2 9.7 109.9 12 155.6 7.9z"/>'
    +'<path fill="#FFFBE6" d="M260.7 164.7c6.2-6.2 16.4-6.2 22.6 0l64 64c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-64-64c-6.2-6.2-6.2-16.4 0-22.6zm-48 48c6.2-6.2 16.4-6.2 22.6 0l64 64c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-64-64c-6.2-6.2-6.2-16.4 0-22.6zm-48 48c6.2-6.2 16.4-6.2 22.6 0l64 64c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-64-64c-6.2-6.2-6.2-16.4 0-22.6z"/>'
    +'</g>';
  oSpan.appendChild(oSvg);
  title.appendChild(oSpan);
  // RCH + FOOTBALL subtitle
  var rch=document.createElement('span');
  rch.textContent='RCH';
  title.appendChild(rch);
  var sub=document.createElement('span');
  sub.style.cssText="display:block;color:#FFF5E6;font-family:'Teko',sans-serif;font-weight:700;font-size:52px;letter-spacing:10px;text-shadow:2px 2px 0 rgba(0,0,0,0.8);margin-top:4px;";
  sub.textContent='FOOTBALL';
  title.appendChild(sub);
  el.append(title);

  // === TAGLINE ===
  var tagline=document.createElement('div');
  // tagline removed — cleaner look

  // === CTA BUTTON ===
  var playWrap=document.createElement('div');
  playWrap.style.cssText='width:100%;z-index:2;position:relative;display:flex;flex-direction:column;gap:10px;opacity:0;animation:homeRevealBtn 0.4s ease-out 1.0s both;flex-shrink:0;';
  var playBtn=document.createElement('button');
  playBtn.className='btn-blitz';
  playBtn.style.cssText='border-color:#FF4511;color:#000;background:linear-gradient(180deg,#EBB010 0%,#FF4511 100%);font-size:24px;padding:20px 24px;animation:ctaGlow 3s ease-in-out 0.3s infinite;letter-spacing:5px;text-align:center;display:block;width:100%;';
  playBtn.textContent="LET'S GO!";
  playBtn.onclick=function(){
    SND.click();
    AudioStateManager.init(); // First user interaction — init audio
    var firstDone = localStorage.getItem('torch_first_season_done');
    setGs(function(s){ return Object.assign({}, s || {}, {screen:'teamSelect', team:null, isFirstSeason: !firstDone}); });
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
      var qpTeam = 'stags';
      setGs(function(){
        return {
          screen:'gameplay',
          team:qpTeam,
          opponent:'wolves',
          difficulty:'EASY',
          offRoster:getOffenseRoster(qpTeam).slice(0,4).map(function(p){return p.id;}),
          defRoster:getDefenseRoster(qpTeam).slice(0,4).map(function(p){return p.id;}),
          offHand:getOffCards(qpTeam).slice(0,5),
          defHand:getDefCards(qpTeam).slice(0,5),
          humanReceives:true,
          _coinTossDone:true,
          isFirstSeason:false,
          gameConditions:{weather:'clear',field:'turf',crowd:'home'},
          season:{opponents:['wolves','sentinels','serpents'],currentGame:0,results:[],totalScore:0,torchCards:[],carryoverPoints:0},
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
