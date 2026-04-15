import fs from 'fs';

const FILE = '/Users/brock/torch-football/src/assets/icons/teamLogos.js';
const src = fs.readFileSync(FILE, 'utf8');

function extractMarkup(teamKey) {
  const startIdx = src.indexOf('  ' + teamKey + ": '");
  let i = startIdx + ('  ' + teamKey + ": '").length;
  while (i < src.length) {
    const c = src[i];
    if (c === '\\') { i += 2; continue; }
    if (c === "'") {
      const peek = src.slice(i + 1, i + 3);
      if (peek.startsWith(',')) { break; }
      if (peek.startsWith(' +')) { i += 3; continue; }
    }
    i++;
  }
  return src.slice(startIdx + ('  ' + teamKey + ": '").length, i)
    .replace(/\\'/g, "'").replace(/'\s*\+\s*\n\s*'/g, '');
}
function replaceAll(str, pairs) {
  let out = str;
  pairs.sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of pairs) out = out.split(from).join(to);
  return out;
}
function replaceGradient(str, id, newStops) {
  const re = new RegExp('(<linearGradient id="' + id + '"[^>]*>)([\\s\\S]*?)(</linearGradient>)');
  return str.replace(re, (_, o, __, c) => o + newStops + c);
}
const ALL_IDS = ['boar-grad','dolphin-grad','ghost-grad','serpent-grad','pronghorn-body','pronghorn-antler','salamander-body','maple-leaf','raccoon-face','raccoon-mask','raccoon-ears','raccoon-eyes'];
function suffixIds(str, suf) {
  let out = str;
  for (const id of ALL_IDS) {
    out = out.split(`id="${id}"`).join(`id="${id}${suf}"`);
    out = out.split(`url(#${id})`).join(`url(#${id}${suf})`);
  }
  return out;
}

// =========================================================================
// CURRENT PICKS (LEFT column)
// =========================================================================
const boarsCurrent = extractMarkup('sentinels');

let maplesCurrent = replaceGradient(extractMarkup('maples'), 'maple-leaf',
  '<stop offset="0" stop-color="#FDF4D4"/>' +
  '<stop offset="0.18" stop-color="#FDE68A"/>' +
  '<stop offset="0.38" stop-color="#F59E0B"/>' +
  '<stop offset="0.58" stop-color="#EA580C"/>' +
  '<stop offset="0.75" stop-color="#B91C1C"/>' +
  '<stop offset="0.9" stop-color="#7C2D12"/>' +
  '<stop offset="1" stop-color="#451A03"/>');
maplesCurrent = replaceAll(maplesCurrent, [
  ['#FDBA74','#FDE68A'],['#F97316','#F59E0B'],['#DC2626','#EA580C'],
  ['#B91C1C','#C2410C'],['#991B1B','#B91C1C'],['#7F1D1D','#8A3A14'],
  ['#5A1616','#7C2D12'],['#4A1010','#5C2410'],['#3A0810','#451A03'],
  ['#2D1A0A','#2E1008']
]);

let raccoonsCurrent = replaceGradient(extractMarkup('raccoons'), 'raccoon-face',
  '<stop offset="0" stop-color="#FFF6E0"/>' +
  '<stop offset="0.22" stop-color="#F9E4C0"/>' +
  '<stop offset="0.5" stop-color="#E8B47A"/>' +
  '<stop offset="0.78" stop-color="#8B5A2E"/>' +
  '<stop offset="1" stop-color="#3A1F08"/>');
raccoonsCurrent = replaceGradient(raccoonsCurrent, 'raccoon-mask',
  '<stop offset="0" stop-color="#6B3410"/>' +
  '<stop offset="0.3" stop-color="#3A1F08"/>' +
  '<stop offset="0.7" stop-color="#1A0A02"/>' +
  '<stop offset="1" stop-color="#000000"/>');
raccoonsCurrent = replaceGradient(raccoonsCurrent, 'raccoon-ears',
  '<stop offset="0" stop-color="#FFE58A"/>' +
  '<stop offset="0.25" stop-color="#FFB547"/>' +
  '<stop offset="0.55" stop-color="#FF8C00"/>' +
  '<stop offset="0.8" stop-color="#C2410C"/>' +
  '<stop offset="1" stop-color="#5C2410"/>');
raccoonsCurrent = replaceGradient(raccoonsCurrent, 'raccoon-eyes',
  '<stop offset="0" stop-color="#FFF4B8"/>' +
  '<stop offset="0.25" stop-color="#FFD440"/>' +
  '<stop offset="0.55" stop-color="#FF8C00"/>' +
  '<stop offset="0.85" stop-color="#C2410C"/>' +
  '<stop offset="1" stop-color="#5C1A02"/>');

// =========================================================================
// PROPOSED SHIFTS (RIGHT column)
// =========================================================================

// BOARS — no change
const boarsProposed = extractMarkup('sentinels');

// MAPLES — "Oxblood Momiji" — wine-burgundy dominant, gentleman's-autumn muted warmth
let maplesProposed = replaceGradient(extractMarkup('maples'), 'maple-leaf',
  '<stop offset="0" stop-color="#FDF4D4"/>' +
  '<stop offset="0.18" stop-color="#FCD34D"/>' +
  '<stop offset="0.35" stop-color="#D97706"/>' +
  '<stop offset="0.55" stop-color="#8B4513"/>' +
  '<stop offset="0.75" stop-color="#7A1E2E"/>' +
  '<stop offset="0.9" stop-color="#4A1020"/>' +
  '<stop offset="1" stop-color="#2E0A14"/>');
maplesProposed = replaceAll(maplesProposed, [
  ['#FDBA74','#FCD34D'],
  ['#F97316','#D97706'],
  ['#DC2626','#8B4513'],
  ['#B91C1C','#7A1E2E'],
  ['#991B1B','#6B1E2E'],
  ['#7F1D1D','#5C1A29'],
  ['#5A1616','#4A1020'],
  ['#4A1010','#3A0F1C'],
  ['#3A0810','#2E0A14'],
  ['#2D1A0A','#1A0510']
]);

// RACCOONS — "Moonshine Silver" — cool silver/pewter body + noir mask + amber eye focal
let raccoonsProposed = replaceGradient(extractMarkup('raccoons'), 'raccoon-face',
  '<stop offset="0" stop-color="#F4F4F5"/>' +
  '<stop offset="0.25" stop-color="#D4D4D8"/>' +
  '<stop offset="0.55" stop-color="#71717A"/>' +
  '<stop offset="0.82" stop-color="#27272A"/>' +
  '<stop offset="1" stop-color="#09090B"/>');
raccoonsProposed = replaceGradient(raccoonsProposed, 'raccoon-mask',
  '<stop offset="0" stop-color="#1F2937"/>' +
  '<stop offset="0.4" stop-color="#0A0E1A"/>' +
  '<stop offset="0.8" stop-color="#030408"/>' +
  '<stop offset="1" stop-color="#000000"/>');
raccoonsProposed = replaceGradient(raccoonsProposed, 'raccoon-ears',
  '<stop offset="0" stop-color="#E5E7EB"/>' +
  '<stop offset="0.35" stop-color="#9CA3AF"/>' +
  '<stop offset="0.7" stop-color="#52525B"/>' +
  '<stop offset="1" stop-color="#1F2937"/>');
raccoonsProposed = replaceGradient(raccoonsProposed, 'raccoon-eyes',
  '<stop offset="0" stop-color="#FFF4B8"/>' +
  '<stop offset="0.3" stop-color="#FFD440"/>' +
  '<stop offset="0.6" stop-color="#FF8C00"/>' +
  '<stop offset="0.85" stop-color="#C2410C"/>' +
  '<stop offset="1" stop-color="#5C1A02"/>');

// =========================================================================
// RENDER
// =========================================================================
const LEFT = {
  sentinels: suffixIds(boarsCurrent, '-L'),
  maples: suffixIds(maplesCurrent, '-L'),
  raccoons: suffixIds(raccoonsCurrent, '-L'),
};
const RIGHT = {
  sentinels: suffixIds(boarsProposed, '-R'),
  maples: suffixIds(maplesProposed, '-R'),
  raccoons: suffixIds(raccoonsProposed, '-R'),
};

const TEAMS = [
  {
    id: 'sentinels', name: 'BOARS',
    currentLabel: 'Crimson Sovereign',
    proposedLabel: 'Crimson Sovereign',
    changeTag: 'LOCKED',
    currentPal: [
      { name:'Crimson',  hex:'#8B0000' },
      { name:'Ember',    hex:'#A51818' },
      { name:'Tusk Gold',hex:'#EBB010' },
      { name:'Ivory',    hex:'#FFF2C2' },
    ],
    proposedPal: [
      { name:'Crimson',  hex:'#8B0000' },
      { name:'Ember',    hex:'#A51818' },
      { name:'Tusk Gold',hex:'#EBB010' },
      { name:'Ivory',    hex:'#FFF2C2' },
    ],
    owns: 'SATURATED warm',
    rationale: 'No change. The bright SEC crimson+gold stays as the warm-saturated anchor. Other two teams move to give it breathing room.',
  },
  {
    id: 'maples', name: 'MAPLES',
    currentLabel: 'Kyoto Momiji',
    proposedLabel: 'Oxblood Momiji',
    changeTag: 'SHIFT',
    currentPal: [
      { name:'Cream',     hex:'#FDF4D4' },
      { name:'Amber',     hex:'#F59E0B' },
      { name:'Persimmon', hex:'#EA580C' },
      { name:'Crimson',   hex:'#B91C1C' },
      { name:'Mahogany',  hex:'#451A03' },
    ],
    proposedPal: [
      { name:'Cream',      hex:'#FDF4D4' },
      { name:'Gold Vein',  hex:'#FCD34D' },
      { name:'Persimmon',  hex:'#D97706' },
      { name:'Russet',     hex:'#8B4513' },
      { name:'Wine',       hex:'#7A1E2E' },
      { name:'Aubergine',  hex:'#2E0A14' },
    ],
    owns: 'DESATURATED warm — wine & plum',
    rationale: 'Kills the bright scarlet middle stops that clashed with Boars. Shifts dominant hue to wine-burgundy with amber veins. Reads as a Japanese ornamental maple late in autumn — the "gentleman\'s team" Stanford/Wisconsin cardinal tone, not the loud SEC red.',
  },
  {
    id: 'raccoons', name: 'RACCOONS',
    currentLabel: 'Noir + Amber (warm)',
    proposedLabel: 'Moonshine Silver',
    changeTag: 'INVERT',
    currentPal: [
      { name:'Cream',     hex:'#FFF6E0' },
      { name:'Copper Tan',hex:'#E8B47A' },
      { name:'Amber',     hex:'#FF8C00' },
      { name:'Copper',    hex:'#C2410C' },
      { name:'Noir',      hex:'#000000' },
    ],
    proposedPal: [
      { name:'Moonlight', hex:'#F4F4F5' },
      { name:'Pewter',    hex:'#D4D4D8' },
      { name:'Slate Fog', hex:'#71717A' },
      { name:'Storm',     hex:'#27272A' },
      { name:'Noir',      hex:'#09090B' },
      { name:'Amber Eye', hex:'#FF8C00' },
    ],
    owns: 'COOL body + amber focal',
    rationale: 'Strips warm body entirely. Face, ears, and mask go cool silver/pewter. Amber stays ONLY in the eyes — inverted from surface color to concentrated focal jewel. Ties to the "Moonshine Creek" moonlight narrative. Amber reads stronger by being the single warm hit in a cold palette.',
  },
];

function wrap(inner, size = 320) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

const rows = TEAMS.map((t, idx) => {
  const left = LEFT[t.id];
  const right = RIGHT[t.id];
  const curPal = t.currentPal.map(p => `<span class="sw" style="background:${p.hex};" title="${p.name} ${p.hex}"></span>`).join('');
  const proPal = t.proposedPal.map(p => `<span class="sw" style="background:${p.hex};" title="${p.name} ${p.hex}"></span>`).join('');
  const proPalFull = t.proposedPal.map(p => `
    <div class="chip">
      <div class="chip-sw" style="background:${p.hex};"></div>
      <div class="chip-meta"><div class="chip-name">${p.name}</div><div class="chip-hex">${p.hex}</div></div>
    </div>`).join('');

  const tagClass = t.changeTag === 'LOCKED' ? 'locked' : (t.changeTag === 'SHIFT' ? 'shift' : 'invert');
  return `
  <section class="row">
    <div class="row-hd">
      <div class="row-num">${String(idx+1).padStart(2,'0')}</div>
      <h2>${t.name}</h2>
      <div class="owns"><span class="owns-label">Owns</span>${t.owns}</div>
      <div class="tag ${tagClass}">${t.changeTag}</div>
    </div>

    <div class="compare">
      <div class="col current">
        <div class="col-label">CURRENT</div>
        <div class="stage">
          <div class="logo">${wrap(left, 320)}</div>
        </div>
        <div class="name">${t.currentLabel}</div>
        <div class="pal">${curPal}</div>
      </div>

      <div class="arrow">→</div>

      <div class="col proposed">
        <div class="col-label">PROPOSED</div>
        <div class="stage">
          <div class="logo">${wrap(right, 320)}</div>
        </div>
        <div class="name">${t.proposedLabel}</div>
        <div class="pal">${proPal}</div>
      </div>
    </div>

    <div class="rationale">
      <div class="rat-label">Why</div>
      <p>${t.rationale}</p>
    </div>

    <div class="full-pal">
      <div class="fp-label">Proposed Palette · ${t.proposedPal.length} Stops</div>
      <div class="fp-grid">${proPalFull}</div>
    </div>
  </section>`;
}).join('');

// Conference-wide color map grid
const CONFERENCE = [
  { name:'Boars',       col:'Warm · High',  sig:'Crimson + Gold',   c1:'#8B0000', c2:'#EBB010', state:'LOCKED' },
  { name:'Dolphins',    col:'Warm · High',  sig:'Coral → Prussian', c1:'#FF7EB3', c2:'#2E0854', state:'LOCKED' },
  { name:'Spectres',    col:'Cool · Low',   sig:'Ice → Midnight',   c1:'#5DADE2', c2:'#020510', state:'LOCKED' },
  { name:'Serpents',    col:'Cool · Mid',   sig:'Teal + Gold Eye',  c1:'#0F766E', c2:'#F5C542', state:'LOCKED' },
  { name:'Pronghorns',  col:'Mixed · Mid',  sig:'Forest + Amber',   c1:'#15803D', c2:'#F59E0B', state:'LOCKED' },
  { name:'Salamanders', col:'Hot · Max',    sig:'Fauvist Triadic',  c1:'#2ECC71', c2:'#E84393', state:'LOCKED' },
  { name:'Maples',      col:'Warm · LOW',   sig:'Wine + Plum',      c1:'#7A1E2E', c2:'#D97706', state:'SHIFT' },
  { name:'Raccoons',    col:'COOL + focal', sig:'Silver + Amber Eye', c1:'#D4D4D8', c2:'#FF8C00', state:'INVERT' },
];

const confRows = CONFERENCE.map(c => `
  <tr class="${c.state === 'LOCKED' ? 'locked-row' : 'changed-row'}">
    <td class="c-name">${c.name}</td>
    <td class="c-col">${c.col}</td>
    <td class="c-sig">${c.sig}</td>
    <td class="c-sw"><span class="dot" style="background:${c.c1};"></span><span class="dot" style="background:${c.c2};"></span></td>
    <td class="c-state"><span class="st-${c.state.toLowerCase()}">${c.state}</span></td>
  </tr>`).join('');

const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<title>TORCH — Triad Rebalance · Boars · Maples · Raccoons</title>
<link href="https://fonts.googleapis.com/css2?family=Teko:wght@300;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Rajdhani:wght@400;500;600;700&family=Fraunces:ital,wght@0,400;1,300&display=swap" rel="stylesheet">
<style>
  :root {
    --bg:#07060A;
    --tile:#15121E;
    --tile-2:#1C1828;
    --line:rgba(255,255,255,0.07);
    --line-2:rgba(255,255,255,0.14);
    --ink:#F5F0E8;
    --dim:#8A827A;
    --faint:#4A4458;
    --gold:#EBB010;
  }
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{background:var(--bg);color:var(--ink);font-family:'Rajdhani',sans-serif;min-height:100vh;}
  body{padding:56px 32px 96px;
    background:
      radial-gradient(1200px 700px at 20% -10%, rgba(235,176,16,0.07), transparent 60%),
      var(--bg);
  }

  .head{max-width:1700px;margin:0 auto 48px;padding-bottom:28px;border-bottom:1px solid var(--line-2);}
  .kicker{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:5px;color:var(--gold);text-transform:uppercase;margin-bottom:14px;}
  h1{font-family:'Teko',sans-serif;font-weight:500;font-size:72px;line-height:0.88;letter-spacing:-0.02em;text-transform:uppercase;}
  h1 em{font-family:'Fraunces',serif;font-style:italic;font-weight:300;color:var(--gold);font-size:0.5em;text-transform:none;display:block;margin-top:4px;letter-spacing:0;}
  .sub{color:var(--dim);font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-top:14px;max-width:820px;line-height:1.6;}

  .row{max-width:1700px;margin:0 auto 64px;background:linear-gradient(180deg, var(--tile-2) 0%, var(--tile) 100%);border:1px solid var(--line);border-radius:6px;padding:32px 40px 36px;}

  .row-hd{display:flex;align-items:baseline;gap:18px;padding-bottom:22px;margin-bottom:28px;border-bottom:1px solid var(--line);}
  .row-num{font-family:'Teko',sans-serif;font-weight:300;font-size:40px;color:var(--gold);line-height:0.85;}
  .row h2{font-family:'Teko',sans-serif;font-weight:600;font-size:42px;letter-spacing:2px;text-transform:uppercase;}
  .owns{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;color:var(--ink);text-transform:uppercase;margin-left:12px;}
  .owns-label{color:var(--dim);margin-right:8px;}

  .tag{margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:3px;padding:5px 11px;border-radius:2px;}
  .tag.locked{color:var(--dim);border:1px solid var(--line-2);}
  .tag.shift{color:#F59E0B;border:1px solid rgba(245,158,11,0.4);background:rgba(245,158,11,0.07);}
  .tag.invert{color:#06B6D4;border:1px solid rgba(6,182,212,0.4);background:rgba(6,182,212,0.07);}

  .compare{display:grid;grid-template-columns:1fr 60px 1fr;align-items:center;gap:20px;margin-bottom:32px;}
  .col{display:flex;flex-direction:column;align-items:center;gap:14px;padding:20px;border:1px solid var(--line);border-radius:4px;background:rgba(0,0,0,0.25);}
  .col.current{border-color:rgba(139,139,139,0.2);}
  .col.proposed{border-color:rgba(235,176,16,0.3);background:rgba(235,176,16,0.02);}
  .col-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:3px;color:var(--dim);text-transform:uppercase;}
  .col.proposed .col-label{color:var(--gold);}
  .stage{width:100%;height:360px;display:flex;align-items:center;justify-content:center;border-radius:4px;background:radial-gradient(ellipse at center, rgba(255,255,255,0.03), transparent 70%);border:1px solid var(--line);}
  .stage svg{filter:drop-shadow(0 22px 38px rgba(0,0,0,0.8));}
  .name{font-family:'Teko',sans-serif;font-weight:500;font-size:22px;letter-spacing:1.5px;text-transform:uppercase;}
  .pal{display:flex;gap:8px;}
  .sw{width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,0.15);display:inline-block;}

  .arrow{font-family:'Teko',sans-serif;font-weight:300;font-size:48px;color:var(--gold);text-align:center;opacity:0.6;}

  .rationale{padding:22px 24px;background:rgba(255,255,255,0.02);border-left:3px solid var(--gold);border-radius:2px;margin-bottom:28px;}
  .rat-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--gold);text-transform:uppercase;margin-bottom:10px;}
  .rationale p{font-family:'Rajdhani',sans-serif;font-weight:500;font-size:15px;line-height:1.6;color:var(--ink);opacity:0.9;}

  .full-pal{padding-top:8px;}
  .fp-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:3px;color:var(--dim);text-transform:uppercase;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--line);}
  .fp-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;}
  .chip{display:flex;flex-direction:column;gap:8px;}
  .chip-sw{width:100%;aspect-ratio:2/1;border-radius:3px;border:1px solid rgba(255,255,255,0.1);box-shadow:inset 0 -12px 24px rgba(0,0,0,0.15);}
  .chip-name{font-family:'Teko',sans-serif;font-weight:500;font-size:13px;letter-spacing:1px;text-transform:uppercase;line-height:1.1;}
  .chip-hex{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1px;color:var(--dim);margin-top:2px;}

  /* Conference map table */
  .conf{max-width:1700px;margin:64px auto 0;background:linear-gradient(180deg, var(--tile-2) 0%, var(--tile) 100%);border:1px solid var(--line);border-radius:6px;padding:32px 40px 36px;}
  .conf h3{font-family:'Teko',sans-serif;font-weight:500;font-size:34px;letter-spacing:-0.01em;text-transform:uppercase;margin-bottom:18px;}
  .conf p{color:var(--dim);font-size:13px;letter-spacing:1px;margin-bottom:22px;}
  .conf table{width:100%;border-collapse:collapse;}
  .conf th, .conf td{padding:12px 14px;text-align:left;font-family:'Rajdhani',sans-serif;font-size:14px;border-bottom:1px solid var(--line);}
  .conf th{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;color:var(--dim);text-transform:uppercase;font-weight:500;}
  .c-name{font-family:'Teko',sans-serif;font-weight:600;font-size:18px;letter-spacing:1.5px;text-transform:uppercase;}
  .c-col{color:var(--dim);font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:1px;}
  .c-sig{font-family:'Fraunces',serif;font-style:italic;font-size:15px;}
  .c-sw{display:flex;gap:6px;}
  .dot{width:22px;height:22px;border-radius:50%;border:1px solid rgba(255,255,255,0.15);}
  .st-locked{color:var(--dim);font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2px;padding:3px 8px;border:1px solid var(--line-2);border-radius:2px;}
  .st-shift{color:#F59E0B;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2px;padding:3px 8px;border:1px solid rgba(245,158,11,0.4);background:rgba(245,158,11,0.07);border-radius:2px;}
  .st-invert{color:#06B6D4;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2px;padding:3px 8px;border:1px solid rgba(6,182,212,0.4);background:rgba(6,182,212,0.07);border-radius:2px;}
  .changed-row{background:rgba(235,176,16,0.03);}

  .footer{max-width:1700px;margin:64px auto 0;padding-top:28px;border-top:1px solid var(--line);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;color:var(--faint);text-transform:uppercase;display:flex;justify-content:space-between;}
</style>
</head><body>

<div class="head">
  <div class="kicker">Torch Football · Brand Ops · Triad Rebalance</div>
  <h1>Three Teams, Three Corners
    <em>separating Boars, Maples, Raccoons into unique color territory</em>
  </h1>
  <div class="sub">All three sat in the warm-saturated bucket. The fix: each owns a different dimension of color space. Boars stays bright-warm. Maples drops to muted wine-plum. Raccoons inverts entirely — cool silver body with amber as a single focal eye.</div>
</div>

${rows}

<section class="conf">
  <h3>Conference Color Map — After Rebalance</h3>
  <p>Each team claims a distinct cell. No two teams overlap on thermal + saturation + signature hue.</p>
  <table>
    <thead><tr><th>Team</th><th>Thermal · Saturation</th><th>Signature</th><th>Swatches</th><th>State</th></tr></thead>
    <tbody>${confRows}</tbody>
  </table>
</section>

<div class="footer">
  <span>/public/mockups/triad-rebalance.html</span>
  <span>Generated ${new Date().toISOString().slice(0,10)}</span>
</div>

</body></html>`;

fs.writeFileSync('/Users/brock/torch-football/public/mockups/triad-rebalance.html', html);
console.log('wrote triad-rebalance.html');
