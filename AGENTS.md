# AGENTS.md

## Fast Start (verified)

- Use `npm` (repo has `package-lock.json` and husky hooks call `npm run ...`).
- Core scripts: `npm run dev`, `npm run build`, `npm run type-check`, `npm run test:run`, `npm run test:coverage`, `npm run lint`.
- For a focused test: `npx vitest run path/to/file.test.ts` (or `npx vitest run -t "test name"`).

## Commit/Push Gates You Must Preempt

- Pre-commit runs, in order:
  1. `lint-staged` (ESLint + Prettier + Stylelint)
  2. `npx tsc --noEmit` (plain tsc, not `vue-tsc`)
  3. `stylelint "src/**/*.{vue,css,scss}"`
  4. `node scripts/check-test-coverage.mjs`
- Pre-push runs: `npm run type-check` (`vue-tsc --noEmit`) then `npm run test:run`.
- Commit messages are linted by commitlint (`@commitlint/config-conventional`):
  - lowercase subject, no trailing period, header max **200** chars, kebab-case scope.

## Test-Coverage Hook Quirk (easy to miss)

- `scripts/check-test-coverage.mjs` fails commit if a staged `src/**/*.ts|vue` file has no companion test.
- Accepted companion files: `<dir>/__tests__/<Name>.test.ts`, `<dir>/__tests__/<Name>.spec.ts`, `<dir>/<Name>.test.ts`, `<dir>/<Name>.spec.ts`.
- Excluded from this rule include: `src/views/**`, `src/router/**`, `src/stores/**`, `src/base/**`, `src/locales/**`, `src/assets/**`, `src/styles/**`, `src/icons/**`, `App.vue`, `main.ts`, `index.ts`, `*.d.ts`.

## Architecture That Drives Safe Changes

- App entry: `src/main.ts`; router entry: `src/router/index.ts`; routed pages are thin wrappers in `src/views/**` that mount module presentation components.
- Feature modules live in `src/modules/**` and should keep data flow layered: presentation -> repository -> api service (`core/`, `data/`, `presentation/`; some modules also have `domain/` + `useCase/`).
- Reuse the singleton pattern used across controllers/repositories/api services (`getInstance()`), not ad-hoc new instances.
- Keep API/network logic out of Vue components; place it in module `data/` layer.
- `employee` module is the canonical reference implementation for new CRUD modules.

## i18n + Styling Constraints From Repo Rules

- User-facing strings should go through i18n and be added to both `src/locales/en.json` and `src/locales/ar.json`.
- Stylelint warns (does not error) on literal color values (`#`, `rgb`, `hsl`) in many properties; prefer variables/tokens to avoid noisy lint failures.
- SCSS `@use` can reference `src/styles` without relative paths (Vite `loadPaths` is configured).

## TypeScript + Lint Quirks

- `tsconfig.app.json` enables `strict`, `noUnusedLocals`, and `noUnusedParameters` — unused variables fail both `tsc` and ESLint.
- ESLint `no-console` is set to warn and only allows `console.warn` / `console.error`.
- `.vue` block order enforced by ESLint: `script` → `template` → `style`.

## Source-of-Truth Warnings

- Module README files and some `index.ts` headers are stale copy-paste ("employee-email"); trust executable code/routes over those docs.
- `src/main.ts` imports `src/styles/main.min.css` (not `main.scss`), so verify global style edits against what is actually imported.
- Env selection comes from `VITE_APP_ENV`:
  - `.env` → `production`
  - `.env.production` → `production`
  - `.env.development` → `test`

## Roles

Define the persona before starting work. Each role maps to a skill set and set of responsibilities.

### Senior Frontend Engineer (Default)

- **Scope**: Full-stack frontend changes across modules, views, and shared components.
- **Responsibilities**: Preserve layered architecture, enforce i18n, write tests, maintain type safety.
- **Skills**: `feature-implementation`, `code-review`, `bug-investigation`, `release-readiness`, `UI-UX-Optimization`

### API Integration Engineer

- **Scope**: Backend API wiring into the frontend's data layer.
- **Responsibilities**: Model mapping, endpoint definition, repository/controller creation, error handling.
- **Skills**: `api-integration`, `test-authoring`
- **When to activate**: Adding new modules, new CRUD operations, or changing API contracts.

### QA Engineer

- **Scope**: Test coverage, test quality, and regression prevention.
- **Responsibilities**: Write companion tests, mock external dependencies, verify hook compliance.
- **Skills**: `test-authoring`, `bug-investigation`, `release-readiness`
- **When to activate**: Pre-commit coverage gaps, flaky tests, or testing new features.

### i18n Specialist

- **Scope**: Bilingual content management (English/Arabic).
- **Responsibilities**: Ensure complete EN/AR coverage, maintain key organization, verify RTL behavior.
- **Skills**: `i18n-localization`
- **When to activate**: Adding new UI text, refactoring labels, or auditing for hardcoded strings.

### UI/UX Engineer

- **Scope**: Visual consistency, accessibility, and PrimeVue component optimization.
- **Responsibilities**: Enforce design tokens, fix stylelint violations, improve responsive/RTL behavior.
- **Skills**: `UI-UX-Optimization`
- **When to activate**: Styling changes, component library upgrades, or accessibility audits.

## Skills

| Skill                    | Description                                                             | Trigger    |
| ------------------------ | ----------------------------------------------------------------------- | ---------- |
| `feature-implementation` | Implements new Vue module features using layered architecture.          | `/feature` |
| `bug-investigation`      | Reproduces, isolates, and fixes bugs with minimal-risk changes.         | `/fix`     |
| `code-review`            | Deep review of staged/proposed changes (architecture, types, security). | `/review`  |
| `release-readiness`      | Pre-merge quality gates: lint, type-check, test, coverage.              | `/ship`    |
| `api-integration`        | Wires backend APIs into `data/` layer with models and repositories.     | `/api`     |
| `i18n-localization`      | Manages `en.json`/`ar.json` coverage and RTL compliance.                | `/i18n`    |
| `test-authoring`         | Writes companion tests following Vitest/Vue Test Utils conventions.     | `/test`    |
| `UI-UX-Optimization`     | Optimizes PrimeVue/SCSS usage, accessibility, and design tokens.        | `/ui`      |

## Commands

Commands are entry points that activate a role + skill combination.

- `/feature <description>` — Activate **Senior Frontend Engineer** + `feature-implementation`. Plan, implement, and validate a new feature with full architecture, i18n, and tests.
- `/fix <bug-description>` — Activate **Senior Frontend Engineer** + `bug-investigation`. Reproduce, isolate, patch, and add regression tests.
- `/review` — Activate **Senior Frontend Engineer** + `code-review`. Review staged or proposed changes against architecture and quality gates.
- `/ship` — Activate **QA Engineer** + `release-readiness`. Run pre-merge checks: lint, type-check, tests, coverage, and hook compliance.
- `/api <endpoint-description>` — Activate **API Integration Engineer** + `api-integration`. Wire a new backend endpoint into the module's data layer.
- `/i18n <audit|add>` — Activate **i18n Specialist** + `i18n-localization`. Audit for hardcoded strings or add translations for a feature.
- `/test <file-or-scope>` — Activate **QA Engineer** + `test-authoring`. Write or improve companion tests for the given scope.
- `/ui <component-or-page>` — Activate **UI/UX Engineer** + `UI-UX-Optimization`. Refactor styling, improve accessibility, or optimize PrimeVue usage.

## Universal Rules

These apply regardless of role or command:

1. **Layering**: Always preserve `presentation -> data/repository -> api service`. Never place network logic in Vue components.
2. **Singletons**: Reuse `getInstance()` pattern for controllers, repositories, and API services.
3. **i18n**: Every user-facing string must use `$t()` and exist in both `src/locales/en.json` and `src/locales/ar.json`.
4. **Styling**: Prefer SCSS variables/tokens over literal colors (`#`, `rgb`, `hsl`) to avoid stylelint warnings.
5. **Testing**: Staged `src/**/*.ts|vue` files require companion tests unless excluded by `scripts/check-test-coverage.mjs`.
6. **Block Order**: `.vue` files must follow `script` → `template` → `style`.
7. **Type Safety**: `tsconfig.app.json` enforces `strict`, `noUnusedLocals`, `noUnusedParameters`. Unused variables fail both `tsc` and ESLint.
8. **Console**: `no-console` is set to warn; only `console.warn` and `console.error` are allowed.
