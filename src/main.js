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

function render() {
  // Crowd audio managed by AudioStateManager.setState() per screen — don't kill it here
  // Clean up gameplay mode when leaving
  root.classList.remove('gp-2min');
  try { screen.orientation.lock('portrait').catch(function() {}); } catch (e) {}
  let content;

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
      case 'gameplay': content = buildGameplay(); break;
      case 'halftime': content = buildHalftime(); break;
      case 'end_game': content = buildEndGame(); break;
      case 'seasonRecap': content = buildSeasonRecap(); break;
      case 'settings': content = buildSettings(); break;
      case 'teamCreator': content = buildTeamCreator(); break;
      default: content = buildHome();
    }
  }

  if (!content) return;

  // First render or mid-transition: swap immediately
  if (root.children.length === 0 || _transitioning) {
    if (root.children[0] && root.children[0]._cleanup) try { root.children[0]._cleanup(); } catch(e) {}
    root.innerHTML = '';
    root.appendChild(content);
    content.style.opacity = '1';
    root.scrollTop = 0;
    return;
  }

  // Crossfade transition
  _transitioning = true;
  var oldContent = root.children[0];
  if (oldContent) {
    oldContent.style.transition = 'opacity 0.15s';
    oldContent.style.opacity = '0';
  }

  setTimeout(function() {
    if (root.children[0] && root.children[0]._cleanup) try { root.children[0]._cleanup(); } catch(e) {}
    root.innerHTML = '';
    content.style.opacity = '0';
    content.style.transition = 'opacity 0.2s';
    root.appendChild(content);
    root.scrollTop = 0;
    // Force reflow then fade in
    requestAnimationFrame(function() {
      content.style.opacity = '1';
      _transitioning = false;
    });
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
