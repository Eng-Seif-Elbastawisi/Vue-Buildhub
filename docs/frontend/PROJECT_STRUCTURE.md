# Project structure

[Documentation home](README.md) · [Modules](MODULES_DOCUMENTATION.md) · [Components](COMPONENTS_DOCUMENTATION.md) · [Development guide](DEVELOPMENT_GUIDE.md)

## Top-level structure

```text
buildhub/
├── .env*                     # stage selector name (VITE_APP_ENV)
├── .husky/                   # commit, pre-commit, and pre-push hooks
├── docs/frontend/            # this documentation set
├── public/                   # files copied without transformation
├── scripts/                  # repository quality scripts
├── src/                      # application source
├── Dockerfile                # Node build + nginx runtime image
├── nginx.conf                # SPA fallback and cache policy
├── index.html                # Vite HTML entry; title is BuildHub
├── package.json              # dependencies, scripts, Node engine
├── package-lock.json         # npm dependency lock
├── tsconfig*.json            # application, Node, and test TypeScript configs
└── vite.config.ts            # Vue plugin, @ alias, SCSS load path
```

## `src` directory tree

The tree is intentionally summarized at meaningful boundaries; [Modules documentation](MODULES_DOCUMENTATION.md) enumerates every feature.

```text
src/
├── main.ts
├── App.vue
├── assets/
│   ├── fonts/
│   └── images/
├── base/
│   ├── Core/
│   │   ├── Config/
│   │   ├── Constants/
│   │   ├── Models/
│   │   ├── NetworkStructure/
│   │   └── Params/
│   ├── Data/
│   │   ├── ApiService/
│   │   └── Endpoints/
│   ├── Domain/Repositories/
│   └── Presentation/
│       ├── Controller/
│       ├── Dialogs/
│       └── Utils/
├── components/               # retained Vue starter/demo components
├── locales/
│   ├── en.json
│   ├── ar.json
│   └── i18n.ts
├── modules/
│   ├── MainAdmin/
│   │   ├── admin/
│   │   └── auth_admin/
│   ├── MainOrganization/
│   │   ├── Project/
│   │   ├── Invoice/
│   │   └── ...
│   ├── shared/                # catalogs usable under both app prefixes
│   ├── auth/                  # shared auth shell and a generic auth scaffold
│   └── country/               # country selector/CRUD scaffold
├── router/
│   ├── guards.ts
│   ├── helpers/
│   └── routes/
│       ├── admin/
│       ├── modules/
│       └── shared/
├── shared/
│   ├── DataStatues/
│   ├── FormInputs/
│   ├── HelpersComponents/
│   ├── LayoutComponents/
│   ├── icons/
│   └── ...
├── stores/
├── styles/
└── views/
    ├── MainAdmin/
    ├── MainOrganization/
    ├── shared/
    ├── auth/
    └── error/
```

## Major folder responsibilities

| Path                               | Purpose                                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------------------- |
| `src/assets`                       | Source images, fonts, starter CSS, and static visual assets imported by components       |
| `src/base/Core/Config`             | Reactive environment-stage configuration and defaults                                    |
| `src/base/Core/NetworkStructure`   | Axios network service, headers, typed exceptions, error mapping, and `DataState` classes |
| `src/base/Core/Models`             | Generic title/description and pagination models                                          |
| `src/base/Core/Params`             | Base request interfaces, index pagination/search params, IDs, and translations           |
| `src/base/Data/ApiService`         | HTTP method selection and shared CRUD/custom service operations                          |
| `src/base/Data/Endpoints`          | Base URL composition class                                                               |
| `src/base/Domain/Repositories`     | Generic CRUD, response mapping, pagination, retries, and state conversion                |
| `src/base/Presentation/Controller` | Reactive list/item controller base and UI feedback coordination                          |
| `src/base/Presentation/Dialogs`    | Globally mounted dialog and toast system                                                 |
| `src/base/Presentation/Utils`      | Date/file/base64/validation/enum/notification and other reusable helpers                 |
| `src/modules`                      | Business feature implementations using the layered pattern                               |
| `src/router`                       | Top-level router, guard, route arrays, suffixing helpers, and breadcrumb types           |
| `src/shared`                       | Reusable UI, layout/navigation, data-state rendering, form controls, exports, and icons  |
| `src/stores`                       | Pinia state and the route-search composable-like module                                  |
| `src/locales`                      | Vue I18n bootstrap and English/Arabic message catalogs                                   |
| `src/styles`                       | SCSS tokens, mixins, feature imports, and generated CSS artifacts                        |
| `src/views`                        | Thin route components; they should not contain network logic                             |
| `src/components`                   | Vue starter components retained for inactive `HomeView.vue`; not part of active router   |

## Module structure

A typical module, using employee as a canonical example, looks like:

```text
src/modules/MainOrganization/employee/
├── core/
│   ├── constants/type.enum.ts
│   ├── models/employee.model.ts
│   └── params/{add,delete,edit,index,show}.employee.params.ts
├── data/
│   ├── api/employee.api.endpoints.ts
│   ├── api/employee.api-service.ts
│   └── repositories/employee.repository.ts
├── domain/repositories/employee.repo.ts
└── presentation/
    ├── components/Employee{Add,Edit,Form,Index}.vue
    └── controllers/employee.controller.ts
```

Not every module contains every optional directory. Executable imports and route files are the source of truth; some README/header comments retain copy-pasted names.

## Entry points and layouts

| File                                              | Role                                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/main.ts`                                     | Creates the app, installs plugins, restores the user session, loads the saved identity palette, mounts `#app` |
| `src/App.vue`                                     | Global dialog/toast hosts and root router outlet                                                              |
| `src/router/index.ts`                             | Router creation, route families, history mode, and global guard registration                                  |
| `src/views/AppLayout.vue`                         | Protected route wrapper                                                                                       |
| `src/shared/LayoutComponents/DashboardLayout.vue` | Responsive sidebar/navbar/feature-header shell                                                                |

## Naming conventions observed

- Vue route wrappers generally use PascalCase (`AddInvoice.vue`); module presentation components commonly append `Index`, `Add`, `Edit`, `Form`, or `Show`.
- Models use `*.model.ts`; detailed response models often use `*.show.model.ts`.
- Request classes use action-first names such as `add.invoice.params.ts`, `index.project.params.ts`, and `show.space.params.ts`.
- Endpoint and service files use `*.api.endpoints.ts` and `*.api-service.ts`.
- Repositories use `*.repository.ts`; controllers use `*.controller.ts`.
- Tests are colocated in `__tests__` or use `.test.ts`/`.spec.ts` beside the source.
- Most services, repositories, and controllers expose `static getInstance()` and hide constructors.
- API payloads use snake_case. Component props and local TypeScript are mixed between snake_case and camelCase according to module age.
- Folder/file casing is inconsistent (`Materials`, `measurement`, `Suppliers`, `project.Item.*`). Imports must match exact filesystem casing, especially in Linux/Docker.
- `.vue` blocks are expected in script → template → style order.

## Styling structure

[`src/main.ts`](../../src/main.ts) imports [`src/styles/main.min.css`](../../src/styles/main.min.css), not `main.scss`. `main.scss`, partials, source maps, `main.css`, and `main.min.css` are committed. Vite SCSS `loadPaths` points at `src/styles`, allowing imports such as `@use 'abstracts'`. Prefer CSS custom properties and SCSS tokens over literal colors because Stylelint warns on many literal color values.

## Tests and generated artifacts

The repository has extensive companion tests under feature `__tests__` directories. `dist/`, coverage output, and TypeScript build info are generated and excluded by tooling. Documentation files are outside the staged-source companion-test rule in [`scripts/check-test-coverage.mjs`](../../scripts/check-test-coverage.mjs).
