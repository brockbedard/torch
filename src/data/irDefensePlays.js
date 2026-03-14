/**
 * TORCH — Iron Ridge Defensive Plays (Hard Nosed)
 * 10 plays, disciplined zone/hybrid. Values from torch_sim.py.
 */

export const IR_DEF_PLAYS = [
  {
    id: 'ir_robber', name: 'ROBBER', cardType: 'HYBRID',
    baseCoverage: 'cover_1', sackRateBonus: 0.01, intRateBonus: 0.04, runDefMod: 0,
    isCover0Blitz: false, isManCoverage: true,
    passEffect: 'MESH/SLANT/SHALLOW +4% INT. Disguised as Cover 2',
    runEffect: 'No special run effect',
    passMeanMod: 0, runMeanMod: 0, passCompMod: 0,
  },
  {
    id: 'ir_bracket', name: 'BRACKET', cardType: 'ZONE',
    baseCoverage: 'cover_2', sackRateBonus: 0, intRateBonus: 0.02, runDefMod: -1,
    isCover0Blitz: false, isManCoverage: true,
    passEffect: 'Featured player -3 mean, +3% INT',
    runEffect: 'No special run effect',
    passMeanMod: -3, runMeanMod: 0, passCompMod: 0,
  },
  {
    id: 'ir_qb_spy', name: 'QB SPY', cardType: 'HYBRID',
    baseCoverage: 'cover_3', sackRateBonus: 0, intRateBonus: 0, runDefMod: -1,
    isCover0Blitz: false, isManCoverage: false,
    passEffect: 'No special pass effect',
    runEffect: 'QB KEEPER/ZONE READ -4 yds, OPTION -2 yds',
    passMeanMod: 0, runMeanMod: -2, passCompMod: 0,
  },
  {
    id: 'ir_gap_integrity', name: 'GAP INTEGRITY', cardType: 'ZONE',
    baseCoverage: 'cover_3', sackRateBonus: 0, intRateBonus: 0, runDefMod: -4,
    isCover0Blitz: false, isManCoverage: false,
    passEffect: 'Pass +2 mean (light rush)',
    runEffect: 'ALL runs -3 mean, variance -2',
    passMeanMod: 2, runMeanMod: -3, passCompMod: 0,
  },
  {
    id: 'ir_cover2_buc', name: 'COVER 2 BUC', cardType: 'ZONE',
    baseCoverage: 'cover_2', sackRateBonus: 0, intRateBonus: 0.01, runDefMod: -1,
    isCover0Blitz: false, isManCoverage: false,
    passEffect: 'SEAM/POST -3 mean. CORNER +2 mean',
    runEffect: 'No special run effect',
    passMeanMod: 0, runMeanMod: 0, passCompMod: 0,
  },
  {
    id: 'ir_mod', name: 'MOD', cardType: 'ZONE',
    baseCoverage: 'cover_4', sackRateBonus: -0.02, intRateBonus: 0.01, runDefMod: -1,
    isCover0Blitz: false, isManCoverage: false,
    passEffect: 'FOUR VERTS/GO -4 mean, +3% INT. SHORT +2 mean',
    runEffect: 'No special run effect',
    passMeanMod: 0, runMeanMod: 0, passCompMod: 0,
  },
  {
    id: 'ir_press_man', name: 'PRESS MAN', cardType: 'PRESSURE',
    baseCoverage: 'man_free', sackRateBonus: 0.02, intRateBonus: 0.015, runDefMod: 0,
    isCover0Blitz: false, isManCoverage: true,
    passEffect: 'SHORT/QUICK completion -8%. DEEP +2 yds for offense',
    runEffect: 'No special run effect',
    passMeanMod: 2, runMeanMod: 0, passCompMod: -0.08,
  },
  {
    id: 'ir_line_stunt', name: 'LINE STUNT', cardType: 'PRESSURE',
    baseCoverage: 'cover_3', sackRateBonus: 0.05, intRateBonus: 0, runDefMod: 0,
    isCover0Blitz: false, isManCoverage: false,
    passEffect: 'Pressure without blitzing. Screens unaffected',
    runEffect: 'DRAW -2 yds (stunt disrupts lanes)',
    passMeanMod: -1, runMeanMod: -1, passCompMod: 0,
  },
  {
    id: 'ir_cover6', name: 'COVER 6', cardType: 'HYBRID',
    baseCoverage: 'cover_6', sackRateBonus: 0, intRateBonus: 0.01, runDefMod: -1,
    isCover0Blitz: false, isManCoverage: false,
    passEffect: 'Split field. DEEP -3 field side, CORNER +3 boundary',
    runEffect: 'No special run effect',
    passMeanMod: -1, runMeanMod: 0, passCompMod: 0,
  },
  {
    id: 'ir_blitz_call', name: 'BLITZ CALL', cardType: 'BLITZ',
    baseCoverage: 'cover_0', sackRateBonus: 0.06, intRateBonus: 0, runDefMod: 1,
    isCover0Blitz: true, isManCoverage: false,
    passEffect: 'Rare IR blitz. +2% sack disguise bonus',
    runEffect: '+3 yds for offense, +50% worse vs screens',
    passMeanMod: -2, runMeanMod: 3, passCompMod: 0,
  },
];
