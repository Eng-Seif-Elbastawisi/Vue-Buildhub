# BuildHub — Project Execution Work Status API

**Frontend Integration Guide**  
**Feature:** Project Configuration / Start Project  
**Endpoint:** `change_project_configuration_work_status`  
**Updated:** October 19, 2026

> **الهدف:** بدء تنفيذ المشروع بعد التأكد من وجود دفعة فعلية من العميل ووجود Shop Drawing لنفس المشروع، مع تحديد الموظف/المهندس المسؤول. الـEndpoint تدعم أيضًا `HOLD` و`STOP`، لكن حالات تنفيذ الـTimeline Groups منفصلة عنها.

## Contents

1. [Endpoint and request](#1-endpoint-and-request)
2. [Actual successful response](#2-actual-successful-response)
3. [Work status enum](#3-work-status-enum)
4. [When can the project START?](#4-when-can-the-project-start)
5. [HOLD / STOP / Resume](#5-hold--stop--resume)
6. [Validation and error handling](#6-validation-and-error-handling)
7. [Frontend implementation notes](#7-frontend-implementation-notes)
8. [TypeScript contracts](#8-typescript-contracts)
9. [QA checklist](#9-qa-checklist)

---

## 1. Endpoint and request

**Endpoint name:** `change_project_configuration_work_status`  
**Authentication:** Existing authenticated employee API (`auth:employee`).  
**URL / HTTP method:** Use the project's existing backend route definition; a literal URL and method were not supplied.

### Start project — Request

```json
{
  "quote_id": 140,
  "work_status": 1,
  "responsible_employee_id": 9
}
```

| Field | Type | Required? | Description |
|---|---|---|---|
| `quote_id` | `number` | Yes | المقايسة المرتبطة بالمشروع؛ **كل Project له Quote واحدة** حسب السايكل المتفق عليه. |
| `work_status` | `1 \| 2 \| 3` | Yes | حالة تنفيذ المشروع: `START`, `HOLD`, `STOP`. |
| `responsible_employee_id` | `number` | **Required for first START** | ID الموظف/المهندس المسؤول عن التنفيذ من `organization_employees`. اختياري عند التغييرات اللاحقة وفق حالة المشروع. |

**Important:** Do not submit `project_id` or `organization_id`. The backend resolves the Project from `quote_id` and the Organization from the authenticated employee.

---

## 2. Actual successful response

The following example is the **successful response supplied by the backend** for the Start request above (not a proposed schema):

```json
{
  "status": true,
  "message": "Project work status changed successfully.",
  "data": {
    "id": 1,
    "work_status": 1,
    "responsible_employee_id": 9,
    "responsible_employee": {
      "id": 9,
      "name": "Fleur Armstrong",
      "type": 4
    },
    "start_date": "2026-10-10",
    "delivery_date": "2026-12-01",
    "site_condition": "The site is ready for execution and there are no obstacles to starting work.",
    "holidays": [5, 6],
    "created_at": "2026-10-07 12:40:59"
  }
}
```

### Response fields

| Field | Type | Frontend usage |
|---|---|---|
| `status` | `boolean` | `true` indicates success. |
| `message` | `string` | Server confirmation; display in a success notification if appropriate. |
| `data.id` | `number` | Project Configuration ID (**not** Quote ID or Project ID). |
| `data.work_status` | `1 \| 2 \| 3 \| null` | Current overall Project execution status. |
| `data.responsible_employee_id` | `number \| null` | Assigned responsible employee ID. |
| `data.responsible_employee` | `object \| null` | Assigned employee details (`id`, `name`, `type`). |
| `data.start_date` | `string \| null` | Existing configuration start date; **not automatically changed** by this action. |
| `data.delivery_date` | `string \| null` | Existing delivery date. |
| `data.site_condition` | `string \| null` | Existing site condition. |
| `data.holidays` | `number[]` | Existing weekday holiday codes. |
| `data.created_at` | `string` | Project Configuration creation timestamp. |

> The response shown does **not** include `quote_id` or `project_id`; keep the selected `quote_id` in page/state context instead of expecting it inside `data`.

---

## 3. Work status enum

Reuses the existing backend `WorkStatusEnum`:

| Value | Enum | UI label (AR) | Meaning |
|---:|---|---|---|
| `null` | — | لم يبدأ | Project execution not started yet. |
| `1` | `START` | جاري التنفيذ | Start or resume project execution. |
| `2` | `HOLD` | متوقف مؤقتًا | Pause project execution. |
| `3` | `STOP` | متوقف | Stop project execution. |

**Don't confuse these fields:**

- `project_configurations.work_status`: **overall Project execution** status (**this endpoint**).
- `project_timelines.work_status`: execution status of **an individual Timeline Group**.
- `quotes.timeline_status`: **approval** status of the Quote timeline.

Changing this endpoint's `work_status` **does not automatically change Timeline Group statuses or timeline approval**.

---

## 4. When can the project START?

### Required conditions — both must be satisfied

**Condition A — At least one actual invoice payment**

A payment record must exist in `invoice_payments` for an invoice belonging to the **same Project** and **same Organization**, with `payment_amount > 0`.

```text
quote_id = 140
  └── Project (project_id = 86)
        └── invoices (project_id = 86)
              └── invoice_payments (payment_amount > 0)
```

- A created invoice **without a payment** is not enough.
- The project **does not need to be fully paid**: one actual positive payment is sufficient.
- A payment against another project's invoice **does not count**.
- The backend checks actual `invoice_payments` records, not merely the invoice's `invoice_status`.
- Payments are still recorded using the **existing** `store_invoice_payment` endpoint. This new endpoint does **not** record payments.

**Condition B — At least one Shop Drawing**

A record must exist in `shop_drawing_quotes` for the **same `quote_id` and `project_id`** (scoped to the authenticated Organization).

```text
quote_id = 140
  └── Project (project_id = 86)
        └── shop_drawing_quotes
              ├── quote_id = 140
              └── project_id = 86
```

- One existing Shop Drawing is enough.
- No new approval step, version restriction, or additional attachment requirement is introduced by this endpoint.
- Shop Drawings are created via the **existing** `store_shop_drawing_quote` endpoint.

**Condition C — Responsible employee and configuration**

- The initial START request must provide a valid `responsible_employee_id` belonging to the authenticated Organization.
- The `project_configurations` record for that Quote/Project must be available for updating.
- The Quote and related Project must belong to the authenticated Organization.

### Decision table

| Actual payment exists? | Shop Drawing exists? | First START allowed? |
|---|---|---|
| Yes | Yes | **Yes**, if the Configuration exists and the responsible employee is valid. |
| Yes | No | **No** — Shop Drawing prerequisite missing. |
| No | Yes | **No** — payment prerequisite missing. |
| No | No | **No** — both prerequisites missing. |

**Example:** One `invoice_payments` record of `500.00` for a Project #86 invoice + one `shop_drawing_quotes` record for Quote #140 / Project #86 + valid responsible employee #9 → START can succeed.

### Execution flow

```text
Frontend selects Quote #140
          ↓
Selects responsible employee #9
          ↓
Submits work_status = 1 (START)
          ↓
Backend validates Quote / Project / Organization
          ↓
Checks payment + Shop Drawing + responsible employee
          ↓
Updates project_configurations.work_status = 1
Updates project_configurations.responsible_employee_id = 9
          ↓
Returns updated Project Configuration Resource
```

---

## 5. HOLD / STOP / Resume

### HOLD — pause execution

```json
{
  "quote_id": 140,
  "work_status": 2
}
```

### STOP — stop execution

```json
{
  "quote_id": 140,
  "work_status": 3
}
```

### Resume — START again

```json
{
  "quote_id": 140,
  "work_status": 1
}
```

**Business rules agreed for the workflow:**

- Initial state is `work_status = null` (**not started**).
- A project must START before it can be set to HOLD or STOP; `null → HOLD` and `null → STOP` are not allowed.
- HOLD and STOP do **not** require a *new* payment or a *new* Shop Drawing.
- The assigned `responsible_employee_id` is preserved if omitted from a later status request.
- For a later START after HOLD or STOP, the backend should still enforce the START prerequisites; the already-assigned responsible employee can be preserved if valid.
- A status change here is **independent of Timeline Group `work_status`**; it does not start, hold, or stop Timeline Groups.

> **Scope note:** The status-transition bullets above describe the **agreed workflow requirements**. The user-supplied live response confirms the `START` request and success response only; exact error payloads and every transition have not been shown in a live response.

---

## 6. Validation and error handling

Treat the backend as the **source of truth** for whether START is allowed. Show its returned validation/business error message. Common reasons for rejection:

| Scenario | Expected handling |
|---|---|
| No qualifying `invoice_payments` record | Block START; require at least one real payment for the same Project. |
| No qualifying `shop_drawing_quotes` record | Block START; require at least one Shop Drawing for the same Quote/Project. |
| `responsible_employee_id` missing on first START | Block START until a responsible employee is selected. |
| Responsible employee belongs to another Organization | Reject selection. |
| Invalid / unrelated Quote, Project, or Configuration | Reject operation. |
| `work_status` not `1`, `2`, or `3` | Validation error. |
| HOLD or STOP requested before first START | Reject invalid transition. |

**No exact unsuccessful JSON body was supplied.** Do not hardcode a presumed failure structure or an HTTP status. Follow the existing API client's handling and render the backend's actual error details.

---

## 7. Frontend implementation notes

1. Use the current `quote_id` when sending the request; Project ID must **not** be submitted.
2. For the first START, show a responsible employee selector and submit `responsible_employee_id`.
3. Optionally display a pre-start checklist (“Customer payment received”, “Shop Drawing available”), but **always rely on backend validation**; a UI-only check is insufficient.
4. After success, update the Project Configuration state from `response.data`, especially `work_status` and `responsible_employee`.
5. Display `null` status as **Not started**; never infer START from the existence of `start_date`.
6. When HOLD / STOP, preserve the previously assigned employee unless explicitly changing it through an allowed workflow.
7. Keep the Project-level status display separate from Timeline Group status and Quote timeline approval.
8. Existing `start_date`, `delivery_date`, `site_condition`, and `holidays` remain configuration fields; the status endpoint does not change them.
9. Reuse the existing employee selection and API authentication implementation; this endpoint does not introduce a new employee lookup endpoint.

---

## 8. TypeScript contracts

```ts
export type ProjectWorkStatus = 1 | 2 | 3

export interface ChangeProjectConfigurationWorkStatusRequest {
  quote_id: number
  work_status: ProjectWorkStatus
  // Required by backend for the FIRST START; optional for later status changes.
  responsible_employee_id?: number
}

export interface ResponsibleEmployee {
  id: number
  name: string
  type: number
}

export interface ProjectConfigurationWorkStatusData {
  id: number
  work_status: ProjectWorkStatus | null
  responsible_employee_id: number | null
  responsible_employee: ResponsibleEmployee | null
  start_date: string | null
  delivery_date: string | null
  site_condition: string | null
  holidays: number[]
  created_at: string
}

export interface ChangeProjectConfigurationWorkStatusResponse {
  status: boolean
  message: string
  data: ProjectConfigurationWorkStatusData
}
```

*The response types above describe the fields visible in the supplied success example and the nullable state agreed for new/unstarted records; use the backend Resource as the definitive contract for any additional fields.*

---

## 9. QA checklist

- [ ] START with a qualifying payment, Shop Drawing, and responsible employee succeeds.
- [ ] START without a payment is blocked.
- [ ] START without a Shop Drawing is blocked.
- [ ] START with a responsible employee from another Organization is blocked.
- [ ] Payment or Shop Drawing from a different Project does **not** satisfy prerequisites.
- [ ] Initial `work_status: null` is rendered as **Not started**.
- [ ] HOLD and STOP use the **same endpoint** with statuses `2` and `3`.
- [ ] HOLD/STOP before initial START are not allowed.
- [ ] Responsible employee remains visible after subsequent status changes.
- [ ] Changing Project work status does **not** change any Timeline Group status.
- [ ] Success UI uses the actual returned `data` fields; no assumption that `quote_id` is included in the response.

---

**Integration note:** This document is based on the provided successful `change_project_configuration_work_status` request/response and the agreed Project Start business rules. Exact route URL, HTTP method, unsuccessful response format, and production behavior for all transitions should be checked against the implemented backend before deployment.
