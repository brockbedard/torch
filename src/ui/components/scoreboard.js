import { GS, getTeam, getOtherTeam, fmtClock } from '../../state.js';

export function buildScoreboard(selSide, selTeamId){
  var sb=document.createElement('div');
  sb.style.cssText=
    'background:#0a0818;border:2px solid #00ff8844;border-radius:6px;' +
    'padding:0;overflow:hidden;';

  var scen = GS.scenario;
  function getScoreName(id){ if(id==='iron_ridge') return 'IRON'; if(id==='canyon_tech') return 'CANYON'; return '---'; }

  var leftAbbr = '---'; var leftPts = '--'; var leftColor = 'var(--white)';
  var leftIcon = ''; var rightIcon = '';
  var rightAbbr = '---'; var rightPts = '--'; var rightColor = 'var(--white)';
  var defName = 'DEF'; var defColor = 'var(--white)';

  if (selSide && selTeamId) {
    var myTeam = getTeam(selTeamId);
    var oppTeam = getOtherTeam(selTeamId);
    var defTeam = selSide === 'offense' ? oppTeam : myTeam;
    defName = getScoreName(defTeam.id);
    defColor = defTeam.accent;

    if (selSide === 'offense') {
      leftAbbr = getScoreName(myTeam.id); leftPts = scen.offScore; leftColor = myTeam.accent; leftIcon = myTeam.icon;
      rightAbbr = getScoreName(oppTeam.id); rightPts = scen.defScore; rightColor = oppTeam.accent; rightIcon = oppTeam.icon;
    } else {
      leftAbbr = getScoreName(oppTeam.id); leftPts = scen.offScore; leftColor = oppTeam.accent; leftIcon = oppTeam.icon;
      rightAbbr = getScoreName(myTeam.id); rightPts = scen.defScore; rightColor = myTeam.accent; rightIcon = myTeam.icon;
    }
  }

  // Score row — 5-column grid: icon | score | clock | score | icon
  var scoreRow = document.createElement('div');
  scoreRow.style.cssText =
    'display:grid;grid-template-columns:1fr 1.2fr auto 1.2fr 1fr;align-items:center;' +
    'padding:18px 14px;';

  // Left icon (centered between border and score)
  var leftIconEl = document.createElement('div');
  leftIconEl.style.cssText = 'font-size:36px;line-height:1;text-align:center;';
  leftIconEl.textContent = leftIcon;

  // Left score info
  var leftInfo = document.createElement('div');
  leftInfo.style.cssText = 'display:flex;flex-direction:column;align-items:center;';
  leftInfo.innerHTML =
    '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:22px;color:' + leftColor + ';font-style:italic;line-height:1;letter-spacing:1px;">' + leftAbbr + '</div>' +
    '<div class="px" style="font-size:30px;color:var(--a-gold);line-height:1;margin-top:3px;">' + leftPts + '</div>' +
    '<div class="px" style="font-size:8px;color:var(--f-purple);margin-top:4px;letter-spacing:1px;">TO: ' + scen.timeouts + '</div>';

  // Center clock
  var centerBlock = document.createElement('div');
  centerBlock.style.cssText =
    'text-align:center;padding:0 10px;border-left:1px solid rgba(255,255,255,0.08);' +
    'border-right:1px solid rgba(255,255,255,0.08);min-width:80px;';
  centerBlock.innerHTML =
    '<div class="px" style="font-size:10px;color:var(--muted);letter-spacing:1px;margin-bottom:5px;">4TH QTR</div>' +
    '<div class="px" style="font-size:22px;color:var(--white);text-shadow:0 0 8px white;line-height:1;">' + fmtClock(scen.clock) + '</div>';

  // Right score info
  var rightInfo = document.createElement('div');
  rightInfo.style.cssText = 'display:flex;flex-direction:column;align-items:center;';
  rightInfo.innerHTML =
    '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:22px;color:' + rightColor + ';font-style:italic;line-height:1;letter-spacing:1px;">' + rightAbbr + '</div>' +
    '<div class="px" style="font-size:30px;color:var(--a-gold);line-height:1;margin-top:3px;">' + rightPts + '</div>' +
    '<div class="px" style="font-size:8px;color:var(--f-purple);margin-top:4px;letter-spacing:1px;">TO: ' + scen.timeouts + '</div>';

  // Right icon (centered between score and border)
  var rightIconEl = document.createElement('div');
  rightIconEl.style.cssText = 'font-size:36px;line-height:1;text-align:center;';
  rightIconEl.textContent = rightIcon;

  scoreRow.append(leftIconEl, leftInfo, centerBlock, rightInfo, rightIconEl);
  sb.appendChild(scoreRow);

  // Situation bar
  var sitBar = document.createElement('div');
  sitBar.style.cssText =
    'display:flex;justify-content:center;align-items:center;gap:16px;' +
    'padding:10px 14px;background:rgba(0,0,0,0.5);border-top:1px solid rgba(255,255,255,0.06);';

  var downs = ['', '1ST', '2ND', '3RD', '4TH'];
  sitBar.innerHTML =
    '<div class="px" style="font-size:12px;color:var(--l-green);letter-spacing:1px;">' + downs[scen.down] + ' & ' + scen.dist + '</div>' +
    '<div style="width:1px;height:14px;background:rgba(255,255,255,0.15);"></div>' +
    '<div class="px" style="font-size:12px;color:var(--white);opacity:0.8;letter-spacing:1px;">BALL ON <span style="color:' + defColor + ';">' + defName + '</span> ' + scen.ballOn + '</div>';

  sb.appendChild(sitBar);

  return sb;
}
