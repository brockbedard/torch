import { GS, getTeam, getOtherTeam, fmtClock } from '../../state.js';

export function buildScoreboard(selSide, selTeamId){
  var sb=document.createElement('div');
  sb.style.cssText='background:#000;border:4px solid var(--white);border-image:var(--chrome) 1;padding:25px 10px;display:grid;grid-template-columns:1fr 1.2fr 1fr;align-items:center;margin-bottom:20px;box-shadow:0 0 40px rgba(255,255,255,0.1);';
  
  var scen = GS.scenario;
  function getScoreName(id){ if(id==='iron_ridge') return 'IRON'; if(id==='canyon_tech') return 'CANYON'; return '---'; }

  var leftAbbr = '---'; var leftPts = '--'; var leftColor = 'var(--white)';
  var rightAbbr = '---'; var rightPts = '--'; var rightColor = 'var(--white)';
  var defName = 'DEF'; var defColor = 'var(--white)';

  if (selSide && selTeamId) {
    var myTeam = getTeam(selTeamId);
    var oppTeam = getOtherTeam(selTeamId);
    var defTeam = selSide === 'offense' ? oppTeam : myTeam;
    defName = getScoreName(defTeam.id);
    defColor = defTeam.accent;

    if (selSide === 'offense') {
      leftAbbr = getScoreName(myTeam.id); leftPts = scen.offScore; leftColor = myTeam.accent;
      rightAbbr = getScoreName(oppTeam.id); rightPts = scen.defScore; rightColor = oppTeam.accent;
    } else {
      leftAbbr = getScoreName(oppTeam.id); leftPts = scen.offScore; leftColor = oppTeam.accent;
      rightAbbr = getScoreName(myTeam.id); rightPts = scen.defScore; rightColor = myTeam.accent;
    }
  }

  var left=document.createElement('div');
  left.style.textAlign='center';
  left.innerHTML=
    '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:22px;color:'+leftColor+';font-style:italic;line-height:1;">'+leftAbbr+'</div>'+
    '<div class="px" style="font-size:28px;color:var(--a-gold);margin-top:5px;line-height:1;">'+leftPts+'</div>';
  
  var center=document.createElement('div');
  center.style.textAlign='center';
  center.innerHTML='<div class="px" style="font-size:14px;color:var(--white);margin-bottom:6px;text-shadow:0 0 5px white;">'+fmtClock(scen.clock)+'</div>'+
    '<div class="px" style="font-size:7px;color:var(--l-green);margin-bottom:4px;">'+scen.down+'& '+scen.dist+'</div>'+
    '<div class="px" style="font-size:7px;color:var(--white);opacity:0.8;margin-bottom:4px;">TIMEOUTS: '+scen.timeouts+'</div>'+
    '<div class="px" style="font-size:7px;color:var(--white);">BALL ON: <span style="color:'+defColor+';">'+defName+'</span> '+scen.ballOn+'</div>';

  var right=document.createElement('div');
  right.style.textAlign='center';
  right.innerHTML=
    '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:22px;color:'+rightColor+';font-style:italic;line-height:1;">'+rightAbbr+'</div>'+
    '<div class="px" style="font-size:28px;color:var(--a-gold);margin-top:5px;line-height:1;">'+rightPts+'</div>';
  
  sb.append(left,center,right);
  return sb;
}
