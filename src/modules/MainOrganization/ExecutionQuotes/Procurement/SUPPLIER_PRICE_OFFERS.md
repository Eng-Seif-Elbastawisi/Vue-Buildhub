# Supplier Price Offers integration

October 19 update: see [execution integration changes](../../../../../docs/execution-october-19-integration.md) for START-only new-work selection, the fixed alert, updated fields/attachments, legacy handling, and outstanding backend questions.

Procurement now presents two distinct steps and tables: Purchase Requests, then Supplier Prices for a selected saved request. New Purchase Request opens the request form. View Prices selects a saved request and shows its read-only supplier-price table. Add Supplier Prices / Manage Prices opens a separate editor dialog for that request. Purchase Orders, Client Product Offers, client approval, and supplier award decisions are outside this delivery.

## Confirmed contracts and references

Read `/home/elsayed-hassan/Downloads/purchase_request_prices_api.md` and `/home/elsayed-hassan/Downloads/purchase_request_api_documentation (1).md`. The latter is the supplied second guide with a space before `(1)`. Neither exact requested filename was present in the worktree; the original Procurement request guide remains unchanged.

- Authenticated employee POST `fetch_purchase_request_prices`: `{ purchase_request_id }`; unpaginated `data` array. The request ID is `purchase_requests.id`, not Quote, Project, item, timeline-stage, or offer-record ID.
- Authenticated employee POST `store_purchase_request_prices`: `{ purchase_request_id, suppliers: [{ id, price, duration, duration_type, attachment? }] }`. No duplicate owner fields are sent.
- October 19: each supplier accepts an optional Base64 `attachment`. Omission preserves the saved file; a new Data URI replaces it. Fetch returns one URL or null per offer, and the draft keeps that preview separate from a replacement. Supplier summaries use `supplier.title`, with compatibility for legacy names.
- Sync replaces the complete collection: omitted supplier offers are removed, included offers updated, new suppliers receive offers. Supplier master records remain untouched. An explicitly confirmed empty list removes every saved offer.
- `data[].id` identifies the price-offer record. `data[].supplier.id` identifies the existing Supplier and becomes `suppliers[].id` during Sync.
- Reused shared Package `DurationType`: Day 1, Week 2, Month 3, Year 4. Transport values remain numeric.
- Fetched `price` stays a decimal string. Draft price is a string; numeric Store conversion rejects changes to its decimal value instead of rounding or truncating. No currency, unit-price, or total-price interpretation is assumed. Duration is a non-negative safe integer in the editor. Prices are non-negative finite numbers; no undocumented fixed decimal scale is imposed.

## Existing infrastructure reused

BaseApiService, BaseRepository, BaseController, DataState, existing singleton conventions, notifications, authentication/base URL and organization/mainportal endpoint prefix. Overrides retain inherited index/create transport and repository mapping; controller read assignment is scoped because base read state assignment cannot reject stale responses before writing state.

Supplier lookup uses the existing SuppliersRepository -> SuppliersApiService -> Supplier endpoint and IndexSuppliersParams, through `PurchaseRequestPricesController.createSupplierLookup()`. Existing Supplier models are used by that repository. SuppliersController was inspected; its singleton shared list state is unsuitable for independent asynchronous row searches, so the existing Procurement lookup pattern is reused within the request-scoped prices controller without changing Supplier master functionality. Search, loading, no-results, pagination, and saved selections are supported by UpdatedCustomInputSelect. No additional Supplier repository, controller, fetch endpoint, or master-data persistence was created.

The nested price response has only `{ id, name }`. SuppliersModel declares required specialization, phone, and materials properties that are absent from this relation. A small local Supplier reference model maps this response; it does not duplicate Supplier master functionality. Nested request suppliers use named PurchaseRequestSupplierPriceParams and are serialized through `toMap()`.

PrimeVue Dialog/Skeleton, shared UpdatedCustomInputSelect/AppButton, existing Procurement styles/tokens, table semantics, responsive grids, English/Arabic localization, RTL direction, labeled fields, keyboard focus on confirmations, and the existing workspace route are reused. No new route, role IDs, dependencies, or client-portal price presentation were introduced.

## Draft, confirmation, and async safety

A complete successful mapped Fetch is required before editing/saving. Failed or unexpectedly paginated Fetch responses cannot unlock Sync. Missing supplier relations cannot be safely resubmitted and keep editing unavailable. All saved offers are held independently of the comparison filter; filtering never changes the Sync collection.

Adding, removing, selecting and changing prices modify the local draft only. Duplicate Supplier IDs are rejected. Save validates every row and sends the complete draft. Ordinary edits need no removal confirmation. Omitted saved suppliers are listed by name before confirmation; clearing all saved offers uses an explicit stronger prompt. Cancel preserves the draft. Closing or navigating away from unsaved changes requests explicit discard approval. Navigation while Sync is in flight is blocked.

Epoch and read-sequence checks protect Quote/request ownership and obsolete offer reads. Existing lookup guards protect stale Quote/search results. Sync has one in-flight lock, including owner changes; old results cannot update the new request. Backend remains the authority for organization and Supplier ownership.

Confirmed Sync success triggers an authoritative Fetch. If that refresh fails, another Sync stays disabled and Retry Fetch performs only a read. Ambiguous Store responses or transport errors that may follow persistence likewise require an explicit safe read before another write; draft values remain intact. Sync is never automatically retried, and mutation timeout/network/rate-limit states have no replay callback.

## Remaining backend contract gap

The actual Store/Sync response envelope and success/error data schema are absent from the supplied guide. Integration uses the existing verified BuildHub API convention of successful HTTP plus an explicit boolean `status: true`. Returned Store data is opaque; no price-offer IDs or saved payloads are invented. Missing/ambiguous status is unconfirmed persistence, preserves the draft, and requires read verification. A real Store response is still needed to verify this endpoint against the convention.

No live backend calls or mutations were executed. All integration tests intercept NetworkService.post. No commits, pushes, merges, or cherry-picks were performed.

## Initial implementation validation (2026-10-13)

- Targeted Supplier Offers: `npx vitest run` on the 12 new companion files, **79 passed**.
- Procurement plus existing workspace navigation/routes and WorkItemsPage checks: **179 passed, 1 pre-existing failure** across 32 files. The unchanged Requirements controller stage-selection assertion expects `[17]` and receives `[17, 18, 19]`; reproduced on detached `362bc12d`. This task changes only its Supplier lookup branch and preserves that existing stage behavior.
- `npm run test:run -- --maxWorkers=4`: **2,631 passed, 175 failed**; **887 passed files, 146 failed files**, 1,033 total files. Every failed case exactly matches the failures reproduced on the untouched starting commit. No Supplier Offers failure remains.
- `npm run type-check`: passed.
- Additional `npx vue-tsc --noEmit -p tsconfig.app.json`: 212 diagnostics, exactly identical to the untouched baseline; no new diagnostics.
- Focused ESLint and Stylelint: passed without warnings/errors.
- Prettier and `git diff --check`: passed.
- `npx vite build`: passed (8.53 seconds).
- Every added production TS/Vue file has its required companion test. No tests were disabled or existing assertions weakened. Tests cover the API boundary, request IDs, exact nested params, malformed/partial Fetch, decimal prices, duplicate selections, all draft changes, clear-all confirmation, stale Quote/request/lookup responses, concurrency, unconfirmed persistence, authoritative verification, failed refresh, bilingual UI, keyboard labeling, and unsaved navigation.

Review corrections:

- `core/models/purchase-request.price.model.ts` — use a named constructor field object consistent with existing mapped models.
- `presentation/components/SupplierOfferRow.vue` — reset the shared select after rejected duplicate selection so visible selection matches the draft.
- `presentation/controllers/purchase-request-prices.controller.ts` — update the reactive authoritative baseline on verification; already persisted drafts no longer encourage repeated Sync.
- `presentation/components/SupplierPriceOffersDialog.vue` — an unconfirmed Store followed by failed Fetch never displays confirmed-save feedback.

clean-code-guard: 4 fixed, 0 flagged for author. Test review removed an internal serializer spy while retaining exact observable payload assertions and preserved the existing failing regression assertions.

## Added files

- `src/modules/MainOrganization/ExecutionQuotes/Procurement/__tests__/price-fixtures.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/models/__tests__/purchase-request.price.model.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/models/__tests__/purchase-request.supplier-reference.model.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/models/purchase-request.price.model.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/models/purchase-request.supplier-reference.model.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/params/__tests__/fetch.purchase-request-prices.params.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/params/__tests__/purchase-request.supplier-price.params.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/params/__tests__/store.purchase-request-prices.params.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/params/__tests__/supplier-price.decimal.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/params/fetch.purchase-request-prices.params.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/params/purchase-request.supplier-price.params.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/params/store.purchase-request-prices.params.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/core/params/supplier-price.decimal.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/data/api/__tests__/purchase-request-prices.api-service.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/data/api/__tests__/purchase-request-prices.api.endpoints.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/data/api/purchase-request-prices.api-service.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/data/api/purchase-request-prices.api.endpoints.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/data/repositories/__tests__/purchase-request-prices.repository.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/data/repositories/purchase-request-prices.repository.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/SupplierOfferRow.vue`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/SupplierPriceOffersDialog.vue`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/__tests__/SupplierOfferRow.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/__tests__/SupplierPriceOffersDialog.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/controllers/__tests__/purchase-request-prices.controller.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/controllers/purchase-request-prices.controller.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/SUPPLIER_PRICE_OFFERS.md`

## Modified files

- `src/locales/ar.json`
- `src/locales/en.json`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/index.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/ProcurementPage.vue`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/__tests__/ProcurementPage.test.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/controllers/purchase-request.controller.ts`
- `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/styles/procurement.scss`

## Purchase Request / Supplier Prices workflow refactor (2026-10-14)

The latest user instruction changes the visible terminology from Requirements to Purchase Requests. Existing localization keys are retained for compatibility, but all Procurement request titles, details and feedback now say Purchase Request.

1. Use New Purchase Request above the Purchase Requests table. The dialog calls PurchaseRequestController.create() and refreshes the saved request list after confirmed creation.
2. Choose View Prices on an existing saved request. SupplierPriceOffersPanel shows that request's separate saved-price table and its reference. Before a request is saved/selected, the page explains the dependency and exposes no price editor.
3. Use Add Supplier Prices / Manage Prices above the price table. The dialog edits the entire supplier-offer draft through PurchaseRequestPricesController. Successful Sync plus authoritative refresh closes the editor and shows the saved table. Uncertain persistence or failed refresh keeps the editor open with safe read retry.

The table owns price-controller activation/read/release; the dialog owns editing and close/discard interaction. Cancelling with confirmed discard restores the saved collection before reopening. Request switches and route navigation retain unsaved-change protection. Complete-list removal confirmation, concurrency guards and unconfirmed-persistence behavior remain intact.

Supplier lookup has moved out of PurchaseRequestController into PurchaseRequestPricesController, preserving the existing Supplier repository/API while adding Purchase Request scope to lookup isolation. UpdatedCustomInputSelect now forwards its native dropdown filter as a search event; SupplierOfferRow uses it for paginated backend search without restoring the removed extra search input. Existing consumers that do not listen keep their current behavior.

Changed/refactored files beyond the original manifest:

- `presentation/components/SupplierPriceOffersPanel.vue` and its companion test: separate saved comparison/table and editor lifecycle.
- `presentation/components/SupplierPriceOffersDialog.vue` and its companion test: editor only; close after confirmed Sync and successful refresh.
- `presentation/components/ProcurementPage.vue` and its test: two-step explanation, request-table creation action, request-scoped price table, and a tested create-request-then-save-prices workflow.
- `presentation/components/PurchaseRequestFormDialog.vue` and its test: request wording and explanation; existing creation validation remains unchanged.
- `presentation/components/SupplierOfferRow.vue` and its test: request-scoped Supplier lookup and dropdown search.
- Both Procurement controllers: distinct request/prices responsibilities; explicit draft discard restores fetched prices.
- `presentation/styles/procurement.scss`: responsive two-step guidance using existing tokens.
- `src/shared/FormInputs/UpdatedCustomInputSelect.vue` and its existing companion test: native search event, with selected values preserved.
- EN/AR locales: Purchase Request terminology and clear step/table instructions.

Refactor validation results are recorded after the final run below. Backend contracts/endpoints are unchanged, including the undocumented Store response gap. No live API calls, commits, pushes, merges or cherry-picks were performed.
