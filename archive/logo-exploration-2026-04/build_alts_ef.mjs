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

// Helpers to build each variant (B, C, D already defined — redefining below)
function buildB() {
  const alts = {};
  alts.sentinels = replaceGradient(extractMarkup('sentinels'), 'boar-grad',
    '<stop offset="0" stop-color="#000000"/><stop offset="0.25" stop-color="#1A0606"/><stop offset="0.55" stop-color="#450A0A"/><stop offset="0.82" stop-color="#991B1B"/><stop offset="1" stop-color="#EBB010"/>');
  alts.wolves = replaceGradient(extractMarkup('wolves'), 'dolphin-grad',
    '<stop offset="0" stop-color="#831843"/><stop offset="0.35" stop-color="#BE185D"/><stop offset="0.75" stop-color="#EC4899"/><stop offset="1" stop-color="#FBCFE8"/>');
  let s = replaceGradient(extractMarkup('stags'), 'ghost-grad',
    '<stop offset="0" stop-color="#FFFFFF"/><stop offset="0.35" stop-color="#D1D5DB"/><stop offset="0.7" stop-color="#6B7280"/><stop offset="1" stop-color="#1F2937"/>');
  alts.stags = replaceAll(s, [['#8FB3D6','#9CA3AF'],['#6A98C0','#6B7280']]);
  alts.serpents = replaceAll(
    replaceGradient(extractMarkup('serpents'), 'serpent-grad',
      '<stop offset="0" stop-color="#000000"/><stop offset="0.35" stop-color="#18181B"/><stop offset="0.7" stop-color="#27272A"/><stop offset="1" stop-color="#3F3F46"/>'),
    [['#0a0118','#000000']]);
  let p = replaceGradient(extractMarkup('pronghorns'), 'pronghorn-body',
    '<stop offset="0" stop-color="#1C0A02"/><stop offset="0.35" stop-color="#7C2D12"/><stop offset="0.7" stop-color="#B45309"/><stop offset="1" stop-color="#FCD34D"/>');
  p = replaceGradient(p, 'pronghorn-antler',
    '<stop offset="0" stop-color="#D1FAE5"/><stop offset="0.4" stop-color="#86EFAC"/><stop offset="0.75" stop-color="#10B981"/><stop offset="1" stop-color="#064E3B"/>');
  alts.pronghorns = replaceAll(p, [['#86EFAC','#FDE68A'],['#062014','#1C0A02'],['#04110a','#0A0402'],['#B45309','#065F46'],['#FEF3C7','#D1FAE5']]);
  let sa = replaceGradient(extractMarkup('salamanders'), 'salamander-body',
    '<stop offset="0" stop-color="#000000"/><stop offset="0.3" stop-color="#18181B"/><stop offset="0.6" stop-color="#27272A"/><stop offset="0.85" stop-color="#3F3F46"/><stop offset="1" stop-color="#52525B"/>');
  alts.salamanders = replaceAll(sa, [['#06B6D4','#FACC15'],['#B91C1C','#18181B'],['#8b2800','#000000']]);
  let m = replaceGradient(extractMarkup('maples'), 'maple-leaf',
    '<stop offset="0" stop-color="#FEF3C7"/><stop offset="0.2" stop-color="#FCD34D"/><stop offset="0.45" stop-color="#F59E0B"/><stop offset="0.72" stop-color="#B45309"/><stop offset="1" stop-color="#451A03"/>');
  alts.maples = replaceAll(m, [['#FDBA74','#FDE68A'],['#F97316','#D97706'],['#DC2626','#B45309'],['#B91C1C','#92400E'],['#991B1B','#78350F'],['#7F1D1D','#65290A'],['#5A1616','#451A03'],['#4A1010','#3A1505'],['#3A0810','#1C0A02'],['#2D1A0A','#1C1917']]);
  let r = replaceGradient(extractMarkup('raccoons'), 'raccoon-ears',
    '<stop offset="0" stop-color="#67E8F9"/><stop offset="0.4" stop-color="#3B82F6"/><stop offset="0.8" stop-color="#1E3A8A"/><stop offset="1" stop-color="#0C1222"/>');
  r = replaceGradient(r, 'raccoon-eyes',
    '<stop offset="0" stop-color="#E0F2FE"/><stop offset="0.5" stop-color="#3B82F6"/><stop offset="1" stop-color="#1E3A8A"/>');
  alts.raccoons = r;
  return alts;
}

function buildC() {
  const alts = {};
  alts.sentinels = replaceGradient(extractMarkup('sentinels'), 'boar-grad',
    '<stop offset="0" stop-color="#2E2419"/><stop offset="0.3" stop-color="#5A4632"/><stop offset="0.6" stop-color="#8C7355"/><stop offset="0.82" stop-color="#B84A1F"/><stop offset="1" stop-color="#D9C8A8"/>');
  alts.wolves = replaceGradient(extractMarkup('wolves'), 'dolphin-grad',
    '<stop offset="0" stop-color="#0E2530"/><stop offset="0.3" stop-color="#4A6B7A"/><stop offset="0.6" stop-color="#A8C4CC"/><stop offset="0.82" stop-color="#F4F1E8"/><stop offset="1" stop-color="#E8A87C"/>');
  let s = replaceGradient(extractMarkup('stags'), 'ghost-grad',
    '<stop offset="0" stop-color="#E8E4D0"/><stop offset="0.3" stop-color="#C8F59A"/><stop offset="0.65" stop-color="#2A3E28"/><stop offset="1" stop-color="#0B100C"/>');
  alts.stags = replaceAll(s, [['#8FB3D6','#64543A'],['#6A98C0','#2A3E28']]);
  let se = replaceGradient(extractMarkup('serpents'), 'serpent-grad',
    '<stop offset="0" stop-color="#1E1812"/><stop offset="0.35" stop-color="#3E2E1E"/><stop offset="0.7" stop-color="#C9A877"/><stop offset="1" stop-color="#E8DCBE"/>');
  alts.serpents = replaceAll(se, [['#39FF14','#7A1F1F'],['#0a0118','#1E1812']]);
  let p = replaceGradient(extractMarkup('pronghorns'), 'pronghorn-body',
    '<stop offset="0" stop-color="#3E3428"/><stop offset="0.35" stop-color="#8B9471"/><stop offset="0.7" stop-color="#D4C4A0"/><stop offset="1" stop-color="#F2ECD8"/>');
  p = replaceGradient(p, 'pronghorn-antler',
    '<stop offset="0" stop-color="#F2ECD8"/><stop offset="0.5" stop-color="#6A2A1E"/><stop offset="1" stop-color="#3E3428"/>');
  alts.pronghorns = replaceAll(p, [['#86EFAC','#F2ECD8'],['#062014','#3E3428'],['#04110a','#1A130A'],['#B45309','#3E3428'],['#FEF3C7','#F2ECD8']]);
  let sa = replaceGradient(extractMarkup('salamanders'), 'salamander-body',
    '<stop offset="0" stop-color="#4A2E3A"/><stop offset="0.35" stop-color="#E07A9A"/><stop offset="0.7" stop-color="#F8B8C8"/><stop offset="1" stop-color="#F4EFE4"/>');
  alts.salamanders = replaceAll(sa, [['#06B6D4','#7AD0C4'],['#B91C1C','#E07A9A'],['#8b2800','#4A2E3A']]);
  let m = replaceGradient(extractMarkup('maples'), 'maple-leaf',
    '<stop offset="0" stop-color="#F4F1E4"/><stop offset="0.25" stop-color="#E8DCB4"/><stop offset="0.55" stop-color="#A8C48E"/><stop offset="0.8" stop-color="#6B4423"/><stop offset="1" stop-color="#3A2A1A"/>');
  alts.maples = replaceAll(m, [['#FDBA74','#E8DCB4'],['#F97316','#A8C48E'],['#DC2626','#D85A3C'],['#B91C1C','#6B4423'],['#991B1B','#8B6B3C'],['#7F1D1D','#6B4423'],['#5A1616','#4A3520'],['#4A1010','#3A2A1A'],['#3A0810','#2A1E10'],['#2D1A0A','#2A1E10']]);
  let r = replaceGradient(extractMarkup('raccoons'), 'raccoon-face',
    '<stop offset="0" stop-color="#D8CAB0"/><stop offset="0.5" stop-color="#8A8E92"/><stop offset="1" stop-color="#4A3E2E"/>');
  r = replaceGradient(r, 'raccoon-ears',
    '<stop offset="0" stop-color="#C8D070"/><stop offset="0.5" stop-color="#9EA85C"/><stop offset="1" stop-color="#5A6330"/>');
  r = replaceGradient(r, 'raccoon-eyes',
    '<stop offset="0" stop-color="#C8D070"/><stop offset="0.5" stop-color="#9EA85C"/><stop offset="1" stop-color="#4A5528"/>');
  alts.raccoons = r;
  return alts;
}

function buildD() {
  const alts = {};
  alts.sentinels = replaceGradient(extractMarkup('sentinels'), 'boar-grad',
    '<stop offset="0" stop-color="#0E1A26"/><stop offset="0.25" stop-color="#1B3A5C"/><stop offset="0.55" stop-color="#5A1F1F"/><stop offset="0.82" stop-color="#C9B27A"/><stop offset="1" stop-color="#E8DCC4"/>');
  alts.wolves = replaceGradient(extractMarkup('wolves'), 'dolphin-grad',
    '<stop offset="0" stop-color="#141F28"/><stop offset="0.3" stop-color="#2E5F7A"/><stop offset="0.6" stop-color="#D4C9A8"/><stop offset="0.82" stop-color="#B89968"/><stop offset="1" stop-color="#8A2E3B"/>');
  let s = replaceGradient(extractMarkup('stags'), 'ghost-grad',
    '<stop offset="0" stop-color="#E4DCC2"/><stop offset="0.35" stop-color="#C8A862"/><stop offset="0.7" stop-color="#6B0D16"/><stop offset="1" stop-color="#0C0608"/>');
  alts.stags = replaceAll(s, [['#8FB3D6','#C8A862'],['#6A98C0','#6B0D16']]);
  let se = replaceGradient(extractMarkup('serpents'), 'serpent-grad',
    '<stop offset="0" stop-color="#0A1F1E"/><stop offset="0.35" stop-color="#0F766E"/><stop offset="0.7" stop-color="#14B8A6"/><stop offset="1" stop-color="#5EEAD4"/>');
  alts.serpents = replaceAll(se, [['#39FF14','#F5C542'],['#0a0118','#0A1F1E']]);
  let p = replaceGradient(extractMarkup('pronghorns'), 'pronghorn-body',
    '<stop offset="0" stop-color="#0A0E1E"/><stop offset="0.35" stop-color="#1C2645"/><stop offset="0.7" stop-color="#8C7AA8"/><stop offset="1" stop-color="#D8D4E4"/>');
  p = replaceGradient(p, 'pronghorn-antler',
    '<stop offset="0" stop-color="#E8DCC2"/><stop offset="0.4" stop-color="#C4A668"/><stop offset="0.75" stop-color="#8B6E30"/><stop offset="1" stop-color="#3E2E10"/>');
  alts.pronghorns = replaceAll(p, [['#86EFAC','#D8D4E4'],['#062014','#0A0E1E'],['#04110a','#050714'],['#B45309','#3E2E10'],['#FEF3C7','#E8DCC2']]);
  let sa = replaceGradient(extractMarkup('salamanders'), 'salamander-body',
    '<stop offset="0" stop-color="#2E1A0E"/><stop offset="0.3" stop-color="#5C1D1A"/><stop offset="0.6" stop-color="#C9302C"/><stop offset="0.85" stop-color="#E8B54A"/><stop offset="1" stop-color="#F1E4B8"/>');
  alts.salamanders = replaceAll(sa, [['#06B6D4','#F1E4B8'],['#B91C1C','#5C1D1A'],['#8b2800','#2E1A0E']]);
  let m = replaceGradient(extractMarkup('maples'), 'maple-leaf',
    '<stop offset="0" stop-color="#E8C968"/><stop offset="0.25" stop-color="#C8342B"/><stop offset="0.55" stop-color="#8A1F18"/><stop offset="0.8" stop-color="#2A1E18"/><stop offset="1" stop-color="#0E0806"/>');
  alts.maples = replaceAll(m, [['#FDBA74','#E8C968'],['#F97316','#E8A03A'],['#DC2626','#C8342B'],['#B91C1C','#8A1F18'],['#991B1B','#6B1712'],['#7F1D1D','#4A1510'],['#5A1616','#2A1E18'],['#4A1010','#1E1410'],['#3A0810','#0E0806'],['#2D1A0A','#0E0806']]);
  let r = replaceGradient(extractMarkup('raccoons'), 'raccoon-face',
    '<stop offset="0" stop-color="#E8DCC2"/><stop offset="0.5" stop-color="#C8A060"/><stop offset="1" stop-color="#6B5B2E"/>');
  r = replaceGradient(r, 'raccoon-mask',
    '<stop offset="0" stop-color="#6B5120"/><stop offset="0.6" stop-color="#3A2618"/><stop offset="1" stop-color="#1A0F08"/>');
  r = replaceGradient(r, 'raccoon-ears',
    '<stop offset="0" stop-color="#E8746A"/><stop offset="0.5" stop-color="#8B2E1F"/><stop offset="1" stop-color="#3A0F08"/>');
  r = replaceGradient(r, 'raccoon-eyes',
    '<stop offset="0" stop-color="#F4A838"/><stop offset="0.5" stop-color="#C8A060"/><stop offset="1" stop-color="#6B4A1A"/>');
  alts.raccoons = r;
  return alts;
}

// =========================================================================
// E — ERA / RETRO STYLE
// Tie each mascot to a specific historical visual era
// =========================================================================
function buildE() {
  const alts = {};

  // BOARS — Art Deco 1920s (Gatsby: black + gold + jade + cream)
  alts.sentinels = replaceGradient(extractMarkup('sentinels'), 'boar-grad',
    '<stop offset="0" stop-color="#1C1C1C"/>' +
    '<stop offset="0.25" stop-color="#2D2D2D"/>' +
    '<stop offset="0.55" stop-color="#7A4F1E"/>' +
    '<stop offset="0.82" stop-color="#D4AF37"/>' +
    '<stop offset="1" stop-color="#F4E8B8"/>');

  // DOLPHINS — Vaporwave 80s (midnight + hot pink + cyan + sunset)
  alts.wolves = replaceGradient(extractMarkup('wolves'), 'dolphin-grad',
    '<stop offset="0" stop-color="#0E0A2E"/>' +
    '<stop offset="0.3" stop-color="#B76AE8"/>' +
    '<stop offset="0.6" stop-color="#FF5EAA"/>' +
    '<stop offset="0.82" stop-color="#FF9A56"/>' +
    '<stop offset="1" stop-color="#00D4FF"/>');

  // SPECTRES — Industrial Steampunk (brass + copper + steam-gray + rust)
  let s = replaceGradient(extractMarkup('stags'), 'ghost-grad',
    '<stop offset="0" stop-color="#E4D8B8"/>' +
    '<stop offset="0.3" stop-color="#B77F1F"/>' +
    '<stop offset="0.65" stop-color="#A8481A"/>' +
    '<stop offset="1" stop-color="#1A1612"/>');
  alts.stags = replaceAll(s, [['#8FB3D6','#A8481A'],['#6A98C0','#4A5558']]);

  // SERPENTS — Edo Ink Wash (sumi ink + gold leaf + seal red + washi paper)
  let se = replaceGradient(extractMarkup('serpents'), 'serpent-grad',
    '<stop offset="0" stop-color="#0A0A0A"/>' +
    '<stop offset="0.35" stop-color="#1A1A1A"/>' +
    '<stop offset="0.7" stop-color="#8B1818"/>' +
    '<stop offset="1" stop-color="#D4AF37"/>');
  alts.serpents = replaceAll(se, [['#39FF14','#F4EDD8'],['#0a0118','#0A0A0A']]);

  // PRONGHORNS — Old West Frontier (saddle leather + rust + turquoise + bone)
  let p = replaceGradient(extractMarkup('pronghorns'), 'pronghorn-body',
    '<stop offset="0" stop-color="#2A1810"/>' +
    '<stop offset="0.35" stop-color="#6B4423"/>' +
    '<stop offset="0.7" stop-color="#C97C3E"/>' +
    '<stop offset="1" stop-color="#E8D4B0"/>');
  p = replaceGradient(p, 'pronghorn-antler',
    '<stop offset="0" stop-color="#E8D4B0"/>' +
    '<stop offset="0.4" stop-color="#4A9A8E"/>' +
    '<stop offset="0.8" stop-color="#2E6B63"/>' +
    '<stop offset="1" stop-color="#1A3A35"/>');
  alts.pronghorns = replaceAll(p, [['#86EFAC','#E8D4B0'],['#062014','#2A1810'],['#04110a','#180C06'],['#B45309','#1A3A35'],['#FEF3C7','#E8D4B0']]);

  // SALAMANDERS — 60s Psychedelic (yellow + pink + orange + mint chaos)
  let sa = replaceGradient(extractMarkup('salamanders'), 'salamander-body',
    '<stop offset="0" stop-color="#9B59B6"/>' +
    '<stop offset="0.25" stop-color="#FF6B9D"/>' +
    '<stop offset="0.5" stop-color="#FF8C42"/>' +
    '<stop offset="0.75" stop-color="#FFD93D"/>' +
    '<stop offset="1" stop-color="#2ECC71"/>');
  alts.salamanders = replaceAll(sa, [['#06B6D4','#2ECC71'],['#B91C1C','#9B59B6'],['#8b2800','#6A1B8F']]);

  // MAPLES — Colonial Americana (patriot navy + oxblood + brass + cream)
  let m = replaceGradient(extractMarkup('maples'), 'maple-leaf',
    '<stop offset="0" stop-color="#E8DCC2"/>' +
    '<stop offset="0.2" stop-color="#B77F1F"/>' +
    '<stop offset="0.45" stop-color="#6B1818"/>' +
    '<stop offset="0.72" stop-color="#0D2B4E"/>' +
    '<stop offset="1" stop-color="#071427"/>');
  alts.maples = replaceAll(m, [['#FDBA74','#E8DCC2'],['#F97316','#B77F1F'],['#DC2626','#8B1818'],['#B91C1C','#6B1818'],['#991B1B','#4A0F0F'],['#7F1D1D','#2D0A0A'],['#5A1616','#1A3A5C'],['#4A1010','#0D2B4E'],['#3A0810','#071427'],['#2D1A0A','#1A1612']]);

  // RACCOONS — 70s Funk/Blaxploitation (terracotta + olive + mustard + espresso)
  let r = replaceGradient(extractMarkup('raccoons'), 'raccoon-face',
    '<stop offset="0" stop-color="#E8D8A8"/>' +
    '<stop offset="0.5" stop-color="#C9A860"/>' +
    '<stop offset="1" stop-color="#6B5B2E"/>');
  r = replaceGradient(r, 'raccoon-mask',
    '<stop offset="0" stop-color="#5C3820"/>' +
    '<stop offset="0.6" stop-color="#3A2818"/>' +
    '<stop offset="1" stop-color="#1A0F08"/>');
  r = replaceGradient(r, 'raccoon-ears',
    '<stop offset="0" stop-color="#F4A55A"/>' +
    '<stop offset="0.5" stop-color="#D4823B"/>' +
    '<stop offset="1" stop-color="#8B4A1F"/>');
  r = replaceGradient(r, 'raccoon-eyes',
    '<stop offset="0" stop-color="#D4AF37"/>' +
    '<stop offset="0.5" stop-color="#8B7820"/>' +
    '<stop offset="1" stop-color="#3D3410"/>');
  alts.raccoons = r;
  return alts;
}

// =========================================================================
// F — ATMOSPHERIC MOMENT
// Mascot depicted in a specific lighting / environmental moment
// =========================================================================
function buildF() {
  const alts = {};

  // BOARS — Mountain Snow (winter pelt: white + charcoal tusks + blood accent)
  alts.sentinels = replaceGradient(extractMarkup('sentinels'), 'boar-grad',
    '<stop offset="0" stop-color="#E4E4E7"/>' +
    '<stop offset="0.3" stop-color="#B4B4B8"/>' +
    '<stop offset="0.6" stop-color="#52525B"/>' +
    '<stop offset="0.82" stop-color="#1F1F23"/>' +
    '<stop offset="1" stop-color="#DC2626"/>');

  // DOLPHINS — Deep Sea Bioluminescent (abyssal + bio-green glow + plankton blue)
  alts.wolves = replaceGradient(extractMarkup('wolves'), 'dolphin-grad',
    '<stop offset="0" stop-color="#00060D"/>' +
    '<stop offset="0.3" stop-color="#0A1F33"/>' +
    '<stop offset="0.6" stop-color="#004D5A"/>' +
    '<stop offset="0.82" stop-color="#00FFAA"/>' +
    '<stop offset="1" stop-color="#C0E8FF"/>');

  // SPECTRES — Solar Eclipse (black sun + fiery corona)
  let s = replaceGradient(extractMarkup('stags'), 'ghost-grad',
    '<stop offset="0" stop-color="#FFB547"/>' +
    '<stop offset="0.2" stop-color="#E85D04"/>' +
    '<stop offset="0.5" stop-color="#4A0000"/>' +
    '<stop offset="1" stop-color="#000000"/>');
  alts.stags = replaceAll(s, [['#8FB3D6','#7A3500'],['#6A98C0','#4A1F00']]);

  // SERPENTS — Blood Moon Ritual (deep void + blood crimson)
  let se = replaceGradient(extractMarkup('serpents'), 'serpent-grad',
    '<stop offset="0" stop-color="#0F0505"/>' +
    '<stop offset="0.3" stop-color="#3A0808"/>' +
    '<stop offset="0.6" stop-color="#7F1D1D"/>' +
    '<stop offset="0.85" stop-color="#DC2626"/>' +
    '<stop offset="1" stop-color="#FCA5A5"/>');
  alts.serpents = replaceAll(se, [['#39FF14','#FFF5E0'],['#0a0118','#0F0505']]);

  // PRONGHORNS — Aurora Borealis (night sky + aurora bands)
  let p = replaceGradient(extractMarkup('pronghorns'), 'pronghorn-body',
    '<stop offset="0" stop-color="#0A0E14"/>' +
    '<stop offset="0.3" stop-color="#1A2540"/>' +
    '<stop offset="0.55" stop-color="#06B6D4"/>' +
    '<stop offset="0.8" stop-color="#00F5A0"/>' +
    '<stop offset="1" stop-color="#A855F7"/>');
  p = replaceGradient(p, 'pronghorn-antler',
    '<stop offset="0" stop-color="#FEF3C7"/>' +
    '<stop offset="0.4" stop-color="#C0E8FF"/>' +
    '<stop offset="0.8" stop-color="#4A6B9A"/>' +
    '<stop offset="1" stop-color="#1A2540"/>');
  alts.pronghorns = replaceAll(p, [['#86EFAC','#00F5A0'],['#062014','#0A0E14'],['#04110a','#050714'],['#B45309','#1A2540'],['#FEF3C7','#FEF3C7']]);

  // SALAMANDERS — Neon Storm (black with lightning color bursts)
  let sa = replaceGradient(extractMarkup('salamanders'), 'salamander-body',
    '<stop offset="0" stop-color="#0A0A0A"/>' +
    '<stop offset="0.3" stop-color="#1F1F23"/>' +
    '<stop offset="0.55" stop-color="#8B5CF6"/>' +
    '<stop offset="0.78" stop-color="#F472B6"/>' +
    '<stop offset="1" stop-color="#FFFFFF"/>');
  alts.salamanders = replaceAll(sa, [['#06B6D4','#22D3EE'],['#B91C1C','#1F1F23'],['#8b2800','#0A0A0A']]);

  // MAPLES — Ice Storm (frozen + frost + crystalline blue)
  let m = replaceGradient(extractMarkup('maples'), 'maple-leaf',
    '<stop offset="0" stop-color="#F0F9FF"/>' +
    '<stop offset="0.25" stop-color="#BAE6FD"/>' +
    '<stop offset="0.5" stop-color="#7DD3FC"/>' +
    '<stop offset="0.75" stop-color="#1E40AF"/>' +
    '<stop offset="1" stop-color="#1E1B4B"/>');
  alts.maples = replaceAll(m, [['#FDBA74','#F0F9FF'],['#F97316','#BAE6FD'],['#DC2626','#7DD3FC'],['#B91C1C','#3B82F6'],['#991B1B','#1E40AF'],['#7F1D1D','#1E3A8A'],['#5A1616','#1E1B4B'],['#4A1010','#181633'],['#3A0810','#0F0D2A'],['#2D1A0A','#1C1917']]);

  // RACCOONS — Rain-slick Midnight (wet asphalt + sodium glow + chrome)
  let r = replaceGradient(extractMarkup('raccoons'), 'raccoon-face',
    '<stop offset="0" stop-color="#F5F5F4"/>' +
    '<stop offset="0.5" stop-color="#A1A1AA"/>' +
    '<stop offset="1" stop-color="#4A4A52"/>');
  r = replaceGradient(r, 'raccoon-mask',
    '<stop offset="0" stop-color="#1A1F2E"/>' +
    '<stop offset="0.5" stop-color="#0F1423"/>' +
    '<stop offset="1" stop-color="#000000"/>');
  r = replaceGradient(r, 'raccoon-ears',
    '<stop offset="0" stop-color="#F97316"/>' +
    '<stop offset="0.4" stop-color="#7DD3FC"/>' +
    '<stop offset="0.8" stop-color="#1E40AF"/>' +
    '<stop offset="1" stop-color="#0F1423"/>');
  r = replaceGradient(r, 'raccoon-eyes',
    '<stop offset="0" stop-color="#F97316"/>' +
    '<stop offset="0.5" stop-color="#FB923C"/>' +
    '<stop offset="1" stop-color="#7C2D12"/>');
  alts.raccoons = r;
  return alts;
}

// Build all variants and suffix their gradient IDs
const altsB = buildB(); for (const k of Object.keys(altsB)) altsB[k] = suffixIds(altsB[k], '-B');
const altsC = buildC(); for (const k of Object.keys(altsC)) altsC[k] = suffixIds(altsC[k], '-C');
const altsD = buildD(); for (const k of Object.keys(altsD)) altsD[k] = suffixIds(altsD[k], '-D');
const altsE = buildE(); for (const k of Object.keys(altsE)) altsE[k] = suffixIds(altsE[k], '-E');
const altsF = buildF(); for (const k of Object.keys(altsF)) altsF[k] = suffixIds(altsF[k], '-F');

// Current A
const currentMarkup = {};
const TEAM_IDS = ['sentinels','wolves','stags','serpents','pronghorns','salamanders','maples','raccoons'];
for (const t of TEAM_IDS) currentMarkup[t] = suffixIds(extractMarkup(t), '-A');

const teams = [
  { id:'sentinels', name:'Boars',
    labels:{ a:'Red+Gold', b:'Obsidian Volcanic', c:'Wild Tusker', d:'Celtic Twrch Trwyth', e:'Art Deco Gatsby', f:'Mountain Snow' },
    notes:{ c:'Real hide: brown + bone tusk + blood', d:'Welsh woad-blue Iron Age warrior', e:'Gatsby-era black + gold + cream', f:'Winter pelt: snow white + charcoal + blood' } },
  { id:'wolves', name:'Dolphins',
    labels:{ a:'Wine → Pink', b:'Miami Neon', c:'Bottlenose Reef', d:"Apollo's Oracle", e:'Vaporwave 80s', f:'Deep Sea Bio-lum' },
    notes:{ c:'Real slate + cream belly + coral', d:'Delphic Aegean + marble + gold', e:'Hot pink + cyan + sunset neon', f:'Abyssal black + bio-green glow' } },
  { id:'stags', name:'Spectres',
    labels:{ a:'Ice + Midnight', b:'Storm Silver', c:"Will-o'-Wisp", d:'Victorian Séance', e:'Industrial Steampunk', f:'Solar Eclipse' },
    notes:{ c:'Swamp methane green — marsh light', d:'Oxblood velvet + brass + candlelight', e:'Brass + copper + rust + coal', f:'Black sun + fiery corona' } },
  { id:'serpents', name:'Serpents',
    labels:{ a:'Purple + Venom', b:'Matte Black Mamba', c:'Diamondback Desert', d:'Quetzalcoatl', e:'Edo Ink Wash', f:'Blood Moon Ritual' },
    notes:{ c:'Real rattlesnake: sand + rattle red', d:'Aztec jade + temple gold', e:'Sumi ink + gold leaf + seal red', f:'Pure void + blood crimson' } },
  { id:'pronghorns', name:'Pronghorns',
    labels:{ a:'Emerald + Amber', b:'Bronze Earth', c:'Sage & Bone', d:'Artemis Moon-Huntress', e:'Old West Frontier', f:'Aurora Borealis' },
    notes:{ c:'Real pelage: tan + bone + horn tips', d:'Indigo + moonstone + arrow bronze', e:'Saddle leather + rust + turquoise', f:'Night sky + aurora green/violet' } },
  { id:'salamanders', name:'Salamanders',
    labels:{ a:'Fire + Cyan', b:'Poison Black', c:'Axolotl Bloom', d:"Alchemist's Kiln", e:'60s Psychedelic', f:'Neon Storm' },
    notes:{ c:'Pink neotenic + pool teal', d:'Medieval crucible + sulfur + soot', e:'Yellow + pink + orange + mint', f:'Black + lightning-bright lilac/pink' } },
  { id:'maples', name:'Maples',
    labels:{ a:'Crimson Autumn', b:'Amber Sugar Maple', c:'Spring Sap', d:'Momiji Temple', e:'Colonial Americana', f:'Ice Storm' },
    notes:{ c:'March sugaring: cream + green + bud', d:'Kyoto vermillion + gold leaf + lacquer', e:'Navy + oxblood + brass + cream', f:'Frozen leaf: frost + ice-blue + indigo' } },
  { id:'raccoons', name:'Raccoons',
    labels:{ a:'Noir + Amber', b:'Cyber Blue', c:'Silver Bandit', d:"70's Heist Caper", e:'70s Funk/Blax', f:'Rain-slick Midnight' },
    notes:{ c:'Real pelt: silver + cream + sodium olive', d:'Tobacco + mustard + velvet red', e:'Terracotta + olive + espresso cream', f:'Wet asphalt + neon sign + chrome' } },
];

function wrap(inner) {
  return `<svg width="160" height="160" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

const rows = teams.map((t, idx) => {
  const v = (col, markup, cls) => `
    <div class="v ${cls}">
      <div class="badge ${cls}">${col}</div>
      <div class="logo">${wrap(markup)}</div>
      <div class="vname">${t.labels[cls]}</div>
      ${t.notes[cls] ? `<div class="vnote">${t.notes[cls]}</div>` : ''}
    </div>`;
  return `
  <section class="pair">
    <header>
      <div class="num">${String(idx+1).padStart(2,'0')}</div>
      <h2>${t.name}</h2>
    </header>
    <div class="grid-6">
      ${v('A · CURRENT', currentMarkup[t.id], 'a')}
      ${v('B · BOLD',    altsB[t.id], 'b')}
      ${v('C · BIOLOGY', altsC[t.id], 'c')}
      ${v('D · MYTH',    altsD[t.id], 'd')}
      ${v('E · ERA',     altsE[t.id], 'e')}
      ${v('F · MOMENT',  altsF[t.id], 'f')}
    </div>
  </section>`;
}).join('');

const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<title>TORCH — 6-Way Logo Variants</title>
<link href="https://fonts.googleapis.com/css2?family=Teko:wght@300;500;700&family=JetBrains+Mono:wght@400;500&family=Rajdhani:wght@500;600&display=swap" rel="stylesheet">
<style>
  :root { --bg:#0A0804; --tile:#141018; --line:rgba(255,255,255,0.08); --ink:#f5f0e8; --dim:#8a827a; --gold:#EBB010; --green:#22C55E; --blue:#3B82F6; --cyan:#06B6D4; --purple:#A855F7; --coral:#F97316; }
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:var(--bg);color:var(--ink);font-family:'Rajdhani',sans-serif;padding:40px 24px 80px;min-height:100vh;}
  .head{max-width:1800px;margin:0 auto 36px;padding-bottom:22px;border-bottom:1px solid var(--line);}
  .kicker{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:4px;color:var(--gold);text-transform:uppercase;margin-bottom:10px;}
  h1{font-family:'Teko',sans-serif;font-weight:500;font-size:64px;line-height:0.9;letter-spacing:-0.02em;text-transform:uppercase;}
  h1 em{font-style:normal;font-weight:300;color:var(--gold);display:block;}
  .sub-title{color:var(--dim);font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-top:6px;}
  .callout{max-width:1800px;margin:0 auto 28px;padding:14px 18px;background:rgba(235,176,16,0.05);border:1px solid rgba(235,176,16,0.2);border-radius:4px;color:var(--ink);font-size:12px;line-height:1.55;}
  .callout b{color:var(--gold);}
  .pair{max-width:1800px;margin:0 auto 24px;}
  .pair header{display:flex;align-items:baseline;gap:16px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--line);}
  .num{font-family:'Teko',sans-serif;font-weight:300;font-size:36px;line-height:0.9;color:var(--gold);}
  h2{font-family:'Teko',sans-serif;font-weight:600;font-size:28px;letter-spacing:1.5px;text-transform:uppercase;}
  .grid-6{display:grid;grid-template-columns:repeat(6,1fr);gap:1px;background:var(--line);}
  .v{background:var(--tile);padding:16px 12px 18px;display:flex;flex-direction:column;align-items:center;gap:8px;position:relative;min-height:250px;}
  .badge{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:1px;padding:2px 6px;border-radius:2px;border:1px solid;align-self:flex-start;}
  .badge.a{color:var(--dim);border-color:var(--line);}
  .badge.b{color:var(--gold);border-color:rgba(235,176,16,0.3);background:rgba(235,176,16,0.06);}
  .badge.c{color:var(--green);border-color:rgba(34,197,94,0.3);background:rgba(34,197,94,0.06);}
  .badge.d{color:var(--cyan);border-color:rgba(6,182,212,0.3);background:rgba(6,182,212,0.06);}
  .badge.e{color:var(--purple);border-color:rgba(168,85,247,0.3);background:rgba(168,85,247,0.06);}
  .badge.f{color:var(--coral);border-color:rgba(249,115,22,0.3);background:rgba(249,115,22,0.06);}
  .logo{filter:drop-shadow(0 8px 12px rgba(0,0,0,0.5));display:flex;align-items:center;justify-content:center;margin:2px 0;}
  .vname{font-family:'Teko',sans-serif;font-size:15px;letter-spacing:1px;text-transform:uppercase;color:var(--ink);text-align:center;line-height:1;}
  .vnote{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:0.3px;color:var(--dim);text-align:center;line-height:1.4;}
</style>
</head><body>
<div class="head">
  <div class="kicker">Torch Football · Brand Ops · 6-way A→F Review</div>
  <h1>Logo Variants<em>Six options per team</em></h1>
  <div class="sub-title">A current · B bold · C biology · D mythology · E era · F atmospheric moment</div>
</div>

<div class="callout">
  <b>Two new columns added:</b> E (era/retro) ties each mascot to a specific historical visual style — Art Deco boars, Vaporwave dolphins, Edo-period serpents, Colonial Americana maples, 70s Funk raccoons. F (atmospheric moment) renders the mascot in a specific lighting/weather — mountain snow, deep-sea bio-lum, solar eclipse, blood moon, aurora borealis, ice storm, rain-slick neon midnight.
</div>

${rows}
</body></html>`;

fs.writeFileSync('/Users/brock/torch-football/public/mockups/logo-variants.html', html);
console.log('wrote 6-way comparison');
