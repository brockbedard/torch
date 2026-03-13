import { GS, setRender } from './state.js';
import { SND } from './engine/sound.js';
import { buildHome } from './ui/screens/home.js';
import { buildSetup } from './ui/screens/setup.js';
import { buildDraft } from './ui/screens/draft.js';
import { buildUnderConstruction } from './ui/screens/under_construction.js';
import { buildPlay } from './ui/screens/play.js';
import { buildResult } from './ui/screens/result.js';

const root = document.getElementById('root');

function render() {
  SND.crowdStop();
  root.innerHTML = '';
  let content;

  if (!GS) {
    content = buildHome();
  } else {
    switch (GS.screen) {
      case 'setup': content = buildSetup(); break;
      case 'draft': content = buildDraft(); break;
      case 'under_construction': content = buildUnderConstruction(); break;
      case 'play': content = buildPlay(); break;
      case 'result': content = buildResult(); break;
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
