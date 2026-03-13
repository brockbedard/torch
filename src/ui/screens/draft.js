import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, shuffle } from '../../state.js';

function badgeSvg(badge, color) {
  var s = 'xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"';
  var f = ' fill="' + color + '"';
  var st = ' stroke="' + color + '" fill="none" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"';
  switch (badge) {
    case 'FOOTBALL':
      return '<svg ' + s + '><ellipse cx="8" cy="8" rx="6" ry="4"' + f + '/><line x1="5" y1="6" x2="5" y2="10" stroke="#000" stroke-width="0.6"/><line x1="8" y1="6" x2="8" y2="10" stroke="#000" stroke-width="0.6"/><line x1="11" y1="6" x2="11" y2="10" stroke="#000" stroke-width="0.6"/></svg>';
    case 'CLEAT':
      return '<svg ' + s + '><path d="M3,11 L4,5 Q5,3 7,3 L12,3 Q13,3 13,4 L13,7 L14,8 L14,11 Q14,12 13,12 L4,12 Q3,12 3,11 Z"' + f + '/><line x1="5" y1="12" x2="5" y2="14" stroke="' + color + '" stroke-width="1"/><line x1="8" y1="12" x2="8" y2="14" stroke="' + color + '" stroke-width="1"/><line x1="11" y1="12" x2="11" y2="14" stroke="' + color + '" stroke-width="1"/></svg>';
    case 'HELMET':
      return '<svg ' + s + '><path d="M4,12 L4,7 Q4,3 8,3 Q12,3 12,7 L12,9 L14,9 L14,11 L12,11 L12,12 Z"' + f + '/><rect x="12" y="6" width="2" height="2" rx="0.5" fill="#000" opacity="0.3"/></svg>';
    case 'CLIPBOARD':
      return '<svg ' + s + '><rect x="3" y="3" width="10" height="12" rx="1"' + st + '/><rect x="6" y="1" width="4" height="3" rx="1"' + st + '/><line x1="5.5" y1="7" x2="10.5" y2="7"' + st + '/><line x1="5.5" y1="9.5" x2="10.5" y2="9.5"' + st + '/><line x1="5.5" y1="12" x2="8.5" y2="12"' + st + '/></svg>';
    case 'GLOVE':
      return '<svg ' + s + '><path d="M5,14 L5,7 L4,4 Q4,2.5 5,3 L6,5 L6,3 Q6,1.5 7,2 L7.5,5 L8,2.5 Q8,1 9,1.5 L9.5,5 L10,3.5 Q10,2 11,2.5 L11,7 L12,6 Q13,5.5 13,7 L12,10 L11,14 Z"' + f + '/></svg>';
    case 'SPEED_LINES':
      return '<svg ' + s + '><line x1="3" y1="4" x2="13" y2="4"' + st + '/><line x1="3" y1="8" x2="13" y2="8"' + st + '/><line x1="3" y1="12" x2="13" y2="12"' + st + '/><polygon points="11,2 14,4 11,6" fill="' + color + '"/><polygon points="11,6 14,8 11,10" fill="' + color + '"/><polygon points="11,10 14,12 11,14" fill="' + color + '"/></svg>';
    case 'CROSSHAIR':
      return '<svg ' + s + '><circle cx="8" cy="8" r="5"' + st + '/><circle cx="8" cy="8" r="2"' + st + '/><line x1="8" y1="1" x2="8" y2="4"' + st + '/><line x1="8" y1="12" x2="8" y2="15"' + st + '/><line x1="1" y1="8" x2="4" y2="8"' + st + '/><line x1="12" y1="8" x2="15" y2="8"' + st + '/></svg>';
    case 'BOLT':
      return '<svg ' + s + '><polygon points="9,1 4,9 7.5,9 6,15 12,7 8.5,7 10,1"' + f + '/></svg>';
    case 'PADLOCK':
      return '<svg ' + s + '><rect x="3.5" y="7" width="9" height="7" rx="1.5"' + f + '/><path d="M5.5,7 L5.5,5 Q5.5,2 8,2 Q10.5,2 10.5,5 L10.5,7"' + st + '/><circle cx="8" cy="10.5" r="1" fill="#000" opacity="0.3"/></svg>';
    case 'BRICK':
      return '<svg ' + s + '><rect x="2" y="4" width="5.5" height="3.5" rx="0.5"' + f + '/><rect x="8.5" y="4" width="5.5" height="3.5" rx="0.5"' + f + '/><rect x="2" y="8.5" width="5.5" height="3.5" rx="0.5"' + f + '/><rect x="8.5" y="8.5" width="5.5" height="3.5" rx="0.5"' + f + '/></svg>';
    case 'FLAME':
      return '<svg ' + s + '><path d="M8,1 Q12,5 11,9 Q10.5,11 9,12 Q10,10 9,8 Q8,10 8,12 Q7,10 7,8 Q6,10 7,12 Q5.5,11 5,9 Q4,5 8,1 Z"' + f + '/></svg>';
    case 'EYE':
      return '<svg ' + s + '><path d="M1,8 Q4,3 8,3 Q12,3 15,8 Q12,13 8,13 Q4,13 1,8 Z"' + st + '/><circle cx="8" cy="8" r="2.5"' + f + '/></svg>';
    default:
      return '';
  }
}

function getPlayerImage(player, team, side) {
  var prefix = team.abbr.toLowerCase();
  var s = side === 'offense' ? 'off' : 'def';
  var pos = player.pos.toLowerCase();
  var lastName = player.name.split(' ').pop().toLowerCase();
  return '/img/players/' + prefix + '-' + s + '-' + pos + '-' + lastName + '.png';
}

function buildPlayerCard(player, team, side, isSel, size) {
  var isLarge = size === 'large';
  var artH = isLarge ? 200 : 160;
  var nameSize = isLarge ? 22 : 18;
  var imgSrc = getPlayerImage(player, team, side);

  var card = document.createElement('div');
  card.style.cssText =
    'background:var(--bg-surface);' +
    'border:2px solid ' + (isSel ? '#00ff88' : '#00ff8866') + ';' +
    'border-radius:6px;' +
    'padding:0;' +
    'cursor:pointer;' +
    'position:relative;' +
    'overflow:hidden;' +
    'opacity:' + (isSel ? '1' : '0.8') + ';' +
    'transition:all 0.15s ease;' +
    (isSel ? 'box-shadow:0 0 18px rgba(0,255,136,0.35), inset 0 0 12px rgba(0,255,136,0.08);' : '');

  // Selected indicator bar
  if (isSel) {
    var bar = document.createElement('div');
    bar.style.cssText =
      'position:absolute;top:0;left:50%;transform:translateX(-50%);' +
      'width:36px;height:3px;background:#00ff88;border-radius:0 0 3px 3px;z-index:3;';
    card.appendChild(bar);
  }

  // Header row
  var header = document.createElement('div');
  header.style.cssText =
    'display:flex;justify-content:space-between;align-items:flex-start;' +
    'padding:10px 10px 0 10px;position:relative;z-index:2;' +
    (isSel ? 'background:linear-gradient(180deg, rgba(0,255,136,0.1) 0%, transparent 100%);' : '');

  // Left: position + name
  var leftCol = document.createElement('div');
  leftCol.style.cssText = 'display:flex;flex-direction:column;gap:2px;';

  var posEl = document.createElement('div');
  posEl.style.cssText =
    'font-family:"Courier New",monospace;font-size:' + (isLarge ? 17 : 15) + 'px;font-weight:bold;' +
    'color:#ff0040;letter-spacing:2px;line-height:1;';
  posEl.textContent = player.pos;

  var nameEl = document.createElement('div');
  nameEl.style.cssText =
    'font-family:"Bebas Neue",sans-serif;font-size:' + nameSize + 'px;' +
    'color:#ffffff;line-height:1.05;margin-top:2px;';
  nameEl.textContent = player.name;

  leftCol.appendChild(posEl);
  leftCol.appendChild(nameEl);

  // Right: OVR
  var rightCol = document.createElement('div');
  rightCol.style.cssText = 'text-align:right;display:flex;flex-direction:column;align-items:flex-end;';

  var ovrNum = document.createElement('div');
  ovrNum.style.cssText =
    'font-family:"Courier New",monospace;font-size:' + (isLarge ? 36 : 30) + 'px;' +
    'font-weight:bold;color:#00eaff;line-height:1;' +
    'text-shadow:0 0 10px rgba(0,234,255,0.6), 0 0 20px rgba(0,234,255,0.3);';
  ovrNum.textContent = player.ovr;

  var ovrLabel = document.createElement('div');
  ovrLabel.style.cssText =
    'font-family:"Courier New",monospace;font-size:8px;font-weight:bold;' +
    'color:#00eaff;opacity:0.5;letter-spacing:2px;line-height:1;margin-top:1px;';
  ovrLabel.textContent = 'OVERALL';

  rightCol.appendChild(ovrNum);
  rightCol.appendChild(ovrLabel);

  header.appendChild(leftCol);
  header.appendChild(rightCol);
  card.appendChild(header);

  // Player art area
  var artWrap = document.createElement('div');
  artWrap.style.cssText =
    'position:relative;height:' + artH + 'px;display:flex;align-items:center;justify-content:center;overflow:hidden;';

  var img = document.createElement('img');
  img.src = imgSrc;
  img.alt = player.name;
  img.style.cssText =
    'height:100%;width:100%;object-fit:contain;position:relative;z-index:1;' +
    'filter:drop-shadow(0 2px 8px rgba(0,0,0,0.7));';
  img.draggable = false;

  // Gradient fade at bottom
  var fade = document.createElement('div');
  fade.style.cssText =
    'position:absolute;bottom:0;left:0;right:0;height:40%;z-index:2;' +
    'background:linear-gradient(to bottom, transparent 0%, #0f0d1a 100%);pointer-events:none;';

  // Watermark cover (bottom-right corner)
  var wmCover = document.createElement('div');
  wmCover.style.cssText =
    'position:absolute;bottom:0;right:0;width:40px;height:40px;z-index:3;' +
    'background:radial-gradient(circle at bottom right, #0f0d1a 60%, transparent 100%);pointer-events:none;';

  artWrap.appendChild(img);
  artWrap.appendChild(fade);
  artWrap.appendChild(wmCover);
  card.appendChild(artWrap);

  // Footer
  var footer = document.createElement('div');
  footer.style.cssText =
    'padding:0 10px 8px 10px;position:relative;z-index:2;';

  var nickEl = document.createElement('div');
  nickEl.style.cssText =
    'font-family:"Courier New",monospace;font-size:' + (isLarge ? 14 : 13) + 'px;' +
    'color:var(--white);font-weight:bold;letter-spacing:1px;line-height:1;' +
    'text-align:center;opacity:0.8;';
  nickEl.textContent = '"' + player.nick + '"';

  footer.appendChild(nickEl);
  card.appendChild(footer);

  // Badge icon — bottom-left corner
  if (player.badge) {
    var badgeWrap = document.createElement('div');
    badgeWrap.style.cssText =
      'position:absolute;bottom:8px;left:8px;z-index:4;width:16px;height:16px;' +
      'filter:drop-shadow(0 0 ' + (isSel ? '3px' : '2px') + ' ' + team.accent + (isSel ? '66' : '4d') + ');';
    badgeWrap.innerHTML = badgeSvg(player.badge, team.accent);
    card.appendChild(badgeWrap);
  }

  return card;
}

export function buildDraft() {
  var el = document.createElement('div');
  el.className = 'sup';
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:var(--bg);';

  var team = getTeam(GS.team);
  var isDef = GS.side === 'defense';
  var playerPool = isDef ? team.defPlayers : team.players;
  var primaryPlayers = playerPool.filter(function(p) { return p.cat === (isDef ? 'lb' : 'qb'); });
  var skillPlayers = playerPool.filter(function(p) { return p.cat === 'skill'; });

  // Header bar
  var hdr = document.createElement('div');
  hdr.style.cssText =
    'background:rgba(0,0,0,0.5);padding:10px 14px;display:flex;justify-content:space-between;' +
    'align-items:center;flex-shrink:0;border-bottom:2px solid var(--f-purple);';
  var schemeName = isDef ? team.defStyle : team.style;
  var teamBrand = document.createElement('div');
  teamBrand.style.cssText =
    'display:flex;align-items:baseline;gap:0;' +
    'font-style:italic;transform:skewX(-10deg);';
  var brandName = document.createElement('span');
  brandName.style.cssText =
    'font-family:"Bebas Neue",sans-serif;font-size:24px;color:' + team.accent + ';' +
    'letter-spacing:2px;text-shadow:2px 2px 0 #000, 0 0 10px ' + team.accent + ';';
  brandName.textContent = team.name;
  var brandScheme = document.createElement('span');
  brandScheme.style.cssText =
    'font-family:"Bebas Neue",sans-serif;font-size:16px;color:var(--muted);' +
    'letter-spacing:1px;margin-left:6px;';
  brandScheme.textContent = '\u00b7 ' + schemeName;
  teamBrand.append(brandName, brandScheme);
  hdr.appendChild(teamBrand);

  var backBtn = document.createElement('button');
  backBtn.style.cssText =
    'font-family:\'Press Start 2P\',monospace;font-size:8px;padding:10px 16px;' +
    'cursor:pointer;background:#000;color:var(--white);border:2px solid #333;';
  backBtn.textContent = '\u2190 BACK';
  backBtn.onclick = function() {
    SND.click();
    setGs(function(s) { return Object.assign({}, s, { screen: 'setup', team: GS.team, side: GS.side }); });
  };
  hdr.appendChild(backBtn);
  el.appendChild(hdr);

  // Content area
  var content = document.createElement('div');
  content.style.cssText =
    'flex:1;overflow-y:auto;padding:20px 16px 80px;display:flex;flex-direction:column;gap:10px;' +
    'position:relative;z-index:2;';

  // Page header
  var title = document.createElement('div');
  title.className = 'chrome-header';
  title.style.fontSize = '22px';
  title.textContent = '4. DRAFT YOUR SQUAD';
  content.appendChild(title);

  // State
  var selPrimary = null;
  var selSkill = {};

  // Primary section (QB or LB)
  var primaryLabel = document.createElement('div');
  primaryLabel.style.cssText =
    'font-family:"Press Start 2P",monospace;font-size:10px;color:#00ff88;' +
    'letter-spacing:1px;margin-bottom:8px;' +
    'border-bottom:1px solid #00ff8833;padding-bottom:6px;';
  primaryLabel.textContent = (isDef ? 'LINEBACKERS' : 'QUARTERBACK') + ' \u2014 PICK 1';
  content.appendChild(primaryLabel);

  var primaryGrid = document.createElement('div');
  primaryGrid.style.cssText = 'display:flex;gap:12px;margin-bottom:16px;';
  content.appendChild(primaryGrid);

  // Skill section
  var skillLabel = document.createElement('div');
  skillLabel.style.cssText =
    'font-family:"Press Start 2P",monospace;font-size:10px;color:#00ff88;' +
    'letter-spacing:1px;margin-bottom:8px;' +
    'border-bottom:1px solid #00ff8833;padding-bottom:6px;';
  skillLabel.textContent = (isDef ? 'DEFENSIVE BACKS' : 'SKILL PLAYERS') + ' \u2014 PICK 3';
  content.appendChild(skillLabel);

  var skillGrid = document.createElement('div');
  skillGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;';
  content.appendChild(skillGrid);


  function refreshPrimary() {
    primaryGrid.innerHTML = '';
    primaryPlayers.forEach(function(pl) {
      var isSel = selPrimary === pl.id;
      var card = buildPlayerCard(pl, team, GS.side, isSel, 'large');
      card.style.flex = '1';
      card.onclick = function() {
        SND.select();
        selPrimary = (selPrimary === pl.id) ? null : pl.id;
        refreshPrimary();
        refreshSkills();
        refreshGoBtn();
      };
      primaryGrid.appendChild(card);
    });
  }

  function refreshSkills() {
    skillGrid.innerHTML = '';
    var count = Object.keys(selSkill).length;
    skillPlayers.forEach(function(pl) {
      var isSel = !!selSkill[pl.id];
      var card = buildPlayerCard(pl, team, GS.side, isSel, 'small');
      if (!isSel && count >= 3) card.style.opacity = '0.3';
      card.onclick = function() {
        SND.select();
        if (selSkill[pl.id]) {
          delete selSkill[pl.id];
        } else if (Object.keys(selSkill).length < 3) {
          selSkill[pl.id] = true;
        }
        refreshSkills();
        refreshGoBtn();
      };
      skillGrid.appendChild(card);
    });
  }

  // Lock in button
  var goBtn = document.createElement('button');
  function refreshGoBtn() {
    var ready = selPrimary && Object.keys(selSkill).length === 3;
    goBtn.className = 'btn-blitz';
    goBtn.style.cssText =
      'width:100%;font-size:14px;margin-top:4px;' +
      (ready
        ? 'background:#ffcc00;border-color:#ffcc00;color:#000;box-shadow:6px 6px 0 #997a00, 0 0 30px rgba(255,204,0,0.4);'
        : 'opacity:0.35;');
    goBtn.disabled = !ready;
    goBtn.textContent = ready ? 'LOCK IN SQUAD \u2192' : 'SELECT 1 ' + (isDef ? 'LB' : 'QB') + ' + 3 ' + (isDef ? 'DBS' : 'SKILL');
    goBtn.onclick = ready ? function() {
      SND.snap();
      var roster = [selPrimary].concat(Object.keys(selSkill));
      setGs(function(s) {
        return Object.assign({}, s, {
          screen: 'card_draft',
          team: GS.team,
          side: GS.side,
          roster: roster
        });
      });
    } : null;
  }
  content.appendChild(goBtn);

  el.appendChild(content);

  // Initial render
  refreshPrimary();
  refreshSkills();
  refreshGoBtn();

  return el;
}
