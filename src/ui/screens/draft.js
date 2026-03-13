import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, shuffle } from '../../state.js';

function getPlayerImage(player, team, side) {
  var prefix = team.abbr.toLowerCase();
  var s = side === 'offense' ? 'off' : 'def';
  var pos = player.pos.toLowerCase();
  var lastName = player.name.split(' ').pop().toLowerCase();
  return '/img/players/' + prefix + '-' + s + '-' + pos + '-' + lastName + '.png';
}

function buildPlayerCard(player, team, side, isSel, size) {
  var isLarge = size === 'large';
  var artH = isLarge ? 140 : 110;
  var nameSize = isLarge ? 19 : 16;
  var imgSrc = getPlayerImage(player, team, side);
  var names = player.name.split(' ');
  var firstName = names[0];
  var lastName = names.slice(1).join(' ');

  var card = document.createElement('div');
  card.style.cssText =
    'background:linear-gradient(180deg, #0a1a0a 0%, #050d05 60%, #020802 100%);' +
    'border:2px solid ' + (isSel ? '#00ff88' : '#00ff8844') + ';' +
    'border-radius:6px;' +
    'padding:0;' +
    'cursor:pointer;' +
    'position:relative;' +
    'overflow:hidden;' +
    'opacity:' + (isSel ? '1' : '0.6') + ';' +
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
    'font-family:"Courier New",monospace;font-size:14px;font-weight:bold;' +
    'color:#00ff88;letter-spacing:2px;line-height:1;';
  posEl.textContent = player.pos;

  var nameEl = document.createElement('div');
  nameEl.style.cssText =
    'font-family:"Bebas Neue",sans-serif;font-size:' + nameSize + 'px;' +
    'color:#ffffff;line-height:1.05;margin-top:2px;';
  nameEl.innerHTML = firstName + '<br>' + lastName;

  leftCol.appendChild(posEl);
  leftCol.appendChild(nameEl);

  // Right: OVR
  var rightCol = document.createElement('div');
  rightCol.style.cssText = 'text-align:right;display:flex;flex-direction:column;align-items:flex-end;';

  var ovrNum = document.createElement('div');
  ovrNum.style.cssText =
    'font-family:"Courier New",monospace;font-size:' + (isLarge ? 36 : 30) + 'px;' +
    'font-weight:bold;color:#00ff88;line-height:1;' +
    'text-shadow:0 0 10px rgba(0,255,136,0.6), 0 0 20px rgba(0,255,136,0.3);';
  ovrNum.textContent = player.ovr;

  var ovrLabel = document.createElement('div');
  ovrLabel.style.cssText =
    'font-family:"Courier New",monospace;font-size:7px;font-weight:bold;' +
    'color:#00ff8888;letter-spacing:2px;line-height:1;margin-top:1px;';
  ovrLabel.textContent = 'OVR';

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
    'background:linear-gradient(to bottom, transparent 0%, #020802 100%);pointer-events:none;';

  artWrap.appendChild(img);
  artWrap.appendChild(fade);
  card.appendChild(artWrap);

  // Footer
  var footer = document.createElement('div');
  footer.style.cssText =
    'padding:0 10px 8px 10px;position:relative;z-index:2;';

  var nickEl = document.createElement('div');
  nickEl.style.cssText =
    'font-family:"Courier New",monospace;font-size:' + (isLarge ? 11 : 10) + 'px;' +
    'color:#ffcc00;font-weight:bold;letter-spacing:1px;line-height:1;' +
    'text-shadow:0 0 6px rgba(255,204,0,0.4);';
  nickEl.textContent = '"' + player.nick + '"';

  var descEl = document.createElement('div');
  descEl.style.cssText =
    'font-family:"Courier New",monospace;font-size:7px;' +
    'color:#00ff8866;line-height:1.3;margin-top:3px;' +
    'overflow:hidden;white-space:nowrap;text-overflow:ellipsis;';
  descEl.textContent = player.desc;

  footer.appendChild(nickEl);
  footer.appendChild(descEl);
  card.appendChild(footer);

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
  hdr.innerHTML =
    '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:28px;color:var(--a-gold);' +
    'letter-spacing:2px;font-style:italic;transform:skewX(-10deg);' +
    'text-shadow:2px 2px 0 #000, 0 0 10px var(--a-gold);cursor:pointer;">\uD83D\uDD25 TORCH</div>';
  hdr.onclick = function() { setGs(null); };

  var backBtn = document.createElement('button');
  backBtn.style.cssText =
    'font-family:\'Press Start 2P\',monospace;font-size:6px;padding:6px 10px;' +
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
    'flex:1;overflow-y:auto;padding:20px 16px;display:flex;flex-direction:column;gap:10px;' +
    'position:relative;z-index:2;';

  // Page header
  var stepLabel = document.createElement('div');
  stepLabel.style.cssText =
    'font-family:"Press Start 2P",monospace;font-size:7px;color:#00ff88;' +
    'text-align:center;letter-spacing:1px;margin-bottom:2px;';
  stepLabel.textContent = 'STEP 5';
  content.appendChild(stepLabel);

  var title = document.createElement('div');
  title.className = 'chrome-header';
  title.style.cssText +=
    'font-size:26px;text-align:center;display:block;margin-bottom:4px;';
  title.textContent = 'DRAFT YOUR SQUAD';
  content.appendChild(title);

  var subtitle = document.createElement('div');
  subtitle.style.cssText =
    'font-family:"Courier New",monospace;font-size:9px;color:#888;' +
    'text-align:center;letter-spacing:1px;margin-bottom:14px;';
  subtitle.textContent = team.name + ' \u2022 ' + (isDef ? 'DEFENSE' : 'OFFENSE');
  content.appendChild(subtitle);

  // State
  var selPrimary = null;
  var selSkill = {};

  // Primary section (QB or LB)
  var primaryLabel = document.createElement('div');
  primaryLabel.style.cssText =
    'font-family:"Press Start 2P",monospace;font-size:8px;color:#00ff88;' +
    'letter-spacing:1px;margin-bottom:8px;' +
    'border-bottom:1px solid #00ff8833;padding-bottom:6px;';
  primaryLabel.textContent = (isDef ? 'LINEBACKER' : 'QUARTERBACK') + ' \u2014 PICK 1';
  content.appendChild(primaryLabel);

  var primaryGrid = document.createElement('div');
  primaryGrid.style.cssText = 'display:flex;gap:12px;margin-bottom:16px;';
  content.appendChild(primaryGrid);

  // Skill section
  var skillLabel = document.createElement('div');
  skillLabel.style.cssText =
    'font-family:"Press Start 2P",monospace;font-size:8px;color:#00ff88;' +
    'letter-spacing:1px;margin-bottom:8px;' +
    'border-bottom:1px solid #00ff8833;padding-bottom:6px;';
  skillLabel.textContent = 'SKILL PLAYERS \u2014 PICK 3';
  content.appendChild(skillLabel);

  var skillGrid = document.createElement('div');
  skillGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;';
  content.appendChild(skillGrid);

  // Counter row
  var counterRow = document.createElement('div');
  counterRow.style.cssText =
    'display:flex;align-items:center;justify-content:center;gap:12px;' +
    'font-family:"Press Start 2P",monospace;font-size:8px;color:#aaa;' +
    'padding:8px 0;';
  content.appendChild(counterRow);

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
        refreshCounter();
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
        refreshCounter();
        refreshGoBtn();
      };
      skillGrid.appendChild(card);
    });
  }

  function refreshCounter() {
    var qbCount = selPrimary ? 1 : 0;
    var skCount = Object.keys(selSkill).length;
    var priAbbr = isDef ? 'LB' : 'QB';

    counterRow.innerHTML = '';

    // QB/LB indicator
    var qbDot = document.createElement('span');
    qbDot.style.cssText =
      'display:inline-block;width:6px;height:6px;border-radius:50%;' +
      'background:' + (qbCount ? '#00ff88' : '#333') + ';margin-right:4px;vertical-align:middle;';
    var qbText = document.createElement('span');
    qbText.style.color = qbCount ? '#00ff88' : '#666';
    qbText.textContent = priAbbr + ': ' + qbCount + '/1';

    var sep = document.createElement('span');
    sep.style.color = '#333';
    sep.textContent = ' \u00b7 ';

    // Skill indicators
    var skDots = document.createElement('span');
    skDots.style.cssText = 'margin-right:4px;';
    for (var i = 0; i < 3; i++) {
      var d = document.createElement('span');
      d.style.cssText =
        'display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:2px;' +
        'background:' + (i < skCount ? '#00ff88' : '#333') + ';vertical-align:middle;';
      skDots.appendChild(d);
    }
    var skText = document.createElement('span');
    skText.style.color = skCount === 3 ? '#00ff88' : '#666';
    skText.textContent = 'SKILL: ' + skCount + '/3';

    counterRow.appendChild(qbDot);
    counterRow.appendChild(qbText);
    counterRow.appendChild(sep);
    counterRow.appendChild(skDots);
    counterRow.appendChild(skText);
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
    goBtn.textContent = ready ? 'LOCK IN SQUAD \u2192' : 'PICK YOUR SQUAD';
    goBtn.onclick = ready ? function() {
      SND.snap();
      var roster = [selPrimary].concat(Object.keys(selSkill));
      setGs(function(s) {
        return Object.assign({}, s, {
          screen: 'under_construction',
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
  refreshCounter();
  refreshGoBtn();

  return el;
}
