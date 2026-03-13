import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, getOtherTeam, render } from '../../state.js';
import { TEAMS } from '../../data/teams.js';
import { buildScoreboard } from '../components/scoreboard.js';

export function buildSetup(){
  var el=document.createElement('div');el.className='sup';
  el.style.cssText='height:100vh;display:flex;flex-direction:column;background:var(--bg);overflow:hidden;';
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
  var content=document.createElement('div');
  content.style.cssText='flex:1;overflow-y:auto;padding:20px 16px;display:flex;flex-direction:column;gap:28px;position:relative;z-index:2;';

  var selTeam=GS.team;
  var selSide=GS.side;

  // Scenario Modal
  var modal=document.createElement('div');
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:3000;display:flex;align-items:center;justify-content:center;padding:30px;animation:fi .4s ease-out both;';
  var mBox=document.createElement('div');
  mBox.className='team-card';
  mBox.style.cssText+='width:100%;max-width:360px;padding:30px;text-align:center;border-color:var(--a-gold);box-shadow:0 0 40px rgba(255,204,0,0.3);display:block;';
  mBox.innerHTML='<div style="font-family:\'Barlow Condensed\',sans-serif;font-size:22px;line-height:1.5;margin-bottom:30px;font-weight:700;">WE\'RE LATE IN THE 4TH QUARTER. THE SCORE IS 14-21. IT\'S 2ND & 10 FROM THE 35 YARD LINE.<br><br>ONE DRIVE REMAINS. CHOOSE OFFENSE TO SCORE THE TYING TOUCHDOWN, OR CHOOSE DEFENSE TO GET THE STOP AND WIN.</div>';
  var mBtn=document.createElement('button');
  mBtn.className='btn-blitz';
  mBtn.style.cssText='background:var(--a-gold);color:#000;border-color:var(--a-gold);';
  mBtn.textContent='I\'M READY';
  mBtn.onclick=function(){modal.remove();};
  mBox.appendChild(mBtn);
  modal.appendChild(mBox);
  el.appendChild(modal);

  // 1. Choose Your Team
  var teamContainer = document.createElement('div');
  var pageInst=document.createElement('div');
  pageInst.className='chrome-header';
  pageInst.style.fontSize='22px';
  pageInst.textContent='1. CHOOSE YOUR TEAM';
  teamContainer.appendChild(pageInst);

  var teamGrid=document.createElement('div');teamGrid.style.cssText='display:flex;gap:12px;';
  function refreshTeams(){
    teamGrid.innerHTML='';
    TEAMS.forEach(function(team){
      var isSel=selTeam===team.id;
      var card=document.createElement('div');
      card.style.cssText=
        'flex:1;background:linear-gradient(160deg, var(--bg-raised) 0%, #0d0820 50%, var(--bg-surface) 100%);' +
        'border:2px solid '+(isSel?'#00ff88':team.accent+'55')+';'+
        'border-radius:8px;padding:10px 8px;cursor:pointer;text-align:center;'+
        'transition:all 0.15s ease;position:relative;overflow:hidden;'+
        'opacity:'+(isSel?'1':'0.85')+';'+
        (isSel
          ?'box-shadow:0 0 20px rgba(0,255,136,0.4), inset 0 0 15px rgba(0,255,136,0.08);'
          :'box-shadow:0 4px 20px rgba(0,0,0,0.5);');
      // Accent glow behind the card
      var glow=document.createElement('div');
      glow.style.cssText=
        'position:absolute;top:-30%;left:50%;transform:translateX(-50%);width:80%;height:60%;'+
        'background:radial-gradient(ellipse,'+team.accent+'18 0%,transparent 70%);'+
        'pointer-events:none;z-index:0;';
      card.appendChild(glow);
      // Corner accent lines
      var cornerTL=document.createElement('div');
      cornerTL.style.cssText=
        'position:absolute;top:0;left:0;width:20px;height:20px;'+
        'border-top:2px solid '+team.accent+'44;border-left:2px solid '+team.accent+'44;'+
        'border-radius:8px 0 0 0;pointer-events:none;';
      var cornerBR=document.createElement('div');
      cornerBR.style.cssText=
        'position:absolute;bottom:0;right:0;width:20px;height:20px;'+
        'border-bottom:2px solid '+team.accent+'44;border-right:2px solid '+team.accent+'44;'+
        'border-radius:0 0 8px 0;pointer-events:none;';
      card.append(cornerTL,cornerBR);
      if(isSel){
        var bar=document.createElement('div');
        bar.style.cssText='position:absolute;top:0;left:50%;transform:translateX(-50%);width:40px;height:3px;background:#00ff88;border-radius:0 0 3px 3px;z-index:2;';
        card.appendChild(bar);
      }
      var iconEl=document.createElement('div');
      iconEl.style.cssText=
        'font-size:46px;margin-bottom:4px;position:relative;z-index:1;'+
        'filter:drop-shadow(0 0 16px '+team.accent+') drop-shadow(0 0 30px '+team.accent+'44);';
      iconEl.textContent=team.icon;
      var nameEl=document.createElement('div');
      nameEl.style.cssText=
        'font-family:"Bebas Neue",sans-serif;font-size:26px;font-style:italic;'+
        'color:'+team.accent+';line-height:1;margin-bottom:6px;position:relative;z-index:1;'+
        'text-shadow:0 0 12px '+team.accent+'66, 2px 2px 0 #000;letter-spacing:2px;';
      nameEl.textContent=team.name;
      var divider=document.createElement('div');
      divider.style.cssText=
        'width:30px;height:1px;background:linear-gradient(to right,transparent,'+team.accent+'66,transparent);'+
        'margin:0 auto 6px;position:relative;z-index:1;';
      var schemeEl=document.createElement('div');
      schemeEl.style.cssText='font-family:"Courier New",monospace;font-size:10px;color:var(--muted);font-weight:bold;letter-spacing:1px;line-height:1.8;position:relative;z-index:1;';
      schemeEl.innerHTML='OFF: '+team.style+'<br>DEF: '+team.defStyle;
      card.append(iconEl,nameEl,divider,schemeEl);
      card.onclick=function(){SND.select();selTeam=team.id;GS.team=team.id;refreshTeams();refreshBoard();refreshGo();};
      teamGrid.appendChild(card);
    });
  }
  teamContainer.appendChild(teamGrid);
  content.appendChild(teamContainer);

  // 2. Pick Your Side
  var sideContainer = document.createElement('div');
  var sideLabel=document.createElement('div');
  sideLabel.className='chrome-header';
  sideLabel.style.fontSize='22px';
  sideLabel.textContent='2. PICK YOUR SIDE OF THE BALL';
  sideContainer.appendChild(sideLabel);

  var sideRow=document.createElement('div');sideRow.style.cssText='display:flex;flex-direction:column;gap:10px;';
  function refreshSides(){
    sideRow.innerHTML='';
    var sides=[
      {id:'offense',label:'OFFENSE',color:'var(--l-green)',glow:'rgba(0,255,68,0.6)'},
      {id:'defense',label:'DEFENSE',color:'var(--p-red)',glow:'rgba(255,0,64,0.6)'}
    ];
    sides.forEach(function(s){
      var isSel=selSide===s.id;
      var opt=document.createElement('button');
      opt.className='btn-blitz';
      opt.style.cssText='flex:1;font-size:16px;text-align:center;padding:20px 5px;'+(isSel?'background:'+s.color+';color:#000;border-color:'+s.color+';box-shadow:0 0 25px '+s.glow+';':'background:transparent;border-color:'+s.color+';color:'+s.color+';opacity:0.5;');
      opt.textContent=s.label;
      opt.onclick=function(){SND.select();selSide=s.id;GS.side=s.id;refreshSides();refreshBoard();refreshGo();};
      sideRow.appendChild(opt);
    });
  }
  sideContainer.appendChild(sideRow);
  content.appendChild(sideContainer);

  // 3. The Situation
  var sbContainer = document.createElement('div');
  var sbLabel=document.createElement('div');
  sbLabel.className='chrome-header';
  sbLabel.style.fontSize='22px';
  sbLabel.textContent='3. ANALYZE THE SCENARIO';
  sbContainer.appendChild(sbLabel);
  var sbInner = document.createElement('div');
  sbContainer.appendChild(sbInner);
  function refreshBoard(){
    sbInner.innerHTML='';
    sbInner.appendChild(buildScoreboard(selSide, selTeam));
  }
  refreshBoard();
  content.appendChild(sbContainer);

  var goWrap=document.createElement('div');goWrap.style.cssText='padding:10px 0 20px;';
  var goBtn=document.createElement('button');
  function refreshGo(){
    var ready=selTeam&&selSide;
    goBtn.className='btn-blitz';
    goBtn.disabled=!ready;
    goBtn.style.cssText = ready ? 'background:var(--a-gold);border-color:var(--a-gold);color:#000;box-shadow:0 0 30px rgba(255,204,0,0.6);font-size:16px;' : 'opacity:0.3;';
    goBtn.textContent=ready?'LOCK IN TEAM \u2192':'SELECT TEAM & SIDE';
    goBtn.onclick=ready?function(){SND.snap();setGs(function(s){ return Object.assign({}, s, {screen:'draft', team:selTeam, side:selSide, roster:null}); });}:null;
  }
  goWrap.appendChild(goBtn);
  content.appendChild(goWrap);
  el.appendChild(content);
  refreshTeams();refreshSides();refreshGo();
  return el;
}
