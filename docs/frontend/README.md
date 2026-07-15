# BuildHub frontend documentation

BuildHub is the browser application whose HTML title is defined in [`index.html`](../../index.html). The npm package identifier is `tender` in [`package.json`](../../package.json); the source does not explain the historical difference between those names.

Based on the implemented screens and API contracts, the application supports construction-oriented CRM and operational workflows: requests/projects, site previews and floors, project items and pricing, clients and suppliers, invoices and payments, organization administration, and shared setup catalogs. This purpose is inferred from executable frontend code; no separate product specification was used.

## Technology stack

| Area         | Implementation                                             |
| ------------ | ---------------------------------------------------------- |
| Framework    | Vue 3.5 with Composition API and TypeScript                |
| Build tool   | Vite 8 and `@vitejs/plugin-vue`                            |
| Routing      | Vue Router 5 with HTML5 history                            |
| State        | Pinia 3 with `pinia-plugin-persistedstate`                 |
| UI           | PrimeVue 4, PrimeIcons, Aura theme, SCSS                   |
| HTTP         | Axios through a custom service/repository/controller stack |
| Localization | Vue I18n with English and Arabic JSON catalogs             |
| Tests        | Vitest, Vue Test Utils, Testing Library, jsdom             |
| Exports      | XLSX/FileSaver and jsPDF/html2canvas/jsPDF AutoTable       |

## Quick installation

Requirements: Node.js `^20.19.0 || >=22.12.0` and npm (the repository contains `package-lock.json`).

```bash
npm ci
npm run dev
```

Set `VITE_APP_ENV` to `development`, `production`, or `test` as described in [Environment configuration](ENVIRONMENT_CONFIGURATION.md). Do not put secrets in a `VITE_*` variable because Vite exposes those values to browser code.

## Common commands

```bash
# development server
npm run dev

# type-check and create the production bundle
npm run build

# preview the generated bundle locally
npm run preview
```

All scripts are documented in [Installation guide](INSTALLATION_GUIDE.md#available-npm-scripts) and [Development guide](DEVELOPMENT_GUIDE.md#quality-checks-and-hooks).

## Main modules

- Authentication for platform administrators and organization users.
- Platform administration of administrators and organizations.
- Organization CRM: clients, project requests, converted projects, project previews, floors, project items, pricing, and history.
- Finance: invoices and invoice payments.
- Organization setup: employees, specializations, suppliers, terms, and the organization data-source toggle.
- Shared catalogs: brands, client sources, departments, items, materials, project types, spaces, stages, locations, measurement units, supplies, and system identity.

See [Modules documentation](MODULES_DOCUMENTATION.md) for all 31 source module directories, including inactive or duplicated scaffolds.

## Architecture

The dominant feature flow is:

```text
thin routed view
  -> presentation component
  -> singleton controller
  -> singleton repository
  -> singleton API service
  -> endpoint constants / Axios network service
```

Models map backend snake_case data to typed frontend objects. Params classes validate and serialize request payloads. Repositories convert HTTP results into `DataState` objects, while controllers expose reactive list/item state and coordinate navigation, dialogs, form drafts, and module-specific actions. See [Project overview](PROJECT_OVERVIEW.md#frontend-architecture) and [API integration](API_INTEGRATION.md).

## Documentation index

| Document                                                            | Contents                                                                    |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [Project overview](PROJECT_OVERVIEW.md)                             | Product flows, users, architecture, and dependencies                        |
| [Installation guide](INSTALLATION_GUIDE.md)                         | Node/npm setup, environment selection, and commands                         |
| [Project structure](PROJECT_STRUCTURE.md)                           | Directory tree, folder responsibilities, and naming                         |
| [Routes documentation](ROUTES_DOCUMENTATION.md)                     | All configured route records, access rules, params, queries, and redirects  |
| [Modules documentation](MODULES_DOCUMENTATION.md)                   | Every module's pages, layers, models, params, API operations, and behavior  |
| [Components documentation](COMPONENTS_DOCUMENTATION.md)             | Shared reusable component contracts and examples                            |
| [State management](STATE_MANAGEMENT.md)                             | Pinia stores, controller state, persistence, and authentication data        |
| [API integration](API_INTEGRATION.md)                               | HTTP stack, endpoint inventory, mapping, pagination, uploads, and downloads |
| [Authentication and permissions](AUTHENTICATION_AND_PERMISSIONS.md) | Login/logout, storage, guard behavior, roles, and session expiry            |
| [Environment configuration](ENVIRONMENT_CONFIGURATION.md)           | Environment variables and stage behavior                                    |
| [Development guide](DEVELOPMENT_GUIDE.md)                           | How to extend the existing layered architecture                             |
| [Build and deployment](BUILD_AND_DEPLOYMENT.md)                     | Production bundle, Docker/nginx, SPA fallback, assets, and caching          |
| [Troubleshooting](TROUBLESHOOTING.md)                               | Installation, Vite, API, auth, routing, and build diagnostics               |

Generated inventories:

- [Routes summary](generated/routes-summary.md)
- [Modules summary](generated/modules-summary.md)
- [Components summary](generated/components-summary.md)
- [API summary](generated/api-summary.md)

## Documentation scope and confidence

This documentation was derived from `package.json`, build/lint/test configuration, `src/**`, router records, stores, module layers, localization files, Docker/nginx files, and environment variable names. It does not assume undocumented backend behavior. Items that cannot be confirmed—such as server-side authorization policy, hosting platform, CI/CD provider, token format, or production infrastructure—are explicitly labeled **Not confirmed from frontend source**.
