# Material Receipt integration

Material Receipt belongs to the Execution Quote workspace. The Purchase Request selector reuses Procurement's `fetch_purchase_requests` request with the current `quote_id`. Selecting a request loads its receiving summary; the quote-wide history loads independently.

| Operation         | Endpoint                                  | Scope                 | Successful `data`                  |
| ----------------- | ----------------------------------------- | --------------------- | ---------------------------------- |
| Store             | `store_purchase_request_receipt`          | `purchase_request_id` | Unspecified by the backend handoff |
| Quantity summary  | `fetch_purchase_request_receipts`         | `purchase_request_id` | Direct `ItemSummary[]`             |
| Receiving history | `fetch_purchase_request_receipts_history` | `quote_id`            | Direct, flat `ReceiptHistory[]`    |

The summary contains `purchase_request_item`, `requested_quantity`, `received_quantity`, and `remaining_quantity`. All response quantities are decimal strings. There is no aggregate receiving status in the summary. Items with zero remaining quantity cannot receive more. The UI sends only positive quantities from this operation, with at most two decimal places, using `purchase_request_item.id` as `purchase_request_item_id`. The backend recomputes cumulative totals and enforces the remaining amount and confirmed Purchase Order eligibility.

Neither read response has a legacy `items_summary` or `receipts` wrapper, and the summary has no `data.status` aggregate field.

History can include multiple Purchase Requests in the same Quote. The UI filters the fetched quote-wide array locally when a request is selected. Each receipt item's `id` is a receipt item record ID; its `purchase_request_item_id` is the original requested item ID and can occur in multiple receipts. `employee` identifies the receiver; `organization_employee` identifies the recorder. Receipt status `1` (partial) or `2` (complete) is a historical snapshot. It is separate from the root boolean API success status.

The backend handoff does not specify a Store response body. The implementation accepts only the established root boolean `status` success convention used by the adjacent Procurement integration. It does not parse or create a saved receipt from Store response data. HTTP success without that boolean cannot confirm persistence; in that case, the user should inspect refreshed read data before another submission. No live Store calls were made during implementation.
