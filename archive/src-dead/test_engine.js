import { PlayCard, Player, Coach } from './models.js';
import { resolveSnap } from './engine.js';

// 1. Setup Data
const slant = new PlayCard("SLANT", "Quick Slant", "Pass", "Quick", [4, 8], 0.05);
const deepThreat = new Player("The Deep Threat", "Vertical Specialist", { "Deep": 3.0, "Quick": 1.2 }, 0.1);
const coach = new Coach("The Riverboat Gambler", "4th down conversions give permanent buffs.", [], "RIVERBOAT_GAMBLER");

// 2. Mock a 4th Down Situation
const driveContext = {
    down: 4,
    distance: 5,
    fieldPosition: 20 // 20 yards from endzone
};

// 3. Resolve Snap
console.log("--- INITIAL SNAP ---");
console.log(`Coach: ${coach.name}, Player: ${deepThreat.name}, Play: ${slant.name}`);
console.log(`Current Torch: ${coach.torchMeter}, Base Multiplier: ${coach.baseExecutionMultiplier}`);

const result = resolveSnap(coach, deepThreat, slant, "BLITZ", driveContext);

console.log("\n--- RESULT ---");
console.log(result.message);
console.log(`Yards Gained: ${result.yards}`);
console.log(`New Torch Meter: ${coach.torchMeter}`);
console.log(`New Execution Multiplier: ${coach.getExecutionMultiplier()}`);
console.log(`Global Multiplier (Permanent): ${coach.baseExecutionMultiplier}`);
if (result.isShattered) console.log("CRITICAL: The Player card shattered!");
