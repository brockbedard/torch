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

  // Position logic (prefer right, then left, then top)
  let x = rect.right + 10;
  let y = rect.top;

  if (x + 240 > window.innerWidth) {
    x = rect.left - 250;
  }
  if (y + detail.offsetHeight > window.innerHeight) {
    y = window.innerHeight - detail.offsetHeight - 20;
  }

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
  setTimeout(() => {
    if (el.parentNode) el.remove();
  }, 200);
}

/**
 * Attach Balatro-style listeners to a card element.
 */
export function attachDetailListeners(el, data) {
  // Desktop
  el.addEventListener('mouseenter', () => showDetail(el, data));
  el.addEventListener('mouseleave', () => hideDetail());

  // Mobile (Long press)
  el.addEventListener('touchstart', (e) => {
    _lockTimer = setTimeout(() => {
      showDetail(el, data);
      // Vibrate if supported
      if (navigator.vibrate) navigator.vibrate(10);
    }, 500);
  }, {passive: true});

  el.addEventListener('touchend', () => {
    clearTimeout(_lockTimer);
    // On mobile, we might want to keep it open until a tap elsewhere
  }, {passive: true});
}
