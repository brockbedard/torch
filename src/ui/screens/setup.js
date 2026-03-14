import { SND } from '../../engine/sound.js';
import { GS, setGs } from '../../state.js';

/* ═══════════════════════════════════════════
   SVG ASSETS
   ═══════════════════════════════════════════ */

// CT Helmet — burnt orange, angular, cactus icon
const SVG_CT_HELMET = `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="cth" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ff7a30"/><stop offset="100%" stop-color="#cc4a00"/></linearGradient></defs>
  <path d="M25,75 L20,40 Q18,15 45,10 L80,8 Q105,8 108,30 L110,50 L112,60 L100,62 L98,55 L95,75 Z" fill="url(#cth)" stroke="#8a3500" stroke-width="1.5"/>
  <rect x="95" y="38" width="18" height="8" rx="2" fill="#8a3500" opacity=".4"/>
  <path d="M108,35 L115,42 M108,42 L115,35 M108,48 L115,55 M108,55 L115,48" stroke="#cc4a00" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M55,25 L55,45 M50,35 L55,25 L60,35 M48,45 L55,45 L62,45 M48,45 L48,50 M62,45 L62,50" stroke="#fff" stroke-width="1.5" fill="none" opacity=".6"/>
</svg>`;

// IR Helmet — navy blue, bulky, trident icon
const SVG_IR_HELMET = `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="irh" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2a4a7a"/><stop offset="100%" stop-color="#0a1a3a"/></linearGradient></defs>
  <path d="M22,78 L18,42 Q15,12 48,8 L82,6 Q112,6 115,35 L115,55 L118,65 L105,68 L102,58 L100,78 Z" fill="url(#irh)" stroke="#0a1a3a" stroke-width="2"/>
  <rect x="100" y="40" width="20" height="10" rx="3" fill="#0a1a3a" opacity=".4"/>
  <path d="M112,38 L120,46 M112,46 L120,38 M112,52 L120,60 M112,60 L120,52" stroke="#1a3a6a" stroke-width="3" stroke-linecap="round"/>
  <path d="M55,20 L55,48 M55,20 L48,28 M55,20 L62,28 M55,20 L55,14 L52,10 M55,14 L58,10 M55,14 L55,8" stroke="#8ab4e8" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>
</svg>`;

// CT Coach Ricky Vance — lean, aviators, burnt orange polo, yelling, pointing
const SVG_CT_COACH = `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="108" rx="35" ry="12" fill="#1a0800" opacity=".3"/>
  <path d="M35,65 L30,110 L70,110 L65,65 Z" fill="#e05a10"/>
  <path d="M42,65 L45,75 L55,75 L58,65" fill="#cc4a00"/>
  <path d="M30,80 L15,95 L20,100 L35,88" fill="#e05a10"/>
  <path d="M70,75 L90,65 L92,70 L73,82" fill="#e05a10"/>
  <circle cx="50" cy="45" r="22" fill="#d4a574"/>
  <ellipse cx="50" cy="40" rx="24" ry="10" fill="#3a2010"/>
  <rect x="36" y="38" width="12" height="5" rx="2" fill="#111" opacity=".8"/>
  <rect x="52" y="38" width="12" height="5" rx="2" fill="#111" opacity=".8"/>
  <line x1="36" y1="40" x2="32" y2="38" stroke="#111" stroke-width="1.5"/>
  <line x1="64" y1="40" x2="68" y2="38" stroke="#111" stroke-width="1.5"/>
  <path d="M44,55 Q50,62 56,55" stroke="#8a4020" stroke-width="2" fill="#6a2010"/>
  <path d="M47,73 L47,65 L53,65 L53,73" fill="#d4a574"/>
</svg>`;

// IR Coach Dale Burris — stocky, stone-faced, navy windbreaker, arms crossed, flat-top
const SVG_IR_COACH = `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="108" rx="38" ry="12" fill="#000a1a" opacity=".3"/>
  <path d="M28,68 L22,112 L78,112 L72,68 Z" fill="#1a2a4a"/>
  <path d="M40,68 L42,78 L58,78 L60,68" fill="#0a1a3a"/>
  <path d="M30,78 Q38,95 45,88 L42,78 L30,78 Z" fill="#1a2a4a"/>
  <path d="M70,78 Q62,95 55,88 L58,78 L70,78 Z" fill="#1a2a4a"/>
  <line x1="35" y1="82" x2="65" y2="82" stroke="#0a1a3a" stroke-width="1"/>
  <circle cx="50" cy="45" r="22" fill="#c49a70"/>
  <rect x="34" y="26" width="32" height="10" rx="1" fill="#2a1a0a"/>
  <rect x="36" y="24" width="28" height="4" fill="#2a1a0a"/>
  <circle cx="42" cy="42" r="2.5" fill="#1a1a1a"/>
  <circle cx="58" cy="42" r="2.5" fill="#1a1a1a"/>
  <line x1="36" y1="39" x2="46" y2="40" stroke="#2a1a0a" stroke-width="2.5"/>
  <line x1="54" y1="40" x2="64" y2="39" stroke="#2a1a0a" stroke-width="2.5"/>
  <line x1="44" y1="55" x2="56" y2="55" stroke="#7a5a3a" stroke-width="2"/>
  <path d="M47,70 L47,65 L53,65 L53,70" fill="#c49a70"/>
</svg>`;

// CT Stadium "The Furnace" — desert bowl interior, warm tones
const SVG_CT_STADIUM = `<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="90" fill="#1a0800"/>
  <path d="M0,20 Q50,0 100,5 Q150,0 200,20 L200,50 L0,50 Z" fill="#cc4a00" opacity=".25"/>
  <path d="M0,30 Q50,12 100,16 Q150,12 200,30 L200,50 L0,50 Z" fill="#e05a10" opacity=".2"/>
  <rect x="10" y="50" width="180" height="35" rx="2" fill="#1a5a1a"/>
  <line x1="50" y1="50" x2="50" y2="85" stroke="#2a7a2a" stroke-width=".5" opacity=".5"/>
  <line x1="100" y1="50" x2="100" y2="85" stroke="#2a7a2a" stroke-width=".5" opacity=".5"/>
  <line x1="150" y1="50" x2="150" y2="85" stroke="#2a7a2a" stroke-width=".5" opacity=".5"/>
  <path d="M5,85 L5,78 L8,75 L5,78" stroke="#3a6a2a" stroke-width="1.5" fill="none"/>
  <path d="M195,85 L195,78 L192,75 L195,78" stroke="#3a6a2a" stroke-width="1.5" fill="none"/>
  <rect x="0" y="85" width="200" height="5" fill="#0a0400"/>
</svg>`;

// IR Stadium "The Forge" — industrial fortress interior, cold/dark
const SVG_IR_STADIUM = `<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="90" fill="#060a14"/>
  <path d="M0,18 Q50,2 100,6 Q150,2 200,18 L200,50 L0,50 Z" fill="#1a2a4a" opacity=".3"/>
  <path d="M0,28 Q50,14 100,18 Q150,14 200,28 L200,50 L0,50 Z" fill="#0a1a3a" opacity=".25"/>
  <rect x="10" y="50" width="180" height="35" rx="2" fill="#0a2a0a"/>
  <line x1="50" y1="50" x2="50" y2="85" stroke="#1a3a1a" stroke-width=".5" opacity=".4"/>
  <line x1="100" y1="50" x2="100" y2="85" stroke="#1a3a1a" stroke-width=".5" opacity=".4"/>
  <line x1="150" y1="50" x2="150" y2="85" stroke="#1a3a1a" stroke-width=".5" opacity=".4"/>
  <rect x="15" y="10" width="4" height="40" fill="#2a3a5a" opacity=".3"/>
  <rect x="55" y="5" width="4" height="45" fill="#2a3a5a" opacity=".3"/>
  <rect x="141" y="5" width="4" height="45" fill="#2a3a5a" opacity=".3"/>
  <rect x="181" y="10" width="4" height="40" fill="#2a3a5a" opacity=".3"/>
  <rect x="0" y="50" width="200" height="1" fill="#3a5a8a" opacity=".2"/>
  <rect x="0" y="85" width="200" height="5" fill="#020610"/>
</svg>`;

/* ═══════════════════════════════════════════
   TEAM DATA (extended, not in src/data/)
   ═══════════════════════════════════════════ */
const TEAM_DATA = {
  canyon_tech: {
    id: 'canyon_tech', fullName: 'CANYON TECH CACTI', color: '#FF5E1A', accent: '#ff8844',
    coach: 'COACH RICKY VANCE', quote: '"If we\'re not scoring, we\'re not trying."',
    scheme: 'AIR RAID OFFENSE \u00b7 SEND EVERYBODY DEFENSE',
    motto: 'BURN THE COVERAGE', est: 'Est. 1974 \u2014 3x Conference Champions',
    sigPlay: 'FOUR VERTS', stars: 'Avery 78 QB \u00b7 Vasquez 82 SLOT',
    stadium: 'THE FURNACE',
    ratings: { off: 4, def: 3, spd: 5, tgh: 2, ovr: 4 },
    helmetSvg: SVG_CT_HELMET, coachSvg: SVG_CT_COACH, stadiumSvg: SVG_CT_STADIUM,
    bg: 'linear-gradient(180deg, #1a0800 0%, #0d0400 100%)',
  },
  iron_ridge: {
    id: 'iron_ridge', fullName: 'IRON RIDGE TRIDENTS', color: '#4488cc', accent: '#8ab4e8',
    coach: 'COACH DALE BURRIS', quote: '"You don\'t need to throw the ball. You need to want it more."',
    scheme: 'TRIPLE OPTION OFFENSE \u00b7 HARD NOSED DEFENSE',
    motto: 'CONTROL THE LINE', est: 'Est. 1961 \u2014 5x Conference Champions',
    sigPlay: 'TRIPLE OPTION', stars: 'Kendrick 80 QB \u00b7 Torres 82 FB',
    stadium: 'THE FORGE',
    ratings: { off: 3, def: 4, spd: 2, tgh: 5, ovr: 4 },
    helmetSvg: SVG_IR_HELMET, coachSvg: SVG_IR_COACH, stadiumSvg: SVG_IR_STADIUM,
    bg: 'linear-gradient(180deg, #060a14 0%, #020610 100%)',
  },
};

function stars(n) {
  let s = '';
  for (let i = 0; i < 5; i++) s += i < n ? '\u2605' : '\u2606';
  return s;
}

/* ═══════════════════════════════════════════
   BUILD
   ═══════════════════════════════════════════ */
export function buildSetup() {
  var selTeam = GS.team;
  if (!GS.difficulty) GS.difficulty = 'MEDIUM';
  var selDiff = GS.difficulty;

  var el = document.createElement('div');
  el.style.cssText = 'height:100vh;display:flex;flex-direction:column;background:#06050f;overflow:hidden;';

  // inject styles
  var sty = document.createElement('style');
  sty.textContent = `
    .su-back{font-family:'Bebas Neue';font-size:22px;padding:8px 18px;cursor:pointer;background:#fff;color:#000;border:none;border-radius:6px;display:flex;align-items:center;gap:6px;letter-spacing:1px}
    .su-back:active{transform:scale(.96)}
    .su-cards{flex:1;display:flex;gap:8px;padding:8px;overflow:hidden}
    .su-card{flex:1;border-radius:10px;overflow:hidden;cursor:pointer;position:relative;display:flex;flex-direction:column;transition:all .15s;border:2px solid transparent}
    .su-card-sel{border-color:#00ff88;box-shadow:0 0 24px rgba(0,255,136,.3)}
    .su-card:active{transform:scale(.98)}
    .su-card-inner{flex:1;padding:10px 10px 6px;display:flex;flex-direction:column;overflow-y:auto;gap:4px}
    .su-helmet{width:60px;height:50px;margin:0 auto}
    .su-name{font-family:'Bebas Neue';font-size:18px;letter-spacing:2px;text-align:center;line-height:1}
    .su-coach-row{display:flex;gap:6px;align-items:center}
    .su-coach-svg{width:36px;height:44px;flex-shrink:0}
    .su-coach-info{flex:1}
    .su-coach-name{font-family:'Courier New';font-size:7px;font-weight:700;letter-spacing:.5px}
    .su-quote{font-family:'Barlow Condensed';font-size:10px;font-style:italic;opacity:.6;line-height:1.2}
    .su-stadium{width:100%;height:36px;border-radius:4px;overflow:hidden;margin:2px 0}
    .su-stadium-lbl{font-family:'Press Start 2P';font-size:5px;text-align:center;letter-spacing:1px;opacity:.5;margin-top:1px}
    .su-detail{font-family:'Courier New';font-size:7px;opacity:.6;line-height:1.5}
    .su-ratings{display:grid;grid-template-columns:1fr 1fr;gap:1px 8px;margin-top:2px}
    .su-rat{font-family:'Courier New';font-size:7px;display:flex;justify-content:space-between}
    .su-rat-lbl{opacity:.5}
    .su-rat-stars{letter-spacing:-1px}
    .su-bottom{padding:6px 8px 10px;flex-shrink:0;display:flex;flex-direction:column;gap:6px}
    .su-diff-row{display:flex;gap:6px}
    .su-diff{flex:1;padding:10px 4px;font-family:'Press Start 2P';font-size:9px;text-align:center;border-radius:6px;cursor:pointer;border:2px solid;transition:all .12s;background:none}
    .su-diff:active{transform:scale(.96)}
    .su-go{width:100%;padding:14px;font-family:'Bebas Neue';font-size:22px;letter-spacing:4px;color:#000;border:none;border-radius:8px;cursor:pointer;background:linear-gradient(180deg,#f0c020,#c8a010);box-shadow:0 4px 20px rgba(200,160,16,.25)}
    .su-go:disabled{opacity:.3;cursor:not-allowed;box-shadow:none}
    .su-go:active:not(:disabled){transform:scale(.97)}
  `;
  el.appendChild(sty);

  // ── HEADER (back button only) ──
  var hdr = document.createElement('div');
  hdr.style.cssText = 'padding:8px 10px;flex-shrink:0;display:flex;align-items:center;';
  var backBtn = document.createElement('button');
  backBtn.className = 'su-back';
  backBtn.innerHTML = '\u2190 BACK';
  backBtn.onclick = function() { SND.click(); setGs(null); };
  hdr.appendChild(backBtn);
  el.appendChild(hdr);

  // ── TEAM CARDS ──
  var cardsRow = document.createElement('div');
  cardsRow.className = 'su-cards';

  function buildTeamCard(td) {
    var isSel = selTeam === td.id;
    var card = document.createElement('div');
    card.className = 'su-card' + (isSel ? ' su-card-sel' : '');
    card.style.background = td.bg;

    var inner = document.createElement('div');
    inner.className = 'su-card-inner';

    // Helmet
    inner.innerHTML =
      `<div class="su-helmet">${td.helmetSvg}</div>` +
      `<div class="su-name" style="color:${td.color}">${td.fullName}</div>` +
      // Coach row
      `<div class="su-coach-row">` +
        `<div class="su-coach-svg">${td.coachSvg}</div>` +
        `<div class="su-coach-info">` +
          `<div class="su-coach-name" style="color:${td.accent}">${td.coach}</div>` +
          `<div class="su-quote" style="color:${td.accent}">${td.quote}</div>` +
        `</div>` +
      `</div>` +
      // Stadium
      `<div class="su-stadium">${td.stadiumSvg}</div>` +
      `<div class="su-stadium-lbl" style="color:${td.accent}">HOME: ${td.stadium}</div>` +
      // Details
      `<div class="su-detail" style="color:${td.accent}">` +
        `${td.scheme}<br>` +
        `<span style="font-weight:700">${td.motto}</span><br>` +
        `${td.est}<br>` +
        `Signature: ${td.sigPlay}<br>` +
        `${td.stars}` +
      `</div>` +
      // Ratings
      `<div class="su-ratings">` +
        `<div class="su-rat"><span class="su-rat-lbl">OFF</span><span class="su-rat-stars" style="color:${td.color}">${stars(td.ratings.off)}</span></div>` +
        `<div class="su-rat"><span class="su-rat-lbl">DEF</span><span class="su-rat-stars" style="color:${td.color}">${stars(td.ratings.def)}</span></div>` +
        `<div class="su-rat"><span class="su-rat-lbl">SPD</span><span class="su-rat-stars" style="color:${td.color}">${stars(td.ratings.spd)}</span></div>` +
        `<div class="su-rat"><span class="su-rat-lbl">TGH</span><span class="su-rat-stars" style="color:${td.color}">${stars(td.ratings.tgh)}</span></div>` +
        `<div class="su-rat"><span class="su-rat-lbl">OVR</span><span class="su-rat-stars" style="color:${td.color}">${stars(td.ratings.ovr)}</span></div>` +
      `</div>`;

    card.appendChild(inner);
    card.onclick = function() {
      SND.select();
      selTeam = td.id;
      GS.team = td.id;
      refreshCards();
      refreshGo();
    };
    return card;
  }

  function refreshCards() {
    cardsRow.innerHTML = '';
    cardsRow.appendChild(buildTeamCard(TEAM_DATA.canyon_tech));
    cardsRow.appendChild(buildTeamCard(TEAM_DATA.iron_ridge));
  }

  el.appendChild(cardsRow);

  // ── BOTTOM: difficulty + go ──
  var bottom = document.createElement('div');
  bottom.className = 'su-bottom';

  // Difficulty row (no labels, no descriptions)
  var diffRow = document.createElement('div');
  diffRow.className = 'su-diff-row';

  var diffs = [
    { id: 'EASY', color: '#00ff44' },
    { id: 'MEDIUM', color: '#ffcc00' },
    { id: 'HARD', color: '#ff0040' },
  ];

  function refreshDiffs() {
    diffRow.innerHTML = '';
    diffs.forEach(function(d) {
      var isSel = selDiff === d.id;
      var btn = document.createElement('button');
      btn.className = 'su-diff';
      btn.style.cssText = isSel
        ? 'background:' + d.color + ';color:#000;border-color:' + d.color + ';box-shadow:0 0 12px ' + d.color + '44;'
        : 'color:' + d.color + ';border-color:' + d.color + '55;opacity:.5;';
      btn.textContent = d.id;
      btn.onclick = function() {
        SND.select();
        selDiff = d.id;
        GS.difficulty = d.id;
        refreshDiffs();
        refreshGo();
      };
      diffRow.appendChild(btn);
    });
  }

  bottom.appendChild(diffRow);

  // Go button
  var goBtn = document.createElement('button');
  goBtn.className = 'su-go';

  function refreshGo() {
    var ready = selTeam && selDiff;
    goBtn.disabled = !ready;
    goBtn.textContent = ready ? 'START DRAFT \u2192' : 'SELECT A TEAM';
    goBtn.onclick = ready ? function() {
      SND.snap();
      setGs(function(s) {
        return Object.assign({}, s, {
          screen: 'draft',
          team: selTeam,
          difficulty: selDiff,
          coachBadge: 'SCHEMER', // default since coach selector removed
          side: 'offense',
          roster: null, offRoster: null, offHand: null,
          defRoster: null, defHand: null
        });
      });
    } : null;
  }

  bottom.appendChild(goBtn);
  el.appendChild(bottom);

  // init
  refreshCards();
  refreshDiffs();
  refreshGo();

  return el;
}
