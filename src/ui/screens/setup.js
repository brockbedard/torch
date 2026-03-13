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

  // Scenario Modal — Broadcast Opening
  var modal=document.createElement('div');
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:3000;display:flex;align-items:center;justify-content:center;padding:20px;';
  // Fade in the backdrop
  modal.animate([{opacity:0},{opacity:1}],{duration:300,easing:'ease-out',fill:'forwards'});

  var mBox=document.createElement('div');
  mBox.style.cssText=
    'width:100%;max-width:370px;background:var(--bg);border:2px solid var(--a-gold);'+
    'border-radius:10px;padding:28px 24px;text-align:center;position:relative;overflow:hidden;'+
    'box-shadow:0 0 60px rgba(255,204,0,0.15), 0 0 120px rgba(255,204,0,0.05);';
  // Scale+fade in
  mBox.animate([
    {opacity:0,transform:'scale(0.9)'},
    {opacity:1,transform:'scale(1)'}
  ],{duration:300,easing:'cubic-bezier(.34,1.56,.64,1)',fill:'forwards'});

  // Gold accent line at top
  var topLine=document.createElement('div');
  topLine.style.cssText=
    'position:absolute;top:0;left:50%;transform:translateX(-50%);width:80px;height:3px;'+
    'background:linear-gradient(to right,transparent,var(--a-gold),transparent);border-radius:0 0 3px 3px;';
  mBox.appendChild(topLine);

  // Header: TONIGHT'S TORCH
  var mHdr=document.createElement('div');
  mHdr.style.cssText=
    'display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:20px;margin-top:4px;';
  var mFire=document.createElement('div');
  mFire.style.cssText='font-size:22px;animation:flicker 0.1s infinite alternate;line-height:1;';
  mFire.textContent='\uD83D\uDD25';
  var mTitle=document.createElement('div');
  mTitle.style.cssText=
    "font-family:'Bebas Neue',sans-serif;font-size:26px;color:var(--a-gold);letter-spacing:3px;"+
    "font-style:italic;transform:skewX(-10deg);text-shadow:2px 2px 0 #000, 0 0 12px var(--a-gold);line-height:1;";
  mTitle.textContent="TONIGHT'S TORCH";
  mHdr.append(mFire,mTitle);
  mBox.appendChild(mHdr);

  // Gold divider
  var mDiv1=document.createElement('div');
  mDiv1.style.cssText=
    'width:60%;height:1px;margin:0 auto 18px;'+
    'background:linear-gradient(to right,transparent,rgba(255,204,0,0.4),transparent);';
  mBox.appendChild(mDiv1);

  // Staggered content lines
  var stagger=0.15;
  function addStaggered(node,delay){
    node.style.opacity='0';
    node.style.transform='translateY(14px)';
    setTimeout(function(){
      node.animate([
        {opacity:0,transform:'translateY(14px)'},
        {opacity:1,transform:'translateY(0)'}
      ],{duration:350,easing:'ease-out',fill:'forwards'});
    },300+delay*1000);
    mBox.appendChild(node);
  }

  // Line 1: 4TH QUARTER
  var ln1=document.createElement('div');
  ln1.style.cssText=
    "font-family:'Bebas Neue',sans-serif;font-size:32px;color:#fff;letter-spacing:3px;"+
    "line-height:1;margin-bottom:6px;text-shadow:2px 2px 0 #000;";
  ln1.textContent='4TH QUARTER';
  addStaggered(ln1,stagger*0);

  // Line 2: ONE POSSESSION GAME
  var ln2=document.createElement('div');
  ln2.style.cssText=
    "font-family:'Bebas Neue',sans-serif;font-size:22px;color:#fff;letter-spacing:2px;"+
    "line-height:1;margin-bottom:12px;opacity:0.9;";
  ln2.textContent='ONE POSSESSION GAME';
  addStaggered(ln2,stagger*1);

  // Line 3: 2:45 ON THE CLOCK
  var ln3=document.createElement('div');
  ln3.style.cssText=
    "font-family:'Press Start 2P',monospace;font-size:14px;color:#fff;"+
    "line-height:1;margin-bottom:16px;letter-spacing:1px;";
  ln3.innerHTML='<span style="color:var(--orange);font-size:16px;">2:45</span> ON THE CLOCK';
  addStaggered(ln3,stagger*2);

  // Line 4: Field position bar
  var fieldWrap=document.createElement('div');
  fieldWrap.style.cssText='margin-bottom:14px;';
  var fieldBar=document.createElement('div');
  fieldBar.style.cssText=
    'width:100%;height:22px;background:#0a3d0a;border-radius:4px;position:relative;overflow:hidden;'+
    'border:1px solid rgba(0,255,68,0.25);';
  // Yard line marks (every 10 yards)
  for(var yd=1;yd<10;yd++){
    var mark=document.createElement('div');
    mark.style.cssText=
      'position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,0.15);'+
      'left:'+(yd*10)+'%;';
    fieldBar.appendChild(mark);
  }
  // End zone glow (right side)
  var ezGlow=document.createElement('div');
  ezGlow.style.cssText=
    'position:absolute;top:0;bottom:0;right:0;width:30%;'+
    'background:linear-gradient(to right,transparent,rgba(255,77,0,0.25));pointer-events:none;';
  fieldBar.appendChild(ezGlow);
  // Ball marker at 35 yard line (35% from left)
  var ballMark=document.createElement('div');
  ballMark.style.cssText=
    'position:absolute;top:50%;left:35%;transform:translate(-50%,-50%);'+
    'width:10px;height:10px;background:var(--a-gold);border-radius:50%;'+
    'box-shadow:0 0 8px var(--a-gold), 0 0 16px rgba(255,204,0,0.4);';
  fieldBar.appendChild(ballMark);
  // Animate bar drawing in from left
  fieldBar.style.clipPath='inset(0 100% 0 0)';
  setTimeout(function(){
    fieldBar.animate([
      {clipPath:'inset(0 100% 0 0)'},
      {clipPath:'inset(0 0% 0 0)'}
    ],{duration:400,easing:'ease-out',fill:'forwards'});
  },300+stagger*3*1000);
  fieldWrap.appendChild(fieldBar);
  // Field label
  var fieldLabel=document.createElement('div');
  fieldLabel.style.cssText=
    "font-family:'Press Start 2P',monospace;font-size:8px;color:var(--muted);"+
    "margin-top:6px;letter-spacing:1px;";
  fieldLabel.textContent='BALL ON THE 35 \u00B7 2ND & 10';
  fieldWrap.appendChild(fieldLabel);
  addStaggered(fieldWrap,stagger*3);

  // Line 5: ONE DRIVE DECIDES EVERYTHING
  var ln5=document.createElement('div');
  ln5.style.cssText=
    "font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--a-gold);"+
    "letter-spacing:2px;line-height:1;margin-bottom:18px;"+
    "text-shadow:0 0 12px rgba(255,204,0,0.4), 2px 2px 0 #000;";
  ln5.textContent='ONE DRIVE DECIDES EVERYTHING';
  addStaggered(ln5,stagger*4);

  // Preview cards: OFFENSE / DEFENSE
  var previewRow=document.createElement('div');
  previewRow.style.cssText=
    'display:flex;gap:10px;align-items:center;margin-bottom:20px;opacity:0;';
  setTimeout(function(){
    previewRow.animate([
      {opacity:0,transform:'translateY(10px)'},
      {opacity:1,transform:'translateY(0)'}
    ],{duration:300,easing:'ease-out',fill:'forwards'});
  },300+stagger*5*1000);

  // Offense card
  var offCard=document.createElement('div');
  offCard.style.cssText=
    'flex:1;background:rgba(0,255,68,0.05);border:1px solid rgba(0,255,68,0.25);'+
    'border-left:3px solid var(--l-green);border-radius:6px;padding:12px 8px;text-align:center;';
  var offH=document.createElement('div');
  offH.style.cssText=
    "font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--l-green);"+
    "letter-spacing:2px;line-height:1;margin-bottom:4px;";
  offH.textContent='OFFENSE';
  var offT=document.createElement('div');
  offT.style.cssText="font-size:12px;color:var(--muted);line-height:1.3;";
  offT.textContent='Score the touchdown.';
  offCard.append(offH,offT);

  // OR divider
  var orText=document.createElement('div');
  orText.style.cssText=
    "font-family:'Press Start 2P',monospace;font-size:8px;color:var(--muted);flex-shrink:0;";
  orText.textContent='OR';

  // Defense card
  var defCard=document.createElement('div');
  defCard.style.cssText=
    'flex:1;background:rgba(255,0,64,0.05);border:1px solid rgba(255,0,64,0.25);'+
    'border-left:3px solid var(--p-red);border-radius:6px;padding:12px 8px;text-align:center;';
  var defH=document.createElement('div');
  defH.style.cssText=
    "font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--p-red);"+
    "letter-spacing:2px;line-height:1;margin-bottom:4px;";
  defH.textContent='DEFENSE';
  var defT=document.createElement('div');
  defT.style.cssText="font-size:12px;color:var(--muted);line-height:1.3;";
  defT.textContent='Get the stop.';
  defCard.append(defH,defT);

  previewRow.append(offCard,orText,defCard);
  mBox.appendChild(previewRow);

  // LET'S GO button — pulses in last
  var mBtn=document.createElement('button');
  mBtn.className='btn-blitz';
  mBtn.style.cssText=
    'background:var(--a-gold);color:#000;border-color:var(--a-gold);'+
    'box-shadow:6px 6px 0 #997a00, 10px 10px 0 #000;font-size:14px;opacity:0;';
  mBtn.textContent="LET'S GO";
  mBtn.onclick=function(){modal.remove();};
  setTimeout(function(){
    mBtn.animate([
      {opacity:0,transform:'scale(0.95)'},
      {opacity:1,transform:'scale(1)'}
    ],{duration:300,easing:'ease-out',fill:'forwards'});
    // Subtle pulse glow
    mBtn.animate([
      {boxShadow:'6px 6px 0 #997a00, 10px 10px 0 #000, 0 0 0px rgba(255,204,0,0)'},
      {boxShadow:'6px 6px 0 #997a00, 10px 10px 0 #000, 0 0 20px rgba(255,204,0,0.4)'},
      {boxShadow:'6px 6px 0 #997a00, 10px 10px 0 #000, 0 0 0px rgba(255,204,0,0)'}
    ],{duration:2000,iterations:Infinity});
  },300+stagger*6*1000);
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
