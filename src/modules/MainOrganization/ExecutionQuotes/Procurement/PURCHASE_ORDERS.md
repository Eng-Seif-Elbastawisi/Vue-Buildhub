# Purchase Orders integration

Purchase Orders stay inside ExecutionQuotes → Procurement. Quote remains the project-management workspace. Existing Purchase Requests, saved Supplier Prices, Suppliers, shared attachment components and authenticated employee transport are reused.

## Entry points

| Location               | Action               | Endpoint                    |
| ---------------------- | -------------------- | --------------------------- |
| Purchase Requests list | View Purchase Order  | `POST fetch_purchase_order` |
| Supplier Prices list   | Store Purchase Order | `POST store_purchase_order` |

Every request row provides read-only View Purchase Order. Fetch sends only `purchase_request_id`; a confirmed single object shows details, while successful `data: null` shows no confirmed order.

Supplier Prices has a Store Purchase Order header action for Pending requests. It opens the existing dialog to select exactly one saved offer, enter the required date, and optionally add notes/attachment. Each saved offer row also opens Store with that record preselected.

**Supplier Prices never fetches Purchase Orders.** This includes initial list loading, opening Store, pre-submission checks, post-success refresh, dialog closing and safe retry. There is no order View action, order Fetch loader/error, or order Fetch retry in Supplier Prices. The Store dialog loads saved supplier offers and consumes the Store success/error state. After success it directs the user to View Purchase Order on the Purchase Requests list; it does not construct or fetch an order object.

## Contracts and models

Store request:

```json
{
  "purchase_request_id": 2,
  "purchase_request_price_id": 4,
  "note": "Purchase order approved for electrical materials.",
  "date": "2026-10-14"
}
```

`file` is optional and omitted when absent. When selected it contains the complete Base64 data URI produced by the shared uploader.

Request ID, price-offer record ID and Supplier ID are distinct. If Supplier ID is 3 and the saved price record ID is 4, Store sends **4** as `purchase_request_price_id`, never 3. The selected offer must belong to the selected request. The backend derives Supplier, Client, Quote, organization, employee, status and payment state; those fields are not submitted.

Fetch maps a single object into PurchaseOrderModel, named PurchaseOrderRequestModel/PurchaseOrderPriceModel submodels, the existing employee reference mapper and TitleModel for Supplier/Client `{ id, title }`. Decimal-string prices remain strings. Nullable notes and attachment URLs remain nullable. Successful null Fetch remains distinct from initial/loading/error states.

BaseController, BaseRepository, BaseApiService, DataState, singleton conventions, existing role-sensitive API prefixes and authentication are reused. Only the documented Store/Fetch endpoints were added.

## Business rules and state

One Purchase Order is allowed per Purchase Request. Only Pending (`1`) requests can Store. Before Store, the controller refreshes Purchase Requests to verify ownership/current status and refreshes saved offers to verify the selected record ID belongs to the request. No Purchase Order Fetch is part of those checks; the backend remains authoritative for the one-order-per-request rule.

The backend preserves initial Pending history, creates confirmed history, changes the request to Confirmed (`3`) and initializes payment state. The frontend never writes status/history/payment fields.

After verified Store success, Purchase Requests and saved offers refresh from the backend. Confirmation locks Supplier Price Add/Edit/Remove/Sync while saved offers stay visible. No client status is manually forced. Request-level Fetch can subsequently display authoritative order details and read-only payment state.

Owner epochs, read sequences and a transport lock protect Quote/request switches and duplicate submission. Successful or uncertain writes remain blocked for that Quote/request during the controller session. Store has no automatic retry or replay callback. Explicit validation failures preserve the draft and can be corrected; uncertain/conflicting outcomes preserve it and block a second Store.

Store success remains separate from a failed request/offer refresh. Safe retry reads requests/offers only and never replays Store or fetches order details. A known order already loaded through request-level Fetch also prevents Store for that active context. Details must be requested from the Purchase Requests list.

## Shared attachments and presentation

PurchaseOrderForm uses existing HandleFilesUpload for filename/type display, removal/replacement, accepted file types and complete Base64 conversion. Processing/error events disable submission during conversion. No uploader/viewer/library or upload-size limit was introduced. Selected files and other draft values survive failed submission where supported.

PurchaseOrderDetails opens the existing app-level AttachmentGallery through its shared gallery API. PDF/image previews, downloads, unsupported-type fallback, loading/error and close behavior are reused. Fetch URLs never become Store input. Null/unsafe URLs have no active preview action.

PrimeVue and existing Procurement/form controls, tokens, English/Arabic labels, RTL direction and responsive layouts are reused. Supplier Prices uses Store Purchase Order text; Purchase Requests uses View Purchase Order.

## Backend gaps and verification

Source contract: `/home/elsayed-hassan/Downloads/purchase_order_api_documentation.md`.

The actual Store response was not supplied. This integration requires the existing application's explicit boolean-status mutation envelope and ignores opaque Store data. Missing boolean status is an uncertain outcome, not success. Authorized deployment verification still needs a real Store response proving that envelope.

Endpoint-specific HTTP error payloads and upload MIME/size limits were not supplied; existing transport/errors/shared accepted types are retained. Null Fetch is agreed behavior in the handoff, not a captured live result. The current committed Supplier Price relation mapper reads `supplier.title`; existing tests using `supplier.name` fixtures remain a separate baseline mismatch, preserved by this change.

Focused tests verify request-only Fetch, zero order Fetch calls from all Supplier Prices Store entry points, header/row selection, exact Store identifiers/date/notes/file, owner/status checks, stale responses, duplicate prevention, failed refresh, shared attachments and read-only confirmed offers. No real-browser mobile visual check was performed because no browser runner is installed.

No payment, update, delete, cancellation, rejection, supplier approval or new CRUD functionality was added. No live backend calls, commits, pushes, merges, resets or cherry-picks were performed.

Validation for the final Store-only Supplier Prices flow: **37 focused tests passed across six files**. `npm run type-check`, focused ESLint, focused Stylelint and `git diff --check` passed. Direct application checking still reports existing response-mapper errors, including the unchanged Purchase Order repository signature; no diagnostics are in the presentation components or controller changed for this separation.
