# BuildHub — Schedule Implementation Plan

**Version:** 1.0  
**Scope:** Schedule Group CRUD, execution ordering, and Schedule Settings only  
**Owner:** The existing Quote record, which the user identifies as the Project  
**Proposed module:** `src/modules/MainOrganization/ExecutionQuotes/Schedule/`  
**Companion request contract:** `BuildHub_Project_Schedule_API_Contract_v0.2.0.json`  
**Delivery status:** Implementation plan and revised request contract. Application code has not been changed.

## 1. Agreed implementation baseline

The user's latest decisions take precedence over the prototype and earlier planning files.

| Subject | Agreed direction |
|---|---|
| Project identity | Quote is the Project for this feature. Use the existing record; do not create a second owner or add a conversion step. |
| Request scope | Retain `quote_id` from the draft contract for that same record. The backend must approve the wire contract. |
| Schedule Group | `title: string`, `stages: [{ stage: number, child: number[] }]`, `duration: number`, and an enum duration type. |
| Stages | Reuse the existing Stage module. `stage` identifies the parent; `child` contains selected child Stage IDs. |
| Duration | One duration on the group, not one per parent, child, or quotation item. |
| Operations | Index, Show, Create, Update, Delete, and Sort groups; Read and Update settings. |
| Settings | Keep `planned_start_date` as a separate date-only field. Select weekly `days_off`, not working days. |
| Days-off limit | Zero, one, or two distinct selections. Two is the maximum, not a required count. |
| Calendar UI | After two selections, disable only unselected options. Selected options remain deselectable. |
| Start date | Preserve the entered planned date. If it is a day off, calculate the first group start on the next working day. |
| Integration | Follow the updated `api-integration` skill supplied in the conversation, including nested submodels and subparams. |

The duration-type key and enum values, weekday wire values, endpoint details, and response shapes remain backend-review items. Do not treat the request examples as evidence that those endpoints exist.

### Scope exclusions

Do not add client send/approval, publishing, execution activation, tasks, progress reporting, quotation pricing, new Stage CRUD, or a new Project/ExecutionProject entity. Do not add a general scheduling library, arbitrary dependency graph, holidays, or per-group calendars in this slice. Existing locked/frozen schedule protections must not be bypassed; any applicable backend restrictions need to be surfaced without inventing a new workflow.

## 2. Source reconciliation

The supplied HTML is an interaction reference, not a production API contract.

| Prototype behavior | Implementation treatment |
|---|---|
| Main schedule with ordered cards and a timeline | Retain the layout concept. Adapt it to the existing application's components and styles. |
| Separate add/edit builder with available and selected scope | Retain the two-panel selection pattern, using Stage parent/child records. |
| Per-quotation-item duration | Replace with the user's group-level duration. |
| Working-day checkboxes | Replace with `days_off`, maximum two. Do not send both fields. |
| Groups run sequentially, scope inside a group runs together | Retain this scheduling model. |
| Earlier/Later buttons | Initial ordering controls. Their changes must persist to the backend. |
| `draggable="true"` on cards | Do not treat this as complete drag-and-drop behavior. The supplied handlers implement Earlier/Later. |
| Item exclusion across groups | Do not transfer this rule blindly to Stage IDs. Cross-group Stage/child reuse is unresolved. |
| Group details embedded in cards | Add the requested read-only Show view; it is not a separate screen in the supplied HTML. |
| Client preview, approval, and Start Execution | Exclude from this implementation slice. |

Source locations: HTML lines 127–132 (calendar), 138–140 (builder), 188 (index), and 209–216 (actions). The group duration, Stage selection shape, and days-off rules above come from later user decisions.

## 3. Existing code to reuse

The following paths were inspected in `buildhub.zip`. They are repository paths, not newly invented conventions.

| Existing path | Reuse or inspection purpose |
|---|---|
| `src/modules/MainOrganization/ExecutionQuotes/` | Owning frontend feature and existing Quote context. |
| `src/modules/MainOrganization/employee/` | Actual location of the canonical employee CRUD implementation in this archive. The skill's shorter `src/modules/employee/` path is not the archive location. |
| `src/base/Presentation/Controller/baseController.ts` | Existing controller inheritance, `listState`, `itemState`, reset and mutation behavior. |
| `src/base/Domain/Repositories/baseRepository.ts` | CRUD mapping, `DataState`, response envelopes, and pagination behavior. |
| `src/base/Data/ApiService/baseApiService.ts` | Network boundary, POST-based CRUD conventions, request options, and JSON transport. |
| `src/base/Core/Params/params.ts` | Root params require `toMap()`, `validate()`, and `validateOrThrow()`. |
| `src/base/Core/Params/indexParams.ts` | Existing pagination serialization, subject to endpoint support. |
| `src/base/Core/Models/titleModel.ts` | Candidate only for a compatible title value; actual mapper is `fromMap()`. |
| `src/modules/shared/Stages/core/models/stage.model.ts` | Existing recursive Stage model; actual mapper is `fromJson()`. |
| `src/modules/shared/Stages/core/params/index.stage.params.ts` | Parent/child lookup params, including `parent_id`. |
| `src/modules/shared/Stages/presentation/composables/useStageSubStageFilters.ts` | Existing parent and child filter construction. It is a single-parent helper, not a complete multi-parent schedule selector. |
| `src/router/routes/modules/execution_quotes.ts` | Existing Quote routes; detail uses `execution-quotes/show/:id(\\d+)`. |
| `src/views/MainOrganization/ExecutionQuotes/ShowExecutionQuote.vue` | Thin wrapper pattern. |
| `src/modules/MainOrganization/ExecutionQuotes/presentation/components/ExecutionQuoteShow.vue` | Existing entry screen and `route.params.id` context. |
| `src/locales/en.json`, `src/locales/ar.json` | Existing translation files. |

### Reuse limits

Search shared and module models/params before adding new classes. Compatibility requires matching domain meaning, field shape, and mapper/serializer behavior—not merely an `id` field.

The Stage master model is not itself the request selection `{ stage, child }`. Likewise, the existing Stage ordering request must not be reused to mutate Schedule Group order.

The inspected legacy `StageModel.fromJson()` and `TitleModel.fromMap()` contain `any`. Do not propagate that typing into new Schedule code. Test compatibility at the integration boundary and make a narrowly scoped mapper correction only if required. Do not claim that the entire existing codebase is already `any`-free or refactor unrelated models during this feature.

## 4. Proposed module structure

One Schedule feature is sufficient for these eight operations. Keep its repository and controller separate from the large existing Quote repository/controller.

```text
src/modules/MainOrganization/ExecutionQuotes/Schedule/
├── core/
│   ├── constants/
│   │   ├── schedule.duration.type.enum.ts
│   │   └── schedule.weekday.enum.ts
│   ├── models/
│   │   ├── schedule.group.model.ts
│   │   ├── schedule.settings.model.ts
│   │   └── schedule.stage.selection.model.ts   # Only if required by the actual response
│   └── params/
│       ├── schedule.stage.params.ts
│       ├── index.schedule.group.params.ts
│       ├── show.schedule.group.params.ts
│       ├── add.schedule.group.params.ts
│       ├── edit.schedule.group.params.ts
│       ├── delete.schedule.group.params.ts
│       ├── change.schedule.group.order.params.ts
│       ├── show.schedule.settings.params.ts
│       └── update.schedule.settings.params.ts
├── data/
│   ├── types/
│   │   └── schedule.response.types.ts          # Actual backend payload contracts
│   ├── api/
│   │   ├── schedule.api.endpoints.ts
│   │   └── schedule.api-service.ts
│   └── repositories/
│       └── schedule.repository.ts
├── presentation/
│   ├── controllers/
│   │   └── schedule.controller.ts
│   ├── components/
│   │   ├── ScheduleIndex.vue
│   │   ├── ScheduleGroupAdd.vue
│   │   ├── ScheduleGroupEdit.vue
│   │   ├── ScheduleGroupShow.vue
│   │   ├── ScheduleGroupForm.vue
│   │   ├── ScheduleStageSelector.vue
│   │   ├── ScheduleGroupCard.vue
│   │   ├── ScheduleTimeline.vue
│   │   └── ScheduleSettingsDialog.vue
│   └── styles/
│       └── _schedule.scss
└── index.ts
```

These are planned names. Do not scaffold a response submodel or a separate Show model unless the actual payload requires it. Reuse one group model for index/show when their shapes are compatible. Keep tests beside each layer in `__tests__/`, matching the existing feature tests.

`data/types/` describes API shapes; it does not replace mapped `core/models/` objects. UI-only selection state may use presentation types, but nested request payloads still pass through subparams.

### Route and wrapper plan

Extend the Quote route file without renaming existing routes:

| Relative route proposal | Thin wrapper |
|---|---|
| `execution-quotes/show/:id(\\d+)/schedule` | `Schedule/IndexSchedule.vue` |
| `execution-quotes/show/:id(\\d+)/schedule/add` | `Schedule/AddScheduleGroup.vue` |
| `execution-quotes/show/:id(\\d+)/schedule/:groupId(\\d+)` | `Schedule/ShowScheduleGroup.vue` |
| `execution-quotes/show/:id(\\d+)/schedule/:groupId(\\d+)/edit` | `Schedule/EditScheduleGroup.vue` |

Wrappers belong under `src/views/MainOrganization/ExecutionQuotes/`. Keep `id` as the parent Quote/Project route parameter and `groupId` as the group identifier. Convert the validated parent ID into `quote_id` in params. Do not accidentally submit the group ID as the owner.

Add a Schedule entry to the existing detail screen and preserve existing organization/mainportal routing behavior. Settings can remain a dialog rather than adding an unnecessary page. Export the public Schedule components/controller/models through the local index and the owning module's public index as needed.

## 5. Core and serialization plan

### Group request

The proposed request remains:

```json
{
  "quote_id": 101,
  "title": "First Fix Works",
  "stages": [
    { "stage": 10, "child": [11, 12] },
    { "stage": 20, "child": [21] }
  ],
  "duration": 6,
  "duration_type": "days"
}
```

IDs are illustrative. `duration_type` and its string values are still proposed wire values.

After the reuse search, `ScheduleStageParams` owns the nested selection and its `toMap()` method. The parent params stores `ScheduleStageParams[]` and serializes:

```ts
stages: this.stages.map((selection) => selection.toMap())
```

Keep `stage` as a number and `child` as `number[]`. Root request classes follow the actual `Params` interface, including validation methods. A nested class only needs the minimal constructor and serializer unless parent validation requires additional behavior.

Use the existing class-validation approach. Recommended form checks are a nonblank title, a positive finite duration, at least one parent selection, valid supported enum values, unique IDs within each child selection, and correct parent/child association. The backend also validates access and relationships. Do not invent a title maximum or fractional duration step.

Do not reinterpret `child: []`. Its meaning is still unresolved. Do not silently expand it to all children, omit it, or impose a backend rule not yet agreed.

### Settings request

```json
{
  "quote_id": 101,
  "planned_start_date": "2026-10-05",
  "days_off": [5, 6]
}
```

The example retains the draft numeric mapping (Sunday = 0 through Saturday = 6). It is not a confirmed enum or a prescribed default weekend.

Serialize only `quote_id`, `planned_start_date`, and `days_off`. The days-off array remains primitive; no weekday subparams objects are needed. Validate array length at most two, distinct values, and membership in the approved weekday enum. `[]` means no weekly days off, not missing settings.

Use a real date-only value. Do not shift it by converting through a UTC timestamp. The contract's `null`-to-clear behavior remains a proposal; keeping the date field did not decide whether it may be cleared.

### Response mapping

Obtain actual index, show, mutation, and settings responses before finalizing model constructors and repository parsing. Never assume the response repeats the request shape.

If selections return `{ stage: number, child: number[] }`, map each selection into a small named Schedule selection submodel. If they return expanded Stage objects, reuse compatible Stage models and call their real mapper. If the response contains association objects around those records, map that association separately.

Preserve omitted, null, and empty values. Do not fabricate dates, silently map malformed success payloads to empty results, or treat a missing settings resource as a saved seven-day working calendar.

## 6. Data and controller integration

### Operation mapping

All endpoint names and POST methods below are the draft proposals, not verified backend endpoints.

| Operation | Draft endpoint | Repository/controller responsibility |
|---|---|---|
| Index | `fetch_quote_schedule_groups` | Fetch ordered groups for this owner. |
| Show | `show_quote_schedule_group` | Load authoritative details for read-only Show and Edit. |
| Create | `store_quote_schedule_group` | Save fields and Stage associations together. |
| Update | `update_quote_schedule_group` | Save edited fields without changing position unless explicitly requested. |
| Delete | `delete_quote_schedule_group` | Remove only this Schedule Group/associations. |
| Sort | `change_quote_schedule_group_order` | Persist a single-group move; refresh the authoritative sequence. |
| Read settings | `show_quote_schedule_settings` | Load schedule-wide date and days off. |
| Update settings | `update_quote_schedule_settings` | Persist settings and refresh affected dates. |

`ScheduleApiService` extends `BaseApiService`, uses `getInstance()`, and delegates endpoint construction to `ScheduleApiEndpoints`. Preserve existing authentication/prefix handling. Use the existing JSON transport option when the backend accepts this draft; do not flatten `stages[]` through ad hoc FormData code.

`ScheduleRepository` extends `BaseRepository`. Use `parseItem()` and `parseList()` with the actual mappers; set data/pagination keys from response examples, not from guesses. Add explicit methods for sorting and settings. The inherited mutation parser may expect a returned item, so verify it against create/update responses; do not fake an item if the backend returns only a message.

`ScheduleController` extends `BaseController` and uses `getInstance()`. Retain inherited group list/detail state and add separate typed settings and sort/save state where needed. Do not let reading settings overwrite group `itemState`.

Components call controllers only. Pure presentation calculations are not network calls. No new Axios/fetch requests belong in Vue components or presentation composables.

### Success, failure, and owner changes

After a successful group mutation, refresh the same owner's groups and calculated dates. After a successful settings save, refresh settings plus any affected group dates. On a failed save, keep the form/dialog open with entered values and field errors. Cancel does not persist changes.

For reordering, the proposed initial behavior is pessimistic: show the pending move, block conflicting actions, and display the new saved order after success. This avoids pretending an unsaved order is authoritative. Earlier is disabled for the first group and Later for the last.

Singleton controllers require owner-scoped state. Clear the previous list/detail/settings when switching Quote/Project records, and prevent late responses from the previous owner from updating the current owner. An outer component check after an inherited method has already updated shared state is not sufficient; enforce the scope check before assigning state. Keep form draft keys scoped to both owner and group.

Disable duplicate submissions. Inspect both controller retry configuration and API `enableRetry`; do not automatically retry non-idempotent creates without a backend deduplication policy. Use existing permission handling, but obtain actual Schedule permissions and reject unauthorized operations on the backend as well. Do not invent role codes or assume a sent quote is execution-approved.

## 7. Screen behavior

### Index and timeline

Show the saved planned start, calculated finish when available, group count, ordered group cards, and the group timeline. Each card displays its title, selected Stage/child names, one duration/unit, sequence position, calculated dates, and Show/Edit/Delete/Earlier/Later actions.

Load the complete execution sequence for the board. Do not reorder a paginated fragment as though it were the whole schedule. The draft proposes `with_pagination: 0`; verify endpoint support.

No groups is a genuine empty state with Create Group. Failed loading is an error with retry, not an empty schedule. Missing calculated dates display an unavailable state, not today's date or zero duration. Avoid 'available/scheduled/remaining' scope counts until their meaning under the Stage eligibility rules is agreed.

### Add and Edit

Reuse `ScheduleGroupForm.vue`. Place title, duration, and duration type at group level. The Stage selector shows existing parents and their children, alongside a selected-scope summary. It may require child lookups by parent rather than assuming every parent's `children` array is complete.

For multi-parent selection, keep lookup results separated by parent; avoid a shared Stage controller response replacing a different parent's children. Handle paging/loading/errors and restore saved selections on Edit without losing IDs that are not on the current lookup page.

Do not display quotation-item duration inputs or create/edit Stage master records inside the form. Do not exclude a child across groups until the backend policy is agreed.

### Show and Delete

Show is read-only and loads by owner plus group. It must work on direct navigation, not only after visiting Index.

Use a delete confirmation that explains that the group is removed, not the underlying Stage records. On success refresh order/dates; after deleting the final group, clear the current calculated finish. Do not erase an existing original/frozen schedule history.

### Settings

Retain the planned-date input and replace working-day selection with seven days-off choices. Zero, one, or two may be selected. After two selections, disable the other five choices only. A selected choice can always be deselected.

Load persisted settings before editing. A missing-settings response is not a default `[5, 6]`. An existing invalid response with three selections must be surfaced as invalid, not silently truncated. Keep the dialog open after frontend or backend validation failure.

Translate labels, errors, confirmations, and empty states in English and Arabic. Preserve RTL sequence meaning; chronological Earlier/Later remains understandable even when physical arrow direction changes. Support keyboard checkbox/button access and narrow-screen stacking of the two-panel builder.

## 8. Calendar rules and unresolved calculation policy

Agreed presentation behavior is: all seven weekdays except saved days off are working days; preserve the entered planned start; advance the calculated first group start when necessary; execute ordered groups sequentially; and give all selected scope inside a group its group execution window.

The prototype counts the first working day as day one. It rounds fractional days upward, converts hours by dividing by eight and rounding up, and converts weeks using the number of working weekdays. These are prototype rules, not an agreed production unit policy. Under the new settings, a week could have five, six, or seven working weekdays; do not hard-code six.

The recommended integration is to display server-authoritative calculated dates. Any frontend preview should be explicitly labeled as a preview and tested against the approved algorithm. Do not create a second independent authoritative calculator in a Vue component.

Pending decisions: hours per workday/hour rounding, fractional durations, the meaning of a week, calculation ownership, and behavior before a planned start is saved. The request contract carries these decisions rather than silently resolving them.

## 9. Ordered implementation tickets

Each ticket includes its tests; testing is not postponed until the end.

| Ticket | Work and dependencies | Acceptance |
|---|---|---|
| **SCH-IMP-01** | Inspect base/employee/Stage references, record the contract gap list, and add nested selection params plus serialization tests. | Exact `{ stage, child }` keys and primitive child arrays; no duplicate Stage module; approved decisions remain distinct from draft proposals. |
| **SCH-IMP-02** | Add settings params/validation and the days-off interaction test. | Date preserved; 0/1/2 accepted; third/duplicate rejected; deselection still works at the limit; no `working_days` payload. |
| **SCH-IMP-03** | After backend examples, add response models/types, endpoints, service, repository, and isolated fixtures. | All eight operations match the agreed contract; nested objects mapped; errors and empty results distinguished; JSON bodies preserved. |
| **SCH-IMP-04** | Add controller state and read-only Index/Settings reads; wire routes/wrappers. | Correct owner scope, direct navigation, distinct loading/error/empty states, no old-owner response leakage. |
| **SCH-IMP-05** | Add Stage selector and shared Add/Edit form; connect writes. | Saved IDs restored; positive group duration; atomic request body; validation failure preserves form; success refreshes the correct schedule. |
| **SCH-IMP-06** | Add Show/Delete and persisted Earlier/Later. | Read-only details; Stage master data untouched; order changes survive refetch; failed mutation cannot display false success. |
| **SCH-IMP-07** | Connect Settings save and calculated timeline refresh; finish responsive/RTL behavior. | Maximum two days off, saved planned date unchanged on day off, affected groups refreshed, unavailable calculation shown honestly. |
| **SCH-IMP-08** | Run integration/regression checks and live contract verification against an authorized test backend. | Type-check/tests reported accurately, existing Quote/Stage screens still work, all intended operations verified end-to-end. |

Start with **SCH-IMP-01 and SCH-IMP-02** because their confirmed serialization and days-off behavior can be tested without inventing backend responses. Keep fixtures explicit; do not add a hidden mock-success fallback to the production API path. Live integration in SCH-IMP-03 depends on receiving actual response/error examples and confirming the remaining transport fields.

## 10. Acceptance-test matrix

| Area | Required coverage |
|---|---|
| Selection params | Multiple parents; child arrays serialized through subparams; no title/label/UI metadata leaks into the request; empty-child policy preserved rather than guessed. |
| Group validation | Blank title, invalid IDs, nonpositive/nonfinite duration, unknown enum, duplicate children, no selected scope. |
| Settings params | Date-only value; 0/1/2 days off; three rejected; duplicates rejected; unknown weekday rejected; omission/null distinguished from `[]`. |
| Settings UI | Third option disabled at the limit; selected options remain enabled; removing one allows another; failed save retains inputs; cancel does not save. |
| Response models | Actual list/show/settings fixtures; nested mappings; missing/null preservation; malformed payload not converted into success. |
| Repository | Actual envelope and pagination keys; JSON nested arrays; 4xx/validation/conflict handling; mutation success with or without returned item according to contract. |
| State | A→B switch with late A response; independent settings/group detail; double-click submit; stale edit/reorder response; no duplicate retry-created groups. |
| CRUD/order | Reload after each mutation; edit retains position; first/last move boundaries; delete last group; move request never uses Stage reorder endpoint. |
| Calendar | Start on day off; workday boundary; no days off; one/two days off; month/year transitions; timezone-independent date serialization; unit cases after policy approval. |
| Navigation/access | Direct deep links; invalid owner/group IDs; unauthorized owner/group; existing organization/mainportal routes; Quote and Stage regression. |
| Presentation | English/Arabic, RTL, mobile builder/settings, keyboard actions, useful loading/empty/error states. |

Run from the application root:

```bash
npm run type-check
npm run test:run
```

Inspect changed files for explicit `any`, nested inline response/request objects bypassing the required classes, and network calls outside the data layer. Report pre-existing failures separately from introduced failures; do not claim a passing suite without running it.

## 11. Remaining backend decisions

The known shape is sufficient for the plan, not a fully verified API integration.

| Decision | Required answer |
|---|---|
| Endpoints and scope | Confirm the eight methods/URLs, prefixes, owner key, group key, and allowed Quote/Project access/state. |
| Enums | Confirm duration field/value mapping and weekday encoding. No numeric values were supplied by the user. |
| Stage selection | Meaning of `child: []`; Stage/child reuse across groups; whether eligible Stages must be attached to the selected Quote/Project. |
| Settings lifecycle | Missing settings response, first save, default policy, date requiredness, and whether `null` clears the start date. The days-off maximum is already agreed. |
| Update/order | Full replacement versus partial update, one-based move semantics, atomic shifting, and stale/concurrent write behavior. |
| Responses | Actual success/error examples for all operations, list envelopes, Stage expansion, calculated values, and validation paths. |
| Calendar | Server calculation policy for hours/weeks/fractions and frozen-history protection. |

Do not add new required payload fields such as a revision token or deduplication key without backend agreement. Concurrency protection is an integration requirement to resolve, not permission to invent transport fields.

## 12. Files delivered and checks performed

This delivery contains this plan and request contract v0.2.0. The previous v0.1.1 contract remains unchanged.

The revised contract replaces `working_days` with `days_off`, retains `planned_start_date`, documents the 0–2 distinct selection rule, and keeps all eight draft endpoint names/methods. The other seven primary operation bodies are unchanged.

Performed: local source inspection, JSON parsing, validation of all 12 documented request examples against the draft payload shapes, eight negative settings checks, and preservation checks on unchanged methods/URLs/bodies.

Not performed: implementation of the application module, npm type-check, npm test run, application build, interactive UI testing, or live backend calls. JSON example validation is not evidence of backend approval.

## Source notes

- **User decisions:** Quote is Project; Schedule-only operation scope; Stage selection shape; group-level duration; latest API-integration skill; planned date retained and maximum two days off.
- **`BuildHub_Project_Schedule_API_Contract_v0.1.1.json`:** previous draft request definitions, proposals, and unresolved questions. Revised as v0.2.0; no backend approval inferred.
- **`BuildHub_Business_Complete_Prototype_v7_GROUP_SCHEDULE_BUILDER.html`:** calendar functions (127–132), group builder (138–140), Schedule page (188), group/settings actions (209–212), client/activation actions excluded here (213–216).
- **`buildhub.zip`:** actual paths listed in Section 3 and the current package scripts. Read-only inspection of source copies; originals not modified.
