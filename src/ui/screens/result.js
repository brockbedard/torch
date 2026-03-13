import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, getOtherTeam, render } from '../../state.js';

export function buildResult(){
  var el=document.createElement('div');
  el.style.cssText='min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center;background:radial-gradient(circle at 50% 50%,#440088 0%,#050015 100%);position:relative;overflow:hidden;';
  var isWin=GS.result==='win';
  var stats=GS.driveStats||{plays:0,yards:0,turnovers:0};
  var score=GS.finalScore||{off:GS.scenario.offScore,def:GS.scenario.defScore};
  var team=getTeam(GS.team);
  var opp=getOtherTeam(GS.team);
  var streakKey='torch_streak';
  var lastPlayKey='torch_last_play';
  var lastResultKey='torch_last_result';
  var today=new Date().toDateString();
  var lastPlay=localStorage.getItem(lastPlayKey);
  var streak=parseInt(localStorage.getItem(streakKey)||'0',10);
  if(lastPlay!==today){
    if(isWin){streak++;localStorage.setItem(lastResultKey,'win');}
    else{streak=0;localStorage.setItem(lastResultKey,'loss');}
    localStorage.setItem(streakKey,String(streak));localStorage.setItem(lastPlayKey,today);
  }
  var bonusKey='torch_bonus_'+today;
  var bonusSide=GS.side==='offense'?'defense':'offense';
  var alreadyPlayedBonus=localStorage.getItem(bonusKey)==='played';
  var status=document.createElement('div');
  status.style.cssText="font-family:'Press Start 2P',monospace;font-size:10px;color:var(--a-gold);margin-bottom:10px;";
  status.textContent='DRIVE COMPLETE';
  el.appendChild(status);
  var title=document.createElement('div');
  if(isWin){
    SND.td();title.style.cssText="font-family:'Bebas Neue',sans-serif;font-size:80px;font-style:italic;color:var(--a-gold);text-shadow:0 0 30px var(--orange), 0 0 60px var(--a-gold), 4px 4px 0 #000;margin-bottom:20px;animation:pop .5s ease-out both;";
    title.textContent='TORCH LIT';
  } else {
    SND.turnover();title.style.cssText="font-family:'Bebas Neue',sans-serif;font-size:80px;font-style:italic;color:var(--p-red);text-shadow:0 0 30px var(--p-red), 4px 4px 0 #000;margin-bottom:20px;animation:pop .5s ease-out both;";
    title.textContent='TORCH OUT';
  }
  el.appendChild(title);
  var sub=document.createElement('div');
  sub.style.cssText="font-family:'Press Start 2P',monospace;font-size:8px;color:var(--white);opacity:0.8;margin-bottom:30px;";
  sub.textContent=GS.side==='offense'?(isWin?'TOUCHDOWN SCORED':'DEFENSE HELD'):(isWin?'DEFENSE HELD':'TOUCHDOWN ALLOWED');
  el.appendChild(sub);
  function getScoreName(id){
    if(id==='iron_ridge') return 'IRON';
    if(id==='canyon_tech') return 'CANYON';
    return '---';
  }
  var homeTeamName=GS.side==='offense'?getScoreName(team.id):getScoreName(opp.id);
  var awayTeamName=GS.side==='offense'?getScoreName(opp.id):getScoreName(team.id);
  var statsBox=document.createElement('div');
  statsBox.style.cssText='width:100%;max-width:300px;margin-bottom:30px;';
  function makeRow(lbl,val,color){
    var r=document.createElement('div');
    r.style.cssText='display:flex;justify-content:space-between;padding:15px;border-bottom:1px solid var(--glass);font-family:\'Press Start 2P\',monospace;font-size:10px;';
    r.innerHTML='<span>'+lbl+'</span><span style="color:'+(color||'white')+';">'+val+'</span>';
    return r;
  }
  statsBox.appendChild(makeRow('FINAL SCORE',homeTeamName+' '+score.off+' - '+score.def+' '+awayTeamName,'var(--a-gold)'));
  statsBox.appendChild(makeRow('TOTAL YARDS',((stats.yards>0?'+':'')+stats.yards+' YDS')));
  statsBox.appendChild(makeRow('PLAYS',String(stats.plays)));
  if(streak>0) statsBox.appendChild(makeRow('STREAK','+1 ('+streak+')','var(--a-gold)'));
  else statsBox.appendChild(makeRow('STREAK','RESET','var(--p-red)'));
  el.appendChild(statsBox);
  var btnWrap=document.createElement('div');
  btnWrap.style.cssText='width:100%;max-width:300px;display:flex;flex-direction:column;gap:15px;';
  var shareBtn=document.createElement('button');
  shareBtn.className='btn-blitz';
  shareBtn.textContent='SHARE RESULT';
  shareBtn.onclick=function(){
    SND.click();
    var emoji=isWin?'\uD83D\uDD25':'\uD83D\uDCA8';
    var shareText='TORCH '+emoji+' '+(isWin?'LIT':'OUT')+'\n'+homeTeamName+' '+score.off+' - '+score.def+' '+awayTeamName+'\n'+stats.plays+' plays | '+stats.yards+' yds | '+stats.turnovers+' TO\n'+(streak>0?'\uD83D\uDD25 Streak: '+streak+'\n':'')+'torch-two.vercel.app';
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(shareText).then(function(){shareBtn.textContent='COPIED!';setTimeout(function(){shareBtn.textContent='SHARE RESULT';},2000);});}
    else{var ta=document.createElement('textarea');ta.value=shareText;ta.style.cssText='position:fixed;left:-9999px;';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();shareBtn.textContent='COPIED!';setTimeout(function(){shareBtn.textContent='SHARE RESULT';},2000);}
  };
  btnWrap.appendChild(shareBtn);
  if(isWin&&!alreadyPlayedBonus){
    var bonusBtn=document.createElement('button');
    bonusBtn.className='btn-blitz';
    bonusBtn.style.cssText='border-color:var(--a-gold);color:var(--a-gold);box-shadow:4px 4px 0 var(--a-gold);';
    bonusBtn.textContent='BONUS: PLAY '+bonusSide.toUpperCase();
    bonusBtn.onclick=function(){SND.snap();localStorage.setItem(bonusKey,'played');setGs({screen:'setup',team:null,side:null,bonusSide:bonusSide});};
    btnWrap.appendChild(bonusBtn);
  }
  var homeBtn=document.createElement('button');
  homeBtn.className='btn-blitz';
  homeBtn.style.cssText='background:transparent;color:#fff;border-color:#444;box-shadow:none;';
  homeBtn.textContent='HOME';
  homeBtn.onclick=function(){SND.click();setGs(null);};
  btnWrap.appendChild(homeBtn);
  el.appendChild(btnWrap);
  return el;
}
