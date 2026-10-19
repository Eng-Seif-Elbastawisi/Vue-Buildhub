# Purchase Order API — Frontend Handoff

**Module:** Project → Purchase Requests → Purchase Order  
**Endpoints:** `store_purchase_order`, `fetch_purchase_order`  
**HTTP method:** `POST` (follows the existing Project employee API pattern)  
**Authentication:** authenticated employee (`auth:employee` in the existing Project flow)

This handoff uses the **actual Store request and Fetch response supplied by the backend**. The behavior notes describe the agreed Purchase Order workflow. Do not infer undocumented fields or response structures from these examples.

---

## 1. Store Purchase Order

**Endpoint:** `store_purchase_order`

### Request — without attachment (actual example)

```json
{
  "purchase_request_id": 2,
  "purchase_request_price_id": 4,
  "note": "Purchase order approved for electrical materials.",
  "date": "2026-10-14"
}
```

The backend example did not send a `file`; the corresponding Fetch response returned `"file": null`.

### Request — with attachment (format example)

```json
{
  "purchase_request_id": 2,
  "purchase_request_price_id": 4,
  "note": "Purchase order approved for electrical materials.",
  "file": "data:application/pdf;base64,JVBERi0xLjQ...",
  "date": "2026-10-14"
}
```

The `file` shown above is a **shortened placeholder**, not a valid upload. Send the complete Base64 payload in the format supported by the existing attachment implementation.

### Store request fields

| Field | Type | Required | Meaning |
|---|---|---|---|
| `purchase_request_id` | integer | Yes | ID from `purchase_requests.id`. |
| `purchase_request_price_id` | integer | Yes | ID of the **selected supplier price offer** from `purchase_request_prices.id`. It must belong to the requested Purchase Request. |
| `note` | string / null | No | Notes attached to the Purchase Order. |
| `file` | Base64 string / null | No | Purchase Order attachment. Can be omitted as in the actual request. |
| `date` | date string (`YYYY-MM-DD`) | Yes | Purchase Order date. |

### Business rules

- **Only one Purchase Order can be issued for each Purchase Request.** The Purchase Request must still be `PENDING` (`1`) before issuing the order.
- The selected `purchase_request_price_id` must be associated with that `purchase_request_id` and belong to the current organization.
- `supplier_id` is derived from the selected Purchase Request Price; `client_id` is derived from the Quote associated with the Purchase Request. The frontend does **not** send either.
- The backend creates a **new confirmed history record**; it does not replace the initial Pending history record.
- Successful creation sets `purchase_requests.status` to `CONFIRMED` (`3`). The new order's `is_order_paid` starts as `false`.
- The agreed workflow locks supplier price changes after confirmation. Re-submitting an order for the same Purchase Request must not issue a second order.
- Ownership, validation and status checks are enforced by the backend. Do not expose a UI option to manually set the order status or payment state in this request.

**Do not send these backend-managed fields:** `organization_id`, `organization_employee_id`, `supplier_id`, `client_id`, `status`, `is_order_paid`, `quote_id`, `project_id`.

> **Store response:** An actual `store_purchase_order` response was not supplied for this handoff. Do not assume that its `data` shape matches the Fetch response; consult the endpoint implementation or test response.

---

## 2. Fetch Purchase Order

**Endpoint:** `fetch_purchase_order`

### Request

```json
{
  "purchase_request_id": 2
}
```

### Actual response example

```json
{
  "status": true,
  "message": "Purchase order retrieved successfully.",
  "data": {
    "id": 2,
    "purchase_request": {
      "id": 2,
      "quote_id": 140,
      "project_id": 86,
      "status": 3
    },
    "purchase_request_price": {
      "id": 4,
      "price": "1500.00",
      "duration": 2,
      "duration_type": 2
    },
    "employee": {
      "id": 1,
      "name": "Techlab Employee",
      "type": 1
    },
    "supplier": {
      "id": 3,
      "title": "fffffffffbbbbbbbb"
    },
    "client": {
      "id": 19,
      "title": "Ibrahim el refaey"
    },
    "status": 3,
    "date": "2026-10-14",
    "note": "Purchase order approved for electrical materials.",
    "file": null,
    "is_order_paid": false,
    "created_at": "2026-10-14 08:21:09"
  }
}
```

### Fetch response fields

| JSON path | Type | Meaning |
|---|---|---|
| `status` | boolean | API success flag. |
| `message` | string | Backend message. |
| `data` | object / null | Confirmed Purchase Order; see *No order yet* below. |
| `data.id` | integer | **Purchase Order history record ID**, not the Purchase Request ID. |
| `data.purchase_request.id` | integer | Purchase Request ID. |
| `data.purchase_request.quote_id` | integer | Related Quote ID. |
| `data.purchase_request.project_id` | integer | Related Project ID. |
| `data.purchase_request.status` | integer | Current Purchase Request status (`3` in this example). |
| `data.purchase_request_price.id` | integer | Selected supplier price record ID. |
| `data.purchase_request_price.price` | decimal string | Price returned as a **string** (e.g. `"1500.00"`). |
| `data.purchase_request_price.duration` | integer | Supplier's supply duration. |
| `data.purchase_request_price.duration_type` | integer | Duration unit enum (see below). |
| `data.employee` | object | Employee who recorded/issued the order. Contains `id`, `name`, `type` in the supplied response. |
| `data.supplier` | object | Selected supplier. Contains `id`, `title` in the supplied response. |
| `data.client` | object | Client derived from the Quote. Contains `id`, `title` in the supplied response. |
| `data.status` | integer | Purchase Order history status (`3 = CONFIRMED`). |
| `data.date` | date string | Order date (`YYYY-MM-DD`). |
| `data.note` | string / null | Order notes. |
| `data.file` | string URL / null | Uploaded file reference if one exists; `null` in this actual response. |
| `data.is_order_paid` | boolean | Whether the order is paid; `false` in this response. |
| `data.created_at` | datetime string | Creation time, e.g. `YYYY-MM-DD HH:mm:ss`. |

### No Purchase Order yet

Per the agreed API behavior, a valid Purchase Request without a confirmed Purchase Order returns **success with `data: null`**, rather than exposing its initial `PENDING` history record as a Purchase Order. This is an **agreed behavior**, not a response captured in the supplied example.

Conceptual shape:

```json
{
  "status": true,
  "message": "Purchase order retrieved successfully.",
  "data": null
}
```

---

## 3. Enums

### Purchase Request / Purchase Order history status

| Value | Meaning |
|---:|---|
| `1` | `PENDING` |
| `2` | `REJECTED` |
| `3` | `CONFIRMED` |

The confirmed Purchase Order shown above has `status: 3`. No rejection endpoint is covered in this handoff.

### Supplier price duration type

| Value | Meaning |
|---:|---|
| `1` | Day |
| `2` | Week |
| `3` | Month |
| `4` | Year |

Thus, the response's `"duration": 2` and `"duration_type": 2` mean **2 weeks**.

---

## 4. Frontend integration notes

- To **issue** an order, send `POST store_purchase_order` with the Purchase Request ID and the selected `purchase_request_prices.id`, not the Supplier ID itself.
- To **view** an order, send `POST fetch_purchase_order` with only `purchase_request_id`.
- A confirmed order returns a **single object** under `data`, not an array.
- Treat `data: null` as **no confirmed order exists yet**; avoid rendering it as an application crash.
- Display `supplier.title` and `client.title` as returned; these are not `name` fields in the supplied response.
- Treat monetary `price` as a decimal **string** to avoid needless floating-point conversions.
- The `file` value is a **Base64 payload in Store**, but a **URL or null in Fetch**.
- The confirmed order starts `is_order_paid: false`. Payment actions are **not documented** here.
- No Update/Delete Purchase Order endpoint is part of this handoff.

### Quick endpoint summary

| Endpoint | Method | Request selector | Result |
|---|---|---|---|
| `store_purchase_order` | POST | `purchase_request_id` + `purchase_request_price_id` | Issues one confirmed Purchase Order. |
| `fetch_purchase_order` | POST | `purchase_request_id` | Returns a confirmed order object or `null`. |

> **Scope:** This document covers the two Purchase Order endpoints and their agreed rules only. It does not define the full API route prefix, HTTP error payload shapes, upload size limits, or a Store success response because these were not provided in the example.
