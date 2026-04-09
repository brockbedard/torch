/**
 * TORCH — Mid-game Clipboard (stats bottom sheet)
 *
 * A swipe-up sheet with the handful of stats that actually matter mid-game
 * and aren't already on the main HUD. Intentionally tiny: one hero stat
 * (EPA differential) + three supporting tiles. No tabs, no score duplication,
 * no TORCH points duplication.
 *
 * If you only have a few seconds mid-drive, you want to know:
 *   1. Am I actually controlling the game? → EPA diff
 *   2. How's the turnover battle going? → margin
 *   3. Am I hitting explosives? → count
 *   4. Am I converting 3rd downs? → %
 *
 * That's it. Everything else the user can see without opening the sheet
 * (score on the scorebug, TORCH points on the banner, hand on the card tray).
 *
 * Expected API:
 *   import { mountClipboard } from './clipboard.js';
 *   var clipboard = mountClipboard(container, { getStats: function() {...} });
 *   clipboard.open() / close() / toggle() / refresh() / destroy()
 */

import { formatEPA } from '../../engine/epa.js';

/**
 * @param {HTMLElement} container — parent element (gameplay screen root)
 * @param {object} opts
 * @param {function():object} opts.getStats — called on open/refresh to fetch current stats
 *   Returns: {
 *     team: {
 *       userLabel: string, userScore: number,
 *       oppLabel: string, oppScore: number,
 *       userEpaPerPlay: number, oppEpaPerPlay: number,
 *       turnoverDiff: number, // +ve = user won turnover battle
 *       userTurnovers: number, oppTurnovers: number,
 *       thirdDownConv: string, // e.g. "3/5"
 *       torchPoints: number,
 *     },
 *     hand: {
 *       playsRemaining: number,   // cards in draw pile
 *       playersRemaining: number,
 *       discardsLeft: number,     // remaining drive discards
 *       synergies: Array<{ name: string, desc: string }>,
 *     }
 *   }
 */
export function mountClipboard(container, opts) {
  opts = opts || {};
  var isOpen = false;
  var _destroyed = false;

  // ── Handle (thin drag bar at bottom) ──
  var handle = document.createElement('div');
  handle.className = 'T-clipboard-handle';
  handle.style.cssText =
    'position:fixed;bottom:0;left:0;right:0;' +
    'height:22px;z-index:640;' +
    'display:flex;align-items:center;justify-content:center;' +
    'background:linear-gradient(180deg,rgba(10,8,4,0) 0%,rgba(10,8,4,0.75) 100%);' +
    'cursor:pointer;user-select:none;' +
    '-webkit-tap-highlight-color:transparent;';
  handle.innerHTML =
    '<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">' +
      '<div style="width:32px;height:3px;border-radius:2px;background:rgba(235,176,16,0.4);"></div>' +
      '<div style="font-family:\'Rajdhani\';font-weight:700;font-size:8px;color:rgba(235,176,16,0.6);letter-spacing:2px;">STATS</div>' +
      '<div style="width:32px;height:3px;border-radius:2px;background:rgba(235,176,16,0.4);"></div>' +
    '</div>';

  // ── Sheet (compact — auto-height, not 70vh) ──
  var sheet = document.createElement('div');
  sheet.className = 'T-clipboard-sheet';
  sheet.style.cssText =
    'position:fixed;left:0;right:0;bottom:0;' +
    'z-index:641;' +
    'background:rgba(10,8,4,0.96);' +
    'backdrop-filter:blur(18px) saturate(160%);' +
    '-webkit-backdrop-filter:blur(18px) saturate(160%);' +
    'border-top:1px solid rgba(235,176,16,0.35);' +
    'box-shadow:0 -12px 40px rgba(0,0,0,0.6),0 -1px 0 rgba(255,255,255,0.08) inset;' +
    'transform:translateY(100%);transition:transform 0.3s cubic-bezier(0.22,1,0.36,1);' +
    'display:flex;flex-direction:column;' +
    'padding:14px 18px 22px;' +
    'pointer-events:none;';

  // Header bar — "GAME CONTROL" + close
  var header = document.createElement('div');
  header.style.cssText =
    'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;';
  header.innerHTML =
    '<div style="display:flex;align-items:center;gap:8px;">' +
      '<div style="width:3px;height:14px;background:#EBB010;border-radius:1px;"></div>' +
      '<div style="font-family:\'Teko\';font-weight:700;font-size:16px;color:#fff;letter-spacing:3px;">GAME CONTROL</div>' +
    '</div>' +
    '<button class="T-clipboard-close" style="background:transparent;border:1px solid rgba(255,255,255,0.15);color:#888;font-family:\'Teko\';font-size:11px;letter-spacing:1px;padding:3px 9px;border-radius:3px;cursor:pointer;">CLOSE</button>';
  sheet.appendChild(header);

  // Content area — single panel, no tabs
  var content = document.createElement('div');
  content.className = 'T-clipboard-content';
  sheet.appendChild(content);

  // Backdrop (tap to dismiss)
  var backdrop = document.createElement('div');
  backdrop.style.cssText =
    'position:fixed;inset:0;z-index:639;background:rgba(0,0,0,0.35);' +
    'opacity:0;transition:opacity 0.25s;pointer-events:none;';
  container.appendChild(backdrop);
  container.appendChild(sheet);
  container.appendChild(handle);

  // ── Render ──
  // Keep this intentionally tiny. One hero stat + three supporting tiles.
  // No score (scorebug has it), no TORCH points (banner has it), no hand
  // data (card tray shows it), no duplicated EPA/play split.
  function _epaColor(epa) {
    if (epa >= 2)    return '#00ff44';
    if (epa >= 0)    return '#c8a030';
    if (epa >= -2)   return '#FF6B00';
    return '#ff0040';
  }
  function _toColor(diff) {
    return diff > 0 ? '#00ff44' : diff < 0 ? '#ff0040' : '#888';
  }
  function _expColor(diff) {
    return diff > 0 ? '#00ff44' : diff < 0 ? '#FF6B00' : '#888';
  }
  function _3dColor(pct) {
    if (pct >= 50) return '#00ff44';
    if (pct >= 33) return '#c8a030';
    if (pct >  0)  return '#FF6B00';
    return '#666';
  }

  function repaint() {
    var stats = opts.getStats ? opts.getStats() : null;
    if (!stats) {
      content.innerHTML = '<div style="color:#555;text-align:center;padding:30px 0;font-family:Rajdhani;font-size:12px;">No stats yet. Play a few snaps.</div>';
      return;
    }

    var epaDiff = stats.epaDiff || 0;
    var narrative;
    if (Math.abs(epaDiff) < 1) {
      narrative = 'Dead even. One play flips it.';
    } else if (epaDiff > 0) {
      narrative = 'You\'re controlling the real game.';
    } else {
      narrative = 'They\'re dictating the pace.';
    }

    var sign = epaDiff > 0 ? '+' : epaDiff < 0 ? '' : '';
    var epaText = sign + (Math.round(epaDiff * 10) / 10).toFixed(1);

    var turnoverMargin = stats.turnoverMargin || 0;
    var tMarginText = (turnoverMargin > 0 ? '+' : '') + turnoverMargin;

    var explosiveDiff = (stats.explosiveYou || 0) - (stats.explosiveOpp || 0);
    var explosiveText = (stats.explosiveYou || 0) + '-' + (stats.explosiveOpp || 0);

    var thirdDownPct = stats.thirdDownPct;
    var thirdDownText = stats.thirdDownAtt > 0
      ? (thirdDownPct + '%')
      : '—';
    var thirdDownSub = stats.thirdDownAtt > 0
      ? (stats.thirdDownConv + '/' + stats.thirdDownAtt)
      : '0/0';

    content.innerHTML =
      // Hero: EPA differential
      '<div style="text-align:center;padding:6px 0 12px;border-bottom:1px solid rgba(255,255,255,0.06);">' +
        '<div style="font-family:\'Teko\';font-weight:900;font-size:48px;line-height:1;color:' + _epaColor(epaDiff) + ';text-shadow:0 0 20px ' + _epaColor(epaDiff) + '55;letter-spacing:1px;">' + epaText + '</div>' +
        '<div style="font-family:\'Rajdhani\';font-weight:700;font-size:9px;color:#666;letter-spacing:2.5px;margin-top:2px;">NET EPA</div>' +
        '<div style="font-family:\'Rajdhani\';font-weight:600;font-size:10px;color:#888;margin-top:6px;font-style:italic;">' + narrative + '</div>' +
      '</div>' +
      // Three supporting tiles
      '<div style="display:flex;gap:8px;margin-top:12px;">' +
        '<div style="flex:1;text-align:center;padding:10px 6px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:4px;">' +
          '<div style="font-family:\'Teko\';font-weight:700;font-size:22px;color:' + _toColor(turnoverMargin) + ';line-height:1;">' + tMarginText + '</div>' +
          '<div style="font-family:\'Rajdhani\';font-weight:700;font-size:8px;color:#555;letter-spacing:1.5px;margin-top:3px;">TURNOVER MARGIN</div>' +
        '</div>' +
        '<div style="flex:1;text-align:center;padding:10px 6px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:4px;">' +
          '<div style="font-family:\'Teko\';font-weight:700;font-size:22px;color:' + _expColor(explosiveDiff) + ';line-height:1;">' + explosiveText + '</div>' +
          '<div style="font-family:\'Rajdhani\';font-weight:700;font-size:8px;color:#555;letter-spacing:1.5px;margin-top:3px;">EXPLOSIVES Y/T</div>' +
        '</div>' +
        '<div style="flex:1;text-align:center;padding:10px 6px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:4px;">' +
          '<div style="font-family:\'Teko\';font-weight:700;font-size:22px;color:' + _3dColor(thirdDownPct) + ';line-height:1;">' + thirdDownText + '</div>' +
          '<div style="font-family:\'Rajdhani\';font-weight:700;font-size:8px;color:#555;letter-spacing:1.5px;margin-top:3px;">3RD DOWN ' + thirdDownSub + '</div>' +
        '</div>' +
      '</div>';
  }

  function open() {
    if (_destroyed || isOpen) return;
    isOpen = true;
    repaint();
    sheet.style.pointerEvents = 'auto';
    sheet.style.transform = 'translateY(0)';
    backdrop.style.pointerEvents = 'auto';
    backdrop.style.opacity = '1';
    handle.style.opacity = '0';
  }

  function close() {
    if (_destroyed || !isOpen) return;
    isOpen = false;
    sheet.style.transform = 'translateY(100%)';
    sheet.style.pointerEvents = 'none';
    backdrop.style.pointerEvents = 'none';
    backdrop.style.opacity = '0';
    handle.style.opacity = '1';
  }

  function toggle() { isOpen ? close() : open(); }

  // ── Event wiring ──
  handle.addEventListener('click', open);
  backdrop.addEventListener('click', close);
  header.querySelector('.T-clipboard-close').addEventListener('click', close);

  // Swipe down to close (from within the sheet)
  var _touchStartY = 0;
  sheet.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) _touchStartY = e.touches[0].clientY;
  }, { passive: true });
  sheet.addEventListener('touchend', function(e) {
    if (!isOpen) return;
    var endY = e.changedTouches[0].clientY;
    if (endY - _touchStartY > 60) close();
  }, { passive: true });

  // Swipe up on handle to open
  var _handleStartY = 0;
  handle.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) _handleStartY = e.touches[0].clientY;
  }, { passive: true });
  handle.addEventListener('touchend', function(e) {
    if (isOpen) return;
    var endY = e.changedTouches[0].clientY;
    if (_handleStartY - endY > 30) open();
  }, { passive: true });

  function destroy() {
    _destroyed = true;
    if (handle.parentNode) handle.parentNode.removeChild(handle);
    if (sheet.parentNode) sheet.parentNode.removeChild(sheet);
    if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
  }

  return {
    open: open,
    close: close,
    toggle: toggle,
    refresh: repaint,
    destroy: destroy,
    isOpen: function() { return isOpen; },
    element: sheet,
  };
}
