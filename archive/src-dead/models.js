/**
 * TORCH: Models for the "Balatro but for College Football" engine.
 */

export class PlayCard {
    constructor(id, name, type, subtype, baseYards, turnoverRisk) {
        this.id = id;
        this.name = name;
        this.type = type; // "Run" or "Pass"
        this.subtype = subtype; // "Short", "Deep", "Quick", "Power", "Read", etc.
        this.baseYards = baseYards; // [min, max]
        this.turnoverRisk = turnoverRisk; // 0.0 to 1.0
    }
}

export class Player {
    /**
     * @param {string} name 
     * @param {string} archetype - e.g., "Deep Threat", "Power Back"
     * @param {Object} modifiers - e.g., { "Deep": 3.0, "Short": 0.8 }
     * @param {number} shatterRisk - Chance card is destroyed after use (Balatro "Glass" mechanic)
     */
    constructor(name, archetype, modifiers = {}, shatterRisk = 0) {
        this.name = name;
        this.archetype = archetype;
        this.modifiers = modifiers; 
        this.shatterRisk = shatterRisk;
    }

    getModifierFor(subtype) {
        return this.modifiers[subtype] || 1.0;
    }
}

export class Coach {
    constructor(name, description, startingPlaybook, globalRule) {
        this.name = name;
        this.description = description;
        this.startingPlaybook = startingPlaybook; // Array of PlayCards
        this.globalRule = globalRule; // Function triggered on specific events
        
        // Momentum / Math Engine
        this.torchMeter = 0; // 0 to 100
        this.baseExecutionMultiplier = 1.0;
    }

    getExecutionMultiplier() {
        // Example: Every 20 Torch adds 0.25 to the multiplier
        return this.baseExecutionMultiplier + (Math.floor(this.torchMeter / 20) * 0.25);
    }

    addTorch(amount) {
        this.torchMeter = Math.min(100, this.torchMeter + amount);
    }

    drainTorch(amount = 100) {
        this.torchMeter = Math.max(0, this.torchMeter - amount);
    }
}
