/**
 * TORCH — Yard Line Alignment Math Verification
 * Compares Canvas renderer math vs DOM indicator math from gameplay.js
 *
 * Run: node --input-type=module < src/tests/yardAlignmentTest.js
 */

const STRIP_HEIGHT = 136; // .T-strip { height: 136px }
const VISIBLE_YARDS = 25;
const YPX = STRIP_HEIGHT / VISIBLE_YARDS; // pixels per yard

const TEST_POSITIONS = [25, 40, 50, 60, 72, 75, 83, 90];
const DISTANCE = 10; // first down distance

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// Convert ballPosition (0-100 game units) to absolute yard (5-115 yard range)
function ballPositionToYard(bp) {
  return bp * 1.1 + 5;
}

// Describe field position in football terms
function describePosition(bp) {
  if (bp === 50) return 'MIDFIELD';
  if (bp < 50) return `OWN ${bp}`;
  return `OPP ${100 - bp}`;
}

console.log('='.repeat(80));
console.log('TORCH Football — Yard Line Alignment Math Verification');
console.log('='.repeat(80));
console.log(`Strip height: ${STRIP_HEIGHT}px | Visible yards: ${VISIBLE_YARDS} | YPX: ${YPX.toFixed(2)}`);
console.log('');

let allMatch = true;

for (const bp of TEST_POSITIONS) {
  console.log('-'.repeat(80));
  console.log(`Ball Position: ${bp} (${describePosition(bp)})`);
  console.log('-'.repeat(80));

  // ── A. Canvas math (fieldRenderer.js) ──
  const canvas_ballYard = ballPositionToYard(bp);
  const canvas_center = clamp(canvas_ballYard, VISIBLE_YARDS / 2, 120 - VISIBLE_YARDS / 2);
  const canvas_topYard = canvas_center - VISIBLE_YARDS / 2;
  const canvas_losPixel = (canvas_ballYard - canvas_topYard) * YPX;
  const canvas_losPct = (canvas_losPixel / STRIP_HEIGHT) * 100;

  // ── B. DOM indicator math (gameplay.js) ──
  const dom_byrd = bp * 1.1 + 5;
  const dom_visYards = 25;
  const dom_cntr = Math.max(dom_visYards / 2, Math.min(120 - dom_visYards / 2, dom_byrd));
  const dom_topYard = dom_cntr - dom_visYards / 2;
  const dom_losPct = ((dom_byrd - dom_topYard) / dom_visYards) * 100;
  const dom_losPixel = (dom_losPct / 100) * STRIP_HEIGHT;

  // Check match
  const losMatch = Math.abs(canvas_losPct - dom_losPct) < 0.001;
  if (!losMatch) allMatch = false;

  console.log('  [Canvas renderer math]');
  console.log(`    ballYard     = ${canvas_ballYard.toFixed(2)}`);
  console.log(`    center       = clamp(${canvas_ballYard.toFixed(2)}, ${VISIBLE_YARDS/2}, ${120 - VISIBLE_YARDS/2}) = ${canvas_center.toFixed(2)}`);
  console.log(`    topYard      = ${canvas_center.toFixed(2)} - ${VISIBLE_YARDS/2} = ${canvas_topYard.toFixed(2)}`);
  console.log(`    LOS pixel    = (${canvas_ballYard.toFixed(2)} - ${canvas_topYard.toFixed(2)}) * ${YPX.toFixed(2)} = ${canvas_losPixel.toFixed(2)}px`);
  console.log(`    LOS %        = ${canvas_losPct.toFixed(2)}%`);
  console.log('');
  console.log('  [DOM indicator math]');
  console.log(`    _byrd        = ${dom_byrd.toFixed(2)}`);
  console.log(`    _cntr        = ${dom_cntr.toFixed(2)}`);
  console.log(`    _topYard     = ${dom_topYard.toFixed(2)}`);
  console.log(`    _losPct      = ((${dom_byrd.toFixed(2)} - ${dom_topYard.toFixed(2)}) / ${dom_visYards}) * 100 = ${dom_losPct.toFixed(2)}%`);
  console.log(`    LOS pixel    = ${dom_losPixel.toFixed(2)}px`);
  console.log('');
  console.log(`  LOS MATCH: ${losMatch ? 'YES' : '*** NO ***'}  (canvas=${canvas_losPct.toFixed(4)}%, dom=${dom_losPct.toFixed(4)}%)`);

  // ── First Down Line ──
  console.log('');
  console.log('  [First Down Line (offense advancing, distance=10)]');

  // Canvas
  const canvas_fdYard = canvas_ballYard + DISTANCE;
  const canvas_fdPixel = (canvas_fdYard - canvas_topYard) * YPX;
  const canvas_fdPct = (canvas_fdPixel / STRIP_HEIGHT) * 100;

  // DOM
  const dom_fdYard = dom_byrd + DISTANCE;
  const dom_fdPct = ((dom_fdYard - dom_topYard) / dom_visYards) * 100;
  const dom_fdPixel = (dom_fdPct / 100) * STRIP_HEIGHT;

  const fdMatch = Math.abs(canvas_fdPct - dom_fdPct) < 0.001;
  if (!fdMatch) allMatch = false;

  console.log(`    Canvas: fdYard=${canvas_fdYard.toFixed(2)}, pixel=${canvas_fdPixel.toFixed(2)}px, pct=${canvas_fdPct.toFixed(2)}%`);
  console.log(`    DOM:    fdYard=${dom_fdYard.toFixed(2)}, pixel=${dom_fdPixel.toFixed(2)}px, pct=${dom_fdPct.toFixed(2)}%`);
  console.log(`    FD MATCH: ${fdMatch ? 'YES' : '*** NO ***'}`);

  // Separation between LOS and FD
  const separationPx = Math.abs(canvas_fdPixel - canvas_losPixel);
  const separationPct = Math.abs(canvas_fdPct - canvas_losPct);
  console.log(`    LOS-to-FD separation: ${separationPx.toFixed(2)}px (${separationPct.toFixed(2)}%)`);

  // ── Edge case: is ball near clamp boundaries? ──
  if (canvas_ballYard <= VISIBLE_YARDS / 2 || canvas_ballYard >= 120 - VISIBLE_YARDS / 2) {
    console.log(`    ** CLAMP ACTIVE: ballYard=${canvas_ballYard.toFixed(2)} is near boundary, center was clamped to ${canvas_center.toFixed(2)}`);
  }

  console.log('');
}

// ── Task 3: Visible yard lines for ballPosition=72 (OPP 28) ──
console.log('='.repeat(80));
console.log('VISIBLE YARD LINES — ballPosition=72 (OPP 28)');
console.log('='.repeat(80));

const bp72 = 72;
const by72 = ballPositionToYard(bp72);
const center72 = clamp(by72, VISIBLE_YARDS / 2, 120 - VISIBLE_YARDS / 2);
const top72 = center72 - VISIBLE_YARDS / 2;
const bottom72 = top72 + VISIBLE_YARDS;

console.log(`  ballYard  = ${by72.toFixed(2)}`);
console.log(`  center    = ${center72.toFixed(2)}`);
console.log(`  topYard   = ${top72.toFixed(2)}  (top of visible window)`);
console.log(`  bottomYard= ${bottom72.toFixed(2)} (bottom of visible window)`);
console.log('');

// Canvas draws yard numbers at multiples of 10 (field yards: 10,20,30,40,50,40,30,20,10)
// Absolute field yards: 10=own10, 20=own20, ... 50=midfield, 60=opp40, 70=opp30, 80=opp20, 90=opp10
// The yard NUMBERS displayed: yard 10→"10", 20→"20", 30→"30", 40→"40", 50→"50", 60→"40", 70→"30", 80→"20", 90→"10", 100→"G", 110→endzone
console.log('  Visible yard lines (absolute → display number → pixel position):');

for (let absYard = 0; absYard <= 120; absYard += 5) {
  if (absYard >= top72 && absYard <= bottom72) {
    const pixelY = (absYard - top72) * YPX;
    const pctY = (pixelY / STRIP_HEIGHT) * 100;

    let displayNum = '';
    if (absYard % 10 === 0 && absYard >= 10 && absYard <= 110) {
      // Convert absolute yard to display number
      const fieldYard = absYard; // 10-110
      if (fieldYard <= 50) {
        displayNum = `  [NUMBER: ${fieldYard}]`;
      } else if (fieldYard < 110) {
        displayNum = `  [NUMBER: ${120 - fieldYard}]`;
      } else {
        displayNum = `  [GOAL LINE]`;
      }
    } else if (absYard % 5 === 0) {
      displayNum = '  [5-yard hash]';
    }

    console.log(`    absYard=${absYard.toString().padStart(3)} → pixel=${pixelY.toFixed(1).padStart(6)}px (${pctY.toFixed(1).padStart(5)}%)${displayNum}`);
  }
}

console.log('');
console.log(`  LOS at absYard=${by72.toFixed(2)} → pixel=${((by72 - top72) * YPX).toFixed(1)}px (${(((by72 - top72) / VISIBLE_YARDS) * 100).toFixed(1)}%)`);

// ── Summary ──
console.log('');
console.log('='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log(`  All LOS math matches:        ${allMatch ? 'YES' : 'NO'}`);
console.log('');
console.log('  Key observations:');
console.log(`  - YPX (pixels per yard) = ${YPX.toFixed(2)}px`);
console.log(`  - 10-yard distance = ${(10 * YPX).toFixed(2)}px = ${((10 / VISIBLE_YARDS) * 100).toFixed(2)}% of strip`);
console.log(`  - Clamp range: ballYard must be in [${VISIBLE_YARDS/2}, ${120 - VISIBLE_YARDS/2}] for centered view`);
console.log(`  - Below ${VISIBLE_YARDS/2} or above ${120 - VISIBLE_YARDS/2}: ball is off-center (clamped)`);
console.log('');

// ── Potential CSS alignment issues ──
console.log('  [Potential CSS alignment issues to check in browser]');
console.log('  - DOM uses style.top as % of .T-strip container (136px)');
console.log('  - Canvas uses (absYard - topYard) * YPX where YPX = 136/25 = 5.44');
console.log('  - If .T-strip has padding/border, DOM % would be off by that amount');
console.log('  - The DOM LOS line uses calc(_losPct% - 1px) — subtracts 1px for line centering');
console.log('  - The DOM _ballYardLabel uses transform:translateY(-100%) to sit above the LOS');
console.log('  - Canvas draws LOS at exact pixel; DOM positions via CSS %');
console.log('  - If both use identical math, any visible mismatch is CSS container sizing');
console.log('');

if (allMatch) {
  console.log('RESULT: All math matches perfectly between Canvas and DOM.');
  console.log('If there is a visible misalignment, the issue is in CSS positioning');
  console.log('(container padding, border, transform origin, etc.), not in the math.');
} else {
  console.log('RESULT: *** MATH MISMATCH DETECTED *** — see details above.');
}
