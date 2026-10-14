# Purchase Orders integration

Implemented inside the existing ExecutionQuotes → Procurement workspace. A Quote remains the project-management owner; no Project module, order list route, or new Supplier CRUD was added.

## Contract and transport

- `POST store_purchase_order`: `purchase_request_id`, `purchase_request_price_id`, required `date` (`YYYY-MM-DD`), nullable optional `note`, optional `file`.
- `POST fetch_purchase_order`: only `purchase_request_id`; response `data` is a single confirmed order object or `null`.
- Uses the existing role-sensitive `mainportal/` / `organization/` prefixes, employee authentication, JSON transport and BaseApiService. No token handling was added.
- `purchase_request_price_id` is the saved **offer record ID**, never `supplier.id`. The selected offer must belong to the selected request. Supplier is derived by the backend.
- Fetch maps named request/price submodels, the existing employee mapper, and TitleModel for supplier/client `{ id, title }`. Supplier Offer responses separately map `supplier.name`. Decimal-string prices remain strings.

## Workflow and safeguards

Exactly one confirmed order belongs to one Purchase Request. Only Pending (`1`) requests may issue. The backend creates confirmed history while preserving initial pending history, changes the request to Confirmed (`3`), and initializes `is_order_paid` to false. The frontend sends no status, payment, ownership, supplier or client fields.

Procurement rows open an order review for Pending requests or details for Confirmed requests. Rejected requests have no order issue action. Review first fetches the existing order; Issue is available only after a successful empty result. Initial Procurement loading makes no per-request order calls.

Before Store, the controller re-fetches requests, the order, and offers and checks ownership, status, absence of an order, and the selected offer ID. Separate DataStates track order Fetch, Store and offers. Owner epochs and request sequences reject stale responses. A transport lock prevents simultaneous submissions, including across owner switches.

Confirmed/rejected Supplier Offers stay visible read-only. Add, row edits, removal and Sync are guarded both in the UI and existing price controller. Backend checks remain authoritative for concurrent changes.

Store consumes only an explicit boolean `status` in the application's generic mutation envelope and ignores opaque mutation data. After verified success it separately refreshes requests, order and offers. No model is built from form data. Store success followed by failed reads stays a successful Store with a read-only refresh action. No Store retry callback or automatic replay exists. Validation failures retain form data; uncertain responses and other conflicts block further issuance for that Quote/request during the controller session, even when the dialog is reopened. Read retries do not unblock uncertain writes or reissue an order.

Fetch `status: true, data: null` is a successful no-order state, distinct from initial/loading/error and a confirmed order. A confirmed request without fetched order details is never offered Issue.

## Attachments and UI

PurchaseOrderForm uses `HandleFilesUpload` with one optional file and its existing complete data-URI Base64 conversion, accepted types, filename/type preview and remove behavior. Processing/error events were added to that shared component so submission waits for conversion. No size limit was invented. Remove then select to replace. Conversion or submission failures retain existing selections where supported. Absent file is omitted; fetched URLs never enter Store params.

PurchaseOrderDetails opens the shared `attachmentGallery`, rendered by the existing app-level AttachmentGallery dialog. Its PDF/image preview, loading/error, download and unsupported-type fallback are reused. Null/unsafe attachment sources have no active action. Status and payment state are read-only. English/Arabic copy, RTL direction, logical spacing and responsive layout reuse Procurement and PrimeVue controls.

## Remaining precise backend gaps

Source: `/home/elsayed-hassan/Downloads/purchase_order_api_documentation.md`.

An actual Store response was not supplied. The existing application supports a boolean-status generic mutation envelope; this integration requires that envelope and does not assume any Store `data` shape. Deployment verification still needs an authorized response proving Store uses that envelope. A response without explicit boolean status is reported as an uncertain outcome, not success.

Endpoint-specific HTTP error payloads, upload MIME restrictions and upload-size limits were not supplied. Existing transport/error handling and shared accepted file types are reused. The agreed successful null Fetch behavior was described in the handoff, rather than captured live.

All API exercises during implementation used mocked network transport. No live backend requests or mutations were executed. No payment, update, delete, cancellation, rejection or Supplier approval functionality was added.

## File inventory

Added files (paths relative to the repository root):

- `src/modules/MainOrganization/ExecutionQuotes/Procurement/PURCHASE_ORDERS.md`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/__tests__/order-fixtures.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/models/__tests__/purchase.order.model.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/models/__tests__/purchase.order.price.model.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/models/__tests__/purchase.order.request.model.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/models/purchase.order.model.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/models/purchase.order.price.model.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/models/purchase.order.request.model.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/params/__tests__/fetch.purchase.order.params.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/params/__tests__/store.purchase.order.params.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/params/fetch.purchase.order.params.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/params/store.purchase.order.params.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/data/api/__tests__/purchase.order.api-service.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/data/api/__tests__/purchase.order.api.endpoints.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/data/api/purchase.order.api-service.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/data/api/purchase.order.api.endpoints.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/data/repositories/__tests__/purchase.order.repository.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/data/repositories/purchase.order.repository.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/PurchaseOrderDetails.vue`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/PurchaseOrderForm.vue`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/__tests__/PurchaseOrderDetails.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/__tests__/PurchaseOrderForm.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/__tests__/PurchaseOrderIntegration.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/controllers/__tests__/purchase.order.controller.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/controllers/purchase.order.controller.ts`

Changed files:

- `src/locales/ar.json`
- `src/locales/en.json`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/models/__tests__/purchase-request.supplier-reference.model.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/index.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/ProcurementPage.vue`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/SupplierPriceOffersDialog.vue`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/SupplierPriceOffersPanel.vue`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/controllers/purchase-request-prices.controller.ts`
- `src/shared/FormInputs/HandleFilesUpload.vue`
- `src/shared/FormInputs/__tests__/HandleFilesUpload.test.ts`

## Validation results

- Requested `npm run type-check`: passed. This script checks the root references without a build; a separate `npx vue-tsc --noEmit -p tsconfig.app.json` was also run to check application sources.
- Direct application check: 212 existing diagnostics, compared with 213 at HEAD. Normalizing temporary checkout paths shows zero introduced diagnostics. Removing the already-unused FieldHelpIcon import accounts for the one resolved diagnostic.
- Focused Purchase Order and shared uploader tests: **57 passed across 13 files**. Covers contracts, mapping, null Fetch, selected offer/request ownership, status eligibility, price locking, duplicate submission, stale reads/mutations, successful Store with failed Fetch, preserved drafts/Base64, shared preview, EN/AR and Quote navigation.
- Broader ExecutionQuotes workspace plus shared attachments: **716 passed, 82 failed across 176 files**. Baseline HEAD: **666 passed, 91 failed across 164 files**, plus one existing unhandled PrimeVue matchMedia error. Every failing test name in the changed-tree run is present in the baseline run; no new failing test was introduced. Supplier-name mapping resolved nine baseline failures. Later controller/model changes were rechecked with the focused suite.
- Remaining Procurement failures are the existing Purchase Request stage selector/main-stage expectations and the commented-out Supplier Offer filter. Other baseline failures also exist in Schedule, Site & Team, Work Items, Quote components and shared gallery download assertions.
- Focused ESLint: zero errors, four existing optional-prop warnings in HandleFilesUpload. Focused Stylelint and `git diff --check`: passed. All changed/new production TS/Vue files have accepted companion tests.
- Responsive grid/dialog styles and RTL rendering were covered by implementation and component tests. No real-browser visual/mobile check was performed; no browser runner is installed in this environment.
- No live backend calls, commits, pushes, merges, resets or cherry-picks were executed. Branch remains `feat/procurement`.
