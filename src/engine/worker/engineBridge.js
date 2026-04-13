/**
 * TORCH — Engine Worker Bridge
 * Async wrapper for worker communication.
 */

import EngineWorker from './engine.worker.js?worker';

class EngineBridge {
  constructor() {
    this.worker = new EngineWorker();
    this.callbacks = new Map();
    this.msgId = 0;

    this.worker.onmessage = (e) => {
      const { type, payload, id, error } = e.data;
      if (this.callbacks.has(id)) {
        const { resolve, reject } = this.callbacks.get(id);
        this.callbacks.delete(id);
        if (type === 'ERROR') reject(payload);
        else resolve(payload);
      }
    };
  }

  _send(type, payload) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.callbacks.set(id, { resolve, reject });
      this.worker.postMessage({ type, payload, id });
    });
  }

  resolveSnap(offPlay, defPlay, featuredOff, featuredDef, offPlayers, defPlayers, context) {
    return this._send('RESOLVE_SNAP', { offPlay, defPlay, featuredOff, featuredDef, offPlayers, defPlayers, context });
  }

  aiSelectPlay(hand, playType, difficulty, situation) {
    return this._send('AI_SELECT_PLAY', { hand, playType, difficulty, situation });
  }

  aiSelectPlayer(roster, play, diff, isOffense, heatMap) {
    return this._send('AI_SELECT_PLAYER', { roster, play, diff, isOffense, heatMap });
  }

  ping() {
    return this._send('PING');
  }
}

export const engineBridge = new EngineBridge();
