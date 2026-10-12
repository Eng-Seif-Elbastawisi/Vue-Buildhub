# Work Items integration

Work Items lives in the Quote workspace at `execution-quotes/show/:id/work-items` under the existing organization/mainportal route prefixes. The app launcher and shared navigation retain Schedule and Site & Team.

## Implementation boundary

One `WorkItemsApiService`, `WorkItemsRepository`, and `WorkItemsController` extend the existing base classes and use `getInstance()`. Custom operations are needed for four response types and independent owner-safe state. Transport stays in `data/api`; repositories map verified Fetch envelopes. No new store, dependency, form engine, or Project entity was introduced.

`FetchWorkItemsParams` sends only `quote_id`. `StoreTaskParams`, `StoreReportParams`, and `StoreActivityParams` send `project_timeline_stage_id` without Quote or Project IDs. Task nullable employee/date and report nullable notes remain null. Activity serialization sends date for Meeting; other types send description and employee ID and omit date. No nested request payload is needed.

`WorkTaskModel`, `DailyReportModel`, and `WorkActivityModel` map the collection rows. Existing `EmployeeModel.fromJson()` handles nested `{id, name, type}` references, including the `type` → `employee_type` mapping. Creator and optional assignee have separate model fields; no new employee model was necessary. Malformed response objects, rows, IDs, and enum values produce failed state rather than empty success.

## Reused modules and controls

- Schedule: `ScheduleRepository.readOverview()`, `ScheduleOwnerParams`, `ScheduleGroupModel`, `ProjectTimelineStageModel`. Selection uses `ProjectTimelineStageModel.id`, never its `quoteStageId` or nested master-stage ID. Only explicitly available parent timeline stages are offered; child-stage identifiers are not guessed.
- Employee: `EmployeeRepository`, `IndexEmployeeParams`, and `EmployeeModel`. The existing search/page request mechanism and shared selector pagination are retained without an invented role filter.
- Workspace: `ProjectWorkspaceApps`, `ProjectWorkspaceNav`, `ProjectManagementShortcut`, and `quotePath` prefix resolution. Schedule and Site & Team keep their existing diagrams; Work Items uses a decorative checklist SVG for its `pi-list-check` shortcut.
- Forms: `UpdatedCustomInputSelect`, `AppButton`, PrimeVue `Dialog` and `Skeleton`, and `input-wrapper` styles.

`WorkItemStageSelect` shares the stage options, loading/retry/unavailable behavior across the three forms. `EngineerTasksList`, `DailyReportsList` and `WorkActivitiesList` own their record-specific presentation. Their props are respectively `DataState<WorkTaskModel[]>`, `DataState<DailyReportModel[]>` and `DataState<WorkActivityModel[]>`, plus `stageLabel: (id: number) => string`. They emit `retry`; `WorkItemsPage` connects it to `loadTasks()`, `loadReports()` and `loadActivities()` on the controller. The extracted components do not fetch or mutate data.

`WorkItemSection` shares loading, error/retry and empty-state rendering inside a native `details`/`summary` accordion. Each section starts expanded and toggles independently with native keyboard support. Collapsing keeps its body mounted, preserving the activity filter. The three focused forms and network layer are unchanged by this refactor.

## Behavior

Separate list and submission states prevent one operation from overwriting another. Quote activation clears owned state and increments the request epoch; per-resource request counters prevent earlier reads from overwriting newer reads. Saving checks stage membership in the currently loaded Quote. Late mutation results cannot refresh a different Quote or close its form. Submission stays disabled through the authoritative affected-list refresh. Mutations have automatic retry disabled.

Successful explicit backend confirmation triggers feedback, refresh, and dialog closure. A failed response preserves the form and shows the error. A refresh failure after confirmed creation is shown in the list; it does not fabricate the newly created record or retry the mutation. Activity filters operate on the one fetched collection. The activity header count describes the full collection rather than the filtered records, so it remains truthful while the filter is hidden in a collapsed section. Counts disappear during loading, error or unavailable data; loaded empty collections show zero. Each list is keyed by Quote ID, so owner changes remount the lists, reset the activity filter to All and start the sections expanded.

English and Arabic labels are provided. Date inputs serialize their original `YYYY-MM-DD` strings without timezone conversion. Responsive metadata and action grids use logical layout properties. Quantities, approval, progress, Start Item, editing/deletion, and task transitions are outside this integration. The later Shop Drawing contract enables drawing creation and Fetch inside this workspace.

## Exact outstanding backend contract gaps

The supplied [contract](../../../../../docs/project_timeline_stage_endpoints.md) confirms request fields and Fetch `{status, message, data: [...]}` envelopes. It does **not** specify HTTP methods, complete Store success bodies, validation envelopes, or authorization error bodies.

- All six operations currently use POST, matching the existing `BaseApiService` and adjacent workspace transport convention. Backend confirmation of those methods is still required.
- Store accepts only a 2xx response with an explicit `status: true`, following existing workspace envelope checks. Missing or false status fails explicitly, even for a 2xx response. No undocumented Store record object is parsed; authoritative Fetch is used after success. Backend fixtures must confirm the success status/message contract for all three Store operations.
- Error and unauthorized handling use the existing base network/repository infrastructure. Backend validation field/error envelope fixtures remain needed to verify its exact compatibility.
- Schedule currently exposes timeline-stage association IDs and labels; a live response must conform to its existing parser, including `quote_stage_id`. If that parser cannot load the stages, creation is unavailable with retry guidance while Work Items reads remain independent. No ID substitution is attempted.

No live backend reads or mutations were executed. Browser and automated tests mock the network boundary. No commit or push was performed.

## Files added and changed

Added within this directory:

- `core/constants/work-items.constants.ts`.
- `core/params/fetch.work-items.params.ts`, `store.task.params.ts`, `store.report.params.ts`, `store.activity.params.ts`.
- `core/models/task.model.ts`, `report.model.ts`, `activity.model.ts`, `work-items.response.ts`.
- `data/api/work-items.api.endpoints.ts`, `work-items.api-service.ts`; `data/repositories/work-items.repository.ts`.
- `presentation/controllers/work-items.controller.ts`; `presentation/work-items.routes.ts`.
- `presentation/components/WorkItemsPage.vue`, `WorkItemsShortcut.vue`, `WorkItemStageSelect.vue`, `WorkItemSection.vue`, `TaskFormDialog.vue`, `DailyReportFormDialog.vue`, `MeetingIssueFormDialog.vue`.
- `presentation/styles/_work-items.scss`, `index.ts`, this integration note, and `DESIGN_REVIEW.md`.
- Companion tests under each affected layer's `__tests__/` directory. The accordion extraction adds `EngineerTasksList.test.ts`, `DailyReportsList.test.ts` and `WorkActivitiesList.test.ts` in `presentation/components/__tests__/`; existing section and page tests cover shared states and Quote navigation.

Added view: `src/views/MainOrganization/ExecutionQuotes/WorkItems/WorkItemsIndex.vue`.

Changed existing integration files:

- `ExecutionQuotes/presentation/components/ProjectWorkspaceApps.vue`, `ProjectWorkspaceNav.vue`, and their companion tests.
- `ExecutionQuotes/Schedule/presentation/components/ProjectManagementShortcut.vue`: selects the corresponding calendar, floor-plan, or checklist visual for each app.
- `src/router/routes/modules/execution_quotes.ts` and its companion test.
- `src/locales/en.json` and `src/locales/ar.json`: Work Items content and missing validation field labels.

The supplied endpoint document remains unchanged. Development-only visual evidence and the direction contract live under `.impeccable/`.

## Validation results

Current accordion refactor:

- Focused tests: **82 passed across 24 files**, recorded in `/tmp/work-items-accordion-tests-final.log`. This is a different focused scope from the earlier feature validation below.
- `npm run type-check`, focused ESLint and Stylelint: passed. Logs are `/tmp/work-items-accordion-types.log`, `/tmp/work-items-accordion-lint-final.log` and `/tmp/work-items-accordion-style-final.log`.
- Six captures in `.impeccable/review/work-items-accordion/` cover expanded and collapsed desktop, mobile and Arabic layouts. `/tmp/work-items-accordion-browser-final.log` records no page errors or horizontal overflow, three sections starting expanded, independent collapse and preserved activity filters.
- Independent finish review: **ship**, no material fixes. `/tmp/work-items-accordion-detect.json` has no primary findings; its nine advisories concern existing local typography/radius choices recorded in `DESIGN_REVIEW.md`. Root design documents remain unchanged.
- New companion tests cover task/report presentation and activity-filter persistence across collapse/reopen, including the full-collection count. Existing page coverage checks the filter resets after Quote navigation. Source and documentation were checked together.

Historical feature validation (not rerun as a full baseline for this refactor):

- Original focused feature, launcher, navigation, shortcut, and route tests: **102 passed across 25 files**. That feature test review replaced internal repository stubs with network-boundary mocks and added employee lookup coverage; all affected tests were rerun afterward.
- `npm run test:run -- --maxWorkers=4`: **2,439 passed, 167 failed across 995 files** (140 failed files, 855 passed). The baseline run had 2,360 passed and the same 167 failed tests; normalized failure entries match exactly. The full run precedes the final test-only guard refinements described above.
- `npm run type-check`: passed. The stricter `npx vue-tsc --noEmit -p tsconfig.app.json` reports **213 diagnostics**, identical to baseline after normalizing line numbers; no Work Items diagnostics remain.
- Focused ESLint and Stylelint: clean. `git diff --check`: clean. All new production TS/Vue files have companion tests; both locales have the same 53 Work Items keys.
- Browser: fifteen captures spanning desktop and English/Arabic mobile page/forms. No page errors or horizontal overflow; actual stage selection and Meeting-to-Risk conditional fields verified against mocked API responses. Independent impeccable finish review: **ship**, no material fixes. Incumbent design documents preserved.
- Clean-code review kept duplicate submission disabled until authoritative refresh completes. Test guard removed internal persistence stubs; documentation claims and links were checked against source.

Repository-wide baseline failures remain unresolved because they are outside this feature's scope. No tests or TypeScript constraints were weakened.

## Shop Drawings extension

The supplied `shop_drawing_quote_endpoints.md` confirms POST `store_shop_drawing_quote` and POST `fetch_shop_drawing_quotes`. These extend the existing endpoints class, API service, repository and controller. `StoreShopDrawingQuoteParams` sends exactly `quote_id`, `title`, nullable date/file, `version_number` and primitive `project_timeline_stage_ids`. Duplicate selections are deduplicated at the form boundary and duplicate IDs are rejected in params. Project, organization and custom sequence values are never submitted.

`ShopDrawingQuoteModel` maps the Fetch array using the existing employee reference mapper. `ShopDrawingTimelineStageModel` is a local submodel because the drawing response lacks Schedule's required QuoteStage and children fields. Its `projectTimelineStageId` maps the association `id`; nested master stage and nullable substage use `TitleModel.fromMap()`. Dates, files, creator and generated custom numbers retain nulls. User version numbers and server custom numbers are displayed independently.

The existing `ProjectTimelineStageModel` now retains optional `parentId`, without changing existing Schedule fields. `WorkItemStageSelect` reuses the shared selector in multi-selection mode for drawings. Only explicit `parent_id: null` stages from the current Quote's Schedule overview are offered. The controller rechecks Quote identity and eligible association IDs before Store; the backend contract requires final same-Quote/Project/Organization validation. If `parent_id` is omitted, no main-stage eligibility is inferred and creation is unavailable with explanatory feedback. Existing tasks/report/activity selection behavior is unchanged.

`ShopDrawingFormDialog.vue` uses native file selection and existing `filesToBase64()` to retain complete file bytes as the demonstrated data URI, including non-image formats. Existing `HandleFilesUpload` was inspected but its default accepted formats and lack of a disabled/processing interface do not fit the unconfirmed file rules and duplicate-submit requirements here. The dialog displays the filename and a shared `attachmentKind()` icon, allows replacement/removal, blocks Save during conversion, ignores late conversion after closure, and preserves fields/file after failed Store. Backend validation messages exposed by the existing ErrorModel are displayed. No compression, image/CAD preview, multipart transport, size cap, or MIME allowlist is introduced.

`ShopDrawingsList.vue` reuses the existing accordion/list states and displays server data. Returned file links use `toGalleryAttachment()` URL normalization with an additional HTTP/HTTPS restriction, open in a new tab with `noopener noreferrer`, and are absent when missing or unsafe. This Open/Download action lets the browser/server handle the file; it does not promise cross-origin forced downloading.

Drawing reads and saves have independent DataState resources with epoch/request guards. Explicit backend success triggers authoritative drawing Fetch; a failed refresh remains visible in the list without generating a local row or retrying Store. No edit/delete/approval/rejection/publication/current-revision behavior exists.

Added files: `core/params/store.shop-drawing.params.ts`; `core/models/shop-drawing.model.ts`, `shop-drawing.timeline-stage.model.ts`; `presentation/components/ShopDrawingFormDialog.vue`, `ShopDrawingsList.vue`; five companion test files for those additions. Modified existing Work Items endpoints/service/repository/controller/page/stage selector/index/styles and their affected tests, the existing Schedule timeline-stage model and its companion test, and English/Arabic locales. Concurrent SchedulePage/SiteTeamPage edits were preserved.

Remaining contracts: Store success payload and validation/auth fixtures are not supplied; explicit 2xx `status: true` is required using existing conventions. The document demonstrates a complete data URI but does not explicitly guarantee raw Base64 acceptance; no raw conversion is made. Accepted MIME/extensions (including CAD), size limits and conditional file requirements need backend confirmation. Live Schedule must expose explicit parent metadata and conform to its existing parser, including `quote_stage_id`; missing metadata disables drawing selection without disabling Fetch.

Verification: 111 focused Work Items tests across 29 files passed after the final wording/accessibility refinements. Mocked browser captures in `/tmp/shop-{list,form}-{desktop,mobile,arabic}.png` verified layouts at 1440px and 390px, Arabic RTL, stage selection and PDF Base64 conversion, with no page/dialog overflow or runtime errors. Root `npm run type-check`, focused ESLint and Stylelint pass; explicit app-config type checking retains 212 baseline diagnostics. Broader Schedule/SiteTeam/workspace tests reported 210 passed and 42 failed; a clean HEAD archive has 210 passed and 41 failed. The extra ScheduleGroupAdd test failure comes from the concurrent SchedulePage removal of `standard-crud-page`, confirmed by focused current/baseline reruns. No live backend calls, commit or push were performed.
