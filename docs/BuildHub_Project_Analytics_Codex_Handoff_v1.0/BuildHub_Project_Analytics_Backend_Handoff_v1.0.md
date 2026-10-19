# BuildHub OS — Project Intelligence Dashboard
## Backend analytics handoff · Proposed contract v1.0 · 19 October 2026

**Audience:** Backend team, frontend team, QA, product owner  
**Scope:** One execution project in the existing **ExecutionQuotes / Quote Show** workspace.  
**Owner:** `quote_id` (the existing Quote is the project-management entry point); resolve `project_id` server-side.  
**Contract status:** **PROPOSAL — not an implemented or approved API.** Existing endpoints and response examples listed below are the evidence. Confirm the aggregate endpoint, formulas, permissions, and response schema before production wiring.

---

## 1. Outcome and constraints

Build one project-level dashboard that communicates **execution readiness, work activity, procurement, receiving, technical evidence, and risks needing attention**, without claiming to be a full ERP, HSE suite, time tracker, or accounting ledger. The dashboard should be responsive and should not require one network request per purchase request, supplier, timeline group, or receipt.

**Three distinct statuses must never be combined:**

1. `quotes.timeline_status`: approval of the full project timeline — `1 PENDING`, `2 CANCEL`, `3 APPROVED`.
2. `project_configurations.work_status`: overall execution — `null NOT_STARTED`, `1 START`, `2 HOLD`, `3 STOP`.
3. `project_timelines.work_status`: the independently managed **timeline-group** execution state — `null NOT_STARTED`, `1 START`, `2 HOLD`, `3 STOP`. Several groups may be started concurrently.

**Financial safeguards:** Positive invoice payment is a *Start Project prerequisite*; it is neither proof of recognized revenue nor proof of the entire contract being funded. Shop Drawing existence is another prerequisite. Do not show profit, revenue, cost variance, or percent-complete as authoritative until their business/accounting bases are explicitly defined and supported by endpoints. Internal costs, supplier prices, employee costs, and margins must be permission-filtered by the backend, not merely hidden with CSS.

**Source priority:** actual backend-owned records and events > verified existing Fetch responses > proposed backend aggregates > unsupported/TBD. Examples in this handoff are fictional contract fixtures, **not measured project metrics**.

---

## 2. Inventory of existing source APIs (provided in project handoffs)

| Domain | Existing action or source | Confirmed fields / source | Notes |
|---|---|---|---|
| Project configuration | `show_project_configuration` | `work_status`, `responsible_employee`, `start_date`, `delivery_date`, `holidays` | Start date is planning configuration, not the first recorded execution event. |
| Quote approval | `change_project_timeline_status` response / existing Quote show | `timeline_status`, `approved_by_employee_id`, `timeline_note` | Quote-wide approval only. |
| Timeline | `fetch_project_timelines` | group identities, `work_status` where returned, group dates/count metadata where available | **Dashboard must obtain ALL groups**, never fetch only `work_status:1` for distribution. |
| Timeline history | `fetch_project_timeline_history` | history `status`, `reason`, `created_at` for one Group | History is an event stream, not completion quantities. Avoid N+1 on dashboard. |
| Responsible engineers | `fetch_quote_engineers` | `employee[]` | Assigned engineers, not attendance/time worked. |
| Tasks | `fetch_project_timeline_stage_tasks` | `project_timeline_stage_id`, `employee`, `assigned_employee`, `end_date`, `created_at` | **No verified completion status:** do not show completed-task percentage. |
| Site reports | `fetch_project_timeline_stage_reports` | `date`, `site_safety_status` (`1 OK / 2 Observation / 3 Incident`), `report_scope_type` and attachments | Count **reports with safety flags**, not unique HSE incidents. |
| Meetings/issues/risks/delays | `fetch_project_timeline_stage_meetings` | `type` (`1 Meeting / 2 Issue / 3 Risk / 4 Delay`), `date`, `created_at`, audience/attendees | Types indicate record category; **no verified open/closed status** in given samples. |
| Technical drawings | `fetch_shop_drawing_quotes` | `id`, `created_at`, `version_number`, `custom_number`, `project_floor_space` | Record counts; `custom_number` is a sequence per identical stage set, **not** approval. |
| Procurement requests | `fetch_purchase_requests` | `id`, `status` (`1 Pending / 2 Rejected / 3 Confirmed`), `priority` (`1 Normal / 2 Low / 3 High`), `created_at` | Count by backend status. |
| Supplier price offers | `fetch_purchase_request_prices` | `purchase_request_id`, `supplier`, `price` (decimal string), `duration`, `duration_type` | One request at a time; project-wide aggregate would be N+1. Internal commercial permission required. |
| Purchase orders | `fetch_purchase_order` | **one order or null** per request, `is_order_paid` | Not a project-wide PO list. Aggregate on backend if useful. |
| Receiving | `fetch_purchase_request_receipts` | per-request `data.status` (`null/1 Partial/2 Complete`), `items_summary[]`, `receipts[]` | Never sum meter + sheet + pcs as one physical quantity. Confirmed PO is required before receipt. |
| Payment prerequisite | authoritative `invoice_payments` joined to project invoices | any `payment_amount > 0` for same Project and Organization | Only a **readiness boolean** is specified, no new finance aggregate API yet. |

Source handoffs: `BuildHub_Project_Execution_Work_Status_Frontend(1).md`, `BuildHub_Execution_Features_API_Updates_Frontend(1).md`, `project_timeline_stage_endpoints.md`, `purchase_request_api_documentation.md`, `purchase_order_api_documentation.md`, `Purchase_Request_Receiving_API_Frontend (1).md`, `shop_drawing_quote_endpoints.md`, and `00_Shared_Reference_and_Business_Rules.pdf`.

---

## 3. Suggested first-release KPI cards (project-level)

**Existing-record derived** means the source fields have appeared in submitted API examples. It does **not** mean that a performant dashboard aggregate API already exists.

| Key | UI title | Definition | Source | Handling |
|---|---|---|---|---|
| `project_work_status` | Execution Status | `project_configurations.work_status` | Project configuration | Enum/null; not a %; quote timeline approval is separate. |
| `timeline_groups_total` | Timeline Groups | Count all timeline groups owned by this Quote | Project timelines | Count even if no group started. |
| `timeline_groups_started` | Active Groups | Count groups `work_status=1` | Project timelines | Other statuses excluded from active count. |
| `daily_reports_count` | Daily Reports | Count reports with `date` in selected period | Stage reports | Use report date, not creation time. |
| `tasks_total` | Recorded Tasks | Count tasks linked to this Quote | Stage tasks | Do not show task completion without a status field. |
| `tasks_assigned` | Assigned Tasks | Count tasks with non-null `assigned_employee` | Stage tasks | Not attendance/employee utilization. |
| `pending_purchase_requests` | Pending Requests | Count request `status=1` | Purchase requests | Use 1 Pending, not “unpaid.” |
| `shop_drawings_total` | Shop Drawings | Number of Shop Drawing records for Quote/Project | Shop drawings | Not unique approved drawings or signed revisions. |
| `receiving_requests_complete` | Requests Fully Received | Purchase requests with receiving status `2` | Receipt summaries | Requires backend aggregate across requests. |
| `reports_with_observation` | Safety Observations | Reports with safety status `2` in period | Stage reports | Count reports, not investigations. |
| `reports_with_incident` | Incident-Flagged Reports | Reports with safety status `3` in period | Stage reports | Do not imply number of distinct incidents. |
| `start_readiness` | Ready to Start | Backend prerequisite check result | Positive project invoice payment + same-quote drawing + config/employee | Return status/evidence flags; separate from actual `work_status`. |

**Card policy:** Show approximately 6–8 cards per desktop viewport, selected for the user's permissions. Do not force all cards into one crowded row. Unavailable != 0; return a quality/availability reason. Counts are integers >=0; any dates or financial amounts retain source precision and timezone.

---

## 4. Proposed first-release charts and mathematical definitions

| Chart key | Suggested UI/chart | Grouping and formula | Safe interpretation | Backend need |
|---|---|---|---|---|
| `timeline_work_status_distribution` | Elevated/2.5D donut + legend | `count(project_timelines)` for `null,1,2,3`; source ALL groups | Which groups are running/paused/not started. **STOP ≠ completed.** | Efficient batch aggregate preferred; feasible from all-groups Fetch if small. |
| `daily_reports_trend` | Smooth line/area with depth shading | For each `date` in selected period: `COUNT(stage_reports.id)` grouped by `date` | Reports recorded per day; not percentage complete. | Existing Fetch or backend aggregation. |
| `daily_reports_safety_mix` | Stacked columns / compact donut | Count reports by `site_safety_status` 1/2/3 in selected period | Volume of reports flagged OK/Observation/Incident | Existing Fetch or backend aggregation. |
| `purchase_request_status_mix` | Stacked horizontal bar | Count requests by status 1/2/3 | Procurement request decisions, not delivery statuses | Existing Fetch or aggregate. |
| `purchase_requests_by_priority` | Horizontal bars | Count requests by priority 1/2/3 in selected period, optionally Pending-only | Request priority distribution | Existing Fetch or aggregate. |
| `work_record_type_mix` | Isometric depth bars (counts) | Count Timeline Stage Meeting records grouped by `type` 1/2/3/4 | Meetings/Issues/Risks/Delays **recorded**, not open or resolved | Existing Fetch or aggregate. |
| `shop_drawings_created_trend` | Mini bars or sparkline | Count drawing records grouped by `created_at` day/week | Drawing record creation activity; not approvals | Existing Fetch or aggregate. |
| `receiving_request_status_mix` | Segmented/donut | Per eligible Purchase Request receiving `null`, `1`, `2`; count requests by status | Requests not started/partially/fully received | **New backend project-level aggregate recommended** to prevent N+1. |
| `supplier_offers_comparison` | Horizontal price bars for **one selected purchase request** | `supplier_id` + one offer `price`; price returned decimal string, unit not documented | Compare bids within a single request only | Existing per-request Fetch; guard internal permission. |
| `purchase_orders_paid_mix` | Segmented counts (optional) | Count Purchase Orders by `is_order_paid=true/false` for Quote | Payment flag only, not general AP ledger | **New backend project-level aggregate**; existing PO API is per request. |

**Visualization rule:** 3D is a *presentation enhancement*, never a data transformation. Use correct scales, labels, tooltips, and number formats. Avoid perspective effects that distort bar height, area, proportional values, or donut slices; provide a 2D/accessible fallback. No currency prefix without an approved currency source. No hidden categories for a legend that appears complete.

---

## 5. Important project-start readiness check

The existing `change_project_configuration_work_status` enforces these START prerequisites:

- At least one **actual positive** `invoice_payments.payment_amount` record on an invoice tied to the *same* project and organization;
- At least one Shop Drawing for the *same* `quote_id` and `project_id`;
- Existing Project Configuration and a valid responsible employee for initial START.

**Proposed dashboard read-only readiness object:**

```json
{
  "has_positive_project_invoice_payment": true,
  "has_shop_drawing": true,
  "has_project_configuration": true,
  "responsible_employee_selected": true,
  "eligible_for_first_start": true
}
```

This is a **proposed** summary shape, not a supplied endpoint. Do not expose private payment details to unauthorized roles. Prefer a backend-computed readiness state to frontend guessing. Eligibility can change between reading it and requesting START, so the existing mutation still revalidates it transactionally.

---

## 6. Proposed aggregate endpoint (not yet available)

### `POST fetch_quote_execution_analytics` — **PROPOSED**

Auth: employee, same organization/quote ownership and permission validation as other Execution APIs. Resolves the Project using `quote_id`. Start with Quote-level analytics only; a portfolio-wide organization endpoint can be designed later.

Request (all dates **inclusive** in the organization's configured timezone):

```json
{
  "quote_id": 140,
  "from_date": "2026-09-20",
  "to_date": "2026-10-19"
}
```

**Date semantics:** period filters apply to activity/flow series (`report.date`, `purchase_request.created_at`, `shop_drawing.created_at`, etc.) only where defined. Current-state snapshots (current project status, current outstanding counts, all Timeline Groups) are **as-of** values and must not misleadingly inherit period filters. Returned response identifies the period and `as_of` timestamp. Date filtering on datetimes uses the **organization timezone** and a half-open UTC range internally.

Illustrative (synthetic) response shape — **sample numbers are made up for contract discussion only**:

```json
{
  "status": true,
  "message": "Execution analytics retrieved successfully.",
  "data": {
    "quote_id": 140,
    "project_id": 86,
    "as_of": "2026-10-19T12:00:00+03:00",
    "timezone": "Africa/Cairo",
    "period": { "from_date": "2026-09-20", "to_date": "2026-10-19" },
    "overview": {
      "project_work_status": 1,
      "timeline_approval_status": 3,
      "planned_start_date": "2026-10-10",
      "planned_delivery_date": null,
      "responsible_employee": { "id": 9, "name": "Example Engineer", "type": 4 }
    },
    "kpis": {
      "timeline_groups_total": 8,
      "timeline_groups_started": 3,
      "tasks_total": 21,
      "tasks_assigned": 17,
      "daily_reports_count": 20,
      "pending_purchase_requests": 4,
      "shop_drawings_total": 5,
      "receiving_requests_complete": 2,
      "reports_with_observation": 1,
      "reports_with_incident": 0
    },
    "charts": {
      "timeline_work_status_distribution": [
        { "work_status": null, "count": 2 },
        { "work_status": 1, "count": 3 },
        { "work_status": 2, "count": 2 },
        { "work_status": 3, "count": 1 }
      ],
      "daily_reports_trend": [
        { "date": "2026-10-18", "count": 2 },
        { "date": "2026-10-19", "count": 1 }
      ],
      "daily_reports_safety_mix": [
        { "site_safety_status": 1, "count": 18 },
        { "site_safety_status": 2, "count": 1 },
        { "site_safety_status": 3, "count": 1 }
      ],
      "purchase_request_status_mix": [
        { "status": 1, "count": 4 },
        { "status": 2, "count": 1 },
        { "status": 3, "count": 6 }
      ],
      "work_record_type_mix": [
        { "type": 1, "count": 8 },
        { "type": 2, "count": 3 },
        { "type": 3, "count": 1 },
        { "type": 4, "count": 2 }
      ],
      "receiving_request_status_mix": [
        { "status": null, "count": 6 },
        { "status": 1, "count": 3 },
        { "status": 2, "count": 2 }
      ]
    },
    "start_readiness": {
      "has_positive_project_invoice_payment": true,
      "has_shop_drawing": true,
      "has_project_configuration": true,
      "responsible_employee_selected": true,
      "eligible_for_first_start": true
    },
    "metric_availability": {
      "progress_percent": { "state": "unavailable", "reason": "progress_weighting_not_approved" },
      "recognized_revenue": { "state": "unavailable", "reason": "revenue_recognition_not_approved" },
      "expected_profit": { "state": "unavailable", "reason": "forecast_inputs_not_confirmed" }
    }
  }
}
```

**The chart arrays are excerpts**, not a complete timeseries example. A real backend response for `daily_reports_trend` should return a daily bucket for **every day in the requested period**, including count 0 for days without reports. Status buckets should include the complete defined enum set including `null` for not started, even at count 0, so legends don't jump.

**Response shape questions for backend approval:** Whether period is mandatory (recommend default last 30 calendar days), allowed maximum range, generated date bucket precision (day/week/month), source timestamps, timezone, cache lifetime, permission-filtered metric omission shape, return of read-only drill-down links/IDs, whether analytics API can return partial subsections, and error envelope conventions.

### Minimal API design alternatives

- **Preferred**: one read-only aggregate action above, with efficient query grouping. Frontend uses existing Fetch APIs for per-record drilldown and supplier comparison.
- **Interim**: frontend derives *small-data* metrics from already-loaded verified per-Quote list endpoints, **without** triggering N+1 calls or fabricating missing stats. Visibly mark server-only charts `Unavailable` until aggregate endpoint exists.
- **Avoid**: one new endpoint for every card/chart, frontend fetching every Purchase Order and every Purchase Request Receipt separately on initial dashboard load, or expensive all-record fanouts for large projects.

---

## 7. SQL/aggregation semantics and boundaries for backend team

1. Enforce `(organization_id, quote_id, project_id)` consistency using authenticated employee. `quote_id` is the request owner. Do not trust `project_id` sent by the client.
2. **Timeline group status**: count the current `project_timelines.work_status`; do not count rows of `project_timeline_history` as active groups. History is only for event-driven charts if explicitly named.
3. **Reports**: use distinct report IDs and the report's `date` for daily activity; `site_safety_status=3` measures incident-flagged reports, not distinct legally reportable accidents. Group by calendar day in organizational timezone.
4. **Tasks**: assigned means non-null `assigned_employee_id` or authoritative assignment relation; the supplied task response does not establish a completion workflow.
5. **Meetings/Issues/Risks/Delays**: count Stage Meeting records by `type`; the given response does not establish open/closed lifecycle, so do not produce resolution percentages.
6. **Drawings**: count `shop_drawing_quotes.id` under the same project/quote, not unique versions inferred from `custom_number`.
7. **Procurement**: count purchase requests by `status`; supplier offers are priced supplier proposals, **not committed spend**, and price units/currency must be documented before totals/comparison across requests.
8. **Receiving**: aggregate each request's current receiving status (`null/1/2`); for item completeness, count fully received **lines** as `remaining_quantity == 0`. Never sum incompatible physical units across rows.
9. **Payments**: readiness requires `EXISTS` an invoice payment `payment_amount > 0` through invoices linked to same Project and Organization. This is **not** a revenue-recognition metric.
10. Handle duplicate joins and avoid N+1. Prefer `COUNT(DISTINCT primary_key)` or aggregated subqueries when combining lines, attachments, and receipts. Scope all relation joins to current organization.
11. All money and quantities should use backend decimal types; return ISO dates and stable numeric status codes; avoid floating-point sums in monetary analytics.
12. Return zeros for measured empty sets and `unavailable/null` for unsupported or unauthorized metrics; do not substitute zero for errors or withheld data.
13. Be explicit whether chart is a current snapshot or period-filtered event series. Provide a machine-readable `as_of`, timezone, and series granularity.

**Database index review (suggested; confirm existing indexes):** project/quote/organization scope keys, `project_timelines(quote_id,work_status)`, report `(project_timeline_stage_id,date)`, purchase request `(quote_id,status,priority)`, Shop Drawing `(quote_id,project_id,created_at)`, invoices `(project_id,organization_id)`, invoice payments `(invoice_id,payment_amount)`, and receipt summary join keys. Do not add redundant indexes blindly.

---

## 8. Deferred metrics requiring new decisions or data contracts

| Not in v1 | Reason / prerequisite |
|---|---|
| **Percent of project work complete** | Business decision DEC-02 progress weighting basis (quantities/cost/duration/configured stage weight) is still open; daily reports alone do not certify quantities. |
| **On-time delivery % / earned progress S-curve** | Needs a baseline, actual approved measurement/time markers, and date/forecast rules. STOP isn't completion. |
| **Recognized revenue / profit margin** | Revenue-recognition decision DEC-03 and trusted actual-cost/commitment/EAC data sources, role restrictions. Customer cash is not revenue. |
| **Forecast cost vs budget** | Must avoid double-counting actuals, open commitments, and uncommitted remaining estimates, per BuildHub source rules. |
| **Supplier spend totals** | Supplier quoted offers are not actual expense/payment. Financial posting and stock receipt are distinct. |
| **Unique safety incident counts** | Flagged report != verified unique incident record; needs incident identity/process if required. |
| **Task completion rate / overdue open tasks** | Task fetch sample lacks completion status. Past due date alone doesn't prove unfinished work. |
| **Inventory on hand, installed, waste, site balance** | Receiving data only is not stock ledger; requires authoritative warehouse transactions and material reconciliation. |
| **Cross-project portfolio analytics** | Requires separate organization-scoped aggregation and permissions; not part of Quote Show v1. |

---

## 9. Data-contract acceptance criteria / QA

- Status counts reconcile to all timeline groups (`sum(status counts)==timeline_groups_total`).
- START group count matches `work_status=1`; Quote approval status is unaffected by group transitions.
- Report daily buckets reconcile to report totals for the same requested period.
- Report safety category counts reconcile to report rows; labels say **reports**.
- Purchase Request counts use documented 1/2/3 statuses; supply responsibility is distinct.
- Receipt distributions count each Purchase Request once; current status is not duplicated for each receipt record.
- Legacy nullable Shop Drawing space and report attachments do not break aggregation.
- Unfiltered schedule data is not replaced with START-only results in the Schedule screen.
- Payment/start-readiness tests include wrong-project and wrong-organization invoice payments.
- Reject unauthorized requests and return no sensitive price/cost values to unauthorized clients.
- Null/unavailable states are distinct from genuine zero counts.
- Repeated request with the same filters provides deterministic bucket order and counts for the same snapshot.
- Large projects avoid N+1 and avoid loading every attachment binary or Base64.

---

## 10. Decisions requested from backend/product

Please reply with confirmations or actual JSON for:

1. Endpoint name/method/prefix for aggregate analytics (`fetch_quote_execution_analytics` proposed), or preferred name.
2. Which v1 metric fields will be included and whether response schema above is acceptable.
3. Who may read supplier comparison, invoice-payment readiness, internal financial numbers, and dashboard metrics.
4. Whether `start_readiness` can reuse the exact existing backend START validator via a read-only service.
5. Default period, max date range, organization timezone, and grouping (daily/weekly/monthly).
6. Whether `project_timelines` return authoritative `end_date` per group / aggregate; do not calculate fake forecast dates.
7. If dashboard includes purchasing/receiving/PO aggregates, which tables and definitions are authoritative.
8. Error envelopes, partial-section availability conventions, and dashboard caching/invalidation policy.
9. Whether progress weighting and revenue-recognition decisions remain TBD, as documented.

**Backend handoff status:** proposal for a dashboard aggregate API; existing source action names and enums are grounded in the supplied BuildHub handoffs. No new endpoint is claimed to exist.
