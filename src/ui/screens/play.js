import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, getOtherTeam, getOffCards, getDefCards, getMatchupTable, shuffle, fmtClock } from '../../state.js';
import { rollYards, isTurnover, clockCost } from '../../engine/resolution.js';
import { aiPickDefense, aiPickOffense } from '../../engine/ai.js';
import { showCardIntel } from '../components/intel.js';

export function buildPlay(){
  var el=document.createElement('div');
  el.style.cssText='height:100vh;display:flex;flex-direction:column;background:var(--bg);overflow:hidden;';
  var isOff=GS.side==='offense';
  var team=getTeam(GS.team);
  var opp=getOtherTeam(GS.team);
  var playerPool=isOff?team.players:team.defPlayers;
  
  var scen = GS.scenario;
  var down = scen.down;
  var dist = scen.dist;
  var ballOn = scen.ballOn;
  var clock = scen.clock;
  var offScore = scen.offScore;
  var defScore = scen.defScore;
  var myHand=GS.hand.slice();
  var myDeck=shuffle((isOff?getOffCards(GS.team):getDefCards(GS.team)).filter(function(c){return !myHand.some(function(h){return h.id===c.id;});}));
  var aiCards=isOff?getDefCards(opp.id):getOffCards(opp.id);
  var aiHand=shuffle(aiCards.slice()).slice(0,5);
  var aiDeck=shuffle(aiCards.filter(function(c){return !aiHand.some(function(h){return h.id===c.id;});}));
  var lastAiPlay=null;
  var selIdx=-1;
  var animating=false;
  var playNum=0;
  var totalYards=0;
  var turnovers=0;
  var newCardIndices={};
  var qb=null; var skill1=null;
  if(GS.roster){
    for(var i=0;i<GS.roster.length;i++){
      var p=playerPool.find(function(pl){return pl.id===GS.roster[i];});
      if(p&&(p.cat==='qb'||p.cat==='lb')) qb=p;
      if(p&&p.cat==='skill'&&!skill1) skill1=p;
    }
  }
  function getScoreName(id){
    if(id==='iron_ridge') return 'IRON';
    if(id==='canyon_tech') return 'CANYON';
    return '---';
  }
  var scorebug=document.createElement('div');
  scorebug.style.cssText='background:linear-gradient(to right,#000,#330066,#000);border-bottom:4px solid var(--white);padding:10px;display:grid;grid-template-columns:1fr 1.2fr 1fr;align-items:center;flex-shrink:0;';

  var homeColor=isOff?team.accent:opp.accent;
  var awayColor=isOff?opp.accent:team.accent;
  var homeName=getScoreName(isOff?team.id:opp.id);
  var awayName=getScoreName(isOff?opp.id:team.id);
  var defTeam = isOff ? opp : team;
  var defName = getScoreName(defTeam.id);
  var defColor = defTeam.accent;

  var sbLeft=document.createElement('div');
  sbLeft.style.cssText='text-align:center;color:'+homeColor+';text-shadow:0 0 10px '+homeColor+';';
  sbLeft.innerHTML='<div style="font-family:\'Bebas Neue\',sans-serif;font-size:22px;font-style:italic;line-height:1;">'+homeName+'</div>';
  var sbHomeScore=document.createElement('div');
  sbHomeScore.style.cssText='font-family:\'Press Start 2P\',monospace;font-size:24px;color:var(--a-gold);text-shadow:none;margin-top:4px;';
  sbHomeScore.textContent=String(offScore);
  sbLeft.appendChild(sbHomeScore);

  var sbCenter=document.createElement('div');
  sbCenter.style.textAlign='center';
  var sbClock=document.createElement('div');
  sbClock.style.cssText='font-family:\'Press Start 2P\',monospace;font-size:14px;color:var(--white);text-shadow:0 0 5px white;';
  sbClock.textContent=fmtClock(clock);
  var sbDown=document.createElement('div');
  sbDown.style.cssText='font-family:\'Press Start 2P\',monospace;font-size:7px;color:var(--l-green);margin-top:4px;';
  var downs=['','1ST','2ND','3RD','4TH'];
  sbDown.textContent=downs[down]+' & '+dist;
  var sbBall = document.createElement('div');
  sbBall.style.cssText='font-family:\'Press Start 2P\',monospace;font-size:6px;color:white;margin-top:4px;opacity:0.8;';
  sbBall.innerHTML='BALL ON: <span style="color:'+defColor+';">'+defName+'</span> '+ballOn;
  sbCenter.append(sbClock,sbDown,sbBall);

  var sbRight=document.createElement('div');
  sbRight.style.cssText='text-align:center;color:'+awayColor+';text-shadow:0 0 10px '+awayColor+';';
  sbRight.innerHTML='<div style="font-family:\'Bebas Neue\',sans-serif;font-size:22px;font-style:italic;line-height:1;">'+awayName+'</div>';
  var sbAwayScore=document.createElement('div');
  sbAwayScore.style.cssText='font-family:\'Press Start 2P\',monospace;font-size:24px;color:var(--a-gold);text-shadow:none;margin-top:4px;';
  sbAwayScore.textContent=String(defScore);
  sbRight.appendChild(sbAwayScore);

  scorebug.append(sbLeft,sbCenter,sbRight);
  el.appendChild(scorebug);

  function updateScoreBug(){
    sbClock.textContent=fmtClock(clock);
    sbDown.textContent=downs[down]+' & '+dist;
    sbBall.innerHTML='BALL ON: <span style="color:'+defColor+';">'+defName+'</span> '+ballOn;
    sbHomeScore.textContent=String(offScore);
    sbAwayScore.textContent=String(defScore);
  }
  var field=document.createElement('div');
  field.style.cssText='flex:1;background:linear-gradient(#004422,#002211);position:relative;border-bottom:4px solid var(--f-purple);overflow:hidden;';
  var fieldGrid=document.createElement('div');
  fieldGrid.style.cssText='position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px);background-size:100% 40px;';
  field.appendChild(fieldGrid);
  var losX=Math.max(5,Math.min(85,(100-ballOn*100/60)));
  var losLine=document.createElement('div');
  losLine.style.cssText='position:absolute;top:0;bottom:0;width:2px;background:var(--a-gold);box-shadow:0 0 8px var(--a-gold);left:'+losX+'%;z-index:2;';
  field.appendChild(losLine);
  var fdX=Math.max(5,Math.min(85,(100-(ballOn-dist)*100/60)));
  var fdLine=document.createElement('div');
  fdLine.style.cssText='position:absolute;top:0;bottom:0;width:2px;background:var(--cyan);box-shadow:0 0 8px var(--cyan);left:'+fdX+'%;z-index:2;';
  field.appendChild(fdLine);
  var dotEls=[];
  function renderDots(){
    var offDots=[{x:losX-2,y:40},{x:losX-2,y:55},{x:losX-2,y:70},{x:losX-5,y:45},{x:losX-5,y:65}];
    var defDots=[{x:losX+3,y:40},{x:losX+3,y:55},{x:losX+3,y:70},{x:losX+6,y:45},{x:losX+6,y:65}];
    offDots.forEach(function(d){
      var dot=document.createElement('div');
      dot.style.cssText='position:absolute;width:12px;height:12px;border-radius:50%;background:var(--l-green);box-shadow:0 0 10px var(--l-green);left:'+d.x+'%;top:'+d.y+'%;transform:translate(-50%,-50%);z-index:3;transition:left .6s;';
      field.appendChild(dot);
      dotEls.push({el:dot,isOff:true});
    });
    defDots.forEach(function(d){
      var dot=document.createElement('div');
      dot.style.cssText='position:absolute;width:12px;height:12px;border-radius:50%;background:var(--p-red);box-shadow:0 0 10px var(--p-red);left:'+d.x+'%;top:'+d.y+'%;transform:translate(-50%,-50%);z-index:3;transition:left .6s;';
      field.appendChild(dot);
      dotEls.push({el:dot,isOff:false});
    });
  }
  renderDots();
  var pill=document.createElement('div');
  pill.style.cssText='position:absolute;bottom:10px;width:100%;text-align:center;font-family:\'Press Start 2P\',monospace;font-size:8px;z-index:4;color:var(--white);text-shadow:0 0 4px #000;';
  pill.innerHTML='BALL ON: <span style="color:'+defColor+';">'+defName+'</span> '+ballOn;
  field.appendChild(pill);
  el.appendChild(field);
  function updateField(){
    losX=Math.max(5,Math.min(85,(100-ballOn*100/60)));
    losLine.style.left=losX+'%';
    fdX=Math.max(5,Math.min(85,(100-(ballOn-dist)*100/60)));
    fdLine.style.left=fdX+'%';
    pill.innerHTML='BALL ON: <span style="color:'+defColor+';">'+defName+'</span> '+ballOn;
    dotEls.forEach(function(obj){
      var offset=obj.isOff?-2:3;
      obj.el.style.left=(losX+offset)+'%';
    });
  }
  var clash=document.createElement('div');
  clash.style.cssText='flex:1.5;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;flex-shrink:0;';
  var pickPrompt=document.createElement('div');
  pickPrompt.style.cssText="font-family:'Bebas Neue',sans-serif;font-size:24px;color:var(--cyan);letter-spacing:4px;text-shadow:0 0 12px var(--cyan);text-align:center;margin-bottom:10px;";
  pickPrompt.textContent='PICK YOUR PLAY';
  var cardRow=document.createElement('div');
  cardRow.style.cssText='display:flex;gap:20px;align-items:center;justify-content:center;width:100%;';
  var mySlot=document.createElement('div');
  mySlot.className='clash-card';
  mySlot.innerHTML='<div style="font-family:\'Press Start 2P\',monospace;font-size:6px;color:var(--muted);">YOU</div>';
  var vsLabel=document.createElement('div');
  vsLabel.className='vs-circle';
  vsLabel.textContent='VS';
  var aiSlot=document.createElement('div');
  aiSlot.className='clash-card';
  aiSlot.style.opacity='0.5';
  aiSlot.style.borderStyle='dashed';
  aiSlot.innerHTML='<div style="font-family:\'Press Start 2P\',monospace;font-size:6px;color:var(--muted);">AI</div>';
  cardRow.append(mySlot,vsLabel,aiSlot);
  var resultArea=document.createElement('div');
  resultArea.style.cssText='text-align:center;min-height:60px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;margin-top:10px;';

  var commBox=document.createElement('div');
  commBox.style.cssText='width:100%;max-width:320px;padding:8px 12px;background:rgba(0,0,0,0.4);border:1px solid var(--a-gold);border-radius:4px;font-family:\'Barlow Condensed\',sans-serif;font-style:italic;color:var(--a-gold);font-size:13px;opacity:0;transition:opacity 0.4s;min-height:0;';
  commBox.textContent='... BROADCAST BOOTH ...';
  resultArea.appendChild(commBox);

  var nextBtn=document.createElement('button');
  nextBtn.className='btn-blitz';
  nextBtn.style.cssText='padding:10px 24px;font-size:10px;opacity:0;pointer-events:none;width:auto;margin-top:10px;';
  nextBtn.textContent='NEXT PLAY \u25B6';

  clash.append(pickPrompt,cardRow,resultArea,nextBtn);
  el.appendChild(clash);
  var snapWrap=document.createElement('div');
  snapWrap.style.cssText='padding:10px;background:#000;flex-shrink:0;';
  var snapBtn=document.createElement('button');
  snapBtn.className='btn-blitz';
  snapBtn.style.fontSize='14px';
  snapBtn.textContent='SELECT A PLAY';
  snapBtn.disabled=true;
  snapWrap.appendChild(snapBtn);
  el.appendChild(snapWrap);
  var handArea=document.createElement('div');
  handArea.style.cssText='padding:10px;background:#000;border-top:4px solid #333;display:flex;gap:5px;overflow-x:auto;flex-shrink:0;';
  el.appendChild(handArea);
  function typeColor(card){
    if(card.type==='run') return {border:'var(--orange)'};
    if(card.type==='pass') return {border:'var(--cyan)'};
    if(card.type==='agg') return {border:'var(--p-red)'};
    return {border:'var(--l-green)'};
  }
  function renderHand(){
    handArea.innerHTML='';
    myHand.forEach(function(card,i){
      var tc=typeColor(card);
      var isSel=selIdx===i;
      var cel=document.createElement('div');
      cel.className='play-card-blitz'+(isSel?' selected':'');
      cel.style.cssText+='width:90px;flex-shrink:0;transform:scale('+(isSel?0.95:0.85)+');border-color:'+tc.border+';';
      if(newCardIndices[i]){
        var n=document.createElement('div');
        n.style.cssText='position:absolute;top:2px;right:2px;font-family:\'Press Start 2P\',monospace;font-size:4px;color:var(--white);background:var(--l-green);padding:2px;';
        n.textContent='NEW';
        cel.appendChild(n);
      }
      var nameEl=document.createElement('div');
      nameEl.style.cssText="font-family:'Bebas Neue',sans-serif;font-size:16px;line-height:1;";
      nameEl.textContent=card.name;
      var iconEl=document.createElement('div');
      iconEl.style.cssText='font-size:24px;margin:5px 0;';
      iconEl.textContent=card.icon;
      var helpBtn=document.createElement('div');
      helpBtn.style.cssText='position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;border:1px solid '+tc.border+';color:'+tc.border+';font-size:10px;display:flex;align-items:center;justify-content:center;font-weight:bold;cursor:pointer;';
      helpBtn.textContent='?';
      helpBtn.onclick=function(e){e.stopPropagation();SND.click();showCardIntel(card,GS.team,GS.side);};
      cel.appendChild(helpBtn);
      cel.append(nameEl,iconEl);
      cel.onclick=function(){if(animating) return;SND.select();selIdx=selIdx===i?-1:i;renderHand();updateSnapBtn();};
      handArea.appendChild(cel);
    });
  }
  function updateSnapBtn(){
    if(selIdx>=0&&!animating){snapBtn.disabled=false;snapBtn.textContent='SNAP BALL!';}
    else {snapBtn.disabled=true;snapBtn.textContent='SELECT A PLAY';}
  }
  function renderClashCard(card,faceUp,color){
    var c=document.createElement('div');
    c.className='clash-card';
    if(!faceUp){c.innerHTML='<div style="font-size:28px;opacity:.4;">\uD83C\uDFC8</div>';return c;}
    c.style.borderColor=color||'var(--white)';
    c.innerHTML='<div style="font-size:32px;margin-bottom:10px;">'+card.icon+'</div><div style="font-family:\'Bebas Neue\',sans-serif;font-size:18px;line-height:1;">'+card.name+'</div>';
    return c;
  }
  function genNarrative(tier,yards,myCard,aiCard,isTurnoverResult){
    var qbNick=qb?('\u201C'+qb.nick+'\u201D'):'The QB';
    var skillNick=skill1?('\u201C'+skill1.nick+'\u201D'):'the receiver';
    if(isTurnoverResult){if(isOff) return 'TURNOVER! The defense reads it all the way!';else return 'TURNOVER! '+qbNick+' jumps the route!';}
    if(isOff){if(tier==='O+') return qbNick+' hits '+skillNick+' for '+yards+' yards!';if(tier==='N') return myCard.name+' picks up '+yards+' yards.';return 'Stuffed! Minimal gain.';}
    else {if(tier==='O+') return 'Offense breaks through for '+yards+'!';if(tier==='N') return 'Solid tackle. '+yards+' yard gain.';return myCard.name+' locks it down!';}
  }
  function endDrive(result){
    var stats={plays:playNum,yards:totalYards,turnovers:turnovers};
    if(result==='td'){
      animating=true;
      offScore+=6;
      updateScoreBug();
      setTimeout(function(){
        resetClash();
        pickPrompt.textContent='TOUCHDOWN!';
        var convArea=document.createElement('div');
        convArea.style.cssText='display:flex;flex-direction:column;gap:10px;width:100%;max-width:240px;animation:fi .4s both;';
        var xpBtn=document.createElement('button');
        xpBtn.className='btn-blitz';
        xpBtn.style.padding='10px';
        xpBtn.innerHTML='EXTRA POINT (TIE)<br><span style="font-size:6px;opacity:.7;">95% CHANCE</span>';
        var tpBtn=document.createElement('button');
        tpBtn.className='btn-blitz';
        tpBtn.style.padding='10px';
        tpBtn.style.borderColor='var(--a-gold)';
        tpBtn.style.color='var(--a-gold)';
        tpBtn.innerHTML='2-POINT TRY (WIN)<br><span style="font-size:6px;opacity:.7;">45% CHANCE</span>';
        function resolve(two){
          SND.snap();
          convArea.innerHTML='';
          var win=Math.random()<(two?0.45:0.95);
          if(win) offScore+=(two?2:1);
          updateScoreBug();
          var r=document.createElement('div');
          r.style.cssText="font-family:'Bebas Neue',sans-serif;font-size:28px;color:"+(win?'var(--l-green)':'var(--p-red)')+";animation:pop .4s both;";
          r.textContent=win?(two?'2-PT GOOD!':'XP GOOD!'):(two?'2-PT FAILED!':'XP MISSED!');
          convArea.appendChild(r);
          setTimeout(function(){
            var fin;
            if(isOff) fin=offScore>defScore?'win':'loss';
            else fin=offScore<defScore?'win':'loss';
            setGs({screen:'result',team:GS.team,side:GS.side,roster:GS.roster,hand:GS.hand,result:fin,finalScore:{off:offScore,def:defScore},driveStats:stats});
          },1500);
        }
        xpBtn.onclick=function(){resolve(false);};
        tpBtn.onclick=function(){resolve(true);};
        convArea.append(xpBtn,tpBtn);
        resultArea.appendChild(convArea);
      },1000);
      return;
    }
    var finalResult;
    if(isOff) finalResult=result==='td'?'win':'loss';
    else finalResult=result==='td'?'loss':'win';
    setTimeout(function(){setGs({screen:'result',team:GS.team,side:GS.side,roster:GS.roster,hand:GS.hand,result:finalResult,finalScore:{off:offScore,def:defScore},driveStats:stats});},1200);
  }
  snapBtn.onclick=function(){
    if(selIdx<0||animating) return;
    animating=true;
    playNum++;
    SND.snap();
    var myCard=myHand[selIdx];
    var playedIdx=selIdx;
    selIdx=-1;
    var aiCard;
    if(isOff) aiCard=aiPickDefense(opp.id,aiHand,lastAiPlay);
    else aiCard=aiPickOffense(opp.id,aiHand,lastAiPlay);
    lastAiPlay=aiCard?aiCard.id:null;
    var mt,tier,offCard,defCard;
    if(isOff){offCard=myCard;defCard=aiCard;mt=getMatchupTable(team.id,opp.id);}
    else {offCard=aiCard;defCard=myCard;mt=getMatchupTable(opp.id,team.id);}
    tier=mt[offCard.id][defCard.id];
    var yards=rollYards(tier);
    var turnover=isTurnover(tier);
    snapBtn.style.display='none';
    pickPrompt.style.display='none';
    resultArea.innerHTML='';
    mySlot.innerHTML='';
    var myClash=renderClashCard(myCard,true,team.accent);
    myClash.style.cssText+=';animation:sup .3s ease-out both;';
    mySlot.appendChild(myClash);
    setTimeout(function(){aiSlot.innerHTML='';var aiDown=renderClashCard(aiCard,false);aiDown.style.cssText+=';animation:sup .3s ease-out both;';aiSlot.appendChild(aiDown);},300);
    setTimeout(function(){SND.clash();aiSlot.innerHTML='';var aiUp=renderClashCard(aiCard,true,opp.accent);aiUp.style.cssText+=';animation:pop .35s ease-out both;';aiSlot.appendChild(aiUp);},800);
    setTimeout(function(){var yardEl=document.createElement('div');yardEl.style.cssText="font-family:'Bebas Neue',sans-serif;font-size:36px;color:"+(turnover?'var(--p-red)':yards>0?'var(--l-green)':'var(--white)')+';letter-spacing:3px;text-shadow:0 0 16px '+(turnover?'var(--p-red)':'var(--l-green)')+';animation:pop .35s ease-out both;';yardEl.textContent=turnover?'TURNOVER!':(yards>0?'+':'')+yards+' YDS';resultArea.prepend(yardEl);},1100);
    setTimeout(function(){
      var narrText=genNarrative(tier,yards,myCard,aiCard,turnover);
      var narrEl=document.createElement('div');
      narrEl.style.cssText='font-size:13px;color:white;opacity:0;animation:fi .4s ease-out both;max-width:280px;text-align:center;margin-bottom:10px;';
      narrEl.textContent=narrText;
      resultArea.insertBefore(narrEl, commBox);
      
      // Call AI Commentary
      const oId = isOff ? team.id : opp.id;
      const dId = isOff ? opp.id : team.id;
      getAiCommentary(oId, dId, offCard, defCard, yards, turnover).then(commentary => {
        if(commentary) {
          commBox.style.opacity = '1';
          commBox.textContent = '\u201C' + commentary + '\u201D';
        }
      });
    },1400);
    setTimeout(function(){
      if(!turnover){totalYards+=yards;ballOn=Math.max(0,ballOn-yards);}else turnovers++;
      var cost=clockCost(offCard.id);
      clock=Math.max(0,clock-cost);
      var driveOver=false;
      if(ballOn<=0){SND.td();endDrive('td');driveOver=true;}
      else if(turnover){endDrive('turnover');driveOver=true;}
      else if(clock<=0){endDrive('clock');driveOver=true;}
      else {if(yards>=dist){down=1;dist=Math.min(10,ballOn);}else {dist=Math.max(1,dist-Math.max(0,yards));down++;if(down>4){endDrive('downs');driveOver=true;}}}
      if(!driveOver){
        nextBtn.style.opacity='1';nextBtn.style.pointerEvents='auto';
        nextBtn.onclick=function(){
          SND.click();animating=false;
          if(newCardIndices[playedIdx]) delete newCardIndices[playedIdx];
          if(myDeck.length>0){myHand[playedIdx]=myDeck.shift();newCardIndices[playedIdx]=true;}
          else myHand.splice(playedIdx,1);
          var aiIdx=aiHand.indexOf(aiCard);
          if(aiIdx>=0){if(aiDeck.length>0) aiHand[aiIdx]=aiDeck.shift();else aiHand.splice(aiIdx,1);}
          updateScoreBug();updateField();resetClash();renderHand();updateSnapBtn();snapBtn.style.display='block';
        };
      }
    },1700);
  };
  function resetClash(){
    pickPrompt.style.display='block';resultArea.innerHTML='';nextBtn.style.opacity='0';nextBtn.style.pointerEvents='none';
    mySlot.innerHTML='<div style="font-family:\'Press Start 2P\',monospace;font-size:6px;color:var(--muted);">YOU</div>';
    aiSlot.innerHTML='<div style="font-family:\'Press Start 2P\',monospace;font-size:6px;color:var(--muted);">AI</div>';
  }
  renderHand();updateSnapBtn();
  return el;
}

// ===== AI COMMENTARY SYSTEM =====
async function getAiCommentary(offTeamId, defTeamId, offCard, defCard, yards, isTurnover) {
  try {
    const offTeam = getTeam(offTeamId);
    const defTeam = getTeam(defTeamId);
    
    const systemPrompt = `You are a legendary 90s arcade football announcer. 
    Exciting, punchy, high energy. One short sentence of play-by-play and one short sentence of expert analysis. 
    Reference the specific play cards used: ${offCard.name} and ${defCard.name}. 
    Result was ${yards} yards ${isTurnover ? 'and a TURNOVER!' : ''}.`;

    const response = await fetch('/api/commentary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: systemPrompt,
        messages: [{ role: 'user', content: 'Call the play.' }]
      })
    });

    if (!response.ok) throw new Error('API failed');
    const data = await response.json();
    return data.content[0].text;
  } catch (err) {
    console.error('Commentary error:', err);
    return null;
  }
}
