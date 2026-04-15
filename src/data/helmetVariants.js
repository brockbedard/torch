/**
 * TORCH — Helmet Variant Catalog (5 per team, 40 total)
 *
 * Each entry is a fully-specified renderHelmet() options object that overrides
 * the team's default shell/facemask/stripe/decal. Designed to be displayed on
 * the helmet-variants mockup page for visual review before any in-game wiring.
 *
 * Variant slots per team (loose convention):
 *   [0] PRIMARY   — flagship home-game look
 *   [1] ALT       — themed alt (autumn / sunset / midnight)
 *   [2] HOMETOWN  — throwback or hometown-pride concept (often monogram decal)
 *   [3] BLACKOUT or SPECIAL — dark mode / matte / chrome finish
 *   [4] LORE-DRIVEN — distinctive concept tied directly to mascot/motto/region
 *
 * Color overrides reference the team's primary/secondary plus extensions of
 * those palettes (washed, deepened, neutral throwbacks).
 */

export const HELMET_VARIANTS = {
  // ── BOARS · Ridgemont · Smashmouth · "Eyes Up, Hands Ready" ─────────────
  sentinels: [
    {
      name: 'THE STANDARD',
      blurb: 'Home dynasty. Dark red shell, tan center stripe, gold boar.',
      shell: '#8B0000',
      facemask: '#C4A265',
      stripe: { type: 'single', color: '#C4A265' },
      decal: { type: 'logo' },
    },
    {
      name: 'MUDDER',
      blurb: 'Late November Ozark mud game. Brown shell, distressed feel.',
      shell: '#5C4030',
      facemask: '#3E2A1E',
      stripe: { type: 'single', color: '#A88A66' },
      decal: { type: 'text', text: 'RID', color: '#EBB010', font: "'Zilla Slab', serif", weight: '700' },
      finish: 'matte',
    },
    {
      name: 'STEEL MILL',
      blurb: 'Industrial Ozark. Charcoal shell, blood red stripe, silver mask.',
      shell: '#2F2F33',
      facemask: '#A8AAB3',
      stripe: { type: 'pinstripe', color: '#8B0000', accent: '#000' },
      decal: { type: 'logo' },
    },
    {
      name: 'OZARK GOLD',
      blurb: '1940s leather throwback. Cream shell, R monogram, brown mask.',
      shell: '#E8DCC0',
      facemask: '#3E2A1E',
      stripe: { type: 'single', color: '#8B0000' },
      decal: { type: 'monogram' },
    },
    {
      name: 'WAR PAINT',
      blurb: 'Modern alt. Crimson shell with black outlined stripe + tusk text.',
      shell: '#A50000',
      facemask: '#0A0A0A',
      stripe: { type: 'outlined', color: '#A50000', accent: '#000' },
      decal: { type: 'text', text: 'BOARS', color: '#FFF', font: "'Zilla Slab', serif", weight: '700', size: 700, x: 1500, y: 1300 },
    },
  ],

  // ── SPECTRES · Hollowridge · "Strike From The Shadows" ──────────────────
  stags: [
    {
      name: 'THE PRIMARY',
      blurb: 'Sky-blue home. White single stripe, navy spectre logo.',
      shell: '#5DADE2',
      facemask: '#1B4F72',
      stripe: { type: 'single', color: '#FFFFFF' },
      decal: { type: 'logo' },
    },
    {
      name: 'MIDNIGHT',
      blurb: 'Shadow strike. Navy shell, sky-blue runway, faded ghost.',
      shell: '#0F2940',
      facemask: '#FFFFFF',
      stripe: { type: 'runway', color: '#5DADE2', accent: '#FFFFFF' },
      decal: { type: 'logo', opacity: 0.65 },
    },
    {
      name: 'CHROME GHOST',
      blurb: 'Silver-chrome shell. Pinstripe in sky blue + black.',
      shell: '#C8CCD3',
      facemask: '#1B4F72',
      stripe: { type: 'pinstripe', color: '#5DADE2', accent: '#1B4F72' },
      decal: { type: 'logo' },
      finish: 'chrome',
    },
    {
      name: 'THE CARRIERS',
      blurb: 'Hometown pride throwback. White shell, navy double, H monogram.',
      shell: '#FFFFFF',
      facemask: '#1B4F72',
      stripe: { type: 'double', color: '#1B4F72' },
      decal: { type: 'monogram' },
    },
    {
      name: 'APPARITION',
      blurb: 'No logo. Outlined stripe. Pure ghost — "are they here?"',
      shell: '#5DADE2',
      facemask: '#FFFFFF',
      stripe: { type: 'outlined', color: '#5DADE2', accent: '#1B4F72' },
      decal: { type: 'blank' },
    },
  ],

  // ── MAPLES · Vermont · "Honor The Lineage" · Prep school ────────────────
  maples: [
    {
      name: 'THE PRIMARY',
      blurb: 'Maroon shell, gold stripe, gold leaf logo. Classic Ivy.',
      shell: '#7A1E2E',
      facemask: '#D97706',
      stripe: { type: 'single', color: '#D97706' },
      decal: { type: 'logo' },
    },
    {
      name: 'AUTUMN DEEP',
      blurb: 'Burnt orange shell with maroon double stripe. Fall foliage.',
      shell: '#A24A1E',
      facemask: '#7A1E2E',
      stripe: { type: 'double', color: '#7A1E2E' },
      decal: { type: 'logo' },
    },
    {
      name: 'WHITE ASH',
      blurb: 'Birch-cream prep throwback. V monogram with maple veins.',
      shell: '#F5EEDC',
      facemask: '#D97706',
      stripe: { type: 'single', color: '#7A1E2E' },
      decal: { type: 'monogram' },
    },
    {
      name: 'FROST',
      blurb: 'Late November silver. Maroon outlined stripe, matte finish.',
      shell: '#C8C2BD',
      facemask: '#5C1620',
      stripe: { type: 'outlined', color: '#7A1E2E', accent: '#FCD34D' },
      decal: { type: 'logo' },
      finish: 'matte',
    },
    {
      name: 'TIMBER',
      blurb: 'Walnut brown leather era. Brass pinstripe, brass facemask.',
      shell: '#5C3A1E',
      facemask: '#A88A4F',
      stripe: { type: 'pinstripe', color: '#D97706', accent: '#3E2614' },
      decal: { type: 'logo' },
      finish: 'matte',
    },
  ],

  // ── SALAMANDERS · Helix · "Numbers Don't Lie" · Air Raid · Science ──────
  salamanders: [
    {
      name: 'THE PRIMARY',
      blurb: 'Green shell, pink stripe, salamander logo. Color clash.',
      shell: '#186A3B',
      facemask: '#E84393',
      stripe: { type: 'single', color: '#E84393' },
      decal: { type: 'logo' },
    },
    {
      name: 'SPECTRUM',
      blurb: 'Lab rainbow. Multi-color runway — every color at once.',
      shell: '#186A3B',
      facemask: '#F39C12',
      stripe: { type: 'runway', color: '#E84393', accent: '#F39C12' },
      decal: { type: 'logo' },
    },
    {
      name: 'MOLECULE',
      blurb: 'DNA ladder. Pink double stripe, H monogram.',
      shell: '#186A3B',
      facemask: '#E84393',
      stripe: { type: 'double', color: '#E84393' },
      decal: { type: 'monogram' },
    },
    {
      name: 'NEON',
      blurb: 'Inverse colors. Hot pink shell, lime green stripe.',
      shell: '#E84393',
      facemask: '#2ECC71',
      stripe: { type: 'single', color: '#2ECC71' },
      decal: { type: 'logo' },
    },
    {
      name: 'VENOM',
      blurb: 'Synthwave science. Black shell, glowing pink pinstripe, chrome.',
      shell: '#0A0A0A',
      facemask: '#E84393',
      stripe: { type: 'pinstripe', color: '#E84393', accent: '#2ECC71' },
      decal: { type: 'logo' },
      finish: 'chrome',
    },
  ],

  // ── DOLPHINS · Coral Bay · "Ride The Current" · Coastal ─────────────────
  wolves: [
    {
      name: 'THE PRIMARY',
      blurb: 'Magenta shell, purple stripe, dolphin logo. Home colors.',
      shell: '#D13A7A',
      facemask: '#FFCFD8',
      stripe: { type: 'single', color: '#6B1E7F' },
      decal: { type: 'logo' },
    },
    {
      name: 'DEEP REEF',
      blurb: 'Underwater. Deep purple shell, magenta runway, coral mask.',
      shell: '#3D1247',
      facemask: '#FF7EB3',
      stripe: { type: 'runway', color: '#D13A7A', accent: '#FFCFD8' },
      decal: { type: 'logo' },
    },
    {
      name: 'SUNSET BAY',
      blurb: 'Pink sunset. Outlined stripe, purple mask, dolphin.',
      shell: '#FF6FA5',
      facemask: '#6B1E7F',
      stripe: { type: 'outlined', color: '#FFFFFF', accent: '#6B1E7F' },
      decal: { type: 'logo' },
    },
    {
      name: 'CORAL WHITE',
      blurb: 'Beach throwback. Pearl white shell, CB monogram, gold mask.',
      shell: '#FFFFFF',
      facemask: '#F5C542',
      stripe: { type: 'single', color: '#D13A7A' },
      decal: { type: 'monogram' },
    },
    {
      name: 'TIDAL CHROME',
      blurb: 'Iridescent fish-scale chrome shell.',
      shell: '#D8C4D9',
      facemask: '#D13A7A',
      stripe: { type: 'pinstripe', color: '#D13A7A', accent: '#6B1E7F' },
      decal: { type: 'logo' },
      finish: 'chrome',
    },
  ],

  // ── SERPENTS · Blackwater · "Death by a Thousand Cuts" · Bayou ─────────
  serpents: [
    {
      name: 'THE PRIMARY',
      blurb: 'Dark teal shell, gold stripe, gold serpent.',
      shell: '#0F766E',
      facemask: '#5EEAD4',
      stripe: { type: 'single', color: '#F5C542' },
      decal: { type: 'logo' },
    },
    {
      name: 'BAYOU NIGHT',
      blurb: 'Pure menace. Black shell, gold stripe, teal mask.',
      shell: '#0A1F1E',
      facemask: '#14B8A6',
      stripe: { type: 'single', color: '#F5C542' },
      decal: { type: 'logo' },
    },
    {
      name: 'SCALE',
      blurb: 'Snake skin. Teal shell, gold pinstripe like scales.',
      shell: '#14B8A6',
      facemask: '#F5C542',
      stripe: { type: 'pinstripe', color: '#F5C542', accent: '#0A1F1E' },
      decal: { type: 'logo' },
    },
    {
      name: 'CYPRESS',
      blurb: 'Swamp camo. Mossy grey-green, double stripe, matte.',
      shell: '#3E4A3E',
      facemask: '#0F2E2A',
      stripe: { type: 'double', color: '#F5C542' },
      decal: { type: 'logo' },
      finish: 'matte',
    },
    {
      name: 'STRIKE',
      blurb: 'Inverse gold. Gold shell, teal stripe, B monogram.',
      shell: '#F5C542',
      facemask: '#0F766E',
      stripe: { type: 'single', color: '#0F766E' },
      decal: { type: 'monogram' },
    },
  ],

  // ── PRONGHORNS · Larkspur · "Outrun The Horizon" · Plains dynasty ──────
  pronghorns: [
    {
      name: 'THE STANDARD',
      blurb: 'Forest green shell, white stripe, gold facemask, pronghorn.',
      shell: '#166534',
      facemask: '#F59E0B',
      stripe: { type: 'single', color: '#FFFFFF' },
      decal: { type: 'logo' },
    },
    {
      name: 'HORIZON LINE',
      blurb: 'Inverse. Amber gold shell, green double stripe.',
      shell: '#F59E0B',
      facemask: '#166534',
      stripe: { type: 'double', color: '#166534' },
      decal: { type: 'logo' },
    },
    {
      name: 'DUSK',
      blurb: 'Modern blackout. Near-black green shell, gold pinstripe.',
      shell: '#0A1F11',
      facemask: '#F59E0B',
      stripe: { type: 'pinstripe', color: '#F59E0B', accent: '#FCD34D' },
      decal: { type: 'logo' },
    },
    {
      name: 'DYNASTY GOLD',
      blurb: 'Solid gold monochrome. Notre Dame heritage homage.',
      shell: '#D4A02E',
      facemask: '#166534',
      stripe: { type: 'none' },
      decal: { type: 'logo' },
      finish: 'chrome',
    },
    {
      name: 'THE HUNT',
      blurb: 'Vintage farming roots. Cream shell, hunter green stripe, L mono.',
      shell: '#E8DCC0',
      facemask: '#5C3A1E',
      stripe: { type: 'single', color: '#0F4D26' },
      decal: { type: 'monogram' },
    },
  ],

  // ── RACCOONS · Sacramento Polytechnic · "What's Yours Is Ours" · Tech ──
  raccoons: [
    {
      name: 'THE PRIMARY',
      blurb: 'Charcoal shell, orange stripe, raccoon logo.',
      shell: '#27272A',
      facemask: '#D4D4D8',
      stripe: { type: 'single', color: '#FF8C00' },
      decal: { type: 'logo' },
    },
    {
      name: 'STREETLIGHT',
      blurb: 'Night raid. Black shell, orange + lime runway.',
      shell: '#0A0A0F',
      facemask: '#84CC16',
      stripe: { type: 'runway', color: '#FF8C00', accent: '#84CC16' },
      decal: { type: 'logo' },
    },
    {
      name: 'NEON BANDIT',
      blurb: 'Tech alt. Black shell, electric orange double, chrome finish.',
      shell: '#0A0A0F',
      facemask: '#FF8C00',
      stripe: { type: 'double', color: '#FF8C00' },
      decal: { type: 'logo' },
      finish: 'chrome',
    },
    {
      name: 'MASKED',
      blurb: 'Eye-mask metaphor. Charcoal shell, BLACK facemask, SAC text.',
      shell: '#3F3F46',
      facemask: '#000000',
      stripe: { type: 'single', color: '#FF8C00' },
      decal: { type: 'text', text: 'SAC', color: '#FF8C00', font: "'Major Mono Display', monospace", weight: '400' },
    },
    {
      name: 'CHROME',
      blurb: 'West coast mirror finish. Lime raccoon decal, charcoal mask.',
      shell: '#A8AAB3',
      facemask: '#27272A',
      stripe: { type: 'single', color: '#FF8C00' },
      decal: { type: 'logo' },
      finish: 'chrome',
    },
  ],
};

/** Get all variants for a given team. */
export function getHelmetVariants(teamId) {
  return HELMET_VARIANTS[teamId] || [];
}

/** Get a single variant by team + index. */
export function getHelmetVariant(teamId, idx) {
  var v = HELMET_VARIANTS[teamId];
  return v ? (v[idx] || null) : null;
}
