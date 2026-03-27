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

  // Content
  let html = `
    <div style="color: #EBB010; font-family: 'Teko'; font-size: 20px; letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 8px; padding-bottom: 4px;">
      ${data.title.toUpperCase()}
    </div>
    <div style="color: #fff; font-size: 13px; line-height: 1.4; margin-bottom: 10px;">
      ${data.text}
    </div>
  `;

  if (data.keywords && data.keywords.length > 0) {
    data.keywords.forEach(kw => {
      html += `
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1);">
          <span style="color: #00FF44; font-weight: 700; font-size: 11px;">${kw.word.toUpperCase()}</span>
          <div style="color: rgba(255,255,255,0.7); font-size: 11px;">${kw.definition}</div>
        </div>
      `;
    });
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
  // Desktop
  el.addEventListener('mouseenter', () => showDetail(el, data));
  el.addEventListener('mouseleave', () => hideDetail());

  // Mobile (Long press → show, tap elsewhere → dismiss)
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

  // Safety: if element that triggered tooltip is removed, clean up
  var observer = new MutationObserver(function() {
    if (!document.body.contains(el)) { hideDetail(); observer.disconnect(); }
  });
  if (el.parentNode) observer.observe(el.parentNode, { childList: true });
}
