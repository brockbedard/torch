import { SND } from '../../engine/sound.js';
import { GS, setGs } from '../../state.js';
import { TEAMS_LIST as TEAMS } from '../../data/teams.js';
import { buildDraftProgress } from '../components/draftProgress.js';

/* ═══════════════════════════════════════════
   EXTENDED TEAM DATA
   ═══════════════════════════════════════════ */
const XDATA = {
  canyon_tech: {
    coach: 'COACH RICKY VANCE', quote: "If we're not scoring, we're not trying.",
    motto: 'BURN THE COVERAGE', est: 'Est. 1974 \u2014 3x Conf. Champs',
    sigPlay: 'FOUR VERTS', starPlayers: 'Rio Vasquez WIDE RECEIVER',
    stadium: 'THE FURNACE',
    ratings: { OFF:4, DEF:3, SPD:5, TGH:2, OVR:4 },
    coachImg: '/img/teams/coach-ir.jpg', stadiumImg: '/img/teams/stadium-ir.jpg',
    playstyle: 'AIR RAID', playstyleIcon: '\u26A1',
  },
  iron_ridge: {
    coach: 'COACH DALE BURRIS', quote: "You don't need to throw. You need to want it more.",
    motto: 'CONTROL THE LINE', est: 'Est. 1961 \u2014 5x Conf. Champs',
    sigPlay: 'TRIPLE OPTION', starPlayers: 'Mack Torres FULLBACK',
    stadium: 'THE FORGE',
    ratings: { OFF:3, DEF:4, SPD:2, TGH:5, OVR:4 },
    coachImg: '/img/teams/coach-ct.jpg', stadiumImg: '/img/teams/stadium-ct.jpg',
    playstyle: 'GROUND & POUND', playstyleIcon: '\u2692',
  },
};

function starStr(n) { var s=''; for(var i=0;i<5;i++) s += i<n?'\u2605':'\u2606'; return s; }

/* ═══════════════════════════════════════════
   BUILD
   ═══════════════════════════════════════════ */
export function buildSetup() {
  var selTeam = GS ? GS.team : null;
  var selDiff = GS ? GS.difficulty : null;

  var el = document.createElement('div');
  el.className = 'sup';
  el.style.cssText = 'min-height:100vh;display:flex;flex-direction:column;background:var(--bg);';

  // Inject animations
  if (!document.getElementById('setup-hero-style')) {
    var styleEl = document.createElement('style');
    styleEl.id = 'setup-hero-style';
    styleEl.textContent = `
      @keyframes hero-glow {
        0%, 100% { box-shadow: 0 0 20px var(--glow-color), inset 0 0 10px rgba(255,255,255,0.2); }
        50% { box-shadow: 0 0 40px var(--glow-color), inset 0 0 20px rgba(255,255,255,0.4); }
      }
    `;
    document.head.appendChild(styleEl);
  }

  // ── Progress bar (step 1) ──
  el.appendChild(buildDraftProgress(1));

  // ── Header bar ──
  var hdr = document.createElement('div');
  hdr.style.cssText =
    'background:rgba(0,0,0,0.5);padding:10px 14px;display:flex;justify-content:space-between;' +
    'align-items:center;flex-shrink:0;border-bottom:2px solid var(--torch);';

  var hdrTitle = document.createElement('div');
  hdrTitle.style.cssText =
    'display:flex;align-items:baseline;gap:0;font-style:italic;transform:skewX(-10deg);';
  var hdrName = document.createElement('span');
  hdrName.style.cssText =
    "font-family:'Teko',sans-serif;font-weight:700;font-size:32px;color:var(--a-gold);" +
    "letter-spacing:3px;text-shadow:2px 2px 0 rgba(0,0,0,0.9),0 0 12px rgba(255,184,0,0.3);";
  hdrName.textContent = 'TORCH';
  var hdrSub = document.createElement('span');
  hdrSub.style.cssText =
    "font-family:'Teko',sans-serif;font-weight:500;font-size:22px;color:var(--white);" +
    "letter-spacing:1px;margin-left:6px;";
  hdrSub.textContent = '\u00b7 PLAY NOW';
  hdrTitle.append(hdrName, hdrSub);
  hdr.appendChild(hdrTitle);

  var backBtn = document.createElement('button');
  backBtn.style.cssText =
    "font-family:'Rajdhani',monospace;font-size:10px;padding:10px 16px;" +
    "cursor:pointer;background:#000;color:var(--white);border:2px solid #333;";
  backBtn.textContent = '\u2190 BACK';
  backBtn.onclick = function() { SND.click(); setGs(null); };
  hdr.appendChild(backBtn);
  el.appendChild(hdr);

  // ── Content ──
  var content = document.createElement('div');
  content.style.cssText =
    'flex:1;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:20px;';

  // Inject thematic animations
  if (!document.getElementById('setup-theme-styles')) {
    const style = document.createElement('style');
    style.id = 'setup-theme-styles';
    style.textContent = `
      @keyframes heat-haze {
        0% { transform: translateY(0) scaleX(1) skewX(0deg); opacity: 0.4; }
        25% { transform: translateY(-4px) scaleX(1.05) skewX(2deg); opacity: 0.6; }
        50% { transform: translateY(-8px) scaleX(1.1) skewX(-2deg); opacity: 0.8; }
        75% { transform: translateY(-4px) scaleX(1.05) skewX(2deg); opacity: 0.6; }
        100% { transform: translateY(0) scaleX(1) skewX(0deg); opacity: 0.4; }
      }
      @keyframes spark-float {
        0% { transform: translate(0,0) scale(1); opacity: 1; }
        100% { transform: translate(30px, -60px) scale(0); opacity: 0; }
      }
      .theme-haze { position:absolute; inset:0; background:linear-gradient(0deg, rgba(255,100,0,0.3), transparent); pointer-events:none; animation: heat-haze 2s ease-in-out infinite; mix-blend-mode: color-dodge; z-index:2; }
      .theme-spark { position:absolute; width:6px; height:6px; background:#fff; border-radius:50%; pointer-events:none; box-shadow:0 0 10px #FFB800, 0 0 20px #ff6600; }
    `;
    document.head.appendChild(style);
  }

  // Difficulty Row
  var diffLabel = document.createElement('div');
  diffLabel.className = 'chrome-header';
  diffLabel.style.cssText = 'font-size:22px;margin-bottom:8px;';
  diffLabel.textContent = 'CHOOSE YOUR DIFFICULTY';
  content.appendChild(diffLabel);

  var diffRow = document.createElement('div');
  diffRow.style.cssText = 'display:flex;gap:10px;margin-bottom:8px;flex-shrink:0;padding-right:6px;';
  function refreshDiffs() {
    diffRow.innerHTML = '';
    var diffs = [
      { id: 'EASY', color: '#00ff44' },
      { id: 'MEDIUM', color: '#FFB800' },
      { id: 'HARD', color: '#ff0040' }
    ];
    diffs.forEach(function(d) {
      var isSel = selDiff === d.id;
      var opt = document.createElement('button');
      opt.className = 'btn-blitz';
      opt.style.cssText = 'flex:1;font-size:10px;text-align:center;padding:10px 0;' +
        'color:#fff;text-shadow:1px 1px 0 #000;border-color:var(--torch);' +
        'background:' + d.color + ';' +
        (isSel 
          ? 'box-shadow:4px 4px 0 var(--torch), 6px 6px 0 #000;transform:scale(1.02);z-index:5;outline:2px solid #fff;' 
          : 'box-shadow:3px 3px 0 var(--torch), 4px 4px 0 #000;opacity:0.6;');
      opt.textContent = d.id;
      opt.onclick = function() { SND.select(); selDiff=d.id; GS.difficulty=d.id; refreshDiffs(); refreshGo(); };
      diffRow.appendChild(opt);
    });
  }
  refreshDiffs();
  content.appendChild(diffRow);

  // Section header
  var teamTitle = document.createElement('div');
  teamTitle.className = 'chrome-header';
  teamTitle.style.cssText = 'font-size:22px;margin-bottom:8px;';
  teamTitle.textContent = 'SELECT YOUR TEAM';
  content.appendChild(teamTitle);

  // Team cards
  var teamGrid = document.createElement('div');
  teamGrid.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

  function ratingRow(label, val, color) {
    var stars = '';
    for(var i=0; i<5; i++) {
      var char = (i < val ? '\u2605' : '\u2606');
      var starCol = (i < val ? color : 'rgba(255,255,255,0.3)');
      stars += '<span style="color:' + starCol + '">' + char + '</span>';
    }
    return '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0px">' +
      "<span style=\"font-family:'Rajdhani';font-size:9px;color:#fff;letter-spacing:0.5px;text-shadow:1px 1px 2px #000\">" + label + "</span>" +
      "<span style=\"font-family:'Rajdhani';font-size:14px;font-weight:bold;letter-spacing:-1px\">" + stars + "</span>" +
    '</div>';
  }

  function refreshTeams() {
    teamGrid.innerHTML = '';
    TEAMS.forEach(function(team) {
      var isSel = selTeam === team.id;
      var x = XDATA[team.id];
      var tColor = team.accent;

      var card = document.createElement('div');
      card.style.cssText =
        'background:var(--bg-surface);position:relative;border-radius:6px;cursor:pointer;overflow:hidden;' +
        'transition:all 0.15s ease;display:flex;flex-direction:column;' +
        'border:2px solid ' + (isSel ? '#00ff44' : '#00ff4433') + ';' +
        'opacity:' + (isSel ? '1' : '0.8') + ';' +
        (isSel ? 'box-shadow:0 0 18px rgba(0,255,68,0.35), inset 0 0 12px rgba(0,255,68,0.08);' : '');

      // Selected bar (Matches play/roster cards)
      if (isSel) {
        var bar = document.createElement('div');
        bar.style.cssText = 'position:absolute;top:0;left:50%;transform:translateX(-50%);width:36px;height:3px;background:#00ff44;border-radius:0 0 3px 3px;z-index:10;';
        card.appendChild(bar);
      }

      // ── STADIUM BACKGROUND ──
      var stadiumBg = document.createElement('div');
      stadiumBg.style.cssText = 'position:absolute;inset:0;z-index:1;' +
        'background:linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 60%, var(--bg-surface) 100%), url(' + x.stadiumImg + ') center/cover no-repeat;';
      card.appendChild(stadiumBg);

      // Thematic Overlays
      if (team.id === 'canyon_tech') {
        var haze = document.createElement('div'); haze.className = 'theme-haze';
        card.appendChild(haze);
      } else {
        var sparkCont = document.createElement('div');
        sparkCont.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:2;';
        setInterval(() => {
          if (!card.parentNode) return;
          var s = document.createElement('div'); s.className = 'theme-spark';
          s.style.left = Math.random() * 100 + '%'; s.style.top = (60 + Math.random() * 40) + '%';
          s.style.animation = 'spark-float ' + (1 + Math.random()) + 's forwards';
          sparkCont.appendChild(s);
          setTimeout(() => s.remove(), 2000);
        }, 300);
        card.appendChild(sparkCont);
      }

      // ── CONTENT WRAPPER ──
      var contentWrap = document.createElement('div');
      contentWrap.style.cssText = 'display:flex;flex-direction:column;padding:6px;position:relative;z-index:3;';

      // Top Row: Logo + Team Name
      var topRow = document.createElement('div');
      topRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:2px;';
      var teamFullName = team.id === 'canyon_tech' ? 'CANYON TECH CACTI' : 'IRON RIDGE TRIDENTS';
      topRow.innerHTML = 
        '<div style="font-size:36px;filter:drop-shadow(0 0 15px ' + tColor + ')">' + team.icon + '</div>' +
        '<div style="display:flex;flex-direction:column;gap:2px;">' +
          "<div style=\"font-family:'Teko';font-size:26px;color:#fff;line-height:1;letter-spacing:2px;text-shadow:2px 2px 4px #000\">" + teamFullName + "</div>" +
          "<div style=\"font-family:'Rajdhani';font-size:8px;color:" + tColor + ";letter-spacing:1px;text-shadow:0 0 10px #000\">" + x.motto + "</div>" +
        '</div>';
      contentWrap.appendChild(topRow);

      // Bottom Row: Coach & Stats (Side by Side)
      var botRow = document.createElement('div');
      botRow.style.cssText = 'display:flex;gap:10px;align-items:center;margin-top:2px;margin-bottom:4px;';

      // Coach
      var coachCircle = document.createElement('div');
      coachCircle.style.cssText = 'width:60px;height:60px;border-radius:50%;background:#000;border:2px solid ' + tColor + ';overflow:hidden;flex-shrink:0;box-shadow:0 0 10px rgba(0,0,0,0.5);';
      var coachZoom = team.id === 'iron_ridge' ? 'transform:scale(1.55);transform-origin:center 25%;' : 'transform:scale(1.4);transform-origin:center 25%;';
      coachCircle.innerHTML = '<img src="' + x.coachImg + '" style="width:100%;height:100%;object-fit:cover;' + coachZoom + '">';
      
      // Stats
      var statsBox = document.createElement('div');
      statsBox.style.cssText = 'flex:1;background:rgba(0,0,0,0.3);backdrop-filter:blur(4px);padding:4px 6px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);display:flex;flex-direction:column;gap:1px;';
      statsBox.innerHTML = 
        ratingRow('OFFENSE', x.ratings.OFF, tColor) +
        ratingRow('DEFENSE', x.ratings.DEF, tColor) +
        ratingRow('SPEED', x.ratings.SPD, tColor) +
        ratingRow('TOUGHNESS', x.ratings.TGH, tColor) +
        ratingRow('OVERALL', x.ratings.OVR, tColor) +
        '<div style="border-top:1px solid rgba(255,255,255,0.1);margin-top:2px;padding-top:2px;display:flex;align-items:center;gap:4px;white-space:nowrap;overflow:hidden;">' +
          '<span style="font-size:10px;color:var(--a-gold);line-height:1;">\u2605</span>' +
          '<span style="font-family:\'Rajdhani\';font-size:9px;color:var(--a-gold);text-transform:uppercase;letter-spacing:-0.8px;">STAR: ' + x.starPlayers + '</span>' +
        '</div>';
      
      botRow.append(coachCircle, statsBox);
      contentWrap.appendChild(botRow);

      card.appendChild(contentWrap);

      card.onclick = function() { SND.select(); selTeam=team.id; GS.team=team.id; refreshTeams(); refreshGo(); };
      teamGrid.appendChild(card);
    });
  }
  content.appendChild(teamGrid);

  // Go button
  var goBtn = document.createElement('button');
  function refreshGo() {
    var ready = selTeam && selDiff;
    goBtn.className = 'btn-blitz';
    goBtn.disabled = !ready;
    goBtn.style.cssText = 'margin-top:12px;' + (ready
      ? 'background:var(--a-gold);border-color:var(--torch);color:#000;box-shadow:4px 4px 0 var(--torch), 6px 6px 0 #000;font-size:14px;padding:12px;'
      : 'background:#555;border-color:var(--torch);color:var(--torch);box-shadow:4px 4px 0 var(--torch), 6px 6px 0 #000;font-size:14px;padding:12px;opacity:0.8;');
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
  refreshGo();

  return el;
}
