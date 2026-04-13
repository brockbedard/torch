/**
 * TORCH — Engine Web Worker
 * Handles heavy simulation and AI logic off the main thread.
 */

import { resolveSnap } from '../snapResolver.js';
import { aiSelectPlay, aiSelectPlayer } from '../aiOpponent.js';

self.onmessage = function(e) {
  const { type, payload, id } = e.data;

  try {
    switch (type) {
      case 'RESOLVE_SNAP':
        const { offPlay, defPlay, featuredOff, featuredDef, offPlayers, defPlayers, context } = payload;
        const result = resolveSnap(offPlay, defPlay, featuredOff, featuredDef, offPlayers, defPlayers, context);
        self.postMessage({ type: 'RESOLVE_SNAP_RESULT', payload: result, id });
        break;

      case 'AI_SELECT_PLAY':
        const { hand, playType, difficulty, situation } = payload;
        const selectedPlay = aiSelectPlay(hand, playType, difficulty, situation);
        self.postMessage({ type: 'AI_SELECT_PLAY_RESULT', payload: selectedPlay, id });
        break;

      case 'AI_SELECT_PLAYER':
        const { roster, play, diff, isOffense, heatMap } = payload;
        const selectedPlayer = aiSelectPlayer(roster, play, diff, isOffense, heatMap);
        self.postMessage({ type: 'AI_SELECT_PLAYER_RESULT', payload: selectedPlayer, id });
        break;

      case 'PING':
        self.postMessage({ type: 'PONG', id });
        break;

      default:
        console.warn('[Worker] Unknown message type:', type);
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', payload: error.message, id });
  }
};
