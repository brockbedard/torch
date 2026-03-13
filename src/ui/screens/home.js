import { SND } from '../../engine/sound.js';
import { render, setGs, getInitialScenario } from '../../state.js';

export function buildHome(){
  SND.menu();
  var el=document.createElement('div');
  el.className='sup';
  el.style.cssText='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;background:radial-gradient(circle at 50% 30%,#330066 0%,#080020 70%);';
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
  ballCont.style.cssText='position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10;pointer-events:none;animation:ballPass 2.5s ease-in-out infinite;';
  var ballIcon=document.createElement('div');
  ballIcon.style.cssText='font-size:40px;filter:drop-shadow(0 0 10px rgba(0,0,0,0.5));';
  ballIcon.textContent='\uD83C\uDFC8';
  var ballFire=document.createElement('div');
  ballFire.style.cssText='position:absolute;inset:0;font-size:40px;animation:ignite 2.5s infinite;filter:drop-shadow(0 0 15px var(--orange));mix-blend-mode:screen;';
  ballFire.textContent='\uD83D\uDD25';
  ballCont.append(ballIcon,ballFire);
  
  logoWrap.append(fireEl, ballCont);
  el.appendChild(logoWrap);

  var title=document.createElement('h1');
  title.style.cssText="font-family:'Bebas Neue',sans-serif;font-size:120px;line-height:0.8;color:var(--a-gold);text-shadow:8px 8px 0 #000, 0 0 40px var(--a-gold);font-style:italic;transform:rotate(-5deg) scale(1.1);margin-bottom:40px;text-align:center;";
  title.innerHTML='TORCH<span style="display:block;color:white;font-size:40px;letter-spacing:15px;text-shadow:4px 4px 0 #000;margin-left:10px;">FOOTBALL</span>';
  el.append(title);
  var playWrap=document.createElement('div');
  playWrap.style.cssText='width:100%;margin-top:40px;z-index:2;position:relative;display:flex;flex-direction:column;gap:20px;';
  var playBtn=document.createElement('button');
  playBtn.className='btn-blitz';
  playBtn.disabled=isLocked;
  playBtn.style.cssText='border-color:var(--white);color:var(--f-purple);background:var(--white);';
  playBtn.textContent=isLocked?'LOCKED: RETURN TMW':"PLAY TODAY'S TORCH";
  playBtn.onclick=function(){
    SND.click();
    setGs(function(s){ return Object.assign({}, s, {screen:'setup', team:null, side:null, scenario:getInitialScenario()}); });
  };
  
  var freeBtn=document.createElement('button');
  freeBtn.className='btn-blitz';
  freeBtn.disabled=true;
  freeBtn.style.opacity='0.4';
  freeBtn.style.filter='grayscale(1)';
  freeBtn.textContent='FREE PLAY';

  var devBtn=document.createElement('button');
  devBtn.className='btn-blitz';
  devBtn.style.cssText='border-color:var(--muted);color:var(--muted);background:transparent;box-shadow:none;font-size:8px;padding:10px;margin-top:20px;';
  devBtn.textContent='DEV: RESET DAILY LOCK';
  devBtn.onclick=function(){localStorage.clear(); render();};

  playWrap.append(playBtn,freeBtn,devBtn);
  el.appendChild(playWrap);
  return el;
}
