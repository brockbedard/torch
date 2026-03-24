/**
 * TORCH — Iron Ridge Offensive Plays (Ground & Pound)
 * 10 plays, run-heavy. Values from TORCH-PLAY-DATA-TABLE / torch_sim.py.
 */

export const IR_OFF_PLAYS = [
  {
    id: 'triple_option', name: 'TRIPLE OPTION', playType: 'OPTION',
    mean: 4.8, variance: 8, completionRate: null, sackRate: null, intRate: null, fumbleRate: 0.045,
    coverageMods: {
      cover_0: { mean: 3, var: 3 },
      cover_1: { mean: 2, var: 2 },
      cover_2: { mean: 1, var: 1 },
      cover_3: { mean: -1, var: -1 },
      cover_4: { mean: -2, var: -1 },
      cover_6: { mean: 0, var: 1 },
      man_free: { mean: 1, var: 1 },
    },
  },
  {
    id: 'zone_read', name: 'ZONE READ', playType: 'OPTION',
    mean: 4.5, variance: 5, completionRate: null, sackRate: null, intRate: null, fumbleRate: 0.03,
    coverageMods: {
      cover_0: { mean: 3, var: 2 },
      cover_1: { mean: 2, var: 1 },
      cover_2: { mean: 1, var: 1 },
      cover_3: { mean: -1, var: 0 },
      cover_4: { mean: -1, var: 0 },
      cover_6: { mean: 1, var: 1 },
      man_free: { mean: 2, var: 2 },
    },
  },
  {
    id: 'power', name: 'POWER', playType: 'RUN',
    mean: 5.0, variance: 3, completionRate: null, sackRate: null, intRate: null, fumbleRate: 0.025,
    coverageMods: {
      cover_0: { mean: -1, var: -1 },
      cover_1: { mean: 1, var: 0 },
      cover_2: { mean: 2, var: 1 },
      cover_3: { mean: -2, var: -1 },
      cover_4: { mean: 0, var: 0 },
      cover_6: { mean: 1, var: 0 },
      man_free: { mean: 1, var: 1 },
    },
  },
  {
    id: 'trap', name: 'TRAP', playType: 'RUN',
    mean: 4.5, variance: 4, completionRate: null, sackRate: null, intRate: null, fumbleRate: 0.015,
    coverageMods: {
      cover_0: { mean: 2, var: 2 },
      cover_1: { mean: 1, var: 1 },
      cover_2: { mean: 1, var: 1 },
      cover_3: { mean: -1, var: 0 },
      cover_4: { mean: 0, var: 0 },
      cover_6: { mean: 0, var: 1 },
      man_free: { mean: 1, var: 1 },
    },
  },
  {
    id: 'rocket_toss', name: 'ROCKET TOSS', playType: 'RUN',
    mean: 5.5, variance: 10, completionRate: null, sackRate: null, intRate: null, fumbleRate: 0.035,
    coverageMods: {
      cover_0: { mean: 2, var: 2 },
      cover_1: { mean: 1, var: 2 },
      cover_2: { mean: 2, var: 2 },
      cover_3: { mean: -2, var: -1 },
      cover_4: { mean: -1, var: 0 },
      cover_6: { mean: 1, var: 1 },
      man_free: { mean: 1, var: 1 },
    },
  },
  {
    id: 'qb_keeper', name: 'QB KEEPER', playType: 'OPTION',
    mean: 3.5, variance: 4, completionRate: null, sackRate: null, intRate: null, fumbleRate: 0.02,
    coverageMods: {
      cover_0: { mean: 3, var: 3 },
      cover_1: { mean: 2, var: 2 },
      cover_2: { mean: 1, var: 1 },
      cover_3: { mean: -1, var: 0 },
      cover_4: { mean: -1, var: 0 },
      cover_6: { mean: 1, var: 1 },
      man_free: { mean: 2, var: 2 },
    },
  },
  {
    id: 'midline', name: 'MIDLINE', playType: 'OPTION',
    mean: 3.5, variance: 3, completionRate: null, sackRate: null, intRate: null, fumbleRate: 0.022,
    coverageMods: {
      cover_0: { mean: 2, var: 2 },
      cover_1: { mean: 1, var: 1 },
      cover_2: { mean: 1, var: 1 },
      cover_3: { mean: -1, var: 0 },
      cover_4: { mean: -1, var: 0 },
      cover_6: { mean: 0, var: 0 },
      man_free: { mean: 1, var: 1 },
    },
  },
  {
    id: 'pa_flat', name: 'PA FLAT', playType: 'SHORT',
    mean: 7, variance: 4, completionRate: 0.75, sackRate: 0.12, intRate: 0.02, fumbleRate: 0.004,
    coverageMods: {
      cover_0: { mean: 2, var: 1, int: -0.01 },
      cover_1: { mean: 1, var: 1, int: 0 },
      cover_2: { mean: 1, var: 1, int: 0 },
      cover_3: { mean: 2, var: 2, int: -0.005 },
      cover_4: { mean: 1, var: 1, int: 0 },
      cover_6: { mean: 1, var: 0, int: 0 },
      man_free: { mean: 1, var: 1, int: 0 },
    },
  },
  {
    id: 'pa_post', name: 'PA POST', playType: 'DEEP',
    mean: 18, variance: 12, completionRate: 0.45, sackRate: 0.15, intRate: 0.045, fumbleRate: 0.003,
    coverageMods: {
      cover_0: { mean: 4, var: 3, int: -0.02 },
      cover_1: { mean: 3, var: 2, int: 0 },
      cover_2: { mean: 3, var: 2, int: -0.01 },
      cover_3: { mean: 1, var: 1, int: 0.01 },
      cover_4: { mean: -2, var: -1, int: 0.02 },
      cover_6: { mean: 2, var: 1, int: 0 },
      man_free: { mean: 1, var: 1, int: 0 },
    },
    minDistance: 5,
  },
  {
    id: 'ir_qb_sneak', name: 'QB SNEAK', playType: 'RUN',
    mean: 2, variance: 1.5, completionRate: null, sackRate: null, intRate: null, fumbleRate: 0.01,
    coverageMods: {
      cover_0: { mean: 1, var: 1 },
      cover_1: { mean: 0, var: 0 },
      cover_2: { mean: 0, var: 0 },
      cover_3: { mean: 0, var: 0 },
      cover_4: { mean: 0, var: 0 },
      cover_6: { mean: 0, var: 0 },
      man_free: { mean: 0, var: 0 },
    },
    maxDistance: 2,
  },
];
