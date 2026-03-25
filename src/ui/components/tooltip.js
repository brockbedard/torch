/**
 * TORCH v0.21 — First-Time Tooltip Component
 * Dark backdrop, Rajdhani 13px, fade-in, dismiss on any tap.
 * Each tooltip has unique ID in localStorage — once dismissed, never again.
 * Max 1 tooltip per screen transition.
 */

var _activeTooltip = null;

/**
 * Show a tooltip if it hasn't been shown before.
 * @param {HTMLElement} container — element to append tooltip to
 * @param {string} id — unique ID for localStorage tracking
 * @param {string} text — tooltip text
 * @param {object} [opts] — { delay: ms before showing, target: element to highlight }
 * @returns {boolean} true if tooltip was shown, false if already dismissed
 */
export function showTooltip(container, id, text, opts) {
  opts = opts || {};
  var key = 'torch_tip_' + id;

  // Already shown before — skip
  if (localStorage.getItem(key)) return false;

  // Already showing a tooltip — skip (max 1 per transition)
  if (_activeTooltip) return false;

  var delay = opts.delay || 300;

  setTimeout(function() {
    // Double-check after delay
    if (_activeTooltip || localStorage.getItem(key)) return;

    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:600;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity 0.3s;';

    // Semi-transparent backdrop
    var backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.6);';
    overlay.appendChild(backdrop);

    // Tooltip text
    var tip = document.createElement('div');
    tip.style.cssText = "position:relative;z-index:1;font-family:'Rajdhani',sans-serif;font-weight:600;font-size:13px;color:rgba(255,255,255,0.9);text-align:center;line-height:1.5;padding:16px 24px;background:rgba(20,16,8,0.95);border:1px solid rgba(235,176,16,0.3);border-radius:8px;max-width:280px;";
    tip.textContent = text;
    overlay.appendChild(tip);

    _activeTooltip = overlay;
    container.appendChild(overlay);

    // Fade in
    requestAnimationFrame(function() {
      overlay.style.opacity = '1';
    });

    // Dismiss on any tap
    function dismiss() {
      localStorage.setItem(key, '1');
      overlay.style.opacity = '0';
      _activeTooltip = null;
      setTimeout(function() {
        if (overlay.parentNode) overlay.remove();
      }, 300);
      overlay.removeEventListener('click', dismiss);
    }
    overlay.addEventListener('click', dismiss);
  }, delay);

  return true;
}

/**
 * Check if a tooltip has been shown before.
 */
export function wasTooltipShown(id) {
  return !!localStorage.getItem('torch_tip_' + id);
}

/**
 * Clear all tooltip state (for testing).
 */
export function resetTooltips() {
  var keys = Object.keys(localStorage);
  keys.forEach(function(k) {
    if (k.startsWith('torch_tip_')) localStorage.removeItem(k);
  });
}
