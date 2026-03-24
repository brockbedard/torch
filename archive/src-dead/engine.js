/**
 * TORCH: The "Resolve Snap" engine.
 * Math: Base Yards x Execution Multiplier = Total Yards Gained.
 */

/**
 * Resolves a single snap combining Coach, Player, and PlayCard logic.
 * 
 * @param {Coach} coach - The current Head Coach (global rules/multipliers)
 * @param {Player} player - The assigned Player Archetype (individual play modifiers)
 * @param {PlayCard} offCard - The Offensive Play Card chosen
 * @param {string} defCardId - The ID of the Defensive Card chosen by the AI
 * @param {Object} driveContext - Current drive state (down, distance, etc.)
 * @returns {Object} - Results: { yards, isTurnover, isShattered, message }
 */
export function resolveSnap(coach, player, offCard, defCardId, driveContext) {
    const { down, distance, fieldPosition } = driveContext;

    // 1. Determine Matchup Base Yards from logic (Simplification for this prototype)
    // In production, this would look up from TORCH-MATCHUP-TABLE.md
    let baseYards = calculateMatchupBaseYards(offCard.id, defCardId);

    // 2. Apply Execution Multiplier from Torch Meter
    let executionMultiplier = coach.getExecutionMultiplier();

    // 3. Apply Player Archetype Modifiers
    // Example: "The Deep Threat" gives x3 to "Deep" subtype but has shatter risk
    let playerModifier = player.getModifierFor(offCard.subtype);

    // 4. Calculate Total Yards Gained
    // Formula: Base Yards x (Torch Multiplier + Player Modifiers)
    let totalYards = Math.round(baseYards * executionMultiplier * playerModifier);

    // 5. Handle Turnover Logic
    let isTurnover = Math.random() < offCard.turnoverRisk;
    
    // 6. Handle Shatter Logic (The "Glass Card" Balatro mechanic)
    let isShattered = Math.random() < player.shatterRisk;

    // 7. Update Torch Meter / Momentum
    if (totalYards >= distance) {
        coach.addTorch(20); // First down! Build momentum.
    } else if (totalYards < 0 || isTurnover) {
        coach.drainTorch(50); // Loss of yards/turnover kills momentum.
    } else {
        coach.addTorch(5); // Progress builds slight momentum.
    }

    // 8. Handle Global Rules (e.g., "The Riverboat Gambler")
    // Example: If it's 4th down and they convert, apply a global buff.
    if (down === 4 && totalYards >= distance && coach.globalRule === "RIVERBOAT_GAMBLER") {
        coach.baseExecutionMultiplier += 0.25; // Permanent run-wide buff!
    }

    return {
        yards: isTurnover ? 0 : totalYards,
        isTurnover,
        isShattered,
        message: generateResultDescription(offCard.name, defCardId, totalYards, isTurnover)
    };
}

/**
 * Mock lookup for the Matchup Table logic from v0.7 GDD.
 */
function calculateMatchupBaseYards(offId, defId) {
    // Standard random ranges based on GDD
    const tierRanges = {
        "O+": [8, 20],
        "N": [2, 6],
        "D+": [-2, 2],
        "TO": [-2, 0]
    };

    // Example logic mapping for a few common plays
    // (In reality, this would be a full 10x10 grid)
    if (offId === "SLANT" && defId === "BLITZ") return randomInRange(tierRanges["O+"]);
    if (offId === "GO_ROUTE" && defId === "PREVENT") return randomInRange(tierRanges["D+"]);
    if (offId === "POWER" && defId === "CORNER_BLITZ") return randomInRange(tierRanges["O+"]);
    
    return randomInRange(tierRanges["N"]); // Default to Neutral
}

function randomInRange(range) {
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
}

function generateResultDescription(offName, defId, yards, isTO) {
    if (isTO) return `TURNOVER! The ${offName} was intercepted against ${defId}.`;
    if (yards > 15) return `BIG PLAY! The ${offName} burned the ${defId} for ${yards} yards!`;
    if (yards > 0) return `Completed the ${offName} for ${yards} yards against ${defId}.`;
    return `Stuffed! The ${defId} was all over that ${offName} for a loss.`;
}
