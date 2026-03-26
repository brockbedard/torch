/**
 * TORCH — Play Animation Builder (Phase 2)
 * Concept-based animation system from TORCH-7v7-FOOTBALL-RESEARCH.md.
 *
 * Route CONCEPTS (not isolated routes) drive the animation:
 * - Each concept assigns routes to ALL 3 skill players (primary + complements)
 * - Defense responds based on scheme (man/zone/blitz/press)
 * - OL movement varies by play type (pass set, zone step, power pull, screen release, draw fake)
 * - Run plays have distinct OL/RB paths per concept
 *
 * Sections referenced: §5 Route Concepts, §6 Run Plays, §9 OL/DL Movement
 */

// ── EASING ──
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeInOutCubic(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }
function easeOutBack(t) { var c = 1.4; return 1 + (c+1)*Math.pow(t-1,3) + c*Math.pow(t-1,2); }
function lerp(a, b, t) { return a + (b - a) * t; }
function kf(time, x, y) { return { time: time, x: x, y: y }; }

// ── ROUTE SHAPES ──
// Building blocks. Each returns keyframes given params (p):
//   sx, sy (start canvas px), fw (field width), ypx (pixels/yard),
//   throwT, catchT, tackleT, dur (ms timing),
//   catchY, settleY (canvas px for catch/settle point)
//   side: -1 (left) or 1 (right) for directional routes

var SHAPES = {
  // Verticals
  go: function(p) {
    return [kf(0,p.sx,p.sy), kf(200,p.sx,p.sy+4*p.ypx), kf(p.throwT,p.sx,p.catchY), kf(p.catchT,p.sx,p.catchY), kf(p.tackleT,p.sx,p.settleY), kf(p.dur,p.sx,p.settleY)];
  },
  post: function(p) {
    var breakX = lerp(p.sx, 0.50*p.fw, 0.6);
    return [kf(0,p.sx,p.sy), kf(200,p.sx,p.sy+3*p.ypx), kf(p.throwT*0.7,p.sx,p.sy+8*p.ypx), kf(p.throwT,breakX,p.catchY), kf(p.catchT,breakX,p.catchY), kf(p.tackleT,breakX,p.settleY), kf(p.dur,breakX,p.settleY)];
  },
  corner: function(p) {
    var side = p.side || (p.sx < 0.5*p.fw ? -1 : 1);
    var breakX = p.sx + side * 0.12 * p.fw;
    return [kf(0,p.sx,p.sy), kf(200,p.sx,p.sy+3*p.ypx), kf(p.throwT*0.7,p.sx,p.sy+7*p.ypx), kf(p.throwT,breakX,p.catchY), kf(p.catchT,breakX,p.catchY), kf(p.tackleT,breakX,p.settleY), kf(p.dur,breakX,p.settleY)];
  },
  seam: function(p) {
    // Vertical up the hash — between corner and post
    return [kf(0,p.sx,p.sy), kf(200,p.sx,p.sy+3*p.ypx), kf(p.throwT,p.sx,p.catchY), kf(p.catchT,p.sx,p.catchY), kf(p.tackleT,p.sx,p.settleY), kf(p.dur,p.sx,p.settleY)];
  },
  // Medium
  slant: function(p) {
    var breakX = lerp(p.sx, 0.50*p.fw, 0.5);
    return [kf(0,p.sx,p.sy), kf(150,p.sx,p.sy+2*p.ypx), kf(p.throwT,breakX,p.catchY), kf(p.catchT,breakX,p.catchY), kf(p.tackleT,breakX,p.settleY), kf(p.dur,breakX,p.settleY)];
  },
  dig: function(p) {
    // In-cut at 8-10 yards
    var breakX = lerp(p.sx, 0.50*p.fw, 0.5);
    return [kf(0,p.sx,p.sy), kf(200,p.sx,p.sy+4*p.ypx), kf(p.throwT*0.7,p.sx,p.sy+8*p.ypx), kf(p.throwT,breakX,p.catchY), kf(p.catchT,breakX,p.catchY), kf(p.tackleT,breakX,p.settleY), kf(p.dur,breakX,p.settleY)];
  },
  curl: function(p) {
    var deepY = p.catchY + 2*p.ypx;
    return [kf(0,p.sx,p.sy), kf(250,p.sx,deepY), kf(p.throwT,p.sx,p.catchY-1*p.ypx), kf(p.catchT,p.sx,p.catchY), kf(p.tackleT,p.sx,p.settleY), kf(p.dur,p.sx,p.settleY)];
  },
  out_route: function(p) {
    var side = p.side || (p.sx < 0.50*p.fw ? -1 : 1);
    var breakX = p.sx + side * 0.12 * p.fw;
    return [kf(0,p.sx,p.sy), kf(200,p.sx,p.sy+4*p.ypx), kf(p.throwT,breakX,p.catchY), kf(p.catchT,breakX,p.catchY), kf(p.tackleT,breakX,p.settleY), kf(p.dur,breakX,p.settleY)];
  },
  // Quick
  hitch: function(p) {
    return [kf(0,p.sx,p.sy), kf(150,p.sx,p.sy+4*p.ypx), kf(p.throwT,p.sx,p.sy+3*p.ypx), kf(p.catchT,p.sx,p.catchY), kf(p.tackleT,p.sx,p.settleY), kf(p.dur,p.sx,p.settleY)];
  },
  arrow: function(p) {
    // Flat route — angled out toward sideline
    var side = p.side || (p.sx < 0.50*p.fw ? -1 : 1);
    var flatX = p.sx + side * 0.15 * p.fw;
    return [kf(0,p.sx,p.sy), kf(200,flatX,p.sy+2*p.ypx), kf(p.catchT,flatX,p.catchY), kf(p.tackleT,flatX,p.settleY), kf(p.dur,flatX,p.settleY)];
  },
  shallow_cross: function(p) {
    // Cross the field at 5-6 yards
    var crossX = lerp(p.sx, 1.0 - p.sx/p.fw * p.fw, 0.6);
    crossX = p.sx < 0.5*p.fw ? p.sx + 0.35*p.fw : p.sx - 0.35*p.fw;
    return [kf(0,p.sx,p.sy), kf(200,p.sx,p.sy+3*p.ypx), kf(p.throwT,crossX,p.catchY), kf(p.catchT,crossX,p.catchY), kf(p.tackleT,crossX,p.settleY), kf(p.dur,crossX,p.settleY)];
  },
  wheel: function(p) {
    // Out of backfield — arc out then vertical
    var side = p.side || (p.sx < 0.50*p.fw ? -1 : 1);
    var arcX = p.sx + side * 0.18 * p.fw;
    return [kf(0,p.sx,p.sy), kf(200,p.sx,p.sy+1*p.ypx), kf(400,arcX,p.sy+3*p.ypx), kf(p.throwT,arcX,p.catchY), kf(p.catchT,arcX,p.catchY), kf(p.tackleT,arcX,p.settleY), kf(p.dur,arcX,p.settleY)];
  },
  flat: function(p) {
    var side = p.side || (p.sx < 0.50*p.fw ? -1 : 1);
    var flatX = p.sx + side * 0.15 * p.fw;
    return [kf(0,p.sx,p.sy), kf(150,flatX,p.sy), kf(p.catchT,flatX,p.catchY), kf(p.tackleT,flatX,p.settleY), kf(p.dur,flatX,p.settleY)];
  },
  screen_release: function(p) {
    // Catch behind/at LOS, then burst forward behind blockers
    var side = p.side || (p.sx < 0.50*p.fw ? -1 : 1);
    var screenX = p.sx + side * 0.08 * p.fw;
    var losY = p.sy;
    return [kf(0,p.sx,p.sy), kf(150,screenX,losY-1*p.ypx), kf(p.catchT-200,screenX,losY), kf(p.catchT,screenX,losY+1*p.ypx), kf(p.tackleT,screenX,p.settleY), kf(p.dur,screenX,p.settleY)];
  },
  // Run paths
  inside_zone: function(p) {
    // RB presses LG/C hip, reads DT block, cuts back or continues
    var gapX = 0.50 * p.fw;
    return [kf(0,p.sx,p.sy), kf(150,gapX,p.sy+1*p.ypx), kf(300,gapX,p.sy+3*p.ypx), kf(500,gapX,p.catchY), kf(p.tackleT,gapX,p.settleY), kf(p.dur,gapX,p.settleY)];
  },
  power_run: function(p) {
    // RB follows pulling guard through B-gap
    var side = p.side || 1;
    var gapX = 0.50*p.fw + side * 0.06*p.fw;
    return [kf(0,p.sx,p.sy), kf(150,p.sx,p.sy+1*p.ypx), kf(300,gapX,p.sy+2*p.ypx), kf(500,gapX,p.catchY), kf(p.tackleT,gapX,p.settleY), kf(p.dur,gapX,p.settleY)];
  },
  toss_sweep: function(p) {
    // RB catches toss, bounces outside
    var side = p.side || (p.sx < 0.50*p.fw ? -1 : 1);
    var edgeX = p.sx + side * 0.18 * p.fw;
    return [kf(0,p.sx,p.sy), kf(100,p.sx+side*0.05*p.fw,p.sy), kf(250,edgeX,p.sy+1*p.ypx), kf(500,edgeX,p.catchY), kf(p.tackleT,edgeX,p.settleY), kf(p.dur,edgeX,p.settleY)];
  },
  draw_run: function(p) {
    // RB delays then takes handoff — fake pass, real run
    var gapX = 0.50 * p.fw;
    return [kf(0,p.sx,p.sy), kf(300,p.sx,p.sy), kf(450,gapX,p.sy+2*p.ypx), kf(650,gapX,p.catchY), kf(p.tackleT,gapX,p.settleY), kf(p.dur,gapX,p.settleY)];
  },
  qb_draw: function(p) {
    // QB tucks and runs — for empty formations
    return [kf(0,p.sx,p.sy), kf(200,p.sx,p.sy-1*p.ypx), kf(400,p.sx,p.sy+2*p.ypx), kf(600,p.sx,p.catchY), kf(p.tackleT,p.sx,p.settleY), kf(p.dur,p.sx,p.settleY)];
  },
  // Stationary / blocking
  stay: function(p) {
    return [kf(0,p.sx,p.sy), kf(p.dur,p.sx,p.sy)];
  },
  block_release: function(p) {
    // Chip block then release to flat (for RB or TE)
    var side = p.side || (p.sx < 0.50*p.fw ? -1 : 1);
    var flatX = p.sx + side * 0.12 * p.fw;
    return [kf(0,p.sx,p.sy), kf(200,p.sx,p.sy+1*p.ypx), kf(400,flatX,p.sy+2*p.ypx), kf(p.catchT,flatX,p.catchY), kf(p.tackleT,flatX,p.settleY), kf(p.dur,flatX,p.settleY)];
  },
};

// ── PASS CONCEPTS (Section 5) ──
// Each concept assigns routes to 3 skill indices [0, 1, 2] relative to the formation's skill array.
// Returns { primary: idx, routes: [shape_key, shape_key, shape_key] }

var PASS_CONCEPTS = {
  // Quick Game
  slant_arrow: {  // §5: WR1 slant, WR2 arrow. High-low on flat defender.
    primary: 0, routes: ['slant', 'arrow', 'hitch'],
    beats: 'man, Cover 3',
  },
  hitch_concept: {  // §5: Both WRs 5-yard hitch. Sit in zone windows.
    primary: 0, routes: ['hitch', 'hitch', 'arrow'],
    beats: 'Cover 2, Cover 4, soft zone',
  },
  quick_out: {  // §5: WR speed out. Quick to sideline.
    primary: 0, routes: ['out_route', 'slant', 'flat'],
    beats: 'off-man, Cover 3',
  },
  // Intermediate
  smash: {  // §5: WR hitch + TE/Slot corner. Classic Cover 2 beater.
    primary: 1, routes: ['hitch', 'corner', 'flat'],
    beats: 'Cover 2',
  },
  flood: {  // §5: 3 levels — flat, out, vertical on same side.
    primary: 1, routes: ['go', 'out_route', 'flat'],
    beats: 'Cover 3 zone',
  },
  mesh: {  // §5: Two receivers cross at 5-6 yards. Natural picks vs man.
    primary: 0, routes: ['shallow_cross', 'shallow_cross', 'hitch'],
    beats: 'man coverage',
  },
  smash_seam: {  // §5: WR hitch + Slot seam up the hash.
    primary: 1, routes: ['hitch', 'seam', 'arrow'],
    beats: 'Cover 2',
  },
  dagger: {  // §5: Seam + dig. Seam holds deep middle, dig sits underneath.
    primary: 1, routes: ['seam', 'dig', 'flat'],
    beats: 'Cover 3, Cover 1',
  },
  drive: {  // §5: Shallow cross + cross at 12. Deep cross picks off shallow defender.
    primary: 0, routes: ['shallow_cross', 'dig', 'hitch'],
    beats: 'man coverage',
  },
  // Deep Shots
  comeback_vertical: {  // §5: WR comeback + Slot vertical seam.
    primary: 1, routes: ['curl', 'seam', 'arrow'],
    beats: 'Cover 1 (man-free)',
  },
  post_corner: {  // §5: WR1 post + WR2 corner. Post holds S, corner goes behind.
    primary: 0, routes: ['post', 'corner', 'flat'],
    beats: 'Cover 2, Cover 3',
  },
  verticals: {  // §5: All 3 receivers vertical. One seam always open vs Cover 3.
    primary: 0, routes: ['go', 'seam', 'go'],
    beats: 'Cover 3',
  },
  post_wheel: {  // §5: Slot post + RB wheel out of backfield.
    primary: 1, routes: ['go', 'post', 'wheel'],
    beats: 'man, Cover 1',
  },
};

// ── RUN CONCEPTS (Section 6) ──
var RUN_CONCEPTS = {
  inside_zone: {  // OL: all step playside in unison. RB reads DT.
    carrier: 'inside_zone', olAction: 'zone',
    complement: ['hitch', 'hitch'],  // WRs block/decoy
  },
  power: {  // OL: LG pulls, C/RG drive block. RB follows puller.
    carrier: 'power_run', olAction: 'power',
    complement: ['hitch', 'stay'],
  },
  draw: {  // OL: pass set initially, then fire out. RB delays.
    carrier: 'draw_run', olAction: 'draw',
    complement: ['go', 'slant'],  // WRs run real routes to sell play-action
  },
  toss: {  // OL: C/RG block down, LG pulls. RB bounces outside.
    carrier: 'toss_sweep', olAction: 'power',
    complement: ['hitch', 'stay'],
  },
  zone_read: {  // QB reads DE — give or keep.
    carrier: 'inside_zone', olAction: 'zone',
    complement: ['hitch', 'arrow'],
  },
  qb_draw: {  // QB tucks — for empty sets with no RB.
    carrier: 'qb_draw', olAction: 'draw',
    complement: ['go', 'slant'],
  },
};

// Play type → concept pools
var PLAY_TYPE_CONCEPTS = {
  DEEP:   ['post_corner', 'verticals', 'comeback_vertical', 'post_wheel'],
  SHORT:  ['slant_arrow', 'smash', 'dagger', 'drive', 'smash_seam'],
  QUICK:  ['slant_arrow', 'hitch_concept', 'quick_out', 'mesh'],
  SCREEN: ['flood', 'smash', 'quick_out'],
  RUN:    ['inside_zone', 'power', 'draw', 'toss', 'zone_read'],
};

// ── TEAM CONCEPT WEIGHTS (TORCH-TEAM-SCHEME-IDENTITY.md) ──
// Bias which concepts each team favors. Higher = more likely selected.
var TEAM_CONCEPT_WEIGHTS = {
  // Boars — Power Spread: power runs, play-action, PA deep shots
  sentinels: {
    power: 4, inside_zone: 3, toss: 2, draw: 2, zone_read: 1,
    smash: 2, dagger: 2, post_corner: 3, comeback_vertical: 2,
    slant_arrow: 1, mesh: 1, hitch_concept: 1, flood: 1, verticals: 1,
  },
  // Dolphins — Spread Option: zone read, QB draw, mesh/crosses, speed
  wolves: {
    zone_read: 4, inside_zone: 3, draw: 2, toss: 2, power: 1,
    mesh: 3, slant_arrow: 2, drive: 2, flood: 2,
    verticals: 2, post_corner: 1, comeback_vertical: 1,
  },
  // Stags — Air Raid: quick game, mesh, deep shots, screens
  stags: {
    slant_arrow: 4, mesh: 4, hitch_concept: 3, quick_out: 3,
    verticals: 3, post_corner: 3, smash_seam: 2, dagger: 2, flood: 2,
    inside_zone: 1, draw: 1, zone_read: 1, power: 0.5, toss: 0.5,
  },
  // Serpents — Multiple: balanced, play-action, misdirection, all concepts
  serpents: {
    smash: 2, dagger: 2, flood: 2, mesh: 2, drive: 2,
    post_corner: 2, comeback_vertical: 2, post_wheel: 2,
    power: 2, draw: 2, inside_zone: 2, zone_read: 2, toss: 2,
    slant_arrow: 2, hitch_concept: 2,
  },
};

// Pick a weighted concept from the pool for a team
function pickConcept(pool, teamId) {
  var weights = TEAM_CONCEPT_WEIGHTS[teamId];
  if (!weights) return pool[Math.floor(Math.random() * pool.length)];
  var w = pool.map(function(c) { return weights[c] || 1; });
  var total = w.reduce(function(a, b) { return a + b; }, 0);
  var r = Math.random() * total;
  for (var i = 0; i < pool.length; i++) {
    r -= w[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

// ── TEAM ANIMATION STYLES (TORCH-TEAM-SCHEME-IDENTITY.md §"What They Look Like") ──
// Modifiers that change how the animation feels per team.
var TEAM_ANIM_STYLE = {
  // Boars: PHYSICAL. OL fires forward aggressively. RB hits hard.
  sentinels: {
    olScale: 1.4,        // OL movement multiplied (bigger fire-out)
    throwTMod: 1.0,      // Normal throw timing
    preSnapMotion: false, // No pre-snap motion
    qbZoneRead: false,    // No zone-read QB motion
  },
  // Dolphins: FAST. QB in motion on zone reads. Quick snaps.
  wolves: {
    olScale: 1.0,
    throwTMod: 0.85,     // Slightly faster overall tempo
    preSnapMotion: false,
    qbZoneRead: true,    // QB has give/keep read motion
  },
  // Stags: SHARP. Quick release. Wide spacing. Precise.
  stags: {
    olScale: 0.9,        // Less OL movement (pass-first)
    throwTMod: 0.75,     // Ball comes out FAST — Air Raid quick game
    preSnapMotion: false,
    qbZoneRead: false,
  },
  // Serpents: UNPREDICTABLE. Pre-snap motion shifts. Formation disguise.
  serpents: {
    olScale: 1.0,
    throwTMod: 0.95,
    preSnapMotion: true,  // WR motions across pre-snap
    qbZoneRead: false,
  },
};

// ── DEFENSE RESPONSE ──
var DEF_MODES = {
  man_trail: function(wrKF, sep, lagMs) {
    var side = wrKF[0].x < wrKF[wrKF.length-1].x ? 1 : -1;
    return wrKF.map(function(k) {
      return kf(k.time + lagMs, k.x + sep * side * 0.3, k.y - sep * 0.7);
    });
  },
  man_press: function(wrKF, sep, lagMs) {
    var kfs = DEF_MODES.man_trail(wrKF, sep * 0.5, lagMs * 0.6);
    if (kfs.length > 0) { kfs[0].x = wrKF[0].x + 3; kfs[0].y = wrKF[0].y + 2; }
    return kfs;
  },
  zone_spot: function(wrKF, sep, lagMs, zoneX, zoneY, throwT) {
    var start = wrKF[0];
    return [kf(0,start.x,start.y), kf(200,zoneX,start.y+2), kf(throwT,zoneX,zoneY), kf(throwT+lagMs,wrKF[wrKF.length-2].x+sep*0.5,wrKF[wrKF.length-2].y), kf(wrKF[wrKF.length-1].time+lagMs,wrKF[wrKF.length-1].x+sep*0.3,wrKF[wrKF.length-1].y)];
  },
  blitz: function(wrKF, sep, lagMs, qbX, qbY) {
    var start = wrKF[0];
    return [kf(0,start.x,start.y), kf(50,start.x,start.y-3), kf(400,lerp(start.x,qbX,0.8),lerp(start.y,qbY,0.8)), kf(800,qbX,qbY), kf(1500,qbX,qbY)];
  },
  spy: function(wrKF, sep, lagMs, qbKF) {
    return qbKF.map(function(k) { return kf(k.time + 100, k.x, wrKF[0].y); });
  },
  zone_robber: function(wrKF, sep, lagMs, zoneX, zoneY, throwT) {
    var start = wrKF[0];
    var target = wrKF[Math.min(3, wrKF.length-1)];
    return [kf(0,start.x,start.y), kf(300,zoneX,zoneY), kf(throwT,zoneX,zoneY), kf(throwT+100,target.x,target.y), kf(wrKF[wrKF.length-1].time,target.x,target.y)];
  },
};

var SCHEME_TO_MODE = {
  ZONE: 'zone_spot',
  BLITZ: 'blitz',
  PRESSURE: 'man_press',
  HYBRID: 'zone_robber',
};

// ── ROLE ASSIGNMENT ──
function assignRoles(formation) {
  var off = formation.offense;
  var def = formation.defense;
  var roles = { qbIdx: -1, skillIdxs: [], rbIdx: -1, olIdxs: [] };

  for (var i = 0; i < off.length; i++) {
    if (off[i].pos === 'QB') roles.qbIdx = i;
    else if (off[i].pos === 'OL') roles.olIdxs.push(i);
    else if (off[i].pos === 'RB' || off[i].pos === 'FB') { roles.rbIdx = i; roles.skillIdxs.push(i); }
    else roles.skillIdxs.push(i);  // WR, SLOT, TE
  }

  // Defense roles
  var defOff = off.length;
  roles.dlIdxs = []; roles.cbIdxs = []; roles.lbIdxs = []; roles.sIdxs = [];
  for (var j = 0; j < def.length; j++) {
    var di = defOff + j;
    if (def[j].pos === 'DL') roles.dlIdxs.push(di);
    else if (def[j].pos === 'CB') roles.cbIdxs.push(di);
    else if (def[j].pos === 'LB') roles.lbIdxs.push(di);
    else if (def[j].pos === 'S') roles.sIdxs.push(di);
  }

  return roles;
}

// ── OL MOVEMENT BY PLAY TYPE (Section 9) ──
function composeOL(dotKF, roles, starts, isRun, playType, dur, fieldW, olScale) {
  var s = olScale || 1;
  for (var i = 0; i < roles.olIdxs.length; i++) {
    var oi = roles.olIdxs[i];
    var os = starts[oi];
    var spread = (os.x - 0.50 * fieldW) * 0.03;

    if (playType === 'SCREEN') {
      // Screen: initial pass set, then release downfield to lead-block
      dotKF[oi] = [kf(0,os.x,os.y), kf(200,os.x,os.y-8*s), kf(500,os.x+spread,os.y+15*s), kf(dur,os.x+spread,os.y+25*s)];
    } else if (!isRun) {
      // Pass block: kick-step backward, mirror DL laterally
      dotKF[oi] = [kf(0,os.x,os.y), kf(200,os.x+spread*0.5,os.y-8*s), kf(dur,os.x+spread,os.y-6*s)];
    }
  }
}

function composeRunOL(dotKF, roles, starts, olAction, dur, fieldW, olScale) {
  var s = olScale || 1;
  for (var i = 0; i < roles.olIdxs.length; i++) {
    var oi = roles.olIdxs[i];
    var os = starts[oi];

    if (olAction === 'zone') {
      // Zone: all step playside in unison — dots flow laterally as a unit
      var lateralShift = 0.02 * fieldW;
      dotKF[oi] = [kf(0,os.x,os.y), kf(200,os.x+lateralShift,os.y+10*s), kf(400,os.x+lateralShift,os.y+16*s), kf(dur,os.x+lateralShift,os.y+14*s)];
    } else if (olAction === 'power') {
      if (i === 0) {
        // LG pulls across — loops behind the others
        var pullTarget = starts[roles.olIdxs[2]].x + 0.04 * fieldW;
        dotKF[oi] = [kf(0,os.x,os.y), kf(100,os.x,os.y-6*s), kf(300,pullTarget,os.y-3*s), kf(500,pullTarget,os.y+14*s), kf(dur,pullTarget,os.y+12*s)];
      } else {
        // C/RG drive block — Boars olScale 1.4 makes this look PHYSICAL
        dotKF[oi] = [kf(0,os.x,os.y), kf(200,os.x,os.y+12*s), kf(400,os.x,os.y+18*s), kf(dur,os.x,os.y+16*s)];
      }
    } else if (olAction === 'draw') {
      // Draw: pass set initially, then fire out
      dotKF[oi] = [kf(0,os.x,os.y), kf(250,os.x,os.y-8), kf(450,os.x,os.y+10*s), kf(dur,os.x,os.y+16*s)];
    }
  }
}

// ── MAIN BUILDER ──

/**
 * Build a complete play animation from game state.
 * @param {string} resultType - 'complete','run','sack','interception','incomplete','touchdown'
 * @param {number} yardsGained
 * @param {object} formation - { offense: [...], defense: [...] }
 * @param {string} playType - 'DEEP','SHORT','QUICK','SCREEN','RUN'
 * @param {string} defScheme - 'ZONE','BLITZ','PRESSURE','HYBRID'
 * @param {number} fieldW - canvas width
 * @param {number} ypx - pixels per yard
 * @param {number} losYard - line of scrimmage yard
 * @param {number} topYard - top visible yard
 * @param {string} [offTeam] - offensive team ID for scheme-specific animation style
 */
export function buildPlayAnimation(resultType, yardsGained, formation, playType, defScheme, fieldW, ypx, losYard, topYard, offTeam) {
  var form = formation;
  var allDots = form.offense.concat(form.defense);
  var numOff = form.offense.length;

  // Team animation style modifiers
  var style = (offTeam && TEAM_ANIM_STYLE[offTeam]) || { olScale: 1, throwTMod: 1, preSnapMotion: false, qbZoneRead: false };

  function toC(p) { return { x: p.x * fieldW, y: (losYard + p.y - topYard) * ypx }; }
  var starts = allDots.map(toC);

  // Default: everyone stays put
  var dotKF = allDots.map(function(_, i) {
    return [kf(0, starts[i].x, starts[i].y), kf(2000, starts[i].x, starts[i].y)];
  });

  var roles = assignRoles(form);
  var seq = { dotKeyframes: dotKF, ball: null, events: [] };

  // ── TIMING (modified by team style) ──
  var isTD = resultType === 'touchdown';
  var isRun = resultType === 'run' || (playType === 'RUN' && resultType !== 'sack' && resultType !== 'interception' && resultType !== 'incomplete');
  // Base timing scaled ~3x for realistic pace (3-5s per play)
  var tMod = style.throwTMod;  // Stags: 0.75 (quick release), Wolves: 0.85 (tempo)
  var throwT = Math.round((isRun ? 500 : 1200) * tMod);
  var catchT = Math.round((isRun ? 1200 : 2100) * tMod);
  var tackleT = isTD ? 3200 : (isRun ? 2800 : Math.round(3500 * tMod));
  var dur = isTD || resultType === 'interception' ? 4500 : isRun ? 3800 : resultType === 'sack' ? 3000 : Math.round(4000 * tMod);

  // Catch/settle positions (downfield = +Y in portrait)
  var catchY = (losYard + yardsGained * 0.6 - topYard) * ypx;
  var settleY = (losYard + yardsGained - topYard) * ypx;

  // ── PICK A CONCEPT (weighted by team identity) ──
  var conceptPool = PLAY_TYPE_CONCEPTS[playType] || PLAY_TYPE_CONCEPTS['SHORT'];
  var conceptKey = pickConcept(conceptPool, offTeam);
  var isRunConcept = !!RUN_CONCEPTS[conceptKey];
  var concept = isRunConcept ? RUN_CONCEPTS[conceptKey] : PASS_CONCEPTS[conceptKey];
  if (!concept) concept = PASS_CONCEPTS['slant_arrow'];

  // ── COMPOSE OL (scaled by team style) ──
  if (isRun && isRunConcept) {
    composeRunOL(dotKF, roles, starts, concept.olAction, dur, fieldW, style.olScale);
  } else {
    composeOL(dotKF, roles, starts, isRun, playType, dur, fieldW, style.olScale);
  }

  // ── COMPOSE QB ──
  if (roles.qbIdx >= 0) {
    var qs = starts[roles.qbIdx];
    if (resultType === 'sack') {
      var sackY = (losYard - Math.abs(yardsGained) - topYard) * ypx;
      dotKF[roles.qbIdx] = [kf(0,qs.x,qs.y), kf(200,qs.x,qs.y-16), kf(500,qs.x+10,qs.y-22), kf(800,qs.x+8,sackY), kf(dur,qs.x+8,sackY)];
      seq.events.push({ time: 800, type: 'sack', x: qs.x+8, y: sackY });
    } else if (isRun && isRunConcept && conceptKey !== 'qb_draw') {
      var carrierIdx = roles.rbIdx >= 0 ? roles.rbIdx : roles.qbIdx;
      var cs = starts[carrierIdx];
      if (style.qbZoneRead && (conceptKey === 'zone_read' || conceptKey === 'inside_zone')) {
        // Dolphins zone-read: QB rides the mesh, then keeps or gives
        // QB runs parallel with RB for a beat, creating the read moment
        var keepSide = qs.x > 0.5*fieldW ? 1 : -1;
        var meshX = lerp(qs.x, cs.x, 0.4);
        var keepX = qs.x + keepSide * 0.12 * fieldW;
        dotKF[roles.qbIdx] = [kf(0,qs.x,qs.y), kf(120,meshX,qs.y+2), kf(250,meshX,qs.y+4), kf(400,keepX,qs.y), kf(dur,keepX,qs.y-8)];
        seq.events.push({ time: 250, type: 'handoff', x: meshX, y: qs.y+4 });
      } else {
        // Standard handoff: converge with carrier then drift away
        dotKF[roles.qbIdx] = [kf(0,qs.x,qs.y), kf(150,lerp(qs.x,cs.x,0.3),qs.y+3), kf(300,qs.x+12,qs.y-8), kf(dur,qs.x+15,qs.y-12)];
        seq.events.push({ time: 150, type: 'handoff', x: lerp(qs.x,cs.x,0.5), y: qs.y+3 });
      }
    } else if (isRun && conceptKey === 'qb_draw') {
      // QB IS the runner — handled below in skill section
      dotKF[roles.qbIdx] = SHAPES.qb_draw({
        sx: qs.x, sy: qs.y, catchY: catchY, settleY: settleY,
        fw: fieldW, ypx: ypx, throwT: throwT, catchT: catchT, tackleT: tackleT, dur: dur
      });
      seq.events.push({ time: 400, type: 'handoff', x: qs.x, y: qs.y+2*ypx });
      seq.events.push({ time: tackleT, type: isTD ? 'touchdown' : 'tackle', x: qs.x, y: settleY });
    } else {
      // Pass: dropback, set, throw
      dotKF[roles.qbIdx] = [kf(0,qs.x,qs.y), kf(200,qs.x,qs.y-18), kf(throwT,qs.x,qs.y-12), kf(dur,qs.x,qs.y-12)];
      seq.events.push({ time: throwT, type: 'throw', x: qs.x, y: qs.y-12 });
    }
  }

  // ── COMPOSE SKILL PLAYERS ──
  var skillSlots = roles.skillIdxs;  // indices into offense array (which are also allDots indices)

  if (isRun && isRunConcept && conceptKey !== 'qb_draw') {
    // RUN PLAY: carrier runs the run shape, others run complements
    var carrierIdx2 = roles.rbIdx >= 0 ? roles.rbIdx : (skillSlots.length > 0 ? skillSlots[0] : -1);
    if (carrierIdx2 >= 0 && resultType !== 'sack') {
      var cs2 = starts[carrierIdx2];
      var runShape = SHAPES[concept.carrier] || SHAPES.inside_zone;
      dotKF[carrierIdx2] = runShape({
        sx: cs2.x, sy: cs2.y, catchY: catchY, settleY: settleY, side: cs2.x < 0.5*fieldW ? -1 : 1,
        fw: fieldW, ypx: ypx, throwT: throwT, catchT: catchT, tackleT: tackleT, dur: dur
      });
      seq.events.push({ time: tackleT, type: isTD ? 'touchdown' : 'tackle', x: dotKF[carrierIdx2][dotKF[carrierIdx2].length-2].x, y: settleY });
    }
    // Complement routes for non-carrier skill players (block/decoy)
    var compIdx = 0;
    for (var si = 0; si < skillSlots.length; si++) {
      var sidx = skillSlots[si];
      if (sidx === carrierIdx2) continue;
      var compRoute = concept.complement[compIdx] || 'stay';
      compIdx++;
      var ss = starts[sidx];
      var compShape = SHAPES[compRoute] || SHAPES.stay;
      var compCatchY = (losYard + 6 - topYard) * ypx;
      dotKF[sidx] = compShape({
        sx: ss.x, sy: ss.y, catchY: compCatchY, settleY: compCatchY, side: ss.x < 0.5*fieldW ? -1 : 1,
        fw: fieldW, ypx: ypx, throwT: throwT, catchT: dur, tackleT: dur, dur: dur
      });
    }
  } else if (conceptKey !== 'qb_draw' && resultType !== 'sack') {
    // PASS PLAY: concept assigns routes to skill slots
    var primarySlotIdx = Math.min(concept.primary || 0, skillSlots.length - 1);
    var primaryIdx = skillSlots[primarySlotIdx];
    if (primaryIdx === undefined) primaryIdx = skillSlots[0];

    // Build route params for each skill player
    for (var pi = 0; pi < skillSlots.length; pi++) {
      var pidx = skillSlots[pi];
      var ps = starts[pidx];
      var routeKey = concept.routes[pi] || 'hitch';
      var shape = SHAPES[routeKey] || SHAPES.hitch;
      var isPrimary = (pidx === primaryIdx);

      var rp = {
        sx: ps.x, sy: ps.y,
        catchY: isPrimary ? catchY : (losYard + 6 - topYard) * ypx,
        settleY: isPrimary ? settleY : (losYard + 6 - topYard) * ypx,
        side: ps.x < 0.5*fieldW ? -1 : 1,
        fw: fieldW, ypx: ypx,
        throwT: throwT,
        catchT: isPrimary ? catchT : dur,
        tackleT: isPrimary ? tackleT : dur,
        dur: dur
      };

      if (resultType === 'incomplete' && isPrimary) {
        var missY = (losYard + 10 - topYard) * ypx;
        rp.catchY = missY; rp.settleY = missY;
        dotKF[pidx] = shape(rp);
        var qbPos = roles.qbIdx >= 0 ? starts[roles.qbIdx] : ps;
        seq.ball = { startTime: throwT, endTime: catchT,
          p0: { x: qbPos.x, y: qbPos.y - 12 },
          p1: { x: (qbPos.x + ps.x) / 2, y: (qbPos.y - 12 + missY) / 2 - 15 },
          p2: { x: ps.x + 10, y: missY + 10 } };
        seq.events.push({ time: catchT + 50, type: 'incomplete', x: ps.x + 10, y: missY + 10 });
      } else if (resultType === 'interception' && isPrimary) {
        var intY = (losYard + 8 - topYard) * ypx;
        rp.catchY = intY; rp.settleY = intY;
        dotKF[pidx] = shape(rp);
        var qbPos2 = roles.qbIdx >= 0 ? starts[roles.qbIdx] : ps;
        var cbForInt = roles.cbIdxs.length > 0 ? starts[roles.cbIdxs[0]] : ps;
        seq.ball = { startTime: throwT, endTime: catchT,
          p0: { x: qbPos2.x, y: qbPos2.y - 12 },
          p1: { x: (qbPos2.x + ps.x) / 2, y: (qbPos2.y - 12 + intY) / 2 },
          p2: { x: cbForInt.x, y: intY } };
        seq.events.push({ time: catchT, type: 'interception', x: cbForInt.x, y: intY });
      } else {
        dotKF[pidx] = shape(rp);
        if (isPrimary && resultType !== 'sack') {
          // Ball flight + catch/tackle events for primary
          var qbPos3 = roles.qbIdx >= 0 ? starts[roles.qbIdx] : ps;
          var lastKF = dotKF[pidx][Math.min(3, dotKF[pidx].length - 1)];
          seq.ball = { startTime: throwT, endTime: catchT,
            p0: { x: qbPos3.x, y: qbPos3.y - 12 },
            p1: { x: (qbPos3.x + lastKF.x) / 2, y: (qbPos3.y - 12 + catchY) / 2 - 15 },
            p2: { x: lastKF.x, y: catchY } };
          seq.events.push({ time: catchT, type: 'catch', x: lastKF.x, y: catchY });
          seq.events.push({ time: tackleT, type: isTD ? 'touchdown' : 'tackle',
            x: dotKF[pidx][dotKF[pidx].length - 2].x, y: settleY });
        }
      }
    }
  }

  // ── SERPENTS PRE-SNAP MOTION (TORCH-TEAM-SCHEME-IDENTITY.md) ──
  // A WR motions across the formation before the snap, then snaps into route.
  // This shifts the first keyframe timing for one skill player.
  if (style.preSnapMotion && skillSlots.length >= 2 && resultType !== 'sack') {
    var motionIdx = skillSlots[skillSlots.length - 1];  // last skill player motions
    var mkf = dotKF[motionIdx];
    if (mkf && mkf.length > 1) {
      var motionStart = starts[motionIdx];
      // Motion across 20% of field width over 200ms, then start route from new position
      var motionDir = motionStart.x < 0.5 * fieldW ? 1 : -1;
      var motionDist = motionDir * 0.15 * fieldW;
      // Prepend motion keyframes, shift all existing keyframes later by 200ms
      var shifted = mkf.map(function(k) { return kf(k.time + 200, k.x + motionDist * 0.3, k.y); });
      shifted.unshift(kf(0, motionStart.x, motionStart.y));
      shifted.splice(1, 0, kf(180, motionStart.x + motionDist, motionStart.y));
      dotKF[motionIdx] = shifted;
    }
  }

  // ── COMPOSE DL (Section 9: DL Movement) ──
  for (var dli = 0; dli < roles.dlIdxs.length; dli++) {
    var di = roles.dlIdxs[dli];
    var dls = starts[di];
    if (resultType === 'sack' && dli === 0) {
      // One DE breaks through
      var qbTarget = roles.qbIdx >= 0 ? starts[roles.qbIdx] : { x: 0.50*fieldW, y: (losYard-5-topYard)*ypx };
      var sackPt = seq.events.find(function(e) { return e.type === 'sack'; });
      dotKF[di] = [kf(0,dls.x,dls.y), kf(150,dls.x,dls.y-6), kf(350,dls.x+4,dls.y-16), kf(600,qbTarget.x+5,qbTarget.y-10), kf(800,sackPt?sackPt.x:dls.x,sackPt?sackPt.y:dls.y), kf(dur,sackPt?sackPt.x:dls.x,sackPt?sackPt.y:dls.y)];
    } else if (isRun) {
      // Run defense: hold gaps, push against OL — dots hold position or get pushed
      var pushDir = dls.x < 0.5*fieldW ? -1 : 1;
      dotKF[di] = [kf(0,dls.x,dls.y), kf(200,dls.x+pushDir*3,dls.y-4), kf(500,dls.x+pushDir*5,dls.y-2), kf(dur,dls.x+pushDir*4,dls.y)];
    } else {
      // Pass rush: DEs attack edges, DT bull-rushes center
      var rushTarget = roles.qbIdx >= 0 ? starts[roles.qbIdx] : { x: 0.50*fieldW, y: (losYard-4-topYard)*ypx };
      dotKF[di] = [kf(0,dls.x,dls.y), kf(300,lerp(dls.x,rushTarget.x,0.3),dls.y-10), kf(dur,lerp(dls.x,rushTarget.x,0.2),dls.y-6)];
    }
  }

  // ── COMPOSE COVERAGE (CB, LB, S) ──
  var defMode = SCHEME_TO_MODE[defScheme] || 'man_trail';
  // Find the primary receiver's keyframes for coverage to track
  var primaryRecKF = null;
  if (!isRun && skillSlots.length > 0) {
    var primConcIdx = Math.min((concept && concept.primary) || 0, skillSlots.length - 1);
    primaryRecKF = dotKF[skillSlots[primConcIdx]];
  }

  // CBs cover WRs
  for (var cbi = 0; cbi < roles.cbIdxs.length; cbi++) {
    var ci = roles.cbIdxs[cbi];
    var cbs = starts[ci];
    // Find the nearest offensive skill player to cover
    var coveredKF = primaryRecKF;
    if (cbi < skillSlots.length) {
      coveredKF = dotKF[skillSlots[cbi]] || primaryRecKF;
    }
    if (!coveredKF) continue;

    var separation = Math.max(5, Math.min(25, yardsGained * 1.2));

    if (resultType === 'interception' && cbi === 0) {
      var intPt = seq.events.find(function(e) { return e.type === 'interception'; });
      dotKF[ci] = [kf(0,cbs.x,cbs.y), kf(300,cbs.x,cbs.y+8), kf(600,intPt?intPt.x-5:cbs.x,intPt?(intPt.y-5):cbs.y), kf(catchT,intPt?intPt.x:cbs.x,intPt?intPt.y:cbs.y), kf(900,intPt?intPt.x:cbs.x,intPt?intPt.y:cbs.y), kf(1400,intPt?intPt.x-10:cbs.x,(intPt?intPt.y:cbs.y)-25), kf(dur,(intPt?intPt.x-10:cbs.x),(intPt?intPt.y:cbs.y)-25)];
    } else if (defMode === 'blitz') {
      var qbTgt = roles.qbIdx >= 0 ? starts[roles.qbIdx] : cbs;
      dotKF[ci] = DEF_MODES.blitz(coveredKF, separation, 100, qbTgt.x, qbTgt.y - 12);
    } else if (defMode === 'man_press') {
      dotKF[ci] = DEF_MODES.man_press(coveredKF, separation, 100);
    } else if (defMode === 'zone_spot' || defMode === 'zone_robber') {
      var zoneX = cbs.x;
      var zoneY = cbs.y + 3 * ypx;
      dotKF[ci] = DEF_MODES[defMode](coveredKF, separation, 120, zoneX, zoneY, throwT);
    } else {
      dotKF[ci] = DEF_MODES.man_trail(coveredKF, separation, 120);
    }
  }

  // LBs: read pause, then react to run or pass
  for (var lbi = 0; lbi < roles.lbIdxs.length; lbi++) {
    var li = roles.lbIdxs[lbi];
    var lbs = starts[li];
    var lbTarget = isRun ? settleY : catchY;
    dotKF[li] = [kf(0,lbs.x,lbs.y), kf(200,lbs.x,lbs.y), kf(500,lbs.x,lbs.y+4), kf(tackleT,lerp(lbs.x,0.50*fieldW,0.3),lbTarget-8), kf(dur,lerp(lbs.x,0.50*fieldW,0.3),lbTarget-8)];
  }

  // Safeties: deep, barely move on short plays, break hard on deep
  for (var si2 = 0; si2 < roles.sIdxs.length; si2++) {
    var ssi = roles.sIdxs[si2];
    var ss = starts[ssi];
    var safetyMove = yardsGained > 12 ? 0.6 : 0.2;
    dotKF[ssi] = [kf(0,ss.x,ss.y), kf(400,ss.x,ss.y+safetyMove*3*ypx), kf(tackleT,lerp(ss.x,0.50*fieldW,safetyMove*0.3),lerp(ss.y,settleY,safetyMove*0.5)), kf(dur,lerp(ss.x,0.50*fieldW,safetyMove*0.3),lerp(ss.y,settleY,safetyMove*0.5))];
  }

  // ── METADATA ──
  seq.dotColors = allDots.map(function(_, i) { return i < numOff ? 'off' : 'def'; });
  seq.dotNums = allDots.map(function(p) { return p.num; });
  seq.duration = dur;

  return seq;
}
