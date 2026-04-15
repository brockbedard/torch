/**
 * TORCH — Haptic Feedback System
 *
 * Centralized haptic patterns for mobile game feel. All call sites route
 * through this file via Haptic.<pattern>(); the single internal trigger
 * handles routing to the best available backend.
 *
 * Backend selection (runtime):
 *   1. Capacitor Haptics (iOS Taptic Engine / Android) — preferred when
 *      running inside a native shell. Gives real iOS haptics (the Web
 *      Vibration API is unavailable on iOS Safari / WKWebView).
 *   2. Web Vibration API (Android Chrome, some PWAs) — fallback.
 *   3. No-op — desktop browsers, iOS Safari outside Capacitor.
 *
 * Each Haptic.<pattern>() specifies BOTH a vibrate-style pattern (used by
 * the Web Vibration path) AND a Capacitor impact style (used by native).
 * When @capacitor/haptics is installed + imported in main.js, native takes
 * over automatically — no call-site changes needed.
 *
 * All calls are safe: errors are swallowed, no-op if no backend available.
 */

// Detect Capacitor Haptics availability at call time (not module load time —
// the plugin may register after this module imports).
function getCapacitorHaptics() {
  if (typeof window === 'undefined' || !window.Capacitor) return null;
  var cap = window.Capacitor;
  // isNativePlatform is false inside a normal browser even if Capacitor JS loaded
  if (cap.isNativePlatform && !cap.isNativePlatform()) return null;
  var plugins = cap.Plugins;
  return (plugins && plugins.Haptics) || null;
}

/**
 * Fire a haptic. Accepts either (pattern, impact) or an object.
 *   pattern: number | number[]   — ms, or [on, off, on, ...] for Web Vibration
 *   impact:  'light'|'medium'|'heavy'  — for Capacitor Haptics.impact()
 */
function trigger(pattern, impact) {
  // Native path (iOS + Android via Capacitor) — preferred when available.
  var cap = getCapacitorHaptics();
  if (cap) {
    try {
      if (impact && cap.impact) { cap.impact({ style: impact }); return; }
      if (cap.vibrate) {
        var ms = Array.isArray(pattern) ? pattern.reduce(function(a, b) { return a + b; }, 0) : pattern;
        cap.vibrate({ duration: ms });
        return;
      }
    } catch (e) { /* fall through to web path */ }
  }
  // Web Vibration fallback (Android Chrome, some PWAs).
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) {}
  }
}

export var Haptic = {
  // Card interactions — light taps
  cardTap:     function() { trigger(8,  'light'); },
  cardSelect:  function() { trigger(15, 'light'); },
  cardDeal:    function() { trigger(5,  'light'); },
  cardDiscard: function() { trigger([10, 30, 10], 'medium'); },

  // Snap results — scale impact with event magnitude
  snap:        function() { trigger(20, 'medium'); },
  hit:         function() { trigger(12, 'light');  },
  bigPlay:     function() { trigger([20, 40, 50],          'medium'); },
  touchdown:   function() { trigger([30, 50, 80, 50, 100], 'heavy');  },
  turnover:    function() { trigger([50, 30, 80],          'heavy');  },
  sack:        function() { trigger([40, 20, 40],          'medium'); },
  incomplete:  function() { trigger(6, 'light'); },

  // Special moments
  coinFlip:       function() { trigger([10, 20, 10, 20, 30], 'light'); },
  kickoff:        function() { trigger([15, 40, 60],          'medium'); },
  fieldGoalGood:  function() { trigger([20, 30, 50, 30, 80], 'heavy');  },
  fieldGoalMiss:  function() { trigger([80, 50, 30],          'medium'); },
  shopBuy:        function() { trigger([10, 20, 30],          'light');  },

  // UI
  buttonTap: function() { trigger(5, 'light');   },
  error:     function() { trigger([30, 20, 30, 20, 30], 'medium'); },

  // Pressure / climax (Hitstop 2.0 + Heartbeat)
  // Double-thump like a heartbeat — fires pre-snap on high-pressure downs.
  heartbeat: function() { trigger([80, 120, 110],       'heavy'); },
  // Heavy impact — sub-bass companion for sacks + brutal hits.
  bigHit:    function() { trigger([60, 20, 90, 20, 60], 'heavy'); },
};
