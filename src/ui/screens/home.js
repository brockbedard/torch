import { SND } from '../../engine/sound.js';
import { render, setGs, getInitialScenario, VERSION, VERSION_NAME } from '../../state.js';

var DEV_LOG = [
  "Play diagram SVG test page with 4 sample formations",
  "Play card draft screen with X's and O's diagrams and risk meters",
  "0.10.0 — Gameday Edition: arcade broadcast redesign, player art, Vite modular architecture",
  "0.9.0 — Vite modularization, Vercel deploy, AI commentary",
  "0.8.0 — Arcade Broadcast visual redesign",
];

export function buildHome(){
  SND.menu();
  var el=document.createElement('div');
  el.className='sup';
  el.style.cssText='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;background:radial-gradient(circle at 50% 30%,#330066 0%,#080020 70%);position:relative;';

  // Dev changelog banner — localhost only
  var host=window.location.hostname;
  if(host==='localhost'||host==='127.0.0.1'){
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
  var today=new Date().toDateString();
  var lastPlay=localStorage.getItem('torch_last_play');
  var lastResult=localStorage.getItem('torch_last_result');
  var streak=localStorage.getItem('torch_streak')||'0';
  var isLocked=lastPlay===today&&lastResult==='loss';
  var logoWrap=document.createElement('div');
  logoWrap.style.cssText='position:relative;display:flex;align-items:center;justify-content:center;height:140px;width:100%;margin-bottom:20px;';

  var fireEl=document.createElement('div');
  fireEl.style.cssText='font-size:80px;animation:flicker 0.1s infinite alternate;z-index:1;';
  fireEl.textContent='\uD83D\uDD25';

  var ballCont=document.createElement('div');
  ballCont.style.cssText='position:absolute;top:35%;left:50%;transform:translate(-50%,-50%);z-index:10;pointer-events:none;animation:ballPass 1.5s ease-in-out infinite;';
  var ballIcon=document.createElement('div');
  ballIcon.style.cssText='font-size:40px;filter:drop-shadow(0 0 10px rgba(0,0,0,0.5));';
  ballIcon.textContent='\uD83C\uDFC8';
  var ballFire=document.createElement('div');
  ballFire.style.cssText='position:absolute;inset:0;font-size:40px;animation:ignite 1.5s infinite;filter:drop-shadow(0 0 15px var(--orange));mix-blend-mode:screen;';
  ballFire.textContent='\uD83D\uDD25';
  ballCont.append(ballIcon,ballFire);

  logoWrap.append(fireEl, ballCont);
  el.appendChild(logoWrap);

  var title=document.createElement('h1');
  title.style.cssText="font-family:'Bebas Neue',sans-serif;font-size:100px;line-height:0.8;color:var(--a-gold);text-shadow:8px 8px 0 #000, 0 0 40px var(--a-gold);font-style:italic;transform:rotate(-5deg);margin-bottom:40px;text-align:center;";
  title.innerHTML='TORCH<span style="display:block;color:white;font-size:40px;letter-spacing:15px;text-shadow:4px 4px 0 #000;margin-left:10px;">FOOTBALL</span>';
  el.append(title);
  var playWrap=document.createElement('div');
  playWrap.style.cssText='width:100%;margin-top:40px;z-index:2;position:relative;display:flex;flex-direction:column;gap:20px;';
  var playBtn=document.createElement('button');
  playBtn.className='btn-blitz';
  playBtn.disabled=isLocked;
  playBtn.style.cssText='border-color:var(--cyan);color:#000;background:var(--cyan);box-shadow:6px 6px 0 #006a77, 10px 10px 0 #000;font-size:16px;padding:20px 15px;';
  playBtn.textContent=isLocked?'LOCKED: RETURN TMW':'DAILY CHALLENGE';
  playBtn.onclick=function(){
    SND.click();
    setGs(function(s){ return Object.assign({}, s, {screen:'setup', team:null, side:null, scenario:getInitialScenario()}); });
  };

  var freeBtn=document.createElement('button');
  freeBtn.className='btn-blitz';
  freeBtn.disabled=true;
  freeBtn.style.cssText='border-color:var(--l-green);color:var(--l-green);background:transparent;box-shadow:4px 4px 0 #006622;opacity:0.5;font-size:16px;padding:20px 15px;';
  freeBtn.innerHTML='FREE PLAY <span style="font-size:8px;opacity:0.5;">(COMING SOON)</span>';

  var devBtn=document.createElement('button');
  devBtn.className='btn-blitz';
  devBtn.style.cssText='display:none;border-color:var(--muted);color:var(--muted);background:transparent;box-shadow:none;font-size:8px;padding:10px;margin-top:20px;';
  devBtn.textContent='DEV: RESET DAILY LOCK';
  devBtn.onclick=function(){localStorage.clear(); render();};

  playWrap.append(playBtn,freeBtn,devBtn);
  el.appendChild(playWrap);

  var buildLabel=document.createElement('div');
  buildLabel.style.cssText='position:absolute;bottom:12px;width:100%;text-align:center;font-family:"Courier New",monospace;font-size:8px;color:#ffffff22;letter-spacing:1px;';
  buildLabel.textContent='v' + VERSION + ' \u00b7 ' + VERSION_NAME;
  el.appendChild(buildLabel);

  return el;
}
