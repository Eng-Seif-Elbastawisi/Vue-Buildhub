# Work Items integration

Work Items lives in the Quote workspace at `execution-quotes/show/:id/work-items` under the existing organization/mainportal route prefixes. The app launcher and shared navigation retain Schedule and Site & Team.

## Implementation boundary

One `WorkItemsApiService`, `WorkItemsRepository`, and `WorkItemsController` extend the existing base classes and use `getInstance()`. Custom operations are needed for three response types and independent owner-safe state. Transport stays in `data/api`; repositories map verified Fetch envelopes. No new store, dependency, form engine, or Project entity was introduced.

`FetchWorkItemsParams` sends only `quote_id`. `StoreTaskParams`, `StoreReportParams`, and `StoreActivityParams` send `project_timeline_stage_id` without Quote or Project IDs. Task nullable employee/date and report nullable notes remain null. Activity serialization sends date for Meeting; other types send description and employee ID and omit date. No nested request payload is needed.

`WorkTaskModel`, `DailyReportModel`, and `WorkActivityModel` map the collection rows. Existing `EmployeeModel.fromJson()` handles nested `{id, name, type}` references, including the `type` → `employee_type` mapping. Creator and optional assignee have separate model fields; no new employee model was necessary. Malformed response objects, rows, IDs, and enum values produce failed state rather than empty success.

## Reused modules and controls

- Schedule: `ScheduleRepository.readOverview()`, `ScheduleOwnerParams`, `ScheduleGroupModel`, `ProjectTimelineStageModel`. Selection uses `ProjectTimelineStageModel.id`, never its `quoteStageId` or nested master-stage ID. Only explicitly available parent timeline stages are offered; child-stage identifiers are not guessed.
- Employee: `EmployeeRepository`, `IndexEmployeeParams`, and `EmployeeModel`. The existing search/page request mechanism and shared selector pagination are retained without an invented role filter.
- Workspace: `ProjectWorkspaceApps`, `ProjectWorkspaceNav`, `ProjectManagementShortcut`, and `quotePath` prefix resolution. Existing diagrams remain limited to Schedule and Site & Team; Work Items adds no drawing illustration.
- Forms: `UpdatedCustomInputSelect`, `AppButton`, PrimeVue `Dialog` and `Skeleton`, and `input-wrapper` styles.

`WorkItemStageSelect` shares the stage options, loading/retry/unavailable behavior across the three forms. `WorkItemSection` shares section loading, error/retry, and empty-state rendering across the three lists. Record-specific markup and the three focused forms remain explicit.

## Behavior

Separate list and submission states prevent one operation from overwriting another. Quote activation clears owned state and increments the request epoch; per-resource request counters prevent earlier reads from overwriting newer reads. Saving checks stage membership in the currently loaded Quote. Late mutation results cannot refresh a different Quote or close its form. Submission stays disabled through the authoritative affected-list refresh. Mutations have automatic retry disabled.

Successful explicit backend confirmation triggers feedback, refresh, and dialog closure. A failed response preserves the form and shows the error. A refresh failure after confirmed creation is shown in the list; it does not fabricate the newly created record or retry the mutation. Activity filters operate on the one fetched collection.

English and Arabic labels are provided. Date inputs serialize their original `YYYY-MM-DD` strings without timezone conversion. Responsive metadata and action grids use logical layout properties. Drawings & Revisions, quantities, approval, progress, Start Item, editing/deletion, and task transitions are outside this integration.

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
- Companion tests under each affected layer's `__tests__/` directory.

Added view: `src/views/MainOrganization/ExecutionQuotes/WorkItems/WorkItemsIndex.vue`.

Changed existing integration files:

- `ExecutionQuotes/presentation/components/ProjectWorkspaceApps.vue`, `ProjectWorkspaceNav.vue`, and their companion tests.
- `ExecutionQuotes/Schedule/presentation/components/ProjectManagementShortcut.vue`: only limits existing decorative diagrams to their corresponding apps.
- `src/router/routes/modules/execution_quotes.ts` and its companion test.
- `src/locales/en.json` and `src/locales/ar.json`: Work Items content and missing validation field labels.

The supplied endpoint document remains unchanged. Development-only visual evidence and the direction contract live under `.impeccable/`.

## Validation results

- Focused feature, launcher, navigation, shortcut, and route tests: **102 passed across 25 files**. The latest test review replaced internal repository stubs with network-boundary mocks and added employee lookup coverage; all affected tests were rerun afterward.
- `npm run test:run -- --maxWorkers=4`: **2,439 passed, 167 failed across 995 files** (140 failed files, 855 passed). The baseline run had 2,360 passed and the same 167 failed tests; normalized failure entries match exactly. The full run precedes the final test-only guard refinements described above.
- `npm run type-check`: passed. The stricter `npx vue-tsc --noEmit -p tsconfig.app.json` reports **213 diagnostics**, identical to baseline after normalizing line numbers; no Work Items diagnostics remain.
- Focused ESLint and Stylelint: clean. `git diff --check`: clean. All new production TS/Vue files have companion tests; both locales have the same 53 Work Items keys.
- Browser: fifteen captures spanning desktop and English/Arabic mobile page/forms. No page errors or horizontal overflow; actual stage selection and Meeting-to-Risk conditional fields verified against mocked API responses. Independent impeccable finish review: **ship**, no material fixes. Incumbent design documents preserved.
- Clean-code review kept duplicate submission disabled until authoritative refresh completes. Test guard removed internal persistence stubs; documentation claims and links were checked against source.

Repository-wide baseline failures remain unresolved because they are outside this feature's scope. No tests or TypeScript constraints were weakened.
