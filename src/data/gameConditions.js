/**
 * TORCH v0.21 — Game Day Conditions (v2 feature, data model specced now)
 * Per-game random modifiers: weather, field, crowd.
 * 5 × 3 × 3 = 45 unique condition sets.
 * First game always: Clear / Turf / Home.
 */

export var WEATHER = {
  clear: { id: 'clear', name: 'Clear', icon: 'sun', effects: {} },
  rain:  { id: 'rain', name: 'Rain', icon: 'rain', effects: { completionMod: -0.05, fumbleRateMod: 0.01 } },
  wind:  { id: 'wind', name: 'Wind', icon: 'wind', effects: { deepCapYards: 15 } },
  snow:  { id: 'snow', name: 'Snow', icon: 'snow', effects: { runMeanMod: -2, varianceMod: 1 } },
  heat:  { id: 'heat', name: 'Heat', icon: 'heat', effects: {} }, // Future: fatigue
};

export var FIELD = {
  turf:  { id: 'turf', name: 'Turf', effects: {} },
  grass: { id: 'grass', name: 'Grass', effects: { runMeanMod: 1 } },
  mud:   { id: 'mud', name: 'Mud', effects: { allMeanMod: -1, varianceMod: 2 } },
};

export var CROWD = {
  home:    { id: 'home', name: 'Home', effects: { playerOvrMod: 1 } },
  neutral: { id: 'neutral', name: 'Neutral', effects: {} },
  away:    { id: 'away', name: 'Away', effects: { opponentOvrMod: 1 } },
};

// Generate conditions for a game (first game = baseline, others = random)
export function generateConditions(isFirstGame, seed) {
  if (isFirstGame) {
    return { weather: 'clear', field: 'turf', crowd: 'home' };
  }
  // Simple seeded random (or pure random if no seed)
  var weatherKeys = Object.keys(WEATHER);
  var fieldKeys = Object.keys(FIELD);
  var crowdKeys = Object.keys(CROWD);
  return {
    weather: weatherKeys[Math.floor(Math.random() * weatherKeys.length)],
    field: fieldKeys[Math.floor(Math.random() * fieldKeys.length)],
    crowd: crowdKeys[Math.floor(Math.random() * crowdKeys.length)],
  };
}

// Get combined effects for a condition set
export function getConditionEffects(conditions) {
  var w = WEATHER[conditions.weather] || WEATHER.clear;
  var f = FIELD[conditions.field] || FIELD.turf;
  var c = CROWD[conditions.crowd] || CROWD.neutral;
  return {
    completionMod: (w.effects.completionMod || 0),
    fumbleRateMod: (w.effects.fumbleRateMod || 0),
    deepCapYards: w.effects.deepCapYards || null,
    runMeanMod: (w.effects.runMeanMod || 0) + (f.effects.runMeanMod || 0),
    allMeanMod: (f.effects.allMeanMod || 0),
    varianceMod: (w.effects.varianceMod || 0) + (f.effects.varianceMod || 0),
    playerOvrMod: (c.effects.playerOvrMod || 0),
    opponentOvrMod: (c.effects.opponentOvrMod || 0),
  };
}
