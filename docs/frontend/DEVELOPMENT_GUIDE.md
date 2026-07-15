# Development guide

[Documentation home](README.md) · [Project structure](PROJECT_STRUCTURE.md) · [Modules](MODULES_DOCUMENTATION.md) · [API integration](API_INTEGRATION.md) · [Components](COMPONENTS_DOCUMENTATION.md)

## Working principles

Use the existing layered flow for business features:

```text
src/views route wrapper
  -> module presentation component
  -> singleton controller
  -> singleton repository
  -> singleton API service
  -> endpoint class / shared network layer
```

Do not put Axios calls in Vue components. Models own response mapping, params own request serialization/validation, repositories own data-state conversion, and controllers own reactive presentation orchestration.

The [`employee` module](../../src/modules/MainOrganization/employee) is the most complete conventional CRUD reference. Check the target area too, because filename capitalization and a few ID keys vary between modules.

## Add a feature module

Choose the module root based on actual ownership:

- `src/modules/MainAdmin/<Feature>` for admin-only behavior;
- `src/modules/MainOrganization/<Feature>` for organization workflows;
- `src/modules/shared/<Feature>` for a catalog intentionally expanded beneath both app prefixes.

Use this shape when the feature needs full CRUD:

```text
<Feature>/
├── core/
│   ├── constants/                 # only if the backend exposes fixed values
│   ├── models/<feature>.model.ts
│   └── params/
│       ├── index.<feature>.params.ts
│       ├── show.<feature>.params.ts
│       ├── add.<feature>.params.ts
│       ├── edit.<feature>.params.ts
│       └── delete.<feature>.params.ts
├── data/
│   ├── api/<feature>.api.endpoints.ts
│   ├── api/<feature>.api-service.ts
│   └── repositories/<feature>.repository.ts
└── presentation/
    ├── components/<Feature>{Index,Add,Edit,Form}.vue
    └── controllers/<feature>.controller.ts
```

Only add `domain/repositories` or `useCase` when the neighboring module uses those abstractions for real behavior; most current CRUD modules call the data repository directly from the controller.

## Add a model

1. Create the class in `core/models`.
2. Type properties explicitly under strict TypeScript.
3. Add a static mapping method matching the module convention (`fromMap` or `fromJson`).
4. Map backend snake_case fields deliberately; do not spread untyped payloads into application state.
5. Use shared models such as title/translation or pagination where the response actually matches.
6. Add representative mapping tests, including absent optional fields.

Example pattern:

```ts
export default class FeatureModel {
  constructor(
    public readonly id: number,
    public readonly title: string,
  ) {}

  static fromMap(data: Record<string, unknown>): FeatureModel {
    return new FeatureModel(Number(data.id), String(data.title ?? ''));
  }
}
```

Do not copy `example` fixture secrets or real user data into a model.

## Create params

Params classes extend the appropriate shared base from [`src/base/Core/Params`](../../src/base/Core/Params), define a static `ClassValidation`, and implement `toMap()` using backend field names.

```ts
export default class AddFeatureParams extends Params {
  static readonly validation = new ClassValidation().setRules({
    title: [new RequiredRule()],
  });

  constructor(public title: string) {
    super();
  }

  toMap() {
    return { title: this.title };
  }
}
```

Use `IndexParams` for the established `word`, `page`, `per_page`, and `with_pagination` convention. ID keys differ by API (`id`, `project_id`, `measurement_unit_id`, etc.); copy the confirmed backend key from the matching endpoint/module rather than normalizing it speculatively.

## Add endpoint and service classes

Create an endpoint class extending [`BaseEndpoints`](../../src/base/Data/Endpoints/BaseEndpoints.ts). Shared/dual-area modules use the current user type to select a prefix; fixed-area modules declare a constant prefix.

```ts
export class FeatureEndpoints extends BaseEndpoints {
  protected get prefix(): string {
    return useUserStore().user?.type === 1 ? 'mainportal/' : 'organization/';
  }

  readonly index = this.url('fetch_features');
  readonly show = this.url('show_feature');
  readonly store = this.url('store_feature');
  readonly update = this.url('update_feature');
  readonly delete = this.url('delete_feature');
}
```

The service extends [`BaseApiService`](../../src/base/Data/ApiService/baseApiService.ts), maps its five protected endpoints, and exposes `getInstance()` with a private constructor. Use `customPost` only for a confirmed non-CRUD endpoint.

Standard create requests use multipart POST unless callers pass `{ useJson: true }`; other standard CRUD calls default to POST. Confirm payload requirements before choosing JSON versus multipart.

## Add a repository

Extend [`BaseRepository`](../../src/base/Domain/Repositories/baseRepository.ts) with the item and list types. Implement:

- singleton `getInstance()`;
- `apiService` getter;
- `parseItem()` and `parseList()`;
- `config.hasPagination` when the endpoint returns nested `data`/`meta`;
- `mockItem`/`mockList` if test-stage static data must be supported.

Repositories must return `DataState`, not raw Axios responses. A custom endpoint should use the protected execution/mapping helpers so timeout, offline, cancellation, and server errors stay consistent.

## Create a controller

Extend [`BaseController`](../../src/base/Presentation/Controller/baseController.ts) and expose a singleton:

```ts
export default class FeatureController extends BaseController<FeatureModel, FeatureModel[]> {
  private static instance: FeatureController;

  protected get repository() {
    return FeatureRepository.getInstance();
  }

  static getInstance() {
    return (this.instance ??= new FeatureController());
  }
}
```

Follow neighboring controllers for `ControllerConfig`, navigation after success, form-draft clearing, and custom actions. Do not instantiate controllers ad hoc inside components.

## Add presentation components and a page

Keep the routed file in `src/views` thin:

```vue
<script setup lang="ts">
  import FeatureIndex from '@/modules/shared/Feature/presentation/components/FeatureIndex.vue';
</script>

<template>
  <FeatureIndex />
</template>
```

The module component owns controller interaction and composed UI. Prefer existing shared components:

- `DataStatusBuilder` for list/item states;
- `AppTable`, `DropList`, and `Pagination` for indexes;
- `UpdatedCustomInputSelect` for controller-backed relations;
- `LangTitleInput`/`MultiLangInput` for localized payloads;
- `HandleFilesUpload` for browser file selection;
- `FieldHelpIcon` for contextual form help.

Every user-facing string must be an i18n key. Keep Vue blocks in `script` → `template` → `style` order.

## Add a route

Route arrays live under [`src/router/routes`](../../src/router/routes). Add the record to the correct module group, then ensure its group is included by the admin or organization aggregate.

Shared routes are expanded beneath both prefixes with [`addSuffix()` in `src/router/helpers/routeGenerator.ts`](../../src/router/helpers/routeGenerator.ts), which suffixes names with `Admin` or `Organization`. Use unique base names and verify the final name/path for both expansions.

```ts
{
  path: 'features',
  name: 'Features',
  component: () => import('@/views/shared/Feature/FeatureIndex.vue'),
}
```

Children use relative paths because they are nested beneath `/admin` or `/organization`. Parameters use `:id`; optional parameters use `:id?`. Parent routes declare `meta.allowedUserTypes`, and administrator CRUD children repeat the admin requirement because shared expansion also places them under `/organization`. Add user-type metadata only with values from `UserType`; do not invent granular permissions that are absent from the authenticated user response. Sidebar visibility is not authorization.

After adding a route:

1. Add the i18n title used by navigation/breadcrumbs.
2. Add a sidebar item only for an intended navigable surface.
3. Test direct URL entry, refresh, both role types, and unknown IDs.
4. Check for duplicate names and paths with the route summary workflow in [Routes documentation](ROUTES_DOCUMENTATION.md).

## Adding API behavior

For an existing module:

1. Confirm the endpoint suffix and prefix.
2. Add a dedicated params class.
3. Add a service method (`customPost` for the current backend style).
4. Parse a concrete response model in the repository.
5. Expose a controller method and reactive state.
6. Render all `DataState` outcomes.
7. Write tests at params/model, endpoint/service, repository, controller, and component boundaries as appropriate.

Never log credentials or token-bearing payloads. See [API integration](API_INTEGRATION.md).

## Add translations

The application initializes Vue I18n in [`src/locales/i18n.ts`](../../src/locales/i18n.ts) from:

- [`src/locales/en.json`](../../src/locales/en.json)
- [`src/locales/ar.json`](../../src/locales/ar.json)

Add every new key to both files with the same nesting. In script use `const { t } = useI18n()`; in templates use `$t('key')`. Verify English, Arabic, and RTL layout. Do not hard-code a visible fallback in one language.

The current catalogs are not perfectly symmetric; see [Troubleshooting](TROUBLESHOOTING.md#missing-or-untranslated-labels).

## Styling conventions

- Prefer existing CSS custom properties and SCSS tokens over literal colors.
- Vite configures `src/styles` as an SCSS load path.
- The application imports `src/styles/main.min.css`; edits only to `main.scss` are not automatically reflected unless the generated CSS is rebuilt through the project's established stylesheet workflow.
- Keep component styles scoped unless a shared global rule is intentional.
- Test desktop/mobile and Arabic RTL layouts.
- Preserve exact filesystem casing; Linux/Docker imports are case-sensitive.

## Tests

Tests use Vitest, Vue Test Utils, Testing Library Vue, and jsdom.

```bash
npm test
npm run test:run
npm run test:coverage
npx vitest run path/to/file.test.ts
npx vitest run -t "test name"
```

For a staged `src/**/*.ts` or `.vue` file, [`scripts/check-test-coverage.mjs`](../../scripts/check-test-coverage.mjs) requires a companion test unless the file is in an excluded infrastructure/view/store/locale/assets/styles/icons category. Accepted locations include `__tests__/<Name>.test.ts`, `__tests__/<Name>.spec.ts`, and colocated `.test.ts`/`.spec.ts`.

## Quality checks and hooks

Run before handing off a feature:

```bash
npm run lint
npm run type-check
npm run test:run
npm run build
```

`npm run lint` applies fixes, so review the diff afterward.

The executable hooks currently do the following:

- pre-commit: `lint-staged`, `npm run type-check`, Stylelint on staged Vue/CSS/SCSS, then the companion-test check;
- pre-push: type-check changed source, discover matching companion tests, and run only those tests;
- commit message: commitlint with conventional commits, lowercase subject, kebab-case scope, no trailing period, and a 200-character header limit.

The `gitPush` npm script bypasses hooks and should not be used as a normal validation workflow.

## Existing TypeScript and lint constraints

- Strict TypeScript, `noUnusedLocals`, and `noUnusedParameters` are enabled.
- Avoid `any` in new contracts even though older modules contain it.
- ESLint permits only `console.warn` and `console.error`; other console calls warn.
- Vue block ordering is enforced.
- Preserve singleton access for controllers/repositories/services.
- Treat executable imports, routes, and endpoint classes as authoritative when copied comments disagree.
