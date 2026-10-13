# Project Timeline Stage APIs

This document describes the frontend contract for Project Timeline Stage **Tasks**, **Reports**, and **Meetings / Issues / Risks / Delays**.

---

## 1. Project Timeline Stage Tasks

### Store Task

**Endpoint**

```text
store_project_timeline_stage_task
```

**Request**

```json
{
  "project_timeline_stage_id": 18,
  "title": "Complete electrical installation",
  "employee_id": 7,
  "end_date": "2026-10-20"
}
```

**Request Fields**

| Field | Type | Description |
|---|---|---|
| `project_timeline_stage_id` | integer | Project Timeline Stage ID |
| `title` | string | Task title |
| `employee_id` | integer / null | Assigned organization employee ID |
| `end_date` | date / null | Task end date in `YYYY-MM-DD` format |

> `quote_id` and `project_id` are not sent by the frontend when storing a task. They are derived by the backend from `project_timeline_stage_id`.

---

### Fetch Tasks

**Endpoint**

```text
fetch_project_timeline_stage_tasks
```

**Request**

```json
{
  "quote_id": 140
}
```

**Response Example**

```json
{
  "status": true,
  "message": "Project timeline stage tasks fetched successfully.",
  "data": [
    {
      "id": 1,
      "project_timeline_stage_id": 18,
      "employee": {
        "id": 1,
        "name": "Techlab Employee",
        "type": 1
      },
      "title": "Complete electrical installation",
      "assigned_employee": {
        "id": 7,
        "name": "Magee Colon",
        "type": 2
      },
      "end_date": "2026-10-20",
      "created_at": "2026-10-12 07:49:53"
    }
  ]
}
```

**Response Notes**

- `employee` = the employee who created the task.
- `assigned_employee` = the employee assigned to the task.
- `assigned_employee` can be `null` when no employee is assigned.

---

## 2. Project Timeline Stage Reports

### Store Report

**Endpoint**

```text
store_project_timeline_stage_report
```

**Request**

```json
{
  "project_timeline_stage_id": 18,
  "date": "2026-10-12",
  "notes": "Work is progressing normally.",
  "site_safety_status": 1
}
```

**Request Fields**

| Field | Type | Description |
|---|---|---|
| `project_timeline_stage_id` | integer | Project Timeline Stage ID |
| `date` | date | Report date in `YYYY-MM-DD` format |
| `notes` | string / null | Report notes |
| `site_safety_status` | integer | Site safety status |

### Site Safety Status

| Value | Meaning |
|---:|---|
| `1` | OK |
| `2` | Observation |
| `3` | Incident |

> `quote_id` and `project_id` are not sent by the frontend when storing a report. They are derived by the backend from `project_timeline_stage_id`.

---

### Fetch Reports

**Endpoint**

```text
fetch_project_timeline_stage_reports
```

**Request**

```json
{
  "quote_id": 140
}
```

**Response Example**

```json
{
  "status": true,
  "message": "Project timeline stage reports fetched successfully.",
  "data": [
    {
      "id": 1,
      "project_timeline_stage_id": 18,
      "employee": {
        "id": 1,
        "name": "Techlab Employee",
        "type": 1
      },
      "date": "2026-10-12",
      "notes": "Work is progressing normally.",
      "site_safety_status": 1,
      "created_at": "2026-10-12 07:52:27"
    }
  ]
}
```

**Response Notes**

- `employee` = the employee who created the report.
- `site_safety_status` follows the enum values documented above.

---

## 3. Project Timeline Stage Meetings / Issues / Risks / Delays

### Types

| Value | Type |
|---:|---|
| `1` | Meeting |
| `2` | Issue |
| `3` | Risk |
| `4` | Delay |

---

### Store Meeting — `type = 1`

**Endpoint**

```text
store_project_timeline_stage_meeting
```

When `type = 1`, send `title` and `date`.

**Request**

```json
{
  "project_timeline_stage_id": 18,
  "type": 1,
  "title": "Weekly Site Meeting",
  "date": "2026-10-15"
}
```

For a Meeting:

- `title` is required.
- `date` is required.
- `description` is not used.
- `employee_id` is not used.

> The backend stores `description = null` and `employee_id = null` for Meeting records.

---

### Store Issue / Risk / Delay — `type = 2, 3, or 4`

Use the same endpoint:

```text
store_project_timeline_stage_meeting
```

Example for `type = 2` (Issue):

```json
{
  "project_timeline_stage_id": 19,
  "type": 2,
  "title": "Material shortage",
  "description": "Required materials have not arrived yet.",
  "employee_id": 7
}
```

The same request structure is used for:

```text
type = 2 -> Issue
type = 3 -> Risk
type = 4 -> Delay
```

For Issue / Risk / Delay:

- `title` is required.
- `description` is optional.
- `employee_id` is optional.
- `date` is not used.

> The backend stores `date = null` for Issue, Risk, and Delay records.

> `quote_id` and `project_id` are not sent by the frontend when storing a Meeting / Issue / Risk / Delay. They are derived by the backend from `project_timeline_stage_id`.

---

### Fetch Meetings / Issues / Risks / Delays

**Endpoint**

```text
fetch_project_timeline_stage_meetings
```

**Request**

```json
{
  "quote_id": 140
}
```

This endpoint returns all four types:

- Meeting
- Issue
- Risk
- Delay

**Response Example**

```json
{
  "status": true,
  "message": "Project timeline stage meetings fetched successfully.",
  "data": [
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
      "created_at": "2026-10-12 07:54:50"
    }
  ]
}
```

**Response Notes**

- `employee` = the employee who created the record.
- `assigned_employee` = the employee assigned/referenced by an Issue / Risk / Delay.
- For `type = 1` (Meeting), `assigned_employee` is `null`.
- For `type = 1` (Meeting), `description` is `null`.
- For `type = 2`, `3`, or `4`, `date` is `null`.

---

## Frontend Quick Reference

| Module | Store Endpoint | Fetch Endpoint |
|---|---|---|
| Tasks | `store_project_timeline_stage_task` | `fetch_project_timeline_stage_tasks` |
| Reports | `store_project_timeline_stage_report` | `fetch_project_timeline_stage_reports` |
| Meetings / Issues / Risks / Delays | `store_project_timeline_stage_meeting` | `fetch_project_timeline_stage_meetings` |

### Store Rule

For all Store endpoints, the frontend sends:

```text
project_timeline_stage_id
```

The frontend does **not** send:

```text
quote_id
project_id
organization_id
organization_employee_id
```

These values are resolved by the backend.

### Fetch Rule

The examples in this document fetch data using:

```json
{
  "quote_id": 140
}
```
