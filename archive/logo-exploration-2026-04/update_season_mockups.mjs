import fs from 'fs';

const files = [
  '/Users/brock/torch-football/public/mockups/season-2-identity.html',
  '/Users/brock/torch-football/public/season-demo.html',
];

// Old → new color map (case-insensitive)
const SWAPS = [
  // Pronghorns: old forest-neon → new evergreen-amber
  ['#1a472a', '#166534'],
  ['#00ff44', '#F59E0B'],
  ['#0a1f12', '#062014'],
  // Salamanders: old orange-gold → new Fauvist green-pink
  ['#ff8c00', '#2ECC71'],
  ['#ffcc00', '#E84393'],
  ['#2c1a00', '#186A3B'],
  // Maples: old bright crimson → new wine-persimmon
  ['#960018', '#7A1E2E'],
  ['#ff4d4d', '#D97706'],
  ['#4a000c', '#2E0A14'],
  // Raccoons: old noir-lime → new pewter-amber
  ['#333333', '#D4D4D8'],
  ['#b8e031', '#FF8C00'],
  ['#111111', '#27272A'],
];

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log('skip (missing):', f);
    continue;
  }
  let src = fs.readFileSync(f, 'utf8');
  const before = src.length;
  let swapsApplied = 0;
  for (const [from, to] of SWAPS) {
    // case-insensitive global regex
    const re = new RegExp(from.replace(/[#]/g, '\\#'), 'gi');
    const matches = src.match(re);
    if (matches) {
      src = src.replace(re, to);
      swapsApplied += matches.length;
    }
  }
  fs.writeFileSync(f, src);
  console.log(`updated: ${f} — ${swapsApplied} color swaps`);
}
