# QWEN.md - Project Context

## Project Overview

**new-base** is a Vue 3 + TypeScript + Vite frontend application for **Orbit**, a business management platform. The project uses a clean, modular architecture with Domain-Driven Design (DDD) principles.

### Tech Stack

- **Framework:** Vue 3.5+ with `<script setup>` SFCs
- **Language:** TypeScript ~5.9
- **Build Tool:** Vite 8.0
- **State Management:** Pinia 3 with persisted state plugin
- **Routing:** Vue Router 4
- **UI Library:** PrimeVue 4 with Aura theme
- **HTTP Client:** Axios
- **i18n:** Vue I18n 11 (English & Arabic)
- **Testing:** Vitest with jsdom, v8 coverage
- **Styling:** SCSS (sass-embedded)
- **Utilities:**
  - `cropperjs` - Image cropping
  - `jspdf` + `jspdf-autotable` - PDF generation
  - `xlsx` - Excel file handling
  - `file-saver` - File downloads

### Architecture

The project follows a layered architecture pattern organized into `base` (shared infrastructure) and `modules` (feature domains):

```
src/
├── base/              # Core shared infrastructure
│   ├── Core/          # Base classes, utilities
│   ├── Data/          # Data layer abstractions
│   ├── Domain/        # Domain layer abstractions
│   └── Presentation/  # UI layer abstractions (Dialogs, etc.)
├── modules/           # Feature modules (DDD-style)
│   ├── auth/          # Authentication module
│   ├── employee-email/# Employee email CRUD module
│   └── inputs/        # Input-related features
├── views/             # Page-level components
│   ├── auth/          # Login page
│   ├── email/         # Email views
│   └── Inputs/        # Input views
├── components/        # Shared UI components
├── stores/            # Pinia stores (user, forms)
├── router/            # Vue Router config with guards
├── locales/           # i18n translations (en.json, ar.json)
├── styles/            # Global styles (main.min.css)
├── assets/            # Static assets (images, etc.)
├── __tests__/         # Test setup & stubs
├── App.vue            # Root component
└── main.ts            # App entry point
```

### Module Structure Pattern

Each feature module in `src/modules/` follows a consistent structure:

```
module/
├── core/           # Models, params, constants (Domain layer)
├── data/           # Repositories, API services (Data layer)
├── presentation/   # Controllers, Vue components (Presentation layer)
└── index.ts        # Public exports
```

## Building and Running

### Development

```bash
npm run dev          # Start Vite dev server
```

### Production Build

```bash
npm run build        # Type-check + build (vue-tsc -b && vite build)
npm run preview      # Preview production build
```

### Testing

```bash
npm run test         # Run Vitest in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage report
```

### Environment Configuration

- `.env.development` - API: `https://api.orbit.techlabeg.com/orbit/`
- `.env.production` - API: `https://back.orbitconsults.com/orbit/`
- Environment variable: `VITE_APP_ENV`

## Key Features

- **Authentication:** Login flow with session management and auto-logout (24h expiry)
- **Internationalization:** English and Arabic locale support
- **PDF/Excel Export:** Document generation with jspdf and xlsx
- **Image Cropping:** cropperjs integration
- **Modular CRUD Modules:** Feature modules with repository pattern (see `employee-email` module as reference)
- **Dialog System:** Unified dialog/toast system in `base/Presentation/`
- **Validation:** Class-based validation with cross-field rules (`ClassValidation` in `file.ts`)

## Development Conventions

### Code Style

- TypeScript strict mode (refer to `tsconfig.app.json`)
- Vue 3 Composition API with `<script setup>` syntax
- Path alias `@/` maps to `src/`
- ESM modules (`"type": "module"`)

### State Management

- Pinia stores with `persist` option for localStorage persistence
- User store tracks auth state with 24-hour auto-expiry

### Testing

- Vitest with `jsdom` environment
- Test files: `*.{test,spec}.{ts,tsx}`
- Setup file: `src/__tests__/setup.ts`
- Coverage provider: v8 (text, json, html reports)

### Git

- Standard Git workflow; commit messages should be clear and concise

