/**
 * TORCH — Freak Events
 * Rare narrative-surprise events that overlay on snap results.
 * Independent of the combo/tier math. Creates memorable moments:
 * fumbled snaps, broken tackles, tipped passes, juke moves, big hits.
 *
 * Events fire at low total probability (~5-8% per snap). Each is gated
 * on the underlying result so events don't fire on already-dramatic plays
 * (TDs, existing turnovers, sacks).
 *
 * Usage:
 *   import { rollFreakEvent } from './freakEvents.js';
 *   const evt = rollFreakEvent(result, { isFirstSnapOfDrive, possession, offenseIsHuman });
 *   if (evt) { result is already mutated; render evt.label in the UI }
 */

const RUN_SPECIAL_LABELS = ['JUKE MOVE!', 'STIFF ARM!', 'SPIN MOVE!', 'BOUNCE OUTSIDE!'];

/**
 * Roll a freak event. Mutates `result` if an event fires. Returns event
 * metadata for UI, or null if nothing triggered.
 *
 * @param {object} result - The snap result object (will be mutated if event fires).
 * @param {object} ctx - { isFirstSnapOfDrive, isRunPlay, isOffenseHuman, featuredOff }
 * @returns {{ id:string, label:string, commentary:string, tone:'good'|'bad'|'neutral' } | null}
 */
export function rollFreakEvent(result, ctx) {
  // Don't stack on already-dramatic outcomes
  if (result.isTouchdown) return null;
  if (result.isSafety) return null;

  const r = result;

  // ── FUMBLED SNAP (0.8%, first snap of drive only) ──
  // Only fires on clean plays. Offense only. Small negative yardage.
  if (ctx.isFirstSnapOfDrive && !r.isSack && !r.isInterception && !r.isFumbleLost && !r.isIncomplete) {
    if (Math.random() < 0.008) {
      r.yards = -(3 + Math.floor(Math.random() * 3));
      r.isComplete = false;
      r.isIncomplete = false;
      r.description = 'FUMBLED SNAP! Offense recovers behind the line.';
      return {
        id: 'fumbled_snap',
        label: 'FUMBLED SNAP!',
        commentary: 'Botched the exchange — play blown up.',
        tone: ctx.isOffenseHuman ? 'bad' : 'good',
      };
    }
  }

  // ── TIPPED PASS (2.5% on incomplete pass) ──
  // Converts an incomplete to either a small completion or INT.
  if (r.isIncomplete && !ctx.isRunPlay) {
    if (Math.random() < 0.025) {
      if (Math.random() < 0.30) {
        // Tipped → INT
        r.isIncomplete = false;
        r.isInterception = true;
        r.yards = 0;
        r.description = 'TIPPED AT THE LINE — INTERCEPTED!';
        return {
          id: 'tipped_int',
          label: 'TIPPED → PICKED!',
          commentary: 'Ball deflects at the line — defender snatches it.',
          tone: ctx.isOffenseHuman ? 'bad' : 'good',
        };
      } else {
        // Tipped → caught short
        r.isIncomplete = false;
        r.isComplete = true;
        r.yards = 3 + Math.floor(Math.random() * 4);
        r.description = 'TIPPED — BUT CAUGHT!';
        return {
          id: 'tipped_caught',
          label: 'TIPPED — CAUGHT!',
          commentary: 'Deflected ball falls into a receiver\'s hands.',
          tone: ctx.isOffenseHuman ? 'good' : 'bad',
        };
      }
    }
  }

  // ── BROKEN TACKLE (3% on completed plays with short-to-mid yards) ──
  // Adds extra yards to mid-range plays.
  if ((r.isComplete || (ctx.isRunPlay && r.yards > 0)) &&
      r.yards >= 1 && r.yards <= 8 &&
      !r.isFumbleLost && !r.isInterception) {
    if (Math.random() < 0.03) {
      const bonus = 5 + Math.floor(Math.random() * 6);
      r.yards += bonus;
      r.description = `BROKEN TACKLE! ${ctx.ballCarrier?.name || ctx.featuredOff?.name || 'Ballcarrier'} stays up for extra yards.`;
      return {
        id: 'broken_tackle',
        label: 'BROKEN TACKLE!',
        commentary: `Breaks a tackle — ${bonus} extra yards.`,
        tone: ctx.isOffenseHuman ? 'good' : 'bad',
      };
    }
  }

  // ── SPECIAL MOVE (2% on completed runs with short gains) ──
  // JUKE / STIFF ARM / SPIN / BOUNCE on runs.
  if (ctx.isRunPlay && r.yards >= 2 && r.yards <= 8 && !r.isFumbleLost) {
    if (Math.random() < 0.02) {
      const bonus = 4 + Math.floor(Math.random() * 5);
      r.yards += bonus;
      const label = RUN_SPECIAL_LABELS[Math.floor(Math.random() * RUN_SPECIAL_LABELS.length)];
      r.description = `${label} ${ctx.ballCarrier?.name || ctx.featuredOff?.name || 'Ballcarrier'} makes a man miss.`;
      return {
        id: 'special_move',
        label,
        commentary: `${ctx.ballCarrier?.name || ctx.featuredOff?.name || 'Ballcarrier'} — ${bonus} extra yards.`,
        tone: ctx.isOffenseHuman ? 'good' : 'bad',
      };
    }
  }

  // ── BIG HIT — FORCED FUMBLE (1.5% on completed runs with 4+ yards) ──
  // Defender dislodges ball. 50% defense recovery (lost), 50% offense recovery (not lost).
  if ((r.isComplete || ctx.isRunPlay) && r.yards >= 4 &&
      !r.isFumbleLost && !r.isFumble && !r.isInterception) {
    if (Math.random() < 0.015) {
      r.isFumble = true;
      const lost = Math.random() < 0.5;
      r.isFumbleLost = lost;
      if (lost) {
        r.description = 'BIG HIT — BALL\'S OUT! Defense recovers!';
        return {
          id: 'big_hit_fumble',
          label: 'BIG HIT — FUMBLE!',
          commentary: 'Crushing hit jars the ball loose — defense pounces.',
          tone: ctx.isOffenseHuman ? 'bad' : 'good',
        };
      } else {
        r.description = 'BIG HIT! Ball\'s out — but offense recovers.';
        return {
          id: 'big_hit_hold',
          label: 'BIG HIT!',
          commentary: 'Ballcarrier held on — barely.',
          tone: 'neutral',
        };
      }
    }
  }

  return null;
}
