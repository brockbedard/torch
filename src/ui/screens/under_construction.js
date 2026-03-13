import { SND } from '../../engine/sound.js';
import { setGs } from '../../state.js';

export function buildUnderConstruction(){
  var el=document.createElement('div');
  el.className='sup';
  el.style.cssText='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;background:radial-gradient(circle at 50% 50%,#1a0033 0%,#050015 100%);text-align:center;';
  
  var icon=document.createElement('div');
  icon.style.cssText='font-size:60px;margin-bottom:20px;animation:flicker 0.15s infinite alternate;filter:drop-shadow(0 0 20px var(--a-gold));';
  icon.textContent='\uD83D\uDEA7';

  var title=document.createElement('div');
  title.className='chrome-header';
  title.style.fontSize='42px';
  title.textContent='BROADCAST OFFLINE';
  
  var msg=document.createElement('div');
  msg.style.cssText="font-family:'Press Start 2P',monospace;font-size:10px;color:var(--white);line-height:1.8;margin:20px 0 40px;opacity:0.8;max-width:300px;";
  msg.innerHTML='ENCRYPTED GAMEPLAY UPLINK PENDING...<br><br>OUR ENGINEERS ARE CALIBRATING THE CLASH ENGINE FOR PEAK ARCADE PERFORMANCE.<br><br><span style="color:var(--a-gold)">STADIUM GATES OPEN SOON.</span>';

  var btn=document.createElement('button');
  btn.className='btn-blitz';
  btn.style.cssText='width:auto;padding:15px 30px;font-size:12px;';
  btn.textContent='RETURN TO HUB';
  btn.onclick=function(){SND.click();setGs(null);};

  var devLink=document.createElement('div');
  devLink.style.cssText='margin-top:40px;font-family:\'Press Start 2P\',monospace;font-size:6px;color:var(--muted);cursor:pointer;';
  devLink.textContent='DEV ACCESS: BYPASS ENCRYPTION';
  devLink.onclick=function(){
    if(confirm('Developer Authorization required. Proceed to Gameplay?')){
      SND.snap();
      setGs(function(s){return Object.assign({},s,{screen:'play'});});
    }
  };

  el.append(icon,title,msg,btn,devLink);
  return el;
}
