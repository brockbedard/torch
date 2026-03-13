import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, getOffCards, getDefCards, shuffle } from '../../state.js';
import { showCardIntel } from '../components/intel.js';

export function buildCardDraft() {
  var el = document.createElement('div');
  el.className = 'sup';
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:var(--bg);';

  var team = getTeam(GS.team);
  var isOff = GS.side === 'offense';
  var pool = isOff ? getOffCards(GS.team) : getDefCards(GS.team);

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
    'font-family:\'Press Start 2P\',monospace;font-size:8px;padding:10px 16px;' +
    'cursor:pointer;background:#000;color:var(--white);border:2px solid #333;';
  backBtn.textContent = '\u2190 BACK';
  backBtn.onclick = function() {
    SND.click();
    setGs(function(s) {
      return Object.assign({}, s, { screen: 'draft', team: GS.team, side: GS.side });
    });
  };
  hdr.appendChild(backBtn);
  el.appendChild(hdr);

  // Content
  var content = document.createElement('div');
  content.style.cssText =
    'flex:1;overflow-y:auto;padding:20px 16px;display:flex;flex-direction:column;gap:14px;' +
    'position:relative;z-index:2;';

  var title = document.createElement('div');
  title.className = 'chrome-header';
  title.style.fontSize = '22px';
  title.textContent = '4. DRAFT GAMEPLAN';
  content.appendChild(title);

  var counter = document.createElement('div');
  counter.style.cssText =
    'font-family:"Press Start 2P",monospace;font-size:10px;text-align:center;' +
    'color:var(--a-gold);margin-bottom:6px;';
  content.appendChild(counter);

  var selected = {};

  var cardGrid = document.createElement('div');
  cardGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:12px;';

  function typeColor(card) {
    if (card.type === 'run') return { border: 'var(--orange)', bg: 'rgba(255,77,0,0.08)' };
    if (card.type === 'pass') return { border: 'var(--cyan)', bg: 'rgba(0,234,255,0.08)' };
    if (card.type === 'agg') return { border: 'var(--p-red)', bg: 'rgba(255,0,64,0.08)' };
    return { border: 'var(--l-green)', bg: 'rgba(0,255,68,0.08)' };
  }

  function refreshCards() {
    cardGrid.innerHTML = '';
    var count = Object.keys(selected).length;
    counter.textContent = count + ' / 5 SELECTED';

    pool.forEach(function(card, idx) {
      var isSel = !!selected[card.id + '_' + idx];
      var tc = typeColor(card);

      var cel = document.createElement('div');
      cel.style.cssText =
        'background:' + (isSel ? tc.bg : '#12101e') + ';' +
        'border:2px solid ' + (isSel ? tc.border : 'rgba(255,255,255,0.15)') + ';' +
        'border-radius:6px;padding:14px 10px;text-align:center;position:relative;' +
        'overflow:hidden;cursor:pointer;display:flex;flex-direction:column;' +
        'align-items:center;justify-content:center;min-height:100px;' +
        'transition:all 0.15s ease;' +
        (isSel ? 'box-shadow:0 0 16px ' + tc.border + '33;opacity:1;' : 'opacity:0.7;');

      if (!isSel && count >= 5) cel.style.opacity = '0.3';

      // Selected bar
      if (isSel) {
        var bar = document.createElement('div');
        bar.style.cssText =
          'position:absolute;top:0;left:50%;transform:translateX(-50%);' +
          'width:36px;height:3px;background:' + tc.border + ';border-radius:0 0 3px 3px;';
        cel.appendChild(bar);
      }

      // Type badge
      var typeBadge = document.createElement('div');
      typeBadge.style.cssText =
        'font-family:"Press Start 2P",monospace;font-size:8px;color:' + tc.border + ';' +
        'margin-bottom:8px;letter-spacing:1px;';
      typeBadge.textContent = card.type.toUpperCase();

      // Icon
      var iconEl = document.createElement('div');
      iconEl.style.cssText = 'font-size:28px;margin-bottom:8px;';
      iconEl.textContent = card.icon;

      // Name
      var nameEl = document.createElement('div');
      nameEl.style.cssText =
        'font-family:"Bebas Neue",sans-serif;font-size:18px;line-height:1;color:#fff;';
      nameEl.textContent = card.name;

      // Help button
      var helpBtn = document.createElement('div');
      helpBtn.style.cssText =
        'position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;' +
        'border:1px solid ' + tc.border + ';color:' + tc.border + ';' +
        'font-size:10px;display:flex;align-items:center;justify-content:center;' +
        'font-weight:bold;cursor:pointer;font-family:"Press Start 2P",monospace;';
      helpBtn.textContent = '?';
      helpBtn.onclick = function(e) {
        e.stopPropagation();
        SND.click();
        showCardIntel(card, GS.team, GS.side);
      };

      cel.appendChild(helpBtn);
      cel.append(typeBadge, iconEl, nameEl);

      cel.onclick = function() {
        SND.click();
        var key = card.id + '_' + idx;
        if (selected[key]) delete selected[key];
        else if (Object.keys(selected).length < 5) selected[key] = card;
        refreshCards();
        refreshGoBtn();
      };

      cardGrid.appendChild(cel);
    });
  }

  content.appendChild(cardGrid);

  // Buttons
  var btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:12px;padding:20px 0;';

  var autoBtn = document.createElement('button');
  autoBtn.className = 'btn-blitz';
  autoBtn.style.cssText +=
    'flex:1;font-size:10px;border-color:var(--white);color:#000;' +
    'background:var(--white);box-shadow:4px 4px 0 #000;';
  autoBtn.textContent = 'AUTO DRAFT';
  autoBtn.onclick = function() {
    SND.draft();
    selected = {};
    var indices = shuffle(pool.map(function(_, i) { return i; })).slice(0, 5);
    indices.forEach(function(i) { selected[pool[i].id + '_' + i] = pool[i]; });
    refreshCards();
    refreshGoBtn();
  };

  var goBtn = document.createElement('button');
  function refreshGoBtn() {
    var ready = Object.keys(selected).length === 5;
    goBtn.className = 'btn-blitz';
    goBtn.style.cssText =
      'flex:1.5;font-size:14px;' +
      (ready
        ? 'background:#ffcc00;border-color:#ffcc00;color:#000;box-shadow:6px 6px 0 #997a00, 0 0 30px rgba(255,204,0,0.4);'
        : 'opacity:0.35;');
    goBtn.disabled = !ready;
    goBtn.textContent = ready ? 'START MATCH \u2192' : 'PICK 5 PLAYS';
    goBtn.onclick = ready ? function() {
      SND.snap();
      var hand = Object.keys(selected).map(function(k) { return selected[k]; });
      setGs(function(s) {
        return Object.assign({}, s, {
          screen: 'play',
          team: GS.team,
          side: GS.side,
          roster: GS.roster,
          hand: hand
        });
      });
    } : null;
  }

  btnRow.append(autoBtn, goBtn);
  content.appendChild(btnRow);
  el.appendChild(content);

  refreshCards();
  refreshGoBtn();

  return el;
}
