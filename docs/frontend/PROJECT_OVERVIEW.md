# Project overview

[Documentation home](README.md) · [Modules](MODULES_DOCUMENTATION.md) · [Routes](ROUTES_DOCUMENTATION.md) · [Architecture details](PROJECT_STRUCTURE.md)

## Business purpose

BuildHub is a construction operations frontend. The implemented UI supports the lifecycle from a project/request and client record through site preview, floor/space capture, item pricing, conversion/versioning, invoicing, and payment tracking. It also exposes administration and master-data maintenance required by those flows.

This description is an implementation-derived inference from route names, forms, models, endpoint names, and localization keys. A formal business requirements document was not present in the inspected frontend source.

## Main user types

The [`UserType`](../../src/modules/auth/core/constants/userType.enum.ts) contract and route guard in [`src/router/guards.ts`](../../src/router/guards.ts) recognize two numeric values:

| `user.type` | Frontend designation               | App prefix      | Login page            | Confirmed behavior                                                               |
| ----------- | ---------------------------------- | --------------- | --------------------- | -------------------------------------------------------------------------------- |
| `1`         | Platform/main-portal administrator | `/admin`        | `/login-admin`        | Redirected to the admin application; sees admin-role sidebar items               |
| `2`         | Organization user/employee         | `/organization` | `/login-organization` | Redirected to the organization application; sees organization-role sidebar items |

The user model also contains `isMaster`, but the global route guard does not use it. Sidebar components treat `isMaster` as an admin role for menu construction. No additional role hierarchy or permission list is implemented. See [Authentication and permissions](AUTHENTICATION_AND_PERMISSIONS.md).

## Main application flows

### Sign in and app selection

1. The user opens the admin or organization login page.
2. A `LoginParams` payload sends `credentials` and `password` to the relevant login endpoint.
3. The response is mapped to `UserModel` and persisted in the Pinia `user` store.
4. The login form navigates to the named `Admin` or `Employee` list route, while the guard maps `user.type` to the `/admin` or `/organization` application prefix and prevents crossing between them.

### CRM request to project

1. Organization users manage clients and pending project requests.
2. A project can be previewed by an engineer with a date, time, location link, address, and notification data.
3. Floors, spaces, attachments, and final inspection results are captured.
4. Project/department items are priced by general item, full-floor, or space-related method.
5. Pricing applies fixed or percentage discounts.
6. Project actions support conversion, version storage/revision, status history, and a detailed client-side PDF.

The exact backend state-transition rules are **not confirmed from frontend source** beyond the numeric enums and exposed endpoints.

### Finance

Invoice pages create, list, edit, show, export, and delete invoices. The detailed screen summarizes project/client data, items, status, payments, totals, notes, and timeline data. Payments support bank transfer, cash, cheque, and wallet methods. The frontend also generates invoice and receipt PDFs locally.

### Administration and setup

Platform administrators manage administrator and organization records. Both app prefixes register many shared catalog screens. Organization-specific setup includes employees, specializations, suppliers, organization terms, system identity, and an organization `fetch_from` toggle. The guard enforces application user type, prefix, and administrator-route metadata, but it cannot enforce individual action permissions because none are mapped from the login response.

## Frontend architecture

### Application shell

- [`src/main.ts`](../../src/main.ts) installs PrimeVue, Pinia, persisted state, Vue Router, Vue I18n, and toast services.
- [`src/App.vue`](../../src/App.vue) hosts global dialogs/toasts and the root `RouterView`.
- [`src/views/AppLayout.vue`](../../src/views/AppLayout.vue) wraps protected children in [`DashboardLayout.vue`](../../src/shared/LayoutComponents/DashboardLayout.vue).
- The dashboard layout composes desktop/mobile navigation, the route-derived feature header, and routed content.

### Layered feature modules

Most CRUD modules use these folders:

| Layer                      | Responsibility                                                  |
| -------------------------- | --------------------------------------------------------------- |
| `core/models`              | Immutable/read models and API response mapping (`fromJson`)     |
| `core/params`              | Request validation and snake_case serialization (`toMap`)       |
| `core/constant(s)`         | Numeric domain enums and label-key helpers                      |
| `data/api`                 | Endpoint strings and singleton service configuration            |
| `data/repositories`        | Response parsing, pagination, mocks, and `DataState` conversion |
| `domain/repositories`      | Optional repository abstraction; present in a few modules       |
| `presentation/controllers` | Singleton reactive orchestration on top of repositories         |
| `presentation/components`  | Forms, lists, detail screens, and module-local sections         |
| `src/views`                | Thin route targets mounting presentation components             |

Shared infrastructure lives under [`src/base`](../../src/base), while cross-feature UI lives under [`src/shared`](../../src/shared).

### Data and error flow

`BaseApiService` selects POST/GET/FormData/etc.; `NetworkService` sends Axios requests; `BaseRepository` maps responses into `DataSuccess`, `DataEmpty`, `DataFailed`, timeout, offline, cancellation, progress, or rate-limit states; `BaseController` exposes reactive `listState` and `itemState`. Most list repositories expect pagination under `response.data.data.meta` with rows under `response.data.data.data`.

## Technology stack

| Technology         | Source-confirmed use                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------- |
| Vue 3 + TypeScript | SFCs, Composition API, strict TypeScript                                                     |
| Vite               | Dev server, dynamic import bundling, production build                                        |
| Vue Router         | Lazy-loaded route components and global auth guard                                           |
| Pinia              | User, country, form drafts, theme, and starter counter state                                 |
| Vue I18n           | English/Arabic messages, runtime direction and locale headers                                |
| PrimeVue           | Accordion, dialogs, drawers, popovers, inputs, skeletons, toast, and theme                   |
| Axios              | Centralized HTTP instance, interceptors, retries, progress, cancellation                     |
| SCSS               | Token/mixin-based styles compiled by Vite; precompiled `main.min.css` is imported at runtime |
| Vitest             | Unit and component tests                                                                     |

## Important third-party packages

| Package                                            | Purpose in source                                                               |
| -------------------------------------------------- | ------------------------------------------------------------------------------- |
| `pinia-plugin-persistedstate`                      | Persists user/country/theme in local storage and form drafts in session storage |
| `@primeuix/themes`                                 | Supplies the PrimeVue Aura preset                                               |
| `xlsx` + `file-saver`                              | Client-side spreadsheet export in `ExportExcel.vue`                             |
| `jspdf`, `jspdf-autotable`, `html2canvas`          | Client-side project, invoice, receipt, and table PDF generation                 |
| `cropperjs`                                        | Image/logo cropping support in system identity UI                               |
| `primeicons`                                       | UI icon font                                                                    |
| `sass-embedded`                                    | SCSS preprocessing                                                              |
| `@vue/test-utils`, `@testing-library/vue`, `jsdom` | Component testing                                                               |

## Known scope boundaries

- Server-side access control, database rules, audit behavior, and API implementation are **not confirmed from frontend source**.
- No websocket, service worker, analytics, or telemetry integration was found.
- No CI workflow was present in `.github`; local Husky gates and Docker/nginx deployment files are present.
- `HomeView.vue`, `AboutView.vue`, generic country CRUD views, and some Vue starter components exist but are not registered by the active router.
