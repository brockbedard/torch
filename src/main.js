import { GS, setRender } from './state.js';
import { SND } from './engine/sound.js';
import { buildHome } from './ui/screens/home.js';
import { buildSetup } from './ui/screens/setup.js';
import { buildDraft } from './ui/screens/draft.js';
import { buildCardDraft } from './ui/screens/cardDraft.js';
import { buildPlay } from './ui/screens/play.js';
import { buildResult } from './ui/screens/result.js';
import { buildCoinToss } from './ui/screens/coinToss.js';
import { buildGameplay } from './ui/screens/gameplay.js';
import { buildEndGame } from './ui/screens/endGame.js';

const root = document.getElementById('root');

function render() {
  SND.crowdStop();
  root.innerHTML = '';
  // Clean up gameplay landscape mode when leaving
  root.classList.remove('gameplay-active');
  try { screen.orientation.unlock(); } catch (e) {}
  let content;

  if (!GS) {
    content = buildHome();
  } else {
    switch (GS.screen) {
      case 'setup': content = buildSetup(); break;
      case 'draft': content = buildDraft(); break;
      case 'card_draft': content = buildCardDraft(); break;
      case 'play': content = buildPlay(); break;
      case 'result': content = buildResult(); break;
      case 'coin_toss': content = buildCoinToss(); break;
      case 'gameplay': content = buildGameplay(); break;
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
