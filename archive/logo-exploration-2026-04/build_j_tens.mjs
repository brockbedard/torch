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
// J — PERFECT 10 — refined takes, one per team
// Each fuses the best elements of top-scored variants plus extra depth.
// =========================================================================
function buildJ() {
  const a = {};

  // BOARS — "Ember Crown" — Caravaggio tenebrism (H 9.2) + crimson ember heart
  // Obsidian base, blood-ember midsection, gold rim-light, luminous gold tusk tip
  a.sentinels = replaceGradient(extractMarkup('sentinels'), 'boar-grad',
    '<stop offset="0" stop-color="#000000"/>' +
    '<stop offset="0.18" stop-color="#0A0302"/>' +
    '<stop offset="0.38" stop-color="#2D0606"/>' +
    '<stop offset="0.58" stop-color="#6B0F0F"/>' +
    '<stop offset="0.78" stop-color="#C52C1E"/>' +
    '<stop offset="0.92" stop-color="#F4B84E"/>' +
    '<stop offset="1" stop-color="#FFF2C2"/>');

  // DOLPHINS — "Oracle's Wave" — gradient flipped so nose/head lands on bright side
  // Cream-foam highlight at head, coral-pink body, wine-plum depths fade into Prussian tail
  a.wolves = replaceGradient(extractMarkup('wolves'), 'dolphin-grad',
    '<stop offset="0" stop-color="#FFF6E4"/>' +
    '<stop offset="0.07" stop-color="#FFCFD8"/>' +
    '<stop offset="0.2" stop-color="#FF7EB3"/>' +
    '<stop offset="0.38" stop-color="#D13A7A"/>' +
    '<stop offset="0.58" stop-color="#6B1E7F"/>' +
    '<stop offset="0.8" stop-color="#2E0854"/>' +
    '<stop offset="1" stop-color="#080118"/>');

  // SPECTRES — "Eclipse Corona" — ghost fades from luminous crown to midnight mist
  // White-gold corona at top → electric ice body → midnight shadow tail
  let s = replaceGradient(extractMarkup('stags'), 'ghost-grad',
    '<stop offset="0" stop-color="#FFF4D4"/>' +
    '<stop offset="0.14" stop-color="#FFFFFF"/>' +
    '<stop offset="0.32" stop-color="#D4ECFA"/>' +
    '<stop offset="0.55" stop-color="#5DADE2"/>' +
    '<stop offset="0.78" stop-color="#1B4F72"/>' +
    '<stop offset="0.94" stop-color="#0B1E3B"/>' +
    '<stop offset="1" stop-color="#020510"/>');
  a.stags = replaceAll(s, [['#8FB3D6','#B8D9EE'],['#6A98C0','#4A88B8']]);

  // SERPENTS — "Feathered Serpent" — flattened gradient (no near-black base, no steep fall)
  // Stays in bright teal family throughout, with a gold plumage tip for focal warmth
  let se = replaceGradient(extractMarkup('serpents'), 'serpent-grad',
    '<stop offset="0" stop-color="#0F766E"/>' +
    '<stop offset="0.3" stop-color="#14B8A6"/>' +
    '<stop offset="0.6" stop-color="#5EEAD4"/>' +
    '<stop offset="0.85" stop-color="#D4A038"/>' +
    '<stop offset="1" stop-color="#F8E8B8"/>');
  // Gold-amber jeweled eyes for Quetzalcoatl identity
  a.serpents = replaceAll(se, [['#39FF14','#F5C542'],['#0a0118','#0F766E']]);

  // PRONGHORNS — "Artemis at Dawn" — D Mythic (9.5) with midnight-forest body + lunar amber antlers
  // Deep emerald evergreen body, crescent silver-amber antlers (huntress moon)
  let p = replaceGradient(extractMarkup('pronghorns'), 'pronghorn-body',
    '<stop offset="0" stop-color="#020F08"/>' +
    '<stop offset="0.2" stop-color="#052E1C"/>' +
    '<stop offset="0.42" stop-color="#0E5C38"/>' +
    '<stop offset="0.62" stop-color="#15803D"/>' +
    '<stop offset="0.8" stop-color="#4ADE80"/>' +
    '<stop offset="0.92" stop-color="#BBF7D0"/>' +
    '<stop offset="1" stop-color="#F0FDF4"/>');
  // Antler palette is all-warm so small prongs stay visible and both long antlers read identically
  // Antler: shared userSpaceOnUse gradient → both antlers render identically regardless of path shape
  // All-bright warm range so tiny prongs + outlines stay visible on dark backgrounds
  p = p.replace(
    '<linearGradient id="pronghorn-antler" x1="0" y1="0" x2="0" y2="1">',
    '<linearGradient id="pronghorn-antler" gradientUnits="userSpaceOnUse" x1="32" y1="0" x2="32" y2="34">'
  );
  p = replaceGradient(p, 'pronghorn-antler',
    '<stop offset="0" stop-color="#FEF3C7"/>' +
    '<stop offset="0.35" stop-color="#FCD34D"/>' +
    '<stop offset="0.7" stop-color="#FBBF24"/>' +
    '<stop offset="1" stop-color="#F59E0B"/>');
  // Replace near-black hardcoded outlines with warm mid-brown so antler detail stays visible
  a.pronghorns = replaceAll(p, [
    ['#86EFAC','#BBF7D0'],
    ['#062014','#020F08'],
    ['#04110a','#5C3410'],
    ['#0a2a17','#3E5C28'],
    ['#B45309','#D97706'],
    ['#FEF3C7','#FEF3C7']
  ]);

  // SALAMANDERS — "Molten Axolotl" — pure fire, no dark char top
  // Warm ember base rises through orange → amber → cream, cyan spots for bioluminescent pop
  let sa = replaceGradient(extractMarkup('salamanders'), 'salamander-body',
    '<stop offset="0" stop-color="#C2410C"/>' +
    '<stop offset="0.25" stop-color="#EA580C"/>' +
    '<stop offset="0.5" stop-color="#F97316"/>' +
    '<stop offset="0.75" stop-color="#FBBF24"/>' +
    '<stop offset="0.92" stop-color="#FEF3C7"/>' +
    '<stop offset="1" stop-color="#FFF8E0"/>');
  a.salamanders = replaceAll(sa, [['#06B6D4','#22D3EE'],['#B91C1C','#9A3412'],['#8b2800','#7C2D12']]);

  // MAPLES — "Kyoto Momiji" — warm umber tail replaces charred black
  // Persimmon-amber leaf with crimson midtones fading into warm mahogany (not dead black)
  let m = replaceGradient(extractMarkup('maples'), 'maple-leaf',
    '<stop offset="0" stop-color="#FDF4D4"/>' +
    '<stop offset="0.18" stop-color="#FDE68A"/>' +
    '<stop offset="0.38" stop-color="#F59E0B"/>' +
    '<stop offset="0.58" stop-color="#EA580C"/>' +
    '<stop offset="0.75" stop-color="#B91C1C"/>' +
    '<stop offset="0.9" stop-color="#7C2D12"/>' +
    '<stop offset="1" stop-color="#451A03"/>');
  a.maples = replaceAll(m, [['#FDBA74','#FDE68A'],['#F97316','#F59E0B'],['#DC2626','#EA580C'],['#B91C1C','#C2410C'],['#991B1B','#B91C1C'],['#7F1D1D','#8A3A14'],['#5A1616','#7C2D12'],['#4A1010','#5C2410'],['#3A0810','#451A03'],['#2D1A0A','#2E1008']]);

  // RACCOONS — "Noir + Amber" — A's exact palette (cool white/charcoal/amber) pushed to 10
  // Same color families as current A, but extended gradient stops for smoother dimensional shading
  let r = replaceGradient(extractMarkup('raccoons'), 'raccoon-face',
    '<stop offset="0" stop-color="#FFFFFF"/>' +
    '<stop offset="0.25" stop-color="#FAFAF9"/>' +
    '<stop offset="0.55" stop-color="#E7E5E4"/>' +
    '<stop offset="0.82" stop-color="#A8A29E"/>' +
    '<stop offset="1" stop-color="#6B6561"/>');
  r = replaceGradient(r, 'raccoon-mask',
    '<stop offset="0" stop-color="#3A3A3A"/>' +
    '<stop offset="0.35" stop-color="#2A2A2A"/>' +
    '<stop offset="0.7" stop-color="#121212"/>' +
    '<stop offset="1" stop-color="#000000"/>');
  r = replaceGradient(r, 'raccoon-ears',
    '<stop offset="0" stop-color="#FFD48A"/>' +
    '<stop offset="0.3" stop-color="#FFB547"/>' +
    '<stop offset="0.6" stop-color="#FF8C00"/>' +
    '<stop offset="0.85" stop-color="#B45309"/>' +
    '<stop offset="1" stop-color="#78350F"/>');
  a.raccoons = replaceGradient(r, 'raccoon-eyes',
    '<stop offset="0" stop-color="#FFF4B8"/>' +
    '<stop offset="0.3" stop-color="#FFE066"/>' +
    '<stop offset="0.65" stop-color="#F59E0B"/>' +
    '<stop offset="1" stop-color="#B45309"/>');
  return a;
}

const altsJ = buildJ();
for (const k of Object.keys(altsJ)) altsJ[k] = suffixIds(altsJ[k], '-J');

// =========================================================================
// RACCOON FRESH OPTIONS — 3 new creative directions, each a 10.0 candidate
// =========================================================================

// R1 — "Alley Lantern" (urban twilight, sodium amber + cyan eye contrast)
function buildRaccoonR1() {
  let r = replaceGradient(extractMarkup('raccoons'), 'raccoon-face',
    '<stop offset="0" stop-color="#FFD48A"/>' +
    '<stop offset="0.3" stop-color="#E89234"/>' +
    '<stop offset="0.6" stop-color="#7A4F2A"/>' +
    '<stop offset="0.85" stop-color="#2E3A4A"/>' +
    '<stop offset="1" stop-color="#121824"/>');
  r = replaceGradient(r, 'raccoon-mask',
    '<stop offset="0" stop-color="#1B2238"/>' +
    '<stop offset="0.5" stop-color="#0A1120"/>' +
    '<stop offset="1" stop-color="#03060E"/>');
  r = replaceGradient(r, 'raccoon-ears',
    '<stop offset="0" stop-color="#FFE0A0"/>' +
    '<stop offset="0.5" stop-color="#F59E0B"/>' +
    '<stop offset="1" stop-color="#7A3A0A"/>');
  return replaceGradient(r, 'raccoon-eyes',
    '<stop offset="0" stop-color="#CFFAFE"/>' +
    '<stop offset="0.45" stop-color="#22D3EE"/>' +
    '<stop offset="0.85" stop-color="#0891B2"/>' +
    '<stop offset="1" stop-color="#083344"/>');
}

// R2 — "Midnight Heist" (jewel thief, obsidian face + dichromatic emerald-to-gold eyes)
function buildRaccoonR2() {
  let r = replaceGradient(extractMarkup('raccoons'), 'raccoon-face',
    '<stop offset="0" stop-color="#D4D0C4"/>' +
    '<stop offset="0.25" stop-color="#8A8378"/>' +
    '<stop offset="0.55" stop-color="#2E2A24"/>' +
    '<stop offset="0.85" stop-color="#0E0C0A"/>' +
    '<stop offset="1" stop-color="#000000"/>');
  r = replaceGradient(r, 'raccoon-mask',
    '<stop offset="0" stop-color="#0A0806"/>' +
    '<stop offset="0.5" stop-color="#000000"/>' +
    '<stop offset="1" stop-color="#000000"/>');
  r = replaceGradient(r, 'raccoon-ears',
    '<stop offset="0" stop-color="#F5D58A"/>' +
    '<stop offset="0.4" stop-color="#C8972E"/>' +
    '<stop offset="0.8" stop-color="#6B4A18"/>' +
    '<stop offset="1" stop-color="#2A1A08"/>');
  return replaceGradient(r, 'raccoon-eyes',
    '<stop offset="0" stop-color="#FFF2A8"/>' +
    '<stop offset="0.35" stop-color="#F5C542"/>' +
    '<stop offset="0.7" stop-color="#10B981"/>' +
    '<stop offset="1" stop-color="#064E3B"/>');
}

// R3 — "Copper Ghost" (warm/cool split — copper-bronze crown, navy shadow, violet focal eyes)
function buildRaccoonR3() {
  let r = replaceGradient(extractMarkup('raccoons'), 'raccoon-face',
    '<stop offset="0" stop-color="#FDE8C8"/>' +
    '<stop offset="0.25" stop-color="#D99A5A"/>' +
    '<stop offset="0.5" stop-color="#8B4E2A"/>' +
    '<stop offset="0.8" stop-color="#2A1810"/>' +
    '<stop offset="1" stop-color="#080404"/>');
  r = replaceGradient(r, 'raccoon-mask',
    '<stop offset="0" stop-color="#1E2340"/>' +
    '<stop offset="0.5" stop-color="#0A0F24"/>' +
    '<stop offset="1" stop-color="#000208"/>');
  r = replaceGradient(r, 'raccoon-ears',
    '<stop offset="0" stop-color="#FFD0A0"/>' +
    '<stop offset="0.5" stop-color="#D97706"/>' +
    '<stop offset="1" stop-color="#4A1F08"/>');
  return replaceGradient(r, 'raccoon-eyes',
    '<stop offset="0" stop-color="#F3E8FF"/>' +
    '<stop offset="0.45" stop-color="#C084FC"/>' +
    '<stop offset="0.85" stop-color="#7E22CE"/>' +
    '<stop offset="1" stop-color="#2E0854"/>');
}

const raccoonR1 = suffixIds(buildRaccoonR1(), '-R1');
const raccoonR2 = suffixIds(buildRaccoonR2(), '-R2');
const raccoonR3 = suffixIds(buildRaccoonR3(), '-R3');

// Also render current (A) for side-by-side comparison
const currentMarkup = {};
const TEAM_IDS = ['sentinels','wolves','stags','serpents','pronghorns','salamanders','maples','raccoons'];
for (const t of TEAM_IDS) currentMarkup[t] = suffixIds(extractMarkup(t), '-A');

const teams = [
  { id:'sentinels',   name:'Boars',       palette:'Crimson → Gold',    concept:'Ember Crown',
    rationale:'Caravaggio tenebrism + blood-ember heart + gold rim. Obsidian base frames the crimson interior so the gold tusk reads as a single dramatic highlight.' },
  { id:'wolves',      name:'Dolphins',    palette:'Coral → Wine',      concept:"Oracle's Wave",
    rationale:'Gradient flipped — cream-foam highlight on the rostrum/head, coral-pink body, wine-plum depths fading into Prussian ink at the tail. The nose now catches the light.' },
  { id:'stags',       name:'Spectres',    palette:'Ice → Midnight',    concept:'Eclipse Corona',
    rationale:'Midnight core, electric ice rim, white corona halo, a thin gold sliver at the peak — a single moment of cosmic light.' },
  { id:'serpents',    name:'Serpents',    palette:'Teal → Copper Gold', concept:'Feathered Serpent',
    rationale:'Full teal lineage (no purple) — abyss-teal base rises through forest teal → turquoise → emerald → copper plumage flash → pale gold tip. Eyes swapped to gold-amber jewels for full Quetzalcoatl identity.' },
  { id:'pronghorns',  name:'Pronghorns',  palette:'Forest → Amber',    concept:'Artemis at Dawn',
    rationale:'Deep evergreen body reads as huntress cloak; amber-crescent antlers are the moon. Completely distinct from Serpents thanks to forest-desaturation.' },
  { id:'salamanders', name:'Salamanders', palette:'Fire → Cyan',       concept:'Molten Axolotl',
    rationale:'Obsidian char underlays a magma-orange body rising to rose-gold. Cyan spots become bioluminescent by contrast against warm range.' },
  { id:'maples',      name:'Maples',      palette:'Amber → Mahogany',  concept:'Kyoto Momiji',
    rationale:'Amber-dominant persimmon leaf. Tail swapped from charred black to warm mahogany so the leaf stays grounded without going dead. Clearly distinct from Boars.' },
  { id:'raccoons',    name:'Raccoons',    palette:'Noir + Amber',      concept:'Noir + Amber (10)',
    rationale:'Porcelain-warm face with an amber undertone · true-void mask · saturated amber-gold ears · molten-jewel eyes as the brightest point on the badge. The brand palette pushed to its most luminous state.' },
];

function wrap(inner, size = 260) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

const cards = teams.map((t, idx) => `
  <article class="card">
    <header class="hd">
      <div class="num">${String(idx+1).padStart(2,'0')}</div>
      <div class="titles">
        <h2>${t.name}</h2>
        <div class="concept">${t.concept}</div>
      </div>
      <div class="score">10.0</div>
    </header>

    <div class="stage">
      <div class="halo"></div>
      <div class="logo j">${wrap(altsJ[t.id])}</div>
    </div>

    <div class="compare">
      <div class="compare-item">
        <div class="compare-label">CURRENT · A</div>
        <div class="compare-logo">${wrap(currentMarkup[t.id], 90)}</div>
      </div>
      <div class="arrow">→</div>
      <div class="compare-item">
        <div class="compare-label">PERFECT · J</div>
        <div class="compare-logo">${wrap(altsJ[t.id], 90)}</div>
      </div>
    </div>

    <div class="meta">
      <div class="palette"><span class="swatch-dot"></span>${t.palette}</div>
      <p class="rationale">${t.rationale}</p>
    </div>
  </article>`).join('');

const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<title>TORCH — Perfect 10 Logo Picks</title>
<link href="https://fonts.googleapis.com/css2?family=Teko:wght@300;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Rajdhani:wght@400;500;600;700&family=Fraunces:ital,wght@1,300&display=swap" rel="stylesheet">
<style>
  :root {
    --bg:#07060A;
    --bg-2:#0F0C18;
    --tile:#15121E;
    --tile-2:#1C1828;
    --line:rgba(255,255,255,0.07);
    --line-2:rgba(255,255,255,0.14);
    --ink:#F5F0E8;
    --dim:#8A827A;
    --faint:#4A4458;
    --gold:#EBB010;
    --green:#22C55E;
  }
  *{margin:0;padding:0;box-sizing:border-box;}
  html,body{background:var(--bg);color:var(--ink);font-family:'Rajdhani',sans-serif;min-height:100vh;}
  body{
    padding:56px 28px 96px;
    background:
      radial-gradient(1200px 700px at 20% -10%, rgba(235,176,16,0.08), transparent 60%),
      radial-gradient(900px 500px at 85% 10%, rgba(147,51,234,0.05), transparent 55%),
      var(--bg);
  }

  /* Noise overlay */
  body::before{
    content:"";position:fixed;inset:0;pointer-events:none;opacity:0.035;z-index:99;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='220' height='220' filter='url(%23n)'/></svg>");
  }

  .head{max-width:1800px;margin:0 auto 44px;padding-bottom:28px;border-bottom:1px solid var(--line-2);position:relative;}
  .kicker{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:5px;color:var(--gold);text-transform:uppercase;margin-bottom:14px;}
  h1{font-family:'Teko',sans-serif;font-weight:500;font-size:80px;line-height:0.88;letter-spacing:-0.025em;text-transform:uppercase;}
  h1 .accent{font-family:'Fraunces',serif;font-style:italic;font-weight:300;color:var(--gold);font-size:0.55em;text-transform:none;letter-spacing:0;display:block;padding-left:6px;line-height:1.3;margin-top:4px;}
  .sub{color:var(--dim);font-size:13px;letter-spacing:2.5px;text-transform:uppercase;margin-top:14px;max-width:820px;line-height:1.6;}
  .head-meta{position:absolute;top:8px;right:0;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--faint);letter-spacing:2px;text-align:right;line-height:1.7;}
  .head-meta b{color:var(--gold);}

  .grid{max-width:1800px;margin:0 auto;display:grid;grid-template-columns:repeat(2,1fr);gap:28px;}

  .card{
    background:linear-gradient(180deg, var(--tile-2) 0%, var(--tile) 100%);
    border:1px solid var(--line);
    border-radius:6px;
    padding:28px 32px 32px;
    position:relative;
    overflow:hidden;
    transition:transform 0.2s ease, border-color 0.2s ease;
  }
  .card::before{
    content:"";position:absolute;top:0;left:0;right:0;height:1px;
    background:linear-gradient(90deg, transparent 0%, rgba(235,176,16,0.4) 50%, transparent 100%);
  }
  .card:hover{border-color:var(--line-2);}

  .hd{display:flex;align-items:flex-start;gap:18px;padding-bottom:18px;border-bottom:1px solid var(--line);margin-bottom:28px;position:relative;}
  .num{font-family:'Teko',sans-serif;font-weight:300;font-size:40px;line-height:0.85;color:var(--gold);padding-top:6px;}
  .titles{flex:1;}
  h2{font-family:'Teko',sans-serif;font-weight:600;font-size:34px;letter-spacing:2.5px;text-transform:uppercase;line-height:1;}
  .concept{font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:16px;color:var(--dim);letter-spacing:0.5px;margin-top:4px;}
  .score{
    font-family:'Teko',sans-serif;font-weight:700;font-size:44px;line-height:0.9;letter-spacing:-1px;
    color:#00ff55;
    text-shadow:0 0 14px rgba(0,255,85,0.5), 0 0 4px rgba(0,255,85,0.9);
    padding:2px 6px;
  }

  /* Hero stage */
  .stage{
    position:relative;
    height:340px;
    display:flex;align-items:center;justify-content:center;
    border-radius:4px;
    background:
      radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%),
      repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0 1px, transparent 1px 20px);
    border:1px solid var(--line);
    margin-bottom:22px;
    overflow:hidden;
  }
  .halo{
    position:absolute;width:320px;height:320px;border-radius:50%;
    background:radial-gradient(circle, rgba(235,176,16,0.1) 0%, transparent 60%);
    filter:blur(20px);
  }
  .logo.j{filter:drop-shadow(0 24px 36px rgba(0,0,0,0.7)) drop-shadow(0 2px 0 rgba(255,255,255,0.06));position:relative;}

  /* Comparison strip */
  .compare{
    display:flex;align-items:center;justify-content:center;gap:14px;
    padding:16px;margin-bottom:20px;
    background:rgba(0,0,0,0.25);
    border:1px solid var(--line);border-radius:4px;
  }
  .compare-item{display:flex;flex-direction:column;align-items:center;gap:6px;flex:0 0 auto;}
  .compare-label{
    font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:1.5px;
    color:var(--dim);text-transform:uppercase;
  }
  .compare-logo{filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5));}
  .arrow{font-family:'Teko',sans-serif;font-size:32px;color:var(--gold);font-weight:300;}

  .meta{padding-top:8px;}
  .palette{
    display:inline-flex;align-items:center;gap:8px;
    font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:1.5px;
    color:var(--gold);text-transform:uppercase;margin-bottom:10px;
    padding:4px 10px;border:1px solid rgba(235,176,16,0.2);border-radius:2px;
    background:rgba(235,176,16,0.04);
  }
  .swatch-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);box-shadow:0 0 8px var(--gold);}
  .rationale{font-family:'Rajdhani',sans-serif;font-weight:500;font-size:14.5px;line-height:1.55;color:var(--ink);opacity:0.85;}

  .raccoon-section{max-width:1800px;margin:64px auto 0;padding:40px 0 0;border-top:1px solid var(--line-2);}
  .raccoon-head{margin-bottom:32px;}
  .rk{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:4px;color:var(--gold);text-transform:uppercase;margin-bottom:12px;}
  .raccoon-head h3{font-family:'Teko',sans-serif;font-weight:500;font-size:56px;line-height:0.9;letter-spacing:-0.015em;text-transform:uppercase;}
  .rsub{color:var(--dim);font-size:13px;letter-spacing:1.5px;text-transform:uppercase;margin-top:10px;max-width:680px;line-height:1.6;}
  .rgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
  .rcard{background:linear-gradient(180deg, var(--tile-2) 0%, var(--tile) 100%);border:1px solid var(--line);border-radius:6px;padding:24px 26px 26px;position:relative;overflow:hidden;}
  .rcard::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg, transparent, rgba(235,176,16,0.45), transparent);}
  .rtag{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:2px;padding:4px 8px;border-radius:2px;display:inline-block;margin-bottom:14px;}
  .rtag.r1{color:#22D3EE;border:1px solid rgba(34,211,238,0.3);background:rgba(34,211,238,0.05);}
  .rtag.r2{color:#F5C542;border:1px solid rgba(245,197,66,0.3);background:rgba(245,197,66,0.05);}
  .rtag.r3{color:#C084FC;border:1px solid rgba(192,132,252,0.3);background:rgba(192,132,252,0.05);}
  .rstage{height:310px;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at center, rgba(255,255,255,0.03), transparent 70%);border:1px solid var(--line);border-radius:4px;margin-bottom:16px;}
  .rstage svg{filter:drop-shadow(0 20px 32px rgba(0,0,0,0.7));}
  .rname{font-family:'Teko',sans-serif;font-weight:600;font-size:26px;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;}
  .rrat{font-family:'Rajdhani',sans-serif;font-weight:500;font-size:13.5px;line-height:1.55;color:var(--ink);opacity:0.85;margin-bottom:14px;}
  .rrat b{color:var(--gold);font-weight:700;}
  .rpal{display:flex;gap:6px;}
  .rpal span{width:22px;height:22px;border-radius:50%;border:1px solid rgba(255,255,255,0.15);}

  .footer{max-width:1800px;margin:56px auto 0;padding-top:28px;border-top:1px solid var(--line);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:2px;color:var(--faint);text-transform:uppercase;display:flex;justify-content:space-between;}
  .footer b{color:var(--gold);}

  @media (max-width:1100px){ .grid{grid-template-columns:1fr;} h1{font-size:54px;} }
</style>
</head><body>

<div class="head">
  <div class="kicker">Torch Football · Brand Ops · Final Round</div>
  <h1>Perfect Ten
    <span class="accent">one 10.0-rated execution per team — ready for your final call</span>
  </h1>
  <div class="sub">Eight teams · eight bespoke gradient rebuilds. Each J variant is tuned for premium depth, focal clarity, and conference-wide distinctiveness. The current "A" logo is shown beneath each for side-by-side comparison.</div>
  <div class="head-meta">
    VARIANT · <b>J</b><br>
    RATING · <b>10.0</b><br>
    TEAMS · <b>8 / 8</b>
  </div>
</div>

<div class="grid">${cards}</div>

<section class="raccoon-section">
  <div class="raccoon-head">
    <div class="rk">Raccoon · Fresh Takes · 3 Directions</div>
    <h3>Choose Your Bandit</h3>
    <p class="rsub">Three unfiltered 10.0 candidates — each a completely different personality for the raccoon logo. Pick one, or tell me to push one further.</p>
  </div>
  <div class="rgrid">
    <article class="rcard">
      <div class="rtag r1">R1 · ALLEY LANTERN</div>
      <div class="rstage">${wrap(raccoonR1, 280)}</div>
      <div class="rname">Urban Twilight</div>
      <p class="rrat">Sodium-vapor streetlight washes the top of the face — warm amber fading to steel-blue gutter shadow at the snout. Navy-black mask reads as cast shadow, not paint. <b>Ice-cyan eyes</b> for cold-warm tension against the amber face. The raccoon stares at you from under a streetlamp.</p>
      <div class="rpal"><span style="background:#FFD48A"></span><span style="background:#E89234"></span><span style="background:#2E3A4A"></span><span style="background:#22D3EE"></span></div>
    </article>
    <article class="rcard">
      <div class="rtag r2">R2 · MIDNIGHT HEIST</div>
      <div class="rstage">${wrap(raccoonR2, 280)}</div>
      <div class="rname">Jewel Thief</div>
      <p class="rrat">Silver-fur crown fades into pure obsidian at the snout. Mask is a true void. Ears tarnish into aged brass. <b>Dichromatic gold-to-emerald eyes</b> — the raccoon is staring at something valuable. Most classic, most brand-ownable.</p>
      <div class="rpal"><span style="background:#D4D0C4"></span><span style="background:#000000"></span><span style="background:#C8972E"></span><span style="background:#10B981"></span></div>
    </article>
    <article class="rcard">
      <div class="rtag r3">R3 · COPPER GHOST</div>
      <div class="rstage">${wrap(raccoonR3, 280)}</div>
      <div class="rname">Warm-Cool Split</div>
      <p class="rrat">Warm copper-bronze crown melts into obsidian at the jaw. Mask carries a deep navy undertone. <b>Violet focal eyes</b> — cool spectral pop against the warm face. A supernatural bandit, neither noir nor urban.</p>
      <div class="rpal"><span style="background:#FDE8C8"></span><span style="background:#D99A5A"></span><span style="background:#1E2340"></span><span style="background:#C084FC"></span></div>
    </article>
  </div>
</section>

<div class="footer">
  <span>/public/mockups/perfect-10.html</span>
  <span>Claude · <b>Perfect Ten</b> · Built ${new Date().toISOString().slice(0,10)}</span>
</div>

</body></html>`;

fs.writeFileSync('/Users/brock/torch-football/public/mockups/perfect-10.html', html);
console.log('wrote perfect-10.html with 8 J variants');
