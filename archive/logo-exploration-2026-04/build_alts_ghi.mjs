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

// Re-import earlier variant builders (B, C, D, E, F)
function buildB() {
  const a = {};
  a.sentinels = replaceGradient(extractMarkup('sentinels'), 'boar-grad', '<stop offset="0" stop-color="#000000"/><stop offset="0.25" stop-color="#1A0606"/><stop offset="0.55" stop-color="#450A0A"/><stop offset="0.82" stop-color="#991B1B"/><stop offset="1" stop-color="#EBB010"/>');
  a.wolves = replaceGradient(extractMarkup('wolves'), 'dolphin-grad', '<stop offset="0" stop-color="#831843"/><stop offset="0.35" stop-color="#BE185D"/><stop offset="0.75" stop-color="#EC4899"/><stop offset="1" stop-color="#FBCFE8"/>');
  let s = replaceGradient(extractMarkup('stags'), 'ghost-grad', '<stop offset="0" stop-color="#FFFFFF"/><stop offset="0.35" stop-color="#D1D5DB"/><stop offset="0.7" stop-color="#6B7280"/><stop offset="1" stop-color="#1F2937"/>');
  a.stags = replaceAll(s, [['#8FB3D6','#9CA3AF'],['#6A98C0','#6B7280']]);
  a.serpents = replaceAll(replaceGradient(extractMarkup('serpents'), 'serpent-grad', '<stop offset="0" stop-color="#000000"/><stop offset="0.35" stop-color="#18181B"/><stop offset="0.7" stop-color="#27272A"/><stop offset="1" stop-color="#3F3F46"/>'), [['#0a0118','#000000']]);
  let p = replaceGradient(extractMarkup('pronghorns'), 'pronghorn-body', '<stop offset="0" stop-color="#1C0A02"/><stop offset="0.35" stop-color="#7C2D12"/><stop offset="0.7" stop-color="#B45309"/><stop offset="1" stop-color="#FCD34D"/>');
  p = replaceGradient(p, 'pronghorn-antler', '<stop offset="0" stop-color="#D1FAE5"/><stop offset="0.4" stop-color="#86EFAC"/><stop offset="0.75" stop-color="#10B981"/><stop offset="1" stop-color="#064E3B"/>');
  a.pronghorns = replaceAll(p, [['#86EFAC','#FDE68A'],['#062014','#1C0A02'],['#04110a','#0A0402'],['#B45309','#065F46'],['#FEF3C7','#D1FAE5']]);
  let sa = replaceGradient(extractMarkup('salamanders'), 'salamander-body', '<stop offset="0" stop-color="#000000"/><stop offset="0.3" stop-color="#18181B"/><stop offset="0.6" stop-color="#27272A"/><stop offset="0.85" stop-color="#3F3F46"/><stop offset="1" stop-color="#52525B"/>');
  a.salamanders = replaceAll(sa, [['#06B6D4','#FACC15'],['#B91C1C','#18181B'],['#8b2800','#000000']]);
  let m = replaceGradient(extractMarkup('maples'), 'maple-leaf', '<stop offset="0" stop-color="#FEF3C7"/><stop offset="0.2" stop-color="#FCD34D"/><stop offset="0.45" stop-color="#F59E0B"/><stop offset="0.72" stop-color="#B45309"/><stop offset="1" stop-color="#451A03"/>');
  a.maples = replaceAll(m, [['#FDBA74','#FDE68A'],['#F97316','#D97706'],['#DC2626','#B45309'],['#B91C1C','#92400E'],['#991B1B','#78350F'],['#7F1D1D','#65290A'],['#5A1616','#451A03'],['#4A1010','#3A1505'],['#3A0810','#1C0A02'],['#2D1A0A','#1C1917']]);
  let r = replaceGradient(extractMarkup('raccoons'), 'raccoon-ears', '<stop offset="0" stop-color="#67E8F9"/><stop offset="0.4" stop-color="#3B82F6"/><stop offset="0.8" stop-color="#1E3A8A"/><stop offset="1" stop-color="#0C1222"/>');
  a.raccoons = replaceGradient(r, 'raccoon-eyes', '<stop offset="0" stop-color="#E0F2FE"/><stop offset="0.5" stop-color="#3B82F6"/><stop offset="1" stop-color="#1E3A8A"/>');
  return a;
}
function buildC() {
  const a = {};
  a.sentinels = replaceGradient(extractMarkup('sentinels'), 'boar-grad', '<stop offset="0" stop-color="#2E2419"/><stop offset="0.3" stop-color="#5A4632"/><stop offset="0.6" stop-color="#8C7355"/><stop offset="0.82" stop-color="#B84A1F"/><stop offset="1" stop-color="#D9C8A8"/>');
  a.wolves = replaceGradient(extractMarkup('wolves'), 'dolphin-grad', '<stop offset="0" stop-color="#0E2530"/><stop offset="0.3" stop-color="#4A6B7A"/><stop offset="0.6" stop-color="#A8C4CC"/><stop offset="0.82" stop-color="#F4F1E8"/><stop offset="1" stop-color="#E8A87C"/>');
  let s = replaceGradient(extractMarkup('stags'), 'ghost-grad', '<stop offset="0" stop-color="#E8E4D0"/><stop offset="0.3" stop-color="#C8F59A"/><stop offset="0.65" stop-color="#2A3E28"/><stop offset="1" stop-color="#0B100C"/>');
  a.stags = replaceAll(s, [['#8FB3D6','#64543A'],['#6A98C0','#2A3E28']]);
  let se = replaceGradient(extractMarkup('serpents'), 'serpent-grad', '<stop offset="0" stop-color="#1E1812"/><stop offset="0.35" stop-color="#3E2E1E"/><stop offset="0.7" stop-color="#C9A877"/><stop offset="1" stop-color="#E8DCBE"/>');
  a.serpents = replaceAll(se, [['#39FF14','#7A1F1F'],['#0a0118','#1E1812']]);
  let p = replaceGradient(extractMarkup('pronghorns'), 'pronghorn-body', '<stop offset="0" stop-color="#3E3428"/><stop offset="0.35" stop-color="#8B9471"/><stop offset="0.7" stop-color="#D4C4A0"/><stop offset="1" stop-color="#F2ECD8"/>');
  p = replaceGradient(p, 'pronghorn-antler', '<stop offset="0" stop-color="#F2ECD8"/><stop offset="0.5" stop-color="#6A2A1E"/><stop offset="1" stop-color="#3E3428"/>');
  a.pronghorns = replaceAll(p, [['#86EFAC','#F2ECD8'],['#062014','#3E3428'],['#04110a','#1A130A'],['#B45309','#3E3428'],['#FEF3C7','#F2ECD8']]);
  let sa = replaceGradient(extractMarkup('salamanders'), 'salamander-body', '<stop offset="0" stop-color="#4A2E3A"/><stop offset="0.35" stop-color="#E07A9A"/><stop offset="0.7" stop-color="#F8B8C8"/><stop offset="1" stop-color="#F4EFE4"/>');
  a.salamanders = replaceAll(sa, [['#06B6D4','#7AD0C4'],['#B91C1C','#E07A9A'],['#8b2800','#4A2E3A']]);
  let m = replaceGradient(extractMarkup('maples'), 'maple-leaf', '<stop offset="0" stop-color="#F4F1E4"/><stop offset="0.25" stop-color="#E8DCB4"/><stop offset="0.55" stop-color="#A8C48E"/><stop offset="0.8" stop-color="#6B4423"/><stop offset="1" stop-color="#3A2A1A"/>');
  a.maples = replaceAll(m, [['#FDBA74','#E8DCB4'],['#F97316','#A8C48E'],['#DC2626','#D85A3C'],['#B91C1C','#6B4423'],['#991B1B','#8B6B3C'],['#7F1D1D','#6B4423'],['#5A1616','#4A3520'],['#4A1010','#3A2A1A'],['#3A0810','#2A1E10'],['#2D1A0A','#2A1E10']]);
  let r = replaceGradient(extractMarkup('raccoons'), 'raccoon-face', '<stop offset="0" stop-color="#D8CAB0"/><stop offset="0.5" stop-color="#8A8E92"/><stop offset="1" stop-color="#4A3E2E"/>');
  r = replaceGradient(r, 'raccoon-ears', '<stop offset="0" stop-color="#C8D070"/><stop offset="0.5" stop-color="#9EA85C"/><stop offset="1" stop-color="#5A6330"/>');
  a.raccoons = replaceGradient(r, 'raccoon-eyes', '<stop offset="0" stop-color="#C8D070"/><stop offset="0.5" stop-color="#9EA85C"/><stop offset="1" stop-color="#4A5528"/>');
  return a;
}
function buildD() {
  const a = {};
  a.sentinels = replaceGradient(extractMarkup('sentinels'), 'boar-grad', '<stop offset="0" stop-color="#0E1A26"/><stop offset="0.25" stop-color="#1B3A5C"/><stop offset="0.55" stop-color="#5A1F1F"/><stop offset="0.82" stop-color="#C9B27A"/><stop offset="1" stop-color="#E8DCC4"/>');
  a.wolves = replaceGradient(extractMarkup('wolves'), 'dolphin-grad', '<stop offset="0" stop-color="#141F28"/><stop offset="0.3" stop-color="#2E5F7A"/><stop offset="0.6" stop-color="#D4C9A8"/><stop offset="0.82" stop-color="#B89968"/><stop offset="1" stop-color="#8A2E3B"/>');
  let s = replaceGradient(extractMarkup('stags'), 'ghost-grad', '<stop offset="0" stop-color="#E4DCC2"/><stop offset="0.35" stop-color="#C8A862"/><stop offset="0.7" stop-color="#6B0D16"/><stop offset="1" stop-color="#0C0608"/>');
  a.stags = replaceAll(s, [['#8FB3D6','#C8A862'],['#6A98C0','#6B0D16']]);
  let se = replaceGradient(extractMarkup('serpents'), 'serpent-grad', '<stop offset="0" stop-color="#0A1F1E"/><stop offset="0.35" stop-color="#0F766E"/><stop offset="0.7" stop-color="#14B8A6"/><stop offset="1" stop-color="#5EEAD4"/>');
  a.serpents = replaceAll(se, [['#39FF14','#F5C542'],['#0a0118','#0A1F1E']]);
  let p = replaceGradient(extractMarkup('pronghorns'), 'pronghorn-body', '<stop offset="0" stop-color="#0A0E1E"/><stop offset="0.35" stop-color="#1C2645"/><stop offset="0.7" stop-color="#8C7AA8"/><stop offset="1" stop-color="#D8D4E4"/>');
  p = replaceGradient(p, 'pronghorn-antler', '<stop offset="0" stop-color="#E8DCC2"/><stop offset="0.4" stop-color="#C4A668"/><stop offset="0.75" stop-color="#8B6E30"/><stop offset="1" stop-color="#3E2E10"/>');
  a.pronghorns = replaceAll(p, [['#86EFAC','#D8D4E4'],['#062014','#0A0E1E'],['#04110a','#050714'],['#B45309','#3E2E10'],['#FEF3C7','#E8DCC2']]);
  let sa = replaceGradient(extractMarkup('salamanders'), 'salamander-body', '<stop offset="0" stop-color="#2E1A0E"/><stop offset="0.3" stop-color="#5C1D1A"/><stop offset="0.6" stop-color="#C9302C"/><stop offset="0.85" stop-color="#E8B54A"/><stop offset="1" stop-color="#F1E4B8"/>');
  a.salamanders = replaceAll(sa, [['#06B6D4','#F1E4B8'],['#B91C1C','#5C1D1A'],['#8b2800','#2E1A0E']]);
  let m = replaceGradient(extractMarkup('maples'), 'maple-leaf', '<stop offset="0" stop-color="#E8C968"/><stop offset="0.25" stop-color="#C8342B"/><stop offset="0.55" stop-color="#8A1F18"/><stop offset="0.8" stop-color="#2A1E18"/><stop offset="1" stop-color="#0E0806"/>');
  a.maples = replaceAll(m, [['#FDBA74','#E8C968'],['#F97316','#E8A03A'],['#DC2626','#C8342B'],['#B91C1C','#8A1F18'],['#991B1B','#6B1712'],['#7F1D1D','#4A1510'],['#5A1616','#2A1E18'],['#4A1010','#1E1410'],['#3A0810','#0E0806'],['#2D1A0A','#0E0806']]);
  let r = replaceGradient(extractMarkup('raccoons'), 'raccoon-face', '<stop offset="0" stop-color="#E8DCC2"/><stop offset="0.5" stop-color="#C8A060"/><stop offset="1" stop-color="#6B5B2E"/>');
  r = replaceGradient(r, 'raccoon-mask', '<stop offset="0" stop-color="#6B5120"/><stop offset="0.6" stop-color="#3A2618"/><stop offset="1" stop-color="#1A0F08"/>');
  r = replaceGradient(r, 'raccoon-ears', '<stop offset="0" stop-color="#E8746A"/><stop offset="0.5" stop-color="#8B2E1F"/><stop offset="1" stop-color="#3A0F08"/>');
  a.raccoons = replaceGradient(r, 'raccoon-eyes', '<stop offset="0" stop-color="#F4A838"/><stop offset="0.5" stop-color="#C8A060"/><stop offset="1" stop-color="#6B4A1A"/>');
  return a;
}
function buildE() {
  const a = {};
  a.sentinels = replaceGradient(extractMarkup('sentinels'), 'boar-grad', '<stop offset="0" stop-color="#1C1C1C"/><stop offset="0.25" stop-color="#2D2D2D"/><stop offset="0.55" stop-color="#7A4F1E"/><stop offset="0.82" stop-color="#D4AF37"/><stop offset="1" stop-color="#F4E8B8"/>');
  a.wolves = replaceGradient(extractMarkup('wolves'), 'dolphin-grad', '<stop offset="0" stop-color="#0E0A2E"/><stop offset="0.3" stop-color="#B76AE8"/><stop offset="0.6" stop-color="#FF5EAA"/><stop offset="0.82" stop-color="#FF9A56"/><stop offset="1" stop-color="#00D4FF"/>');
  let s = replaceGradient(extractMarkup('stags'), 'ghost-grad', '<stop offset="0" stop-color="#E4D8B8"/><stop offset="0.3" stop-color="#B77F1F"/><stop offset="0.65" stop-color="#A8481A"/><stop offset="1" stop-color="#1A1612"/>');
  a.stags = replaceAll(s, [['#8FB3D6','#A8481A'],['#6A98C0','#4A5558']]);
  let se = replaceGradient(extractMarkup('serpents'), 'serpent-grad', '<stop offset="0" stop-color="#0A0A0A"/><stop offset="0.35" stop-color="#1A1A1A"/><stop offset="0.7" stop-color="#8B1818"/><stop offset="1" stop-color="#D4AF37"/>');
  a.serpents = replaceAll(se, [['#39FF14','#F4EDD8'],['#0a0118','#0A0A0A']]);
  let p = replaceGradient(extractMarkup('pronghorns'), 'pronghorn-body', '<stop offset="0" stop-color="#2A1810"/><stop offset="0.35" stop-color="#6B4423"/><stop offset="0.7" stop-color="#C97C3E"/><stop offset="1" stop-color="#E8D4B0"/>');
  p = replaceGradient(p, 'pronghorn-antler', '<stop offset="0" stop-color="#E8D4B0"/><stop offset="0.4" stop-color="#4A9A8E"/><stop offset="0.8" stop-color="#2E6B63"/><stop offset="1" stop-color="#1A3A35"/>');
  a.pronghorns = replaceAll(p, [['#86EFAC','#E8D4B0'],['#062014','#2A1810'],['#04110a','#180C06'],['#B45309','#1A3A35'],['#FEF3C7','#E8D4B0']]);
  let sa = replaceGradient(extractMarkup('salamanders'), 'salamander-body', '<stop offset="0" stop-color="#9B59B6"/><stop offset="0.25" stop-color="#FF6B9D"/><stop offset="0.5" stop-color="#FF8C42"/><stop offset="0.75" stop-color="#FFD93D"/><stop offset="1" stop-color="#2ECC71"/>');
  a.salamanders = replaceAll(sa, [['#06B6D4','#2ECC71'],['#B91C1C','#9B59B6'],['#8b2800','#6A1B8F']]);
  let m = replaceGradient(extractMarkup('maples'), 'maple-leaf', '<stop offset="0" stop-color="#E8DCC2"/><stop offset="0.2" stop-color="#B77F1F"/><stop offset="0.45" stop-color="#6B1818"/><stop offset="0.72" stop-color="#0D2B4E"/><stop offset="1" stop-color="#071427"/>');
  a.maples = replaceAll(m, [['#FDBA74','#E8DCC2'],['#F97316','#B77F1F'],['#DC2626','#8B1818'],['#B91C1C','#6B1818'],['#991B1B','#4A0F0F'],['#7F1D1D','#2D0A0A'],['#5A1616','#1A3A5C'],['#4A1010','#0D2B4E'],['#3A0810','#071427'],['#2D1A0A','#1A1612']]);
  let r = replaceGradient(extractMarkup('raccoons'), 'raccoon-face', '<stop offset="0" stop-color="#E8D8A8"/><stop offset="0.5" stop-color="#C9A860"/><stop offset="1" stop-color="#6B5B2E"/>');
  r = replaceGradient(r, 'raccoon-mask', '<stop offset="0" stop-color="#5C3820"/><stop offset="0.6" stop-color="#3A2818"/><stop offset="1" stop-color="#1A0F08"/>');
  r = replaceGradient(r, 'raccoon-ears', '<stop offset="0" stop-color="#F4A55A"/><stop offset="0.5" stop-color="#D4823B"/><stop offset="1" stop-color="#8B4A1F"/>');
  a.raccoons = replaceGradient(r, 'raccoon-eyes', '<stop offset="0" stop-color="#D4AF37"/><stop offset="0.5" stop-color="#8B7820"/><stop offset="1" stop-color="#3D3410"/>');
  return a;
}
function buildF() {
  const a = {};
  a.sentinels = replaceGradient(extractMarkup('sentinels'), 'boar-grad', '<stop offset="0" stop-color="#E4E4E7"/><stop offset="0.3" stop-color="#B4B4B8"/><stop offset="0.6" stop-color="#52525B"/><stop offset="0.82" stop-color="#1F1F23"/><stop offset="1" stop-color="#DC2626"/>');
  a.wolves = replaceGradient(extractMarkup('wolves'), 'dolphin-grad', '<stop offset="0" stop-color="#00060D"/><stop offset="0.3" stop-color="#0A1F33"/><stop offset="0.6" stop-color="#004D5A"/><stop offset="0.82" stop-color="#00FFAA"/><stop offset="1" stop-color="#C0E8FF"/>');
  let s = replaceGradient(extractMarkup('stags'), 'ghost-grad', '<stop offset="0" stop-color="#FFB547"/><stop offset="0.2" stop-color="#E85D04"/><stop offset="0.5" stop-color="#4A0000"/><stop offset="1" stop-color="#000000"/>');
  a.stags = replaceAll(s, [['#8FB3D6','#7A3500'],['#6A98C0','#4A1F00']]);
  let se = replaceGradient(extractMarkup('serpents'), 'serpent-grad', '<stop offset="0" stop-color="#0F0505"/><stop offset="0.3" stop-color="#3A0808"/><stop offset="0.6" stop-color="#7F1D1D"/><stop offset="0.85" stop-color="#DC2626"/><stop offset="1" stop-color="#FCA5A5"/>');
  a.serpents = replaceAll(se, [['#39FF14','#FFF5E0'],['#0a0118','#0F0505']]);
  let p = replaceGradient(extractMarkup('pronghorns'), 'pronghorn-body', '<stop offset="0" stop-color="#0A0E14"/><stop offset="0.3" stop-color="#1A2540"/><stop offset="0.55" stop-color="#06B6D4"/><stop offset="0.8" stop-color="#00F5A0"/><stop offset="1" stop-color="#A855F7"/>');
  p = replaceGradient(p, 'pronghorn-antler', '<stop offset="0" stop-color="#FEF3C7"/><stop offset="0.4" stop-color="#C0E8FF"/><stop offset="0.8" stop-color="#4A6B9A"/><stop offset="1" stop-color="#1A2540"/>');
  a.pronghorns = replaceAll(p, [['#86EFAC','#00F5A0'],['#062014','#0A0E14'],['#04110a','#050714'],['#B45309','#1A2540'],['#FEF3C7','#FEF3C7']]);
  let sa = replaceGradient(extractMarkup('salamanders'), 'salamander-body', '<stop offset="0" stop-color="#0A0A0A"/><stop offset="0.3" stop-color="#1F1F23"/><stop offset="0.55" stop-color="#8B5CF6"/><stop offset="0.78" stop-color="#F472B6"/><stop offset="1" stop-color="#FFFFFF"/>');
  a.salamanders = replaceAll(sa, [['#06B6D4','#22D3EE'],['#B91C1C','#1F1F23'],['#8b2800','#0A0A0A']]);
  let m = replaceGradient(extractMarkup('maples'), 'maple-leaf', '<stop offset="0" stop-color="#F0F9FF"/><stop offset="0.25" stop-color="#BAE6FD"/><stop offset="0.5" stop-color="#7DD3FC"/><stop offset="0.75" stop-color="#1E40AF"/><stop offset="1" stop-color="#1E1B4B"/>');
  a.maples = replaceAll(m, [['#FDBA74','#F0F9FF'],['#F97316','#BAE6FD'],['#DC2626','#7DD3FC'],['#B91C1C','#3B82F6'],['#991B1B','#1E40AF'],['#7F1D1D','#1E3A8A'],['#5A1616','#1E1B4B'],['#4A1010','#181633'],['#3A0810','#0F0D2A'],['#2D1A0A','#1C1917']]);
  let r = replaceGradient(extractMarkup('raccoons'), 'raccoon-face', '<stop offset="0" stop-color="#F5F5F4"/><stop offset="0.5" stop-color="#A1A1AA"/><stop offset="1" stop-color="#4A4A52"/>');
  r = replaceGradient(r, 'raccoon-mask', '<stop offset="0" stop-color="#1A1F2E"/><stop offset="0.5" stop-color="#0F1423"/><stop offset="1" stop-color="#000000"/>');
  r = replaceGradient(r, 'raccoon-ears', '<stop offset="0" stop-color="#F97316"/><stop offset="0.4" stop-color="#7DD3FC"/><stop offset="0.8" stop-color="#1E40AF"/><stop offset="1" stop-color="#0F1423"/>');
  a.raccoons = replaceGradient(r, 'raccoon-eyes', '<stop offset="0" stop-color="#F97316"/><stop offset="0.5" stop-color="#FB923C"/><stop offset="1" stop-color="#7C2D12"/>');
  return a;
}

// =========================================================================
// G — WILD (unconstrained creative burst)
// =========================================================================
function buildG() {
  const a = {};

  // BOARS — CHROME MIRROR (metallic silver reflection)
  a.sentinels = replaceGradient(extractMarkup('sentinels'), 'boar-grad',
    '<stop offset="0" stop-color="#F9FAFB"/>' +
    '<stop offset="0.2" stop-color="#D1D5DB"/>' +
    '<stop offset="0.45" stop-color="#6B7280"/>' +
    '<stop offset="0.7" stop-color="#1F2937"/>' +
    '<stop offset="1" stop-color="#F3F4F6"/>');

  // DOLPHINS — IRIDESCENT OIL-SLICK (rainbow shift)
  a.wolves = replaceGradient(extractMarkup('wolves'), 'dolphin-grad',
    '<stop offset="0" stop-color="#A855F7"/>' +
    '<stop offset="0.2" stop-color="#EC4899"/>' +
    '<stop offset="0.45" stop-color="#F59E0B"/>' +
    '<stop offset="0.7" stop-color="#22C55E"/>' +
    '<stop offset="1" stop-color="#06B6D4"/>');

  // SPECTRES — GLITCH RGB (pixel data corruption)
  let s = replaceGradient(extractMarkup('stags'), 'ghost-grad',
    '<stop offset="0" stop-color="#FF0066"/>' +
    '<stop offset="0.33" stop-color="#00FF88"/>' +
    '<stop offset="0.66" stop-color="#0066FF"/>' +
    '<stop offset="1" stop-color="#1F1F23"/>');
  a.stags = replaceAll(s, [['#8FB3D6','#FF0066'],['#6A98C0','#0066FF']]);

  // SERPENTS — LIQUID MERCURY (flowing silver metal)
  let se = replaceGradient(extractMarkup('serpents'), 'serpent-grad',
    '<stop offset="0" stop-color="#F9FAFB"/>' +
    '<stop offset="0.3" stop-color="#9CA3AF"/>' +
    '<stop offset="0.6" stop-color="#4B5563"/>' +
    '<stop offset="0.85" stop-color="#E5E7EB"/>' +
    '<stop offset="1" stop-color="#1F2937"/>');
  a.serpents = replaceAll(se, [['#39FF14','#F9FAFB'],['#0a0118','#111827']]);

  // PRONGHORNS — TIE-DYE RAINBOW (hippie swirl)
  let p = replaceGradient(extractMarkup('pronghorns'), 'pronghorn-body',
    '<stop offset="0" stop-color="#A855F7"/>' +
    '<stop offset="0.25" stop-color="#3B82F6"/>' +
    '<stop offset="0.5" stop-color="#22C55E"/>' +
    '<stop offset="0.75" stop-color="#EAB308"/>' +
    '<stop offset="1" stop-color="#EC4899"/>');
  p = replaceGradient(p, 'pronghorn-antler',
    '<stop offset="0" stop-color="#FFFFFF"/>' +
    '<stop offset="0.5" stop-color="#F3E8FF"/>' +
    '<stop offset="1" stop-color="#A855F7"/>');
  a.pronghorns = replaceAll(p, [['#86EFAC','#FFFFFF'],['#062014','#4C1D95'],['#04110a','#1E1B4B'],['#B45309','#6B21A8'],['#FEF3C7','#FFFFFF']]);

  // SALAMANDERS — NEON TUBE SIGN (electric glow, hollow look)
  let sa = replaceGradient(extractMarkup('salamanders'), 'salamander-body',
    '<stop offset="0" stop-color="#06B6D4"/>' +
    '<stop offset="0.4" stop-color="#22D3EE"/>' +
    '<stop offset="0.7" stop-color="#67E8F9"/>' +
    '<stop offset="1" stop-color="#CFFAFE"/>');
  a.salamanders = replaceAll(sa, [['#06B6D4','#F472B6'],['#B91C1C','#0891B2'],['#8b2800','#06B6D4']]);

  // MAPLES — LENTICULAR SPLIT (alternating color bands)
  let m = replaceGradient(extractMarkup('maples'), 'maple-leaf',
    '<stop offset="0" stop-color="#DC2626"/>' +
    '<stop offset="0.2" stop-color="#F59E0B"/>' +
    '<stop offset="0.4" stop-color="#DC2626"/>' +
    '<stop offset="0.6" stop-color="#F59E0B"/>' +
    '<stop offset="0.8" stop-color="#DC2626"/>' +
    '<stop offset="1" stop-color="#F59E0B"/>');
  a.maples = replaceAll(m, [['#FDBA74','#F59E0B'],['#F97316','#DC2626'],['#DC2626','#DC2626'],['#B91C1C','#F59E0B'],['#991B1B','#DC2626'],['#7F1D1D','#F59E0B'],['#5A1616','#DC2626'],['#4A1010','#F59E0B'],['#3A0810','#DC2626'],['#2D1A0A','#1C1917']]);

  // RACCOONS — GRAFFITI WILDSTYLE (spray paint pop)
  let r = replaceGradient(extractMarkup('raccoons'), 'raccoon-face',
    '<stop offset="0" stop-color="#FACC15"/>' +
    '<stop offset="0.5" stop-color="#EF4444"/>' +
    '<stop offset="1" stop-color="#3B82F6"/>');
  r = replaceGradient(r, 'raccoon-mask',
    '<stop offset="0" stop-color="#22C55E"/>' +
    '<stop offset="0.6" stop-color="#000000"/>' +
    '<stop offset="1" stop-color="#EC4899"/>');
  r = replaceGradient(r, 'raccoon-ears',
    '<stop offset="0" stop-color="#F97316"/>' +
    '<stop offset="0.5" stop-color="#EAB308"/>' +
    '<stop offset="1" stop-color="#DC2626"/>');
  a.raccoons = replaceGradient(r, 'raccoon-eyes',
    '<stop offset="0" stop-color="#22C55E"/>' +
    '<stop offset="0.5" stop-color="#FACC15"/>' +
    '<stop offset="1" stop-color="#EF4444"/>');
  return a;
}

// =========================================================================
// H — DESIGN RESEARCH (color theory / art history grounded)
// =========================================================================
function buildH() {
  const a = {};

  // BOARS — CARAVAGGIO TENEBRISM (deep shadow + single dramatic highlight)
  a.sentinels = replaceGradient(extractMarkup('sentinels'), 'boar-grad',
    '<stop offset="0" stop-color="#000000"/>' +
    '<stop offset="0.4" stop-color="#0D0503"/>' +
    '<stop offset="0.7" stop-color="#3F1E0A"/>' +
    '<stop offset="0.9" stop-color="#B8730A"/>' +
    '<stop offset="1" stop-color="#F4D574"/>');

  // DOLPHINS — HOKUSAI "GREAT WAVE" (Prussian blue + foam white)
  a.wolves = replaceGradient(extractMarkup('wolves'), 'dolphin-grad',
    '<stop offset="0" stop-color="#0B1E3F"/>' +
    '<stop offset="0.3" stop-color="#1A3C6E"/>' +
    '<stop offset="0.6" stop-color="#4A7AB4"/>' +
    '<stop offset="0.85" stop-color="#B8D1E4"/>' +
    '<stop offset="1" stop-color="#F2EDE0"/>');

  // SPECTRES — ROTHKO CHAPEL (maroon/plum/charcoal color-field blocks)
  let s = replaceGradient(extractMarkup('stags'), 'ghost-grad',
    '<stop offset="0" stop-color="#4A1F30"/>' +
    '<stop offset="0.35" stop-color="#2E1424"/>' +
    '<stop offset="0.7" stop-color="#1A0F18"/>' +
    '<stop offset="1" stop-color="#0B0608"/>');
  a.stags = replaceAll(s, [['#8FB3D6','#3A1A28'],['#6A98C0','#1A0F18']]);

  // SERPENTS — KLIMT GOLD PERIOD (gold leaf + emerald patterns)
  let se = replaceGradient(extractMarkup('serpents'), 'serpent-grad',
    '<stop offset="0" stop-color="#054935"/>' +
    '<stop offset="0.3" stop-color="#0E7550"/>' +
    '<stop offset="0.55" stop-color="#D4AF37"/>' +
    '<stop offset="0.8" stop-color="#F4D574"/>' +
    '<stop offset="1" stop-color="#FFF2C2"/>');
  a.serpents = replaceAll(se, [['#39FF14','#FFF2C2'],['#0a0118','#054935']]);

  // PRONGHORNS — JAPANDI (warm wood + cream + black, Muji clarity)
  let p = replaceGradient(extractMarkup('pronghorns'), 'pronghorn-body',
    '<stop offset="0" stop-color="#2A1D12"/>' +
    '<stop offset="0.35" stop-color="#8B6B4A"/>' +
    '<stop offset="0.7" stop-color="#C9B38E"/>' +
    '<stop offset="1" stop-color="#F4EFE4"/>');
  p = replaceGradient(p, 'pronghorn-antler',
    '<stop offset="0" stop-color="#F4EFE4"/>' +
    '<stop offset="0.5" stop-color="#2A2420"/>' +
    '<stop offset="1" stop-color="#0A0806"/>');
  a.pronghorns = replaceAll(p, [['#86EFAC','#F4EFE4'],['#062014','#2A1D12'],['#04110a','#0A0806'],['#B45309','#0A0806'],['#FEF3C7','#F4EFE4']]);

  // SALAMANDERS — FAUVISM (pure saturated triadic: pink+orange+green)
  let sa = replaceGradient(extractMarkup('salamanders'), 'salamander-body',
    '<stop offset="0" stop-color="#2ECC71"/>' +
    '<stop offset="0.3" stop-color="#E84393"/>' +
    '<stop offset="0.6" stop-color="#F39C12"/>' +
    '<stop offset="0.85" stop-color="#F1C40F"/>' +
    '<stop offset="1" stop-color="#E8F4D4"/>');
  a.salamanders = replaceAll(sa, [['#06B6D4','#8E44AD'],['#B91C1C','#2ECC71'],['#8b2800','#186A3B']]);

  // MAPLES — BRUEGHEL AUTUMN LANDSCAPE (earthy olive + ochre + umber)
  let m = replaceGradient(extractMarkup('maples'), 'maple-leaf',
    '<stop offset="0" stop-color="#E8D090"/>' +
    '<stop offset="0.25" stop-color="#B8953A"/>' +
    '<stop offset="0.5" stop-color="#8B5E24"/>' +
    '<stop offset="0.75" stop-color="#5A3E1A"/>' +
    '<stop offset="1" stop-color="#2A1D10"/>');
  a.maples = replaceAll(m, [['#FDBA74','#E8D090'],['#F97316','#C9A54E'],['#DC2626','#8B5E24'],['#B91C1C','#6B4A1E'],['#991B1B','#5A3E1A'],['#7F1D1D','#4A2E12'],['#5A1616','#3A1F0E'],['#4A1010','#2A1D10'],['#3A0810','#1E0F08'],['#2D1A0A','#1A1006']]);

  // RACCOONS — BAUHAUS PRIMARY (red/blue/yellow + black + white)
  let r = replaceGradient(extractMarkup('raccoons'), 'raccoon-face',
    '<stop offset="0" stop-color="#FFFFFF"/>' +
    '<stop offset="0.5" stop-color="#F4F4F5"/>' +
    '<stop offset="1" stop-color="#D4D4D8"/>');
  r = replaceGradient(r, 'raccoon-mask',
    '<stop offset="0" stop-color="#1F2937"/>' +
    '<stop offset="0.6" stop-color="#111827"/>' +
    '<stop offset="1" stop-color="#000000"/>');
  r = replaceGradient(r, 'raccoon-ears',
    '<stop offset="0" stop-color="#EAB308"/>' +
    '<stop offset="0.5" stop-color="#DC2626"/>' +
    '<stop offset="1" stop-color="#1D4ED8"/>');
  a.raccoons = replaceGradient(r, 'raccoon-eyes',
    '<stop offset="0" stop-color="#EAB308"/>' +
    '<stop offset="0.5" stop-color="#DC2626"/>' +
    '<stop offset="1" stop-color="#1D4ED8"/>');
  return a;
}

// =========================================================================
// I — UTILITY (white/cream + single team signature color)
// For generic in-game reuse — reversible, works on any background
// =========================================================================
function buildI() {
  const a = {};

  // BOARS — white + crimson accent (team primary)
  a.sentinels = replaceGradient(extractMarkup('sentinels'), 'boar-grad',
    '<stop offset="0" stop-color="#FFFFFF"/>' +
    '<stop offset="0.5" stop-color="#F5F5F4"/>' +
    '<stop offset="0.8" stop-color="#8B0000"/>' +
    '<stop offset="1" stop-color="#8B0000"/>');

  // DOLPHINS — white + magenta accent
  a.wolves = replaceGradient(extractMarkup('wolves'), 'dolphin-grad',
    '<stop offset="0" stop-color="#FFFFFF"/>' +
    '<stop offset="0.5" stop-color="#F5F5F4"/>' +
    '<stop offset="0.85" stop-color="#E8548F"/>' +
    '<stop offset="1" stop-color="#E8548F"/>');

  // SPECTRES — white + ice blue accent
  let s = replaceGradient(extractMarkup('stags'), 'ghost-grad',
    '<stop offset="0" stop-color="#FFFFFF"/>' +
    '<stop offset="0.5" stop-color="#F5F5F4"/>' +
    '<stop offset="0.85" stop-color="#5DADE2"/>' +
    '<stop offset="1" stop-color="#1B4F72"/>');
  a.stags = replaceAll(s, [['#8FB3D6','#F5F5F4'],['#6A98C0','#E5E7EB']]);

  // SERPENTS — white + deep purple accent
  let se = replaceGradient(extractMarkup('serpents'), 'serpent-grad',
    '<stop offset="0" stop-color="#FFFFFF"/>' +
    '<stop offset="0.5" stop-color="#F5F5F4"/>' +
    '<stop offset="0.85" stop-color="#9333EA"/>' +
    '<stop offset="1" stop-color="#2E0854"/>');
  a.serpents = replaceAll(se, [['#39FF14','#2E0854'],['#0a0118','#D4D4D8']]);

  // PRONGHORNS — white + emerald accent (+ amber antlers kept small)
  let p = replaceGradient(extractMarkup('pronghorns'), 'pronghorn-body',
    '<stop offset="0" stop-color="#FFFFFF"/>' +
    '<stop offset="0.5" stop-color="#F5F5F4"/>' +
    '<stop offset="0.85" stop-color="#22C55E"/>' +
    '<stop offset="1" stop-color="#166534"/>');
  p = replaceGradient(p, 'pronghorn-antler',
    '<stop offset="0" stop-color="#F5F5F4"/>' +
    '<stop offset="0.5" stop-color="#E5E7EB"/>' +
    '<stop offset="1" stop-color="#22C55E"/>');
  a.pronghorns = replaceAll(p, [['#86EFAC','#F5F5F4'],['#062014','#22C55E'],['#04110a','#166534'],['#B45309','#22C55E'],['#FEF3C7','#F5F5F4']]);

  // SALAMANDERS — white + orange accent
  let sa = replaceGradient(extractMarkup('salamanders'), 'salamander-body',
    '<stop offset="0" stop-color="#FFFFFF"/>' +
    '<stop offset="0.5" stop-color="#F5F5F4"/>' +
    '<stop offset="0.85" stop-color="#FF8C00"/>' +
    '<stop offset="1" stop-color="#C4460D"/>');
  a.salamanders = replaceAll(sa, [['#06B6D4','#FF8C00'],['#B91C1C','#F5F5F4'],['#8b2800','#E5E7EB']]);

  // MAPLES — white + crimson accent
  let m = replaceGradient(extractMarkup('maples'), 'maple-leaf',
    '<stop offset="0" stop-color="#FFFFFF"/>' +
    '<stop offset="0.4" stop-color="#F5F5F4"/>' +
    '<stop offset="0.8" stop-color="#DC2626"/>' +
    '<stop offset="1" stop-color="#7F1D1D"/>');
  a.maples = replaceAll(m, [['#FDBA74','#F5F5F4'],['#F97316','#F5F5F4'],['#DC2626','#DC2626'],['#B91C1C','#E5E7EB'],['#991B1B','#F5F5F4'],['#7F1D1D','#DC2626'],['#5A1616','#D4D4D8'],['#4A1010','#D4D4D8'],['#3A0810','#E5E7EB'],['#2D1A0A','#D4D4D8']]);

  // RACCOONS — white + amber accent
  let r = replaceGradient(extractMarkup('raccoons'), 'raccoon-face',
    '<stop offset="0" stop-color="#FFFFFF"/>' +
    '<stop offset="0.5" stop-color="#F5F5F4"/>' +
    '<stop offset="1" stop-color="#E5E7EB"/>');
  r = replaceGradient(r, 'raccoon-mask',
    '<stop offset="0" stop-color="#E5E7EB"/>' +
    '<stop offset="0.6" stop-color="#D4D4D8"/>' +
    '<stop offset="1" stop-color="#A1A1AA"/>');
  r = replaceGradient(r, 'raccoon-ears',
    '<stop offset="0" stop-color="#FFB547"/>' +
    '<stop offset="0.5" stop-color="#F59E0B"/>' +
    '<stop offset="1" stop-color="#B45309"/>');
  a.raccoons = replaceGradient(r, 'raccoon-eyes',
    '<stop offset="0" stop-color="#FFB547"/>' +
    '<stop offset="0.5" stop-color="#F59E0B"/>' +
    '<stop offset="1" stop-color="#B45309"/>');
  return a;
}

// Build all variants
const altsB = buildB(); for (const k of Object.keys(altsB)) altsB[k] = suffixIds(altsB[k], '-B');
const altsC = buildC(); for (const k of Object.keys(altsC)) altsC[k] = suffixIds(altsC[k], '-C');
const altsD = buildD(); for (const k of Object.keys(altsD)) altsD[k] = suffixIds(altsD[k], '-D');
const altsE = buildE(); for (const k of Object.keys(altsE)) altsE[k] = suffixIds(altsE[k], '-E');
const altsF = buildF(); for (const k of Object.keys(altsF)) altsF[k] = suffixIds(altsF[k], '-F');
const altsG = buildG(); for (const k of Object.keys(altsG)) altsG[k] = suffixIds(altsG[k], '-G');
const altsH = buildH(); for (const k of Object.keys(altsH)) altsH[k] = suffixIds(altsH[k], '-H');
const altsI = buildI(); for (const k of Object.keys(altsI)) altsI[k] = suffixIds(altsI[k], '-I');

const currentMarkup = {};
const TEAM_IDS = ['sentinels','wolves','stags','serpents','pronghorns','salamanders','maples','raccoons'];
for (const t of TEAM_IDS) currentMarkup[t] = suffixIds(extractMarkup(t), '-A');

// Scoring matrix — each variant scored /10 with a one-word tag.
// My subjective scoring considers: distinctiveness, team-fit, readability,
// production-worthiness, conference cohesion.
const SCORES = {
  sentinels: {
    A:{s:9.0,t:'iconic'},    B:{s:7.8,t:'menacing'},  C:{s:7.2,t:'grounded'},
    D:{s:7.5,t:'mythic'},    E:{s:8.5,t:'luxe'},      F:{s:8.8,t:'striking'},
    G:{s:6.0,t:'cold'},      H:{s:9.2,t:'theatrical'},I:{s:8.2,t:'clean'}
  },
  wolves: {
    A:{s:8.5,t:'sleek'},     B:{s:7.0,t:'loud'},      C:{s:9.5,t:'elegant'},
    D:{s:8.8,t:'prophetic'}, E:{s:7.8,t:'party'},     F:{s:9.2,t:'cinematic'},
    G:{s:8.0,t:'oily'},      H:{s:9.5,t:'masterful'}, I:{s:7.5,t:'minimal'}
  },
  stags: {
    A:{s:9.0,t:'ethereal'},  B:{s:7.5,t:'tonal'},     C:{s:8.0,t:'eerie'},
    D:{s:8.2,t:'occult'},    E:{s:8.5,t:'industrial'},F:{s:9.5,t:'cosmic'},
    G:{s:6.5,t:'chaotic'},   H:{s:9.0,t:'sacred'},    I:{s:7.8,t:'quiet'}
  },
  serpents: {
    A:{s:9.0,t:'signature'}, B:{s:7.5,t:'predatory'}, C:{s:7.2,t:'desert'},
    D:{s:9.8,t:'divine'},    E:{s:9.3,t:'painterly'}, F:{s:8.2,t:'ritual'},
    G:{s:7.5,t:'liquid'},    H:{s:9.5,t:'klimtian'},  I:{s:7.8,t:'regal'}
  },
  pronghorns: {
    A:{s:8.8,t:'noble'},     B:{s:8.2,t:'inverted'},  C:{s:8.5,t:'real'},
    D:{s:9.5,t:'mythic'},    E:{s:8.0,t:'western'},   F:{s:9.3,t:'cosmic'},
    G:{s:5.0,t:'chaotic'},   H:{s:9.0,t:'refined'},   I:{s:7.2,t:'sterile'}
  },
  salamanders: {
    A:{s:8.8,t:'electric'},  B:{s:7.8,t:'toxic'},     C:{s:9.2,t:'delightful'},
    D:{s:8.5,t:'alchemical'},E:{s:7.0,t:'hippie'},    F:{s:8.5,t:'cyberpunk'},
    G:{s:7.2,t:'neon-glow'}, H:{s:8.8,t:'matisse'},   I:{s:7.0,t:'modest'}
  },
  maples: {
    A:{s:8.5,t:'autumnal'},  B:{s:8.8,t:'sugar'},     C:{s:7.5,t:'spring'},
    D:{s:9.5,t:'kyoto'},     E:{s:8.2,t:'patriot'},   F:{s:9.0,t:'frozen'},
    G:{s:5.5,t:'striped'},   H:{s:9.2,t:'earth'},     I:{s:8.0,t:'crisp'}
  },
  raccoons: {
    A:{s:9.2,t:'iconic'},    B:{s:7.8,t:'cyber'},     C:{s:8.0,t:'real'},
    D:{s:8.5,t:'retro'},     E:{s:8.3,t:'funky'},     F:{s:9.3,t:'noir'},
    G:{s:6.5,t:'loud'},      H:{s:8.8,t:'bauhaus'},   I:{s:8.5,t:'clean'}
  }
};

// Compute sortable "conference-pick" ordering per team
const VARIANT_ORDER = ['A','B','C','D','E','F','G','H','I'];
const VARIANT_META = {
  A: { label:'CURRENT',  cls:'a', badge:'A · CURRENT',  column:'Broadcast polish' },
  B: { label:'BOLD',     cls:'b', badge:'B · BOLD',     column:'Intensified: obsidian/neon/black' },
  C: { label:'BIOLOGY',  cls:'c', badge:'C · BIOLOGY',  column:'Real animal colors, muted' },
  D: { label:'MYTH',     cls:'d', badge:'D · MYTH',     column:'Cultural/mythological reference' },
  E: { label:'ERA',      cls:'e', badge:'E · ERA',      column:'Historical visual style' },
  F: { label:'MOMENT',   cls:'f', badge:'F · MOMENT',   column:'Atmospheric lighting moment' },
  G: { label:'WILD',     cls:'g', badge:'G · WILD',     column:'Unconstrained creative burst' },
  H: { label:'RESEARCH', cls:'h', badge:'H · RESEARCH', column:'Art-history / color-theory grounded' },
  I: { label:'UTILITY',  cls:'i', badge:'I · UTILITY',  column:'White + team accent (reusable)' },
};

const teams = [
  { id:'sentinels', name:'Boars',       labels:{A:'Red + Gold',B:'Obsidian Volcanic',C:'Wild Tusker',D:'Celtic Twrch Trwyth',E:'Art Deco Gatsby',F:'Mountain Snow',G:'Chrome Mirror',H:'Caravaggio Tenebrism',I:'Mono White + Crimson'} },
  { id:'wolves',    name:'Dolphins',    labels:{A:'Wine → Pink',B:'Miami Neon',C:'Bottlenose Reef',D:"Apollo's Oracle",E:'Vaporwave 80s',F:'Deep Sea Bio-lum',G:'Iridescent Oil-slick',H:'Hokusai Great Wave',I:'Mono White + Magenta'} },
  { id:'stags',     name:'Spectres',    labels:{A:'Ice + Midnight',B:'Storm Silver',C:"Will-o'-Wisp",D:'Victorian Séance',E:'Industrial Steampunk',F:'Solar Eclipse',G:'Glitch RGB',H:'Rothko Chapel',I:'Mono White + Ice'} },
  { id:'serpents',  name:'Serpents',    labels:{A:'Purple + Venom',B:'Matte Black Mamba',C:'Diamondback Desert',D:'Quetzalcoatl',E:'Edo Ink Wash',F:'Blood Moon Ritual',G:'Liquid Mercury',H:'Klimt Gold Period',I:'Mono White + Purple'} },
  { id:'pronghorns',name:'Pronghorns',  labels:{A:'Emerald + Amber',B:'Bronze Earth',C:'Sage & Bone',D:'Artemis Moon',E:'Old West Frontier',F:'Aurora Borealis',G:'Tie-Dye Rainbow',H:'Japandi Minimalism',I:'Mono White + Emerald'} },
  { id:'salamanders',name:'Salamanders',labels:{A:'Fire + Cyan',B:'Poison Black',C:'Axolotl Bloom',D:"Alchemist's Kiln",E:'60s Psychedelic',F:'Neon Storm',G:'Neon Tube Sign',H:'Fauvist Triadic',I:'Mono White + Orange'} },
  { id:'maples',    name:'Maples',      labels:{A:'Crimson Autumn',B:'Amber Sugar Maple',C:'Spring Sap',D:'Momiji Temple',E:'Colonial Americana',F:'Ice Storm',G:'Lenticular Split',H:'Brueghel Earth',I:'Mono White + Red'} },
  { id:'raccoons',  name:'Raccoons',    labels:{A:'Noir + Amber',B:'Cyber Blue',C:'Silver Bandit',D:"70's Heist Caper",E:'70s Funk',F:'Rain-slick Midnight',G:'Graffiti Wildstyle',H:'Bauhaus Primary',I:'Mono White + Amber'} },
];

function wrap(inner) {
  return `<svg width="150" height="150" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

function markupFor(col, teamId) {
  switch (col) {
    case 'A': return currentMarkup[teamId];
    case 'B': return altsB[teamId];
    case 'C': return altsC[teamId];
    case 'D': return altsD[teamId];
    case 'E': return altsE[teamId];
    case 'F': return altsF[teamId];
    case 'G': return altsG[teamId];
    case 'H': return altsH[teamId];
    case 'I': return altsI[teamId];
  }
}

function scoreClass(s) {
  if (s >= 9) return 'top';
  if (s >= 8) return 'high';
  if (s >= 7) return 'mid';
  return 'low';
}

const rows = teams.map((t, idx) => {
  const cells = VARIANT_ORDER.map(col => {
    const meta = VARIANT_META[col];
    const score = SCORES[t.id][col];
    const utilityBg = col === 'I' ? 'style="background:#F5F5F4;"' : '';
    return `
    <div class="v ${meta.cls}">
      <div class="badge ${meta.cls}">${meta.badge}</div>
      <div class="score ${scoreClass(score.s)}">${score.s.toFixed(1)}</div>
      <div class="logo" ${utilityBg}>${wrap(markupFor(col, t.id))}</div>
      <div class="vname">${t.labels[col]}</div>
      <div class="vtag">${score.t}</div>
    </div>`;
  }).join('');
  return `
  <section class="pair">
    <header>
      <div class="num">${String(idx+1).padStart(2,'0')}</div>
      <h2>${t.name}</h2>
      <div class="top-pick">Top picks: ${Object.entries(SCORES[t.id]).sort((a,b)=>b[1].s-a[1].s).slice(0,3).map(([k,v])=>`<b>${k}</b> ${v.s.toFixed(1)}`).join(' · ')}</div>
    </header>
    <div class="grid-9">${cells}</div>
  </section>`;
}).join('');

// Column-header legend row
const legend = VARIANT_ORDER.map(col => {
  const m = VARIANT_META[col];
  return `<div class="leg ${m.cls}"><div class="leg-badge">${m.badge}</div><div class="leg-note">${m.column}</div></div>`;
}).join('');

const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<title>TORCH — 9-Way Logo Variants + Scores</title>
<link href="https://fonts.googleapis.com/css2?family=Teko:wght@300;500;700&family=JetBrains+Mono:wght@400;500;700&family=Rajdhani:wght@500;600&display=swap" rel="stylesheet">
<style>
  :root { --bg:#0A0804; --tile:#141018; --line:rgba(255,255,255,0.08); --ink:#f5f0e8; --dim:#8a827a; --gold:#EBB010; --green:#22C55E; --blue:#3B82F6; --cyan:#06B6D4; --purple:#A855F7; --coral:#F97316; --pink:#EC4899; --lime:#84CC16; --amber:#F59E0B; }
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:var(--bg);color:var(--ink);font-family:'Rajdhani',sans-serif;padding:32px 20px 72px;min-height:100vh;}
  .head{max-width:2200px;margin:0 auto 28px;padding-bottom:20px;border-bottom:1px solid var(--line);}
  .kicker{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:4px;color:var(--gold);text-transform:uppercase;margin-bottom:10px;}
  h1{font-family:'Teko',sans-serif;font-weight:500;font-size:60px;line-height:0.9;letter-spacing:-0.02em;text-transform:uppercase;}
  h1 em{font-style:normal;font-weight:300;color:var(--gold);display:block;}
  .sub-title{color:var(--dim);font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-top:6px;}
  .legend{max-width:2200px;margin:0 auto 32px;display:grid;grid-template-columns:repeat(9,1fr);gap:8px;padding:14px;background:rgba(255,255,255,0.02);border:1px solid var(--line);border-radius:4px;}
  .leg{font-family:'JetBrains Mono',monospace;font-size:9px;line-height:1.4;padding:6px 8px;border-radius:2px;background:rgba(255,255,255,0.02);border:1px solid var(--line);}
  .leg-badge{font-weight:700;margin-bottom:3px;letter-spacing:1px;}
  .leg-note{color:var(--dim);font-size:8.5px;letter-spacing:0.5px;}
  .leg.a .leg-badge{color:var(--dim);} .leg.b .leg-badge{color:var(--gold);}
  .leg.c .leg-badge{color:var(--green);} .leg.d .leg-badge{color:var(--cyan);}
  .leg.e .leg-badge{color:var(--purple);} .leg.f .leg-badge{color:var(--coral);}
  .leg.g .leg-badge{color:var(--pink);} .leg.h .leg-badge{color:var(--lime);}
  .leg.i .leg-badge{color:var(--amber);}

  .pair{max-width:2200px;margin:0 auto 18px;}
  .pair header{display:flex;align-items:baseline;gap:14px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--line);}
  .num{font-family:'Teko',sans-serif;font-weight:300;font-size:32px;line-height:0.9;color:var(--gold);}
  h2{font-family:'Teko',sans-serif;font-weight:600;font-size:26px;letter-spacing:1.5px;text-transform:uppercase;}
  .top-pick{margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:1px;color:var(--dim);text-transform:uppercase;}
  .top-pick b{color:var(--gold);font-weight:700;}
  .grid-9{display:grid;grid-template-columns:repeat(9,1fr);gap:1px;background:var(--line);}
  .v{background:var(--tile);padding:12px 10px 14px;display:flex;flex-direction:column;align-items:center;gap:6px;position:relative;min-height:228px;}
  .badge{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:0.5px;padding:2px 5px;border-radius:2px;border:1px solid;align-self:flex-start;}
  .badge.a{color:var(--dim);border-color:var(--line);}
  .badge.b{color:var(--gold);border-color:rgba(235,176,16,0.3);background:rgba(235,176,16,0.06);}
  .badge.c{color:var(--green);border-color:rgba(34,197,94,0.3);background:rgba(34,197,94,0.06);}
  .badge.d{color:var(--cyan);border-color:rgba(6,182,212,0.3);background:rgba(6,182,212,0.06);}
  .badge.e{color:var(--purple);border-color:rgba(168,85,247,0.3);background:rgba(168,85,247,0.06);}
  .badge.f{color:var(--coral);border-color:rgba(249,115,22,0.3);background:rgba(249,115,22,0.06);}
  .badge.g{color:var(--pink);border-color:rgba(236,72,153,0.3);background:rgba(236,72,153,0.06);}
  .badge.h{color:var(--lime);border-color:rgba(132,204,22,0.3);background:rgba(132,204,22,0.06);}
  .badge.i{color:var(--amber);border-color:rgba(245,158,11,0.3);background:rgba(245,158,11,0.06);}

  .score{position:absolute;top:8px;right:8px;font-family:'Teko',sans-serif;font-weight:700;font-size:22px;line-height:1;letter-spacing:-0.5px;}
  .score.top{color:#00ff55;text-shadow:0 0 6px rgba(0,255,85,0.4);}
  .score.high{color:#a3e635;}
  .score.mid{color:#EBB010;}
  .score.low{color:#64748B;}

  .logo{filter:drop-shadow(0 6px 10px rgba(0,0,0,0.5));display:flex;align-items:center;justify-content:center;margin:2px 0;padding:6px;border-radius:4px;}
  .vname{font-family:'Teko',sans-serif;font-size:13px;letter-spacing:0.8px;text-transform:uppercase;color:var(--ink);text-align:center;line-height:1;}
  .vtag{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:1px;color:var(--dim);text-transform:uppercase;}
</style>
</head><body>
<div class="head">
  <div class="kicker">Torch Football · Brand Ops · 9-way A→I + Scoring</div>
  <h1>Logo Variants<em>Nine options · scored</em></h1>
  <div class="sub-title">A current · B bold · C biology · D myth · E era · F moment · G wild · H research · I utility</div>
</div>

<div class="legend">${legend}</div>

${rows}
</body></html>`;

fs.writeFileSync('/Users/brock/torch-football/public/mockups/logo-variants.html', html);
console.log('wrote 9-way scored comparison');
