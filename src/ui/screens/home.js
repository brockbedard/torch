import { SND } from '../../engine/sound.js';
import { render, setGs, getOffCards, getDefCards, VERSION, VERSION_NAME } from '../../state.js';

var DEV_LOG = [
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
  el.className='sup';
  el.style.cssText='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;background:radial-gradient(circle at 50% 30%,#330066 0%,#080020 70%);position:relative;';

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
  var logoWrap=document.createElement('div');
  logoWrap.style.cssText='position:relative;display:flex;align-items:center;justify-content:center;height:200px;width:100%;margin-bottom:30px;';

  var fireEl=document.createElement('div');
  fireEl.style.cssText='font-size:120px;animation:flicker 0.1s infinite alternate;z-index:1;filter:drop-shadow(0 0 30px var(--orange));';
  fireEl.textContent='\uD83D\uDD25';

  var ballCont=document.createElement('div');
  ballCont.style.cssText='position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);z-index:10;pointer-events:none;animation:ballPass 2s ease-in-out infinite;';
  var ballIcon=document.createElement('div');
  ballIcon.style.cssText='font-size:60px;filter:drop-shadow(0 0 15px rgba(0,0,0,0.8));';
  ballIcon.textContent='\uD83C\uDFC8';
  var ballFire=document.createElement('div');
  ballFire.style.cssText='position:absolute;inset:0;font-size:60px;animation:ignite 1.5s infinite;filter:drop-shadow(0 0 25px var(--orange));mix-blend-mode:screen;';
  ballFire.textContent='\uD83D\uDD25';
  ballCont.append(ballIcon,ballFire);

  logoWrap.append(fireEl, ballCont);
  el.appendChild(logoWrap);

  var title=document.createElement('h1');
  title.style.cssText="font-family:'Bebas Neue',sans-serif;font-size:120px;line-height:0.8;color:var(--a-gold);text-shadow:10px 10px 0 #000, 0 0 50px var(--a-gold);font-style:italic;transform:rotate(-5deg);margin-bottom:60px;text-align:center;";
  title.innerHTML='TORCH<span style="display:block;color:white;font-size:50px;letter-spacing:20px;text-shadow:5px 5px 0 #000;margin-left:15px;margin-top:10px;">FOOTBALL</span>';
  el.append(title);
  var playWrap=document.createElement('div');
  playWrap.style.cssText='width:100%;margin-top:40px;z-index:2;position:relative;display:flex;flex-direction:column;gap:20px;';
  var playBtn=document.createElement('button');
  playBtn.className='btn-blitz';
  playBtn.style.cssText='border-color:var(--cyan);color:#000;background:var(--cyan);box-shadow:6px 6px 0 #006a77, 10px 10px 0 #000;font-size:16px;padding:20px 15px;';
  playBtn.textContent='PLAY NOW';
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
      'position:fixed;bottom:12px;right:12px;z-index:9999;'+
      'background:rgba(0,0,0,0.85);border:1px solid var(--cyan);border-radius:20px;'+
      'padding:5px 10px;cursor:pointer;'+
      'font-family:"Courier New",monospace;font-size:9px;color:var(--cyan);'+
      'letter-spacing:0.5px;opacity:0.6;transition:opacity 0.15s;';
    quickBtn.textContent='\u26A1 QP';
    quickBtn.onmouseenter=function(){quickBtn.style.opacity='1';};
    quickBtn.onmouseleave=function(){quickBtn.style.opacity='0.6';};
    quickBtn.onclick=function(){
      SND.click();
      // CT starters per CLAUDE.md spec
      var offRoster=['ct_q1','ct_s1','ct_s3','ct_s4']; // Avery, Sampson, Vasquez, Walsh
      var defRoster=['ct_db1','ct_db3','ct_dl1','ct_db4']; // Crews, Knox, Wilder, Orozco
      var offHand=getOffCards('canyon_tech').slice(0,5);
      var defHand=getDefCards('canyon_tech').slice(0,5);
      setGs(function(){
        return {
          screen:'gameplay',
          team:'canyon_tech',
          offRoster:offRoster,
          defRoster:defRoster,
          offHand:offHand,
          defHand:defHand,
          humanReceives:true,
        };
      });
    };
    document.body.appendChild(quickBtn);
    // Clean up when home screen is removed from DOM
    var observer = new MutationObserver(function() {
      if (!document.body.contains(el)) {
        quickBtn.remove();
        observer.disconnect();
      }
    });
    observer.observe(document.getElementById('root'), { childList: true });
  }

  var buildLabel=document.createElement('div');
  buildLabel.style.cssText='position:absolute;bottom:12px;width:100%;text-align:center;font-family:"Courier New",monospace;font-size:8px;color:#ffffff22;letter-spacing:1px;';
  buildLabel.textContent='v' + VERSION + ' \u00b7 ' + VERSION_NAME;
  el.appendChild(buildLabel);

  return el;
}
