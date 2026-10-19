# Procurement → Requirements

October 19 update: see [execution integration changes](../../../../../docs/execution-october-19-integration.md) for START-only new-work selection, the fixed alert, updated fields/attachments, legacy handling, and outstanding backend questions.

The Quote workspace opens Requirements at
`/{organization|mainportal}/execution-quotes/show/:id/procurement`.
The Quote Show app shortcut and shared workspace navigation retain the same Quote ID.

## Implemented contract

- `POST fetch_purchase_requests`: sends only `quote_id`; maps the unpaginated
  `data` array to `PurchaseRequestModel` and `PurchaseRequestItemModel`.
- Fetched `project_floor_space` maps to `PurchaseRequestProjectFloorSpaceModel`
  with an association `id` and a nested `space` (`TitleModel` with `id`/`title`).
  Null or absent relations map to `null`; association and space IDs stay separate.
- `POST store_purchase_request`: sends `quote_id`, `employee_id`, `is_all_project`,
  `supply_responsibility`, `priority`, and `items`. A specific-space request also
  sends `project_floor_space_id`; entire-project requests omit that field.
- Each item uses `PurchaseRequestItemParams.toMap()` to send only
  `project_timeline_stage_id`, `itemable_type`, `itemable_id`, and `quantity`.
- Quantities submitted as numbers must be positive and fit DECIMAL(15,2).
  Validation rejects excess decimal places rather than rounding them. Fetched
  quantities remain decimal strings, including trailing zeros.
- Details use fetched records. There is no Show, Update, Delete, Confirm, Reject,
  Purchase Order, RFQ, offer, or invoice endpoint in this feature.

The API service extends `BaseApiService`; endpoint prefixes, base URL and employee
authentication come from existing application infrastructure. The repository uses
inherited list/create handling. The controller delegates Store to `super.create()`;
list assignment is scoped separately because the base list method cannot reject a
late response before changing state. Store retries and replay callbacks are disabled.

## Existing modules reused

- Employee, Materials and Products repositories, models and index params supply
  paginated lookup options with independent search/loading state.
- Schedule's `fetchStartedProjectTimelines()` supplies START Group main-stage choices for new items; ordinary Schedule management still uses unfiltered `readOverview()`.
  The selected association is `ProjectTimelineStageModel.id`, not its master
  `stage.id` or `quoteStageId`.
- The existing `ShopDrawingTimelineStageModel` maps the compatible timeline-stage
  reference returned inside Purchase Request items. Employee references use
  `EmployeeModel`; item display references use `TitleModel`.
- ExecutionQuote's Show repository resolves `project.id`. ProjectFloor's index
  repository fetches that Project's floors and existing space associations.
  The form submits `ProjectFloorSpace.id`, never the nested master `space.id`.
- Shared selects, buttons, DataStatusBuilder, PrimeVue Dialog/RadioButton/Skeleton,
  the router and EN/AR localization keep existing BuildHub presentation patterns.

Owner changes clear page/form state and invalidate in-flight reads and lookups.
A pending Store remains locked across owner changes; late Store responses cannot
refresh or notify another Quote. Floor lookups always send the linked Project ID,
and known foreign Project metadata is rejected. Optional ownership metadata may
be absent in the existing models; scoped API reads and backend ownership validation
remain authoritative.

## Remaining backend reference gaps

1. `purchase_request_api_documentation.md` supplies no Store response. The frontend
   follows the existing application convention of requiring an explicit boolean
   `status: true` and a successful HTTP code. Returned Store data is opaque, and
   no saved record is synthesized. Missing/ambiguous confirmation keeps the form
   open and tells the user to check Requirements before resubmitting. Confirm this
   success/error envelope against the implemented endpoint before live acceptance.
2. Schedule maps `parent_id` as optional. Procurement only permits a stage whose
   data explicitly has `parent_id = null` and no sub-stage. Omitted eligibility
   leaves that stage unavailable. The overview must include timeline association
   IDs and parent eligibility for creation to work; no ID transformation or
   additional stage endpoint has been introduced.

No Procurement screenshot was accessible in the workspace. Existing workspace and
dialog components were used as the layout reference. No live API calls or mutations
were executed for this integration; tests mock the existing network boundary.

## File manifest

Added in this module:

- `INTEGRATION.md`
- `__tests__/fixtures.ts`
- `core/constants/__tests__/purchase-request.constants.test.ts`
- `core/constants/purchase-request.constants.ts`
- `core/models/__tests__/purchase-request.item.model.test.ts`
- `core/models/__tests__/purchase-request.model.test.ts`
- `core/models/__tests__/purchase-request.project-floor-space.model.test.ts`
- `core/models/purchase-request.item.model.ts`
- `core/models/purchase-request.model.ts`
- `core/models/purchase-request.project-floor-space.model.ts`
- `core/params/__tests__/fetch.purchase-requests.params.test.ts`
- `core/params/__tests__/purchase-request.item.params.test.ts`
- `core/params/__tests__/store.purchase-request.params.test.ts`
- `core/params/fetch.purchase-requests.params.ts`
- `core/params/purchase-request.item.params.ts`
- `core/params/store.purchase-request.params.ts`
- `data/api/__tests__/purchase-request.api-service.test.ts`
- `data/api/__tests__/purchase-request.api.endpoints.test.ts`
- `data/api/purchase-request.api-service.ts`
- `data/api/purchase-request.api.endpoints.ts`
- `data/repositories/__tests__/purchase-request.repository.test.ts`
- `data/repositories/purchase-request.repository.ts`
- `index.ts`
- `presentation/__tests__/procurement.routes.test.ts`
- `presentation/components/ProcurementPage.vue`
- `presentation/components/ProcurementShortcut.vue`
- `presentation/components/PurchaseRequestDetails.vue`
- `presentation/components/PurchaseRequestFormDialog.vue`
- `presentation/components/PurchaseRequestItemRow.vue`
- `presentation/components/__tests__/ProcurementPage.test.ts`
- `presentation/components/__tests__/ProcurementShortcut.test.ts`
- `presentation/components/__tests__/PurchaseRequestDetails.test.ts`
- `presentation/components/__tests__/PurchaseRequestFormDialog.test.ts`
- `presentation/components/__tests__/PurchaseRequestItemRow.test.ts`
- `presentation/controllers/__tests__/purchase-request.controller.test.ts`
- `presentation/controllers/purchase-request.controller.ts`
- `presentation/procurement.routes.ts`
- `presentation/styles/procurement.scss`

Added view: `src/views/MainOrganization/ExecutionQuotes/Procurement/ProcurementIndex.vue`.

Modified existing files:

- `src/modules/MainOrganization/ExecutionQuotes/presentation/components/ProjectWorkspaceApps.vue`
- `src/modules/MainOrganization/ExecutionQuotes/presentation/components/ProjectWorkspaceNav.vue`
- `src/modules/MainOrganization/ExecutionQuotes/presentation/components/__tests__/ProjectWorkspaceApps.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/presentation/components/__tests__/ProjectWorkspaceNav.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/__tests__/WorkItemsPage.test.ts`
- `src/router/routes/modules/execution_quotes.ts`
- `src/router/routes/modules/execution_quotes.test.ts`
- `src/locales/en.json`
- `src/locales/ar.json`

## Validation results

- Focused Procurement/workspace/router tests: 100 passed across 20 files.
- `npm run test:run -- --maxWorkers=4`: 2,553 passed, 174 failed;
  876 passing and 145 failing files. Every reported failure was reproduced
  on the detached, untouched baseline, including existing empty test files.
- Existing Schedule/SiteTeam/WorkItems regression comparison: 48 pre-existing
  failures. Updated navigation expectations and the focused workspace tests pass.
- `npm run type-check`: exit 0. The explicit application check,
  `npx vue-tsc --noEmit -p tsconfig.app.json`, still reports the same 212
  diagnostics as the untouched baseline; no new application diagnostics.
- Focused ESLint, Stylelint, Prettier and `git diff --check`: pass.
- `npx vite build`: pass. New production files all have companion tests;
  all 86 new Procurement/validation translation keys have EN/AR coverage.

No dependencies were added. No commits, pushes, merges, or cherry-picks were made.
