import fs from 'fs';

const FILE = '/Users/brock/torch-football/src/assets/icons/teamLogos.js';
let src = fs.readFileSync(FILE, 'utf8');

function replaceGradient(str, id, newStops) {
  const re = new RegExp('(<linearGradient id="' + id + '"[^>]*>)([\\s\\S]*?)(</linearGradient>)');
  return str.replace(re, (_, o, __, c) => o + newStops + c);
}
function replaceAll(str, pairs) {
  let out = str;
  pairs.sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of pairs) out = out.split(from).join(to);
  return out;
}

// ---------- Boars: unchanged (keep current A) ----------
// ---------- Pronghorns: unchanged (keep current A) ----------

// ---------- Dolphins: Oracle's Wave (flipped gradient) ----------
src = replaceGradient(src, 'dolphin-grad',
  '<stop offset="0" stop-color="#FFF6E4"/>' +
  '<stop offset="0.07" stop-color="#FFCFD8"/>' +
  '<stop offset="0.2" stop-color="#FF7EB3"/>' +
  '<stop offset="0.38" stop-color="#D13A7A"/>' +
  '<stop offset="0.58" stop-color="#6B1E7F"/>' +
  '<stop offset="0.8" stop-color="#2E0854"/>' +
  '<stop offset="1" stop-color="#080118"/>');

// ---------- Spectres: Eclipse Corona ----------
src = replaceGradient(src, 'ghost-grad',
  '<stop offset="0" stop-color="#FFF4D4"/>' +
  '<stop offset="0.14" stop-color="#FFFFFF"/>' +
  '<stop offset="0.32" stop-color="#D4ECFA"/>' +
  '<stop offset="0.55" stop-color="#5DADE2"/>' +
  '<stop offset="0.78" stop-color="#1B4F72"/>' +
  '<stop offset="0.94" stop-color="#0B1E3B"/>' +
  '<stop offset="1" stop-color="#020510"/>');
// Spectres: also swap hardcoded blues on body paths (these are in the spectres' ICON_MARKUP only)
// We use specific narrow replacements inside the spectres markup context only
// The spectres markup section contains `#8FB3D6` and `#6A98C0` as hardcoded body shadow colors.
// Narrow replacement: apply globally since these colors are unique to the spectres SVG.
src = src.split('"#8FB3D6"').join('"#B8D9EE"');
src = src.split('"#6A98C0"').join('"#4A88B8"');

// ---------- Serpents: D Quetzalcoatl (teal) ----------
src = replaceGradient(src, 'serpent-grad',
  '<stop offset="0" stop-color="#0A1F1E"/>' +
  '<stop offset="0.35" stop-color="#0F766E"/>' +
  '<stop offset="0.7" stop-color="#14B8A6"/>' +
  '<stop offset="1" stop-color="#5EEAD4"/>');
// Serpent signature eyes: neon green → jewel amber
src = src.split('"#39FF14"').join('"#F5C542"');
src = src.split('"#0a0118"').join('"#0A1F1E"');

// ---------- Salamanders: H Fauvist Triadic ----------
src = replaceGradient(src, 'salamander-body',
  '<stop offset="0" stop-color="#2ECC71"/>' +
  '<stop offset="0.3" stop-color="#E84393"/>' +
  '<stop offset="0.6" stop-color="#F39C12"/>' +
  '<stop offset="0.85" stop-color="#F1C40F"/>' +
  '<stop offset="1" stop-color="#E8F4D4"/>');
// Salamander hardcoded spot/accent colors
src = src.split('"#06B6D4"').join('"#8E44AD"');
src = src.split('"#B91C1C"').join('"#2ECC71"');
src = src.split('"#8b2800"').join('"#186A3B"');

// ---------- Maples: Oxblood Momiji ----------
src = replaceGradient(src, 'maple-leaf',
  '<stop offset="0" stop-color="#FDF4D4"/>' +
  '<stop offset="0.18" stop-color="#FCD34D"/>' +
  '<stop offset="0.35" stop-color="#D97706"/>' +
  '<stop offset="0.55" stop-color="#8B4513"/>' +
  '<stop offset="0.75" stop-color="#7A1E2E"/>' +
  '<stop offset="0.9" stop-color="#4A1020"/>' +
  '<stop offset="1" stop-color="#2E0A14"/>');
// Maple hardcoded detail colors — replace in order longest first to avoid substring collisions
const mapleSwaps = [
  ['"#FDBA74"', '"#FCD34D"'],
  ['"#F97316"', '"#D97706"'],
  ['"#DC2626"', '"#8B4513"'],
  ['"#991B1B"', '"#6B1E2E"'],
  ['"#7F1D1D"', '"#5C1A29"'],
  ['"#5A1616"', '"#4A1020"'],
  ['"#4A1010"', '"#3A0F1C"'],
  ['"#3A0810"', '"#2E0A14"'],
  ['"#2D1A0A"', '"#1A0510"'],
];
for (const [from, to] of mapleSwaps) {
  src = src.split(from).join(to);
}

// ---------- Raccoons: Moonshine Silver ----------
src = replaceGradient(src, 'raccoon-face',
  '<stop offset="0" stop-color="#F4F4F5"/>' +
  '<stop offset="0.25" stop-color="#D4D4D8"/>' +
  '<stop offset="0.55" stop-color="#71717A"/>' +
  '<stop offset="0.82" stop-color="#27272A"/>' +
  '<stop offset="1" stop-color="#09090B"/>');
src = replaceGradient(src, 'raccoon-mask',
  '<stop offset="0" stop-color="#1F2937"/>' +
  '<stop offset="0.4" stop-color="#0A0E1A"/>' +
  '<stop offset="0.8" stop-color="#030408"/>' +
  '<stop offset="1" stop-color="#000000"/>');
src = replaceGradient(src, 'raccoon-ears',
  '<stop offset="0" stop-color="#E5E7EB"/>' +
  '<stop offset="0.35" stop-color="#9CA3AF"/>' +
  '<stop offset="0.7" stop-color="#52525B"/>' +
  '<stop offset="1" stop-color="#1F2937"/>');
src = replaceGradient(src, 'raccoon-eyes',
  '<stop offset="0" stop-color="#FFF4B8"/>' +
  '<stop offset="0.3" stop-color="#FFD440"/>' +
  '<stop offset="0.6" stop-color="#FF8C00"/>' +
  '<stop offset="0.85" stop-color="#C2410C"/>' +
  '<stop offset="1" stop-color="#5C1A02"/>');

// ---------- TEAM_BADGE_COLORS block at bottom of file ----------
// Keep these aligned with the new gradient identities
src = src.replace(
  /sentinels: \{ bg: '#4A0000', fg: '#EBB010', border: '#C4A265' \}/,
  `sentinels:  { bg: '#4A0000', fg: '#EBB010', border: '#C4A265' }`
);
src = src.replace(
  /wolves:    \{ bg: '#4A0D5E', fg: '#FF6F9C', border: '#E8548F' \}/,
  `wolves:     { bg: '#080118', fg: '#FF7EB3', border: '#D13A7A' }`
);
src = src.replace(
  /stags:     \{ bg: '#1B4F72', fg: '#f0f4ff', border: '#5DADE2' \}/,
  `stags:      { bg: '#020510', fg: '#FFFFFF', border: '#5DADE2' }`
);
src = src.replace(
  /serpents:  \{ bg: '#2E0854', fg: '#39FF14', border: '#9333EA' \}/,
  `serpents:   { bg: '#0A1F1E', fg: '#F5C542', border: '#14B8A6' }`
);
src = src.replace(
  /pronghorns:  \{ bg: '#062014', fg: '#F59E0B', border: '#22C55E' \}/,
  `pronghorns: { bg: '#062014', fg: '#F59E0B', border: '#22C55E' }`
);
src = src.replace(
  /salamanders: \{ bg: '#2c1a00', fg: '#06B6D4', border: '#ff8c00' \}/,
  `salamanders:{ bg: '#186A3B', fg: '#F39C12', border: '#E84393' }`
);
src = src.replace(
  /maples:      \{ bg: '#3A0810', fg: '#F59E0B', border: '#EA580C' \}/,
  `maples:     { bg: '#2E0A14', fg: '#D97706', border: '#7A1E2E' }`
);
src = src.replace(
  /raccoons:    \{ bg: '#0a0a0a', fg: '#FF8C00', border: '#F59E0B' \}/,
  `raccoons:   { bg: '#09090B', fg: '#FF8C00', border: '#D4D4D8' }`
);

fs.writeFileSync(FILE, src);
console.log('applied final gradients to teamLogos.js');
