/**
 * TORCH — Telemetry System
 * Privacy-first, anonymous event logging for game balancing.
 */

import { VERSION } from '../state.js';

const TELEMETRY_ENABLED = true;

/**
 * Log an event to telemetry.
 * Currently just logs to console in a structured way, 
 * but ready for a fetch() call to a server.
 * @param {string} eventName 
 * @param {object} data 
 */
export function logEvent(eventName, data = {}) {
  if (!TELEMETRY_ENABLED) return;

  const payload = {
    event: eventName,
    version: VERSION,
    timestamp: new Date().toISOString(),
    ...data
  };

  // Structured logging for local debugging
  console.log(`[Telemetry] ${eventName}:`, payload);

  // Future: fetch('https://api.torchfootball.com/telemetry', {
  //   method: 'POST',
  //   body: JSON.stringify(payload),
  //   headers: { 'Content-Type': 'application/json' }
  // }).catch(() => {});
}

/**
 * Specific helper for game completion telemetry.
 */
export function logGameComplete(stats) {
  logEvent('game_complete', {
    team: stats.team,
    opponent: stats.opponent,
    difficulty: stats.difficulty,
    score: `${stats.humanScore}-${stats.cpuScore}`,
    won: stats.won,
    torchPts: stats.torchPts,
    isDaily: stats.isDaily,
    isChampionship: stats.isChampionship
  });
}
