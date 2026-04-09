/**
 * TORCH — Expected Points Added (EPA)
 *
 * EPA measures how much a single play changed the team's expected scoring on
 * that drive. Positive EPA = offense helped themselves. Negative EPA = offense
 * hurt themselves. It's the modern gold standard for football analytics
 * (PFF, Football Outsiders, nflfastR, ESPN all use variants).
 *
 * We use a simplified static lookup rather than a trained model — the TORCH
 * engine doesn't need play-level-accurate EPA, just a consistent relative
 * signal that teaches players "good" vs "bad" plays. The table is anchored to
 * real NFL/CFB expected-points data but smoothed for simplicity.
 *
 *   https://en.wikipedia.org/wiki/Expected_points_(American_football)
 *
 * Formula (simplified):
 *   EP(down, distance, yardLine) = baseFieldEP(yardLine) × downMultiplier(down, distance)
 *
 * Where:
 *   yardLine is 0-100 from the offense's own goal line (0 = own goal, 100 = opp goal)
 *   baseFieldEP ranges from about -1.5 (own 1) to +6.0 (opp 1)
 *   downMultiplier accounts for how "stuck" you are by down and distance
 *
 * After each snap, EPA = EP(post) - EP(pre). Turnovers flip the sign because
 * the opponent now owns the field position.
 */

/**
 * Baseline expected points based on field position alone (first & 10 assumption).
 * Yard line is 0-100 from the offense's own goal (0 = own goal line).
 *
 * Anchored to known values:
 *   - Own 1 yard line: ~-1.5 EP (dangerous territory)
 *   - Own 20:          ~0.5  EP (touchback zone)
 *   - Own 50:          ~2.0  EP (midfield)
 *   - Opp 20:          ~4.0  EP (red zone entry)
 *   - Opp 5:           ~5.5  EP (goal to go)
 *   - Opp 1:           ~6.0  EP (near-certain TD)
 *
 * Linearly interpolated between anchors for simplicity.
 */
var FIELD_EP_ANCHORS = [
  { yl: 0,   ep: -2.0 },
  { yl: 5,   ep: -1.0 },
  { yl: 20,  ep: 0.5  },
  { yl: 40,  ep: 1.5  },
  { yl: 50,  ep: 2.0  },
  { yl: 60,  ep: 2.8  },
  { yl: 75,  ep: 3.7  },
  { yl: 85,  ep: 4.5  },
  { yl: 95,  ep: 5.7  },
  { yl: 99,  ep: 6.0  },
  { yl: 100, ep: 7.0  }, // TD
];

function _interpolateFieldEP(yardLine) {
  if (yardLine <= 0) return FIELD_EP_ANCHORS[0].ep;
  if (yardLine >= 100) return FIELD_EP_ANCHORS[FIELD_EP_ANCHORS.length - 1].ep;
  // Find bracket
  for (var i = 0; i < FIELD_EP_ANCHORS.length - 1; i++) {
    var a = FIELD_EP_ANCHORS[i];
    var b = FIELD_EP_ANCHORS[i + 1];
    if (yardLine >= a.yl && yardLine <= b.yl) {
      var t = (yardLine - a.yl) / (b.yl - a.yl);
      return a.ep + t * (b.ep - a.ep);
    }
  }
  return 0;
}

/**
 * Down & distance penalty. 1st & 10 is the baseline. Later downs with longer
 * distance erode expected points because you have fewer shots to convert.
 */
function _downAdjustment(down, distance) {
  // 1st & 10 baseline = 0
  // 2nd & 10 = ~-0.2
  // 3rd & 10 = ~-0.7
  // 4th & 10 = ~-1.2 (unless in FG range, but that's the raw expected points)
  if (down === 1) return 0;
  if (down === 2) {
    if (distance <= 3) return 0.2;
    if (distance <= 7) return -0.1;
    return -0.3;
  }
  if (down === 3) {
    if (distance <= 2) return 0.0;
    if (distance <= 5) return -0.4;
    if (distance <= 10) return -0.8;
    return -1.2;
  }
  // 4th down — heavily penalized unless short
  if (down === 4) {
    if (distance <= 1) return -0.5;
    if (distance <= 3) return -0.9;
    return -1.5;
  }
  return 0;
}

/**
 * Compute expected points from the offense's perspective.
 * @param {object} state — { down, distance, yardsToEndzone }
 *   yardsToEndzone = distance from the opponent's end zone (100 = own goal line, 0 = scoring)
 * @returns {number} expected points (range approximately -2 to 7)
 */
export function expectedPoints(state) {
  if (!state) return 0;
  // Convert yardsToEndzone → yardLine (0 = offense's own goal, 100 = opp goal)
  var yardLine = 100 - (state.yardsToEndzone !== undefined ? state.yardsToEndzone : 50);
  var fieldEP = _interpolateFieldEP(yardLine);
  var downAdj = _downAdjustment(state.down || 1, state.distance || 10);
  return fieldEP + downAdj;
}

/**
 * Compute EPA for a single snap result.
 *
 * @param {object} preSnap — { down, distance, yardsToEndzone } before the snap
 * @param {object} postSnap — { down, distance, yardsToEndzone } after the snap
 * @param {object} result — the snap result (has isTouchdown, isInterception, isFumbleLost, isSafety)
 * @returns {number} EPA for the play (positive = offense helped, negative = offense hurt)
 */
export function computeEPA(preSnap, postSnap, result) {
  if (!preSnap) return 0;
  var preEP = expectedPoints(preSnap);

  // Touchdown: offense scored 7 points (6 + ~1 for PAT expected value)
  if (result && result.isTouchdown) {
    return 7 - preEP;
  }
  // Safety: offense lost 2 points and gave ball back
  if (result && result.isSafety) {
    return -2 - preEP;
  }
  // Turnover: the opponent's EP becomes the offense's lost value
  if (result && (result.isInterception || result.isFumbleLost)) {
    // Flip field position for the opponent's perspective
    var oppYte = postSnap && postSnap.yardsToEndzone !== undefined
      ? (100 - postSnap.yardsToEndzone)
      : 50;
    var oppEP = expectedPoints({ down: 1, distance: 10, yardsToEndzone: oppYte });
    // Offense loses their preEP AND gives opponent oppEP
    return -preEP - oppEP;
  }

  // Normal play — difference in EP before vs after
  if (!postSnap) return 0;
  var postEP = expectedPoints(postSnap);
  return postEP - preEP;
}

/**
 * Format EPA for display with explicit +/- sign.
 *   formatEPA(4.2) -> "+4.2"
 *   formatEPA(-1.5) -> "-1.5"
 *   formatEPA(0) -> "0.0"
 */
export function formatEPA(epa) {
  var v = Math.round(epa * 10) / 10;
  var sign = v > 0 ? '+' : v < 0 ? '' : '+';
  return sign + v.toFixed(1);
}

/**
 * Rough quality label for an EPA value (for UI tooltips).
 */
export function epaLabel(epa) {
  if (epa >= 2.0)  return 'Explosive';
  if (epa >= 0.5)  return 'Successful';
  if (epa >= -0.2) return 'Neutral';
  if (epa >= -1.0) return 'Negative';
  return 'Disaster';
}

// ──────────────────────────────────────────────────────────
// KPA — "Kindle Points Added" (TORCH's branded name for EPA)
//
// The underlying math is identical to standard Expected Points Added. We
// rebrand it in the UI to fit TORCH's torch/fire theme and to feel like
// a native metric rather than a generic analytics term. Under the hood,
// call sites still use _epa / computeEPA / formatEPA — only the display
// layer switches to KPA / formatKPA.
//
// Long-form label for tooltips: "Kindle Points Added"
// Brief explanation:            "TORCH's version of Expected Points Added"
// ──────────────────────────────────────────────────────────

export var KPA_LABEL = 'Kindle Points Added';
export var KPA_TOOLTIP = 'TORCH\'s version of Expected Points Added (EPA).';

/** Alias for formatEPA — prefer this at UI call sites that display "KPA". */
export var formatKPA = formatEPA;

/** Alias for epaLabel — same quality tiers, re-exported under the KPA name. */
export var kpaLabel = epaLabel;
