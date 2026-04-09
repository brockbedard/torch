/**
 * TORCH — Cliche Ban Test
 *
 * Prevents amateur broadcaster cliches from creeping back into the commentary engine.
 * Banned phrases are sourced from deep research into TV/radio play-by-play norms
 * (see docs/commentary-research.md if it exists; otherwise: the research was on
 * avoiding tired/amateur-sounding language).
 *
 * Usage:
 *   node --input-type=module -e "import { runClicheBanTest } from './src/tests/clicheBanTest.js'; runClicheBanTest();"
 *
 * The test fails if ANY banned phrase is found in the commentary templates
 * (case-insensitive substring match). To allow a previously-banned phrase,
 * remove it from BANNED_PHRASES and document why.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);

// The 20 cliches to ban — sourced from broadcast research.
// Each entry: [phrase, reason it's bad]
export var BANNED_PHRASES = [
  ['picks up yards',     'Redundant — the hero yardage number already shows the gain.'],
  ['picks up the yards', 'Redundant — the hero yardage number already shows the gain.'],
  ['finds the open man', '16-bit era video game commentary. Name the specific receiver + route.'],
  ['makes the catch',    'Passive and dull. Use active verbs (snags, reels it in) or state the completion.'],
  ['pin their ears back','Archaic biological metaphor. Breaks the modern aesthetic.'],
  ['pinned their ears',  'Archaic biological metaphor. Breaks the modern aesthetic.'],
  ['in space',           'Filler phrase used when the analyst has nothing substantive to say.'],
  ['tackling in space',  'Filler phrase used when the analyst has nothing substantive to say.'],
  ['in the trenches',    'Every run happens in the trenches. Adds no information.'],
  ['up front',           'Empty coach-speak, adds no information.'],
  ['extracurricular',    'Clunky jargon. Use "late hit" or "penalty" instead.'],
  ['rumbles to the',     'Cartoonish stereotype usually applied to large players.'],
  ['rumbled to the',     'Cartoonish stereotype usually applied to large players.'],
  ['fast, physical',     'Empty coach-speak. Describes the sport, not the play.'],
  ['next level',         'Vague talent-evaluator language. No "next level" in a fictional universe.'],
  ['conversate',         'Grammatically incorrect broadcast slang.'],
  ['mano y mano',        'Frequently misused (translates to "hand to hand"). Sounds amateur.'],
  ['football move',      'Referee terminology, not play-by-play description.'],
  ['trickeration',       'Dated early-2000s portmanteau.'],
  ['establish the run',  'Macro strategy concept that has no meaning on a single snap.'],
  ['take what the defense gives', 'Empty filler. Name the actual play outcome.'],
  ['game manager',       'Loaded, often pejorative. Breaks QB-focused immersion.'],
  ['high motor',         'Draft-scout cliche. Describe the physical action instead.'],
  ['deceptive speed',    'Overused trope with no tangible meaning.'],
  ['wants it more',      'Unquantifiable psychological fluff. Name what actually happened.'],
  ['gets yards',         'Redundant — yardage is already shown.'],
  ['pick up yards',      'Redundant — yardage is already shown.'],
  ['picks up some yards','Redundant — yardage is already shown.'],
];

export function runClicheBanTest() {
  var commentaryPath = join(__dirname, '..', 'engine', 'commentary.js');
  var src;
  try {
    src = readFileSync(commentaryPath, 'utf8');
  } catch (e) {
    console.error('FAIL: Could not read commentary.js at ' + commentaryPath);
    console.error(e.message);
    return { passed: false, failures: [], error: e.message };
  }

  var lower = src.toLowerCase();
  var failures = [];

  BANNED_PHRASES.forEach(function(entry) {
    var phrase = entry[0];
    var reason = entry[1];
    var idx = lower.indexOf(phrase);
    if (idx !== -1) {
      // Find the line number for a helpful error
      var lineNum = src.substring(0, idx).split('\n').length;
      // Grab the surrounding context (the whole line)
      var lineStart = src.lastIndexOf('\n', idx) + 1;
      var lineEnd = src.indexOf('\n', idx);
      if (lineEnd === -1) lineEnd = src.length;
      var lineText = src.substring(lineStart, lineEnd).trim();
      failures.push({
        phrase: phrase,
        reason: reason,
        line: lineNum,
        context: lineText.length > 100 ? lineText.substring(0, 97) + '...' : lineText,
      });
    }
  });

  if (failures.length > 0) {
    console.error('');
    console.error('=== CLICHE BAN TEST FAILED ===');
    console.error('Found ' + failures.length + ' banned phrase(s) in commentary.js:');
    console.error('');
    failures.forEach(function(f) {
      console.error('  [commentary.js:' + f.line + ']');
      console.error('    Phrase:  "' + f.phrase + '"');
      console.error('    Reason:  ' + f.reason);
      console.error('    Context: ' + f.context);
      console.error('');
    });
    console.error('Fix: remove the phrase or use a template from the research library.');
    console.error('To document an intentional exception, edit src/tests/clicheBanTest.js');
    console.error('================================');
    return { passed: false, failures: failures };
  }

  console.log('CLICHE BAN TEST: OK (' + BANNED_PHRASES.length + ' phrases checked, 0 violations)');
  return { passed: true, failures: [] };
}

// Allow direct execution
if (import.meta.url === 'file://' + process.argv[1]) {
  var result = runClicheBanTest();
  if (!result.passed) process.exit(1);
}
