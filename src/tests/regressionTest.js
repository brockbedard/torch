
import { GS, setGs, setRender, createInitialState } from '../state.js';
import { buildGameplay } from '../ui/screens/gameplay.js';
import { buildRoster } from '../ui/screens/roster.js';

function runRegression() {
  console.log('Starting Regression Test: Roster to Gameplay transition');
  
  // 1. Setup initial state (Boars vs Wolves)
  setGs(createInitialState());
  GS.team = 'sentinels';
  GS.opponent = 'wolves';
  GS.screen = 'roster';
  
  console.log('Step 1: Building Roster Screen...');
  try {
    const rosterEl = buildRoster();
    console.log('SUCCESS: Roster screen built.');
  } catch (e) {
    console.error('FAIL: Roster screen build error:', e);
    process.exit(1);
  }

  // 2. Simulate clicking "START GAME"
  console.log('Step 2: Transitioning to Gameplay...');
  GS.screen = 'gameplay';
  
  try {
    const gameplayEl = buildGameplay();
    console.log('SUCCESS: Gameplay screen built without crashing.');
  } catch (e) {
    console.error('FAIL: Gameplay screen build error:', e);
    console.error(e.stack);
    process.exit(1);
  }

  console.log('All regression checks passed.');
  process.exit(0);
}

runRegression();
