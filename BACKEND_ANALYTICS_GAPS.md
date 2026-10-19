# Project Intelligence — confirmed contract gaps

The v1.0 handoff and metric catalog are proposals. This checkout defines no
`fetch_quote_execution_analytics` service or endpoint; no live backend was probed.
Confirm actual deployment availability, route, method and prefix before integration.
The dashboard currently reuses existing repositories and their verified mappings.

- **Aggregate schema:** approve the exact response and error envelopes, nullable
  versus omitted fields, complete enum buckets, partial-section availability,
  permission-denied representation, `as_of`, caching and list-size limits.
  No synthetic response is used in production. The proposed request remains
  `quote_id`, `from_date`, `to_date`; server resolution must own `project_id`.
  TODO: add mapped aggregate submodels/subparams only after contract acceptance.
  Typed request proposal (documentation only, not a callable service):

  ```ts
  interface ProposedQuoteExecutionAnalyticsRequest {
    quote_id: number;
    from_date?: string; // YYYY-MM-DD, inclusive
    to_date?: string; // YYYY-MM-DD, inclusive
  }
  ```

- **Date grouping:** confirm organization timezone, inclusive calendar boundaries,
  daily zero buckets, maximum range and date semantics for meeting records.
  Interim report/meeting filtering accepts valid YYYY-MM-DD values without timezone
  conversion. Last 7/30/90 includes today, using UTC for the current-day boundary,
  explicitly labelled in the UI. Missing/ambiguous event dates make the affected
  period metric unavailable. Procurement, drawings, tasks and timeline groups are
  current snapshots; datetime-based trends are deferred.
- **Permissions:** the existing application distinguishes admin/organization
  workspace roles; no analytics-specific permission scope is defined in its source.
  Confirm metric scopes and server-side filtering for every role, including client
  users. The dashboard declines reads outside those existing internal roles and
  calls no supplier-price or payment endpoints and displays no financial fields
  from the existing Quote context response. Backend ownership
  and authorization remain mandatory; browser role checks are not authorization.
- **Readiness:** no read-only counterpart to the START validator is defined here.
  Return same-project/organization positive-payment existence, same-quote/project
  drawing existence, valid configuration, responsible employee and final eligibility.
  Current UI reports recorded configuration/employee/drawing evidence only; it
  cannot certify configuration validity, payment evidence or eligibility. Existing
  START mutation must continue transactional revalidation. It is not invoked here.
- **Receiving / purchase orders:** existing reads are per purchase request.
  Project-wide request receiving counts (null/1/2) and PO paid flags need an
  authoritative grouped source to avoid N+1. No request loops, physical quantity
  totals, receiving completion count or warehouse stock metric are computed.
- **Progress / finance:** the supplied handoff leaves progress weighting and
  revenue recognition undecided. Daily reports, STOP groups and task assignments
  cannot establish completion; payments cannot establish revenue; offers cannot
  establish spend. Completion, revenue, profit, variance and stock KPIs are absent.

Existing fetch actions used: `show_quote` (context), `show_project_configuration`,
`fetch_project_timelines` (unfiltered), `fetch_project_timeline_stage_tasks`,
`fetch_project_timeline_stage_reports`, `fetch_project_timeline_stage_meetings`,
`fetch_purchase_requests`, `fetch_shop_drawing_quotes`. These are bounded Quote
reads; final receiving and readiness remain unavailable until backend acceptance.
