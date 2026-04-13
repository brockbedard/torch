/**
 * TORCH — Economy Manager
 * Manages TORCH points and Torch Card inventories.
 */

import { aiBuyTorchCard } from '../aiOpponent.js';
import { getBoosterOffers } from '../../data/torchCards.js';

export class EconomyManager {
  constructor(difficulty = 'MEDIUM') {
    this.ctTorchPts = 0;
    this.irTorchPts = 0;
    this.humanTorchCards = [];
    this.cpuTorchCards = [];
    this.difficulty = difficulty;

    this._initAiStartingCards();
  }

  _initAiStartingCards() {
    if (this.difficulty === 'MEDIUM') {
      var medBronzes = ['play_action', 'scramble_drill', 'twelfth_man', 'ice'];
      this.cpuTorchCards.push(medBronzes[Math.floor(Math.random() * medBronzes.length)]);
    } else if (this.difficulty === 'HARD') {
      var goodSilvers = ['deep_shot', 'truck_stick', 'prime_time', 'hard_count'];
      this.cpuTorchCards.push(goodSilvers[Math.floor(Math.random() * goodSilvers.length)]);
    }
  }

  awardPoints(ctPoints, irPoints) {
    this.ctTorchPts += ctPoints;
    this.irTorchPts += irPoints;
  }

  spendPoints(team, points) {
    if (team === 'CT') this.ctTorchPts -= points;
    else this.irTorchPts -= points;
  }

  /**
   * Shop trigger — buys cards based on situation.
   */
  triggerShop(isHuman, trigger) {
    if (this.difficulty === 'EASY' || this.difficulty === 'RANDOM') return null;
    
    const inv = isHuman ? this.humanTorchCards : this.cpuTorchCards;
    if (inv.length >= 3) return null;

    const pts = isHuman ? this.ctTorchPts : this.irTorchPts;
    const offers = getBoosterOffers(trigger);
    const bought = aiBuyTorchCard(offers, pts, inv, this.difficulty);
    
    if (bought) {
      inv.push(bought.id);
      this.spendPoints(isHuman ? 'CT' : 'IR', bought.cost);
      return { bought, isHuman };
    }
    return null;
  }

  useCard(team, cardId) {
    const inv = team === 'CT' ? this.humanTorchCards : this.cpuTorchCards;
    const idx = inv.indexOf(cardId);
    if (idx >= 0) {
      inv.splice(idx, 1);
      return true;
    }
    return false;
  }

  getState() {
    return {
      ctTorchPts: this.ctTorchPts,
      irTorchPts: this.irTorchPts,
      humanTorchCards: this.humanTorchCards,
      cpuTorchCards: this.cpuTorchCards
    };
  }
}
