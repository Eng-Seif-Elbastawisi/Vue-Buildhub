# Site & Team integration

Site & Team lives beside Schedule under ExecutionQuotes. It uses the existing
application shell and FeatureHeader, with a thin view wrapper and routes under
both organization and mainportal:

`execution-quotes/show/:id/site-team` — `Quote Site Team`.

Quote Show mounts `SiteTeamShortcut` beside `ScheduleShortcut`. The shared
`ProjectManagementShortcut` accepts an optional action label; Schedule retains
its previous default. Site & Team exposes only loaded metrics belonging to the
current Quote and does not fetch or manufacture shortcut counts.

## Implementation

- `core/models/project.site-info.model.ts`: nullable/missing site values.
- `core/models/quote.engineers.model.ts`: existing EmployeeModel mapping.
- `core/params/quote.site-team.params.ts`: validated Quote owner.
- `core/params/assign.quote.engineers.params.ts`: unique positive primitive IDs.
- `core/params/update.project.site-info.params.ts`: exact date-only request fields.
- `data/api/site-team.api.endpoints.ts` and `site-team.api-service.ts`: four
  confirmed Quote endpoints, authenticated JSON POST, retries and static data disabled.
- `data/repositories/site-team.repository.ts`: strict response verification,
  model mapping, and existing DataState error handling.
- `presentation/controllers/site-team.controller.ts`: separate states for owner,
  site information, assigned engineers, employees, floors, Space options and each
  submission; Quote epochs and per-resource request generations reject late data.
- `presentation/components/SiteTeamPage.vue`: site, locations and team summaries;
  expandable floor hierarchy, saved dimensions/notes, assigned engineer list.
- `SiteInfoDialog.vue`: populated date input and textarea; validation, duplicate
  submission prevention, form preservation after errors.
- `EngineerSelectionDialog.vue`: restored multi-selection, searchable/paginated
  Employee options, unique selected chips/rows, count and deselection. Removal of
  saved assignments is blocked pending backend semantics.
- `AddProjectSpacesDialog.vue`: existing floor selection and multiple existing
  Space rows, searchable/paginated Space options, decimal dimensions, notes and
  accessible row validation. Repeated Space IDs remain allowed.
- `SiteTeamShortcut.vue`, `presentation/site-team.routes.ts`, and `index.ts`:
  public entrypoints and Quote-scoped navigation.
- `presentation/styles/site-team.scss`: inherited BuildHub tokens, cards,
  responsive single-column layouts, focus indicators and reduced-motion handling.

Every new production TS/Vue file has a companion test, excluding the module
barrels and the thin view wrapper according to the repository hook rules.

## Existing modules extended or reused

ProjectFloor adds `AddProjectFloorSpaceParams` and `AddProjectFloorSpacesParams`,
plus their tests and public exports. The existing endpoints, API service,
repository and controller expose `addSpaces`; their existing tests are preserved
and extended. Existing floor reads and ProjectFloorModel mapping are reused.

EmployeeModel, EmployeeRepository and IndexEmployeeParams supply employees.
SpaceModel mapping, SpaceRepository and IndexSpaceParams supply existing Space
records. SiteTeamController provides scoped option-controller adapters for the
existing `UpdatedCustomInputSelect`, rather than adding network calls to dialogs.

ExecutionQuoteShowModel, its linked Project model and ExecutionQuoteRepository
resolve the owner. The existing BaseApiService, BaseRepository, BaseController,
DataState, AppButton, DataStatusBuilder and PrimeVue Dialog infrastructure remain
in use. No new store, dependency or API framework is introduced.

EN/AR locale files add `site_team.*` labels and missing validation field labels.
The workspace uses logical CSS properties and Arabic reading direction. The
shell keeps responsibility for the page title and breadcrumb.

## Contract limits

See [BACKEND_CONTRACT_GAPS.md](./BACKEND_CONTRACT_GAPS.md) for unverified engineer
envelopes, mutation acknowledgements, assignment semantics, duplicate-space
behavior and dimension units. Unknown writes are never simulated as successful.
An acknowledged mutation triggers an authoritative read; failed refreshes remain
visible through the existing read-error states.

## Validation

Validation results are recorded below after the final runs. Browser preview data
is isolated in a temporary fixture server, outside the application source tree;
external browser requests and all preview mutations are disabled.

Focused validation passes all 131 tests across 24 files: 70 Site & Team tests,
21 shared-selector tests, and 40 ProjectFloor/navigation/shortcut tests. This includes
empty paginated lookup classification, multiple selection and restoration,
primitive/nested serialization, malformed responses, failed-form preservation,
correct Project ownership, authoritative refreshes, and stale/duplicate request guards.
Companion-file verification found no missing tests for changed production files.

The completed full-suite run reports 837 passed / 135 failed files and
2367 passed / 153 failed tests (972 files, 2520 tests). Every failing file and
case name was reproduced at the baseline commit; the two failure maps are identical.
The baseline full run reports 820 passed / 135 failed files and
2282 passed / 153 failed tests (955 files, 2435 tests). The final focused run
also covers the later single-selector pagination and empty-lookup refinements.
The unchanged baseline failures include missing imports in legacy tests and
existing Schedule/Quote/ProjectFloor fixtures that disagree with current models.

`npm run type-check` passes. The stronger direct app check,
`npx vue-tsc --noEmit -p tsconfig.app.json`, reports 208 existing diagnostics. An
archived copy of commit `b8257d6e` reports the identical diagnostics after
normalizing source line shifts and checkout paths. No TypeScript setting was weakened.

Focused ESLint reports no errors: the feature and shared selector are clean;
Quote Show retains two existing attribute-order warnings. Focused stylelint and
`git diff --check` pass. Mocked browser verification covered 1440px desktop,
390px mobile, Arabic RTL, unlinked/empty state, and engineer/space dialogs with no
runtime errors or horizontal overflow. A feature-scoped style override preserves
workspace spacing despite the inherited CRUD root styles, and the shell owns the
single page title.

No live API calls or backend mutations were executed. No commit or push was made.
