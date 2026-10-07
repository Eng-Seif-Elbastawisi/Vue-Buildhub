# Quote Schedule integration

The existing Schedule module now uses the confirmed Project Timeline and Project Configuration requests. Quote remains the sole owner. No module, application shell, or Stage master records were recreated. Existing changes were preserved.

## References and precedence

Read in this checkout: `docs/schedule/README.md`, implementation plan v1.0, complete API contract v0.2.0 (including `backend_confirmation_required`), updated `api-integration/SKILL.md`, original implementation prompt, Schedule sections of the HTML prototype, and all four screenshots. Also inspected repository instructions, the current integration skill, base classes, Quote Show/QuoteStage mapping and TaskAssignment duration enum.

The user's subsequent confirmed routes/requests and supplied Fetch/Show item response supersede the bundled draft. The prototype remains a layout reference. The earlier `stage`/`child`, string duration units, `planned_start_date`/`days_off`, shared Stage lookup and provisional endpoint names have been replaced in production requests.

## Confirmed request transports

All requests use existing base URL, organization/mainportal prefixes, authenticated JSON POST, singleton services and disabled retries. Components call controllers, repositories call `ScheduleApiService`, and transport uses `BaseApiService`.

| Operation                 | Route                          | Wire body                                                          |
| ------------------------- | ------------------------------ | ------------------------------------------------------------------ |
| Fetch                     | `fetch_project_timelines`      | `quote_id`                                                         |
| Show                      | `show_project_timeline`        | `quote_id`, `project_timeline_id`                                  |
| Create                    | `store_project_timeline`       | `quote_id`, `title`, `duration`, numeric `duration_type`, `stages` |
| Update                    | `update_project_timeline`      | Create fields plus `project_timeline_id`                           |
| Delete                    | `delete_project_timeline`      | `quote_id`, `project_timeline_id`                                  |
| Reorder                   | `change_projecttimeline_order` | **Only** `project_timeline_id`, `order`                            |
| Configuration read        | `show_project_configuration`   | `quote_id`                                                         |
| Configuration save/upsert | `store_project_configuration`  | `quote_id`, date-only `start_date`, primitive `holidays`           |

`ProjectTimelineStageParams.toMap()` serializes `{ quote_stage_id: this.quoteStageId, children: [...this.children] }`. The parent serializes each nested selection through `toMap()`. Update submits the complete editable form without an ordering field. The group has one duration. `TaskDurationType` from TaskAssignment is reused: DAY=1, WEEK=2, MONTH=3, YEAR=4. The supplied value 4 therefore displays the existing Year label; no Schedule-specific enum or hour conversion exists.

`holidays` accepts zero, one or two unique weekday values. At the limit, selected options remain enabled. Empty selections remain explicit `[]`. Requests contain no `planned_start_date`, `days_off` or `working_days`. Dates remain date-only input strings; no default date/weekend, timezone conversion or calendar calculation is introduced.

## Response mapping and live wiring

Fetch is wired through repository/controller to Index and the Quote Show shortcut. The supplied envelope is checked as `{ status: true, data: { basicData, data: [...] } }`. `ProjectTimelineOverviewModel` calls the named basic-data mapper and maps every timeline with `ScheduleGroupModel.fromJson()`. Basic data reads `start_date`, nullable `status`, and `count_timeline`. Missing finish and per-group dates remain unavailable.

Timeline identity is the confirmed item `id`. Employee `{ id, name }` and Stage/SubStage `{ id, title }` label objects use the actual `TitleModel.fromMap()` after shape validation. Timeline Stage arrays map through `ProjectTimelineStageModel`; child arrays map through `ProjectTimelineSubStageModel`. Parent `sub_stage: null`, omitted/null dates and empty children are preserved. Missing/null child `sub_stage` is rejected rather than assigned a fabricated identity; its alternative semantics remain a backend question.

Show transport is wired and parses the supplied direct timeline item body. An outer Show envelope was not provided: a different envelope will fail honestly rather than be guessed. The returned Stage association `id` is provisionally exposed as `quoteStageId`, with an explicit mapping comment. Its equivalence to request `quote_stage_id` remains unconfirmed. Consequently response-derived Edit remains disabled (`selectionsAvailable: false`) until that meaning is confirmed. The shared form converts mapped Stage children to ID-only `ProjectTimelineStageParams`, and its restoration/conversion is tested separately.

Configuration read sends the real read request and reports that its response schema is unavailable. Create, Update, Delete, Configuration save and Reorder have validated, tested API transports but are guarded **before mutation transport** in the repository because success/error response contracts are still missing. Fetch success is not assumed to establish mutation success. These guards prevent a server write followed by unrecognizable success from encouraging duplicate submission. They do not question the confirmed endpoint/request contracts. There is no fabricated response, local persistence or automatic mutation retry.

Persisted reorder is supported by the confirmed `POST change_projecttimeline_order` request definition. Its body is `{ project_timeline_id: number, order: number }`, with one-based destination position. Controller and UI orchestration are implemented; actual server persistence remains gated by the missing mutation response schema and has not been verified.

## UI, ownership and reuse

Quote Show retains its existing details and adds a reusable `ProjectManagementShortcut` with a Schedule wrapper. It navigates to the same Quote's Schedule route and displays only available status/count/start/finish values. Loading, errors and unavailable values are distinct. Cached owner-scoped overview data and an in-flight read are reused without duplicate requests. English/Arabic labels, logical spacing and keyboard focus are included.

`ScheduleSequenceBoard` uses native HTML drag events on a dedicated handle only; no new dependency was installed. Cards have sequence numbers, mapped scope labels, one duration, selected-stage count, dates or unavailable labels, and existing actions. Insertion slots, a temporary local order, ghost styling, restrained token-based elevation and a small saving message provide feedback. Earlier/Later remain the mobile and keyboard fallback. Both drag/drop and buttons call `changeProjectTimelineOrder()` once. Calculations use array positions, independent of RTL presentation.

The controller rejects invalid/boundary/concurrent moves and refetches authoritative Fetch order after success. Failure discards the visual preview. Mutation success followed by read failure preserves saved feedback and offers a safe read retry, not another mutation. Sort/group mutations refresh the timeline list independently of Configuration. Complete-sequence ordering is enabled only for a successful unpaginated result whose `count_timeline` equals the returned length; no `with_pagination` request capability is invented. Backend count/pagination semantics remain unconfirmed.

Owner/group generations guard shared state before assignment. Owner switches clear list/detail/settings/lookup state, invalidate old responses and suppress old mutation/navigation results. Child requests are keyed and guarded by QuoteStage parent. Selection restoration and failed form inputs remain intact. Missing calculated dates are never filled by a frontend calendar.

Reused infrastructure includes `BaseController`, `BaseRepository`, `BaseApiService`, `DataState`, validation helpers, Quote Show params/repository, `ExecutionQuoteStageModel` association data, `TitleModel.fromMap()`, `TaskDurationType`/`getTypeNameKey`, existing PrimeVue/shared controls and BuildHub styling tokens. QuoteStage association IDs, rather than master Stage IDs, supply requests. Schedule never creates, updates or deletes QuoteStage/SubStage records.

## Verification before branch migration

- `npx vitest run src/modules/MainOrganization/ExecutionQuotes/Schedule src/router/routes/modules/execution_quotes.test.ts src/modules/MainOrganization/ExecutionQuotes/presentation/components/__tests__/ExecutionQuoteShow.test.ts`: **35 files, 148 tests passed**. Test processes ran sequentially. Coverage includes real request keys/routes, nested mapping/serialization, holidays, restoration/failure preservation, stale responses, navigation/cache states, drag/button ordering, rollback and saved/read-failed separation.
- `npm run type-check`: passed. Because the root config contains project references and `files: []`, explicit app checking was also performed.
- `npx vue-tsc --noEmit -p tsconfig.app.json`: 196 existing diagnostics; no new Schedule diagnostics. Compared with untouched HEAD using the same dependencies after normalizing checkout paths and source line positions.
- `npx eslint src/modules/MainOrganization/ExecutionQuotes/Schedule src/views/MainOrganization/ExecutionQuotes/Schedule src/modules/MainOrganization/ExecutionQuotes/presentation/components/ExecutionQuoteShow.vue src/modules/MainOrganization/ExecutionQuotes/presentation/components/__tests__/ExecutionQuoteShow.test.ts src/router/routes/modules/execution_quotes.ts src/router/routes/modules/execution_quotes.test.ts --ext .ts,.vue`: passed without warnings.
- `npx stylelint 'src/modules/MainOrganization/ExecutionQuotes/Schedule/**/*.{vue,scss}'`: passed.
- `git diff --check`: passed. All Schedule production files have companion tests; 73 Schedule locale keys match in English and Arabic. Source review found no new TypeScript `any`, unsafe double assertions, suppression directives, production fixture imports or component network calls.
- No live mutations or live backend behavior were verified. API tests mock the network boundary; backend examples and synthetic UI fixtures reside only in tests.

The previous follow-up full-suite result remains a historical baseline, not a new full-suite claim: `npm run test:run` produced 117 failed/823 passed files and 102 failed/2226 passed tests; its failing file set matched untouched HEAD batches. The earlier Schedule null-date failure was investigated and did not recur in that stable full run or current targeted runs. No tests or TypeScript checks were weakened.

Remaining integration questions are limited to [BACKEND_CONTRACT_GAPS.md](./BACKEND_CONTRACT_GAPS.md).

## Changed/added source files

The following is the current Schedule source surface reconciled in this work. Companion tests are under adjacent `__tests__` directories; fixture files remain test-only.

- `core/constants/schedule.constants.ts`
- `core/models/project.timeline.basic-data.model.ts`
- `core/models/project.timeline.overview.model.ts`
- `core/models/project.timeline.stage.model.ts`
- `core/models/project.timeline.sub-stage.model.ts`
- `core/models/schedule.group.model.ts`
- `core/models/schedule.response.ts`
- `core/models/schedule.selection.model.ts`
- `core/models/schedule.settings.model.ts`
- `core/params/change.project.timeline.order.params.ts`
- `core/params/project.timeline.stage.params.ts`
- `core/params/schedule.group.params.ts`
- `core/params/schedule.owner.params.ts`
- `core/params/schedule.settings.params.ts`
- `data/api/schedule.api-service.ts`
- `data/api/schedule.api.endpoints.ts`
- `data/api/schedule.contract.ts`
- `data/repositories/schedule.repository.ts`
- `index.ts`
- `presentation/components/ProjectManagementShortcut.vue`
- `presentation/components/ScheduleGroupAdd.vue`
- `presentation/components/ScheduleGroupCard.vue`
- `presentation/components/ScheduleGroupEdit.vue`
- `presentation/components/ScheduleGroupForm.vue`
- `presentation/components/ScheduleGroupShow.vue`
- `presentation/components/ScheduleIndex.vue`
- `presentation/components/SchedulePage.vue`
- `presentation/components/ScheduleSequenceBoard.vue`
- `presentation/components/ScheduleSettingsDialog.vue`
- `presentation/components/ScheduleShortcut.vue`
- `presentation/components/ScheduleStageSelector.vue`
- `presentation/components/ScheduleTimeline.vue`
- `presentation/controllers/schedule.controller.ts`
- `presentation/schedule.routes.ts`
- `presentation/styles/schedule.scss`

Owning integration files: `src/locales/en.json`, `src/locales/ar.json`, `src/modules/MainOrganization/ExecutionQuotes/index.ts`, `src/modules/MainOrganization/ExecutionQuotes/presentation/components/ExecutionQuoteShow.vue` and its companion test, `src/router/routes/modules/execution_quotes.ts` and its companion test. Thin wrappers remain under `src/views/MainOrganization/ExecutionQuotes/Schedule/`: `ScheduleIndex.vue`, `ScheduleGroupAdd.vue`, `ScheduleGroupShow.vue`, `ScheduleGroupEdit.vue`. Existing work was extended without resetting it. The subsequent branch migration is recorded below.

## Migration onto feat/schedule

The detached Codex checkout at `78562494` produced commit `3abf5b7e02c6e3d2049ae85e86107488c22cb5ea` (`feat: implement project schedule`). Its 85 paths contain only Schedule implementation, thin views and the authorized Quote/router/locale integrations. The reference bundle `docs/schedule/` was excluded. Unrelated attachment-key edits in Codex locale files remain unstaged and were preserved byte-for-byte.

Cherry-pick onto `feat/schedule` at `587d4f63` merged cleanly. The newer Stage/SubStage model refactor and Quote Show content were preserved; `ExecutionQuotes1` was not restored. Post-pick verification identified the Schedule lookup's dependency on the former flattened SubStage model. The Schedule controller now reads `ExecutionQuoteStageModel.subStage[]`, selecting each child's `subStage.id`, not the child association record ID. Its existing lookup test distinguishes these IDs, and the selection-restoration fixture includes the empty `sub_stages` array required by the newer mapper. These compatibility fixes are folded into the migration commit; existing Stage models are unchanged.

Real-checkout verification:

- `npx vitest run src/modules/MainOrganization/ExecutionQuotes/Schedule src/router/routes/modules/execution_quotes.test.ts`: **34 files / 139 tests passed**.

- Combined Schedule/navigation/Quote Show command above: **34 passed / 1 failed files; 142 passed / 7 failed tests (149)**. All seven failures are in Quote Show and reproduce with identical scenario names on isolated untouched `587d4f63` using the real checkout's dependencies: **7 failed / 3 passed tests**. The newer Stage mapper requires `sub_stages`, which legacy Quote Show fixtures omit; no assertions were weakened or baseline code reverted.
- `npm run type-check`: passed.
- Explicit `npx vue-tsc --noEmit -p tsconfig.app.json`: **206 baseline diagnostics**, matching `587d4f63` after source-line normalization; no new diagnostics.
- Focused ESLint command above: exit 0; two existing Quote Show `vue/attributes-order` warnings from the Stage refactor remain.
- `npx stylelint 'src/modules/MainOrganization/ExecutionQuotes/Schedule/**/*.{vue,scss}' 'src/views/MainOrganization/ExecutionQuotes/Schedule/**/*.vue' src/modules/MainOrganization/ExecutionQuotes/presentation/components/ExecutionQuoteShow.vue`: passed.

The real checkout's unrelated untracked `bnlg` item was untouched. No push, live backend call or mutation was performed. The Codex worktree and its reference files remain in place.

## Controller CRUD simplification

Create, Update and Delete delegate to `BaseController` through `super.create()`, `super.update()` and `super.delete()`. The callback-based Schedule `mutate()` runner was removed. Schedule retains only scoped save setup/completion around inherited CRUD, plus domain-specific reads and ordering/settings actions. Loaded Edit detail stays separate from save state so failed updates preserve the form. The protected BaseController `captureMutationScope()` hook defaults to accepting responses for existing controllers; Schedule captures its owner/group generation to cancel stale mutations before state assignment, dialogs or global success events. Neither controller nor API automatically retries Create.

Refactor verification: combined Schedule/navigation/BaseController tests report 146 passed and four existing Stage-selection params failures (150 total). The user's subsequent commit intentionally removed those validation checks; that code and its tests remain unchanged. Root `npm run type-check` passes. Explicit app checking still reports baseline diagnostics, including the unused `validId` import left by that validation change; none concern the controller refactor. Focused ESLint reports only existing BaseController `any` warnings. No backend contract guard or test was disabled to accommodate this refactor.
