import { GS, getTeam, getOtherTeam, fmtClock } from '../../state.js';

export function buildScoreboard(selSide, selTeamId){
  var sb=document.createElement('div');
  sb.style.cssText=
    'background:var(--bg-surface);border:2px solid #00ff8844;border-radius:6px;' +
    'padding:0;overflow:hidden;';

  var scen = GS.scenario;

  var leftAbbr = '---'; var leftPts = '--'; var leftColor = 'var(--white)';
  var leftIcon = ''; var rightIcon = '';
  var rightAbbr = '---'; var rightPts = '--'; var rightColor = 'var(--white)';
  var defName = 'DEF'; var defColor = 'var(--white)';
  var leftIsPlayer = false; var rightIsPlayer = false;

  if (selSide && selTeamId) {
    var myTeam = getTeam(selTeamId);
    var oppTeam = getOtherTeam(selTeamId);
    var defTeam = selSide === 'offense' ? oppTeam : myTeam;
    defName = defTeam.abbr;
    defColor = defTeam.accent;

    function mascot(id){ if(id==='iron_ridge') return 'TRIDENTS'; if(id==='canyon_tech') return 'CACTI'; return '---'; }

    if (selSide === 'offense') {
      leftAbbr = mascot(myTeam.id); leftPts = scen.offScore; leftColor = myTeam.accent; leftIcon = myTeam.icon;
      rightAbbr = mascot(oppTeam.id); rightPts = scen.defScore; rightColor = oppTeam.accent; rightIcon = oppTeam.icon;
      leftIsPlayer = true;
    } else {
      leftAbbr = mascot(oppTeam.id); leftPts = scen.offScore; leftColor = oppTeam.accent; leftIcon = oppTeam.icon;
      rightAbbr = mascot(myTeam.id); rightPts = scen.defScore; rightColor = myTeam.accent; rightIcon = myTeam.icon;
      rightIsPlayer = true;
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
  leftInfo.style.cssText = 'display:flex;flex-direction:column;align-items:center;position:relative;padding:6px 8px;border-radius:6px;' +
    (leftIsPlayer ? 'background:radial-gradient(ellipse,rgba(255,204,0,0.25) 0%,rgba(255,204,0,0.08) 50%,transparent 75%);box-shadow:0 0 30px rgba(255,204,0,0.25), inset 0 0 15px rgba(255,204,0,0.08);' : '');
  leftInfo.innerHTML =
    '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:18px;color:' + leftColor + ';font-style:italic;line-height:1;letter-spacing:1px;' + (leftIsPlayer ? 'text-shadow:0 0 16px rgba(255,204,0,0.8), 0 0 30px rgba(255,204,0,0.4);' : '') + '">' + leftAbbr + '</div>' +
    '<div class="px" style="font-size:30px;color:var(--white);line-height:1;margin-top:3px;' + (leftIsPlayer ? 'text-shadow:0 0 18px rgba(255,204,0,0.7), 0 0 35px rgba(255,204,0,0.3);' : '') + '">' + leftPts + '</div>' +
    '<div class="px" style="font-size:8px;color:#cc66ff;margin-top:4px;letter-spacing:1px;">TO: ' + scen.timeouts + '</div>';

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
  rightInfo.style.cssText = 'display:flex;flex-direction:column;align-items:center;position:relative;padding:6px 8px;border-radius:6px;' +
    (rightIsPlayer ? 'background:radial-gradient(ellipse,rgba(255,204,0,0.25) 0%,rgba(255,204,0,0.08) 50%,transparent 75%);box-shadow:0 0 30px rgba(255,204,0,0.25), inset 0 0 15px rgba(255,204,0,0.08);' : '');
  rightInfo.innerHTML =
    '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:18px;color:' + rightColor + ';font-style:italic;line-height:1;letter-spacing:1px;' + (rightIsPlayer ? 'text-shadow:0 0 16px rgba(255,204,0,0.8), 0 0 30px rgba(255,204,0,0.4);' : '') + '">' + rightAbbr + '</div>' +
    '<div class="px" style="font-size:30px;color:var(--white);line-height:1;margin-top:3px;' + (rightIsPlayer ? 'text-shadow:0 0 18px rgba(255,204,0,0.7), 0 0 35px rgba(255,204,0,0.3);' : '') + '">' + rightPts + '</div>' +
    '<div class="px" style="font-size:8px;color:#cc66ff;margin-top:4px;letter-spacing:1px;">TO: ' + scen.timeouts + '</div>';

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
    '<div class="px" style="font-size:12px;color:var(--cyan);letter-spacing:1px;">' + downs[scen.down] + ' & ' + scen.dist + '</div>' +
    '<div style="width:1px;height:14px;background:rgba(255,255,255,0.15);"></div>' +
    '<div class="px" style="font-size:12px;color:var(--white);opacity:0.8;letter-spacing:1px;">BALL ON <span style="color:' + defColor + ';">' + defName + '</span> ' + scen.ballOn + '</div>';

  sb.appendChild(sitBar);

  return sb;
}
