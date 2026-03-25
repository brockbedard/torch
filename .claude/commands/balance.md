Run the TORCH balance test and interpret the results.

## Steps

1. Run the balance test from Node:

```bash
node --input-type=module -e "import { runBalanceTest } from './src/tests/balanceTest.js'; runBalanceTest(100);" 2>&1 | grep -v "MODULE_TYPELESS\|Reparsing\|To eliminate\|trace-warnings"
```

2. Analyze results against these target ranges:

| Difficulty | Scoring % | Yds/Play | Est Pts/Game |
|------------|-----------|----------|--------------|
| EASY | 59-71% | 8.4-9.6 | 41-50 |
| MEDIUM | 28-40% | 6.2-6.7 | 20-28 |
| HARD | 17-34% | 5.1-6.4 | 12-24 |

3. Flag any team × difficulty combo outside these ranges.

4. Cross-team balance: no team should deviate >25% from avg yds/play at any difficulty.

5. Check team scheme identity (TORCH-TEAM-SCHEME-IDENTITY.md):
   - Boars: higher run yds/play than pass yds/play (Power Spread, 55% run)
   - Werewolves: roughly balanced run/pass (Spread Option, 50/50)
   - Stags: higher pass yds/play than run yds/play (Air Raid, 30% run)
   - Serpents: most balanced across all metrics (Multiple, 45/55)

6. Report concise summary: what's in range, what's out, fix recommendations.

Note: the test is non-deterministic (gaussian random). Run numbers will vary ±5% between runs. Only flag consistent patterns, not one-off outliers.
