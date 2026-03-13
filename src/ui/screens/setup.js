import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, getOtherTeam, render } from '../../state.js';
import { TEAMS } from '../../data/teams.js';
import { buildScoreboard } from '../components/scoreboard.js';

export function buildSetup(){
  var el=document.createElement('div');el.className='sup';
  el.style.cssText='height:100vh;display:flex;flex-direction:column;background:var(--bg);overflow:hidden;';
  var hdr=document.createElement('div');
  hdr.style.cssText='background:rgba(0,0,0,0.5);padding:10px 14px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;border-bottom:2px solid var(--f-purple);';
  hdr.innerHTML='<div style="font-family:\'Bebas Neue\',sans-serif;font-size:28px;color:var(--a-gold);letter-spacing:2px;font-style:italic;transform:skewX(-10deg);text-shadow:2px 2px 0 #000, 0 0 10px var(--a-gold); cursor:pointer;">\uD83D\uDD25 TORCH</div>';
  hdr.onclick=function(){setGs(null);};
  var backBtn=document.createElement('button');
  backBtn.style.cssText='font-family:\'Press Start 2P\',monospace;font-size:6px;padding:6px 10px;cursor:pointer;background:#000;color:var(--white);border:2px solid #333;';
  backBtn.textContent='\u2190 BACK';
  backBtn.onclick=function(){SND.click();setGs(null);};
  hdr.appendChild(backBtn);
  el.appendChild(hdr);
  var content=document.createElement('div');
  content.style.cssText='flex:1;overflow-y:auto;padding:15px;display:flex;flex-direction:column;gap:20px;position:relative;z-index:2;';

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

  var sbContainer = document.createElement('div');
  function refreshBoard(){
    sbContainer.innerHTML='';
    sbContainer.appendChild(buildScoreboard(selSide, selTeam));
  }
  refreshBoard();
  content.appendChild(sbContainer);

  var sideContainer = document.createElement('div');
  var sideLabel=document.createElement('div');
  sideLabel.className='chrome-header';
  sideLabel.style.fontSize='22px';
  sideLabel.textContent='2. PICK YOUR SIDE OF THE BALL';
  sideContainer.appendChild(sideLabel);
  
  var sideRow=document.createElement('div');sideRow.style.cssText='display:flex;gap:10px;';
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
      opt.style.cssText='flex:1;font-size:12px;text-align:center;padding:15px 5px;'+(isSel?'background:'+s.color+';color:#000;border-color:'+s.color+';box-shadow:0 0 25px '+s.glow+';':'background:transparent;border-color:'+s.color+';color:'+s.color+';opacity:0.5;');
      opt.textContent=s.label;
      opt.onclick=function(){SND.select();selSide=s.id;GS.side=s.id;refreshSides();refreshBoard();refreshGo();};
      sideRow.appendChild(opt);
    });
  }
  sideContainer.appendChild(sideRow);

  var teamContainer = document.createElement('div');
  var pageInst=document.createElement('div');
  pageInst.className='chrome-header';
  pageInst.style.fontSize='22px';
  pageInst.textContent='1. CHOOSE YOUR TEAM';
  teamContainer.appendChild(pageInst);

  var teamGrid=document.createElement('div');teamGrid.style.cssText='display:flex;flex-direction:column;gap:10px;';
  function refreshTeams(){
    teamGrid.innerHTML='';
    TEAMS.forEach(function(team){
      var isSel=selTeam===team.id;
      var card=document.createElement('div');
      card.className='team-card'+(isSel?' selected':'');
      card.style.padding='15px';
      card.innerHTML=
        '<div style="flex:1;">'+
          '<div class="team-name" style="color:'+team.accent+';font-size:28px;line-height:0.9;">'+team.name+'</div>'+
          '<div style="font-family:\'Press Start 2P\',monospace;font-size:7px;color:var(--white);opacity:0.9;line-height:1.6;margin-top:6px;">'+
            'OFFENSE: '+team.style+'<br>'+
            'DEFENSE: '+team.defStyle+
          '</div>'+
        '</div>'+
        '<div class="team-icon" style="font-size:55px;filter:drop-shadow(0 0 12px '+team.accent+'); margin-left:10px;">'+team.icon+'</div>';
      card.onclick=function(){SND.select();selTeam=team.id;GS.team=team.id;refreshTeams();refreshBoard();refreshGo();};
      teamGrid.appendChild(card);
    });
  }
  teamContainer.appendChild(teamGrid);
  content.appendChild(teamContainer);
  content.appendChild(sideContainer);

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
