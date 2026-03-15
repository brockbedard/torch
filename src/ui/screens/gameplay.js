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
/* score row: 5 columns — icon | team+score | center | team+score | icon */
.T-sb-row{display:grid;grid-template-columns:1fr 1.2fr auto 1.2fr 1fr;align-items:center;padding:6px 10px}
.T-sb-icon{font-size:34px;line-height:1;text-align:center;filter:drop-shadow(0 0 10px rgba(255,255,255,.25)) saturate(1.3)}
.T-sb-side{display:flex;flex-direction:column;align-items:center;padding:4px 6px;border-radius:6px;position:relative}
.T-sb-side-glow{background:radial-gradient(ellipse,rgba(255,204,0,.2) 0%,rgba(255,204,0,.06) 50%,transparent 75%);box-shadow:0 0 20px rgba(255,204,0,.18)}
.T-sb-name{font-family:'Bebas Neue';font-size:18px;font-style:italic;line-height:1;letter-spacing:1px;white-space:nowrap}
.T-sb-score-row{position:relative;margin-top:2px;display:flex;justify-content:center}
.T-sb-pos-arrow{position:absolute;top:50%;transform:translateY(-50%);font-size:12px;color:#c8a030;line-height:1}
.T-sb-pos-arrow-l{left:-14px}
.T-sb-pos-arrow-r{right:-14px}
.T-sb-pts{font-family:'Press Start 2P';font-size:26px;color:#e8e6ff;line-height:1}
.T-sb-pts-glow{text-shadow:0 0 14px rgba(255,204,0,.5)}
.T-sb-center{text-align:center;padding:0 8px;border-left:1px solid rgba(255,255,255,.06);border-right:1px solid rgba(255,255,255,.06);min-width:80px}
.T-sb-half{font-family:'Bebas Neue';font-size:15px;color:#c8a030;letter-spacing:2px;line-height:1}
.T-sb-snap{font-family:'Press Start 2P';font-size:11px;color:#e8e6ff;margin-top:2px;line-height:1;text-shadow:0 0 4px rgba(255,255,255,.2)}
.T-sb-countdown{font-family:'Press Start 2P';font-size:9px;color:#554f80;margin-top:2px;line-height:1}
.T-sb-countdown-live{font-size:14px;color:#e03050;text-shadow:0 0 10px rgba(224,48,80,.5)}
/* situation bar */
.T-sb-sit{display:flex;align-items:center;justify-content:center;padding:4px 10px;background:rgba(0,0,0,.4);border-top:1px solid rgba(255,255,255,.04);gap:8px}
.T-sb-sit-down{font-family:'Press Start 2P';font-size:10px;color:#30c0e0;letter-spacing:.5px}
.T-sb-sit-div{width:1px;height:14px;background:rgba(255,255,255,.12);flex-shrink:0}
.T-sb-sit-ball{font-family:'Press Start 2P';font-size:10px;color:#e8e6ff;opacity:.7;letter-spacing:.5px}
.T-sb-sit-torch{font-family:'Press Start 2P';font-size:9px;color:#c8a030;letter-spacing:.5px;transition:transform .08s,text-shadow .08s}

/* field strip */
/* field strip — Tecmo Bowl inspired */
.T-strip{height:166px;flex-shrink:0;position:relative;background:#1a6a1a;overflow:hidden;border-bottom:1px solid #1a183a}
.T-field-turf{position:absolute;inset:0;background-image:repeating-linear-gradient(0deg,rgba(0,0,0,.04) 0%,rgba(0,0,0,.04) 50%,transparent 50%,transparent 100%);background-size:100% 12px}
.T-yard{position:absolute;top:0;bottom:0;width:2px;background:rgba(255,255,255,.2)}
.T-yard-5{position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,.08)}
.T-yard-num{position:absolute;font-family:'Press Start 2P';font-size:9px;color:rgba(255,255,255,.25);transform:translateX(-50%);letter-spacing:1px}
.T-yard-num-top{top:4px}
.T-yard-num-bot{bottom:4px}
.T-los{position:absolute;top:0;bottom:0;width:3px;z-index:5;transition:left .4s ease-out}
.T-ltg{position:absolute;top:0;bottom:0;width:2px;opacity:.6;z-index:4;transition:left .4s ease-out;border-left:2px dashed}
.T-ez{position:absolute;top:0;bottom:0;width:7%;display:flex;align-items:center;justify-content:center;overflow:hidden}
.T-ez-l{left:0;border-right:3px solid rgba(255,255,255,.3)}
.T-ez-r{right:0;border-left:3px solid rgba(255,255,255,.3)}
.T-ez-text{font-family:'Press Start 2P';font-size:6px;color:rgba(255,255,255,.5);writing-mode:vertical-lr;transform:rotate(180deg);letter-spacing:2px}
.T-midfield-logo{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:48px;opacity:.2;z-index:1;filter:saturate(1.3)}
.T-hash{position:absolute;left:7%;right:7%;height:1px;background:rgba(255,255,255,.06)}
/* placed cards on field — 150px to match tray cards exactly */
.T-placed{position:absolute;bottom:8px;height:150px;z-index:8;border-radius:6px;overflow:hidden;background:var(--bg-surface);border:2px solid #00ff88;box-shadow:0 0 12px rgba(0,255,136,.2);display:flex;flex-direction:column}
.T-placed-play{left:3%;width:30%}
.T-placed-player{left:35%;width:30%}
.T-placed-torch{right:3%;width:28%}
/* empty drop outlines — 150px to match cards exactly */
.T-drop{position:absolute;bottom:8px;height:150px;border:2px dashed #554f8044;border-radius:6px;display:flex;align-items:center;justify-content:center;z-index:7;transition:all .2s}
.T-drop-play{left:3%;width:30%}
.T-drop-player{left:35%;width:30%}
.T-drop-torch{right:3%;width:28%}
.T-drop-lbl{font-family:'Press Start 2P';font-size:6px;color:#554f8055;letter-spacing:.5px}
.T-drop-hover{border-color:#c8a030;background:rgba(200,160,48,.06)}
@keyframes T-drop-pulse{0%,100%{border-color:#c8a03066;box-shadow:none}50%{border-color:#c8a030;box-shadow:inset 0 0 12px rgba(200,160,48,.08),0 0 8px rgba(200,160,48,.15)}}
.T-drop-active{animation:T-drop-pulse 1.5s ease-in-out infinite}
.T-drop-active .T-drop-lbl{color:#c8a030}

/* cards section — hidden during play-by-play */
.T-panel{display:flex;flex-direction:column;overflow:hidden;transition:background .5s;flex-shrink:0}
.T-panel-hidden{display:none}
.T-panel-off{background:linear-gradient(180deg,#120e00 0%,#06050f 50%)}
.T-panel-def{background:linear-gradient(180deg,#00080e 0%,#06050f 50%)}

/* instruction */
.T-inst{text-align:center;padding:6px 0 2px;font-family:'Press Start 2P';font-size:7px;letter-spacing:1px;flex-shrink:0;text-transform:uppercase}

/* card tray — cards at 150px, matching field outlines */
.T-tray{display:flex;gap:6px;padding:6px 8px;flex-shrink:0}
.T-card{flex:1;height:150px;border-radius:6px;background:var(--bg-surface);overflow:hidden;display:flex;flex-direction:column;transition:all .12s;touch-action:none;position:relative;cursor:grab}
.T-card:active{cursor:grabbing}
.T-card-gone{opacity:.3;pointer-events:none}
.T-card-hurt{opacity:.2;pointer-events:none}
/* drag ghost */
.T-drag-ghost{position:fixed;z-index:9999;pointer-events:none;opacity:.85;transform:scale(1.05);filter:drop-shadow(0 4px 12px rgba(0,0,0,.6))}

/* snap bar — uses btn-blitz style */
.T-snap{padding:4px 6px;flex-shrink:0;display:flex;gap:4px;align-items:stretch;flex-direction:column}
@keyframes T-pulse{0%,100%{box-shadow:6px 6px 0 #997a00, 10px 10px 0 #000, 0 0 20px rgba(255,204,0,.3)}50%{box-shadow:6px 6px 0 #997a00, 10px 10px 0 #000, 0 0 40px rgba(255,204,0,.6)}}

/* 2min buttons */
.T-2btns{display:flex;gap:5px}
.T-2btn{flex:1;padding:10px;font-family:'Press Start 2P';font-size:7px;cursor:pointer;text-align:center;background:none;letter-spacing:.5px;text-transform:uppercase;border:4px solid}
.T-2btn:active{transform:translate(3px,3px)}
.T-spike{color:#30c0e0;border-color:#30c0e0;box-shadow:4px 4px 0 #1a6070,6px 6px 0 #000}
.T-kneel{color:#554f80;border-color:#554f80;box-shadow:4px 4px 0 #2a2840,6px 6px 0 #000}

/* play-by-play terminal */
.T-narr{flex:1;min-height:0;background:#080812;border-top:1px solid #1a183a;overflow-y:auto;padding:10px 14px}
.T-pbp{display:flex;flex-direction:column;gap:5px}
.T-pbp-line{font-family:'Courier New',monospace;font-size:13px;color:#554f80;line-height:1.4;letter-spacing:.3px}
.T-pbp-live{color:#30c0e0}
.T-pbp-result{font-family:'Press Start 2P';font-size:14px;letter-spacing:.5px;line-height:1;margin-top:10px}
.T-pbp-down{font-family:'Press Start 2P';font-size:12px;color:#30c0e0;margin-top:6px;letter-spacing:.5px;line-height:1}
.T-pbp-idle{font-family:'Courier New',monospace;font-size:11px;color:#333;letter-spacing:.5px}
/* torch points fly animation */
.T-torch-fly{position:fixed;z-index:9999;font-family:'Press Start 2P';font-size:12px;color:#c8a030;pointer-events:none;text-shadow:0 0 8px rgba(200,160,48,.5)}
@keyframes T-flyup{0%{opacity:1;transform:scale(1)}80%{opacity:1}100%{opacity:0;transform:scale(.6)}}
.T-pbp-cursor{display:inline-block;width:6px;height:12px;background:#30c0e0;margin-left:2px;animation:T-blink .6s step-end infinite}

/* celebrations */
@keyframes T-shake{0%,100%{transform:translateX(0)}10%{transform:translateX(-6px)}20%{transform:translateX(6px)}30%{transform:translateX(-4px)}40%{transform:translateX(4px)}50%{transform:translateX(-2px)}60%{transform:translateX(2px)}}
.T-shaking{animation:T-shake .5s ease-out}
@keyframes T-flash-green{0%{opacity:.6}100%{opacity:0}}
@keyframes T-flash-red{0%{opacity:.6}100%{opacity:0}}
.T-flash{position:absolute;inset:0;z-index:100;pointer-events:none}
@keyframes T-rain-fall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(200px) rotate(720deg);opacity:0}}
.T-rain{position:absolute;font-size:16px;z-index:99;pointer-events:none;animation:T-rain-fall 2s ease-in forwards}
@keyframes T-crack-in{0%{opacity:0;transform:scale(2)}100%{opacity:1;transform:scale(1)}}
.T-crack{position:absolute;inset:0;z-index:100;pointer-events:none;display:flex;align-items:center;justify-content:center}
.T-crack-text{font-family:'Press Start 2P';font-size:18px;letter-spacing:2px;animation:T-crack-in .3s ease-out;text-shadow:0 0 20px currentColor}
@keyframes T-impact{0%{opacity:.8;transform:scale(1)}100%{opacity:0;transform:scale(3)}}
.T-impact{position:absolute;top:50%;left:50%;width:40px;height:40px;border-radius:50%;z-index:99;pointer-events:none;transform:translate(-50%,-50%);animation:T-impact .4s ease-out forwards}
@keyframes T-blink{0%,100%{opacity:1}50%{opacity:0}}
/* card matchup display on field during play */
.T-clash{position:absolute;inset:4px;z-index:9;display:flex;align-items:center;justify-content:center;gap:6px;pointer-events:none}
.T-clash-card{width:28%;background:var(--bg-surface);border-radius:6px;border:2px solid;overflow:hidden;display:flex;flex-direction:column;max-height:100%}
.T-clash-vs{font-family:'Bebas Neue';font-size:20px;color:#c8a030;font-style:italic}

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

/* Build a player card matching the draft screen style exactly (slightly smaller) */
function mkPlayerCard(p, team, isOff) {
  var tc = p.ovr >= 85 ? 'var(--a-gold)' : p.ovr >= 75 ? '#aaa' : '#CD7F32';
  var imgSrc = playerImg(p, team, isOff);
  // Matches draft.js buildPlayerCard with small=true sizes
  return '<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:5px 6px 0">' +
    '<div>' +
      "<div style=\"font-family:'Courier New';font-size:10px;font-weight:bold;color:#ff0040;letter-spacing:1px;line-height:1\">" + p.pos + '</div>' +
      "<div style=\"font-family:'Bebas Neue';font-size:15px;color:#fff;line-height:1;margin-top:1px\">" + p.name + '</div>' +
    '</div>' +
    '<div style="text-align:right">' +
      "<div style=\"font-family:'Courier New';font-size:20px;font-weight:bold;color:" + tc + ";line-height:1;text-shadow:0 0 8px " + tc + "66\">" + p.ovr + '</div>' +
      "<div style=\"font-family:'Courier New';font-size:6px;font-weight:bold;color:" + tc + ";opacity:.7;letter-spacing:1px\">OVR</div>" +
    '</div></div>' +
    '<div style="flex:1;min-height:0;position:relative;overflow:hidden">' +
      '<img src="' + imgSrc + '" alt="' + p.name + '" draggable="false" style="height:100%;width:100%;object-fit:contain;filter:drop-shadow(0 2px 6px rgba(0,0,0,.7))">' +
      '<div style="position:absolute;bottom:0;left:0;right:0;height:40%;background:linear-gradient(transparent,var(--bg-surface));pointer-events:none"></div>' +
    '</div>';
}

/* Risk classification matching cardDraft.js */
var HIGH_RISK_IDS = ['four_verts','go_route','y_corner','zero_cov','db_blitz'];
var MED_RISK_IDS = ['mesh','slant','overload','fire_zone','a_gap_mug','edge_crash','pa_post','pa_flat','man_press','zone_drop','triple_option','zone_read'];
function getRisk(id) { return HIGH_RISK_IDS.indexOf(id)>=0?'high':MED_RISK_IDS.indexOf(id)>=0?'med':'low'; }

/* Build a play card matching the draft screen style exactly (slightly smaller) */
function mkPlayCard(play) {
  var cat = {SHORT:'SHORT',QUICK:'QUICK',DEEP:'DEEP',RUN:'RUN',SCREEN:'SCREEN',OPTION:'OPTION',
    BLITZ:'BLITZ',ZONE:'ZONE',PRESSURE:'PRESSURE',HYBRID:'HYBRID'}[play.playType||play.cardType] || 'RUN';
  var cc = typeColor(cat);
  var risk = getRisk(play.id);
  var riskColor = risk==='high'?'#ff0040':risk==='med'?'#ff4d00':'#00ff44';
  var riskLabel = risk==='high'?'HIGH VOLTAGE':risk==='med'?'CALCULATED':'STEADY HAND';
  var riskWidth = risk==='high'?'90%':risk==='med'?'60%':'35%';
  // SVG with zoomed viewBox, thicker strokes, bigger dots — matches cardDraft exactly
  var svg = playSvg(play.id, '#00ff88');
  svg = svg.replace('viewBox="0 0 60 50"','viewBox="4 4 52 44"')
    .replace('width="60" height="50"','width="100%" height="100%" preserveAspectRatio="xMidYMid meet"')
    .replace(/stroke-width="1.5"/g,'stroke-width="2.5"').replace(/stroke-width="1"/g,'stroke-width="2"')
    .replace(/r="3.5"/g,'r="5"').replace(/r="2.5"/g,'r="4"')
    .replace(/stroke="#00ff88"/g,'stroke="#ffcc00"');
  // Header
  return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 8px 4px">' +
      "<div style=\"font-family:'Bebas Neue';font-size:14px;color:#fff;line-height:1.1;flex:1;margin-right:4px\">" + play.name + '</div>' +
      "<div style=\"font-family:'Courier New';font-size:6px;font-weight:bold;color:" + cc + ";border:1px solid " + cc + "44;padding:2px 4px;border-radius:8px;letter-spacing:.5px\">" + cat + '</div>' +
    '</div>' +
    // Diagram
    '<div style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse,#1a1030,#0a0818);margin:0 6px;border-radius:4px;overflow:hidden">' + svg + '</div>' +
    // Risk meter
    '<div style="padding:4px 8px 2px">' +
      '<div style="height:6px;border-radius:3px;background:rgba(255,255,255,0.06);overflow:hidden">' +
        '<div style="width:' + riskWidth + ';height:100%;border-radius:3px;background:' + riskColor + '"></div>' +
      '</div>' +
      "<div style=\"font-family:'Courier New';font-size:7px;font-weight:bold;color:" + riskColor + ";letter-spacing:.5px;margin-top:2px\">" + riskLabel + '</div>' +
    '</div>' +
    // Description
    "<div style=\"padding:2px 8px 6px;font-family:'Courier New';font-size:7px;color:var(--muted);opacity:.7\">" + (PLAY_DESC[play.id]||'') + '</div>';
}

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
    const hOH = GS.offHand || (isCT ? CT_OFF_PLAYS.slice(0,4) : IR_OFF_PLAYS.slice(0,4));
    const hDH = GS.defHand || (isCT ? CT_DEF_PLAYS.slice(0,4) : IR_DEF_PLAYS.slice(0,4));
    const hOR = resolveRoster(GS.offRoster, hTeam.players);
    const hDR = resolveRoster(GS.defRoster, hTeam.defPlayers);
    const cOH = isCT ? IR_OFF_PLAYS.slice(0,4) : CT_OFF_PLAYS.slice(0,4);
    const cDH = isCT ? IR_DEF_PLAYS.slice(0,4) : CT_DEF_PLAYS.slice(0,4);
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
  let selP = null, selPl = null, selTorch = null;
  let phase = 'play'; // play | player | torch | ready | busy
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

    // Center: half label + snap counter + clock (clock always visible, goes live at 2-min)
    const halfName = s.twoMinActive ? '2-MINUTE DRILL' : (s.half === 1 ? 'FIRST HALF' : 'SECOND HALF');
    const halfColor = s.twoMinActive ? 'color:#e03050' : '';
    const clockText = fmtClock(Math.max(0, s.clockSeconds));
    const clockClass = s.twoMinActive ? 'T-sb-countdown T-sb-countdown-live' : 'T-sb-countdown';
    let centerHTML =
      `<div class="T-sb-half" style="${halfColor}">${halfName}</div>` +
      (s.twoMinActive ? '' : `<div class="T-sb-snap">${s.playsUsed}/20</div>`) +
      `<div class="${clockClass}">${clockText}</div>`;

    // Possession arrow: offset to the side, pointing toward the score
    const ctArrow = ctHasBall ? '<span class="T-sb-pos-arrow T-sb-pos-arrow-l">\u25B6</span>' : '';
    const irArrow = !ctHasBall ? '<span class="T-sb-pos-arrow T-sb-pos-arrow-r">\u25C0</span>' : '';

    // TORCH points — human team side
    const hTorchHTML = `<span class="T-sb-sit-torch">\uD83D\uDD25 ${hTorch}</span>`;
    const isHumanCT = hAbbr === 'CT';

    bug.innerHTML =
      `<div class="T-sb-row">` +
        `<div class="T-sb-icon">${ct.icon}</div>` +
        `<div class="T-sb-side${ctHasBall ? ' T-sb-side-glow' : ''}">` +
          `<div class="T-sb-name" style="color:${ct.accent}${ctHasBall ? ';text-shadow:0 0 12px '+ct.accent : ''}">${ct.name}</div>` +
          `<div class="T-sb-score-row">${ctArrow}<span class="T-sb-pts${ctHasBall ? ' T-sb-pts-glow' : ''}">${s.ctScore}</span></div>` +
        `</div>` +
        `<div class="T-sb-center">${centerHTML}</div>` +
        `<div class="T-sb-side${!ctHasBall ? ' T-sb-side-glow' : ''}">` +
          `<div class="T-sb-name" style="color:${ir.accent}${!ctHasBall ? ';text-shadow:0 0 12px '+ir.accent : ''}">${ir.name}</div>` +
          `<div class="T-sb-score-row">${irArrow}<span class="T-sb-pts${!ctHasBall ? ' T-sb-pts-glow' : ''}">${s.irScore}</span></div>` +
        `</div>` +
        `<div class="T-sb-icon">${ir.icon}</div>` +
      `</div>` +
      `<div class="T-sb-sit">` +
        (isHumanCT ? hTorchHTML + '<div class="T-sb-sit-div"></div>' : '') +
        `<div class="T-sb-sit-down">${dn} & ${s.distance}</div>` +
        `<div class="T-sb-sit-div"></div>` +
        `<div class="T-sb-sit-ball">BALL ON <span style="color:${possTeam.accent}">${ballLabel}</span></div>` +
        (!isHumanCT ? '<div class="T-sb-sit-div"></div>' + hTorchHTML : '') +
      `</div>`;
  }

  // ── FIELD STRIP ──
  const strip = document.createElement('div'); strip.className = 'T-strip'; el.appendChild(strip);
  function drawField() {
    const s = gs.getSummary();
    const isOff = gs.possession === hAbbr;
    const ct = getTeam('canyon_tech'), ir = getTeam('iron_ridge');
    const homeTeam = getTeam(GS.team);
    const lp = 7 + s.ballPosition * .86;
    const td = s.possession==='CT' ? s.ballPosition+s.distance : s.ballPosition-s.distance;
    const tp = 7 + Math.max(0,Math.min(100,td)) * .86;
    const pc = s.possession==='CT' ? ct.accent : ir.accent;
    // Turf texture
    let h = '<div class="T-field-turf"></div>';
    // Both endzones customized for home team
    var homeColor = homeTeam.color || '#FF5E1A';
    var homeMascot = GS.team === 'canyon_tech' ? 'CACTI' : 'TRIDENTS';
    h += '<div class="T-ez T-ez-l" style="background:' + homeColor + '"><span class="T-ez-text">' + homeMascot + '</span></div>';
    h += '<div class="T-ez T-ez-r" style="background:' + homeColor + '"><span class="T-ez-text">' + homeMascot + '</span></div>';
    // Home team logo at midfield (large, featured)
    h += '<div class="T-midfield-logo">' + homeTeam.icon + '</div>';
    // Yard lines with numbers at top AND bottom
    var yardNums = {10:'10',20:'20',30:'30',40:'40',50:'50',60:'40',70:'30',80:'20',90:'10'};
    for (let i=5;i<=95;i+=5) {
      var xp = 7+i*.86;
      if (i%10===0) {
        h += '<div class="T-yard" style="left:'+xp+'%"></div>';
        h += '<div class="T-yard-num T-yard-num-top" style="left:'+xp+'%">'+(yardNums[i]||'')+'</div>';
        h += '<div class="T-yard-num T-yard-num-bot" style="left:'+xp+'%">'+(yardNums[i]||'')+'</div>';
      } else {
        h += '<div class="T-yard-5" style="left:'+xp+'%"></div>';
      }
    }
    // Hash marks
    h += '<div class="T-hash" style="top:30%"></div><div class="T-hash" style="top:70%"></div>';
    // LOS and LTG
    h += `<div class="T-los" style="left:${lp}%;background:${pc};box-shadow:0 0 10px ${pc}"></div>`;
    h += `<div class="T-ltg" style="left:${tp}%;border-color:#c8a030"></div>`;

    // Drop zones — empty outlines for unfilled, actual card for filled
    // Drop zones — active one pulses to guide the player
    if (selPl) {
      h += `<div class="T-placed T-placed-play">${mkPlayCard(selPl)}</div>`;
    } else {
      h += '<div class="T-drop T-drop-play' + (phase==='play'?' T-drop-active':'') + '" data-drop="play"><span class="T-drop-lbl">PLAY</span></div>';
    }
    if (selP) {
      h += `<div class="T-placed T-placed-player">${mkPlayerCard(selP, hTeam, isOff)}</div>`;
    } else {
      h += '<div class="T-drop T-drop-player' + (phase==='player'?' T-drop-active':'') + '" data-drop="player"><span class="T-drop-lbl">PLAYER</span></div>';
    }
    if (selTorch) {
      var tc = TORCH_CARDS.find(function(c) { return c.id === selTorch; });
      var tName = tc ? tc.name : selTorch;
      h += '<div class="T-placed T-placed-torch" style="border-color:#c8a030;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6px">' +
        "<div style=\"font-family:'Bebas Neue';font-size:13px;color:#c8a030;text-align:center\">" + tName + "</div>" +
        "<div style=\"font-family:'Courier New';font-size:6px;color:#8a86b0;text-align:center\">TORCH</div></div>";
    } else {
      h += '<div class="T-drop T-drop-torch' + (phase==='torch'?' T-drop-active':'') + '" data-drop="torch"><span class="T-drop-lbl">TORCH</span></div>';
    }

    strip.innerHTML = h;
  }

  // ── PANEL ──
  const panel = document.createElement('div'); panel.className = 'T-panel'; el.appendChild(panel);

  // ── PLAY-BY-PLAY BOOTH (bottom third) ──
  const narr = document.createElement('div'); narr.className = 'T-narr';
  narr.innerHTML = '<div class="T-pbp-idle">...<span class="T-pbp-cursor"></span></div>';
  el.appendChild(narr);

  function setNarr(a, b) {
    narr.innerHTML = '<div class="T-pbp" style="padding:8px 14px"><div class="T-pbp-line T-pbp-live">' + a + '</div>' +
      (b ? '<div class="T-pbp-line" style="color:#554f80;font-size:11px">' + b + '</div>' : '') + '</div>';
    narr.scrollTop = narr.scrollHeight;
  }

  function ballSideLabel() {
    const s = gs.getSummary();
    const yds = s.yardsToEndzone;
    const possT = s.possession === 'CT' ? getTeam('canyon_tech') : getTeam('iron_ridge');
    const defT = s.possession === 'CT' ? getTeam('iron_ridge') : getTeam('canyon_tech');
    if (yds <= 50) return defT.abbr + ' ' + yds;
    return possT.abbr + ' ' + (100 - yds);
  }

  function showClashOnField(res) {
    var clash = document.createElement('div'); clash.className = 'T-clash';
    var offColor = '#c8a030';
    var defColor = '#e03050';
    var hasTorch = res.offCard || res.defCard;
    var torchCard = null;
    if (hasTorch) {
      var tcId = res.offCard || res.defCard;
      torchCard = TORCH_CARDS.find(function(c) { return c.id === tcId; });
    }

    // Left side: offense play + player stacked
    var leftHTML =
      '<div style="display:flex;flex-direction:column;gap:3px;align-items:center;width:36%">' +
        '<div class="T-clash-card" style="border-color:' + offColor + ';width:100%">' +
          "<div style=\"padding:3px 5px;font-family:'Bebas Neue';font-size:12px;color:#fff;line-height:1\">" + res.offPlay.name + "</div>" +
        '</div>' +
        '<div class="T-clash-card" style="border-color:' + offColor + '55;width:100%">' +
          "<div style=\"padding:3px 5px;font-family:'Bebas Neue';font-size:11px;color:" + offColor + ";line-height:1\">" + res.featuredOff.name + "</div>" +
          "<div style=\"padding:0 5px 2px;font-family:'Courier New';font-size:7px;color:#8a86b0\">" + res.featuredOff.pos + ' ' + res.featuredOff.ovr + "</div>" +
        '</div>' +
      '</div>';

    // Center: VS (or torch card overlay)
    var centerHTML;
    if (torchCard) {
      centerHTML =
        '<div style="display:flex;flex-direction:column;align-items:center;z-index:2">' +
          "<div style=\"font-family:'Press Start 2P';font-size:6px;color:#c8a030;margin-bottom:2px\">" + torchCard.tier + "</div>" +
          "<div style=\"background:#1a1030;border:2px solid #c8a030;border-radius:6px;padding:4px 8px;box-shadow:0 0 16px rgba(200,160,48,.4)\">" +
            "<div style=\"font-family:'Bebas Neue';font-size:14px;color:#c8a030;line-height:1;text-align:center\">" + torchCard.name + "</div>" +
          "</div>" +
          "<div style=\"font-family:'Courier New';font-size:6px;color:#c8a030;margin-top:2px\">TORCH</div>" +
        '</div>';
    } else {
      centerHTML = '<div class="T-clash-vs">VS</div>';
    }

    // Right side: defense play + player stacked
    var rightHTML =
      '<div style="display:flex;flex-direction:column;gap:3px;align-items:center;width:36%">' +
        '<div class="T-clash-card" style="border-color:' + defColor + ';width:100%">' +
          "<div style=\"padding:3px 5px;font-family:'Bebas Neue';font-size:12px;color:#fff;line-height:1\">" + res.defPlay.name + "</div>" +
        '</div>' +
        '<div class="T-clash-card" style="border-color:' + defColor + '55;width:100%">' +
          "<div style=\"padding:3px 5px;font-family:'Bebas Neue';font-size:11px;color:" + defColor + ";line-height:1\">" + res.featuredDef.name + "</div>" +
          "<div style=\"padding:0 5px 2px;font-family:'Courier New';font-size:7px;color:#8a86b0\">" + res.featuredDef.pos + ' ' + res.featuredDef.ovr + "</div>" +
        '</div>' +
      '</div>';

    clash.innerHTML = leftHTML + centerHTML + rightHTML;
    strip.appendChild(clash);
  }


  /** Animate torch points flying from commentary to scoreboard, then roll up the total */
  function animateTorchFly(sourceEl, pts) {
    if (!sourceEl) return;
    var srcRect = sourceEl.getBoundingClientRect();
    // Find the torch counter in the scoreboard
    var torchTarget = bug.querySelector('.T-sb-sit-torch');
    if (!torchTarget) return;
    var tgtRect = torchTarget.getBoundingClientRect();

    // Create flying element
    var fly = document.createElement('div');
    fly.className = 'T-torch-fly';
    fly.textContent = '\uD83D\uDD25 +' + pts;
    fly.style.left = srcRect.left + 'px';
    fly.style.top = srcRect.top + 'px';
    document.body.appendChild(fly);

    // Animate to target position
    var dx = tgtRect.left - srcRect.left;
    var dy = tgtRect.top - srcRect.top;
    fly.style.transition = 'all 0.6s cubic-bezier(0.2, 0.8, 0.3, 1)';
    requestAnimationFrame(function() {
      fly.style.left = tgtRect.left + 'px';
      fly.style.top = tgtRect.top + 'px';
      fly.style.opacity = '0.6';
      fly.style.transform = 'scale(0.7)';
    });

    // After fly arrives, roll up the number in the scoreboard
    setTimeout(function() {
      fly.remove();
      // Roll up the torch total — count from old to new
      var oldTotal = parseInt(torchTarget.textContent.replace(/[^\d]/g, '')) || 0;
      var newTotal = oldTotal + pts;
      var current = oldTotal;
      var step = Math.max(1, Math.ceil(pts / 15));
      var rollInterval = setInterval(function() {
        current += step;
        if (current >= newTotal) {
          current = newTotal;
          clearInterval(rollInterval);
        }
        torchTarget.innerHTML = '\uD83D\uDD25 ' + current;
        torchTarget.style.transform = 'scale(1.15)';
        torchTarget.style.textShadow = '0 0 8px #c8a030';
        setTimeout(function() {
          torchTarget.style.transform = 'scale(1)';
          torchTarget.style.textShadow = '';
        }, 80);
      }, 60);
    }, 650);
  }

  /** Screen shake */
  function shakeScreen() {
    el.classList.add('T-shaking');
    setTimeout(function() { el.classList.remove('T-shaking'); }, 500);
  }

  /** Color flash overlay on the field */
  function flashField(color) {
    var flash = document.createElement('div');
    flash.className = 'T-flash';
    flash.style.background = color;
    flash.style.animation = (color.indexOf('green') >= 0 || color.indexOf('3df') >= 0) ? 'T-flash-green .6s ease-out forwards' : 'T-flash-red .6s ease-out forwards';
    strip.appendChild(flash);
    setTimeout(function() { flash.remove(); }, 600);
  }

  /** Impact burst on the field */
  function impactBurst(color) {
    var imp = document.createElement('div');
    imp.className = 'T-impact';
    imp.style.background = color;
    imp.style.boxShadow = '0 0 30px ' + color;
    strip.appendChild(imp);
    setTimeout(function() { imp.remove(); }, 400);
  }

  /** Footballs raining from top of screen */
  function rainFootballs() {
    for (var i = 0; i < 12; i++) {
      var fb = document.createElement('div');
      fb.className = 'T-rain';
      fb.textContent = '\uD83C\uDFC8';
      fb.style.left = (5 + Math.random() * 90) + '%';
      fb.style.top = '-20px';
      fb.style.animationDelay = (Math.random() * 1.2) + 's';
      fb.style.animationDuration = (1.5 + Math.random() * 1) + 's';
      fb.style.fontSize = (12 + Math.floor(Math.random() * 10)) + 'px';
      el.appendChild(fb);
      (function(f) { setTimeout(function() { f.remove(); }, 3000); })(fb);
    }
  }

  /** Big text slam on field (INTERCEPTED, FUMBLE, etc.) */
  function slamText(text, color) {
    var crack = document.createElement('div');
    crack.className = 'T-crack';
    crack.innerHTML = '<div class="T-crack-text" style="color:' + color + '">' + text + '</div>';
    strip.appendChild(crack);
    setTimeout(function() {
      crack.style.transition = 'opacity .4s';
      crack.style.opacity = '0';
      setTimeout(function() { crack.remove(); }, 400);
    }, 1200);
  }

  /** Touchdown celebration — green flash + footballs + shake + slam */
  function celebrateTD() {
    shakeScreen();
    flashField('rgba(61,245,138,.5)');
    rainFootballs();
    setTimeout(function() { slamText('TOUCHDOWN', '#3df58a'); }, 200);
  }

  /** Turnover celebration — red flash + shake + slam */
  function celebrateTurnover(text) {
    shakeScreen();
    flashField('rgba(224,48,80,.5)');
    impactBurst('rgba(224,48,80,.6)');
    setTimeout(function() { slamText(text, '#e03050'); }, 150);
  }

  /** Sack celebration — shake + impact + slam */
  function celebrateSack() {
    shakeScreen();
    impactBurst('rgba(255,255,255,.4)');
    setTimeout(function() { slamText('SACK', '#e03050'); }, 100);
  }

  function runPlayByPlay(res, onDone) {
    const r = res.result;
    const off = res.featuredOff;
    const def = res.featuredDef;
    const op = res.offPlay;
    const dp = res.defPlay;
    const isPass = op.completionRate !== null;

    // All 4 starters on each side — featured players always mentioned but don't always take the action
    const sides = gs.getCurrentSides();
    const oStarters = sides.offPlayers.slice(0, 4);
    const dStarters = sides.defPlayers.slice(0, 4);
    const qb = oStarters.find(function(p) { return p.pos === 'QB'; }) || oStarters[0];
    // Other offensive skill players (not QB, not featured)
    const otherOff = oStarters.filter(function(p) { return p !== qb && p !== off; });
    const randOff = otherOff.length > 0 ? otherOff[Math.floor(Math.random() * otherOff.length)] : off;
    // Other defenders (not featured)
    const otherDef = dStarters.filter(function(p) { return p !== def; });
    const randDef = otherDef.length > 0 ? otherDef[Math.floor(Math.random() * otherDef.length)] : def;
    // The receiver/runner might be featured or might be another starter
    const receiver = (off.pos === 'QB') ? randOff : off;
    const runner = (off.pos === 'QB') ? randOff : off;
    // The tackler might be featured defender or another defensive starter
    const tackler = Math.random() < 0.6 ? def : randDef;

    showClashOnField(res);
    renderPBPLines(buildTemplateLines(), res, onDone);

    function buildTemplateLines() {
    const s = gs.getSummary();
    const possTeamName = s.possession === 'CT' ? 'Canyon Tech' : 'Iron Ridge';
    const defTeamName = s.possession === 'CT' ? 'Iron Ridge' : 'Canyon Tech';
    // Context line — only on significant football moments, not every play
    function contextLine() {
      // Always on scores
      if (r.isTouchdown) {
        var newScore = s.possession === 'CT' ? (s.ctScore) + ' to ' + s.irScore : s.ctScore + ' to ' + (s.irScore);
        return possTeamName + ' scores! It\'s ' + newScore;
      }
      // Always on turnovers
      if (r.isInterception) return 'Turnover! ' + defTeamName + ' takes over';
      if (r.isFumbleLost) return 'Turnover! ' + defTeamName + ' recovers';
      // Facing 4th down is significant
      if (s.down >= 3 && r.yards < s.distance) return 'They\'ll face fourth down now — big decision coming up';
      // Otherwise only occasionally — significant game situations
      if (s.playsUsed === 20) return 'That\'s play 20 — two-minute warning is next';
      if (s.yardsToEndzone <= 5 && r.yards >= 1) return 'Knocking on the door — inside the five';
      return '';
    }
    const lines = [];
    if (isPass) {
      // Line 1: play call + key personnel (always mention featured off)
      lines.push(op.name + ' is the call — ' + qb.name + ' under center, ' + off.name + ' key to the play');
      // Line 2: defense setup (always mention featured def)
      lines.push(dp.name + ' defense — ' + def.name + ' lined up at ' + def.pos + ', eyes on the backfield');
      // Line 3: snap
      lines.push(qb.name + ' takes the snap, drops back, looking...');
      if (r.isSack) {
        lines.push('PRESSURE off the edge! ' + off.name + ' can\'t pick up the block!');
        lines.push(tackler.name + ' is coming FREE!');
        lines.push('SACKED! ' + tackler.name + ' BURIES ' + qb.name + ' behind the line!');
        lines.push('That ' + dp.name + ' call was perfectly designed to get pressure');
        lines.push(qb.name + ' held the ball way too long and paid for it');
      } else if (r.isIncomplete) {
        lines.push(qb.name + ' fires toward ' + receiver.name + ' on the sideline');
        lines.push('Broken up! ' + tackler.name + ' was stride for stride with the receiver');
        lines.push('The ' + dp.name + ' coverage just smothered that route');
      } else if (r.isInterception) {
        lines.push(qb.name + ' loads up, throws for ' + receiver.name + '...');
        lines.push('OH! ' + def.name + ' jumps the route!');
        lines.push('PICKED OFF! ' + def.name + ' read that the ENTIRE way!');
        lines.push('What a TERRIBLE decision by ' + qb.name + ' — ' + def.name + ' was sitting on that route');
        lines.push('That could be a season-defining turnover right there');
      } else if (r.isTouchdown) {
        lines.push(qb.name + ' sees ' + receiver.name + ' breaking free...');
        lines.push('He lets it fly!');
        if (s.yardsToEndzone > 20) {
          lines.push(receiver.name + ' at the thirty, the twenty, the TEN...');
        }
        lines.push(receiver.name + ' CATCHES IT! TOUCHDOWN!');
        lines.push(tackler.name + ' was a step too late — that throw was PERFECT');
        lines.push(qb.name + ' to ' + receiver.name + ' — you cannot draw it up any better than that');
        lines.push(possTeamName + ' finds the end zone!');
      } else if (r.yards >= 15) {
        lines.push(qb.name + ' steps up in the pocket, launches it deep!');
        lines.push(receiver.name + ' goes up and GETS IT!');
        lines.push('HUGE play! ' + r.yards + ' yards! ' + tackler.name + ' got burned on that one!');
        lines.push(off.name + '\'s blocking gave ' + qb.name + ' all day to throw');
      } else if (r.yards >= 8) {
        lines.push(qb.name + ' finds ' + receiver.name + ' over the middle, fires!');
        lines.push('Complete for ' + r.yards + '! ' + tackler.name + ' makes the tackle after the catch');
        lines.push('Nice call with the ' + op.name + ' against that ' + dp.name + ' look');
      } else if (r.yards >= 1) {
        lines.push(qb.name + ' dumps it off to ' + receiver.name + ' in the flat');
        lines.push('Caught, gain of ' + r.yards + '. ' + tackler.name + ' wraps him up right away');
      } else {
        lines.push(qb.name + ' looks for ' + receiver.name + ' — nothing there');
        lines.push(def.name + ' had the coverage blanketed');
        lines.push('Throwaway. The ' + dp.name + ' defense took away everything');
      }
    } else {
      var isOption = op.playType === 'OPTION';
      var isSneakPlay = op.id === 'qb_sneak' || op.id === 'ir_qb_sneak';
      var ballCarrier = isSneakPlay ? qb : runner;
      // Line 1: play call + featured player's role
      lines.push(op.name + ' — ' + qb.name + ' under center, ' + off.name + ' lined up at ' + off.pos);
      // Line 2: defense (always mention featured def)
      lines.push(dp.name + ' — ' + def.name + ' reading the backfield from ' + def.pos);
      // Line 3: snap + handoff
      if (isOption) {
        lines.push(qb.name + ' takes the snap, reads the end... gives it to ' + runner.name + '!');
      } else if (isSneakPlay) {
        lines.push(qb.name + ' takes the snap and pushes forward behind the center...');
      } else {
        lines.push(qb.name + ' hands it off to ' + runner.name + '...');
      }
      if (r.isFumbleLost) {
        lines.push(ballCarrier.name + ' takes the hit...');
        lines.push('THE BALL IS OUT! IT\'S ON THE GROUND!');
        lines.push('Bodies diving for it!');
        lines.push(def.name + ' comes up with it! FUMBLE RECOVERY!');
        lines.push('A devastating turnover — ' + ballCarrier.name + ' just couldn\'t hold on');
      } else if (r.isTouchdown) {
        lines.push(ballCarrier.name + ' hits the hole and breaks through!');
        if (s.yardsToEndzone > 10) {
          lines.push('He\'s got daylight! To the twenty, the ten...');
          lines.push('NOBODY\'S GOING TO CATCH HIM!');
        } else {
          lines.push('Breaks a tackle at the five!');
        }
        lines.push('TOUCHDOWN! ' + ballCarrier.name + '!');
        lines.push(tackler.name + ' couldn\'t get an angle — the ' + op.name + ' was the perfect call');
        lines.push(possTeamName + ' scores! What a drive!');
      } else if (r.yards >= 15) {
        lines.push(ballCarrier.name + ' bounces it outside — daylight!');
        lines.push('He\'s got room to run! Into the second level!');
        lines.push(tackler.name + ' finally drags him down after ' + r.yards + ' yards!');
        lines.push('That ' + op.name + ' ripped right through the ' + dp.name + ' defense');
      } else if (r.yards >= 8) {
        lines.push(ballCarrier.name + ' finds a crease, sheds a tackler!');
        lines.push('Nice run — ' + r.yards + ' yards. ' + tackler.name + ' brings him down');
        lines.push(off.name + ' paved the way on that play');
      } else if (r.yards >= 1) {
        lines.push(ballCarrier.name + ' pushes into the pile, falls forward');
        lines.push('Gain of ' + r.yards + '. ' + tackler.name + ' cleans it up. Nothing fancy');
      } else {
        lines.push(def.name + ' shoots the gap!');
        lines.push('STUFFED! ' + tackler.name + ' had it read the whole way!');
        lines.push('The ' + dp.name + ' defense was built to stop exactly that');
      }
    }

    var ctx = contextLine();
    if (ctx) lines.push(ctx);
    return lines;
    } // end buildTemplateLines

    function renderPBPLines(lines, res, onDone) {
      const r = res.result;
      const resColor = r.isTouchdown?'#3df58a' : r.isSack||r.isInterception||r.isFumbleLost?'#e03050' : r.yards>=8?'#3df58a' : r.yards>=1?'#c8a030' : '#554f80';
      const yardLabel = r.isTouchdown?'TOUCHDOWN' : r.isSack?'SACK' : r.isInterception?'INTERCEPTED' : r.isFumbleLost?'FUMBLE LOST' : r.isIncomplete?'INCOMPLETE' : (r.yards>=0?'+':'')+r.yards+' YDS';
      const torchEarned = Math.floor((r.offComboPts || 0) + (r.defComboPts || 0));

      narr.innerHTML = '';
      const pbp = document.createElement('div'); pbp.className = 'T-pbp';
      narr.appendChild(pbp);
      let idx = 0;
      const cursor = document.createElement('span'); cursor.className = 'T-pbp-cursor';

      function showNext() {
        if (idx < lines.length) {
          if (cursor.parentNode) cursor.remove();
          pbp.querySelectorAll('.T-pbp-live').forEach(function(el) { el.classList.remove('T-pbp-live'); });
          const thinkLine = document.createElement('div');
          thinkLine.className = 'T-pbp-line T-pbp-live';
          thinkLine.textContent = '';
          thinkLine.appendChild(cursor);
          pbp.appendChild(thinkLine);
          narr.scrollTop = narr.scrollHeight;
          // Vary timing: setup lines slow, action fast, climax dramatic pause
          var pct = idx / lines.length; // 0 = first line, 1 = last
          var delay;
          if (pct < 0.3) delay = 900 + Math.floor(Math.random() * 600); // setup: measured
          else if (pct < 0.7) delay = 400 + Math.floor(Math.random() * 400); // action: fast
          else delay = 1000 + Math.floor(Math.random() * 800); // climax/analysis: dramatic
          setTimeout(function() {
            thinkLine.textContent = lines[idx];
            narr.scrollTop = narr.scrollHeight;
            idx++;
            var gap = pct < 0.7 ? 200 : 400; // faster between action lines
            setTimeout(showNext, gap);
          }, delay);
        } else {
          if (cursor.parentNode) cursor.remove();
          pbp.querySelectorAll('.T-pbp-live').forEach(function(el) { el.classList.remove('T-pbp-live'); });
          // Fire celebrations at the climax
          if (r.isTouchdown) celebrateTD();
          else if (r.isInterception) celebrateTurnover('INTERCEPTED');
          else if (r.isFumbleLost) celebrateTurnover('FUMBLE');
          else if (r.isSack) celebrateSack();
          else if (r.yards >= 15) { shakeScreen(); flashField('rgba(61,245,138,.3)'); }
          // Result: yards + torch (torch flies to scoreboard)
          const rl = document.createElement('div');
          rl.className = 'T-pbp-result';
          let parts = '<span style="color:' + resColor + '">' + yardLabel + '</span>';
          if (torchEarned > 0) {
            parts += '<span class="T-torch-src" style="color:#c8a030;margin-left:10px">\uD83D\uDD25 +' + torchEarned + '</span>';
          }
          rl.innerHTML = parts;
          pbp.appendChild(rl);
          // Animate torch points flying to scoreboard
          if (torchEarned > 0) {
            setTimeout(function() { animateTorchFly(rl.querySelector('.T-torch-src'), torchEarned); }, 400);
          }
          // TORCH points explanation
          if (torchEarned !== 0) {
            var reasons = [];
            if (r.isTouchdown) reasons.push('Touchdown +50');
            else if (r.isSack) reasons.push('Sack allowed -10');
            else if (r.isInterception || r.isFumbleLost) reasons.push('Turnover -25');
            else if (r.isIncomplete) reasons.push('Incompletion -5');
            else if (r.yards >= 8) reasons.push('Big gain +30');
            else if (r.yards >= 4) reasons.push('Solid gain +10');
            else if (r.yards <= 0) reasons.push('No gain -10');
            if (r.offComboPts > 0) reasons.push('Badge combo +' + Math.floor(r.offComboPts));
            if (r.defComboPts > 0) reasons.push('Def combo +' + Math.floor(r.defComboPts));
            if (r.historyBonus > 0) reasons.push('Play mix bonus');
            if (r.historyBonus < -2) reasons.push('Predictable play call');
            if (res.gotFirstDown) reasons.push('First down +10');
            var torchExpl = document.createElement('div');
            torchExpl.style.cssText = "font-family:'Courier New';font-size:9px;color:#8a86b0;margin-top:4px;line-height:1.4";
            torchExpl.textContent = reasons.join(' \u00b7 ');
            pbp.appendChild(torchExpl);
          }
          // Down & distance
          const s2 = gs.getSummary();
          const dn2 = ['','1ST','2ND','3RD','4TH'][s2.down]||'';
          const dd = document.createElement('div');
          dd.className = 'T-pbp-down';
          if (r.isTouchdown) {
            dd.textContent = 'TOUCHDOWN \u2014 CONVERSION ATTEMPT';
          } else if (r.isInterception || r.isFumbleLost) {
            dd.textContent = 'TURNOVER \u2014 BALL ON ' + ballSideLabel();
          } else {
            dd.textContent = dn2 + ' & ' + s2.distance + ' \u2014 BALL ON ' + ballSideLabel();
          }
          pbp.appendChild(dd);
          // NEXT PLAY button (btn-blitz style)
          var nextBtn = document.createElement('button');
          nextBtn.className = 'btn-blitz';
          nextBtn.style.cssText = 'background:var(--cyan);border-color:var(--cyan);color:#000;font-size:14px;margin-top:10px;box-shadow:6px 6px 0 #006a77, 10px 10px 0 #000;';
          nextBtn.textContent = 'NEXT PLAY \u2192';
          nextBtn.onclick = function() {
            SND.click();
            nextBtn.remove();
            narr.innerHTML = '<div class="T-pbp-idle">...<span class="T-pbp-cursor"></span></div>';
            var clashEl = strip.querySelector('.T-clash');
            if (clashEl) clashEl.remove();
            onDone();
          };
          pbp.appendChild(nextBtn);
          // Extra padding so button isn't clipped by box-shadow
          var spacer = document.createElement('div');
          spacer.style.height = '20px';
          pbp.appendChild(spacer);
          // Scroll after paint to ensure button is visible
          requestAnimationFrame(function() {
            narr.scrollTop = narr.scrollHeight;
          });
        }
      }
      showNext();
    }
  }

  // ── DRAG HANDLING ──
  let dragItem = null; // { type:'player'|'play', data: obj, ghost: el }

  function startDrag(type, data, sourceEl, e) {
    if (phase === 'busy') return;
    var touch = e.touches ? e.touches[0] : e;
    var rect = sourceEl.getBoundingClientRect();
    var ghost = sourceEl.cloneNode(true);
    ghost.className = 'T-drag-ghost';
    ghost.style.width = rect.width + 'px';
    ghost.style.left = (touch.clientX - rect.width/2) + 'px';
    ghost.style.top = (touch.clientY - rect.height/2) + 'px';
    document.body.appendChild(ghost);
    dragItem = { type: type, data: data, ghost: ghost };
    sourceEl.style.opacity = '0.3';
    dragItem._source = sourceEl;
  }

  function moveDrag(e) {
    if (!dragItem) return;
    e.preventDefault();
    var touch = e.touches ? e.touches[0] : e;
    dragItem.ghost.style.left = (touch.clientX - dragItem.ghost.offsetWidth/2) + 'px';
    dragItem.ghost.style.top = (touch.clientY - dragItem.ghost.offsetHeight/2) + 'px';
    // Highlight matching drop zone
    var drops = strip.querySelectorAll('.T-drop');
    drops.forEach(function(dz) {
      var r = dz.getBoundingClientRect();
      var over = touch.clientX >= r.left && touch.clientX <= r.right && touch.clientY >= r.top && touch.clientY <= r.bottom;
      dz.classList.toggle('T-drop-hover', over && dz.dataset.drop === dragItem.type);
    });
  }

  function endDrag(e) {
    if (!dragItem) return;
    var touch = e.changedTouches ? e.changedTouches[0] : e;
    dragItem.ghost.remove();
    if (dragItem._source) dragItem._source.style.opacity = '';
    // Check if dropped on matching zone
    var drops = strip.querySelectorAll('.T-drop');
    drops.forEach(function(dz) {
      dz.classList.remove('T-drop-hover');
      var r = dz.getBoundingClientRect();
      var hit = touch.clientX >= r.left && touch.clientX <= r.right && touch.clientY >= r.top && touch.clientY <= r.bottom;
      if (hit && dz.dataset.drop === dragItem.type) {
        SND.click();
        if (dragItem.type === 'play') { selPl = dragItem.data; phase = 'player'; }
        else if (dragItem.type === 'player') { selP = dragItem.data; phase = gs.humanTorchCards.length > 0 ? 'torch' : 'ready'; }
        else if (dragItem.type === 'torch') {
          selTorch = dragItem.data.id;
          gs.humanTorchCards.splice(dragItem.data._idx, 1);
          phase = 'ready';
        }
        drawField();
        drawPanel();
      }
    });
    dragItem = null;
  }

  document.addEventListener('mousemove', moveDrag);
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchmove', moveDrag, { passive: false });
  document.addEventListener('touchend', endDrag);

  // ── RENDER PANEL ──
  function drawPanel() {
    panel.innerHTML = '';
    const isOff = gs.possession === hAbbr;
    const sides = gs.getCurrentSides();
    const players = isOff ? sides.offPlayers.slice(0,4) : sides.defPlayers.slice(0,4);
    const plays = isOff ? sides.offHand : sides.defHand;
    // Hide panel during play-by-play so commentary sits directly under field
    if (phase === 'busy') { panel.className = 'T-panel T-panel-hidden'; return; }
    panel.className = 'T-panel ' + (isOff ? 'T-panel-off' : 'T-panel-def');

    // 2min check
    if (gs.twoMinActive && !prev2min) { prev2min = true; el.classList.add('T-urgent'); show2MinWarn(); }

    // Instruction
    const inst = document.createElement('div'); inst.className = 'T-inst';
    inst.style.color = isOff ? '#c8a030' : '#30c0e0';
    if (phase === 'play') inst.textContent = isOff ? 'Drag a play onto the field' : 'Drag a scheme onto the field';
    else if (phase === 'player') inst.textContent = 'Drag a player onto the field';
    else if (phase === 'torch') inst.textContent = 'Play a Torch card or skip';
    else if (phase === 'ready') inst.textContent = '';
    panel.appendChild(inst);

    // Card tray — show one card type at a time based on phase
    const tray = document.createElement('div'); tray.className = 'T-tray';

    if (phase === 'play') {
      plays.forEach(play => {
        const isSel = selPl === play;
        const c = document.createElement('div');
        c.className = 'T-card' + (isSel ? ' T-card-gone' : '');
        c.style.border = '2px solid ' + (isSel ? '#00ff8844' : '#1a183a');
        c.innerHTML = mkPlayCard(play);
        c.onclick = () => { if (phase==='busy') return; SND.click(); selPl = play; phase = 'player'; drawField(); drawPanel(); };
        c.onmousedown = function(e) { startDrag('play', play, c, e); };
        c.ontouchstart = function(e) { startDrag('play', play, c, e); };
        tray.appendChild(c);
      });
    } else if (phase === 'player') {
      players.forEach(p => {
        const isSel = selP === p;
        const tc = tierColor(p.ovr);
        const c = document.createElement('div');
        c.className = 'T-card' + (isSel ? ' T-card-gone' : '') + (p.injured ? ' T-card-hurt' : '');
        c.style.border = '2px solid ' + (isSel ? '#00ff8844' : tc + '44');
        c.innerHTML = mkPlayerCard(p, hTeam, isOff);
        c.onclick = () => {
          if (p.injured || phase==='busy') return; SND.click(); selP = p;
          phase = gs.humanTorchCards.length > 0 ? 'torch' : 'ready';
          drawField(); drawPanel();
        };
        c.onmousedown = function(e) { if (!p.injured) startDrag('player', p, c, e); };
        c.ontouchstart = function(e) { if (!p.injured) startDrag('player', p, c, e); };
        tray.appendChild(c);
      });
    } else if (phase === 'torch') {
      // Show torch cards from inventory
      gs.humanTorchCards.forEach(function(cardId, i) {
        var tc = TORCH_CARDS.find(function(c) { return c.id === cardId; });
        if (!tc) return;
        var tierCol = tc.tier === 'GOLD' ? '#c8a030' : tc.tier === 'SILVER' ? '#aaa' : '#CD7F32';
        var c = document.createElement('div');
        c.className = 'T-card';
        c.style.border = '2px solid ' + tierCol + '44';
        c.innerHTML =
          "<div style=\"padding:8px 8px 4px\">" +
            "<div style=\"font-family:'Courier New';font-size:7px;font-weight:bold;color:" + tierCol + ";letter-spacing:1px\">" + tc.tier + "</div>" +
            "<div style=\"font-family:'Bebas Neue';font-size:16px;color:#fff;line-height:1;margin-top:2px\">" + tc.name + "</div>" +
          "</div>" +
          "<div style=\"flex:1;padding:4px 8px;font-family:'Courier New';font-size:9px;color:#8a86b0;line-height:1.3\">" + tc.effect + "</div>";
        c.onclick = function() {
          SND.click();
          selTorch = cardId;
          // Remove from inventory (single use)
          gs.humanTorchCards.splice(i, 1);
          phase = 'ready';
          drawField(); drawPanel();
        };
        c.onmousedown = function(e) { startDrag('torch', { id: cardId, name: tc.name, _idx: i }, c, e); };
        c.ontouchstart = function(e) { startDrag('torch', { id: cardId, name: tc.name, _idx: i }, c, e); };
        tray.appendChild(c);
      });
      // Skip button
      var skipBtn = document.createElement('div');
      skipBtn.className = 'T-card';
      skipBtn.style.cssText = 'border:2px dashed #554f8044;display:flex;align-items:center;justify-content:center;cursor:pointer;';
      skipBtn.innerHTML = "<div style=\"font-family:'Press Start 2P';font-size:7px;color:#554f80;text-align:center\">SKIP<br>TORCH</div>";
      skipBtn.onclick = function() { SND.click(); phase = 'ready'; drawField(); drawPanel(); };
      tray.appendChild(skipBtn);
    }
    panel.appendChild(tray);

    // Snap bar — only appears when both cards placed
    if (phase === 'ready') {
      const sz = document.createElement('div'); sz.className = 'T-snap';

      if (gs.twoMinActive) {
        const btns = document.createElement('div'); btns.className = 'T-2btns';
        const spk = document.createElement('button'); spk.className = 'T-2btn T-spike'; spk.textContent = 'SPIKE';
        spk.onclick = () => { SND.click(); gs.spike(); selP=null;selPl=null;phase='play'; drawBug();drawField(); setNarr('Ball spiked.',fmtClock(Math.max(0,gs.clockSeconds))+' left'); if(!checkEnd()) drawPanel(); };
        btns.appendChild(spk);
        const hS = hAbbr==='CT'?gs.ctScore:gs.irScore, cS = hAbbr==='CT'?gs.irScore:gs.ctScore;
        if (hS > cS && isOff) {
          const kn = document.createElement('button'); kn.className = 'T-2btn T-kneel'; kn.textContent = 'KNEEL';
          kn.onclick = () => { SND.click(); gs.kneel(); selP=null;selPl=null;phase='play'; drawBug();drawField(); setNarr('QB kneels.',fmtClock(Math.max(0,gs.clockSeconds))+' left'); if(!checkEnd()) drawPanel(); };
          btns.appendChild(kn);
        }
        sz.appendChild(btns);
      }

      const go = document.createElement('button');
      go.className = 'btn-blitz';
      go.style.cssText = 'background:var(--a-gold);border-color:var(--a-gold);color:#000;font-size:16px;animation:T-pulse 1.8s ease-in-out infinite;';
      go.textContent = conversionMode ? 'ATTEMPT' : 'SNAP';
      go.onclick = conversionMode ? () => doConversionSnap() : () => doSnap();
      sz.appendChild(go);
      panel.appendChild(sz);
    }
  }

  // ── SNAP ──
  function doSnap() {
    phase = 'busy';
    const isOff = gs.possession === hAbbr;
    const prevPoss = gs.possession;
    const offCard = isOff ? selTorch : null;
    const defCard = isOff ? null : selTorch;
    const res = isOff ? gs.executeSnap(selPl, selP, null, null, offCard, defCard) : gs.executeSnap(null, null, selPl, selP, offCard, defCard);
    driveSnaps.push(res);
    selP = null; selPl = null; selTorch = null;

    // Update field/scorebug immediately, then play-by-play in bottom third
    drawBug(); drawField(); drawPanel();
    runPlayByPlay(res, () => {
      if (res.gameEvent === 'touchdown') { showConv(res.scoringTeam); return; }
      if (posChanged(res.gameEvent, prevPoss)) {
        showPossCut(res.gameEvent, () => { showDrive(driveSnaps, prevPoss, () => { driveSnaps=[]; if(!checkEnd()) nextSnap(); }); });
      } else { if(!checkEnd()) nextSnap(); }
    });
  }

  function nextSnap() {
    phase = 'play';
    selP = null; selPl = null; selTorch = null;
    drawBug(); drawField(); drawPanel();
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
  var conversionMode = null; // null or {choice:'2pt'|'3pt', team:'CT'|'IR'}

  function showConv(team) {
    const isH = team === hAbbr;
    if (!isH) {
      gs.handleConversion('xp'); drawBug();
      setNarr('Extra point is good.', '+1 point');
      showPossCut('score', () => { showDrive(driveSnaps, team, () => { driveSnaps=[]; if(!checkEnd()) nextSnap(); }); });
      return;
    }
    // Show conversion choice in the panel
    panel.className = 'T-panel T-panel-off';
    panel.innerHTML = '';
    var inst = document.createElement('div'); inst.className = 'T-inst';
    inst.style.color = '#3df58a';
    inst.textContent = 'TOUCHDOWN! CHOOSE CONVERSION';
    panel.appendChild(inst);

    var w = document.createElement('div');
    w.style.cssText = 'display:flex;flex-direction:column;gap:8px;padding:8px;';

    [{id:'xp',lbl:'EXTRA POINT',sub:'+1 (automatic)',col:'#3df58a'},
     {id:'2pt',lbl:'2-POINT CONVERSION',sub:'+2 from the 5 yard line',col:'#c8a030'},
     {id:'3pt',lbl:'3-POINT CONVERSION',sub:'+3 from the 10 yard line',col:'#e03050'}].forEach(function(c) {
      var b = document.createElement('button');
      b.className = 'btn-blitz';
      b.style.cssText = 'background:transparent;color:' + c.col + ';border-color:' + c.col + ';font-size:11px;box-shadow:4px 4px 0 ' + c.col + '44, 6px 6px 0 #000;';
      b.innerHTML = c.lbl + '<br><span style="font-size:7px;color:#554f80">' + c.sub + '</span>';
      b.onclick = function() {
        SND.snap();
        if (c.id === 'xp') {
          gs.handleConversion('xp'); drawBug();
          setNarr('Extra point is GOOD!', '+1 point');
          showPossCut('score', function() { showDrive(driveSnaps, team, function() { driveSnaps=[]; if(!checkEnd()) nextSnap(); }); });
        } else {
          // Enter card selection for 2pt/3pt conversion
          conversionMode = { choice: c.id, team: team };
          setNarr(c.lbl + ' attempt', 'Select your play, player, and snap');
          phase = 'play';
          drawField(); drawPanel();
        }
      };
      w.appendChild(b);
    });
    panel.appendChild(w);
  }

  function doConversionSnap() {
    phase = 'busy';
    var cm = conversionMode;
    var offPlay = selPl;
    var featuredOff = selP;
    var r = gs.handleConversion(cm.choice, offPlay, featuredOff);
    conversionMode = null;
    selP = null; selPl = null; selTorch = null;
    drawBug(); drawField(); drawPanel();

    var resultText = r.success ? cm.choice.toUpperCase() + ' CONVERSION GOOD! +' + r.points : cm.choice.toUpperCase() + ' CONVERSION NO GOOD';
    var resultColor = r.success ? '#3df58a' : '#e03050';
    if (r.success) { shakeScreen(); flashField('rgba(61,245,138,.3)'); }

    setNarr(resultText, r.success ? 'Points on the board!' : 'Failed conversion');
    setTimeout(function() {
      showPossCut('score', function() { showDrive(driveSnaps, cm.team, function() { driveSnaps=[]; if(!checkEnd()) nextSnap(); }); });
    }, 1500);
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
        phase = 'play';
        drawPanel();
      });
    });
  } else {
    drawPanel();
  }

  return el;
}
