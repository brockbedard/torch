# Simulation Report — 3,000 Games (March 2026)

## Summary

| Team | Easy Win% | Med Win% | Hard Win% | Verdict |
|------|-----------|----------|-----------|---------|
| **Sentinels** | 94% | 40% | 48% | Solid across all difficulties |
| **Wolves** | 32% | 6% | 0% | **BROKEN** — unplayable on Med/Hard |
| **Stags** | 83% | 28% | 42% | Easy is fine, Med too many ties |
| **Serpents** | 97% | 55% | 44% | Strongest team at all levels |

## Critical Issues

### 1. WOLVES ARE BROKEN (Priority: CRITICAL)
- **Easy: 32% win rate** (should be 80%+) — even Easy feels hard
- **Medium: 6% win rate** — nearly impossible
- **Hard: 0% win rate, 0.0 TDs/game** — literally can't score
- **Avg score Easy: 2.9-0.1** — lowest by far (Sentinels: 13.7, Serpents: 15.4)
- **Cause:** Wolves (Dolphins) roster likely has weak offensive output. The Spread Option scheme may not translate well with current play cards.
- **Fix needed:** Buff Wolves offensive plays (higher mean/variance), or give them more favorable badge combos, or boost their roster stars.

### 2. TOO MANY TIES (Priority: HIGH)
- Wolves Easy: 66% ties (166/250)
- Stags Medium: 44% ties (109/250)
- Overall: 15-28% tie rate on most combos
- **Cause:** Low scoring means many 0-0 games, especially Wolves
- **Fix options:** Add overtime, or reduce defensive effectiveness slightly, or boost scoring across the board

### 3. HARD IS EASIER THAN MEDIUM (Priority: MEDIUM)
- Sentinels: Med 40% → Hard 48% (Hard is EASIER)
- Stags: Med 28% → Hard 42% (Hard is EASIER)
- **Cause:** Hard AI uses more torch cards (2.5/game vs 1.9) which helps but also exposes the AI to the personnel system's heat penalty — the AI always picks optimal players, but repeatedly featuring the same player accumulates heat.
- **Fix:** Hard AI should rotate players or factor heat into selection.

### 4. BIG PLAY % TOO HIGH (Priority: LOW)
- 11-22% big play rate across all combos (target: 3-10%)
- Makes games feel streaky — one big play can decide everything
- **Fix:** Reduce variance multiplier or big play explosion threshold

## Scoring Distribution

| Difficulty | Human Avg Score | CPU Avg Score | Avg TDs |
|-----------|----------------|---------------|---------|
| Easy | 10.3 | 0.3 | 1.5/0.0 |
| Medium | 6.5 | 7.1 | 0.8/1.0 |
| Hard | 7.2 | 9.7 | 1.0/1.4 |

Medium human scoring (6.5) is lower than Hard human scoring (7.2). This is because Hard AI card usage creates more variable outcomes that sometimes benefit the human.

## TORCH Economy

| Difficulty | Avg TORCH Earned | Implication |
|-----------|-----------------|-------------|
| Easy | 246 pts | Can buy 1-2 Silver cards per game |
| Medium | 227 pts | Can buy 1 Silver + 1 Bronze per game |
| Hard | 234 pts | Similar to Medium (card usage offsets) |

Economy feels tight at Medium/Hard — buying decisions matter.

## Recommendations (Priority Order)

1. **Fix Wolves immediately** — buff offense or nerf opposing defense when playing as Wolves
2. **Add a scoring floor** — ensure every team can score at least 1 TD per game on Easy
3. **Fix Hard > Medium anomaly** — Hard AI should account for heat when picking players
4. **Reduce tie rate** — consider overtime or slight scoring boost
5. **Reduce big play variance** — tighten the gaussian distribution
6. **Balance test regularly** — run 1000-game sim after every balance change
