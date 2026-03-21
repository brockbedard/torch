import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, getOffCards, getDefCards, shuffle } from '../../state.js';
import { playSvg } from '../../data/playDiagrams.js';
import { buildDraftProgress } from '../components/draftProgress.js';

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
    'opacity:' + (isSel ? '1' : '0.8') + ';' +
    (isSel ? 'box-shadow:0 0 18px rgba(0,255,136,0.35), inset 0 0 12px rgba(0,255,136,0.08);' : '');

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

  // Matchup Intel Badge
  var intel = document.createElement('div');
  intel.style.cssText = 'position:absolute;top:40px;right:8px;font-family:"Press Start 2P";font-size:5px;background:rgba(0,234,255,0.15);color:var(--cyan);padding:3px 5px;border-radius:4px;border:1px solid rgba(0,234,255,0.3);z-index:5;';
  var beats = {
    'mesh': 'BEATS MAN', 'slant': 'BEATS BLITZ', 'four_verts': 'BEATS COV 2', 
    'triple_option': 'BEATS EDGE', 'ir_robber': 'STOPS SLANT', 'ct_corner_blitz': 'STOPS DEEP'
  };
  if (beats[card.id]) {
    intel.textContent = 'ADV: ' + beats[card.id];
    cel.appendChild(intel);
  }

  return cel;
}

/* Play review screen — vertically scrolling "YOUR PLAYS" style */
function showPlayReview(team, offHand, defHand, onContinue) {
  var root = document.getElementById('root');
  var ov = document.createElement('div');
  ov.style.cssText =
    'position:absolute;inset:0;z-index:100;background:var(--bg);' +
    'display:flex;flex-direction:column;padding:0;overflow:hidden;';

  var sty = document.createElement('style');
  sty.textContent = '@keyframes playFlyIn{from{opacity:0;transform:translateY(40px) scale(.8)}to{opacity:1;transform:none}}';
  ov.appendChild(sty);

  // Stepper at top
  ov.appendChild(buildDraftProgress(3));

  // Header (Fixed)
  var hdr = document.createElement('div');
  hdr.style.cssText = 'flex-shrink:0;text-align:center;padding:12px 14px 8px;background:rgba(0,0,0,0.5);border-bottom:2px solid var(--a-gold);';
  var playsHdr = document.createElement('div');
  playsHdr.className = 'chrome-header';
  playsHdr.style.cssText = 'font-size:28px;margin-bottom:0;';
  playsHdr.textContent = 'YOUR PLAYS';
  hdr.appendChild(playsHdr);
  ov.appendChild(hdr);

  // Scrollable container
  var scroll = document.createElement('div');
  scroll.style.cssText = 'flex:1;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:12px;';

  function buildSection(label, plays, offset) {
    var lbl = document.createElement('div');
    lbl.style.cssText = "font-family:'Press Start 2P';font-size:8px;color:#00ff88;letter-spacing:1px;margin:8px 0 4px;";
    lbl.textContent = label;
    scroll.appendChild(lbl);

    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;';
    plays.forEach(function(p, i) {
      var card = buildPlayCard(p, true, i + offset);
      card.style.animation = 'playFlyIn 0.4s ease-out ' + ((i + offset) * 0.08) + 's both';
      card.style.cursor = 'default';
      grid.appendChild(card);
    });
    scroll.appendChild(grid);
  }

  buildSection('OFFENSE', offHand, 0);
  buildSection('DEFENSE', defHand, 4);
  
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

export function buildCardDraft() {
  var el = document.createElement('div');
  el.className = 'sup';
  el.style.cssText = 'height:100vh;display:flex;flex-direction:column;background:var(--bg);overflow:hidden;';

  var team = getTeam(GS.team);
  var isOff = GS.side === 'offense';
  var pool = isOff ? getOffCards(GS.team) : getDefCards(GS.team);
  var schemeName = isOff ? team.style : team.defStyle;

  // Progress Bar
  el.appendChild(buildDraftProgress(3));

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
    'align-items:center;flex-shrink:0;border-bottom:3px solid ' + team.accent + ';';

  var teamBrand = document.createElement('div');
  teamBrand.style.cssText =
    'display:flex;align-items:baseline;gap:0;font-style:italic;transform:skewX(-10deg);';
  var brandName = document.createElement('span');
  brandName.style.cssText =
    "font-family:'Teko',sans-serif;font-weight:700;font-size:32px;color:var(--a-gold);" +
    "letter-spacing:3px;text-shadow:2px 2px 0 rgba(0,0,0,0.9),0 0 12px rgba(255,204,0,0.3);";
  brandName.textContent = 'TORCH';
  var brandScheme = document.createElement('span');
  brandScheme.style.cssText =
    "font-family:'Teko',sans-serif;font-weight:500;font-size:22px;color:var(--white);" +
    "letter-spacing:1px;margin-left:6px;";
  brandScheme.textContent = '\u00b7 PLAY NOW';
  teamBrand.append(brandName, brandScheme);
  hdr.appendChild(teamBrand);

  var backBtn = document.createElement('button');
  backBtn.style.cssText =
    'font-family:\'Press Start 2P\',monospace;font-size:10px;padding:10px 16px;' +
    'cursor:pointer;background:#000;color:var(--white);border:2px solid #333;';
  backBtn.textContent = '\u2190 BACK';
  backBtn.onclick = function() {
    SND.click();
    setGs(function(s) {
      if (isOff) {
        // Back from offense plays → re-pick defense players
        return Object.assign({}, s, {
          screen: 'draft', side: 'defense',
          roster: null, offHand: null
        });
      } else {
        // Back from defense plays → re-pick offense plays
        return Object.assign({}, s, {
          screen: 'card_draft', side: 'offense',
          roster: null, defHand: null
        });
      }
    });
  };
  hdr.appendChild(backBtn);
  el.appendChild(hdr);

  // Content — matches player draft layout exactly
  var content = document.createElement('div');
  content.style.cssText = 'flex:1;display:flex;flex-direction:column;padding:10px 14px;overflow:hidden;';

  var selected = {};

  // Title row with auto-pick inline (same as draft.js)
  var titleRow = document.createElement('div');
  titleRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;flex-shrink:0;margin-bottom:6px;';
  var title = document.createElement('div');
  title.className = 'chrome-header';
  title.style.cssText = 'font-size:22px;margin-bottom:0;';
  title.textContent = isOff ? 'PICK OFFENSIVE PLAYS' : 'PICK DEFENSIVE PLAYS';
  var autoBtn = document.createElement('button');
  autoBtn.style.cssText = "font-family:'Press Start 2P';font-size:6px;color:var(--cyan);background:none;border:1px solid var(--cyan);padding:5px 8px;cursor:pointer;border-radius:12px;opacity:.7;";
  autoBtn.textContent = '\u26A1 AUTO-SELECT';
  autoBtn.onclick = function() {
    SND.click();
    selected = {};
    var indices = pool.map(function(_, i) { return i; });
    var shuffledIndices = shuffle(indices);
    shuffledIndices.slice(0, 4).forEach(function(i) {
      selected[pool[i].id + '_' + i] = pool[i];
    });
    refreshCards();
    refreshGoBtn();
    refreshDots();
  };
  titleRow.append(title, autoBtn);
  content.appendChild(titleRow);

  // Dots system
  var dotRow = document.createElement('div');
  dotRow.style.cssText = "display:flex;align-items:center;font-family:'Press Start 2P';font-size:8px;color:#00ff88;letter-spacing:1px;flex-shrink:0;margin-bottom:8px;";
  function refreshDots() {
    var count = Object.keys(selected).length;
    var dots = '';
    for (var i=0; i<4; i++) dots += (i < count ? '●' : '○');
    dotRow.innerHTML = 'PICK 4 PLAYS <span style="font-size:18px;margin-left:8px;letter-spacing:4px;line-height:0;display:inline-flex;align-items:center;height:10px;vertical-align:middle;transform:translateY(-4px)">' + dots + '</span>';
  }
  refreshDots();
  content.appendChild(dotRow);

  // Card grid — 2x5, fills remaining space
  var cardGrid = document.createElement('div');
  cardGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr 1fr 1fr 1fr;gap:8px;flex:1;min-height:0;';

  function refreshCards() {
    cardGrid.innerHTML = '';
    var count = Object.keys(selected).length;

    pool.forEach(function(card, idx) {
      var key = card.id + '_' + idx;
      var isSel = !!selected[key];
      var playCard = buildPlayCard(card, isSel, idx);

      if (!isSel && count >= 4) playCard.style.opacity = '0.3';

      playCard.onclick = function() {
        if (selected[key]) {
          SND.select();
          delete selected[key];
        } else if (Object.keys(selected).length < 4) {
          SND.select();
          selected[key] = card;
        }
        refreshCards();
        refreshGoBtn();
        refreshDots();
      };

      cardGrid.appendChild(playCard);
    });
  }

  content.appendChild(cardGrid);

  // Lock in button
  var goBtn = document.createElement('button');
  function refreshGoBtn() {
    var ready = Object.keys(selected).length === 4;
    goBtn.className = 'btn-blitz';
    goBtn.style.cssText =
      'width:100%;font-size:14px;margin-top:4px;flex-shrink:0;' +
      (ready
        ? 'background:var(--a-gold);border-color:var(--f-purple);color:#000;box-shadow:6px 6px 0 var(--f-purple), 10px 10px 0 #000;'
        : 'background:#555;border-color:var(--f-purple);color:var(--f-purple);box-shadow:6px 6px 0 var(--f-purple), 10px 10px 0 #000;opacity:0.8;');
    goBtn.disabled = !ready;
    goBtn.textContent = ready ? 'LOCK IN PLAYS \u2192' : 'CHOOSE YOUR PLAYS';
    goBtn.onclick = ready ? function() {
      SND.click();
      var hand = Object.keys(selected).map(function(k) { return selected[k]; });
      
      function proceed() {
        setGs(function(s) {
          var next = Object.assign({}, s);
          if (GS.side === 'offense') {
            next.offHand = hand;
            next.screen = 'card_draft';
            next.side = 'defense';
            next.roster = null;
          } else {
            next.defHand = hand;
            next.screen = 'gameplay';
          }
          return next;
        });
      }

      if (GS.side === 'offense') {
        proceed();
      } else {
        // Defense plays locked — show all 10 plays fly-in review
        var offHand = GS.offHand || [];
        showPlayReview(team, offHand, hand, function() {
          proceed();
        });
      }
    } : null;
  }

  content.appendChild(goBtn);
  el.appendChild(content);

  refreshCards();
  refreshGoBtn();

  return el;
}
