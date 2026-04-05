// Local font bundles — latin subset only (offline-ready, no Google CDN dependency)
// Note: Teko max weight is 700; CSS font-weight:900 will map to 700 automatically
import '@fontsource/teko/latin-400.css';
import '@fontsource/teko/latin-500.css';
import '@fontsource/teko/latin-600.css';
import '@fontsource/teko/latin-700.css';
import '@fontsource/rajdhani/latin-400.css';
import '@fontsource/rajdhani/latin-500.css';
import '@fontsource/rajdhani/latin-600.css';
import '@fontsource/rajdhani/latin-700.css';
import '@fontsource/barlow-condensed/latin-400.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import '@fontsource/oswald/latin-500.css';
import '@fontsource/oswald/latin-600.css';
import '@fontsource/oswald/latin-700.css';
import '@fontsource/bebas-neue/latin-400.css';

import { GS, setRender } from './state.js';
import { SND } from './engine/sound.js';
import { buildHome } from './ui/screens/home.js';
import { buildCardMockup } from './ui/screens/cardMockup.js';
import { buildVisualTest } from './ui/screens/visualTest.js';
import { buildTeamSelect } from './ui/screens/teamSelect.js';
import { buildGameplay } from './ui/screens/gameplay.js';
import { buildHalftime } from './ui/screens/halftime.js';
import { buildEndGame } from './ui/screens/endGame.js';
import { buildDailyDrive } from './ui/screens/dailyDrive.js';
import { buildPregame } from './ui/screens/pregame.js';
import { buildRoster } from './ui/screens/roster.js';
import { buildSeasonRecap } from './ui/screens/seasonRecap.js';
import { buildSettings } from './ui/screens/settings.js';
import { buildTeamCreator } from './ui/screens/teamCreator.js';

const root = document.getElementById('root');

var _transitioning = false;
var _prevScreen = null;

// Screen order for directional transitions (forward = slide left, backward = slide right)
var SCREEN_ORDER = ['home', 'teamSelect', 'roster', 'pregame', 'gameplay', 'halftime', 'gameplay2', 'end_game', 'seasonRecap'];

function getScreenKey(gs) {
  if (!gs) return 'home';
  return gs.screen || 'home';
}

function getDirection(from, to) {
  // Special cases: returning to home is always "back"
  if (to === 'home' || !to) return 'back';
  if (!from) return 'forward';
  // settings/dailyDrive are lateral — use fade
  if (from === 'settings' || to === 'settings' || from === 'dailyDrive' || to === 'dailyDrive') return 'fade';
  var fi = SCREEN_ORDER.indexOf(from);
  var ti = SCREEN_ORDER.indexOf(to);
  if (fi < 0 || ti < 0) return 'fade';
  return ti > fi ? 'forward' : 'back';
}

function render() {
  // Crowd audio managed by AudioStateManager.setState() per screen — don't kill it here
  // Clean up gameplay mode when leaving
  root.classList.remove('gp-2min');
  try { screen.orientation.lock('portrait').catch(function() {}); } catch (e) {}
  let content;
  var currentScreen = getScreenKey(GS);

  // Dev-only routes — gated behind localStorage torch_dev flag
  // Enable via URL: ?dev (auto-sets flag) or console: localStorage.setItem('torch_dev','1')
  if (window.location.search.includes('dev')) localStorage.setItem('torch_dev', '1');
  var _devMode = !!localStorage.getItem('torch_dev');
  if (_devMode && window.location.search.includes('test')) {
    content = buildVisualTest();
  } else if (_devMode && window.location.search.includes('mockup')) {
    content = buildCardMockup();
  } else if (!GS) {
    content = buildHome();
  } else {
    switch (GS.screen) {
      case 'teamSelect': content = buildTeamSelect(); break;
      case 'setup': content = buildTeamSelect(); break; // Legacy redirect
      case 'dailyDrive': content = buildDailyDrive(); break;
      case 'roster': content = buildRoster(); break;
      case 'pregame': content = buildPregame(); break;
      case 'gameplay': try { content = buildGameplay(); } catch(e) { console.error('[TORCH] Gameplay build error:', e); } break;
      case 'halftime': content = buildHalftime(); break;
      case 'end_game': content = buildEndGame(); break;
      case 'seasonRecap': content = buildSeasonRecap(); break;
      case 'settings': content = buildSettings(); break;
      case 'teamCreator': content = buildTeamCreator(); break;
      default: content = buildHome();
    }
  }

  if (!content) { console.warn('[TORCH] No content for screen:', currentScreen); _transitioning = false; return; }

  // First render or mid-transition: swap immediately
  if (root.children.length === 0 || _transitioning) {
    if (root.children[0] && root.children[0]._cleanup) try { root.children[0]._cleanup(); } catch(e) {}
    root.innerHTML = '';
    root.appendChild(content);
    content.style.opacity = '1';
    root.scrollTop = 0;
    _prevScreen = currentScreen;
    return;
  }

  // Directional transition
  _transitioning = true;
  var dir = getDirection(_prevScreen, currentScreen);
  var oldContent = root.children[0];

  // Exit animation for old content
  var exitTransform = 'none';
  if (dir === 'forward') exitTransform = 'translateX(-8%)';
  else if (dir === 'back') exitTransform = 'translateX(8%)';

  if (oldContent) {
    oldContent.style.transition = 'opacity 0.15s, transform 0.15s cubic-bezier(0.32,0,0.67,0)';
    oldContent.style.opacity = '0';
    if (exitTransform !== 'none') oldContent.style.transform = exitTransform;
  }

  // Enter animation for new content
  var enterFrom = 'none';
  if (dir === 'forward') enterFrom = 'translateX(8%)';
  else if (dir === 'back') enterFrom = 'translateX(-8%)';

  setTimeout(function() {
    if (root.children[0] && root.children[0]._cleanup) try { root.children[0]._cleanup(); } catch(e) {}
    root.innerHTML = '';
    content.style.opacity = '0';
    if (enterFrom !== 'none') content.style.transform = enterFrom;
    content.style.transition = 'opacity 0.2s, transform 0.2s cubic-bezier(0.33,1,0.68,1)';
    root.appendChild(content);
    root.scrollTop = 0;
    // Force reflow then animate in
    requestAnimationFrame(function() {
      content.style.opacity = '1';
      content.style.transform = 'none';
      _transitioning = false;
      _prevScreen = currentScreen;
    });
    // Safety: ensure transitioning flag always resets
    setTimeout(function() { _transitioning = false; _prevScreen = currentScreen; }, 500);
  }, 150); // Match the fade-out duration
}

// Register render function with state manager
setRender(render);

// ===== DEV TOOLS =====
if (localStorage.getItem('torch_dev') === '1' || window.location.search.includes('dev')) {
  import('./tests/balanceTest.js').then(function(m) {
    window.runBalanceTest = m.runBalanceTest;
    console.log('[DEV] Balance test loaded. Run: window.runBalanceTest(100)');
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  render();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('Service worker registration failed:', err);
    });
  }
});

// Initialize audio on first user interaction (standard browser security policy)
function handleFirstInteraction() {
  // Use the SND object which already has a reference to AudioManager
  // to ensure we call init() synchronously in the event loop
  if (SND && SND.init) {
    SND.init();
  } else {
    // Fallback: reach into the imported AudioManager if SND doesn't expose it
    import('./engine/audioManager.js').then(m => {
      if (m.default && m.default.init) m.default.init();
    });
  }
  document.removeEventListener('touchstart', handleFirstInteraction);
  document.removeEventListener('mousedown', handleFirstInteraction);
}

document.addEventListener('touchstart', handleFirstInteraction, { passive: true });
document.addEventListener('mousedown', handleFirstInteraction, { passive: true });
