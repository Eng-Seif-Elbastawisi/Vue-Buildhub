# BuildHub — Project Execution API Updates

**Frontend Integration Guide · October 19, 2026 · Version 1.0**

**ملخص بالعربي:** تحديثات الرسومات التنفيذية، تقارير المراحل، عروض أسعار الموردين، والاجتماعات؛ مع أمثلة Request/Response فعلية، الحقول الجديدة، الـEnums، والمرفقات والحضور. أمثلة الـBase64 مختصرة للقراءة فقط.

> **Scope:** Four existing features were enhanced: **Shop Drawing Quotes**, **Timeline Stage Reports**, **Supplier Price Offers**, and **Timeline Stage Meetings**. This document records the **actual supplied Fetch responses** and the **Store requests provided for integration**; it does not claim unprovided Store response schemas.

## Contents

1. [At a glance](#1-at-a-glance)
2. [Shop Drawing Quotes](#2-shop-drawing-quotes)
3. [Project Timeline Stage Reports](#3-project-timeline-stage-reports)
4. [Purchase Request Supplier Prices](#4-purchase-request-supplier-prices)
5. [Project Timeline Stage Meetings](#5-project-timeline-stage-meetings)
6. [Enums and common contracts](#6-enums-and-common-contracts)
7. [TypeScript interfaces](#7-typescript-interfaces)
8. [Frontend integration checklist](#8-frontend-integration-checklist)

---

## 1. At a glance

| Feature | Store endpoint | Fetch endpoint | Changes |
|---|---|---|---|
| Shop Drawings | `store_shop_drawing_quote` | `fetch_shop_drawing_quotes` | `project_floor_space_id`, nested `project_floor_space` |
| Stage Reports | `store_project_timeline_stage_report` | `fetch_project_timeline_stage_reports` | `report_scope_type`, optional space, multiple `attachments` |
| Supplier Prices | `store_purchase_request_prices` | `fetch_purchase_request_prices` | Optional attachment per supplier offer |
| Meetings | `store_project_timeline_stage_meeting` | `fetch_project_timeline_stage_meetings` | `meeting_audience_type`, `result`, `attendees` |

**API conventions:** These examples represent JSON request bodies for the existing authenticated Project APIs. The URL prefix, HTTP method, authentication header format, and unsuccessful response schemas were not included in the supplied examples; use the application’s existing API client and backend route definitions. A successful Fetch response uses `status`, `message`, and **`data` as a direct array** (not a paginated object in the examples below).

**Environment URLs:** The `http://localhost:8000/...` URLs below are copied from development responses and are **not production URLs**. Use the returned URL as supplied by the environment; do not hardcode `localhost` in the frontend.

**Base64 convention:** Store examples below replace long Base64 payloads with `<FULL_BASE64_CONTENT>` for readability. Replace each placeholder with the **complete real Base64 string**, including its `data:<mime>;base64,` prefix. Do **not** send the placeholder literally.

---

## 2. Shop Drawing Quotes

### 2.1 Store — `store_shop_drawing_quote`

New supported field: `project_floor_space_id` (selected space in the same Project as the Quote). The full submitted Store example also includes the previously existing title, date, version, file, and Timeline Stage IDs.

**Request body (Base64 abbreviated):**


```json
{
  "quote_id": 140,
  "title": "MEP Shop Drawing",
  "date": "2026-10-12",
  "version_number": "V1",
  "project_floor_space_id": 170,
  "file": "data:image/jpeg;base64,<FULL_BASE64_CONTENT>",
  "project_timeline_stage_ids": [
    17
  ]
}
```

| Field | Type | Frontend guidance |
|---|---|---|
| `quote_id` | `number` | Quote ID used to resolve the Project |
| `project_floor_space_id` | `number` | Selected **Project Floor Space** ID; must belong to the Quote's Project |
| `title` | `string` | Shop Drawing title |
| `date` | `string` | Date in `YYYY-MM-DD` format |
| `version_number` | `string` | Version label, e.g. `V1` |
| `file` | `string` | Base64 file Data URI; example above uses JPEG |
| `project_timeline_stage_ids` | `number[]` | Timeline Stage IDs related to the Shop Drawing |

**Compatibility:** Older fetched Shop Drawings can still return `project_floor_space_id: null` and `project_floor_space: null`. Handle these as legacy records; the supplied request shows a selected space for a new Store operation.

### 2.2 Fetch — `fetch_shop_drawing_quotes`

**Request:**


```json
{
  "quote_id": 140
}
```

**Actual supplied success response:**


```json
{
  "status": true,
  "message": "Shop drawing quotes fetched successfully.",
  "data": [
    {
      "id": 3,
      "project_floor_space_id": 170,
      "project_floor_space": {
        "id": 170,
        "space": {
          "id": 8,
          "title": "kitchen"
        },
        "length": "5.00",
        "width": "4.00",
        "height": "2.00",
        "notes": null,
        "attachments": []
      },
      "employee": {
        "id": 1,
        "name": "Techlab Employee",
        "type": 1
      },
      "quote_id": 140,
      "project_id": 86,
      "title": "MEP Shop Drawing",
      "date": "2026-10-12",
      "version_number": "V1",
      "file": "http://localhost:8000/storage/shop_drawing_quotes/7plyjpRkkE_1792396924.jpg",
      "custom_number": 3,
      "stages": [
        {
          "id": 17,
          "stage": {
            "id": 129,
            "title": "منعم"
          },
          "sub_stage": null,
          "created_at": "2026-10-11 11:33:28"
        }
      ],
      "created_at": "2026-10-19 08:02:04"
    },
    {
      "id": 2,
      "project_floor_space_id": 170,
      "project_floor_space": {
        "id": 170,
        "space": {
          "id": 8,
          "title": "kitchen"
        },
        "length": "5.00",
        "width": "4.00",
        "height": "2.00",
        "notes": null,
        "attachments": []
      },
      "employee": {
        "id": 1,
        "name": "Techlab Employee",
        "type": 1
      },
      "quote_id": 140,
      "project_id": 86,
      "title": "MEP Shop Drawing",
      "date": "2026-10-12",
      "version_number": "V1",
      "file": "http://localhost:8000/storage/shop_drawing_quotes/E8C7X5WMAY_1792395582.jpg",
      "custom_number": 2,
      "stages": [
        {
          "id": 17,
          "stage": {
            "id": 129,
            "title": "منعم"
          },
          "sub_stage": null,
          "created_at": "2026-10-11 11:33:28"
        }
      ],
      "created_at": "2026-10-19 07:39:42"
    },
    {
      "id": 1,
      "project_floor_space_id": null,
      "project_floor_space": null,
      "employee": {
        "id": 1,
        "name": "Techlab Employee",
        "type": 1
      },
      "quote_id": 140,
      "project_id": 86,
      "title": "MEP Shop Drawing",
      "date": "2026-10-12",
      "version_number": "V1",
      "file": "http://localhost:8000/storage/shop_drawing_quotes/e0m7uU88RA_1791803773.jpg",
      "custom_number": 1,
      "stages": [
        {
          "id": 17,
          "stage": {
            "id": 129,
            "title": "منعم"
          },
          "sub_stage": null,
          "created_at": "2026-10-11 11:33:28"
        }
      ],
      "created_at": "2026-10-12 11:16:13"
    }
  ]
}
```

**Rendering notes:** Read the room label from `project_floor_space?.space?.title`. `project_floor_space_id` is the Project Floor Space record ID (`170` here), not the `space.id` category/reference (`8` here). Preserve `file` as a returned URL, whereas Store sends Base64. Keep `stages` and `custom_number` unchanged.

---

## 3. Project Timeline Stage Reports

### 3.1 Store — `store_project_timeline_stage_report`

Reports can now target **the entire Project** or **a specific Project Floor Space**, and can include an array of attachment objects. The provided Store example submits two attachment objects, each containing a `file` Data URI.

**Request — specific space with two attachments (Base64 abbreviated):**


```json
{
  "project_timeline_stage_id": 18,
  "date": "2026-10-12",
  "notes": "Work is progressing normally.",
  "site_safety_status": 1,
  "report_scope_type": 2,
  "project_floor_space_id": 171,
  "attachments": [
    {
      "file": "data:image/jpeg;base64,<FULL_BASE64_CONTENT>"
    },
    {
      "file": "data:image/jpeg;base64,<FULL_BASE64_CONTENT>"
    }
  ]
}
```

**Request — entire Project without attachments:**


```json
{
  "project_timeline_stage_id": 18,
  "date": "2026-10-12",
  "notes": "Work is progressing normally.",
  "site_safety_status": 1,
  "report_scope_type": 1,
  "attachments": []
}
```

| Field | Type | Frontend guidance |
|---|---|---|
| `project_timeline_stage_id` | `number` | Target Timeline Stage ID |
| `date` | `string` | Report date, `YYYY-MM-DD` |
| `notes` | `string \| null` | Report notes |
| `site_safety_status` | `number` | **Existing**, independent safety enum (1=OK, 2=Observation, 3=Incident per previous schema) |
| `report_scope_type` | `1 \| 2` | `1` = `ALL_PROJECT`; `2` = `SPECIFIC_SPACE` |
| `project_floor_space_id` | `number \| null` | Needed when scope is `2`; must belong to the same Project |
| `attachments` | `{file: string}[]` | List of Base64 Data URI files; send `[]` when none |

**Scope behavior:** For `report_scope_type: 1`, omit the `project_floor_space_id` or use `null`. For `report_scope_type: 2`, include a valid Project Floor Space ID. Always keep `report_scope_type` distinct from `site_safety_status`.

### 3.2 Fetch — `fetch_project_timeline_stage_reports`

**Request:**


```json
{
  "quote_id": 140
}
```

**Actual supplied success response:**


```json
{
  "status": true,
  "message": "Project timeline stage reports fetched successfully.",
  "data": [
    {
      "id": 5,
      "project_floor_space_id": 171,
      "project_floor_space": {
        "id": 171,
        "space": {
          "id": 9,
          "title": "living room"
        },
        "length": "5.00",
        "width": "4.00",
        "height": "2.00",
        "notes": null,
        "attachments": []
      },
      "project_timeline_stage_id": 18,
      "employee": {
        "id": 1,
        "name": "Techlab Employee",
        "type": 1
      },
      "date": "2026-10-12",
      "notes": "Work is progressing normally.",
      "report_scope_type": 2,
      "attachments": [
        {
          "id": 1,
          "file": "http://localhost:8000/attachments/project_timeline_stage_reports/xiGTtXhPk7_1792395998.jpeg",
          "file_size": "22.86 KB",
          "alt": null,
          "type": 1,
          "link": null,
          "created_at": "2026-10-19 07:46:38"
        },
        {
          "id": 2,
          "file": "http://localhost:8000/attachments/project_timeline_stage_reports/iPFiml7I3u_1792395998.jpeg",
          "file_size": "22.86 KB",
          "alt": null,
          "type": 1,
          "link": null,
          "created_at": "2026-10-19 07:46:38"
        }
      ],
      "site_safety_status": 1,
      "created_at": "2026-10-19 07:46:38"
    },
    {
      "id": 4,
      "project_floor_space_id": 171,
      "project_floor_space": {
        "id": 171,
        "space": {
          "id": 9,
          "title": "living room"
        },
        "length": "5.00",
        "width": "4.00",
        "height": "2.00",
        "notes": null,
        "attachments": []
      },
      "project_timeline_stage_id": 18,
      "employee": {
        "id": 1,
        "name": "Techlab Employee",
        "type": 1
      },
      "date": "2026-10-12",
      "notes": "Work is progressing normally.",
      "report_scope_type": 2,
      "attachments": [],
      "site_safety_status": 1,
      "created_at": "2026-10-19 07:44:43"
    },
    {
      "id": 3,
      "project_floor_space_id": 171,
      "project_floor_space": {
        "id": 171,
        "space": {
          "id": 9,
          "title": "living room"
        },
        "length": "5.00",
        "width": "4.00",
        "height": "2.00",
        "notes": null,
        "attachments": []
      },
      "project_timeline_stage_id": 18,
      "employee": {
        "id": 1,
        "name": "Techlab Employee",
        "type": 1
      },
      "date": "2026-10-12",
      "notes": "Work is progressing normally.",
      "report_scope_type": 2,
      "attachments": [],
      "site_safety_status": 1,
      "created_at": "2026-10-19 07:44:23"
    },
    {
      "id": 2,
      "project_floor_space_id": 171,
      "project_floor_space": {
        "id": 171,
        "space": {
          "id": 9,
          "title": "living room"
        },
        "length": "5.00",
        "width": "4.00",
        "height": "2.00",
        "notes": null,
        "attachments": []
      },
      "project_timeline_stage_id": 18,
      "employee": {
        "id": 1,
        "name": "Techlab Employee",
        "type": 1
      },
      "date": "2026-10-12",
      "notes": "Work is progressing normally.",
      "report_scope_type": 2,
      "attachments": [],
      "site_safety_status": 1,
      "created_at": "2026-10-19 07:43:10"
    },
    {
      "id": 1,
      "project_floor_space_id": null,
      "project_floor_space": null,
      "project_timeline_stage_id": 18,
      "employee": {
        "id": 1,
        "name": "Techlab Employee",
        "type": 1
      },
      "date": "2026-10-12",
      "notes": "Work is progressing normally.",
      "report_scope_type": 1,
      "attachments": [],
      "site_safety_status": 1,
      "created_at": "2026-10-12 07:52:27"
    }
  ]
}
```

**Rendering notes:** The `attachments` array is always represented as a list in the sample (possibly `[]`). Returned files are **URLs and metadata**, not Base64. `project_floor_space` is `null` for project-wide/legacy records. The nested `project_floor_space.attachments` belongs to the **space** object; the top-level `attachments` belongs to the **report** — don't mix them.

---

## 4. Purchase Request Supplier Prices

### 4.1 Store — `store_purchase_request_prices`

The existing supplier-offer synchronization payload now accepts **an optional `attachment` for each supplier**. The provided example includes an attachment for Supplier `1` and omits it for Supplier `3`.

**Request body (Base64 abbreviated):**


```json
{
  "purchase_request_id": 6,
  "suppliers": [
    {
      "id": 1,
      "price": 200,
      "duration": 5,
      "duration_type": 1,
      "attachment": "data:image/jpeg;base64,<FULL_BASE64_CONTENT>"
    },
    {
      "id": 3,
      "price": 1500,
      "duration": 2,
      "duration_type": 2
    }
  ]
}
```

| Field | Type | Frontend guidance |
|---|---|---|
| `purchase_request_id` | `number` | Purchase Request being priced |
| `suppliers` | `SupplierPriceInput[]` | **Full supplier list for synchronization** according to the existing API behavior |
| `suppliers[].id` | `number` | Supplier ID (**not** offer row ID) |
| `suppliers[].price` | `number` | Supplier's price |
| `suppliers[].duration` | `number` | Delivery duration |
| `suppliers[].duration_type` | `1 \| 2 \| 3 \| 4` | `DAY`, `WEEK`, `MONTH`, `YEAR` |
| `suppliers[].attachment` | `string` (optional) | Base64 Data URI for **this supplier only** |

**Existing sync contract:** Be careful when saving edits: `suppliers` represents the complete desired offers collection in the previously agreed workflow, so inadvertently omitting an existing supplier can remove their offer. Omitting **only** the attachment of an existing supplier should preserve its prior attachment according to the agreed enhancement; a newly supplied attachment replaces the old one. Do not interpret an omitted `attachment` as deletion.

### 4.2 Fetch — `fetch_purchase_request_prices`

**Request:**


```json
{
  "purchase_request_id": 6
}
```

**Actual supplied success response:**


```json
{
  "status": true,
  "message": "Purchase request prices fetched successfully.",
  "data": [
    {
      "id": 23,
      "purchase_request_id": 6,
      "supplier": {
        "id": 1,
        "title": "Karly Suarez"
      },
      "price": "200.00",
      "attachment": "http://localhost:8000/storage/purchase_request_prices/EutAtop3on_1792396256.jpg",
      "duration": 5,
      "duration_type": 1,
      "created_at": "2026-10-19 07:50:56"
    },
    {
      "id": 24,
      "purchase_request_id": 6,
      "supplier": {
        "id": 3,
        "title": "fffffffffbbbbbbbb"
      },
      "price": "1500.00",
      "attachment": null,
      "duration": 2,
      "duration_type": 2,
      "created_at": "2026-10-19 07:50:56"
    }
  ]
}
```

**Rendering notes:** `attachment` is a **single URL string or `null`** (not an array and not Base64). The Supplier object uses `supplier.title` in this response. Price arrives as a decimal **string** (`"200.00"`), while Store sends a number in the example. The existing Purchase Request confirmation restrictions still apply.

---

## 5. Project Timeline Stage Meetings

### 5.1 Store — `store_project_timeline_stage_meeting`

This feature adds an **audience type**, a meeting **result**, and a list of employee **attendee IDs** while preserving the existing `type` meaning (Meeting / Issue / Risk / Delay).

**Request:**


```json
{
  "project_timeline_stage_id": 18,
  "type": 1,
  "meeting_audience_type": 2,
  "title": "Weekly Site Meeting",
  "date": "2026-10-15",
  "description": "Discuss current project execution progress.",
  "result": "Agreed to begin electrical work next week.",
  "attendees": [
    7,
    8,
    9
  ]
}
```

| Field | Type | Frontend guidance |
|---|---|---|
| `project_timeline_stage_id` | `number` | Target Timeline Stage |
| `type` | `1 \| 2 \| 3 \| 4` | Existing category: Meeting / Issue / Risk / Delay |
| `meeting_audience_type` | `1 \| 2 \| null` | `1` = INTERNAL; `2` = WITH_CLIENT; can be `null` for legacy/non-meeting entries |
| `title` | `string` | Title |
| `date` | `string` | Date in `YYYY-MM-DD` |
| `description` | `string \| null` | Description, when accepted by the existing endpoint |
| `result` | `string \| null` | Outcome of the meeting |
| `attendees` | `number[]` | IDs of `organization_employees`; no nested objects in Store |

**Important:** `type: 1` means **Meeting**, while `meeting_audience_type: 2` means **With Client**. These are two different enums. The `attendees` list is separate from the pre-existing `employee_id` / assigned employee relations, and no automatic attendee insertion is documented here.

### 5.2 Fetch — `fetch_project_timeline_stage_meetings`

**Request:**


```json
{
  "quote_id": 140
}
```

**Actual supplied success response:**


```json
{
  "status": true,
  "message": "Project timeline stage meetings fetched successfully.",
  "data": [
    {
      "id": 3,
      "project_timeline_stage_id": 18,
      "employee": {
        "id": 1,
        "name": "Techlab Employee",
        "type": 1
      },
      "title": "Weekly Site Meeting",
      "date": "2026-10-15",
      "description": null,
      "assigned_employee": null,
      "type": 1,
      "meeting_audience_type": 2,
      "result": "Agreed to begin electrical work next week.",
      "attendees": [
        {
          "id": 7,
          "name": "Magee Colon",
          "type": 2
        },
        {
          "id": 8,
          "name": "Cyrus Page",
          "type": 3
        },
        {
          "id": 9,
          "name": "Fleur Armstrong",
          "type": 4
        }
      ],
      "created_at": "2026-10-19 08:00:17"
    },
    {
      "id": 2,
      "project_timeline_stage_id": 18,
      "employee": {
        "id": 1,
        "name": "Techlab Employee",
        "type": 1
      },
      "title": "Weekly Site Meeting",
      "date": "2026-10-15",
      "description": null,
      "assigned_employee": null,
      "type": 1,
      "meeting_audience_type": 2,
      "result": "Agreed to begin electrical work next week.",
      "attendees": [
        {
          "id": 7,
          "name": "Magee Colon",
          "type": 2
        },
        {
          "id": 8,
          "name": "Cyrus Page",
          "type": 3
        },
        {
          "id": 9,
          "name": "Fleur Armstrong",
          "type": 4
        }
      ],
      "created_at": "2026-10-19 07:59:28"
    },
    {
      "id": 1,
      "project_timeline_stage_id": 18,
      "employee": {
        "id": 1,
        "name": "Techlab Employee",
        "type": 1
      },
      "title": "Weekly Site Meeting",
      "date": "2026-10-15",
      "description": null,
      "assigned_employee": null,
      "type": 1,
      "meeting_audience_type": null,
      "result": null,
      "attendees": [],
      "created_at": "2026-10-12 07:54:50"
    }
  ]
}
```

**Rendering notes:** Store sends attendee **IDs** (`[7,8,9]`), Fetch returns employee **objects** with `id`, `name`, `type`. Older meetings can return `meeting_audience_type: null`, `result: null`, and `attendees: []`. The supplied Store request includes a non-null `description`, but the provided Fetch examples all return `description: null`; **this discrepancy needs backend verification** before the frontend relies on it being persisted. Do not assume that Store returns the same object as Fetch because no Store response was supplied.

---

## 6. Enums and common contracts

| Enum | Value | Label / meaning |
|---|---:|---|
| `ProjectTimelineStageReportScopeEnum` | `1` | `ALL_PROJECT` — كل المشروع |
|  | `2` | `SPECIFIC_SPACE` — خاص بمساحة |
| `ProjectTimelineStageMeetingAudienceEnum` | `1` | `INTERNAL` — داخلي |
|  | `2` | `WITH_CLIENT` — مع العميل |
| Existing `ProjectTimelineStageMeeting.type` | `1` | `MEETING` |
|  | `2` | `ISSUE` |
|  | `3` | `RISK` |
|  | `4` | `DELAY` |
| Existing `site_safety_status` | `1 / 2 / 3` | `OK / Observation / Incident` |
| Existing `duration_type` | `1 / 2 / 3 / 4` | `DAY / WEEK / MONTH / YEAR` |

### Contract distinctions

| Input (Store) | Output (Fetch) |
|---|---|
| `file`: Base64 Data URI | `file`: public or accessible URL |
| `attachments`: list of `{file}` | `attachments`: list of records with ID, URL, size, type, etc. |
| `suppliers[].attachment`: optional Base64 | `attachment`: URL or `null` |
| `attendees`: list of employee IDs | `attendees`: list of employee objects |
| `project_floor_space_id`: ID | `project_floor_space`: nested object or `null` |

**Nullability:** The Fetch samples confirm nullable space fields for older Shop Drawings, project-wide Reports, meeting audience/result for older Meetings, and supplier attachment. Don't assume an older record has the new value populated.

**Validation expectations from the agreed changes:** Validate that a chosen Project Floor Space belongs to the Quote/Timeline Stage's Project; reject cross-Project and cross-Organization references; scope `2` requires a valid space; attachments are optional; attendee IDs must belong to the Organization. Specific error response shapes were not supplied.

**Actual Store response examples:** **Not provided** for the four Store endpoints. Integrate Store success/error handling using your existing backend API contracts; don't assume they return the matching Fetch records.

---

## 7. TypeScript interfaces

The following types represent the **supplied example payloads** and returned objects. Shared models below intentionally include only fields needed for these four API responses; merge them with your existing project types instead of duplicating entire domain models.

```ts
export type ReportScopeType = 1 | 2;
export type MeetingAudienceType = 1 | 2;
export type MeetingRecordType = 1 | 2 | 3 | 4;
export type DurationType = 1 | 2 | 3 | 4;

export interface ApiListResponse<T> {
  status: boolean;
  message: string;
  data: T[];
}

export interface EmployeeSummary {
  id: number;
  name: string;
  type: number;
}

export interface FileAttachment {
  id: number;
  file: string;
  file_size: string;
  alt: string | null;
  type: number;
  link: string | null;
  created_at: string;
}

export interface ProjectFloorSpaceSummary {
  id: number;
  space: { id: number; title: string };
  length: string;
  width: string;
  height: string;
  notes: string | null;
  attachments: unknown[];
}

export interface TimelineStageSummary {
  id: number;
  stage: { id: number; title: string };
  sub_stage: null | { id: number; title?: string };
  created_at: string;
}

export interface ShopDrawingStoreInput {
  quote_id: number;
  title: string;
  date: string;
  version_number: string;
  project_floor_space_id: number;
  file: string; // Base64 Data URI
  project_timeline_stage_ids: number[];
}

export interface ShopDrawingRecord {
  id: number;
  project_floor_space_id: number | null;
  project_floor_space: ProjectFloorSpaceSummary | null;
  employee: EmployeeSummary;
  quote_id: number;
  project_id: number;
  title: string;
  date: string | null;
  version_number: string;
  file: string | null;
  custom_number: number | null;
  stages: TimelineStageSummary[];
  created_at: string;
}

export interface ReportStoreInput {
  project_timeline_stage_id: number;
  date: string;
  notes?: string | null;
  site_safety_status: 1 | 2 | 3;
  report_scope_type: ReportScopeType;
  project_floor_space_id?: number | null;
  attachments?: Array<{ file: string }>;
}

export interface ReportRecord {
  id: number;
  project_floor_space_id: number | null;
  project_floor_space: ProjectFloorSpaceSummary | null;
  project_timeline_stage_id: number;
  employee: EmployeeSummary;
  date: string;
  notes: string | null;
  report_scope_type: ReportScopeType;
  attachments: FileAttachment[];
  site_safety_status: number;
  created_at: string;
}

export interface SupplierPriceInput {
  id: number; // supplier ID
  price: number;
  duration: number;
  duration_type: DurationType;
  attachment?: string; // Base64 Data URI; omit to preserve existing file
}

export interface SupplierPricesStoreInput {
  purchase_request_id: number;
  suppliers: SupplierPriceInput[];
}

export interface SupplierPriceRecord {
  id: number; // offer row ID
  purchase_request_id: number;
  supplier: { id: number; title: string };
  price: string;
  attachment: string | null;
  duration: number;
  duration_type: DurationType;
  created_at: string;
}

export interface MeetingStoreInput {
  project_timeline_stage_id: number;
  type: MeetingRecordType;
  title: string;
  date?: string | null;
  meeting_audience_type?: MeetingAudienceType | null;
  description?: string | null;
  result?: string | null;
  attendees?: number[];
}

export interface MeetingRecord {
  id: number;
  project_timeline_stage_id: number;
  employee: EmployeeSummary;
  title: string;
  date: string | null;
  description: string | null;
  assigned_employee: EmployeeSummary | null;
  type: MeetingRecordType;
  meeting_audience_type: MeetingAudienceType | null;
  result: string | null;
  attendees: EmployeeSummary[];
  created_at: string;
}
```

Use the existing shared project models for richer stage/space/employee details when available. **Do not treat these illustrative TypeScript declarations as authoritative backend validation rules for fields not evidenced by the supplied examples.**

---

## 8. Frontend integration checklist

- [ ] Shop Drawing form sends `project_floor_space_id` from the **Project Floor Space** list, not `space.id`.
- [ ] Shop Drawing list safely renders a missing (legacy) space.
- [ ] Reports UI toggles `ALL_PROJECT` / `SPECIFIC_SPACE`; only scope `2` requires a selected space.
- [ ] Reports upload control builds an array of `{ file: 'data:...;base64,...' }` and accepts `[]`.
- [ ] Reports gallery reads the report-level `attachments` array; older reports may have no files.
- [ ] Supplier offers form preserves the full existing `suppliers` array on sync, attaching files individually.
- [ ] Missing supplier attachment does **not** mean remove the stored file.
- [ ] Meetings form keeps `type` separate from `meeting_audience_type`.
- [ ] Meetings multi-select sends `attendees: number[]`, not employee objects.
- [ ] Meetings list handles legacy `null` audience and `result`, and `[]` attendees.
- [ ] Confirm whether `description` is persisted in Meetings, as the supplied request and Fetch response differ.
- [ ] Reuse existing auth handling and API route prefixes; refresh relevant queries after successful Store.

---

**Source of examples:** Store bodies supplied as uploaded JSON snippets; Fetch request/response bodies and enum definitions supplied in the conversation on October 19, 2026. This document does not claim an unprovided response, undocumented endpoint URL, or unverified behavior.
