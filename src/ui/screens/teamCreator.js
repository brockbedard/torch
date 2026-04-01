/**
 * TORCH — Team Creator Screen
 * Build a custom team: name, school, colors, scheme, motto.
 * Roster auto-generated. Not wired into nav — access via dev panel or GS.screen = 'teamCreator'.
 */

import { setGs, GS } from '../../state.js';
import { createCustomTeam, saveCustomTeam, getColorPresets, SCHEME_OPTIONS, generateRoster } from '../../engine/teamCreator.js';

// ── HELPERS ──

function injectStyles() {
  if (document.getElementById('tc-styles')) return;
  var s = document.createElement('style');
  s.id = 'tc-styles';
  s.textContent =
    '@keyframes tcPulse { 0%,100%{box-shadow:0 0 0 0 rgba(235,176,16,0.4)} 50%{box-shadow:0 0 0 8px rgba(235,176,16,0)} }' +
    '@keyframes tcBadgeIn { 0%{opacity:0;transform:scale(0.85)} 100%{opacity:1;transform:scale(1)} }' +
    '.tc-swatch { transition: transform 0.12s, box-shadow 0.12s; cursor: pointer; }' +
    '.tc-swatch:active { transform: scale(0.92); }' +
    '.tc-scheme-btn { transition: background 0.15s, color 0.15s, border-color 0.15s; cursor: pointer; }' +
    '.tc-scheme-btn:active { opacity: 0.8; }' +
    '.tc-input { background: #111; border: 1px solid #2a2a2a; border-radius: 6px; color: #fff; font-family: "Rajdhani", sans-serif; font-weight: 700; font-size: 15px; padding: 10px 12px; width: 100%; box-sizing: border-box; outline: none; }' +
    '.tc-input:focus { border-color: #EBB010; }' +
    '.tc-input::placeholder { color: #444; }';
  document.head.appendChild(s);
}

function section(title, accentColor) {
  var wrap = document.createElement('div');
  wrap.style.cssText = 'margin-bottom:20px;';
  var hdr = document.createElement('div');
  hdr.style.cssText = "font-family:'Teko';font-weight:700;font-size:13px;letter-spacing:2px;color:" + (accentColor || '#FF4511') + ";margin-bottom:10px;";
  hdr.textContent = title;
  wrap.appendChild(hdr);
  return wrap;
}

function textInput(placeholder, maxLen, value) {
  var inp = document.createElement('input');
  inp.type = 'text';
  inp.className = 'tc-input';
  inp.placeholder = placeholder;
  inp.maxLength = maxLen || 40;
  if (value) inp.value = value;
  return inp;
}

function renderStars(count) {
  var out = '';
  for (var i = 0; i < 5; i++) {
    out += '<span style="color:' + (i < count ? '#EBB010' : '#333') + ';font-size:12px;">&#9733;</span>';
  }
  return out;
}

// ── BADGE PREVIEW ──

function buildBadgePreview(state) {
  var wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px 16px;background:rgba(255,255,255,0.02);border:1px solid #1a1a1a;border-radius:10px;animation:tcBadgeIn 0.3s ease both;';

  // Shield shape
  var shield = document.createElement('div');
  shield.style.cssText = 'width:88px;height:100px;border-radius:44px 44px 12px 12px;background:' + (state.primaryColor || '#333') +
    ';display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;margin-bottom:12px;';

  // Accent stripe
  var stripe = document.createElement('div');
  stripe.style.cssText = 'position:absolute;top:0;left:50%;transform:translateX(-50%);width:28px;height:4px;border-radius:0 0 4px 4px;background:' + (state.accent || '#EBB010') + ';';
  shield.appendChild(stripe);

  // Abbr
  var abbr = document.createElement('div');
  abbr.style.cssText = "font-family:'Teko';font-weight:700;font-size:30px;letter-spacing:3px;color:" + (state.accent || '#EBB010') + ";line-height:1;margin-top:8px;";
  abbr.textContent = (state.name || 'CUS').substring(0, 3).toUpperCase();
  shield.appendChild(abbr);

  // Bottom accent bar
  var bar = document.createElement('div');
  bar.style.cssText = 'position:absolute;bottom:0;left:12px;right:12px;height:5px;border-radius:0 0 8px 8px;background:' + (state.accent || '#EBB010') + ';opacity:0.6;';
  shield.appendChild(bar);

  wrap.appendChild(shield);

  // Team name
  var nameEl = document.createElement('div');
  nameEl.style.cssText = "font-family:'Teko';font-weight:700;font-size:22px;letter-spacing:3px;color:#fff;text-align:center;line-height:1;margin-bottom:4px;";
  nameEl.textContent = (state.name || 'YOUR TEAM').toUpperCase();
  wrap.appendChild(nameEl);

  // School
  if (state.school) {
    var schoolEl = document.createElement('div');
    schoolEl.style.cssText = "font-family:'Rajdhani';font-size:11px;color:#555;letter-spacing:1px;text-align:center;margin-bottom:8px;";
    schoolEl.textContent = state.school.toUpperCase();
    wrap.appendChild(schoolEl);
  }

  // Scheme pill
  if (state.scheme) {
    var schemeObj = SCHEME_OPTIONS.find(function(s) { return s.id === state.scheme; });
    if (schemeObj) {
      var pill = document.createElement('div');
      pill.style.cssText = 'display:inline-block;padding:3px 10px;border-radius:12px;border:1px solid ' + (state.accent || '#EBB010') + ';' +
        "font-family:'Rajdhani';font-weight:700;font-size:10px;letter-spacing:1px;color:" + (state.accent || '#EBB010') + ";margin-bottom:10px;";
      pill.textContent = schemeObj.name;
      wrap.appendChild(pill);
    }
  }

  // Star players preview
  if (state.roster) {
    var stars = [];
    (state.roster.offense || []).concat(state.roster.defense || []).forEach(function(p) {
      if (p.stars >= 5) stars.push(p);
    });
    if (stars.length > 0) {
      var starHdr = document.createElement('div');
      starHdr.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:10px;color:#555;letter-spacing:1px;margin-bottom:6px;";
      starHdr.textContent = 'STAR PLAYERS';
      wrap.appendChild(starHdr);
      stars.slice(0, 4).forEach(function(p) {
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:4px;';
        row.innerHTML =
          "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:12px;color:" + (state.accent || '#EBB010') + ";width:28px;\">" + p.pos + "</div>" +
          "<div style=\"font-family:'Rajdhani';font-size:12px;color:#ccc;flex:1;\">" + p.name + "</div>" +
          "<div style='font-size:10px;'>" + renderStars(p.stars) + "</div>";
        wrap.appendChild(row);
      });
    }
  }

  // Motto
  if (state.motto) {
    var mottoEl = document.createElement('div');
    mottoEl.style.cssText = "font-family:'Rajdhani';font-style:italic;font-size:11px;color:#666;text-align:center;margin-top:6px;padding-top:6px;border-top:1px solid #1a1a1a;width:100%;";
    mottoEl.textContent = '"' + state.motto + '"';
    wrap.appendChild(mottoEl);
  }

  return wrap;
}

// ── MAIN BUILD ──

export function buildTeamCreator() {
  injectStyles();

  var el = document.createElement('div');
  el.style.cssText = 'min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;background:var(--bg);overflow-y:auto;';

  // ── HEADER ──
  var hdrWrap = document.createElement('div');
  hdrWrap.style.cssText = 'background:rgba(0,0,0,0.5);padding:10px 16px 8px;border-bottom:2px solid #EBB010;flex-shrink:0;display:flex;align-items:center;gap:12px;';

  var backBtn = document.createElement('div');
  backBtn.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:11px;color:#555;cursor:pointer;padding:4px 6px;flex-shrink:0;";
  backBtn.textContent = '← BACK';
  backBtn.onclick = function() { setGs({ screen: 'teamSelect' }); };

  var hdrTitle = document.createElement('div');
  hdrTitle.style.cssText = "font-family:'Teko';font-weight:700;font-size:26px;color:#EBB010;letter-spacing:4px;flex:1;";
  hdrTitle.textContent = 'BUILD YOUR TEAM';

  hdrWrap.appendChild(backBtn);
  hdrWrap.appendChild(hdrTitle);
  el.appendChild(hdrWrap);

  // ── BODY ──
  var body = document.createElement('div');
  body.style.cssText = 'padding:16px;display:flex;flex-direction:column;gap:0;';
  el.appendChild(body);

  // State for the form
  var formState = {
    name: '',
    school: '',
    motto: '',
    primaryColor: '#1A1A1A',
    accent: '#EBB010',
    scheme: 'power_spread',
    roster: null,
  };

  // ── PREVIEW (top) ──
  var previewSec = section('PREVIEW', '#EBB010');
  var previewEl = buildBadgePreview(formState);
  previewSec.appendChild(previewEl);
  body.appendChild(previewSec);

  function refreshPreview() {
    var next = buildBadgePreview(formState);
    previewSec.replaceChild(next, previewEl);
    previewEl = next;
  }

  // ── TEAM NAME ──
  var nameSec = section('TEAM NAME');
  var nameInp = textInput('e.g. STORMCROWS', 12, '');
  nameInp.oninput = function() {
    formState.name = nameInp.value.trim();
    refreshPreview();
  };
  nameSec.appendChild(nameInp);

  var nameHint = document.createElement('div');
  nameHint.style.cssText = "font-family:'Rajdhani';font-size:10px;color:#444;margin-top:4px;";
  nameHint.textContent = 'Max 12 characters. Used as abbr + display name.';
  nameSec.appendChild(nameHint);
  body.appendChild(nameSec);

  // ── SCHOOL NAME ──
  var schoolSec = section('SCHOOL / CITY');
  var schoolInp = textInput('e.g. Ridgemont University', 32, '');
  schoolInp.oninput = function() {
    formState.school = schoolInp.value.trim();
    refreshPreview();
  };
  schoolSec.appendChild(schoolInp);
  body.appendChild(schoolSec);

  // ── COLORS ──
  var colorSec = section('COLORS');
  var presets = getColorPresets();

  var swatchGrid = document.createElement('div');
  swatchGrid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px;';

  var selectedPresetIdx = -1;

  presets.forEach(function(preset, i) {
    var swatch = document.createElement('div');
    swatch.className = 'tc-swatch';
    swatch.style.cssText = 'border-radius:8px;overflow:hidden;height:44px;position:relative;border:2px solid ' +
      (i === selectedPresetIdx ? '#EBB010' : 'transparent') + ';';

    var half1 = document.createElement('div');
    half1.style.cssText = 'position:absolute;top:0;left:0;width:50%;height:100%;background:' + preset.primary + ';';
    var half2 = document.createElement('div');
    half2.style.cssText = 'position:absolute;top:0;right:0;width:50%;height:100%;background:' + preset.accent + ';';
    var lbl = document.createElement('div');
    lbl.style.cssText = "position:absolute;bottom:2px;left:0;right:0;text-align:center;font-family:'Rajdhani';font-weight:700;font-size:8px;letter-spacing:0.5px;color:rgba(255,255,255,0.8);text-shadow:0 1px 2px rgba(0,0,0,0.8);";
    lbl.textContent = preset.name.split(' & ')[0].toUpperCase();

    swatch.appendChild(half1);
    swatch.appendChild(half2);
    swatch.appendChild(lbl);

    swatch.onclick = function() {
      selectedPresetIdx = i;
      formState.primaryColor = preset.primary;
      formState.accent = preset.accent;
      swatchGrid.querySelectorAll('.tc-swatch').forEach(function(sw, j) {
        sw.style.borderColor = j === i ? '#EBB010' : 'transparent';
      });
      refreshPreview();
    };

    swatchGrid.appendChild(swatch);
  });

  colorSec.appendChild(swatchGrid);

  var colorHint = document.createElement('div');
  colorHint.style.cssText = "font-family:'Rajdhani';font-size:10px;color:#444;";
  colorHint.textContent = 'Tap a preset to apply. Colors update the preview above.';
  colorSec.appendChild(colorHint);
  body.appendChild(colorSec);

  // ── SCHEME ──
  var schemeSec = section('OFFENSIVE SCHEME');
  var schemeDesc = document.createElement('div');
  schemeDesc.style.cssText = "font-family:'Rajdhani';font-style:italic;font-size:11px;color:#666;margin-bottom:10px;min-height:16px;";

  function updateSchemeDesc() {
    var s = SCHEME_OPTIONS.find(function(opt) { return opt.id === formState.scheme; });
    schemeDesc.textContent = s ? s.desc : '';
  }

  var schemeBtns = document.createElement('div');
  schemeBtns.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;';

  SCHEME_OPTIONS.forEach(function(opt) {
    var btn = document.createElement('div');
    btn.className = 'tc-scheme-btn';
    var isSel = formState.scheme === opt.id;
    btn.style.cssText = 'padding:8px 10px;border-radius:6px;border:1px solid ' +
      (isSel ? '#EBB010' : '#2a2a2a') + ';background:' +
      (isSel ? 'rgba(235,176,16,0.12)' : 'transparent') + ';' +
      "font-family:'Rajdhani';font-weight:700;font-size:11px;letter-spacing:1px;color:" +
      (isSel ? '#EBB010' : '#888') + ';text-align:center;';
    btn.textContent = opt.name;

    btn.onclick = function() {
      formState.scheme = opt.id;
      schemeBtns.querySelectorAll('.tc-scheme-btn').forEach(function(b, j) {
        var s = SCHEME_OPTIONS[j].id === opt.id;
        b.style.borderColor = s ? '#EBB010' : '#2a2a2a';
        b.style.background = s ? 'rgba(235,176,16,0.12)' : 'transparent';
        b.style.color = s ? '#EBB010' : '#888';
      });
      updateSchemeDesc();
      refreshPreview();
    };

    schemeBtns.appendChild(btn);
  });

  schemeSec.appendChild(schemeBtns);
  schemeSec.appendChild(schemeDesc);
  updateSchemeDesc();
  body.appendChild(schemeSec);

  // ── MOTTO ──
  var mottoSec = section('MOTTO');
  var mottoInp = textInput('e.g. Built different.', 40, '');
  mottoInp.oninput = function() {
    formState.motto = mottoInp.value.trim();
    refreshPreview();
  };
  mottoSec.appendChild(mottoInp);
  body.appendChild(mottoSec);

  // ── ROSTER NOTE ──
  var rosterNote = document.createElement('div');
  rosterNote.style.cssText = 'background:rgba(255,255,255,0.02);border:1px solid #1a1a1a;border-radius:8px;padding:10px 12px;margin-bottom:20px;display:flex;gap:10px;align-items:flex-start;';
  rosterNote.innerHTML =
    "<div style=\"font-family:'Teko';font-weight:700;font-size:20px;color:#555;line-height:1;\">14</div>" +
    "<div>" +
      "<div style=\"font-family:'Rajdhani';font-weight:700;font-size:12px;color:#aaa;margin-bottom:2px;\">AUTO-GENERATED ROSTER</div>" +
      "<div style=\"font-family:'Rajdhani';font-size:11px;color:#555;\">7 offense + 7 defense. At least one star player per side. Roster is randomized when you create the team.</div>" +
    "</div>";
  body.appendChild(rosterNote);

  // ── VALIDATION MESSAGE ──
  var validMsg = document.createElement('div');
  validMsg.style.cssText = "font-family:'Rajdhani';font-weight:700;font-size:11px;color:#ff0040;text-align:center;margin-bottom:8px;min-height:16px;";
  body.appendChild(validMsg);

  // ── CREATE BUTTON ──
  var createBtn = document.createElement('div');
  createBtn.style.cssText = 'padding:16px;border-radius:8px;background:#EBB010;cursor:pointer;text-align:center;' +
    "font-family:'Teko';font-weight:700;font-size:20px;letter-spacing:3px;color:#000;margin-bottom:10px;";
  createBtn.textContent = 'CREATE TEAM';
  createBtn.onclick = function() {
    var name = nameInp.value.trim();
    if (!name) {
      validMsg.textContent = 'Enter a team name to continue.';
      nameInp.focus();
      return;
    }
    if (name.length < 2) {
      validMsg.textContent = 'Team name must be at least 2 characters.';
      nameInp.focus();
      return;
    }
    validMsg.textContent = '';

    createBtn.textContent = 'BUILDING...';
    createBtn.style.opacity = '0.6';
    createBtn.style.pointerEvents = 'none';

    // Small delay so user sees the feedback
    setTimeout(function() {
      var team = createCustomTeam({
        name: name,
        school: schoolInp.value.trim() || '',
        motto: mottoInp.value.trim() || '',
        primaryColor: formState.primaryColor,
        accent: formState.accent,
        scheme: formState.scheme,
      });
      saveCustomTeam(team);
      setGs({ screen: 'teamSelect', highlightCustomTeam: team.id });
    }, 200);
  };
  body.appendChild(createBtn);

  // ── BACK BUTTON ──
  var cancelBtn = document.createElement('div');
  cancelBtn.style.cssText = 'padding:12px;text-align:center;cursor:pointer;' +
    "font-family:'Rajdhani';font-weight:700;font-size:12px;letter-spacing:1px;color:#444;margin-bottom:24px;";
  cancelBtn.textContent = 'CANCEL — GO BACK';
  cancelBtn.onclick = function() { setGs({ screen: 'teamSelect' }); };
  body.appendChild(cancelBtn);

  return el;
}
