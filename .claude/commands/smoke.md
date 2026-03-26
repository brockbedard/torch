Run the TORCH smoke test suite after a production deployment.

## Steps

1. Run the engine smoke test (639 assertions, ~2s):

```bash
node --input-type=module -e "import { runSmokeTest } from './src/tests/smokeTest.js'; runSmokeTest();" 2>&1 | grep -v "MODULE_TYPELESS\|Reparsing\|To eliminate\|trace-warnings"
```

2. Run the balance test (1200 drives, ~5s):

```bash
node --input-type=module -e "import { runBalanceTest } from './src/tests/balanceTest.js'; runBalanceTest(100);" 2>&1 | grep -v "MODULE_TYPELESS\|Reparsing\|To eliminate\|trace-warnings"
```

3. Verify the production build succeeds:

```bash
npx vite build 2>&1 | tail -5
```

4. If all three pass, report "Post-deploy smoke test: PASSED" with test counts.
   If any fail, report the specific failure and recommend a fix.

## When to run

Run this AUTOMATICALLY after every `vercel --prod` deployment. Do not wait to be asked.
