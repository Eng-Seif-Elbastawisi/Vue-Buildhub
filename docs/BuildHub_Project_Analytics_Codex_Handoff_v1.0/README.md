# BuildHub Project Intelligence — Codex Handoff Bundle

This bundle is intended to be extracted under your CURRENT Codex worktree as `docs/project-analytics/`. Check `pwd` and `git worktree list`; do not assume the normal repo and Codex detached worktree are the same.

- `BuildHub_Project_Analytics_Codex_Prompt_v1.0.md` — read and execute this prompt after reviewing the current source.
- `BuildHub_Project_Analytics_Backend_Handoff_v1.0.md` — proposed backend analytics contract.
- `BuildHub_Project_Analytics_Metric_Catalog_v1.0.json` — machine-readable KPI/chart catalogue.
- `reference-images/` — the 3 user-provided dashboard inspiration images.
- `backend-sources/` — selected historical source handoffs; current verified backend APIs/code take priority.

**IMPORTANT:** `fetch_quote_execution_analytics` is PROPOSED only, not an existing API. Any numeric values in the synthetic contract response are illustrative, not real dashboard data. Codex should implement source-supported panels now and mark unsupported analytics Unavailable pending backend agreement.

**Commands:** `mkdir -p docs/project-analytics && unzip -n "$HOME/Downloads/BuildHub_Project_Analytics_Codex_Handoff_v1.0.zip" -d docs/project-analytics/` (from the correct repo root). Then confirm `ls docs/project-analytics/`.

Do not copy or publish the illustrations as app images; they are visual inspiration only.
