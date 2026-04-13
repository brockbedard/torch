/**
 * TORCH — Player Detail View
 * Long-press (mobile) / hover (desktop) on a player card to reveal
 * the player's 3 sub-attributes as labeled progress bars.
 */

import { SUB_LABELS } from '../../data/playerSubs.js';

let _active = null;
let _lockTimer = null;
let _dismiss = null;

function barHTML(label, val) {
  var pct = Math.max(0, Math.min(99, val));
  var color = pct >= 75 ? '#EBB010' : pct >= 58 ? '#00ff44' : pct >= 43 ? '#fff' : '#888';
  return (
    '<div style="display:flex;align-items:center;gap:8px;margin-top:6px;">' +
      '<div style="flex:0 0 72px;font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:10px;color:#bbb;letter-spacing:0.5px;text-transform:uppercase;">' + label + '</div>' +
      '<div style="flex:1;height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;position:relative;">' +
        '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:3px;box-shadow:0 0 6px ' + color + '55;"></div>' +
      '</div>' +
      '<div style="flex:0 0 22px;text-align:right;font-family:\'Teko\',sans-serif;font-weight:700;font-size:16px;color:' + color + ';line-height:1;">' + val + '</div>' +
    '</div>'
  );
}

export function showPlayerDetail(target, player) {
  hidePlayerDetail();
  if (!player || !player.subs) return;

  var detail = document.createElement('div');
  detail.className = 'torch-player-detail';
  detail.style.cssText =
    'position:fixed;z-index:1000;width:240px;background:rgba(10,8,4,0.98);' +
    'border:1px solid rgba(235,176,16,0.5);border-radius:6px;padding:12px 14px;' +
    'box-shadow:0 10px 30px rgba(0,0,0,0.8),0 0 20px rgba(235,176,16,0.1);' +
    "font-family:'Rajdhani',sans-serif;pointer-events:auto;opacity:0;" +
    'transform:translateY(10px);transition:opacity 0.2s,transform 0.2s;';

  var fullName = (player.firstName ? player.firstName + ' ' : '') + (player.name || '');
  var pos = player.pos || '';
  var trait = player.trait || '';

  var header =
    '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">' +
      "<div style=\"color:#EBB010;font-family:'Teko',sans-serif;font-size:20px;letter-spacing:1.5px;line-height:1;text-transform:uppercase;\">" + fullName + '</div>' +
      "<div style=\"color:#888;font-family:'Oswald',sans-serif;font-weight:700;font-size:11px;letter-spacing:1px;\">" + pos + '</div>' +
    '</div>';

  var traitLine = trait
    ? "<div style=\"color:#bbb;font-size:10px;font-weight:700;letter-spacing:1px;margin-bottom:6px;text-transform:uppercase;\">" + trait + '</div>'
    : '';

  var bars = '';
  var keys = Object.keys(player.subs);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    bars += barHTML(SUB_LABELS[k] || k.replace('_', ' '), player.subs[k]);
  }

  detail.innerHTML = header + traitLine + bars;
  document.body.appendChild(detail);

  var rect = target.getBoundingClientRect();
  var maxW = Math.min(240, window.innerWidth - 32);
  detail.style.width = maxW + 'px';
  var x = rect.left + rect.width / 2 - maxW / 2;
  var y = rect.top - detail.offsetHeight - 10;
  if (x < 16) x = 16;
  if (x + maxW > window.innerWidth - 16) x = window.innerWidth - 16 - maxW;
  if (y < 10) y = rect.bottom + 10;
  if (y + detail.offsetHeight > window.innerHeight - 10) {
    y = window.innerHeight - detail.offsetHeight - 10;
  }
  detail.style.left = x + 'px';
  detail.style.top = y + 'px';

  requestAnimationFrame(function () {
    detail.style.opacity = '1';
    detail.style.transform = 'translateY(0)';
  });

  _active = detail;
}

export function hidePlayerDetail() {
  if (!_active) return;
  var el = _active;
  el.style.opacity = '0';
  el.style.transform = 'translateY(10px)';
  _active = null;
  if (_dismiss) {
    document.removeEventListener('click', _dismiss, true);
    _dismiss = null;
  }
  setTimeout(function () {
    if (el.parentNode) el.remove();
  }, 200);
}

function armDismiss() {
  if (_dismiss) document.removeEventListener('click', _dismiss, true);
  _dismiss = function () { hidePlayerDetail(); };
  setTimeout(function () { document.addEventListener('click', _dismiss, true); }, 100);
}

/**
 * Attach long-press (touch) / hover (desktop) listeners to a player card.
 * Prevents conflict with regular tap-to-select: long-press blocks the click
 * that would otherwise fire on touchend.
 */
export function attachPlayerDetailListeners(el, player) {
  if (!player || !player.subs) return;

  var isTouch = 'ontouchstart' in window;
  var longPressTriggered = false;

  if (!isTouch) {
    el.addEventListener('mouseenter', function () { showPlayerDetail(el, player); });
    el.addEventListener('mouseleave', function () { hidePlayerDetail(); });
  }

  el.addEventListener('touchstart', function () {
    longPressTriggered = false;
    _lockTimer = setTimeout(function () {
      longPressTriggered = true;
      showPlayerDetail(el, player);
      armDismiss();
      if (navigator.vibrate) navigator.vibrate(10);
    }, 500);
  }, { passive: true });

  el.addEventListener('touchend', function (e) {
    clearTimeout(_lockTimer);
    if (longPressTriggered) {
      // Swallow the click so we don't also select the card.
      e.preventDefault();
    }
  });

  el.addEventListener('touchmove', function () {
    clearTimeout(_lockTimer);
  }, { passive: true });

  el.addEventListener('click', function (e) {
    if (longPressTriggered) {
      longPressTriggered = false;
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);
}
