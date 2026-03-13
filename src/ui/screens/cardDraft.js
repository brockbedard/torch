import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, getOffCards, getDefCards, shuffle } from '../../state.js';
import { playSvg } from '../../data/playDiagrams.js';

var HIGH_RISK = ['four_verts','go_route','y_corner','zero_cov','db_blitz'];
var MED_RISK = ['mesh','slant','overload','fire_zone','a_gap_mug','edge_crash','pa_post','pa_flat','man_press','zone_drop','triple_option','zone_read'];

function getRisk(id) {
  if (HIGH_RISK.indexOf(id) >= 0) return 'high';
  if (MED_RISK.indexOf(id) >= 0) return 'med';
  return 'low';
}

function catLabel(card) {
  var c = card.cat || '';
  if (/Short/i.test(c)) return 'SHORT';
  if (/Quick/i.test(c)) return 'QUICK';
  if (/Deep|Bomb/i.test(c)) return 'DEEP';
  if (/Screen/i.test(c)) return 'SCREEN';
  if (/Option/i.test(c)) return 'OPTION';
  if (/Power/i.test(c)) return 'POWER';
  if (/Inside|Outside/i.test(c) || card.type === 'run') return 'RUN';
  if (/Pressure|Exotic/i.test(c)) return 'PRESSURE';
  if (/Zone Blitz/i.test(c)) return 'PRESSURE';
  if (/Blitz/i.test(c)) return 'BLITZ';
  if (/Zone|Split|Shell/i.test(c)) return 'ZONE';
  if (/Man/i.test(c)) return 'BLITZ';
  if (/Hybrid/i.test(c)) return 'HYBRID';
  if (/Assignment/i.test(c)) return 'ZONE';
  if (/Run Defense/i.test(c)) return 'RUN';
  if (/Max Depth/i.test(c)) return 'ZONE';
  return 'RUN';
}

var CAT_COLORS = {
  SHORT: '#00ff44', QUICK: '#00eaff', DEEP: '#ff0040', RUN: '#ff4d00',
  SCREEN: '#ff66aa', OPTION: '#ff4d00', POWER: '#ff4d00',
  BLITZ: '#ff0040', ZONE: '#00ccaa', PRESSURE: '#ffcc00', HYBRID: '#bb00ff',
};

var SHORT_DESC = {
  mesh: 'Man coverage killer',
  four_verts: 'Stretch them deep',
  shallow_cross: 'Quick and reliable',
  y_corner: 'Beats Cover 2',
  stick: 'Safe short money',
  slant: 'Timing route, quick hitter',
  go_route: 'One-on-one deep shot',
  bubble_screen: 'Fast lateral, blockers lead',
  draw: 'Fake pass, run it',
  qb_sneak: 'Short yardage push',
  triple_option: 'Give, keep, or pitch',
  midline: 'Fullback dive inside',
  rocket_toss: 'Speed to the edge',
  trap: 'Pulling guard, deceptive',
  qb_keeper: 'QB turns the corner',
  power: 'Downhill and physical',
  zone_read: 'Read the end, decide',
  pa_post: 'Fake run, throw deep',
  pa_flat: 'Fake dive, dump short',
  rip_liz: 'Pattern-match Cover 3',
  cov4_match: 'Quarters, stop the run',
  mod: 'Two-high vanilla look',
  cover_6: 'Split-field coverage',
  bracket: 'Double their best weapon',
  skinny: 'Trips check, stop overloads',
  meg: 'Man up, win matchups',
  gap_int: 'Every gap accounted for',
  fire_zone: 'Send five, drop three',
  robber: 'Jump the route, gamble',
  overload: 'Numbers to one side',
  db_blitz: 'Corner and safety blitz',
  zero_cov: 'All-out, no safety help',
  a_gap_mug: 'A-gap mind games',
  edge_crash: 'Speed rush both edges',
  cov2_buc: 'Tampa 2, seam dropper',
  man_press: 'Jam at the line',
  zone_drop: 'Show blitz, drop edge',
  spy: 'Shadow the quarterback',
  prevent: 'Nothing over the top',
};

function buildPlayCard(card, isSel, staggerIdx) {
  var cat = catLabel(card);
  var catColor = CAT_COLORS[cat] || '#aaa';
  var risk = getRisk(card.id);

  var cel = document.createElement('div');
  cel.style.cssText =
    'background:var(--bg-surface);' +
    'border:2px solid ' + (isSel ? '#00ff88' : '#00ff8833') + ';' +
    'border-radius:6px;padding:0;position:relative;overflow:hidden;' +
    'cursor:pointer;display:flex;flex-direction:column;' +
    'transition:all 0.15s ease;' +
    'opacity:' + (isSel ? '1' : '0.55') + ';' +
    (isSel
      ? 'box-shadow:0 0 18px rgba(0,255,136,0.35), inset 0 0 12px rgba(0,255,136,0.08);transform:translateY(-4px);'
      : 'transform:translateY(0);');

  // Entrance animation
  cel.style.animation = 'cardSlideUp 0.35s ease-out ' + (staggerIdx * 0.05) + 's both';

  // Selected bar
  if (isSel) {
    var bar = document.createElement('div');
    bar.style.cssText =
      'position:absolute;top:0;left:50%;transform:translateX(-50%);' +
      'width:36px;height:3px;background:#00ff88;border-radius:0 0 3px 3px;z-index:3;';
    cel.appendChild(bar);
  }

  // Header row
  var header = document.createElement('div');
  header.style.cssText =
    'display:flex;justify-content:space-between;align-items:center;' +
    'padding:10px 10px 6px 10px;position:relative;z-index:2;' +
    (isSel ? 'background:linear-gradient(180deg, rgba(0,255,136,0.1) 0%, transparent 100%);' : '');

  var nameEl = document.createElement('div');
  nameEl.style.cssText =
    'font-family:"Bebas Neue",sans-serif;font-size:16px;color:#fff;line-height:1.1;flex:1;margin-right:6px;';
  nameEl.textContent = card.name;

  var badge = document.createElement('div');
  badge.style.cssText =
    'font-family:"Courier New",monospace;font-size:7px;font-weight:bold;' +
    'color:' + catColor + ';border:1px solid ' + catColor + '44;' +
    'padding:2px 5px;border-radius:8px;letter-spacing:0.5px;white-space:nowrap;flex-shrink:0;';
  badge.textContent = cat;

  header.append(nameEl, badge);
  cel.appendChild(header);

  // Diagram area — taller, zoomed in
  var diagWrap = document.createElement('div');
  diagWrap.style.cssText =
    'height:105px;display:flex;align-items:center;justify-content:center;' +
    'background:radial-gradient(ellipse at center, #1a1030 0%, #0a0818 100%);' +
    'margin:0 8px;border-radius:4px;overflow:hidden;position:relative;';

  var svgHTML = playSvg(card.id, '#00ff88');
  var animId = 'anim_' + card.id + '_' + staggerIdx;
  // Tighter viewBox to zoom in, thicker strokes, bigger dots
  var animSvg = svgHTML
    .replace('viewBox="0 0 60 50"', 'viewBox="4 4 52 44"')
    .replace('width="60" height="50"', 'width="100%" height="100%" preserveAspectRatio="xMidYMid meet"')
    .replace(/<line /g, '<line class="' + animId + '-route" ')
    .replace(/<polyline /g, '<polyline class="' + animId + '-route" ')
    .replace(/stroke-width="1.5"/g, 'stroke-width="2.5"')
    .replace(/stroke-width="1"/g, 'stroke-width="2"')
    .replace(/r="3.5"/g, 'r="5"')
    .replace(/r="2.5"/g, 'r="4"')
    .replace(/stroke="#00ff88"/g, 'stroke="#ffcc00"')
    .replace(/fill="#00ff88"/g, 'fill="#00ff88"');

  diagWrap.innerHTML = animSvg;

  // Route draw animation
  var styleTag = document.createElement('style');
  styleTag.textContent =
    '.' + animId + '-route {' +
    '  stroke-dasharray: 120;' +
    '  stroke-dashoffset: 120;' +
    '  animation: routeDraw 0.5s ease-out ' + (staggerIdx * 0.05 + 0.3) + 's forwards;' +
    '}';
  diagWrap.appendChild(styleTag);

  cel.appendChild(diagWrap);

  // Risk/Reward meter
  var meterWrap = document.createElement('div');
  meterWrap.style.cssText = 'padding:6px 10px 4px;';

  var meterTrack = document.createElement('div');
  meterTrack.style.cssText =
    'height:8px;border-radius:4px;background:rgba(255,255,255,0.06);overflow:hidden;position:relative;';

  var meterFill = document.createElement('div');
  var riskLabel = document.createElement('div');
  riskLabel.style.cssText = 'font-family:"Courier New",monospace;font-size:9px;font-weight:bold;letter-spacing:0.5px;margin-top:3px;';

  if (risk === 'high') {
    meterFill.style.cssText =
      'position:absolute;left:0;top:0;height:100%;width:0;border-radius:4px;' +
      'background:linear-gradient(90deg, #ff0040, #00ff44 50%, #ff0040);' +
      'animation:meterFill90 0.6s ease-out ' + (staggerIdx * 0.05 + 0.4) + 's forwards;';
    riskLabel.style.color = '#ff0040';
    riskLabel.textContent = 'HIGH VOLTAGE';
  } else if (risk === 'med') {
    meterFill.style.cssText =
      'position:absolute;left:0;top:0;height:100%;width:0;border-radius:4px;' +
      'background:linear-gradient(90deg, #ff4d00, #00ff44);' +
      'animation:meterFill60 0.6s ease-out ' + (staggerIdx * 0.05 + 0.4) + 's forwards;';
    riskLabel.style.color = '#ff4d00';
    riskLabel.textContent = 'CALCULATED';
  } else {
    meterFill.style.cssText =
      'position:absolute;left:30%;top:0;height:100%;width:0;border-radius:4px;' +
      'background:#00ff44;' +
      'animation:meterFill35 0.6s ease-out ' + (staggerIdx * 0.05 + 0.4) + 's forwards;';
    riskLabel.style.color = '#00ff44';
    riskLabel.textContent = 'STEADY HAND';
  }

  meterTrack.appendChild(meterFill);
  meterWrap.append(meterTrack, riskLabel);
  cel.appendChild(meterWrap);

  // Footer — short punchy description
  var footer = document.createElement('div');
  footer.style.cssText =
    'padding:4px 10px 10px;font-family:"Courier New",monospace;font-size:9px;' +
    'color:var(--muted);line-height:1.3;opacity:0.7;';
  footer.textContent = SHORT_DESC[card.id] || card.desc;
  cel.appendChild(footer);

  return cel;
}

export function buildCardDraft() {
  var el = document.createElement('div');
  el.className = 'sup';
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:var(--bg);';

  var team = getTeam(GS.team);
  var isOff = GS.side === 'offense';
  var pool = isOff ? getOffCards(GS.team) : getDefCards(GS.team);
  var schemeName = isOff ? team.style : team.defStyle;

  // Inject animations
  var styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes cardSlideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }' +
    '@keyframes routeDraw { to { stroke-dashoffset: 0; } }' +
    '@keyframes meterFill90 { to { width: 90%; } }' +
    '@keyframes meterFill60 { to { width: 60%; } }' +
    '@keyframes meterFill35 { to { width: 35%; } }' +
    '@keyframes counterFlash { 0% { color: #ff0040; } 100% { color: var(--a-gold); } }' +
    '@keyframes lockGlow { 0%,100% { box-shadow:6px 6px 0 #997a00, 0 0 30px rgba(255,204,0,0.4); } 50% { box-shadow:6px 6px 0 #997a00, 0 0 50px rgba(255,204,0,0.7); } }';
  el.appendChild(styleEl);

  // Header bar — team name + scheme
  var hdr = document.createElement('div');
  hdr.style.cssText =
    'background:rgba(0,0,0,0.5);padding:10px 14px;display:flex;justify-content:space-between;' +
    'align-items:center;flex-shrink:0;border-bottom:2px solid var(--f-purple);';

  var teamBrand = document.createElement('div');
  teamBrand.style.cssText =
    'display:flex;align-items:baseline;gap:0;' +
    'font-style:italic;transform:skewX(-10deg);';
  var brandName = document.createElement('span');
  brandName.style.cssText =
    'font-family:"Bebas Neue",sans-serif;font-size:24px;color:' + team.accent + ';' +
    'letter-spacing:2px;text-shadow:2px 2px 0 #000, 0 0 10px ' + team.accent + ';';
  brandName.textContent = team.icon + ' ' + team.name;
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
    setGs(function(s) {
      return Object.assign({}, s, { screen: 'draft', team: GS.team, side: GS.side });
    });
  };
  hdr.appendChild(backBtn);
  el.appendChild(hdr);

  // Content area
  var content = document.createElement('div');
  content.style.cssText =
    'flex:1;overflow-y:auto;padding:20px 16px 80px;display:flex;flex-direction:column;gap:10px;' +
    'position:relative;z-index:2;';

  // Title — "5. DRAFT YOUR PLAYS" matching chrome-header style from draft.js
  var title = document.createElement('div');
  title.className = 'chrome-header';
  title.style.fontSize = '22px';
  title.textContent = '5. DRAFT YOUR PLAYS';
  content.appendChild(title);

  // Section label — matches "QUARTERBACK — PICK 1" on player draft
  var sectionLabel = document.createElement('div');
  sectionLabel.style.cssText =
    'font-family:"Press Start 2P",monospace;font-size:10px;color:#00ff88;' +
    'letter-spacing:1px;margin-bottom:8px;' +
    'border-bottom:1px solid #00ff8833;padding-bottom:6px;';
  sectionLabel.textContent = 'PLAYS \u2014 PICK 5';
  content.appendChild(sectionLabel);

  // Counter with dot indicators
  var counterRow = document.createElement('div');
  counterRow.style.cssText =
    'font-family:"Press Start 2P",monospace;font-size:10px;' +
    'letter-spacing:1px;margin-bottom:8px;' +
    'display:flex;align-items:center;gap:8px;';

  var dots = [];
  for (var d = 0; d < 5; d++) {
    var dot = document.createElement('div');
    dot.style.cssText =
      'width:8px;height:8px;border-radius:50%;background:#333;border:1px solid #555;' +
      'transition:background 0.2s, border-color 0.2s, box-shadow 0.2s;flex-shrink:0;';
    dots.push(dot);
    counterRow.appendChild(dot);
  }

  var counterText = document.createElement('div');
  counterText.style.cssText =
    'color:var(--a-gold);margin-left:4px;transition:color 0.2s;white-space:nowrap;';
  counterRow.appendChild(counterText);
  content.appendChild(counterRow);

  var selected = {};

  // Card grid
  var cardGrid = document.createElement('div');
  cardGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;';

  function refreshCards() {
    cardGrid.innerHTML = '';
    var count = Object.keys(selected).length;

    // Update counter
    counterText.textContent = count + ' OF 5 SELECTED';
    for (var i = 0; i < 5; i++) {
      if (i < count) {
        dots[i].style.background = '#00ff88';
        dots[i].style.borderColor = '#00ff88';
        dots[i].style.boxShadow = '0 0 6px rgba(0,255,136,0.5)';
      } else {
        dots[i].style.background = '#333';
        dots[i].style.borderColor = '#555';
        dots[i].style.boxShadow = 'none';
      }
    }

    pool.forEach(function(card, idx) {
      var key = card.id + '_' + idx;
      var isSel = !!selected[key];
      var playCard = buildPlayCard(card, isSel, idx);

      if (!isSel && count >= 5) playCard.style.opacity = '0.3';

      playCard.onclick = function() {
        if (selected[key]) {
          SND.click();
          delete selected[key];
          refreshCards();
          refreshGoBtn();
        } else if (Object.keys(selected).length < 5) {
          SND.click();
          selected[key] = card;
          refreshCards();
          refreshGoBtn();
        } else {
          counterText.style.animation = 'counterFlash 0.4s ease-out';
          setTimeout(function() { counterText.style.animation = ''; }, 400);
        }
      };

      cardGrid.appendChild(playCard);
    });
  }

  content.appendChild(cardGrid);

  // Lock in button
  var goBtn = document.createElement('button');
  function refreshGoBtn() {
    var ready = Object.keys(selected).length === 5;
    goBtn.className = 'btn-blitz';
    goBtn.style.cssText =
      'width:100%;font-size:14px;margin-top:12px;' +
      (ready
        ? 'background:#ffcc00;border-color:#ffcc00;color:#000;box-shadow:6px 6px 0 #997a00, 0 0 30px rgba(255,204,0,0.4);animation:lockGlow 2s ease-in-out infinite;'
        : 'opacity:0.35;');
    goBtn.disabled = !ready;
    goBtn.textContent = ready ? 'LOCK IN PLAYS \u2192' : 'PICK 5 PLAYS';
    goBtn.onclick = ready ? function() {
      SND.click();
      var hand = Object.keys(selected).map(function(k) { return selected[k]; });
      setGs(function(s) {
        return Object.assign({}, s, {
          screen: 'under_construction',
          team: GS.team,
          side: GS.side,
          roster: GS.roster,
          hand: hand
        });
      });
    } : null;
  }

  content.appendChild(goBtn);
  el.appendChild(content);

  refreshCards();
  refreshGoBtn();

  return el;
}
