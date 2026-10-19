# Codex prompt — BuildHub Project Intelligence Dashboard

Copy the following **single continuous prompt** into the existing Codex conversation after making the backend handoff available in the current worktree.

```text
Implement a premium, responsive Project Intelligence Dashboard inside the existing BuildHub Vue 3 + TypeScript application.

Deliver real source code and tests. Extend the existing ExecutionQuotes / Quote Show project-management workspace. Do not create a separate product, Project entity, or unrelated dashboard shell.

The attached three design references show the desired QUALITY, not an exact component-by-component copy: premium minimal SaaS, strong typography, organized KPI cards, compact analytic panels, refined chart depth, and tasteful transitions. Respect BuildHub's existing identity and current design system.

READ FIRST
- AGENTS.md and the current .agents/skills/api-integration/SKILL.md.
- BuildHub_Project_Analytics_Backend_Handoff_v1.0.md (the new backend handoff).
- BuildHub_Project_Analytics_Metric_Catalog_v1.0.json (if available).
- Existing ExecutionQuotes Show, Schedule, SiteTeam, WorkItems, Procurement, Purchase Orders, Material Receipt and their models/controllers.
- Existing shared chart, UI, dialog, empty-state, skeleton, localization, router and permission patterns.
- Supplied screenshots/reference images if present in the current worktree.

SKILLS
Use the updated api-integration skill. Do not invoke feature-implementation or impeccable skills; follow existing BuildHub UI conventions directly.

GIT / WORKTREE SAFETY
Run pwd, git rev-parse --show-toplevel, git status --short and git worktree list. The Codex worktree may be detached and different from the real feat/schedule branch. Preserve unrelated changes. Do not cherry-pick, reset, commit, push, or discard user work without explicit instruction. Work in the current intended checkout, report the path you changed.

SCOPE AND BUSINESS TRUTH
- Quote is the existing project workspace owner; use quote_id in a proposed analytics request and resolve project_id server-side.
- Project Execution Status = project_configurations.work_status.
- Timeline Approval = quotes.timeline_status.
- Timeline Group Work Status = project_timelines.work_status.
- These are THREE DISTINCT states. Timeline status distribution MUST fetch all groups, NOT only work_status:1.
- Multiple timeline groups can be START simultaneously. STOP does not mean completed.
- Daily Reports prove recorded activity, not approved quantities or certified progress.
- Client payments are not accounting revenue. Supplier offers are not actual spend. Material receipts are not warehouse stock on hand.
- Do NOT invent project completion %, revenue, profit, variance, on-time percentage, completed-task counts, resolved risks, or warehouse stock KPIs from incomplete sources.
- Keep all sensitive internal financial numbers behind server-enforced authorization.

FIRST-RELEASE DASHBOARD INFORMATION ARCHITECTURE
Add Project Intelligence as the Quote Show project-management Overview or a clearly linked child dashboard consistent with existing route conventions. Keep current Schedule/Procurement/WorkItems/etc. functioning.

The visual layout:
1. Compact project header with project title, meaningful status, last-updated timestamp, a time-range filter, and Refresh.
2. A responsive KPI grid (about 6–8 visible cards on desktop): Overall Execution Status, Active/Total Timeline Groups, Daily Reports in Range, Pending Purchase Requests, Shop Drawing Records, Tasks Assigned/Total, Receiving completion count when authoritative, and safety-flagged reports.
3. One large polished Timeline Group Status visualization + smaller Daily Report Trend and Procurement Status charts.
4. A second row with Work Record Mix (Meetings/Issues/Risks/Delays), Safety Report Mix, and Receiving Status when aggregated data is available.
5. A compact attention / execution-readiness panel with real prerequisites, actionable links, and honest data-quality states.
6. Drilldowns navigate to existing features with the same Quote context; do not create disconnected duplicate pages.

PROPOSED 2.5D / 3D VISUAL TREATMENT
The user wants luxurious 3D-style charts. Build refined 2.5D/isometric visualization of authentic categorical numbers rather than an expensive game-like 3D scene:
- 2.5D/isometric depth on timeline-status bars/columns, tiny bevel and ambient shadow on chart geometry, subtle layering in donut rings, gentle gradient beneath time-series lines.
- Depth MUST NOT distort comparisons or axis scales. Real data magnitude remains controlled by the correct axis/angles. No exploded 3D pie with deceptive segment sizes.
- Calm hover and focus transitions (140–220 ms typical), clear tooltips, precise legends, subtle annotation labels, readable tick values, accessible summary tables or equivalent text.
- Honor prefers-reduced-motion. Supply 2D fallback and do not rely on WebGL for essential information.
- Avoid unbounded device-pixel-ratio animations, autoplay rotations, giant canvas textures, heavy GPU effects or gratuitous particles.
- Prefer any charting library already in the CURRENT repo. The older uploaded zip snapshot did not show a dedicated charting package; confirm the current checkout.
- If none is installed, use focused SVG/CSS charts for initial set; request justification before introducing a large chart/3D library. Do not bring in Three.js or echarts-gl merely for decorative depth.
- Lazy-load substantial chart code; avoid importing entire libraries into every Quote Show route.

REUSABLE COMPONENTS — ONLY REAL REUSE
Aim for a small feature, e.g. ExecutionQuotes/Analytics with core/models/params, data/api/repositories, presentation/controllers/components and a thin route wrapper only where the existing architecture requires it.
Minimal suggested components:
- ProjectIntelligenceDashboard.vue (layout)
- AnalyticsKpiCard.vue (one well-designed, reusable primitive)
- TimelineWorkStatusChart.vue
- DailyReportsActivityChart.vue
- ProcurementStatusChart.vue
- WorkRecordMixChart.vue
- StartReadinessPanel.vue
Create additional chart components only where actual code is distinct. Do not create a generic no-code chart builder, UI framework, global store, or new dynamic schema engine.
Use existing PrimeVue/shared components, spacing, colors and localized strings. Clean desktop, tablet, mobile and RTL. Avoid huge empty decorative sections.

DATA SOURCES AND THE PROPOSED AGGREGATE CONTRACT
Read the backend handoff's exact formulas, caveats, and sample proposed response. The new action name POST fetch_quote_execution_analytics is a PROPOSAL, NOT a verified backend endpoint.

Phase A — implement confirmed data-backed widgets safely NOW:
- Reuse verified source APIs and models (where current response contracts allow): show_project_configuration, fetch_project_timelines, fetch_project_timeline_stage_tasks, fetch_project_timeline_stage_reports, fetch_project_timeline_stage_meetings, fetch_purchase_requests, fetch_shop_drawing_quotes.
- Avoid generating N+1 requests for every purchase request, PO, supplier offer, receipt or timeline history merely to fill a dashboard card.
- If widgets derive values from already-loaded same-Quote results, keep the transformation simple, typed and isolated in the existing controller/repository layer. Use date and ID semantics from actual source APIs.
- The Schedule page still fetches unfiltered timelines; do not change it to START-only for dashboard counts.
- Do NOT reuse the START-only selectable Stage response for the distribution of all Timeline statuses.
- Gate context by quote_id and reject stale responses when navigating between quotes.
- Show explicit Not available for unsupported data, not fake 0. Show true zero only when successful authoritative Fetch returns an empty set.

Phase B — prepare a future aggregate integration contract:
- Create typed frontend models and params for POST fetch_quote_execution_analytics ONLY if aligned with backend acceptance or leave behind a typed proposal and documented TODO; DO NOT call an endpoint that does not exist.
- Treat its response sample as synthetic and proposed. Never use that fixture as production data or localStorage persistence.
- Once backend confirms actual route/method/schema, integrate through BaseApiService -> BaseRepository -> BaseController and switch widget data to server aggregates where beneficial.
- Do not block initial source-supported charts on the missing aggregate contract.

CHART DATA DEFINITIONS
1. Timeline Work Status: group counts by null/1 START/2 HOLD/3 STOP; chart counts must sum to ALL groups.
2. Daily Report Trend: count reports by report.date per day in chosen date period (not created_at).
3. Daily Report Safety Mix: number of reports with safety status 1 OK, 2 Observation, 3 Incident; label as reports, not unique HSE incidents.
4. Purchase Request Status Mix: pending 1, rejected 2, confirmed 3; no artificial Received status.
5. Work Record Mix: count Stage Meeting records by type 1 Meeting, 2 Issue, 3 Risk, 4 Delay; don't say open/resolved because sample has no lifecycle status.
6. Shop Drawings: drawing-record count and optional trend by created_at; do not infer approval from version/custom_number.
7. Receiving: per-request receiving status null/1/2 from authoritative aggregate when available; never sum meters + units + sheets as one physical quantity, and never conflate request and receipt statuses.
8. Supplier price comparison: only contextual drilldown for ONE selected Purchase Request; internal permission. Price is a decimal string and currency isn't supplied; don't aggregate offers into spend.
9. Tasks: total and assigned via assigned_employee; no completion rate without status.
10. Start readiness: backend verified existence of a positive same-project invoice payment, same-quote Shop Drawing, valid configuration and responsible employee; do not fake eligibility.

DATE FILTER AND METRIC CONSISTENCY
Default to 30 calendar days for event charts if acceptable to the backend; UI date options: Last 7 / 30 / 90 days + custom only if behavior is consistent. Keep activity/flow metrics filtered, and current-state counts explicitly labelled As of now. Avoid applying period to snapshot group distribution without rationale. Preserve YYYY-MM-DD date-only values and use organization's timezone when confirmed. Don't use current browser timezone to shift a report date. Each chart's legend, tooltip and table must share the same data and enums.

STATE / UX QUALITY
- Per-widget skeleton loading, error + Retry, truly empty chart, unavailable/not-permitted, and populated states.
- Last refreshed/as_of label and safe refresh. Avoid dashboard-wide blocking overlays.
- When an API fails, do not turn the chart into an empty success state.
- On Quote switch, cancel/ignore stale requests and never render another project's metrics.
- Do not auto-refresh aggressively or retry mutation endpoints.
- Use actual statuses for alerts: no started Timeline Groups, pending high-priority requests, incident-flagged reports, missing verified readiness preconditions. No invented urgency or financial risk scores.
- Make drilldowns keyboard accessible and use existing routes.
- Responsive 3-column to 2-column to stacked mobile layout; legends readable at 320px; tooltips keyboard/touch accessible; color is never the sole status indicator.
- RTL changes visual flow only, not series ordering or IDs. Use existing EN/AR translations.

API-INTEGRATION SKILL
Apply the updated skill exactly:
- Named submodels for nested response objects; nested arrays map through their submodel mappers; check base/shared models for genuine reuse first.
- Named subparams for nested request objects; parent calls child toMap(). Primitive arrays remain native.
- No any, no fabricated IDs, no unsafe blanket assertions, no component fetch calls.
- Use existing model fromJson()/fromMap(), singleton API service/repository/controller methods, DataState and type conventions.
- Respect authorization and supplier-price confidentiality. Never pass price data to a public/client-facing component.

TESTING
Add targeted tests for:
- Status separation and all-timeline fetching (not START-filtered for distribution).
- Correct distinct source model IDs and associations (quote_id vs project_id vs project_timeline_id and stage IDs).
- Chart counts/time buckets and reconciliation.
- Report safety flags count reports rather than distinct incidents.
- Task assignment status vs undefined completion status.
- Procurement status values 1/2/3 and no false received status.
- Empty successful data -> 0 vs missing/failed -> unavailable.
- Date-only filtering and organization timezone behavior as implemented.
- 2.5D depth never changes the numeric values and 2D/reduced-motion fallbacks.
- Tooltip/legend, mobile width, focus access, AR/EN, RTL, client-permission gating.
- Quote switch race/stale data protection; no N+1 API fanout.
- Readiness source separation and backend final authority.
- Regressions: Quote Show, Schedule, Work Items, Procurement, Warehouse, Site & Team.

Run the existing repo type-check, targeted tests and relevant ESLint/Stylelint; document pre-existing baseline errors separately. Do not weaken checks. Do not run live mutations without explicit permission.

BACKEND HANDOFF
Treat BuildHub_Project_Analytics_Backend_Handoff_v1.0.md as the formal handoff proposal. Reconcile it with current source APIs, and output a concise BACKEND_ANALYTICS_GAPS.md documenting only confirmed gaps: aggregate endpoint availability, exact response schema, date grouping, permission scopes, readiness-boolean API, receipt/PO aggregate feasibility, and progress/revenue decisions. Do not claim new APIs are implemented or validated.

FINAL REPORT
State exactly:
- Which dashboard panels are data-backed NOW and which are placeholders awaiting aggregate API.
- Which source APIs were reused and any new params/models/repos.
- Which 2.5D chart techniques were used, accessibility/performance approach, and why.
- Files created/modified and routes added.
- Real test commands/results and outstanding failures.
- Backend contract questions still needed.
- Whether any live backend reads/mutations were executed.

Implement the source-supported frontend dashboard now, preserving existing BuildHub modules. Do not stop at a generic plan, do not invent metrics, and do not commit or push without permission.
```
