import { SND } from '../../engine/sound.js';
import { setGs } from '../../state.js';

export function buildUnderConstruction(){
  var el=document.createElement('div');
  el.className='sup';
  el.style.cssText='height:100vh;display:flex;flex-direction:column;background:var(--bg);overflow:hidden;';

  // Header bar — matching setup/draft
  var hdr=document.createElement('div');
  hdr.style.cssText='background:rgba(0,0,0,0.5);padding:10px 14px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;border-bottom:2px solid var(--f-purple);';
  var logoWrap=document.createElement('div');
  logoWrap.style.cssText='display:flex;align-items:center;gap:6px;cursor:pointer;';
  var hdrFire=document.createElement('div');
  hdrFire.style.cssText='font-size:24px;animation:flicker 0.1s infinite alternate;line-height:1;';
  hdrFire.textContent='\uD83D\uDD25';
  var hdrTitle=document.createElement('div');
  hdrTitle.style.cssText="font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--a-gold);letter-spacing:2px;font-style:italic;transform:skewX(-10deg);text-shadow:2px 2px 0 #000, 0 0 10px var(--a-gold);line-height:1;";
  hdrTitle.innerHTML='TORCH <span style="font-size:14px;color:white;letter-spacing:4px;text-shadow:2px 2px 0 #000;">FOOTBALL</span>';
  logoWrap.append(hdrFire,hdrTitle);
  logoWrap.onclick=function(){setGs(null);};
  hdr.appendChild(logoWrap);
  var backBtn=document.createElement('button');
  backBtn.style.cssText='font-family:\'Press Start 2P\',monospace;font-size:8px;padding:10px 16px;cursor:pointer;background:#000;color:var(--white);border:2px solid #333;';
  backBtn.textContent='\u2190 BACK';
  backBtn.onclick=function(){SND.click();setGs(null);};
  hdr.appendChild(backBtn);
  el.appendChild(hdr);

  // Content
  var content=document.createElement('div');
  content.style.cssText='flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;text-align:center;position:relative;';

  // Background glow
  var glow=document.createElement('div');
  glow.style.cssText='position:absolute;top:30%;left:50%;transform:translate(-50%,-50%);width:300px;height:300px;background:radial-gradient(circle,rgba(187,0,255,0.08) 0%,transparent 70%);pointer-events:none;';
  content.appendChild(glow);

  var icon=document.createElement('div');
  icon.style.cssText='font-size:56px;margin-bottom:20px;animation:flicker 0.15s infinite alternate;filter:drop-shadow(0 0 20px var(--f-purple)) drop-shadow(0 0 40px var(--f-purple));position:relative;z-index:1;';
  icon.textContent='\uD83D\uDCE1';

  var title=document.createElement('div');
  title.style.cssText="font-family:'Bebas Neue',sans-serif;font-size:40px;color:var(--a-gold);font-style:italic;letter-spacing:3px;text-shadow:3px 3px 0 #000, 0 0 20px var(--a-gold);margin-bottom:8px;position:relative;z-index:1;";
  title.textContent='BROADCAST OFFLINE';

  var divider=document.createElement('div');
  divider.style.cssText='width:80px;height:2px;background:linear-gradient(to right,transparent,var(--f-purple),transparent);margin:0 auto 20px;position:relative;z-index:1;';

  var msg=document.createElement('div');
  msg.style.cssText="font-family:'Barlow Condensed',sans-serif;font-size:18px;color:var(--white);line-height:1.7;margin-bottom:12px;opacity:0.6;max-width:300px;position:relative;z-index:1;";
  msg.innerHTML='OUR ENGINEERS ARE CALIBRATING THE CLASH ENGINE FOR PEAK ARCADE PERFORMANCE.';

  var highlight=document.createElement('div');
  highlight.style.cssText="font-family:'Press Start 2P',monospace;font-size:10px;color:var(--a-gold);letter-spacing:2px;margin-bottom:36px;position:relative;z-index:1;text-shadow:0 0 10px rgba(255,204,0,0.4);";
  highlight.textContent='STADIUM GATES OPEN SOON';

  var btn=document.createElement('button');
  btn.className='btn-blitz';
  btn.style.cssText='padding:16px 40px;font-size:14px;background:var(--a-gold);border-color:var(--a-gold);color:#000;box-shadow:0 0 30px rgba(255,204,0,0.4);position:relative;z-index:1;';
  btn.textContent='RETURN TO HUB';
  btn.onclick=function(){SND.click();setGs(null);};

  content.append(icon,title,divider,msg,highlight,btn);
  el.appendChild(content);
  return el;
}
