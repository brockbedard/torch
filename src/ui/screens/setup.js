import { SND } from '../../engine/sound.js';
import { GS, setGs } from '../../state.js';
import { TEAMS } from '../../data/teams.js';
import { buildDraftProgress } from '../components/draftProgress.js';

/* ═══════════════════════════════════════════
   SVG ASSETS (coaches + stadiums)
   ═══════════════════════════════════════════ */

const SVG_CT_COACH = `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="108" rx="35" ry="12" fill="#1a0800" opacity=".3"/>
  <path d="M35,65 L30,110 L70,110 L65,65 Z" fill="#e05a10"/>
  <path d="M42,65 L45,75 L55,75 L58,65" fill="#cc4a00"/>
  <path d="M30,80 L15,95 L20,100 L35,88" fill="#e05a10"/>
  <path d="M70,75 L90,65 L92,70 L73,82" fill="#e05a10"/>
  <circle cx="50" cy="45" r="22" fill="#d4a574"/>
  <ellipse cx="50" cy="40" rx="24" ry="10" fill="#3a2010"/>
  <rect x="36" y="38" width="12" height="5" rx="2" fill="#111" opacity=".8"/>
  <rect x="52" y="38" width="12" height="5" rx="2" fill="#111" opacity=".8"/>
  <line x1="36" y1="40" x2="32" y2="38" stroke="#111" stroke-width="1.5"/>
  <line x1="64" y1="40" x2="68" y2="38" stroke="#111" stroke-width="1.5"/>
  <path d="M44,55 Q50,62 56,55" stroke="#8a4020" stroke-width="2" fill="#6a2010"/>
  <path d="M47,73 L47,65 L53,65 L53,73" fill="#d4a574"/>
</svg>`;

const SVG_IR_COACH = `<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="108" rx="38" ry="12" fill="#000a1a" opacity=".3"/>
  <path d="M28,68 L22,112 L78,112 L72,68 Z" fill="#1a2a4a"/>
  <path d="M40,68 L42,78 L58,78 L60,68" fill="#0a1a3a"/>
  <path d="M30,78 Q38,95 45,88 L42,78 L30,78 Z" fill="#1a2a4a"/>
  <path d="M70,78 Q62,95 55,88 L58,78 L70,78 Z" fill="#1a2a4a"/>
  <line x1="35" y1="82" x2="65" y2="82" stroke="#0a1a3a" stroke-width="1"/>
  <circle cx="50" cy="45" r="22" fill="#c49a70"/>
  <rect x="34" y="26" width="32" height="10" rx="1" fill="#2a1a0a"/>
  <rect x="36" y="24" width="28" height="4" fill="#2a1a0a"/>
  <circle cx="42" cy="42" r="2.5" fill="#1a1a1a"/>
  <circle cx="58" cy="42" r="2.5" fill="#1a1a1a"/>
  <line x1="36" y1="39" x2="46" y2="40" stroke="#2a1a0a" stroke-width="2.5"/>
  <line x1="54" y1="40" x2="64" y2="39" stroke="#2a1a0a" stroke-width="2.5"/>
  <line x1="44" y1="55" x2="56" y2="55" stroke="#7a5a3a" stroke-width="2"/>
  <path d="M47,70 L47,65 L53,65 L53,70" fill="#c49a70"/>
</svg>`;

const SVG_CT_STADIUM = `<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="90" fill="#1a0800"/>
  <path d="M0,20 Q50,0 100,5 Q150,0 200,20 L200,50 L0,50 Z" fill="#cc4a00" opacity=".25"/>
  <path d="M0,30 Q50,12 100,16 Q150,12 200,30 L200,50 L0,50 Z" fill="#e05a10" opacity=".2"/>
  <rect x="10" y="50" width="180" height="35" rx="2" fill="#1a5a1a"/>
  <line x1="50" y1="50" x2="50" y2="85" stroke="#2a7a2a" stroke-width=".5" opacity=".5"/>
  <line x1="100" y1="50" x2="100" y2="85" stroke="#2a7a2a" stroke-width=".5" opacity=".5"/>
  <line x1="150" y1="50" x2="150" y2="85" stroke="#2a7a2a" stroke-width=".5" opacity=".5"/>
  <path d="M5,85 L5,78 L8,75 L5,78" stroke="#3a6a2a" stroke-width="1.5" fill="none"/>
  <path d="M195,85 L195,78 L192,75 L195,78" stroke="#3a6a2a" stroke-width="1.5" fill="none"/>
  <rect x="0" y="85" width="200" height="5" fill="#0a0400"/>
</svg>`;

const SVG_IR_STADIUM = `<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="90" fill="#060a14"/>
  <path d="M0,18 Q50,2 100,6 Q150,2 200,18 L200,50 L0,50 Z" fill="#1a2a4a" opacity=".3"/>
  <path d="M0,28 Q50,14 100,18 Q150,14 200,28 L200,50 L0,50 Z" fill="#0a1a3a" opacity=".25"/>
  <rect x="10" y="50" width="180" height="35" rx="2" fill="#0a2a0a"/>
  <line x1="50" y1="50" x2="50" y2="85" stroke="#1a3a1a" stroke-width=".5" opacity=".4"/>
  <line x1="100" y1="50" x2="100" y2="85" stroke="#1a3a1a" stroke-width=".5" opacity=".4"/>
  <line x1="150" y1="50" x2="150" y2="85" stroke="#1a3a1a" stroke-width=".5" opacity=".4"/>
  <rect x="15" y="10" width="4" height="40" fill="#2a3a5a" opacity=".3"/>
  <rect x="55" y="5" width="4" height="45" fill="#2a3a5a" opacity=".3"/>
  <rect x="141" y="5" width="4" height="45" fill="#2a3a5a" opacity=".3"/>
  <rect x="181" y="10" width="4" height="40" fill="#2a3a5a" opacity=".3"/>
  <rect x="0" y="85" width="200" height="5" fill="#020610"/>
</svg>`;

/* ═══════════════════════════════════════════
   EXTENDED TEAM DATA
   ═══════════════════════════════════════════ */
const XDATA = {
  canyon_tech: {
    coach: 'COACH RICKY VANCE', quote: '"If we\'re not scoring, we\'re not trying."',
    motto: 'BURN THE COVERAGE', est: 'Est. 1974 \u2014 3x Conf. Champs',
    sigPlay: 'FOUR VERTS', starPlayers: 'Avery 78 QB \u00b7 Vasquez 82 SLOT',
    stadium: 'THE FURNACE',
    ratings: { OFF:4, DEF:3, SPD:5, TGH:2, OVR:4 },
    coachSvg: SVG_CT_COACH, stadiumSvg: SVG_CT_STADIUM,
  },
  iron_ridge: {
    coach: 'COACH DALE BURRIS', quote: '"You don\'t need to throw. You need to want it more."',
    motto: 'CONTROL THE LINE', est: 'Est. 1961 \u2014 5x Conf. Champs',
    sigPlay: 'TRIPLE OPTION', starPlayers: 'Kendrick 80 QB \u00b7 Torres 82 FB',
    stadium: 'THE FORGE',
    ratings: { OFF:3, DEF:4, SPD:2, TGH:5, OVR:4 },
    coachSvg: SVG_IR_COACH, stadiumSvg: SVG_IR_STADIUM,
  },
};

function starStr(n) { var s=''; for(var i=0;i<5;i++) s += i<n?'\u2605':'\u2606'; return s; }

/* ═══════════════════════════════════════════
   BUILD
   ═══════════════════════════════════════════ */
export function buildSetup() {
  var selTeam = GS.team;
  if (!GS.difficulty) GS.difficulty = 'MEDIUM';
  var selDiff = GS.difficulty;

  var el = document.createElement('div');
  el.className = 'sup';
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:var(--bg);';

  // ── Progress bar (step 1) ──
  el.appendChild(buildDraftProgress(1));

  // ── Header bar (matches draft/cardDraft pattern) ──
  var hdr = document.createElement('div');
  hdr.style.cssText =
    'background:rgba(0,0,0,0.5);padding:10px 14px;display:flex;justify-content:space-between;' +
    'align-items:center;flex-shrink:0;border-bottom:2px solid var(--f-purple);';

  var hdrTitle = document.createElement('div');
  hdrTitle.style.cssText =
    'display:flex;align-items:baseline;gap:0;font-style:italic;transform:skewX(-10deg);';
  var hdrName = document.createElement('span');
  hdrName.style.cssText =
    "font-family:'Bebas Neue',sans-serif;font-size:24px;color:var(--a-gold);" +
    "letter-spacing:2px;text-shadow:2px 2px 0 #000, 0 0 10px var(--a-gold);";
  hdrName.textContent = 'TORCH';
  var hdrSub = document.createElement('span');
  hdrSub.style.cssText =
    "font-family:'Bebas Neue',sans-serif;font-size:16px;color:var(--muted);" +
    "letter-spacing:1px;margin-left:6px;";
  hdrSub.textContent = '\u00b7 TEAM SELECT';
  hdrTitle.append(hdrName, hdrSub);
  hdr.appendChild(hdrTitle);

  var backBtn = document.createElement('button');
  backBtn.style.cssText =
    "font-family:'Press Start 2P',monospace;font-size:8px;padding:10px 16px;" +
    "cursor:pointer;background:#000;color:var(--white);border:2px solid #333;";
  backBtn.textContent = '\u2190 BACK';
  backBtn.onclick = function() { SND.click(); setGs(null); };
  hdr.appendChild(backBtn);
  el.appendChild(hdr);

  // ── Content (fills remaining space) ──
  var content = document.createElement('div');
  content.style.cssText =
    'flex:1;overflow-y:auto;padding:10px 14px;display:flex;flex-direction:column;gap:8px;';

  // Section header
  var teamTitle = document.createElement('div');
  teamTitle.className = 'chrome-header';
  teamTitle.style.cssText = 'font-size:22px;margin-bottom:4px;';
  teamTitle.textContent = 'SELECT YOUR TEAM';
  content.appendChild(teamTitle);

  // Difficulty row (compact)
  var diffRow = document.createElement('div');
  diffRow.style.cssText = 'display:flex;gap:8px;margin-bottom:6px;';
  var diffs = [
    { id:'EASY', color:'var(--l-green)', glow:'rgba(0,255,68,0.4)' },
    { id:'MEDIUM', color:'var(--a-gold)', glow:'rgba(255,204,0,0.4)' },
    { id:'HARD', color:'var(--p-red)', glow:'rgba(255,0,64,0.4)' },
  ];
  function refreshDiffs() {
    diffRow.innerHTML = '';
    diffs.forEach(function(d) {
      var isSel = selDiff === d.id;
      var opt = document.createElement('button');
      opt.className = 'btn-blitz';
      opt.style.cssText = 'flex:1;font-size:10px;text-align:center;padding:10px 2px;' +
        (isSel
          ? 'background:'+d.color+';color:#000;border-color:'+d.color+';box-shadow:0 0 15px '+d.glow+';'
          : 'background:transparent;border-color:'+d.color+';color:'+d.color+';opacity:0.5;');
      opt.textContent = d.id;
      opt.onclick = function() { SND.select(); selDiff=d.id; GS.difficulty=d.id; refreshDiffs(); refreshGo(); };
      diffRow.appendChild(opt);
    });
  }
  content.appendChild(diffRow);

  // Team cards (stacked, each fills ~half remaining space)
  var teamGrid = document.createElement('div');
  teamGrid.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:8px;';

  function ratingRow(label, val, color) {
    return '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">' +
      "<span style=\"font-family:'Courier New';font-size:9px;font-weight:bold;color:#8a86b0\">" + label + "</span>" +
      "<span style=\"font-family:'Courier New';font-size:11px;color:"+color+";letter-spacing:-1px\">" + starStr(val) + "</span>" +
    '</div>';
  }

  function refreshTeams() {
    teamGrid.innerHTML = '';
    TEAMS.forEach(function(team) {
      var isSel = selTeam === team.id;
      var x = XDATA[team.id];

      var card = document.createElement('div');
      card.style.cssText =
        'flex:1;background:var(--bg-surface);position:relative;' +
        'border:2px solid ' + (isSel ? '#00ff88' : team.accent+'44') + ';' +
        'border-radius:8px;cursor:pointer;overflow:hidden;' +
        'transition:all 0.15s ease;display:flex;flex-direction:column;' +
        'opacity:' + (isSel ? '1' : '0.8') + ';' +
        (isSel
          ? 'box-shadow:0 0 20px rgba(0,255,136,0.35), inset 0 0 12px rgba(0,255,136,0.08);'
          : 'box-shadow:0 4px 20px rgba(0,0,0,0.5);');

      if (isSel) {
        var bar = document.createElement('div');
        bar.style.cssText = 'position:absolute;top:0;left:50%;transform:translateX(-50%);width:36px;height:3px;background:#00ff88;border-radius:0 0 3px 3px;z-index:3;';
        card.appendChild(bar);
      }

      // ── TOP HALF: Team identity ──
      var top = document.createElement('div');
      top.style.cssText =
        'display:flex;gap:10px;padding:10px 12px 8px;' +
        (isSel ? 'background:linear-gradient(180deg, rgba(0,255,136,0.08) 0%, transparent 100%);' : '');

      // Icon + coach
      top.innerHTML =
        '<div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:2px;width:60px;">' +
          '<div style="font-size:44px;line-height:1;filter:drop-shadow(0 0 12px '+team.accent+')">' + team.icon + '</div>' +
          '<div style="width:44px;height:52px">' + x.coachSvg + '</div>' +
        '</div>' +
        '<div style="flex:1;min-width:0">' +
          // Big team name
          "<div style=\"font-family:'Bebas Neue';font-size:26px;color:"+team.accent+";line-height:1;letter-spacing:2px;" +
          (isSel ? "text-shadow:0 0 12px "+team.accent+";" : "") +
          "\">" + team.name + " " + (team.id==='canyon_tech'?'CACTI':'TRIDENTS') + "</div>" +
          // Coach + quote
          "<div style=\"font-family:'Courier New';font-size:8px;font-weight:bold;color:"+team.accent+";margin-top:3px\">" + x.coach + "</div>" +
          "<div style=\"font-family:'Barlow Condensed';font-size:12px;font-style:italic;color:"+team.accent+";opacity:.6;line-height:1.2\">" + x.quote + "</div>" +
          // Scheme + details
          "<div style=\"font-family:'Courier New';font-size:8px;color:"+team.accent+";opacity:.5;margin-top:4px;line-height:1.5\">" +
            team.style + " OFFENSE \u00b7 " + team.defStyle + " DEFENSE<br>" +
            "<span style='font-weight:bold;opacity:1'>" + x.motto + "</span> \u00b7 " + x.est + "<br>" +
            "Sig: " + x.sigPlay + " \u00b7 " + x.starPlayers +
          "</div>" +
        '</div>';
      card.appendChild(top);

      // ── BOTTOM HALF: Stadium + Ratings ──
      var botWrap = document.createElement('div');
      botWrap.style.cssText =
        'flex:1;padding:6px 12px 8px;border-top:1px solid rgba(255,255,255,0.04);' +
        'display:flex;flex-direction:column;justify-content:center;gap:4px;';

      // Stadium
      botWrap.innerHTML =
        '<div style="width:100%;height:30px;border-radius:4px;overflow:hidden">' + x.stadiumSvg + '</div>' +
        "<div style=\"font-family:'Press Start 2P';font-size:5px;color:"+team.accent+";opacity:.5;letter-spacing:.5px\">HOME: " + x.stadium + "</div>" +
        // Ratings with full labels and stars
        "<div style='margin-top:4px'>" +
          ratingRow('OFFENSE', x.ratings.OFF, team.accent) +
          ratingRow('DEFENSE', x.ratings.DEF, team.accent) +
          ratingRow('SPEED', x.ratings.SPD, team.accent) +
          ratingRow('TOUGHNESS', x.ratings.TGH, team.accent) +
          ratingRow('OVERALL', x.ratings.OVR, team.accent) +
        "</div>";
      card.appendChild(botWrap);

      card.onclick = function() { SND.select(); selTeam=team.id; GS.team=team.id; refreshTeams(); refreshGo(); };
      teamGrid.appendChild(card);
    });
  }
  content.appendChild(teamGrid);

  // Go button (pinned at bottom)
  var goBtn = document.createElement('button');
  function refreshGo() {
    var ready = selTeam && selDiff;
    goBtn.className = 'btn-blitz';
    goBtn.disabled = !ready;
    goBtn.style.cssText = 'margin-top:6px;' + (ready
      ? 'background:var(--a-gold);border-color:var(--a-gold);color:#000;box-shadow:0 0 30px rgba(255,204,0,0.6);font-size:16px;'
      : 'opacity:0.3;');
    goBtn.textContent = ready ? 'START DRAFT \u2192' : 'SELECT A TEAM';
    goBtn.onclick = ready ? function() {
      SND.snap();
      setGs(function(s) {
        return Object.assign({}, s, {
          screen:'draft', team:selTeam, difficulty:selDiff, coachBadge:'SCHEMER',
          side:'offense', roster:null, offRoster:null, offHand:null, defRoster:null, defHand:null
        });
      });
    } : null;
  }
  content.appendChild(goBtn);
  el.appendChild(content);

  refreshTeams();
  refreshDiffs();
  refreshGo();

  return el;
}
