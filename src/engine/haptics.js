/**
 * TORCH — Haptic Feedback System
 * Centralized vibration patterns for mobile game feel.
 * All calls are safe (no-op if vibrate unavailable).
 */

function vib(pattern) {
  if (navigator.vibrate) try { navigator.vibrate(pattern); } catch(e) {}
}

export var Haptic = {
  // Card interactions
  cardTap: function() { vib(8); },
  cardSelect: function() { vib(15); },
  cardDeal: function() { vib(5); },
  cardDiscard: function() { vib([10, 30, 10]); },

  // Snap results
  snap: function() { vib(20); },
  hit: function() { vib(12); },
  bigPlay: function() { vib([20, 40, 50]); },
  touchdown: function() { vib([30, 50, 80, 50, 100]); },
  turnover: function() { vib([50, 30, 80]); },
  sack: function() { vib([40, 20, 40]); },
  incomplete: function() { vib(6); },

  // Special
  coinFlip: function() { vib([10, 20, 10, 20, 30]); },
  kickoff: function() { vib([15, 40, 60]); },
  fieldGoalGood: function() { vib([20, 30, 50, 30, 80]); },
  fieldGoalMiss: function() { vib([80, 50, 30]); },
  shopBuy: function() { vib([10, 20, 30]); },

  // UI
  buttonTap: function() { vib(5); },
  error: function() { vib([30, 20, 30, 20, 30]); },

  // Pressure / climax (Hitstop 2.0 + Heartbeat)
  // Double-thump like a heartbeat — fires pre-snap on high-pressure downs.
  heartbeat: function() { vib([80, 120, 110]); },
  // Heavy impact — sub-bass companion for sacks + brutal hits.
  bigHit: function() { vib([60, 20, 90, 20, 60]); },
};
