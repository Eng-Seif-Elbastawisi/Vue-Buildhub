# Material Receipt integration

Material Receipt belongs to the Execution Quote workspace. The Purchase Request selector reuses Procurement's `fetch_purchase_requests` request with the current `quote_id`. Selecting a request loads its receiving summary; the quote-wide history loads independently.

| Operation         | Endpoint                                  | Scope                 | Successful `data`                  |
| ----------------- | ----------------------------------------- | --------------------- | ---------------------------------- |
| Store             | `store_purchase_request_receipt`          | `purchase_request_id` | Unspecified by the backend handoff |
| Quantity summary  | `fetch_purchase_request_receipts`         | `purchase_request_id` | Direct `ItemSummary[]`             |
| Receiving history | `fetch_purchase_request_receipts_history` | `quote_id`            | Direct, flat `ReceiptHistory[]`    |

The summary contains `purchase_request_item`, `requested_quantity`, `received_quantity`, and `remaining_quantity`. All response quantities are decimal strings. There is no aggregate receiving status in the summary. Items with zero remaining quantity cannot receive more. The UI sends only positive quantities from this operation, with at most two decimal places, using `purchase_request_item.id` as `purchase_request_item_id`. The backend recomputes cumulative totals and enforces the remaining amount and confirmed Purchase Order eligibility.

Neither read response has a legacy `items_summary` or `receipts` wrapper, and the summary has no `data.status` aggregate field.

History can include multiple Purchase Requests in the same Quote. The UI filters the fetched quote-wide array locally when a request is selected. Each receipt item's `id` is a receipt item record ID; its nested `purchase_request_item` contains the original requested item, whose `id` can occur in multiple receipts. `employee` identifies the receiver; `organization_employee` identifies the recorder. Receipt status `1` (partial) or `2` (complete) is a historical snapshot. It is separate from the root boolean API success status.

The backend handoff does not specify a Store response body. The implementation accepts only the established root boolean `status` success convention used by the adjacent Procurement integration. It does not parse or create a saved receipt from Store response data. HTTP success without that boolean cannot confirm persistence; in that case, the user should inspect refreshed read data before another submission. No live Store calls were made during implementation.

## Material Disbursement integration

Material Disbursement uses the same Execution Quote and Warehouse workspace. It starts with the current `quote_id`; there is no Purchase Request selector. The established employee selector supplies the required `receiver_id`. The authenticated employee who issues materials is recorded by the backend as `organization_employee` and is never sent by the frontend.

| Operation       | Endpoint                                    | Request scope | Successful `data`                            |
| --------------- | ------------------------------------------- | ------------- | -------------------------------------------- |
| Available stock | `fetch_purchase_request_disbursement_stock` | `quote_id`    | Direct `DisbursementStock[]`                 |
| Store           | `store_purchase_request_disbursement`       | `quote_id`    | Unspecified by the backend handoff           |
| History         | `fetch_purchase_request_disbursements`      | `quote_id`    | Direct, flat `PurchaseRequestDisbursement[]` |

The stock response contains a compact `purchase_request_item` with its original requested quantity, plus cumulative `received_quantity`, cumulative `disbursed_quantity`, and current `available_quantity`. All response quantities remain decimal strings. The form limits each issue to `available_quantity`, never the original requested quantity. It omits unselected, blank, and zero rows, requires at least one positive quantity, and rejects duplicates, invalid IDs, more than two decimal places, and amounts above the last loaded available balance. The backend must revalidate stock during Store because the balance can change concurrently. A successful Store issues material immediately; there is no approval state or follow-up confirmation endpoint.

History is quote-wide and keeps every disbursement record. Each history line's `id` identifies that disbursement line; its nested `purchase_request_item.id` is the original Purchase Request item identifier used in Store. Repeated original item IDs across lines or records remain distinct. `receiver` identifies the employee who received the materials, while `organization_employee` identifies the employee who issued them. The only confirmed `type` is `1` (Material Disbursement). The details dialog reads the existing history data; it does not call another endpoint.

The handoff gives no Store success or error body. As with Material Receipt, the frontend uses the established root boolean `status` convention to confirm Store and does not infer success from HTTP status alone. A confirmed Store triggers authoritative stock and history reads. If those reads fail, the UI keeps the successful Store result and permits read-only retry. A network or timeout result leaves submission uncertain and blocks another issue for that Quote until the user verifies the operation externally. No live Store calls were made during implementation.
