import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, shuffle } from '../../state.js';
import { buildDraftProgress } from '../components/draftProgress.js';

function getPlayerImage(player, team, side) {
  var prefix = team.abbr.toLowerCase();
  var s = side === 'offense' ? 'off' : 'def';
  var pos = player.pos.toLowerCase();
  var lastName = player.name.split(' ').pop().toLowerCase();
  return '/img/players/' + prefix + '-' + s + '-' + pos + '-' + lastName + '.png';
}

/* Compact player card — no badge icon, no nickname, fits on one screen */
function buildPlayerCard(player, team, side, isSel, small) {
  var tierColor = '#CD7F32';
  if (player.ovr >= 85) tierColor = 'var(--a-gold)';
  else if (player.ovr >= 75) tierColor = '#aaa';

  var posSize = small ? '10px' : '14px';
  var nameSize = small ? '15px' : '22px';
  var ovrSize = small ? '20px' : '30px';
  var ovrLbl = small ? '6px' : '8px';
  var pad = small ? '5px 6px 0' : '8px 10px 0';

  var card = document.createElement('div');
  card.style.cssText =
    'background:var(--bg-surface);display:flex;flex-direction:column;' +
    'border:2px solid ' + (isSel ? '#00ff88' : tierColor + '44') + ';' +
    'border-radius:6px;padding:0;cursor:pointer;position:relative;overflow:hidden;' +
    'opacity:' + (isSel ? '1' : '0.8') + ';transition:all 0.15s ease;' +
    (isSel ? 'box-shadow:0 0 18px rgba(0,255,136,0.35), inset 0 0 12px rgba(0,255,136,0.08);' : '');

  if (isSel) {
    var bar = document.createElement('div');
    bar.style.cssText = 'position:absolute;top:0;left:50%;transform:translateX(-50%);width:' + (small?'20':'30') + 'px;height:3px;background:#00ff88;border-radius:0 0 3px 3px;z-index:3;';
    card.appendChild(bar);
  }

  // Header: POS + NAME left, OVR right
  var header = document.createElement('div');
  header.style.cssText =
    'display:flex;justify-content:space-between;align-items:flex-start;padding:' + pad + ';' +
    (isSel ? 'background:linear-gradient(180deg, rgba(0,255,136,0.1) 0%, transparent 100%);' : '');
  header.innerHTML =
    '<div>' +
      "<div style=\"font-family:'Courier New';font-size:" + posSize + ";font-weight:bold;color:#ff0040;letter-spacing:" + (small?'1':'2') + "px;line-height:1\">" + player.pos + "</div>" +
      "<div style=\"font-family:'Bebas Neue';font-size:" + nameSize + ";color:#fff;line-height:1;margin-top:" + (small?'1':'2') + "px\">" + player.name + "</div>" +
    '</div>' +
    '<div style="text-align:right">' +
      "<div style=\"font-family:'Courier New';font-size:" + ovrSize + ";font-weight:bold;color:" + tierColor + ";line-height:1;text-shadow:0 0 8px " + tierColor + "66\">" + player.ovr + "</div>" +
      "<div style=\"font-family:'Courier New';font-size:" + ovrLbl + ";font-weight:bold;color:" + tierColor + ";opacity:.7;letter-spacing:1px\">OVR</div>" +
    '</div>';
  card.appendChild(header);

  // Art (fills remaining card space)
  var artWrap = document.createElement('div');
  artWrap.style.cssText = 'position:relative;flex:1;min-height:0;overflow:hidden;';
  var imgSrc = getPlayerImage(player, team, side);
  artWrap.innerHTML =
    '<img src="' + imgSrc + '" alt="' + player.name + '" draggable="false" style="height:100%;width:100%;object-fit:contain;filter:drop-shadow(0 2px 6px rgba(0,0,0,.7))">' +
    '<div style="position:absolute;bottom:0;left:0;right:0;height:40%;background:linear-gradient(transparent,#0f0d1a);pointer-events:none"></div>';
  card.appendChild(artWrap);

  return card;
}

/* Explanation modal overlay */
function showDraftModal(isDef, onDismiss) {
  var root = document.getElementById('root');
  var ov = document.createElement('div');
  ov.style.cssText =
    'position:absolute;inset:0;z-index:100;background:rgba(0,0,0,0.85);' +
    'display:flex;align-items:center;justify-content:center;padding:20px;';

  var box = document.createElement('div');
  box.style.cssText =
    'background:var(--bg-surface);border:2px solid var(--a-gold);border-radius:10px;' +
    'padding:20px;max-width:320px;text-align:center;';

  var title = isDef ? 'DRAFT YOUR DEFENSE' : 'DRAFT YOUR OFFENSE';
  var body = isDef
    ? 'Pick 1 linebacker and 3 defensive backs.\nThese 4 players will defend against the opponent\'s offense.'
    : 'Pick 1 quarterback and 3 skill players.\nThese 4 players will be your offensive weapons.';

  box.innerHTML =
    "<div style=\"font-family:'Bebas Neue';font-size:28px;color:var(--a-gold);letter-spacing:2px;margin-bottom:10px\">" + title + "</div>" +
    "<div style=\"font-family:'Barlow Condensed';font-size:15px;color:#ccc;line-height:1.4;white-space:pre-line;margin-bottom:16px\">" + body + "</div>";

  var btn = document.createElement('button');
  btn.className = 'btn-blitz';
  btn.style.cssText = 'background:var(--a-gold);border-color:var(--f-purple);color:#000;box-shadow:6px 6px 0 var(--f-purple), 10px 10px 0 #000;font-size:12px;';
  btn.textContent = 'GOT IT';
  btn.onclick = function() { SND.click(); ov.remove(); if (onDismiss) onDismiss(); };
  box.appendChild(btn);
  ov.appendChild(box);
  ov.onclick = function(e) { if (e.target === ov) { ov.remove(); if (onDismiss) onDismiss(); } };
  root.appendChild(ov);
}

/* Roster review screen — all 8 cards fly in, vertically scrolling trophy room style */
function showRosterReview(team, offRoster, defRoster, onContinue) {
  var root = document.getElementById('root');
  var ov = document.createElement('div');
  ov.style.cssText =
    'position:absolute;inset:0;z-index:100;background:var(--bg);' +
    'display:flex;flex-direction:column;padding:0;overflow:hidden;';

  var sty = document.createElement('style');
  sty.textContent = '@keyframes draftFlyIn{from{opacity:0;transform:translateY(40px) scale(.8)}to{opacity:1;transform:none}}';
  ov.appendChild(sty);

  // Stepper at top
  ov.appendChild(buildDraftProgress(2));

  // Header (Fixed)
  var hdr = document.createElement('div');
  hdr.style.cssText = 'flex-shrink:0;text-align:center;padding:12px 14px 8px;background:rgba(0,0,0,0.5);border-bottom:2px solid var(--a-gold);';
  var squadHdr = document.createElement('div');
  squadHdr.className = 'chrome-header';
  squadHdr.style.cssText = 'font-size:28px;margin-bottom:0;';
  squadHdr.textContent = 'YOUR SQUAD';
  hdr.appendChild(squadHdr);
  ov.appendChild(hdr);

  // Scrollable container
  var scroll = document.createElement('div');
  scroll.style.cssText = 'flex:1;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:12px;';

  function buildSection(label, players, side, offset) {
    var lbl = document.createElement('div');
    lbl.style.cssText = "font-family:'Press Start 2P';font-size:8px;color:#00ff88;letter-spacing:1px;margin:8px 0 4px;";
    lbl.textContent = label;
    scroll.appendChild(lbl);

    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;';
    players.forEach(function(p, i) {
      var card = buildPlayerCard(p, team, side, true, false);
      card.style.height = '160px'; // Slightly smaller to fit mobile without too much scroll
      card.style.animation = 'draftFlyIn 0.4s ease-out ' + ((i + offset) * 0.08) + 's both';
      card.style.cursor = 'default';
      grid.appendChild(card);
    });
    scroll.appendChild(grid);
  }

  buildSection('OFFENSE', offRoster, 'offense', 0);
  buildSection('DEFENSE', defRoster, 'defense', 4);
  
  // Bottom padding for scroll
  var pad = document.createElement('div');
  pad.style.height = '20px';
  scroll.appendChild(pad);
  
  ov.appendChild(scroll);

  // Continue Button (Fixed at bottom)
  var btnBox = document.createElement('div');
  btnBox.style.cssText = 'padding:12px 14px;background:rgba(0,0,0,0.8);border-top:1px solid #333;';
  var btn = document.createElement('button');
  btn.className = 'btn-blitz';
  btn.style.cssText = 'background:var(--a-gold);border-color:var(--f-purple);color:#000;box-shadow:6px 6px 0 var(--f-purple), 10px 10px 0 #000;font-size:16px;width:100%;';
  btn.textContent = 'CONTINUE \u2192';
  btn.onclick = function() { SND.snap(); ov.remove(); onContinue(); };
  btnBox.appendChild(btn);
  ov.appendChild(btnBox);

  root.appendChild(ov);
}

/* ═══════════════════════════════════════════
   MAIN BUILD
   ═══════════════════════════════════════════ */
export function buildDraft() {
  var el = document.createElement('div');
  el.className = 'sup';
  el.style.cssText = 'height:100vh;display:flex;flex-direction:column;background:var(--bg);overflow:hidden;';

  var team = getTeam(GS.team);
  var isDef = GS.side === 'defense';
  var playerPool = isDef ? team.defPlayers : team.players;
  var primaryPlayers = playerPool.filter(function(p) { return p.cat === (isDef ? 'lb' : 'qb'); });
  var skillPlayers = playerPool.filter(function(p) { return p.cat === 'skill'; });

  // Progress Bar
  el.appendChild(buildDraftProgress(2));

  // Header bar
  var hdr = document.createElement('div');
  hdr.style.cssText =
    'background:rgba(0,0,0,0.5);padding:8px 14px;display:flex;justify-content:space-between;' +
    'align-items:center;flex-shrink:0;border-bottom:3px solid ' + team.accent + ';';
  var schemeName = isDef ? team.defStyle : team.style;
  var hdrTitle = document.createElement('div');
  hdrTitle.style.cssText =
    'display:flex;align-items:baseline;gap:0;font-style:italic;transform:skewX(-10deg);';
  var hdrName = document.createElement('span');
  hdrName.style.cssText =
    "font-family:'Teko',sans-serif;font-weight:700;font-size:32px;color:var(--a-gold);" +
    "letter-spacing:3px;text-shadow:2px 2px 0 rgba(0,0,0,0.9),0 0 12px rgba(255,204,0,0.3);";
  hdrName.textContent = 'TORCH';
  var hdrSub = document.createElement('span');
  hdrSub.style.cssText =
    "font-family:'Teko',sans-serif;font-weight:500;font-size:22px;color:var(--white);" +
    "letter-spacing:1px;margin-left:6px;";
  hdrSub.textContent = '\u00b7 PLAY NOW';
  hdrTitle.append(hdrName, hdrSub);
  hdr.appendChild(hdrTitle);

  var backBtn = document.createElement('button');
  backBtn.style.cssText = "font-family:'Press Start 2P';font-size:10px;padding:10px 16px;cursor:pointer;background:#000;color:var(--white);border:2px solid #333;";
  backBtn.textContent = '\u2190 BACK';
  backBtn.onclick = function() {
    SND.click();
    setGs(function(s) {
      if (!isDef) {
        return Object.assign({}, s, { screen:'setup', side:null, roster:null, offRoster:null, offHand:null });
      } else {
        return Object.assign({}, s, { screen:'draft', side:'offense', roster:null });
      }
    });
  };
  hdr.appendChild(backBtn);
  el.appendChild(hdr);

  // Content — fills all remaining space, no scroll
  var content = document.createElement('div');
  content.style.cssText = 'flex:1;display:flex;flex-direction:column;padding:10px 14px;overflow:hidden;';

  // Title row with auto-pick inline
  var titleRow = document.createElement('div');
  titleRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;flex-shrink:0;margin-bottom:6px;';
  var title = document.createElement('div');
  title.className = 'chrome-header';
  title.style.cssText = 'font-size:22px;margin-bottom:0;';
  title.textContent = isDef ? 'PICK DEFENSE ROSTER' : 'PICK OFFENSE ROSTER';
  var autoBtn = document.createElement('button');
  autoBtn.style.cssText = "font-family:'Press Start 2P';font-size:6px;color:var(--cyan);background:none;border:1px solid var(--cyan);padding:5px 8px;cursor:pointer;border-radius:12px;opacity:.7;";
  autoBtn.textContent = '\u26A1 AUTO-SELECT';
  titleRow.append(title, autoBtn);
  content.appendChild(titleRow);

  // State
  var selPrimary = null;
  var selSkill = {};

  // Primary label
  var primaryLabel = document.createElement('div');
  primaryLabel.style.cssText = "display:flex;align-items:center;font-family:'Press Start 2P';font-size:8px;color:#00ff88;letter-spacing:1px;flex-shrink:0;margin-bottom:4px;";
  function refreshPrimaryLabel() {
    var dot = selPrimary ? '●' : '○';
    primaryLabel.innerHTML = (isDef ? 'LINEBACKER' : 'QUARTERBACK') + ' \u2014 PICK 1 <span style="font-size:18px;margin-left:8px;line-height:0;display:inline-flex;align-items:center;height:10px;vertical-align:middle;transform:translateY(-4px)">' + dot + '</span>';
  }
  refreshPrimaryLabel();
  content.appendChild(primaryLabel);

  // Primary grid — takes ~30% of remaining space
  var primaryGrid = document.createElement('div');
  primaryGrid.style.cssText = 'display:flex;gap:8px;flex:3;min-height:0;margin-bottom:8px;';
  content.appendChild(primaryGrid);

  // Skill label
  var skillLabel = document.createElement('div');
  skillLabel.style.cssText = "display:flex;align-items:center;font-family:'Press Start 2P';font-size:8px;color:#00ff88;letter-spacing:1px;flex-shrink:0;margin-bottom:4px;";
  function refreshSkillLabel() {
    var count = Object.keys(selSkill).length;
    var dots = '';
    for (var i=0; i<3; i++) dots += (i < count ? '●' : '○');
    skillLabel.innerHTML = (isDef ? 'DEFENSIVE BACKS' : 'SKILL PLAYERS') + ' \u2014 PICK 3 <span style="font-size:18px;margin-left:8px;letter-spacing:4px;line-height:0;display:inline-flex;align-items:center;height:10px;vertical-align:middle;transform:translateY(-4px)">' + dots + '</span>';
  }
  refreshSkillLabel();
  content.appendChild(skillLabel);

  // Skill grid — takes ~60% of remaining space, rows stretch to fill
  var skillGrid = document.createElement('div');
  skillGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:8px;flex:6;min-height:0;';
  content.appendChild(skillGrid);

  function refreshPrimary() {
    primaryGrid.innerHTML = '';
    primaryPlayers.forEach(function(pl) {
      var isSel = selPrimary === pl.id;
      var card = buildPlayerCard(pl, team, GS.side, isSel);
      card.style.flex = '1';
      card.onclick = function() {
        SND.select();
        selPrimary = (selPrimary === pl.id) ? null : pl.id;
        refreshPrimary(); refreshSkills(); refreshGoBtn(); refreshPrimaryLabel();
      };
      primaryGrid.appendChild(card);
    });
  }

  function refreshSkills() {
    skillGrid.innerHTML = '';
    var count = Object.keys(selSkill).length;
    skillPlayers.forEach(function(pl) {
      var isSel = !!selSkill[pl.id];
      var card = buildPlayerCard(pl, team, GS.side, isSel);
      if (!isSel && count >= 3) card.style.opacity = '0.3';
      card.onclick = function() {
        SND.select();
        if (selSkill[pl.id]) { delete selSkill[pl.id]; }
        else if (Object.keys(selSkill).length < 3) { selSkill[pl.id] = true; }
        refreshSkills(); refreshGoBtn(); refreshSkillLabel();
      };
      skillGrid.appendChild(card);
    });
  }

  autoBtn.onclick = function() {
    SND.click();
    selPrimary = primaryPlayers.reduce(function(best, p) { return p.ovr > best.ovr ? p : best; }).id;
    var topSkills = skillPlayers.slice().sort(function(a,b) { return b.ovr - a.ovr; }).slice(0, 3);
    selSkill = {};
    topSkills.forEach(function(s) { selSkill[s.id] = true; });
    refreshPrimary(); refreshSkills(); refreshGoBtn(); refreshPrimaryLabel(); refreshSkillLabel();
  };

  // Go button — directly below cards
  var goBtn = document.createElement('button');
  goBtn.style.cssText = 'flex-shrink:0;margin-top:6px;';
  function refreshGoBtn() {
    var ready = selPrimary && Object.keys(selSkill).length === 3;
    goBtn.className = 'btn-blitz';
    goBtn.disabled = !ready;
    goBtn.style.cssText += 'width:100%;font-size:14px;' +
      (ready
        ? 'background:var(--a-gold);border-color:var(--f-purple);color:#000;box-shadow:6px 6px 0 var(--f-purple), 10px 10px 0 #000;'
        : 'background:#555;border-color:var(--f-purple);color:var(--f-purple);box-shadow:6px 6px 0 var(--f-purple), 10px 10px 0 #000;opacity:0.8;');

    if (!ready) {
      goBtn.textContent = 'CHOOSE YOUR PLAYERS';
    } else {
      goBtn.textContent = isDef ? 'LOCK IN DEFENSE \u2192' : 'LOCK IN OFFENSE \u2192';
    }

    goBtn.onclick = ready ? function() {
      SND.snap();
      var roster = [selPrimary].concat(Object.keys(selSkill));

      if (!isDef) {
        // Offense locked — go to defense player draft
        setGs(function(s) {
          return Object.assign({}, s, {
            screen: 'draft', team: GS.team, side: 'defense',
            offRoster: roster, roster: null
          });
        });
      } else {
        // Defense locked — show full roster review, then go to play drafts
        var offPlayers = (GS.offRoster || []).map(function(id) {
          return team.players.find(function(p) { return p.id === id; });
        }).filter(Boolean);
        var defPlayers = roster.map(function(id) {
          return team.defPlayers.find(function(p) { return p.id === id; });
        }).filter(Boolean);

        showRosterReview(team, offPlayers, defPlayers, function() {
          setGs(function(s) {
            return Object.assign({}, s, {
              screen: 'card_draft', team: GS.team, side: 'offense',
              defRoster: roster, roster: null
            });
          });
        });
      }
    } : null;
  }
  content.appendChild(goBtn);
  el.appendChild(content);

  refreshPrimary();
  refreshSkills();
  refreshGoBtn();

  return el;
}
