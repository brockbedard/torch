/**
 * TORCH — Persistent Storage Facade
 *
 * All read/write of save data that MUST survive app updates and eviction
 * should go through this module. Today it wraps localStorage; when the
 * game ships as a Capacitor app, swap the internals to use
 * @capacitor/preferences (iOS UserDefaults / Android SharedPreferences,
 * both eviction-safe across OS-level storage pressure) WITHOUT touching
 * call sites.
 *
 * Use this facade for:
 *   - torch_career_stats     (careerStats.js)
 *   - torch_achievements      (achievements.js)
 *   - torch_team_records      (achievements.js)
 *   - torch_streaks           (streaks.js)
 *   - torch_game_history      (gameHistory.js)
 *
 * DON'T use it for casual/transient settings — raw localStorage is fine:
 *   - torch_save              (current-game autosave; ok to lose)
 *   - torch_muted             (audio pref; trivially re-set by the user)
 *   - torch_dev               (dev flag)
 *   - torch_dismissed_tooltip_*
 *   - torch_cards_bought      (per-game only)
 *
 * Design notes:
 *   - All operations are SYNC to keep call sites simple. Capacitor
 *     Preferences is async, so the future migration will add a hydrate()
 *     step at app startup that loads known keys into an in-memory cache
 *     before any screen tries to read them. Writes will go to both the
 *     cache (sync, for immediate reads) and Preferences (async, fire-and-
 *     forget for durability).
 *   - Errors are swallowed and defaults returned — never throw from here.
 */

export function getJSON(key, defaultValue) {
  try {
    var raw = localStorage.getItem(key);
    if (raw == null) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    return defaultValue;
  }
}

export function setJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Quota exceeded / private browsing / etc. — silent. The next read
    // will return the default, and the game keeps working.
  }
}

export function remove(key) {
  try { localStorage.removeItem(key); } catch (e) {}
}
