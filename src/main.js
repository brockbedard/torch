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

const root = document.getElementById('root');

function render() {
  SND.crowdStop();
  root.innerHTML = '';
  // Clean up gameplay mode when leaving
  root.classList.remove('gp-2min');
  try { screen.orientation.unlock(); } catch (e) {}
  let content;

  // Dev-only routes — gated behind localStorage torch_dev flag
  // Enable in console: localStorage.setItem('torch_dev','1')
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
      case 'gameplay': content = buildGameplay(); break;
      case 'halftime': content = buildHalftime(); break;
      case 'end_game': content = buildEndGame(); break;
      default: content = buildHome();
    }
  }

  if (content) root.appendChild(content);
  root.scrollTop = 0;
}

// Register render function with state manager
setRender(render);

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  render();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('Service worker registration failed:', err);
    });
  }
});
