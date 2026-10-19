# Execution integration — October 19, 2026

Contract source: [Execution Features API Updates](./BuildHub_Execution_Features_API_Updates_Frontend.md). The previous `docs/BuildHub_Project_Timeline_Status_API_Frontend (1).md` document was not found; the work-status contract supplied in the task and the existing Schedule integration were used.

## Timeline selection and Schedule

`ScheduleOwnerParams` accepts an optional fourth argument, `workStatus`, validated against the existing `TimelineWorkStatus`. Its ordinary Quote request remains `{ quote_id }`; an execution request adds numeric `work_status: 1`. An omitted filter is absent from JSON, rather than null. Group-specific and settings operations reject the filter.

`ScheduleRepository.fetchStartedProjectTimelines(quoteId)` delegates to `readOverview()` and the existing `fetch_project_timelines` endpoint. It does not introduce another transport or response model. Work Items and Purchase Request controllers keep their own Quote-scoped state and stale-response guards. Options require `TimelineWorkStatus.START`, including when a server response contains other statuses. Multiple START Groups remain available. Shop Drawing and Purchase Request selections additionally require an explicit main-stage association (`parentId === null`, no sub-stage relation).

The selector audit found these consumers:

- `WorkItemStageSelect`: Engineer Tasks, Daily Reports, Meetings, Issues, Risks, Delays, and Shop Drawings.
- `PurchaseRequestController.mainStages`: Purchase Request item stage selections.

New submissions re-fetch started Groups before writing and check the selected association again. A cached stage that has become HOLD/STOP/unstarted cannot pass this check. Store remains locked through that read and the affected historical-list refresh. The Quote Show header refreshes the Schedule overview on window focus; execution forms retain their eligibility refresh before Store. There is no server push subscription for status changes; the backend remains authoritative about a status change concurrent with Store.

Historical tasks, reports, activities, drawings, and purchase requests keep their existing Fetch contracts. They are not filtered by work status. A saved relation without a current active label remains visible by its Timeline Stage association ID. These existing creation forms do not add an edit operation or erase saved relationships. Supplier pricing continues to use Purchase Request IDs, and Material Receipt continues to use Purchase Request Item IDs.

The normal Schedule controller/list remains unfiltered, including configuration, ordering, approval, and Group work status. Quote approval (`timeline_status = 3`) and Group execution status (`work_status = null/1/2/3`) remain independent.

## Fixed Timeline Group launcher

`ExecutionQuotes/shared/components/TimelineStartRequiredAlert.vue` is mounted once by `DashboardLayout.vue` for `/execution-quotes/show/:id` and every descendant path, under both organization and mainportal prefixes. The fixed calendar icon appears on the overview, Site & Team, Schedule, Work Items, Drawings, Procurement, and Warehouse pages. It is absent outside this route family.

Clicking the icon opens a nonmodal panel containing all Timeline Groups and their independent statuses, including START Groups. Clicking it again, using Close, or pressing Escape inside the panel closes it; Close and Escape return keyboard focus to the icon. Navigation closes the panel and switching Quotes resets its input values. No Teleport, modal overlay, or Group selection dialog is used.

The launcher fetches nothing until opened. The panel reuses the existing unfiltered Schedule overview and owner lookup, preserving any current Schedule Group route context. Concurrent overview reads share the existing controller's pending request. Loading shows progress without a false no-active warning. A failed Fetch displays the existing error and an explicit read Retry. No Groups directs the user to create one in Schedule; unapproved timelines direct the user to Schedule approval and disable Start controls.

Each non-START Group has an inline Start form with optional reason and note. It calls the existing `ScheduleController.changeWorkStatus()` and `change_project_timeline_work_status` transport with that row's **Group** `project_timeline_id`, not a stage ID. A failed mutation preserves its row and input values without automatic mutation retries. Confirmed success refetches the authoritative Schedule overview, updates the row's status, and removes only its Start controls. The list remains open and other Groups keep their own statuses. Active execution selectors owned by the same Quote are refetched through their existing controllers. Window focus refreshes the overview and approval while the panel is open.

The icon uses logical inline-end positioning, with safe-area margins and extra bottom clearance on mobile. The panel scrolls within the available viewport; inline fields stack on mobile. Scoped BuildHub tokens, bilingual labels, focus states, and a z-index of 150 keep it below actual dialogs and the mobile navigation drawer. Browser fixture checks cover desktop/mobile/Arabic panel bounds and keyboard closing; they do not establish acceptance with every populated live page or fixed action bar.

## Four feature updates

### Shop Drawings

`StoreShopDrawingQuoteParams` accepts `projectFloorSpaceId` and emits `project_floor_space_id` when selected. It uses the Project Floor Space association, not the nested master `space.id`. The existing Project Floor repository supplies spaces using the linked Project ID resolved from Quote Show; Quote ID is never substituted for Project ID. Submitted spaces must belong to that loaded lookup.

The new field is optional in the frontend because the example does not establish whether Store requires it. Backend validation remains authoritative. `ShopDrawingQuoteModel` maps the nullable relation through the existing `PurchaseRequestProjectFloorSpaceModel`, whose nested `space` uses `TitleModel`. The list renders `projectFloorSpace.space.title` when available, without inventing a room for legacy nulls. Backend-generated `custom_number` is unchanged.

The form uses the shared `HandleFilesUpload` in single-file mode. Store receives its Base64 Data URI; fetched drawing URLs continue to open the existing shared `attachmentGallery` / `AttachmentGallery` dialog.

### Daily Reports

`ReportScopeType.ALL_PROJECT = 1` and `SPECIFIC_SPACE = 2` are separate from site safety status. Specific-space scope requires a loaded Project Floor Space association. Whole-project scope omits the space field, and switching scope clears the form selection.

`ReportAttachmentParams` serializes each `{ file }`; the parent maps every attachment through `toMap()` and sends `attachments: []` for no files. The existing shared uploader supports multiple files, so no uploader enhancement or new dependency was needed. No additional MIME/size restrictions were introduced.

`DailyReportModel` maps nullable space relations, report scope, and report-level attachment records through `ExecutionQuoteAttachmentModel`, including file metadata/type. Space attachments remain a separate mapped array. The list opens only report-level files in the shared gallery. Legacy missing scope/space and empty attachment arrays remain readable. Failed saves preserve form selections/files and display backend validation feedback; confirmed saves refresh reports rather than inserting a fabricated record.

### Supplier Price Offers

Existing Supplier lookup, offer controller, and full synchronization workflow are retained. Offer summaries map actual `supplier.title`, with a compatible `name` accessor and legacy name parsing. Offer row ID remains distinct from Supplier ID, and fetched prices remain decimal strings.

`PurchaseRequestSupplierPriceParams.attachment` accepts a new Base64 replacement. When unchanged it is undefined and omitted; it is never sent as null or populated from a fetched URL. Each draft separately retains `savedAttachment` for preview. Replacement changes participate in dirty-state detection. The full supplier collection is still sent, with the existing explicit removal confirmation. A rejected replacement keeps both the draft file and saved preview. Confirmed Sync re-fetches authoritative offers before replacing the preview. Switching Supplier clears the previous Supplier's file draft/preview.

Both offer editing and comparison use the existing attachment gallery. The shared uploader handles one optional file per Supplier row.

### Meetings

`MeetingAudienceType.INTERNAL = 1` and `WITH_CLIENT = 2` are independent of `WorkActivityType`. Meeting requests include `description`, `meeting_audience_type`, `result`, and primitive numeric `attendees`. The form reuses the Employee repository/controller lookup and the shared multi-select. It introduces no client-contact records.

`WorkActivityModel` maps attendees through the existing `EmployeeModel`, separately from creator and assigned employee. Audience/result nulls and empty attendees are accepted for legacy records. Meeting lists show available audience, result, and participants. Issues/Risks/Delays retain their description/optional assigned-employee payload and omit meeting-only fields.

## Exact backend questions still open

1. What are the success response bodies and status/message guarantees for `store_shop_drawing_quote`, `store_project_timeline_stage_report`, `store_purchase_request_prices`, and `store_project_timeline_stage_meeting`? The October 19 document supplies none. Existing explicit-success handling is reused; no Store response schema is marked verified and no Store result is treated as a fetched record.
2. Does `store_shop_drawing_quote` require `project_floor_space_id`, or may a new drawing omit it? A populated example does not define requiredness.
3. Does Meeting Store persist `description`? The supplied Store sends non-null text while the actual Fetch examples return null. No backend implementation was available to resolve this discrepancy.
4. What are the exact validation/permission error envelopes for the new fields, and their requiredness rules beyond the documented specific-space requirement? Existing error handling is retained; the supplied examples do not verify those schemas.

No live backend requests or mutations were used for this implementation. Tests mock the network boundary. No commit or push was performed.

## Changed-file inventory

The supplied backend contract file is user-provided and unchanged. Implementation, test, locale, and integration-note changes:

- [docs/execution-october-19-integration.md](../docs/execution-october-19-integration.md)
- [src/locales/ar.json](../src/locales/ar.json)
- [src/locales/en.json](../src/locales/en.json)
- [src/modules/MainOrganization/ExecutionQuotes/Procurement/INTEGRATION.md](../src/modules/MainOrganization/ExecutionQuotes/Procurement/INTEGRATION.md)
- [src/modules/MainOrganization/ExecutionQuotes/Procurement/SUPPLIER_PRICE_OFFERS.md](../src/modules/MainOrganization/ExecutionQuotes/Procurement/SUPPLIER_PRICE_OFFERS.md)
- [src/modules/MainOrganization/ExecutionQuotes/Procurement/**tests**/fixtures.ts](../src/modules/MainOrganization/ExecutionQuotes/Procurement/__tests__/fixtures.ts)
- [src/modules/MainOrganization/ExecutionQuotes/Procurement/core/models/purchase-request.price.model.ts](../src/modules/MainOrganization/ExecutionQuotes/Procurement/core/models/purchase-request.price.model.ts)
- [src/modules/MainOrganization/ExecutionQuotes/Procurement/core/models/purchase-request.project-floor-space.model.ts](../src/modules/MainOrganization/ExecutionQuotes/Procurement/core/models/purchase-request.project-floor-space.model.ts)
- [src/modules/MainOrganization/ExecutionQuotes/Procurement/core/models/purchase-request.supplier-reference.model.ts](../src/modules/MainOrganization/ExecutionQuotes/Procurement/core/models/purchase-request.supplier-reference.model.ts)
- [src/modules/MainOrganization/ExecutionQuotes/Procurement/core/params/**tests**/purchase-request.supplier-price.params.test.ts](../src/modules/MainOrganization/ExecutionQuotes/Procurement/core/params/__tests__/purchase-request.supplier-price.params.test.ts)
- [src/modules/MainOrganization/ExecutionQuotes/Procurement/core/params/purchase-request.supplier-price.params.ts](../src/modules/MainOrganization/ExecutionQuotes/Procurement/core/params/purchase-request.supplier-price.params.ts)
- [src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/PurchaseRequestCreatePage.vue](../src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/PurchaseRequestCreatePage.vue)
- [src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/SupplierOfferRow.vue](../src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/SupplierOfferRow.vue)
- [src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/SupplierPriceOffersPanel.vue](../src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/SupplierPriceOffersPanel.vue)
- [src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/**tests**/PurchaseRequestCreatePage.test.ts](../src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/__tests__/PurchaseRequestCreatePage.test.ts)
- [src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/controllers/**tests**/purchase-request-prices.controller.test.ts](../src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/controllers/__tests__/purchase-request-prices.controller.test.ts)
- [src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/controllers/**tests**/purchase-request.controller.test.ts](../src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/controllers/__tests__/purchase-request.controller.test.ts)
- [src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/controllers/purchase-request-prices.controller.ts](../src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/controllers/purchase-request-prices.controller.ts)
- [src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/controllers/purchase-request.controller.ts](../src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/controllers/purchase-request.controller.ts)
- [src/modules/MainOrganization/ExecutionQuotes/Schedule/INTEGRATION.md](../src/modules/MainOrganization/ExecutionQuotes/Schedule/INTEGRATION.md)
- [src/modules/MainOrganization/ExecutionQuotes/Schedule/core/models/project.timeline.stage.model.ts](../src/modules/MainOrganization/ExecutionQuotes/Schedule/core/models/project.timeline.stage.model.ts)
- [src/modules/MainOrganization/ExecutionQuotes/Schedule/core/params/**tests**/schedule.owner.params.test.ts](../src/modules/MainOrganization/ExecutionQuotes/Schedule/core/params/__tests__/schedule.owner.params.test.ts)
- [src/modules/MainOrganization/ExecutionQuotes/Schedule/core/params/schedule.owner.params.ts](../src/modules/MainOrganization/ExecutionQuotes/Schedule/core/params/schedule.owner.params.ts)
- [src/modules/MainOrganization/ExecutionQuotes/Schedule/data/api/**tests**/schedule.api-service.test.ts](../src/modules/MainOrganization/ExecutionQuotes/Schedule/data/api/__tests__/schedule.api-service.test.ts)
- [src/modules/MainOrganization/ExecutionQuotes/Schedule/data/api/schedule.api-service.ts](../src/modules/MainOrganization/ExecutionQuotes/Schedule/data/api/schedule.api-service.ts)
- [src/modules/MainOrganization/ExecutionQuotes/Schedule/data/repositories/schedule.repository.ts](../src/modules/MainOrganization/ExecutionQuotes/Schedule/data/repositories/schedule.repository.ts)
- [src/modules/MainOrganization/ExecutionQuotes/Schedule/presentation/components/ScheduleWorkStatusDialog.vue](../src/modules/MainOrganization/ExecutionQuotes/Schedule/presentation/components/ScheduleWorkStatusDialog.vue)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/INTEGRATION.md](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/INTEGRATION.md)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/**tests**/timeline-fixtures.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/__tests__/timeline-fixtures.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/constants/work-items.constants.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/constants/work-items.constants.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/models/**tests**/execution-updates.test.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/models/__tests__/execution-updates.test.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/models/activity.model.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/models/activity.model.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/models/report.model.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/models/report.model.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/models/shop-drawing.model.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/models/shop-drawing.model.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/params/**tests**/report.attachment.params.test.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/params/__tests__/report.attachment.params.test.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/params/**tests**/store.activity.params.test.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/params/__tests__/store.activity.params.test.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/params/**tests**/store.report.params.test.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/params/__tests__/store.report.params.test.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/params/**tests**/store.shop-drawing.params.test.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/params/__tests__/store.shop-drawing.params.test.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/params/report.attachment.params.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/params/report.attachment.params.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/params/store.activity.params.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/params/store.activity.params.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/params/store.report.params.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/params/store.report.params.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/params/store.shop-drawing.params.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/core/params/store.shop-drawing.params.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/DailyReportFormDialog.vue](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/DailyReportFormDialog.vue)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/DailyReportsList.vue](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/DailyReportsList.vue)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/MeetingIssueFormDialog.vue](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/MeetingIssueFormDialog.vue)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/ShopDrawingFormDialog.vue](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/ShopDrawingFormDialog.vue)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/ShopDrawingsList.vue](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/ShopDrawingsList.vue)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/ShopDrawingsPage.vue](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/ShopDrawingsPage.vue)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/WorkActivitiesList.vue](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/WorkActivitiesList.vue)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/WorkItemsPage.vue](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/WorkItemsPage.vue)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/**tests**/DailyReportFormDialog.test.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/__tests__/DailyReportFormDialog.test.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/**tests**/MeetingIssueFormDialog.test.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/__tests__/MeetingIssueFormDialog.test.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/**tests**/ShopDrawingFormDialog.test.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/__tests__/ShopDrawingFormDialog.test.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/**tests**/ShopDrawingsPage.test.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/__tests__/ShopDrawingsPage.test.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/**tests**/TaskFormDialog.test.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/__tests__/TaskFormDialog.test.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/**tests**/WorkItemStageSelect.test.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/__tests__/WorkItemStageSelect.test.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/controllers/**tests**/started-timelines.test.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/controllers/__tests__/started-timelines.test.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/controllers/**tests**/work-items.controller.test.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/controllers/__tests__/work-items.controller.test.ts)
- [src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/controllers/work-items.controller.ts](../src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/controllers/work-items.controller.ts)
- [src/modules/MainOrganization/ExecutionQuotes/core/models/execution.quote.attachment.model.ts](../src/modules/MainOrganization/ExecutionQuotes/core/models/execution.quote.attachment.model.ts)
- [src/modules/MainOrganization/ExecutionQuotes/shared/components/TimelineStartRequiredAlert.vue](../src/modules/MainOrganization/ExecutionQuotes/shared/components/TimelineStartRequiredAlert.vue)
- [src/modules/MainOrganization/ExecutionQuotes/shared/components/**tests**/TimelineStartRequiredAlert.test.ts](../src/modules/MainOrganization/ExecutionQuotes/shared/components/__tests__/TimelineStartRequiredAlert.test.ts)

## Validation results

- Focused Work Items core/controllers/forms, Procurement controllers/models/create form, shared alert, and execution route tests: **29 files, 191 tests passed**.
- Optional Timeline filter params/API checks: **2 tests passed**. The complete suite also ran the other tests in those files; focused name selection did not add any skipped tests to the source.
- Daily Report and Meeting form checks after adding the scope/files/attendee draft regressions: **2 files, 4 tests passed**.
- Final Work Items / Shop Drawings / Purchase Request page and shared-alert checks after moving the alert spacer below page content: **4 files, 23 tests passed**. These focused counts overlap and must not be summed as a unique test total.
- `npm run type-check`: **passed**. `npx tsc --noEmit`: **passed**. The root configuration has project references and an empty `files` list, so the app configuration was checked separately.
- `npx vue-tsc --noEmit -p tsconfig.app.json`: **216 diagnostics**. Untouched HEAD, checked with the same installed dependencies, has **220 diagnostics**. Normalizing checkout paths and source line positions finds **no new diagnostics**.
- Focused ESLint and Stylelint: **passed without warnings**. `git diff --check`: **passed**. Every changed production TS/Vue file has an accepted companion test.
- `npm run test:run -- --maxWorkers=2`: **953 passed / 144 failed files; 2,920 passed / 172 failed tests; 1,097 files total**, duration **634.64 seconds**. The suite remains red. Existing failures include unresolved imports and empty test files in unrelated modules, plus legacy Schedule, Site & Team, and Work Items expectations. A separate untouched-HEAD execution run reported **879 passed / 81 failed tests across 216 files**. Comparing named execution failures in that baseline with the final full run finds **no newly failing named execution tests**; 11 distinct previously failing names no longer fail. A Warehouse receipt-history model failure was also reproduced directly on untouched HEAD.

No tests were disabled, assertions removed to conceal failures, or TypeScript settings weakened. The automated checks use mocked transport for the changed integrations. Real-browser mobile overlap/dialog stacking and live backend behavior remain unverified.


## Launcher follow-up validation

The latest requested presentation replaces the inline header with a fixed icon and click-open panel across the full Quote Show route family. Tests use mocked transport; no live API mutations were executed. Earlier placement test counts above describe superseded presentation and are not acceptance evidence for the launcher.

- Launcher regressions: **7 files, 51 tests passed**, covering both portal prefixes and all current workspace route suffixes, disclosure/focus behavior, approval blocking, status rows, Retry, inline Start, duplicate-submit protection, and same-Quote active-selector refresh.
- Focused ESLint and Stylelint: passed without warnings. `npm run type-check`: passed. The explicit app-source check still reports **216 existing diagnostics**, matching the earlier baseline after normalizing line positions; no diagnostics name the launcher or Dashboard layout.
- Browser fixtures at 1440px desktop and 390px mobile/Arabic: panel bounds fit the viewport, no horizontal overflow or page errors, fixed positioning, Escape close and focus return passed. These fixtures mock transport and do not verify live transitions or every populated workspace page.
