# Purchase Request APIs — Frontend Integration Guide

This document describes the **Purchase Request** Store and Fetch endpoints in the Project feature. The Store request and Fetch response examples below reflect the supplied API samples.

## Endpoints

| Action | Method | Endpoint |
|---|---|---|
| Create a purchase request with its items | `POST` | `store_purchase_request` |
| Retrieve purchase requests for a quote | `POST` | `fetch_purchase_requests` |

> **Authentication:** Both endpoints belong to the authenticated employee workflow (`auth:employee`). Use the application's existing authentication and API base URL configuration.

---

## 1. Store Purchase Request

**Endpoint:** `POST store_purchase_request`

### Request — Entire Project

```json
{
  "quote_id": 140,
  "employee_id": 7,
  "is_all_project": true,
  "supply_responsibility": 2,
  "priority": 3,
  "items": [
    {
      "project_timeline_stage_id": 17,
      "itemable_type": "material",
      "itemable_id": 5,
      "quantity": 10
    },
    {
      "project_timeline_stage_id": 17,
      "itemable_type": "product",
      "itemable_id": 36,
      "quantity": 5
    }
  ]
}
```

### Request — Specific Project Floor Space

When `is_all_project` is `false`, the frontend must provide `project_floor_space_id` for a space belonging to the same project.

```json
{
  "quote_id": 140,
  "employee_id": 7,
  "is_all_project": false,
  "project_floor_space_id": 25,
  "supply_responsibility": 2,
  "priority": 3,
  "items": [
    {
      "project_timeline_stage_id": 17,
      "itemable_type": "material",
      "itemable_id": 5,
      "quantity": 10
    }
  ]
}
```

> This second example illustrates the approved conditional request shape. The ID `25` must be replaced with a valid project floor space ID for the selected quote's project.

### Request fields

| Field | Type | Rule / Meaning |
|---|---|---|
| `quote_id` | integer | Required. The quote receiving the purchase request. |
| `employee_id` | integer | Required. Selected employee from `organization_employees.id`; must belong to the quote's organization. |
| `is_all_project` | boolean | `true` = entire project; `false` = specific project floor space. |
| `project_floor_space_id` | integer / `null` | Required only when `is_all_project = false`; otherwise omit or use `null`. |
| `supply_responsibility` | integer | Required. See enum below. |
| `priority` | integer | Purchase request priority. See enum below; database default is `1` (`NORMAL`). |
| `items` | array | Required, non-empty list of requested items. |
| `items[].project_timeline_stage_id` | integer | Required. **Main** project timeline stage ID (`parent_id = null`), belonging to the same quote/project/organization. |
| `items[].itemable_type` | string | Required. Either `material` or `product`. |
| `items[].itemable_id` | integer | Required. Material ID or product ID, depending on `itemable_type`. |
| `items[].quantity` | number | Required; must be greater than `0`. Stored as `DECIMAL(15,2)`. |

**Do not include** `project_id`, `organization_id`, `organization_employee_id`, `purchase_request_id`, or `status` in the Store request. The backend derives the project from the quote, the ownership fields from the authenticated employee, and sets the initial status to `PENDING (1)`.

### Enum values

**Supply responsibility** (`supply_responsibility`):

| Value | Enum | Meaning |
|---:|---|---|
| `1` | `CLIENT` | Client is responsible for supply |
| `2` | `COMPANY` | Company is responsible for supply |

**Priority** (`priority`):

| Value | Enum | Meaning |
|---:|---|---|
| `1` | `NORMAL` | Normal |
| `2` | `LOW` | Low |
| `3` | `HIGH` | High |

**Purchase request status** (`status`, backend-controlled during Store):

| Value | Enum | Meaning |
|---:|---|---|
| `1` | `PENDING` | Pending |
| `2` | `REJECTED` | Rejected |
| `3` | `CONFIRMED` | Confirmed |

**Item type** (`itemable_type`):

| Value | `itemable_id` references |
|---|---|
| `material` | `materials.id` |
| `product` | `products.id` |

### Store validation and behavior

- Every item stage must be a **main** `project_timeline_stages` record (`parent_id = null`) associated with the selected quote, project, and organization.
- Materials and products must be available to the current organization under the backend's existing access rules.
- `employee_id` and a supplied `project_floor_space_id` must belong to the appropriate organization/project.
- `quantity` must be positive.
- The backend creates the purchase request and all of its items in **one database transaction**. An invalid item fails the whole operation; no partial purchase request should be saved.
- **Store response:** No actual Store response payload was supplied for this document. Follow the response returned by the implemented endpoint rather than assuming a particular JSON shape.

---

## 2. Fetch Purchase Requests

**Endpoint:** `POST fetch_purchase_requests`

### Request

```json
{
  "quote_id": 140
}
```

The endpoint accepts **`quote_id` only** as the required selection identifier; `project_id` is not used as an alternative Fetch identifier.

### Response — Actual supplied example

```json
{
  "status": true,
  "message": "Purchase requests fetched successfully.",
  "data": [
    {
      "id": 1,
      "employee": {
        "id": 1,
        "name": "Techlab Employee",
        "type": 1
      },
      "assigned_employee": {
        "id": 7,
        "name": "Magee Colon",
        "type": 2
      },
      "quote_id": 140,
      "project_id": 86,
      "is_all_project": true,
      "project_floor_space_id": null,
      "project_floor_space": null,
      "supply_responsibility": 2,
      "priority": 3,
      "status": 1,
      "items": [
        {
          "id": 1,
          "project_timeline_stage_id": 17,
          "project_timeline_stage": {
            "id": 17,
            "stage": {
              "id": 129,
              "title": "منعم"
            },
            "sub_stage": null,
            "created_at": "2026-10-11 11:33:28"
          },
          "itemable_type": "material",
          "itemable_id": 5,
          "itemable": {
            "id": 5,
            "title": "run"
          },
          "quantity": "10.00"
        },
        {
          "id": 2,
          "project_timeline_stage_id": 17,
          "project_timeline_stage": {
            "id": 17,
            "stage": {
              "id": 129,
              "title": "منعم"
            },
            "sub_stage": null,
            "created_at": "2026-10-11 11:33:28"
          },
          "itemable_type": "product",
          "itemable_id": 36,
          "itemable": {
            "id": 36,
            "title": "zzzzzzz"
          },
          "quantity": "5.00"
        }
      ],
      "created_at": "2026-10-13 12:34:15"
    }
  ]
}
```

### Response fields

| Field | Description |
|---|---|
| `status` | Overall API success flag. |
| `message` | API message. |
| `data` | Array of purchase requests for the selected quote. |
| `data[].id` | `purchase_requests.id`. |
| `data[].employee` | Employee who created the purchase request (`organization_employee_id`). |
| `data[].assigned_employee` | Employee selected in Store (`employee_id`). |
| `data[].quote_id` | Related quote ID. |
| `data[].project_id` | Related project ID (derived from quote during Store). |
| `data[].is_all_project` | Whether the request applies to the whole project. |
| `data[].project_floor_space_id` | Selected project floor space ID, or `null` for whole-project requests. |
| `data[].project_floor_space` | Related floor space data when applicable; `null` in the supplied whole-project example. |
| `data[].supply_responsibility` | Supply responsibility enum integer. |
| `data[].priority` | Priority enum integer. |
| `data[].status` | Purchase request status enum integer. |
| `data[].items` | Nested requested material/product lines. |
| `data[].created_at` | Purchase request creation timestamp. |

### Nested item fields

| Field | Description |
|---|---|
| `items[].id` | `purchase_request_items.id`. |
| `items[].project_timeline_stage_id` | `project_timeline_stages.id`, **not** `stages.id`. |
| `items[].project_timeline_stage` | Main timeline stage details. |
| `items[].project_timeline_stage.stage.id` | Underlying master `stages.id`. |
| `items[].project_timeline_stage.sub_stage` | `null` for a main timeline stage in this example. |
| `items[].itemable_type` | `material` or `product`. |
| `items[].itemable_id` | ID in the matching `materials` or `products` table. |
| `items[].itemable` | Related Material/Product display data, including `title`. |
| `items[].quantity` | **Decimal string**, e.g. `"10.00"` or `"5.00"`. |

### Frontend implementation notes

- To display items, use `itemable.title` and the relevant `itemable_type`; both types share the same returned item structure in the sample.
- For a selected main timeline stage, use `project_timeline_stage_id` or `project_timeline_stage.id` (e.g. `17`). **Do not substitute** `project_timeline_stage.stage.id` (e.g. `129`).
- `employee` is the creator; `assigned_employee` is the selected assignee. These are different roles and IDs.
- Treat `quantity` in Fetch as a **string-form decimal**. Do not assume it will be returned as a JSON number.
- `project_floor_space` is `null` for the provided whole-project sample. Its non-null object shape was not provided and should be confirmed from an actual response before relying on specific nested properties.
- The actual response shown here is a successful, unpaginated list. Optional pagination parameters or error payloads were not demonstrated in the supplied examples.

---

## Quick Reference

| Operation | Endpoint | Frontend sends |
|---|---|---|
| Store | `store_purchase_request` | `quote_id`, `employee_id`, `is_all_project`, conditional `project_floor_space_id`, `supply_responsibility`, `priority`, `items[]` |
| Fetch | `fetch_purchase_requests` | `quote_id` |

**Reminder:** `status` is initialized by the backend as `1 (PENDING)` on Store; the frontend does not send it for creation.
