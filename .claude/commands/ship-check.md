Run a pre-merge quality gate for current changes.

Checklist:

1. `npm run lint`
2. `npm run type-check`
3. `npm run test:run`
4. Validate coverage-hook companion tests for staged `src/**/*.ts|vue` files.
5. Verify i18n and style-token constraints.
6. Provide a pass/fail summary with any blockers.
