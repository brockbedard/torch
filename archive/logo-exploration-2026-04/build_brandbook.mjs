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
// FINAL PICKS — each team's chosen logo
// =========================================================================

// BOARS — A CURRENT (crimson → gold, keep as-is)
const boars = extractMarkup('sentinels');

// DOLPHINS — J "Oracle's Wave" (flipped gradient, coral head → Prussian tail)
let dolphins = replaceGradient(extractMarkup('wolves'), 'dolphin-grad',
  '<stop offset="0" stop-color="#FFF6E4"/>' +
  '<stop offset="0.07" stop-color="#FFCFD8"/>' +
  '<stop offset="0.2" stop-color="#FF7EB3"/>' +
  '<stop offset="0.38" stop-color="#D13A7A"/>' +
  '<stop offset="0.58" stop-color="#6B1E7F"/>' +
  '<stop offset="0.8" stop-color="#2E0854"/>' +
  '<stop offset="1" stop-color="#080118"/>');

// SPECTRES — J "Eclipse Corona" (white crown → midnight tail)
let spectres = replaceGradient(extractMarkup('stags'), 'ghost-grad',
  '<stop offset="0" stop-color="#FFF4D4"/>' +
  '<stop offset="0.14" stop-color="#FFFFFF"/>' +
  '<stop offset="0.32" stop-color="#D4ECFA"/>' +
  '<stop offset="0.55" stop-color="#5DADE2"/>' +
  '<stop offset="0.78" stop-color="#1B4F72"/>' +
  '<stop offset="0.94" stop-color="#0B1E3B"/>' +
  '<stop offset="1" stop-color="#020510"/>');
spectres = replaceAll(spectres, [['#8FB3D6','#B8D9EE'],['#6A98C0','#4A88B8']]);

// SERPENTS — D "Quetzalcoatl Myth" (teal Quetzalcoatl, gold eyes)
let serpents = replaceGradient(extractMarkup('serpents'), 'serpent-grad',
  '<stop offset="0" stop-color="#0A1F1E"/>' +
  '<stop offset="0.35" stop-color="#0F766E"/>' +
  '<stop offset="0.7" stop-color="#14B8A6"/>' +
  '<stop offset="1" stop-color="#5EEAD4"/>');
serpents = replaceAll(serpents, [['#39FF14','#F5C542'],['#0a0118','#0A1F1E']]);

// PRONGHORNS — CURRENT A (original forest body + cream-to-amber antler)
const pronghorns = extractMarkup('pronghorns');

// SALAMANDERS — H "Fauvist Triadic" (Matisse pure triadic — green + pink + orange + yellow)
let salamanders = replaceGradient(extractMarkup('salamanders'), 'salamander-body',
  '<stop offset="0" stop-color="#2ECC71"/>' +
  '<stop offset="0.3" stop-color="#E84393"/>' +
  '<stop offset="0.6" stop-color="#F39C12"/>' +
  '<stop offset="0.85" stop-color="#F1C40F"/>' +
  '<stop offset="1" stop-color="#E8F4D4"/>');
salamanders = replaceAll(salamanders, [['#06B6D4','#8E44AD'],['#B91C1C','#2ECC71'],['#8b2800','#186A3B']]);

// MAPLES — "Oxblood Momiji" (wine-burgundy dominant, gentleman's-autumn muted)
let maples = replaceGradient(extractMarkup('maples'), 'maple-leaf',
  '<stop offset="0" stop-color="#FDF4D4"/>' +
  '<stop offset="0.18" stop-color="#FCD34D"/>' +
  '<stop offset="0.35" stop-color="#D97706"/>' +
  '<stop offset="0.55" stop-color="#8B4513"/>' +
  '<stop offset="0.75" stop-color="#7A1E2E"/>' +
  '<stop offset="0.9" stop-color="#4A1020"/>' +
  '<stop offset="1" stop-color="#2E0A14"/>');
maples = replaceAll(maples, [
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

// RACCOONS — "Moonshine Silver" (cool silver body, noir mask, amber focal eyes only)
let raccoons = replaceGradient(extractMarkup('raccoons'), 'raccoon-face',
  '<stop offset="0" stop-color="#F4F4F5"/>' +
  '<stop offset="0.25" stop-color="#D4D4D8"/>' +
  '<stop offset="0.55" stop-color="#71717A"/>' +
  '<stop offset="0.82" stop-color="#27272A"/>' +
  '<stop offset="1" stop-color="#09090B"/>');
raccoons = replaceGradient(raccoons, 'raccoon-mask',
  '<stop offset="0" stop-color="#1F2937"/>' +
  '<stop offset="0.4" stop-color="#0A0E1A"/>' +
  '<stop offset="0.8" stop-color="#030408"/>' +
  '<stop offset="1" stop-color="#000000"/>');
raccoons = replaceGradient(raccoons, 'raccoon-ears',
  '<stop offset="0" stop-color="#E5E7EB"/>' +
  '<stop offset="0.35" stop-color="#9CA3AF"/>' +
  '<stop offset="0.7" stop-color="#52525B"/>' +
  '<stop offset="1" stop-color="#1F2937"/>');
raccoons = replaceGradient(raccoons, 'raccoon-eyes',
  '<stop offset="0" stop-color="#FFF4B8"/>' +
  '<stop offset="0.3" stop-color="#FFD440"/>' +
  '<stop offset="0.6" stop-color="#FF8C00"/>' +
  '<stop offset="0.85" stop-color="#C2410C"/>' +
  '<stop offset="1" stop-color="#5C1A02"/>');

const LOGOS = {
  sentinels: suffixIds(boars, '-BB'),
  wolves: suffixIds(dolphins, '-BB'),
  stags: suffixIds(spectres, '-BB'),
  serpents: suffixIds(serpents, '-BB'),
  pronghorns: suffixIds(pronghorns, '-BB'),
  salamanders: suffixIds(salamanders, '-BB'),
  maples: suffixIds(maples, '-BB'),
  raccoons: suffixIds(raccoons, '-BB'),
};

// Per-team branding definitions
const TEAMS = [
  {
    id: 'sentinels', name: 'BOARS', school: 'Ridgemont University', abbr: 'RDG',
    established: 'Season 1', conference: 'Torch Conference',
    concept: 'Ember Crown',
    story: 'Built in the hills, forged through discipline. The Boars play punishing, patient football — every yard earned, every hit remembered. They do not chase points. They grind.',
    motto: 'Eyes Up, Hands Ready.',
    voice: ['Patient.', 'Physical.', 'Unmoved.'],
    offScheme: 'POWER SPREAD', defScheme: 'PRESS MAN',
    analog: 'Georgia · Alabama',
    palette: [
      { name: 'Ridgemont Crimson', hex: '#8B0000', role: 'Primary' },
      { name: 'Ember Heart',       hex: '#C52C1E', role: 'Ember' },
      { name: 'Tusk Gold',         hex: '#EBB010', role: 'Secondary' },
      { name: 'Obsidian',          hex: '#0A0302', role: 'Shadow' },
      { name: 'Ivory Gleam',       hex: '#FFF2C2', role: 'Highlight' },
    ],
    taglines: ['Ridgemont rolls.', 'Trust the grind.', 'Next rep.'],
  },
  {
    id: 'wolves', name: 'DOLPHINS', school: 'Coral Bay State', abbr: 'CBS',
    established: 'Season 1', conference: 'Torch Conference',
    concept: "Oracle's Wave",
    story: "Born of the reef, quick as a current. Coral Bay plays a ballet of motion — option, misdirection, tempo. If you blink, they've already scored.",
    motto: 'Ride The Current.',
    voice: ['Fluid.', 'Electric.', 'Inevitable.'],
    offScheme: 'SPREAD OPTION', defScheme: 'COVER 1 + SPY',
    analog: 'Oregon · Rich Rodriguez',
    palette: [
      { name: 'Coral Pink',     hex: '#FF7EB3', role: 'Primary' },
      { name: 'Bay Magenta',    hex: '#D13A7A', role: 'Body' },
      { name: 'Deep Wine',      hex: '#6B1E7F', role: 'Depth' },
      { name: 'Prussian Shadow',hex: '#2E0854', role: 'Shadow' },
      { name: 'Foam Cream',     hex: '#FFF6E4', role: 'Highlight' },
    ],
    taglines: ['Tempo is the point.', 'You are already behind.', 'One more wave.'],
  },
  {
    id: 'stags', name: 'SPECTRES', school: 'Hollowridge College', abbr: 'HLR',
    established: 'Season 1', conference: 'Torch Conference',
    concept: 'Eclipse Corona',
    story: 'A school of ghosts in the Appalachian fog. Hollowridge plays above you — the route tree is a séance, and the field feels haunted in the fourth quarter.',
    motto: 'Strike From The Shadows.',
    voice: ['Explosive.', 'Fearless.', 'Unknowable.'],
    offScheme: 'SPREAD RPO', defScheme: 'COVER 0 BLITZ',
    analog: 'Oregon State · Baylor',
    palette: [
      { name: 'Hollow White',    hex: '#FFFFFF', role: 'Corona' },
      { name: 'Ghost Gold',      hex: '#FFF4D4', role: 'Highlight' },
      { name: 'Spectre Ice',     hex: '#5DADE2', role: 'Primary' },
      { name: 'Ridge Midnight',  hex: '#1B4F72', role: 'Body' },
      { name: 'Abyss',           hex: '#020510', role: 'Shadow' },
    ],
    taglines: ['You cannot see us.', 'The fourth is ours.', 'Boo.'],
  },
  {
    id: 'serpents', name: 'SERPENTS', school: 'Blackwater State', abbr: 'BWS',
    established: 'Season 1', conference: 'Torch Conference',
    concept: 'Quetzalcoatl',
    story: 'A Saban-school of patient killers. Blackwater never rushes. They let you hang yourself on third down. Then they coil and strike — the feathered serpent of the Torch Conference.',
    motto: 'Death by a Thousand Cuts.',
    voice: ['Cerebral.', 'Methodical.', 'Patient.'],
    offScheme: 'AIR RAID', defScheme: 'PATTERN MATCH',
    analog: 'Saban · Kirby Smart',
    palette: [
      { name: 'Obsidian Teal',  hex: '#0A1F1E', role: 'Shadow' },
      { name: 'Delta Forest',   hex: '#0F766E', role: 'Primary' },
      { name: 'Blackwater',     hex: '#14B8A6', role: 'Body' },
      { name: 'Venom Mint',     hex: '#5EEAD4', role: 'Highlight' },
      { name: 'Jewel Amber',    hex: '#F5C542', role: 'Eye' },
    ],
    taglines: ['Patience, then strike.', 'The field is long.', 'Third and seven.'],
  },
  {
    id: 'pronghorns', name: 'PRONGHORNS', school: 'Cedar Creek Agricultural', abbr: 'CED',
    established: 'Season 2', conference: 'Torch Conference',
    concept: 'Cedar Creek',
    story: "The fastest animal in the western hemisphere plays at Cedar Creek. Everything is built for the second-level cut. If they get to the linebacker, they're gone.",
    motto: 'Outrun The Horizon.',
    voice: ['Fast.', 'Precise.', 'Relentless.'],
    offScheme: 'ZONE READ SPREAD', defScheme: 'QUARTERS MATCH',
    analog: 'Oregon Ducks · Texas Tech',
    palette: [
      { name: 'Creek Forest',  hex: '#062014', role: 'Shadow' },
      { name: 'Evergreen',     hex: '#166534', role: 'Primary' },
      { name: 'Pasture Green', hex: '#22C55E', role: 'Body' },
      { name: 'Antler Gold',   hex: '#F59E0B', role: 'Secondary' },
      { name: 'Prairie Cream', hex: '#FEF3C7', role: 'Highlight' },
    ],
    taglines: ['Catch us if you can.', 'Second level. Gone.', 'Cedar runs.'],
  },
  {
    id: 'salamanders', name: 'SALAMANDERS', school: 'Ashland Polytechnic', abbr: 'ASH',
    established: 'Season 2', conference: 'Torch Conference',
    concept: 'Fauvist Triadic',
    story: "Ashland Poly plays football like a Matisse painting — pure saturated triadic color, every decision shouting from across the field. There is no muted middle register. Every play is a choice to be seen.",
    motto: 'Loud On Purpose.',
    voice: ['Saturated.', 'Audacious.', 'Unmistakable.'],
    offScheme: 'PISTOL RPO', defScheme: 'MULTIPLE FRONT',
    analog: 'Ole Miss · Washington State',
    palette: [
      { name: 'Atelier Green',   hex: '#2ECC71', role: 'Primary' },
      { name: 'Fauvist Pink',    hex: '#E84393', role: 'Body' },
      { name: 'Chrome Orange',   hex: '#F39C12', role: 'Secondary' },
      { name: 'Cadmium Yellow',  hex: '#F1C40F', role: 'Highlight' },
      { name: 'Spot Violet',     hex: '#8E44AD', role: 'Accent (spots)' },
    ],
    taglines: ['Loud on purpose.', 'Every color at once.', 'See us from the back row.'],
  },
  {
    id: 'maples', name: 'MAPLES', school: 'Autumnvale Northern', abbr: 'AVN',
    established: 'Season 2', conference: 'Torch Conference',
    concept: 'Oxblood Momiji',
    story: 'Autumnvale is old-football — a gentleman\'s team that still plays a two-back, under-center offense. Their colors are the late-autumn ornamental maple, deep wine fading to aubergine. There is nothing cute about it, and that is the point.',
    motto: 'Trust The Harvest.',
    voice: ['Traditional.', 'Disciplined.', 'Timeless.'],
    offScheme: 'PRO STYLE', defScheme: 'BEND-NOT-BREAK',
    analog: 'Stanford · Wisconsin',
    palette: [
      { name: 'Autumn Cream',    hex: '#FDF4D4', role: 'Highlight' },
      { name: 'Gold Vein',       hex: '#FCD34D', role: 'Accent' },
      { name: 'Persimmon',       hex: '#D97706', role: 'Secondary' },
      { name: 'Russet',          hex: '#8B4513', role: 'Body' },
      { name: 'Autumnvale Wine', hex: '#7A1E2E', role: 'Primary' },
      { name: 'Aubergine',       hex: '#2E0A14', role: 'Shadow' },
    ],
    taglines: ['Trust the harvest.', 'Old ball.', 'The leaves know.'],
  },
  {
    id: 'raccoons', name: 'RACCOONS', school: 'Moonshine Creek State', abbr: 'MCR',
    established: 'Season 2', conference: 'Torch Conference',
    concept: 'Moonshine Silver',
    story: "Moonshine Creek plays at night. Their whole offense is trickery — motions, reverses, double-passes. Silver fur in moonlight, a bandit mask in true shadow, and a single amber eye glinting in the dark. You're never sure what the call was until it's already a touchdown.",
    motto: "What's Yours Is Ours.",
    voice: ['Sly.', 'Opportunistic.', 'Unbothered.'],
    offScheme: 'WILDCAT HYBRID', defScheme: 'ZONE BLITZ',
    analog: 'App State · Boise State',
    palette: [
      { name: 'Moonlight',    hex: '#F4F4F5', role: 'Highlight' },
      { name: 'Pewter',       hex: '#D4D4D8', role: 'Primary' },
      { name: 'Slate Fog',    hex: '#71717A', role: 'Body' },
      { name: 'Storm Noir',   hex: '#27272A', role: 'Shadow' },
      { name: 'Bandit Black', hex: '#000000', role: 'Mask' },
      { name: 'Amber Eye',    hex: '#FF8C00', role: 'Focal Accent' },
    ],
    taglines: ["What's yours is ours.", 'Check the tape.', 'Lights out.'],
  },
];

function wrap(inner, size = 420) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

// ---- COVER GRID ----
const coverGrid = TEAMS.map(t => `
  <div class="cov-cell" style="--team-primary:${t.palette[0].hex};">
    <div class="cov-logo">${wrap(LOGOS[t.id], 150)}</div>
    <div class="cov-name">${t.name}</div>
    <div class="cov-sub">${t.abbr} · ${t.established}</div>
  </div>`).join('');

// ---- PER-TEAM SPREADS ----
const spreads = TEAMS.map((t, idx) => {
  const pri = t.palette[0].hex;
  const paletteRow = t.palette.map(p => `
    <div class="sw" style="--c:${p.hex};">
      <div class="sw-chip"></div>
      <div class="sw-meta">
        <div class="sw-name">${p.name}</div>
        <div class="sw-hex">${p.hex}</div>
        <div class="sw-role">${p.role}</div>
      </div>
    </div>`).join('');

  const voiceRow = t.voice.map(v => `<span class="voice-word">${v}</span>`).join('<span class="voice-sep">·</span>');
  const taglineRow = t.taglines.map(l => `<li>${l}</li>`).join('');

  return `
  <section class="spread" id="${t.id}" style="--team-primary:${pri};">
    <div class="spread-left">
      <div class="spread-index">${String(idx+1).padStart(2,'0')} / 08</div>
      <div class="spread-kicker">${t.established} · ${t.conference}</div>
      <h2 class="spread-title">${t.name}</h2>
      <div class="spread-school">${t.school}</div>
      <div class="spread-concept"><span class="concept-tag">Concept</span><em>${t.concept}</em></div>

      <div class="motto-block">
        <div class="motto-label">Official Motto</div>
        <div class="motto">"${t.motto}"</div>
      </div>

      <div class="story">${t.story}</div>

      <div class="schema">
        <div class="schema-row"><span class="schema-label">Offense</span><span class="schema-val">${t.offScheme}</span></div>
        <div class="schema-row"><span class="schema-label">Defense</span><span class="schema-val">${t.defScheme}</span></div>
        <div class="schema-row"><span class="schema-label">Plays Like</span><span class="schema-val">${t.analog}</span></div>
      </div>

      <div class="voice-block">
        <div class="voice-label">Voice</div>
        <div class="voice-words">${voiceRow}</div>
      </div>

      <div class="taglines">
        <div class="taglines-label">Taglines & Usage</div>
        <ul>${taglineRow}</ul>
      </div>
    </div>

    <div class="spread-right">
      <div class="stage">
        <div class="stage-grid"></div>
        <div class="logo-hero">${wrap(LOGOS[t.id], 440)}</div>
      </div>

      <div class="palette">
        <div class="palette-label">Color System · 05 Stops</div>
        <div class="palette-grid">${paletteRow}</div>
      </div>

      <div class="type-block">
        <div class="type-label">Typography in Motion</div>
        <div class="type-display" style="color:${pri};">${t.name}</div>
        <div class="type-sub">${t.abbr} · ${t.school.toUpperCase()}</div>
        <div class="type-body">${t.story.split('.')[0]}.</div>
      </div>

      <div class="mini-apps">
        <div class="mini-card" style="background:${pri};">
          <div class="mini-logo">${wrap(LOGOS[t.id], 48)}</div>
          <div class="mini-text">
            <div class="mini-abbr">${t.abbr}</div>
            <div class="mini-name">${t.name}</div>
          </div>
        </div>
        <div class="mini-ticket">
          <div class="mini-ticket-logo">${wrap(LOGOS[t.id], 30)}</div>
          <div class="mini-ticket-text">
            <div class="mt-l">${t.abbr}</div>
            <div class="mt-m">VS · OPP</div>
          </div>
          <div class="mini-ticket-score" style="color:${pri};">24</div>
        </div>
      </div>
    </div>
  </section>`;
}).join('');

const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<title>TORCH — Team Brand Book</title>
<link href="https://fonts.googleapis.com/css2?family=Teko:wght@300;400;500;600;700&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Fraunces:ital,wght@0,400;0,600;1,300;1,400&display=swap" rel="stylesheet">
<style>
  :root {
    --bg:#07060A;
    --bg-2:#0F0C18;
    --tile:#141018;
    --tile-2:#1C1828;
    --line:rgba(255,255,255,0.07);
    --line-2:rgba(255,255,255,0.14);
    --ink:#F5F0E8;
    --dim:#8A827A;
    --faint:#4A4458;
    --gold:#EBB010;
    --torch:#FF4511;
  }
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{background:var(--bg);color:var(--ink);font-family:'Rajdhani',sans-serif;min-height:100vh;}

  /* Noise overlay */
  body::before{
    content:"";position:fixed;inset:0;pointer-events:none;opacity:0.03;z-index:99;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='220' height='220' filter='url(%23n)'/></svg>");
  }

  /* ==================== COVER ==================== */
  .cover{
    min-height:940px;
    padding:80px 48px 64px;
    display:flex;flex-direction:column;justify-content:space-between;
    background:
      radial-gradient(1400px 900px at 15% -10%, rgba(235,176,16,0.09), transparent 60%),
      radial-gradient(1100px 700px at 88% 5%, rgba(255,69,17,0.06), transparent 55%),
      var(--bg);
    position:relative;border-bottom:1px solid var(--line-2);
  }
  .cover-hd{display:flex;justify-content:space-between;align-items:flex-start;}
  .cov-brand{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:6px;color:var(--gold);text-transform:uppercase;}
  .cov-brand span{color:var(--torch);}
  .cov-meta{text-align:right;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;color:var(--faint);text-transform:uppercase;line-height:1.6;}
  .cov-meta b{color:var(--gold);}

  .cov-hero{max-width:1600px;margin:48px auto 0;}
  .cov-eyebrow{font-family:'Fraunces',serif;font-weight:300;font-style:italic;font-size:22px;color:var(--gold);letter-spacing:1px;margin-bottom:18px;}
  .cov-title{font-family:'Teko',sans-serif;font-weight:500;font-size:160px;line-height:0.85;letter-spacing:-0.04em;text-transform:uppercase;}
  .cov-title .small{font-size:0.45em;color:var(--dim);font-weight:300;display:block;letter-spacing:0;margin-top:8px;text-transform:none;font-family:'Fraunces',serif;font-style:italic;}
  .cov-desc{color:var(--dim);font-size:15px;letter-spacing:2px;text-transform:uppercase;margin-top:28px;max-width:820px;line-height:1.6;}

  .cov-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:64px;max-width:1600px;margin-left:auto;margin-right:auto;}
  .cov-cell{
    background:linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
    border:1px solid var(--line);border-radius:4px;
    padding:24px 18px;display:flex;flex-direction:column;align-items:center;gap:12px;
    position:relative;overflow:hidden;
  }
  .cov-cell::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:var(--team-primary);opacity:0.8;}
  .cov-cell svg{filter:drop-shadow(0 10px 18px rgba(0,0,0,0.6));}
  .cov-name{font-family:'Teko',sans-serif;font-weight:600;font-size:24px;letter-spacing:2px;text-transform:uppercase;margin-top:4px;}
  .cov-sub{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--dim);text-transform:uppercase;}

  .cov-ft{margin-top:48px;display:flex;justify-content:space-between;align-items:flex-end;border-top:1px solid var(--line);padding-top:24px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;color:var(--faint);text-transform:uppercase;}

  /* ==================== SPREADS ==================== */
  .spread{
    min-height:1180px;padding:80px 48px 80px;
    display:grid;grid-template-columns:minmax(0, 420px) 1fr;gap:64px;
    max-width:1800px;margin:0 auto;
    border-bottom:1px solid var(--line);
    position:relative;
  }
  .spread::before{
    content:"";position:absolute;top:0;left:0;width:6px;height:100%;
    background:linear-gradient(180deg, var(--team-primary) 0%, transparent 100%);
    opacity:0.6;
  }
  .spread-left{padding-top:40px;}
  .spread-index{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:3px;color:var(--dim);margin-bottom:8px;}
  .spread-kicker{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:3px;color:var(--team-primary);margin-bottom:20px;}
  .spread-title{font-family:'Teko',sans-serif;font-weight:500;font-size:92px;line-height:0.88;letter-spacing:-0.02em;text-transform:uppercase;color:var(--team-primary);text-shadow:0 0 24px color-mix(in srgb, var(--team-primary) 20%, transparent);}
  .spread-school{font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:20px;color:var(--dim);margin-top:4px;}
  .spread-concept{margin-top:22px;display:flex;align-items:center;gap:12px;}
  .concept-tag{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--dim);text-transform:uppercase;padding:3px 8px;border:1px solid var(--line-2);border-radius:2px;}
  .spread-concept em{font-family:'Fraunces',serif;font-style:italic;font-size:18px;color:var(--ink);font-weight:400;}

  .motto-block{margin-top:36px;padding:22px 0 22px 20px;border-left:3px solid var(--team-primary);}
  .motto-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--dim);text-transform:uppercase;margin-bottom:10px;}
  .motto{font-family:'Fraunces',serif;font-style:italic;font-weight:400;font-size:26px;line-height:1.3;color:var(--ink);}

  .story{margin-top:28px;font-family:'Rajdhani',sans-serif;font-weight:500;font-size:15px;line-height:1.65;color:var(--ink);opacity:0.85;}

  .schema{margin-top:32px;padding:20px;background:rgba(255,255,255,0.02);border:1px solid var(--line);border-radius:4px;}
  .schema-row{display:flex;justify-content:space-between;align-items:baseline;padding:6px 0;border-bottom:1px dashed var(--line);}
  .schema-row:last-child{border-bottom:none;}
  .schema-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;color:var(--dim);text-transform:uppercase;}
  .schema-val{font-family:'Teko',sans-serif;font-weight:500;font-size:16px;letter-spacing:1.5px;text-transform:uppercase;}

  .voice-block{margin-top:24px;}
  .voice-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--dim);text-transform:uppercase;margin-bottom:10px;}
  .voice-words{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;}
  .voice-word{font-family:'Teko',sans-serif;font-weight:500;font-size:28px;letter-spacing:1.5px;text-transform:uppercase;color:var(--team-primary);}
  .voice-sep{color:var(--faint);font-size:20px;}

  .taglines{margin-top:24px;}
  .taglines-label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--dim);text-transform:uppercase;margin-bottom:12px;}
  .taglines ul{list-style:none;}
  .taglines li{font-family:'Fraunces',serif;font-weight:300;font-style:italic;font-size:15px;color:var(--ink);opacity:0.85;padding:6px 0;padding-left:18px;position:relative;}
  .taglines li::before{content:"—";position:absolute;left:0;color:var(--team-primary);}

  /* Right side */
  .spread-right{display:flex;flex-direction:column;gap:40px;padding-top:24px;}

  .stage{
    position:relative;height:520px;display:flex;align-items:center;justify-content:center;
    border-radius:6px;overflow:hidden;
    background:
      radial-gradient(ellipse at center, color-mix(in srgb, var(--team-primary) 12%, transparent) 0%, transparent 65%),
      linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.4));
    border:1px solid var(--line-2);
  }
  .stage-grid{
    position:absolute;inset:0;pointer-events:none;
    background:
      repeating-linear-gradient(0deg, transparent 0 39px, rgba(255,255,255,0.025) 39px 40px),
      repeating-linear-gradient(90deg, transparent 0 39px, rgba(255,255,255,0.025) 39px 40px);
  }
  .logo-hero{filter:drop-shadow(0 28px 48px rgba(0,0,0,0.8)) drop-shadow(0 3px 0 rgba(255,255,255,0.04));position:relative;z-index:2;}

  .palette{}
  .palette-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:3px;color:var(--dim);text-transform:uppercase;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--line);}
  .palette-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;}
  .sw{display:flex;flex-direction:column;gap:10px;}
  .sw-chip{
    width:100%;aspect-ratio:1/1;border-radius:4px;background:var(--c);
    border:1px solid rgba(255,255,255,0.1);
    box-shadow:inset 0 -20px 40px rgba(0,0,0,0.2), 0 6px 16px rgba(0,0,0,0.4);
  }
  .sw-meta{text-align:left;}
  .sw-name{font-family:'Teko',sans-serif;font-weight:500;font-size:15px;letter-spacing:1px;text-transform:uppercase;line-height:1.1;margin-bottom:3px;}
  .sw-hex{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1px;color:var(--dim);}
  .sw-role{font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:1.5px;color:var(--faint);text-transform:uppercase;margin-top:3px;}

  .type-block{padding:24px;background:rgba(255,255,255,0.015);border:1px solid var(--line);border-radius:4px;}
  .type-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:3px;color:var(--dim);text-transform:uppercase;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--line);}
  .type-display{font-family:'Teko',sans-serif;font-weight:700;font-size:96px;line-height:0.85;letter-spacing:-0.01em;text-transform:uppercase;}
  .type-sub{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:3px;color:var(--dim);margin-top:8px;text-transform:uppercase;}
  .type-body{font-family:'Fraunces',serif;font-style:italic;font-weight:400;font-size:17px;line-height:1.5;color:var(--ink);opacity:0.85;margin-top:14px;max-width:600px;}

  .mini-apps{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  .mini-card{padding:18px;border-radius:4px;display:flex;align-items:center;gap:14px;color:#fff;}
  .mini-card .mini-logo{filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));}
  .mini-abbr{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2px;opacity:0.7;text-transform:uppercase;}
  .mini-name{font-family:'Teko',sans-serif;font-weight:700;font-size:22px;letter-spacing:1.5px;text-transform:uppercase;line-height:1;margin-top:2px;}
  .mini-ticket{padding:18px;border-radius:4px;display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.04);border:1px solid var(--line);}
  .mini-ticket-text{flex:1;}
  .mt-l{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:2px;color:var(--dim);text-transform:uppercase;}
  .mt-m{font-family:'Teko',sans-serif;font-weight:500;font-size:16px;letter-spacing:1px;text-transform:uppercase;line-height:1;margin-top:2px;}
  .mini-ticket-score{font-family:'Teko',sans-serif;font-weight:700;font-size:32px;line-height:0.8;letter-spacing:-0.5px;}

  /* End matter */
  .endmatter{max-width:1800px;margin:0 auto;padding:80px 48px 80px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:32px;border-bottom:1px solid var(--line);}
  .endmatter-block h3{font-family:'Teko',sans-serif;font-weight:500;font-size:32px;letter-spacing:-0.01em;text-transform:uppercase;margin-bottom:12px;color:var(--gold);}
  .endmatter-block p{font-family:'Rajdhani',sans-serif;font-weight:500;font-size:14px;line-height:1.65;color:var(--ink);opacity:0.85;}

  .colophon{max-width:1800px;margin:0 auto;padding:40px 48px 64px;display:flex;justify-content:space-between;align-items:center;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;color:var(--faint);text-transform:uppercase;}
  .colophon b{color:var(--gold);}
</style>
</head><body>

<!-- COVER -->
<section class="cover">
  <div class="cover-hd">
    <div class="cov-brand"><span>TORCH</span> · FOOTBALL</div>
    <div class="cov-meta">
      Brand Book · Volume I<br>
      Season 2 Edition · ${new Date().toISOString().slice(0,10)}<br>
      <b>8 Teams / 40 Colors</b>
    </div>
  </div>

  <div class="cov-hero">
    <div class="cov-eyebrow">A visual identity system for the Torch Conference</div>
    <div class="cov-title">Teams of Torch<span class="small">logos · palettes · voice · motion</span></div>
    <div class="cov-desc">Every program in the Torch Conference carries its own weather. Its own cadence on the field. Its own answer to the question of how football should be played. This document is the visual record of those answers.</div>
  </div>

  <div class="cov-grid">${coverGrid}</div>

  <div class="cov-ft">
    <span>CLASSIFIED · INTERNAL ONLY</span>
    <span>TORCH BRAND OPS · BROCK &amp; CLAUDE</span>
    <span>PAGE 01 OF 10</span>
  </div>
</section>

${spreads}

<!-- END MATTER -->
<section class="endmatter">
  <div class="endmatter-block">
    <h3>Color Principles</h3>
    <p>Every team's palette is anchored by a single dominant signal readable under 1 second. Secondary tones earn their place only if they deepen — not compete with — the dominant reading. No palette exceeds five named stops. Shadow and highlight stops are not brand colors; they exist to dimensionalize the primary.</p>
  </div>
  <div class="endmatter-block">
    <h3>Typography Canon</h3>
    <p>Teko carries team names and score typography. Rajdhani handles body and UI labels. JetBrains Mono tags data and metadata. Fraunces italic handles mottos, team story, and voice treatments. No system fonts, no Inter, no Arial.</p>
  </div>
  <div class="endmatter-block">
    <h3>Logo Construction</h3>
    <p>Each mark is an SVG multi-path illustration rendered through <code style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--gold);">renderTeamBadge()</code> from <code style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--gold);">teamLogos.js</code>. Gradients are namespaced per team; the Pronghorns antler uses userSpaceOnUse to guarantee symmetry. Every mark is drop-shadow tolerant and reads at 32px minimum.</p>
  </div>
</section>

<div class="colophon">
  <span>/public/mockups/brandbook.html</span>
  <span><b>TORCH</b> · Teams of Torch · Brand Book v1</span>
  <span>Built ${new Date().toISOString().slice(0,10)}</span>
</div>

</body></html>`;

fs.writeFileSync('/Users/brock/torch-football/public/mockups/brandbook.html', html);
console.log('wrote brandbook.html');
