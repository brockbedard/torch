/**
 * TORCH — Ghost Manager
 * Serializes and deserializes coach profiles for asynchronous play.
 */

import { getRivalryMemory } from './rivalrySystem.js';
import { getFullRoster } from '../data/players.js';

/**
 * Export current coach profile as a shareable string.
 */
export function exportCoachProfile(teamId) {
  const memory = getRivalryMemory(teamId);
  const roster = getFullRoster(teamId);
  
  const profile = {
    teamId,
    memory,
    roster,
    exportedAt: new Date().toISOString()
  };

  const json = JSON.stringify(profile);
  return btoa(unescape(encodeURIComponent(json)));
}

/**
 * Import a coach profile string.
 */
export function importCoachProfile(encoded) {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch(e) {
    console.error('[Ghost] Failed to import coach profile:', e);
    return null;
  }
}
