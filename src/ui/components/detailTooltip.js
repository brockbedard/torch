/**
 * TORCH v0.23 — Balatro-Style Detail Tooltips
 * Supports nested keywords, long-press/tap-to-lock on mobile, and hover on desktop.
 */

let _activeDetail = null;
let _lockTimer = null;

/**
 * Show a detailed info box for a card or keyword.
 * @param {HTMLElement} target - The element being hovered/pressed
 * @param {object} data - { title, text, keywords: [{word, definition}] }
 */
export function showDetail(target, data) {
  if (_activeDetail) hideDetail();

  const rect = target.getBoundingClientRect();
  const detail = document.createElement('div');
  detail.className = 'torch-detail-view';
  
  // Base styling for the tooltip
  detail.style.cssText = `
    position: fixed;
    z-index: 1000;
    width: 240px;
    background: rgba(10, 10, 15, 0.98);
    border: 1px solid rgba(235, 176, 16, 0.5);
    border-radius: 6px;
    padding: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(235, 176, 16, 0.1);
    font-family: 'Rajdhani', sans-serif;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.2s, transform 0.2s;
  `;

  // Content — clean and compact
  let html = `
    <div style="color: #EBB010; font-family: 'Teko'; font-size: 18px; letter-spacing: 2px; margin-bottom: 6px;">
      ${data.title.toUpperCase()}
    </div>
    <div style="color: rgba(255,255,255,0.8); font-size: 12px; line-height: 1.4;">
      ${data.text}
    </div>
  `;

  if (data.keywords && data.keywords.length > 0) {
    html += `<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">`;
    data.keywords.forEach(kw => {
      if (!kw.word) return;
      var kwColor = kw.word === 'GOLD' ? '#EBB010' : kw.word === 'SILVER' ? '#C0C0C0' : kw.word === 'BRONZE' ? '#B87333' : '#888';
      html += `<span style="font-family:'Rajdhani';font-weight:700;font-size:9px;color:${kwColor};letter-spacing:1px;padding:2px 6px;border:1px solid ${kwColor}33;border-radius:3px;">${kw.word.toUpperCase()}</span>`;
    });
    html += `</div>`;
  }

  detail.innerHTML = html;
  document.body.appendChild(detail);

  // Position logic — constrain to screen with 16px padding
  var maxW = Math.min(240, window.innerWidth - 32);
  detail.style.width = maxW + 'px';
  var x = rect.left + rect.width / 2 - maxW / 2; // center on target
  var y = rect.top - detail.offsetHeight - 10; // prefer above

  // Clamp horizontal
  if (x < 16) x = 16;
  if (x + maxW > window.innerWidth - 16) x = window.innerWidth - 16 - maxW;
  // If no room above, go below
  if (y < 10) y = rect.bottom + 10;
  // Clamp vertical
  if (y + detail.offsetHeight > window.innerHeight - 10) y = window.innerHeight - detail.offsetHeight - 10;

  detail.style.left = `${x}px`;
  detail.style.top = `${y}px`;

  // Trigger animation
  requestAnimationFrame(() => {
    detail.style.opacity = '1';
    detail.style.transform = 'translateY(0)';
  });

  _activeDetail = detail;
}

export function hideDetail() {
  if (!_activeDetail) return;
  const el = _activeDetail;
  el.style.opacity = '0';
  el.style.transform = 'translateY(10px)';
  _activeDetail = null;
  if (_dismissListener) { document.removeEventListener('click', _dismissListener, true); _dismissListener = null; }
  setTimeout(() => {
    if (el.parentNode) el.remove();
  }, 200);
}

// Auto-dismiss: any tap/click anywhere closes the tooltip
var _dismissListener = null;
function armDismiss() {
  if (_dismissListener) document.removeEventListener('click', _dismissListener, true);
  _dismissListener = function() { hideDetail(); };
  // Delay so the opening tap doesn't immediately dismiss
  setTimeout(function() { document.addEventListener('click', _dismissListener, true); }, 100);
}

// Safety: hide any stale tooltips when DOM changes (e.g., tray re-render)
var _cleanupInterval = null;
function ensureCleanup() {
  if (_cleanupInterval) return;
  _cleanupInterval = setInterval(function() {
    if (_activeDetail && !document.body.contains(_activeDetail)) {
      _activeDetail = null;
    }
    // Also clean any orphaned tooltip elements
    var stale = document.querySelectorAll('.torch-detail-view');
    stale.forEach(function(el) {
      if (el !== _activeDetail) el.remove();
    });
    if (!_activeDetail && stale.length === 0) {
      clearInterval(_cleanupInterval);
      _cleanupInterval = null;
    }
  }, 2000);
}

/**
 * Attach Balatro-style listeners to a card element.
 */
export function attachDetailListeners(el, data) {
  // Desktop only (no touch) — hover shows tooltip
  var isTouch = 'ontouchstart' in window;
  if (!isTouch) {
    el.addEventListener('mouseenter', () => showDetail(el, data));
    el.addEventListener('mouseleave', () => hideDetail());
  }

  // Mobile: long-press only (500ms hold). Quick tap does NOT trigger tooltip.
  el.addEventListener('touchstart', (e) => {
    _lockTimer = setTimeout(() => {
      showDetail(el, data);
      armDismiss();
      ensureCleanup();
      if (navigator.vibrate) navigator.vibrate(10);
    }, 500);
  }, {passive: true});

  el.addEventListener('touchend', () => {
    clearTimeout(_lockTimer);
  }, {passive: true});
  // If the user drags during the long-press, cancel it — this prevents
  // the tooltip from firing when they were actually scrolling the tray.
  el.addEventListener('touchmove', () => {
    clearTimeout(_lockTimer);
  }, {passive: true});
  el.addEventListener('touchcancel', () => {
    clearTimeout(_lockTimer);
  }, {passive: true});

  // Safety: if element that triggered tooltip is removed, clean up
  var observer = new MutationObserver(function() {
    if (!document.body.contains(el)) { hideDetail(); observer.disconnect(); }
  });
  if (el.parentNode) observer.observe(el.parentNode, { childList: true });
}
