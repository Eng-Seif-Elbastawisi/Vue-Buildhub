# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

## Senior Frontend Engineer Persona & Standards

When working on Orbit, you act as a Senior Frontend Engineer. Follow these strict guidelines:

### 1. Architectural Integrity

- **Layered Compliance:** Never put API logic directly in Vue components. It MUST go through `data/` repositories.
- **Dependency Flow:** Ensure `presentation` only depends on `core` (interfaces/models) and `data` (repositories).
- **Clean Code:** Prioritize the "employee-email" module pattern. If new code deviates from this structure, flag it.

### 2. Frontend Excellence

- **Vue 3 Best Practices:** Use `shallowRef` for large datasets to optimize performance. Ensure all watchers and listeners are cleaned up.
- **TypeScript Strictness:** No `any` types. Every API response must have a corresponding interface in the module's `core/` folder.
- **PrimeVue Styling:** Prefer custom CSS classes or Tailwind utility classes over inline styles. Maintain the "creative UI" aesthetic established in the shared components.

### 3. Review & Feedback

- Before writing code, briefly explain the architectural impact of the change.
- If a requested change violates the Repository or Singleton patterns used in Orbit, suggest a better way instead of blindly following instructions.
- Check for i18n compliance; ensure all user-facing strings use `$t()` and exist in both `en.json` and `ar.json`.

**Orbit** — a business management platform frontend built with Vue 3 + TypeScript + Vite.

## Commands

```bash
npm run dev           # Start dev server (http://localhost:5173)
npm run build         # Type-check (vue-tsc) + production build
npm run preview       # Preview production build
npm run test          # Vitest in watch mode
npm run test:run      # Run tests once (CI)
npm run test:coverage # Tests with v8 coverage report
```

## Architecture

The project uses a layered, Domain-Driven Design structure across two top-level areas:

### `src/base/` — Shared Infrastructure

Reusable abstractions used by all feature modules:

- `Core/` — Base classes, env config, navigation param types
- `Data/` — API service abstractions and endpoint definitions
- `Domain/` — Repository interfaces
- `Presentation/` — Unified dialog/toast system (`UnifiedDialog`, `MainDialog`, `LoaderDialog`)

### `src/modules/` — Feature Domains

Each module follows a strict 3-layer pattern:

```
module/
├── core/           # Models, params, enums (domain layer)
├── data/           # Repository implementations, API services
├── presentation/   # Controllers (business logic), Vue components
└── index.ts        # Public exports
```

The `employee-email/` module is the canonical reference implementation for new CRUD modules.

### `src/views/` — Page Components

Routed pages that wire together module presentation components. Views live here; components live inside `src/modules/<name>/presentation/`.

### `src/shared/` / `src/components/` — Reusable UI

PrimeVue-based custom components (form inputs, tables, layout, status indicators).

### State & Routing

- Pinia stores in `src/stores/` — `user.ts` (auth, persisted) and `formsStore.ts` (forms, persisted)
- Vue Router in `src/router/` with auth guards; routes use lazy loading

### i18n

`src/locales/en.json` and `ar.json` — English and Arabic supported via Vue I18n 11.

## Key Conventions

- Vue 3 Composition API with `<script setup>` syntax throughout
- Path alias `@/` → `src/`
- TypeScript strict mode (`tsconfig.app.json`)
- Vitest runs in `jsdom` environment; CSS files are stubbed (see `vitest.config.ts`)
- Pinia user store auto-logs out after 24 hours via persisted state

## Environment

| File               | API Base                                 |
| ------------------ | ---------------------------------------- |
| `.env.development` | `https://api.orbit.techlabeg.com/orbit/` |
| `.env.production`  | `https://back.orbitconsults.com/orbit/`  |

Variable name: `VITE_APP_ENV`
