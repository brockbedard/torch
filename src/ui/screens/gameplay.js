/**
 * TORCH — Gameplay Screen v3
 * Complete rewrite. Portrait bottom-stack.
 * Fresh visual language — no reuse from prior versions.
 */

import { SND } from '../../engine/sound.js';
import { GS, setGs, getTeam, getOtherTeam, fmtClock } from '../../state.js';
import { badgeSvg, BADGE_LABELS } from '../../data/badges.js';
import { GameState } from '../../engine/gameState.js';
import { CT_OFFENSE, CT_DEFENSE, IR_OFFENSE, IR_DEFENSE } from '../../data/players.js';
import { CT_OFF_PLAYS } from '../../data/ctOffensePlays.js';
import { CT_DEF_PLAYS } from '../../data/ctDefensePlays.js';
import { IR_OFF_PLAYS } from '../../data/irOffensePlays.js';
import { IR_DEF_PLAYS } from '../../data/irDefensePlays.js';
import { checkOffensiveBadgeCombo, checkDefensiveBadgeCombo } from '../../engine/badgeCombos.js';
import { getPlayHistoryBonus } from '../../engine/playHistory.js';
import { playSvg } from '../../data/playDiagrams.js';
import { TORCH_CARDS } from '../../data/torchCards.js';

/* ═══════════════════════════════════════════
   CSS
   ═══════════════════════════════════════════ */
const CSS = `
/* root */
.T{height:100vh;display:flex;flex-direction:column;background:#06050f;overflow:hidden;position:relative;font-family:'Barlow Condensed',sans-serif}

/* scoreboard */
.T-sb{background:#0a0916;border-bottom:1px solid #1a183a;flex-shrink:0;z-index:60;overflow:hidden}
/* score row: 3 columns — left team, center half/clock, right team */
.T-sb-row{display:flex;align-items:center;padding:6px 10px 4px}
.T-sb-side{flex:1;display:flex;flex-direction:column;align-items:center;position:relative;padding:2px 4px;border-radius:6px}
.T-sb-side-glow{background:radial-gradient(ellipse,rgba(255,204,0,.18) 0%,transparent 70%)}
.T-sb-name{font-family:'Bebas Neue';font-size:13px;font-style:italic;line-height:1;letter-spacing:1px;white-space:nowrap}
.T-sb-pts{font-family:'Press Start 2P';font-size:22px;color:#e8e6ff;line-height:1;margin-top:1px}
.T-sb-pts-glow{text-shadow:0 0 12px rgba(255,204,0,.5)}
.T-sb-pos{position:absolute;bottom:-10px;font-family:'Press Start 2P';font-size:5px;color:#c8a030;letter-spacing:.5px;display:flex;flex-direction:column;align-items:center;line-height:1}
.T-sb-pos-arrow{font-size:10px;line-height:1}
.T-sb-center{width:90px;text-align:center;padding:0 6px;border-left:1px solid rgba(255,255,255,.06);border-right:1px solid rgba(255,255,255,.06)}
.T-sb-half{font-family:'Bebas Neue';font-size:13px;color:#c8a030;letter-spacing:2px;line-height:1}
.T-sb-snap{margin-top:3px;display:flex;gap:1px;justify-content:center}
.T-sb-dot{width:4px;height:4px;border-radius:50%;background:#222;transition:background .2s}
.T-sb-dot-on{background:#c8a030;box-shadow:0 0 3px #c8a030}
.T-sb-clock{font-family:'Press Start 2P';font-size:14px;color:#e03050;text-shadow:0 0 8px rgba(224,48,80,.4);line-height:1;margin-top:2px}
/* situation bar: down & distance | ball | TORCH pts */
.T-sb-sit{display:flex;align-items:center;padding:4px 10px;background:rgba(0,0,0,.4);border-top:1px solid rgba(255,255,255,.04);gap:8px}
.T-sb-sit-down{font-family:'Press Start 2P';font-size:8px;color:#30c0e0;letter-spacing:.5px}
.T-sb-sit-div{width:1px;height:10px;background:rgba(255,255,255,.08);flex-shrink:0}
.T-sb-sit-ball{font-family:'Press Start 2P';font-size:8px;color:#e8e6ff;opacity:.6;letter-spacing:.5px}
.T-sb-sit-torch{margin-left:auto;font-family:'Press Start 2P';font-size:7px;color:#c8a030;letter-spacing:.5px}

/* field strip */
.T-strip{flex:0 0 28%;position:relative;background:linear-gradient(180deg,#072a07 0%,#0a3a0a 40%,#072a07 100%);overflow:hidden;border-bottom:1px solid #1a183a}
.T-yard{position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,.06)}
.T-los{position:absolute;top:0;bottom:0;width:2px;z-index:5;transition:left .4s ease-out}
.T-ltg{position:absolute;top:0;bottom:0;width:1px;opacity:.5;z-index:4;transition:left .4s ease-out;border-left:2px dashed}
.T-marker{position:absolute;top:4px;font-family:'Press Start 2P';font-size:5px;z-index:6;transition:left .4s ease-out;transform:translateX(-50%);letter-spacing:.5px}
.T-zone{position:absolute;top:0;bottom:0;width:6%}
.T-zone-l{left:0;background:linear-gradient(90deg,rgba(255,60,60,.12),transparent)}
.T-zone-r{right:0;background:linear-gradient(270deg,rgba(60,100,255,.12),transparent)}
.T-hash{position:absolute;left:0;right:0;height:1px;background:rgba(255,255,255,.03)}

/* bottom panel */
.T-panel{flex:1;display:flex;flex-direction:column;overflow:hidden;transition:background .5s}
.T-panel-off{background:linear-gradient(180deg,#120e00 0%,#06050f 50%)}
.T-panel-def{background:linear-gradient(180deg,#00080e 0%,#06050f 50%)}

/* instruction */
.T-inst{text-align:center;padding:8px 0 2px;font-family:'Press Start 2P';font-size:6px;letter-spacing:1px;flex-shrink:0;text-transform:uppercase}

/* player cards (draft-style adapted for gameplay) */
.T-prow{display:flex;gap:6px;padding:4px 8px;flex-shrink:0;overflow-x:auto}
.T-p{flex:1;min-width:0;border-radius:6px;cursor:pointer;background:var(--bg-surface);overflow:hidden;position:relative;transition:all .12s}
.T-p:active{transform:scale(.97)}
.T-p-sel{box-shadow:0 0 18px rgba(0,255,136,.35),inset 0 0 12px rgba(0,255,136,.08)}
.T-p-sel .T-p-selbar{display:block}
.T-p-hurt{opacity:.25;pointer-events:none}
.T-p-selbar{display:none;position:absolute;top:0;left:50%;transform:translateX(-50%);width:30px;height:3px;background:#00ff88;border-radius:0 0 3px 3px;z-index:3}
.T-p-hdr{display:flex;justify-content:space-between;align-items:flex-start;padding:6px 8px 0;position:relative;z-index:2}
.T-p-sel .T-p-hdr{background:linear-gradient(180deg,rgba(0,255,136,.1),transparent)}
.T-p-left{display:flex;flex-direction:column;gap:1px}
.T-p-pos{font-family:'Courier New';font-size:11px;font-weight:700;color:#e03050;letter-spacing:1px;line-height:1}
.T-p-name{font-family:'Bebas Neue';font-size:16px;color:#fff;line-height:1}
.T-p-ovr{font-family:'Courier New';font-size:24px;font-weight:700;line-height:1}
.T-p-ovrlbl{font-family:'Courier New';font-size:7px;font-weight:700;opacity:.7;letter-spacing:.5px}
.T-p-art{height:80px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.T-p-art img{height:100%;width:100%;object-fit:contain;filter:drop-shadow(0 2px 6px rgba(0,0,0,.7))}
.T-p-art-fade{position:absolute;bottom:0;left:0;right:0;height:40%;background:linear-gradient(transparent,#0f0d1a);pointer-events:none;z-index:1}
.T-p-nick{font-family:'Courier New';font-size:8px;color:#fff;font-weight:700;text-align:center;opacity:.7;padding:0 4px 4px;letter-spacing:.5px}
.T-p-badge{position:absolute;bottom:4px;left:5px;width:14px;height:14px;z-index:4}

/* play cards (draft-style with diagram, adapted for gameplay) */
.T-plays{flex:1;overflow-y:auto;padding:2px 8px 4px;display:grid;grid-template-columns:1fr 1fr;gap:5px}
.T-plays-hidden{display:none}
.T-pl{border-radius:6px;cursor:pointer;background:var(--bg-surface);overflow:hidden;position:relative;display:flex;flex-direction:column;transition:all .12s}
.T-pl:active{transform:scale(.97)}
.T-pl-sel{box-shadow:0 0 18px rgba(0,255,136,.35),inset 0 0 12px rgba(0,255,136,.08)}
.T-pl-sel .T-pl-selbar{display:block}
.T-pl-selbar{display:none;position:absolute;top:0;left:50%;transform:translateX(-50%);width:30px;height:3px;background:#00ff88;border-radius:0 0 3px 3px;z-index:3}
.T-pl-hdr{display:flex;justify-content:space-between;align-items:center;padding:6px 8px 4px}
.T-pl-sel .T-pl-hdr{background:linear-gradient(180deg,rgba(0,255,136,.1),transparent)}
.T-pl-name{font-family:'Bebas Neue';font-size:14px;color:#fff;line-height:1;flex:1;margin-right:4px}
.T-pl-tag{font-family:'Courier New';font-size:6px;font-weight:700;padding:2px 5px;border-radius:8px;border:1px solid;letter-spacing:.5px;white-space:nowrap;flex-shrink:0}
.T-pl-diag{height:55px;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse,#1a1030,#0a0818);margin:0 6px;border-radius:3px;overflow:hidden}
.T-pl-foot{padding:3px 8px 5px;display:flex;align-items:center;justify-content:space-between}
.T-pl-desc{font-family:'Courier New';font-size:7px;color:#554f80;flex:1}
.T-mq{width:6px;height:6px;border-radius:50%;flex-shrink:0}

/* snap bar (hidden until ready) */
.T-snap{padding:6px 10px 8px;flex-shrink:0;display:flex;flex-direction:column;gap:5px}
.T-snap-hidden{display:none}
.T-combo{display:flex;align-items:center;gap:6px;padding:6px 10px;background:#0a0916;border:1px solid #1a183a;border-radius:8px;font-size:13px}
.T-combo-lbl{font-family:'Bebas Neue';color:#c8a030}
.T-combo-sig{font-family:'Courier New';font-size:6px;font-weight:700;padding:2px 5px;border-radius:4px;margin-left:auto}
.T-go{width:100%;padding:12px;font-family:'Bebas Neue';font-size:26px;letter-spacing:5px;color:#06050f;border:none;border-radius:8px;cursor:pointer;background:linear-gradient(180deg,#f0c020,#c8a010);box-shadow:0 4px 20px rgba(200,160,16,.25)}
.T-go:active{transform:scale(.97);box-shadow:none}
@keyframes T-pulse{0%,100%{box-shadow:0 4px 20px rgba(200,160,16,.25)}50%{box-shadow:0 4px 30px rgba(200,160,16,.5)}}
.T-go{animation:T-pulse 1.8s ease-in-out infinite}

/* 2min buttons */
.T-2btns{display:flex;gap:5px}
.T-2btn{flex:1;padding:8px;font-family:'Press Start 2P';font-size:6px;border-radius:6px;cursor:pointer;text-align:center;background:none;letter-spacing:.5px}
.T-spike{color:#30c0e0;border:1.5px solid #30c0e0}
.T-kneel{color:#554f80;border:1.5px solid #554f80}

/* narrative */
.T-narr{padding:6px 14px;background:#0a0916;border-top:1px solid #1a183a;flex-shrink:0;min-height:38px}
.T-narr-1{font-size:13px;color:#e8e6ff;font-weight:600;line-height:1.2}
.T-narr-2{font-family:'Courier New';font-size:8px;color:#554f80;margin-top:1px}

/* overlays */
.T-ov{position:absolute;inset:0;z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px;pointer-events:none}
.T-ov-dark{background:rgba(6,5,15,.92)}
.T-ov-black{background:#06050f;pointer-events:auto}
@keyframes T-fade{from{opacity:0}to{opacity:1}}
@keyframes T-pop{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
.T-ov-result .T-r-play{font-family:'Courier New';font-size:9px;color:#554f80;letter-spacing:1px;margin-bottom:6px}
.T-ov-result .T-r-big{font-family:'Bebas Neue';font-size:44px;letter-spacing:3px;line-height:1;animation:T-pop .3s ease-out}
.T-ov-result .T-r-sub{font-family:'Courier New';font-size:9px;color:#8a86b0;margin-top:10px;max-width:300px;line-height:1.5}

/* possession cut */
.T-ov-poss .T-poss-score{font-family:'Press Start 2P';font-size:22px;color:#e8e6ff}
.T-ov-poss .T-poss-who{font-family:'Bebas Neue';font-size:22px;letter-spacing:3px;margin:10px 0}
.T-ov-poss .T-poss-tag{font-family:'Courier New';font-size:9px;color:#554f80;font-style:italic}

/* conversion */
.T-conv{display:flex;flex-direction:column;align-items:center;gap:10px;padding:16px}
.T-conv-hdr{font-family:'Bebas Neue';font-size:36px;color:#3df58a;letter-spacing:3px}
.T-conv-btn{width:100%;max-width:260px;padding:14px;font-family:'Press Start 2P';font-size:7px;border-radius:8px;cursor:pointer;text-align:center;background:none;letter-spacing:.5px;line-height:1.6}

/* drive summary */
.T-drv{padding:10px 14px;text-align:center}
.T-drv-hdr{font-family:'Press Start 2P';font-size:7px;letter-spacing:1px;margin-bottom:4px}
.T-drv-stat{font-family:'Courier New';font-size:9px;color:#554f80}

/* 2-min transformation */
.T-urgent .T-strip{border-bottom-color:#e03050}
.T-urgent .T-sb{border-bottom-color:#e03050}
@keyframes T-breathe{0%,100%{background-color:#06050f}50%{background-color:#0f0510}}
.T-urgent .T-panel{animation:T-breathe 3s ease-in-out infinite}
@keyframes T-coin{0%{transform:rotateY(0)}100%{transform:rotateY(1080deg)}}
`;

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
function mqColor(q) { return q === 'green' ? '#3df58a' : q === 'red' ? '#e03050' : '#c8a030'; }
function typeColor(t) {
  return { SHORT:'#3df58a',QUICK:'#30c0e0',DEEP:'#e03050',RUN:'#e07020',SCREEN:'#e060a0',
    OPTION:'#e07020',BLITZ:'#e03050',ZONE:'#30c0a0',PRESSURE:'#c8a030',HYBRID:'#9060e0' }[t] || '#8a86b0';
}

function matchupQ(player, play, history, isOff) {
  if (!player || !play) return null;
  if (isOff) {
    const c = checkOffensiveBadgeCombo(player.badge, play, false, false);
    const h = getPlayHistoryBonus(history, play);
    if (c.yardBonus > 0) return 'green';
    if (h < -2) return 'red';
    return h < 0 ? 'yellow' : 'yellow';
  }
  const c = checkDefensiveBadgeCombo(player.badge, play, { playType:'RUN', id:'power' });
  return c.yardMod < 0 ? 'green' : 'yellow';
}

function breakdown(op, dp, r, fo, fd) {
  const cov = (dp.baseCoverage || '').replace(/_/g,' ').toUpperCase();
  const L = [];
  if (r.isSack) L.push(dp.sackRateBonus >= .06 ? dp.name+' brought the heat.' : 'Protection collapsed vs '+cov+'.');
  else if (r.isInterception) L.push(cov+' read the route. Picked.');
  else if (r.isIncomplete) L.push(dp.passCompMod < -.03 ? dp.name+' jammed the timing.' : 'Tight window. Couldn\'t connect.');
  else if (r.isTouchdown) L.push('Exploited '+cov+'. End zone.');
  else if (r.yards >= 10) { const cv = op.coverageMods?.[dp.baseCoverage]; L.push(cv && cv.mean >= 2 ? op.name+' eats '+cov+'.' : fo.name+' made it happen.'); }
  else if (r.yards <= 0) L.push(dp.name+' walled it off.');
  if (r.offComboPts > 0) L.push(BADGE_LABELS[fo.badge]+' combo! +'+r.offComboYards+' yds.');
  if (r.defComboPts > 0) L.push('Def combo: '+BADGE_LABELS[fd.badge]+'.');
  if (r.historyBonus > 0) L.push('Play mix bonus +'+r.historyBonus+'.');
  if (r.historyBonus < -2) L.push('Predictable. Penalty.');
  return L.length ? L.join(' ') : op.name+' vs '+dp.name+'.';
}

const TAGS = {
  touchdown:['SIX POINTS.','FIND THE HOUSE.','TOUCHDOWN.'],
  turnover_td:['PICK SIX.','SCOOP AND SCORE.','HOUSE CALL.'],
  interception:['PICKED OFF.','TURNOVER.','BALL DON\'T LIE.'],
  fumble_lost:['STRIPPED.','LOOSE BALL.','TURNOVER.'],
  turnover_on_downs:['STOPPED.','FOURTH DOWN FAILURE.','CHANGE OF POSSESSION.'],
  safety:['SAFETY.','CAUGHT IN THE END ZONE.'],
  score:['NEW DRIVE.','BALL AT THE 50.'],
};
function tag(ev) { const p = TAGS[ev] || TAGS.score; return p[Math.floor(Math.random()*p.length)]; }

const PLAY_DESC = {
  mesh:'Man killer',four_verts:'Stretch deep',shallow_cross:'Quick reliable',y_corner:'Beats Cover 2',
  stick:'Safe short',slant:'Timing route',go_route:'One-on-one deep',bubble_screen:'Fast lateral',
  draw:'Fake pass, run',qb_sneak:'Short yardage push',triple_option:'Give keep pitch',
  midline:'FB dive inside',rocket_toss:'Speed to edge',trap:'Pulling guard',qb_keeper:'QB turns corner',
  power:'Downhill physical',zone_read:'Read the end',pa_post:'Fake run, deep',pa_flat:'Fake dive, dump',
  ir_qb_sneak:'Short yardage push',
  ct_corner_blitz:'All-out pressure',ct_safety_blitz:'Extra sack heat',ct_agap_mug:'A-gap mind games',
  ct_fire_zone:'Send 5, drop 3',ct_db_blitz:'Max pressure',ct_press_man:'Jam at the line',
  ct_edge_crash:'Speed rush edges',ct_zone_blitz_drop:'Show blitz, drop',ct_overload_blitz:'Numbers to one side',
  ct_prevent:'Nothing over top',ir_robber:'Jump the route',ir_bracket:'Double best WR',
  ir_qb_spy:'Shadow the QB',ir_gap_integrity:'Every gap covered',ir_cover2_buc:'Tampa 2 seam',
  ir_mod:'Two-high vanilla',ir_press_man:'Jam at the line',ir_line_stunt:'Pressure no blitz',
  ir_cover6:'Split field cov',ir_blitz_call:'Rare IR blitz',
};

function playerImg(p, team, isOff) {
  var pre = team.abbr.toLowerCase();
  var s = isOff ? 'off' : 'def';
  var last = p.name.split(' ').pop().toLowerCase();
  return '/img/players/' + pre + '-' + s + '-' + p.pos.toLowerCase() + '-' + last + '.png';
}

function tierColor(ovr) { return ovr >= 85 ? '#c8a030' : ovr >= 75 ? '#aaa' : '#CD7F32'; }

function resolveRoster(ids, pool) {
  if (!ids || !Array.isArray(ids)) return pool;
  if (ids.length > 0 && typeof ids[0] === 'object') return ids;
  return ids.map(id => pool.find(p => p.id === id)).filter(Boolean);
}

/* ═══════════════════════════════════════════
   BUILDER
   ═══════════════════════════════════════════ */
export function buildGameplay() {
  const hAbbr = GS.team === 'canyon_tech' ? 'CT' : 'IR';
  const hTeam = getTeam(GS.team);
  const oTeam = getOtherTeam(GS.team);
  const isCT = GS.team === 'canyon_tech';

  // engine
  if (!GS.engine) {
    const hOH = GS.offHand || (isCT ? CT_OFF_PLAYS.slice(0,5) : IR_OFF_PLAYS.slice(0,5));
    const hDH = GS.defHand || (isCT ? CT_DEF_PLAYS.slice(0,5) : IR_DEF_PLAYS.slice(0,5));
    const hOR = resolveRoster(GS.offRoster, hTeam.players);
    const hDR = resolveRoster(GS.defRoster, hTeam.defPlayers);
    const cOH = isCT ? IR_OFF_PLAYS.slice(0,5) : CT_OFF_PLAYS.slice(0,5);
    const cDH = isCT ? IR_DEF_PLAYS.slice(0,5) : CT_DEF_PLAYS.slice(0,5);
    const cOR = isCT ? IR_OFFENSE : CT_OFFENSE;
    const cDR = isCT ? IR_DEFENSE : CT_DEFENSE;
    GS.engine = new GameState({
      humanTeam: hAbbr, difficulty: GS.difficulty||'MEDIUM', coachBadge: GS.coachBadge||'SCHEMER',
      ctOffHand: isCT?hOH:cOH, ctDefHand: isCT?hDH:cDH,
      irOffHand: isCT?cOH:hOH, irDefHand: isCT?cDH:hDH,
      ctOffRoster: isCT?hOR:cOR, ctDefRoster: isCT?hDR:cDR,
      irOffRoster: isCT?cOR:hOR, irDefRoster: isCT?cDR:hDR,
    });
  }
  const gs = GS.engine;

  // ui state
  let selP = null, selPl = null;
  let phase = 'player'; // player | play | ready | busy
  let driveSnaps = [];
  let prev2min = gs.twoMinActive;

  // dom
  const el = document.createElement('div');
  el.className = 'T';
  const sty = document.createElement('style'); sty.textContent = CSS; el.appendChild(sty);

  // ── SCOREBOARD ──
  const bug = document.createElement('div'); bug.className = 'T-sb'; el.appendChild(bug);
  function drawBug() {
    const s = gs.getSummary();
    const ct = getTeam('canyon_tech'), ir = getTeam('iron_ridge');
    const dn = ['','1ST','2ND','3RD','4TH'][s.down]||'';
    const ctHasBall = s.possession === 'CT';
    const possTeam = ctHasBall ? ct : ir;
    const defTeam = ctHasBall ? ir : ct;

    // Ball label
    const ydsToEz = s.yardsToEndzone;
    const ballLabel = ydsToEz <= 50 ? defTeam.abbr + ' ' + ydsToEz : possTeam.abbr + ' ' + (100-ydsToEz);

    // TORCH points for human
    const hTorch = hAbbr === 'CT' ? s.ctTorchPts : s.irTorchPts;

    // Center: half label + snap dots OR 2-min clock
    let centerHTML;
    if (s.twoMinActive) {
      centerHTML =
        `<div class="T-sb-half" style="color:#e03050">2-MINUTE DRILL</div>` +
        `<div class="T-sb-clock">${fmtClock(Math.max(0, s.clockSeconds))}</div>`;
    } else {
      const halfName = s.half === 1 ? 'FIRST HALF' : 'SECOND HALF';
      let dots = '';
      for (let i = 0; i < 20; i++) dots += `<div class="T-sb-dot${i < s.playsUsed ? ' T-sb-dot-on' : ''}"></div>`;
      centerHTML =
        `<div class="T-sb-half">${halfName}</div>` +
        `<div class="T-sb-snap">${dots}</div>`;
    }

    // Possession arrow
    const ctPosArrow = ctHasBall ? '<div class="T-sb-pos"><div class="T-sb-pos-arrow">\u25BC</div>POS</div>' : '';
    const irPosArrow = !ctHasBall ? '<div class="T-sb-pos"><div class="T-sb-pos-arrow">\u25BC</div>POS</div>' : '';

    bug.innerHTML =
      `<div class="T-sb-row">` +
        // Left team
        `<div class="T-sb-side${ctHasBall ? ' T-sb-side-glow' : ''}">` +
          `<div class="T-sb-name" style="color:${ct.accent}">${ct.name}</div>` +
          `<div class="T-sb-pts${ctHasBall ? ' T-sb-pts-glow' : ''}">${s.ctScore}</div>` +
          ctPosArrow +
        `</div>` +
        // Center
        `<div class="T-sb-center">${centerHTML}</div>` +
        // Right team
        `<div class="T-sb-side${!ctHasBall ? ' T-sb-side-glow' : ''}">` +
          `<div class="T-sb-name" style="color:${ir.accent}">${ir.name}</div>` +
          `<div class="T-sb-pts${!ctHasBall ? ' T-sb-pts-glow' : ''}">${s.irScore}</div>` +
          irPosArrow +
        `</div>` +
      `</div>` +
      // Situation bar
      `<div class="T-sb-sit">` +
        `<div class="T-sb-sit-down">${dn} & ${s.distance}</div>` +
        `<div class="T-sb-sit-div"></div>` +
        `<div class="T-sb-sit-ball">BALL ON <span style="color:${possTeam.accent}">${ballLabel}</span></div>` +
        `<div class="T-sb-sit-torch">\uD83D\uDD25 ${hTorch}</div>` +
      `</div>`;
  }

  // ── FIELD STRIP ──
  const strip = document.createElement('div'); strip.className = 'T-strip'; el.appendChild(strip);
  function drawField() {
    const s = gs.getSummary();
    const lp = 6 + s.ballPosition * .88;
    const td = s.possession==='CT' ? s.ballPosition+s.distance : s.ballPosition-s.distance;
    const tp = 6 + Math.max(0,Math.min(100,td)) * .88;
    const pc = s.possession==='CT' ? getTeam('canyon_tech').accent : getTeam('iron_ridge').accent;
    let h = '<div class="T-zone T-zone-l"></div><div class="T-zone T-zone-r"></div>';
    for (let i=10;i<=90;i+=10) h += `<div class="T-yard" style="left:${6+i*.88}%"></div>`;
    h += `<div class="T-hash" style="top:33%"></div><div class="T-hash" style="top:67%"></div>`;
    h += `<div class="T-los" style="left:${lp}%;background:${pc};box-shadow:0 0 10px ${pc}"></div>`;
    h += `<div class="T-ltg" style="left:${tp}%;border-color:#c8a030"></div>`;
    h += `<div class="T-marker" style="left:${lp}%;color:${pc}">${s.possession} \u00b7 ${s.yardsToEndzone} TO GO</div>`;
    strip.innerHTML = h;
  }

  // ── PANEL ──
  const panel = document.createElement('div'); panel.className = 'T-panel'; el.appendChild(panel);

  // ── NARRATIVE ──
  const narr = document.createElement('div'); narr.className = 'T-narr';
  narr.innerHTML = '<div class="T-narr-1">Ready to play.</div><div class="T-narr-2">Tap a player to start.</div>';
  el.appendChild(narr);
  function setNarr(a, b) { narr.innerHTML = `<div class="T-narr-1">${a}</div><div class="T-narr-2">${b||''}</div>`; }

  // ── RENDER PANEL ──
  function drawPanel() {
    panel.innerHTML = '';
    const isOff = gs.possession === hAbbr;
    const sides = gs.getCurrentSides();
    const players = isOff ? sides.offPlayers.slice(0,4) : sides.defPlayers.slice(0,4);
    const plays = isOff ? sides.offHand : sides.defHand;
    panel.className = 'T-panel ' + (isOff ? 'T-panel-off' : 'T-panel-def');

    // 2min check
    if (gs.twoMinActive && !prev2min) { prev2min = true; el.classList.add('T-urgent'); show2MinWarn(); }

    // instruction
    const inst = document.createElement('div'); inst.className = 'T-inst';
    inst.style.color = isOff ? '#c8a030' : '#30c0e0';
    if (phase==='player') inst.textContent = isOff ? 'Feature a player' : 'Choose your defender';
    else if (phase==='play') inst.textContent = isOff ? 'Call your play' : 'Set your scheme';
    else inst.textContent = '';
    panel.appendChild(inst);

    // players (draft-style cards with art, OVR, badge)
    const pr = document.createElement('div'); pr.className = 'T-prow';
    players.forEach(p => {
      const isSel = selP === p;
      const tc = tierColor(p.ovr);
      const borderCol = isSel ? '#00ff88' : tc + '44';
      const c = document.createElement('div');
      c.className = 'T-p' + (isSel?' T-p-sel':'') + (p.injured?' T-p-hurt':'');
      c.style.border = '2px solid ' + borderCol;

      // Selected bar
      let selbar = '<div class="T-p-selbar"></div>';
      // Header: POS+NAME left, OVR right
      let hdr = `<div class="T-p-hdr"><div class="T-p-left"><div class="T-p-pos">${p.pos}</div><div class="T-p-name">${p.name}</div></div><div style="text-align:right"><div class="T-p-ovr" style="color:${tc};text-shadow:0 0 8px ${tc}66">${p.ovr}</div><div class="T-p-ovrlbl" style="color:${tc}">OVR</div></div></div>`;
      // Art
      const imgSrc = playerImg(p, hTeam, isOff);
      let art = `<div class="T-p-art"><img src="${imgSrc}" alt="${p.name}" draggable="false"><div class="T-p-art-fade"></div></div>`;
      // Nick
      const nick = p.nick ? `<div class="T-p-nick">"${p.nick}"</div>` : '';
      // Badge
      let badge = p.badge ? `<div class="T-p-badge" style="filter:drop-shadow(0 0 ${isSel?'3px':'2px'} ${hTeam.accent}${isSel?'66':'4d'})">${badgeSvg(p.badge, isSel?'#00ff88':hTeam.accent)}</div>` : '';

      c.innerHTML = selbar + hdr + art + nick + badge;
      c.onclick = () => { if (p.injured || phase==='busy') return; SND.click(); selP = p; if (phase==='player') phase='play'; drawPanel(); };
      pr.appendChild(c);
    });
    panel.appendChild(pr);

    // plays (draft-style cards with diagram, hidden until player picked)
    const pw = document.createElement('div'); pw.className = 'T-plays' + (phase==='player'?' T-plays-hidden':'');
    plays.forEach(play => {
      const isSel = selPl === play;
      const mq = matchupQ(selP, play, gs.drivePlayHistory, isOff);
      const tc = typeColor(play.playType || play.cardType);
      const borderCol = isSel ? '#00ff88' : '#00ff8833';
      const c = document.createElement('div');
      c.className = 'T-pl' + (isSel?' T-pl-sel':'');
      c.style.border = '2px solid ' + borderCol;

      // Selected bar
      let selbar = '<div class="T-pl-selbar"></div>';
      // Header: name + type tag
      let hdr = `<div class="T-pl-hdr"><div class="T-pl-name">${play.name}</div><div class="T-pl-tag" style="color:${tc};border-color:${tc}44">${play.playType||play.cardType}</div></div>`;
      // Route diagram (zoomed like draft)
      let svg = playSvg(play.id, isSel ? '#00ff88' : '#c8a030');
      svg = svg.replace('viewBox="0 0 60 50"','viewBox="4 4 52 44"').replace('width="60" height="50"','width="100%" height="100%" preserveAspectRatio="xMidYMid meet"').replace(/stroke-width="1.5"/g,'stroke-width="2.5"').replace(/stroke-width="1"/g,'stroke-width="2"').replace(/r="3.5"/g,'r="4.5"').replace(/r="2.5"/g,'r="3.5"');
      let diag = `<div class="T-pl-diag">${svg}</div>`;
      // Footer: description + matchup dot
      const desc = PLAY_DESC[play.id] || '';
      const mqDot = mq ? `<span class="T-mq" style="background:${mqColor(mq)};box-shadow:0 0 4px ${mqColor(mq)}"></span>` : '';
      let foot = `<div class="T-pl-foot"><span class="T-pl-desc">${desc}</span>${mqDot}</div>`;

      c.innerHTML = selbar + hdr + diag + foot;
      c.onclick = () => { if (phase==='busy') return; SND.click(); selPl = play; phase = 'ready'; drawPanel(); };
      pw.appendChild(c);
    });
    panel.appendChild(pw);

    // snap zone
    const sz = document.createElement('div'); sz.className = 'T-snap' + (phase!=='ready'?' T-snap-hidden':'');
    if (selP && selPl) {
      const mq = matchupQ(selP, selPl, gs.drivePlayHistory, isOff);
      const mqL = mq==='green'?'COMBO':mq==='red'?'RISKY':'NEUTRAL';
      const mqC = mqColor(mq);
      const cb = document.createElement('div'); cb.className = 'T-combo';
      cb.innerHTML =
        `<span class="T-combo-lbl">${selP.name}</span>`+
        `<span style="color:#554f80;font-size:10px">\u00b7</span>`+
        `<span class="T-combo-lbl">${selPl.name}</span>`+
        `<span class="T-combo-sig" style="color:${mqC};background:${mqC}12;border:1px solid ${mqC}30">${mqL}</span>`;
      sz.appendChild(cb);

      // 2min buttons
      if (gs.twoMinActive && isOff) {
        const btns = document.createElement('div'); btns.className = 'T-2btns';
        const spk = document.createElement('button'); spk.className = 'T-2btn T-spike'; spk.textContent = 'SPIKE';
        spk.onclick = () => { SND.click(); gs.spike(); selP=null;selPl=null;phase='player'; drawBug();drawField(); setNarr('Ball spiked.',fmtClock(Math.max(0,gs.clockSeconds))+' left'); if(!checkEnd()) drawPanel(); };
        btns.appendChild(spk);
        const hS = hAbbr==='CT'?gs.ctScore:gs.irScore, cS = hAbbr==='CT'?gs.irScore:gs.ctScore;
        if (hS > cS) {
          const kn = document.createElement('button'); kn.className = 'T-2btn T-kneel'; kn.textContent = 'KNEEL';
          kn.onclick = () => { SND.click(); gs.kneel(); selP=null;selPl=null;phase='player'; drawBug();drawField(); setNarr('QB kneels.',fmtClock(Math.max(0,gs.clockSeconds))+' left'); if(!checkEnd()) drawPanel(); };
          btns.appendChild(kn);
        }
        sz.appendChild(btns);
      }

      const go = document.createElement('button'); go.className = 'T-go'; go.textContent = 'SNAP';
      go.onclick = () => doSnap();
      sz.appendChild(go);
    }
    panel.appendChild(sz);
  }

  // ── SNAP ──
  function doSnap() {
    phase = 'busy';
    const isOff = gs.possession === hAbbr;
    const prevPoss = gs.possession;
    const res = isOff ? gs.executeSnap(selPl, selP, null, null) : gs.executeSnap(null, null, selPl, selP);
    driveSnaps.push(res);
    selP = null; selPl = null;

    showResult(res, () => {
      drawBug(); drawField();
      if (res.gameEvent === 'touchdown') { showConv(res.scoringTeam); return; }
      if (posChanged(res.gameEvent, prevPoss)) {
        showPossCut(res.gameEvent, () => { showDrive(driveSnaps, prevPoss, () => { driveSnaps=[]; if(!checkEnd()) nextSnap(); }); });
      } else { if(!checkEnd()) nextSnap(); }
    });
  }

  function nextSnap() {
    phase = 'player';
    drawPanel();
    // Human always picks cards — on offense they pick offPlay+player,
    // on defense they pick defPlay+player. doSnap() passes them in the right slots.
    // No auto-CPU here — the human taps SNAP every time.
  }

  // ── RESULT OVERLAY ──
  function showResult(res, done) {
    const r = res.result;
    const col = r.isTouchdown?'#3df58a' : r.isSack||r.isInterception||r.isFumbleLost?'#e03050' : r.yards>=8?'#3df58a' : r.yards>=1?'#c8a030' : '#554f80';
    const txt = r.isTouchdown?'TOUCHDOWN' : r.isSack?'SACK' : r.isInterception?'INTERCEPTED' : r.isFumbleLost?'FUMBLE' : r.isIncomplete?'INCOMPLETE' : r.isSafety?'SAFETY' : (r.yards>=0?'+':'')+r.yards+' YDS';
    const bd = breakdown(res.offPlay, res.defPlay, r, res.featuredOff, res.featuredDef);
    setNarr(r.description, bd);

    const ov = document.createElement('div'); ov.className = 'T-ov T-ov-dark T-ov-result';
    ov.style.cssText = 'opacity:0;transition:opacity .25s';
    ov.innerHTML =
      `<div class="T-r-play">${res.offPlay.name} vs ${res.defPlay.name}</div>`+
      `<div class="T-r-big" style="color:${col}">${txt}</div>`+
      `<div class="T-r-sub">${bd}</div>`;
    el.appendChild(ov);
    requestAnimationFrame(() => ov.style.opacity='1');
    setTimeout(() => { ov.style.opacity='0'; setTimeout(() => { ov.remove(); done(); }, 250); }, 2400);
  }

  // ── POSSESSION CUT ──
  function posChanged(ev, prev) {
    if (ev && ['interception','fumble_lost','turnover_on_downs','safety','turnover_td'].includes(ev)) return true;
    return gs.possession !== prev;
  }

  function showPossCut(ev, done) {
    const s = gs.getSummary();
    const nt = s.possession==='CT' ? getTeam('canyon_tech') : getTeam('iron_ridge');
    const ov = document.createElement('div'); ov.className = 'T-ov T-ov-black T-ov-poss';
    ov.style.cssText = 'opacity:0;transition:opacity .25s';
    ov.innerHTML =
      `<div class="T-poss-score">${s.ctScore} \u2013 ${s.irScore}</div>`+
      `<div class="T-poss-who" style="color:${nt.accent}">${nt.name} BALL</div>`+
      `<div class="T-poss-tag">${tag(ev)}</div>`;
    el.appendChild(ov);
    requestAnimationFrame(() => ov.style.opacity='1');
    setTimeout(() => { ov.style.opacity='0'; setTimeout(() => { ov.remove(); done(); }, 250); }, 2000);
  }

  // ── DRIVE SUMMARY ──
  function showDrive(log, poss, done) {
    if (log.length < 2) { done(); return; }
    const yds = log.reduce((s,r) => s + (r.result.yards||0), 0);
    const td = log.some(r => r.result.isTouchdown);
    const to = log.some(r => r.result.isInterception || r.result.isFumbleLost);
    const dt = poss==='CT' ? getTeam('canyon_tech') : getTeam('iron_ridge');

    panel.innerHTML = '';
    const d = document.createElement('div'); d.className = 'T-drv';
    d.style.cssText = 'opacity:0;transition:opacity .3s';
    d.innerHTML =
      `<div class="T-drv-hdr" style="color:${dt.accent}">${dt.abbr} DRIVE \u2014 ${log.length} PLAYS, ${yds} YDS</div>`+
      (td ? '<div class="T-drv-stat" style="color:#3df58a">TOUCHDOWN</div>' : '')+
      (to ? '<div class="T-drv-stat" style="color:#e03050">TURNOVER</div>' : '')+
      (!td && !to ? '<div class="T-drv-stat">Drive over.</div>' : '');
    panel.appendChild(d);
    requestAnimationFrame(() => d.style.opacity='1');
    setTimeout(done, 1800);
  }

  // ── CONVERSION ──
  function showConv(team) {
    const isH = team === hAbbr;
    if (!isH) {
      gs.handleConversion('xp'); drawBug(); setNarr('Extra point good.', '+1');
      showPossCut('score', () => { showDrive(driveSnaps, team, () => { driveSnaps=[]; if(!checkEnd()) nextSnap(); }); });
      return;
    }
    panel.innerHTML = '';
    const w = document.createElement('div'); w.className = 'T-conv';
    w.innerHTML = '<div class="T-conv-hdr">TOUCHDOWN</div>';
    [{id:'xp',lbl:'EXTRA POINT +1',sub:'Automatic',col:'#3df58a'},
     {id:'2pt',lbl:'2-PT CONV +2',sub:'From the 5',col:'#c8a030'},
     {id:'3pt',lbl:'3-PT CONV +3',sub:'From the 10',col:'#e03050'}].forEach(c => {
      const b = document.createElement('button'); b.className = 'T-conv-btn';
      b.style.cssText = `color:${c.col};border:1.5px solid ${c.col}`;
      b.innerHTML = `${c.lbl}<br><span style="font-size:6px;color:#554f80">${c.sub}</span>`;
      b.onclick = () => {
        SND.snap();
        const r = gs.handleConversion(c.id); drawBug();
        setNarr(c.id==='xp'?'Extra point good.':(r.success?c.lbl+' GOOD!':c.lbl+' NO GOOD.'), r.success?'+'+r.points:'Failed.');
        showPossCut('score', () => { showDrive(driveSnaps, team, () => { driveSnaps=[]; if(!checkEnd()) nextSnap(); }); });
      };
      w.appendChild(b);
    });
    panel.appendChild(w);
  }

  // ── 2-MIN WARNING ──
  function show2MinWarn() {
    const ov = document.createElement('div'); ov.className = 'T-ov T-ov-black T-ov-poss';
    ov.style.cssText = 'opacity:0;transition:opacity .25s';
    ov.innerHTML =
      '<div class="T-poss-score" style="color:#e03050">2:00</div>'+
      '<div class="T-poss-who" style="color:#e03050">2-MINUTE WARNING</div>'+
      '<div class="T-poss-tag">Every second counts.</div>';
    el.appendChild(ov);
    requestAnimationFrame(() => ov.style.opacity='1');
    setTimeout(() => { ov.style.opacity='0'; setTimeout(() => ov.remove(), 250); }, 2000);
  }

  // ── COIN TOSS OVERLAY ──
  function showCoinToss(onDone) {
    var pool = TORCH_CARDS.filter(function(c) { return c.tier !== 'GOLD'; });
    var shuffled = pool.slice().sort(function() { return Math.random() - 0.5; });
    var offers = shuffled.slice(0, 3);
    var humanWins = Math.random() < 0.5;

    var ov = document.createElement('div');
    ov.className = 'T-ov T-ov-black';
    ov.style.cssText += 'pointer-events:auto;flex-direction:column;gap:14px;padding:20px;opacity:0;transition:opacity .3s;';

    // Coin animation
    ov.innerHTML =
      "<div style='width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,#FFD700,#B8860B);display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:0 0 25px rgba(255,204,0,.4);animation:T-coin 1.5s ease-out forwards'>\uD83C\uDFC8</div>" +
      "<div style=\"font-family:'Bebas Neue';font-size:24px;color:#fff;letter-spacing:2px\">COIN TOSS...</div>";

    el.appendChild(ov);
    requestAnimationFrame(function() { ov.style.opacity = '1'; });

    setTimeout(function() {
      var winner = humanWins ? hTeam.name : oTeam.name;
      ov.innerHTML = '';

      // Result
      var resultDiv = document.createElement('div');
      resultDiv.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;max-width:340px;';
      resultDiv.innerHTML =
        "<div style=\"font-family:'Bebas Neue';font-size:26px;color:var(--a-gold);letter-spacing:2px\">" + winner + " WINS THE TOSS</div>";

      if (humanWins) {
        resultDiv.insertAdjacentHTML('beforeend', "<div style=\"font-family:'Press Start 2P';font-size:7px;color:var(--muted);letter-spacing:1px\">CHOOSE YOUR REWARD</div>");

        var cardRow = document.createElement('div');
        cardRow.style.cssText = 'display:flex;gap:6px;width:100%;';
        offers.forEach(function(card) {
          var ce = document.createElement('div');
          var tierCol = card.tier === 'SILVER' ? '#aaa' : '#CD7F32';
          ce.style.cssText = 'flex:1;background:var(--bg-surface);border:2px solid ' + tierCol + ';border-radius:6px;padding:10px 6px;cursor:pointer;text-align:center;transition:all .15s;';
          ce.innerHTML =
            "<div style=\"font-family:'Courier New';font-size:7px;font-weight:bold;color:" + tierCol + ";letter-spacing:1px;margin-bottom:3px\">" + card.tier + "</div>" +
            "<div style=\"font-family:'Bebas Neue';font-size:14px;color:#fff;line-height:1.1;margin-bottom:3px\">" + card.name + "</div>" +
            "<div style=\"font-family:'Courier New';font-size:7px;color:var(--muted);line-height:1.3\">" + card.effect + "</div>";
          ce.onclick = function() {
            SND.snap();
            ce.style.transform = 'scale(1.1)';
            ce.style.boxShadow = '0 0 30px var(--a-gold)';
            setTimeout(function() { ov.style.opacity = '0'; setTimeout(function() { ov.remove(); onDone([card]); }, 250); }, 400);
          };
          cardRow.appendChild(ce);
        });
        resultDiv.appendChild(cardRow);

        resultDiv.insertAdjacentHTML('beforeend', "<div style=\"font-family:'Press Start 2P';font-size:7px;color:var(--muted);letter-spacing:2px\">\u2014 OR \u2014</div>");

        var recBtn = document.createElement('button');
        recBtn.className = 'btn-blitz';
        recBtn.style.cssText = 'width:100%;font-size:11px;background:var(--a-gold);border-color:var(--a-gold);color:#000;';
        recBtn.textContent = 'RECEIVE AT THE 50';
        recBtn.onclick = function() { SND.snap(); ov.style.opacity = '0'; setTimeout(function() { ov.remove(); onDone([], true); }, 250); };
        resultDiv.appendChild(recBtn);
      } else {
        var cpuCard = offers[0];
        resultDiv.innerHTML +=
          "<div style=\"font-family:'Barlow Condensed';font-size:14px;color:var(--muted);line-height:1.4;text-align:center\">" +
            oTeam.name + " takes a " + cpuCard.tier + " Torch Card.<br>You receive at the 50." +
          "</div>";
        var playBtn = document.createElement('button');
        playBtn.className = 'btn-blitz';
        playBtn.style.cssText = 'width:100%;font-size:14px;background:var(--a-gold);border-color:var(--a-gold);color:#000;margin-top:8px;';
        playBtn.textContent = 'PLAY BALL';
        playBtn.onclick = function() { SND.snap(); ov.style.opacity = '0'; setTimeout(function() { ov.remove(); onDone([], true); }, 250); };
        resultDiv.appendChild(playBtn);
      }

      ov.appendChild(resultDiv);
    }, 1800);
  }

  // ── RULES OVERLAY ──
  function showRules(onDone) {
    var ov = document.createElement('div');
    ov.className = 'T-ov T-ov-dark';
    ov.style.cssText += 'pointer-events:auto;flex-direction:column;gap:12px;padding:24px;opacity:0;transition:opacity .3s;cursor:pointer;';
    ov.innerHTML =
      "<div style=\"font-family:'Bebas Neue';font-size:30px;color:var(--a-gold);letter-spacing:3px\">HOW TO PLAY</div>" +
      "<div style=\"font-family:'Barlow Condensed';font-size:16px;color:#ccc;line-height:1.6;text-align:center;max-width:300px\">" +
        "20 snaps per half<br>" +
        "2-minute warning after snap 20<br>" +
        "Real countdown clock<br>" +
        "Both teams go for it on 4th down<br>" +
      "</div>" +
      "<div style=\"font-family:'Press Start 2P';font-size:7px;color:var(--muted);letter-spacing:1px;margin-top:8px\">TAP TO START</div>";
    el.appendChild(ov);
    requestAnimationFrame(function() { ov.style.opacity = '1'; });
    ov.onclick = function() { SND.click(); ov.style.opacity = '0'; setTimeout(function() { ov.remove(); onDone(); }, 250); };
  }

  // ── TRANSITIONS ──
  function checkEnd() {
    if (gs.gameOver) { setTimeout(() => setGs(s => ({...s, screen:'end_game', finalEngine:gs, humanAbbr:hAbbr})), 1200); return true; }
    if (gs.needsHalftime) { setTimeout(() => setGs(s => ({...s, screen:'halftime'})), 1200); return true; }
    return false;
  }

  // ── INIT ──
  drawBug(); drawField();
  if (gs.twoMinActive) { prev2min = true; el.classList.add('T-urgent'); }

  // First load: coin toss overlay → rules overlay → then enable play
  if (!GS._coinTossDone) {
    GS._coinTossDone = true;
    // Show empty panel behind overlay
    drawPanel();
    showCoinToss(function(torchCards, humanReceives) {
      // Store torch cards from coin toss
      if (torchCards && torchCards.length) {
        torchCards.forEach(function(c) { gs.humanTorchCards.push(c.id); });
      }
      showRules(function() {
        phase = 'player';
        drawPanel();
      });
    });
  } else {
    drawPanel();
  }

  return el;
}
