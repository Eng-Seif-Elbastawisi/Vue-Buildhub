---
version: 1
slug: 'shared-index-page-header'
primary_target: 'src/shared/IndexPageHeader/IndexPageHeader.vue'
related_targets: []
---

# Shared index page header

Mode: Operate. Bolder contrast within the existing BuildHub component, palette and fonts. This is an ordinary local extension; root DESIGN.md and its sidecar remain the incumbent system record.

## Direction contract

THESIS: Give list-page identity and actions a decisive ink band, followed by a quiet, readable control surface. The user's visual-inspiration request amplifies the existing component's contrast.

OWN-WORLD: BuildHub quote ink, graphite supporting text, copper icon frame and dark-copper primary action; white bordered toolbar and existing rounded controls. Retain the established font registrations and route-resolved PageHeaderIcon.

STORY: Recognize the current list, read its context, search or filter existing records, and invoke its existing actions. Keep title/subtitle props and all named slots, route resolution and caller-owned behavior intact.

FIRST VIEWPORT: A white Bold title and graphite-muted subtitle occupy the leading side of the ink heading; actions sit opposite. Search and filters occupy the attached flat white toolbar. On narrow screens actions follow identity and controls use the available width; logical spacing supports RTL.

FORM: Code-led refinement of the existing component. No new visual world, primitives, concept selection or image comp. Scope cascade overrides to this header; selected filter labels alias the legacy primary token to dark copper without adding an important declaration.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implementation and evidence

The component uses existing shell tokens with legacy fallbacks. Its stronger selectors keep the ink heading, white title and flat toolbar readable against existing global rules. Dark copper supports white primary-action text and selected filter labels on white; secondary actions and links receive visible keyboard outlines. The selected-label token alias is local to non-placeholder PrimeVue select and multiselect labels because installed global color declarations use important precedence. Existing search-control important declarations remain; this refinement adds none.

Six captures under `.impeccable/review/index-page-header/` cover `desktop.png`, `mobile.png`, `arabic.png`, `project.png`, `compact.png` and `breadcrumb.png`. They render the actual component with installed CSS in a standalone header harness: the project fixture supplies an ancestor class, compact supplies actions only, and breadcrumb supplies a slot. They are not full routed-page or live-API evidence.

The delivery browser log records no horizontal overflow or runtime errors in all six fixtures, search input retaining Ahmed, and one Refresh callback after native keyboard activation. The focused suite passed 18 tests across three files; type-check, focused ESLint and Stylelint passed. These checks support component compatibility, not end-to-end verification of every consuming module.

## Finish review

The first full review returned **fix**: other fidelity rows were Match or Adaptation, while selected filter text was Contradicted. The small Active label used legacy copper on white at 3.40:1, below the 4.5:1 text threshold. Its single material fix was to use dark copper or ink locally, preserving shared selectors and avoiding global changes or new important declarations.

The final review returned **ship**, scoped to that contrast correction: **Resolved**. Selected labels visibly use dark copper (`#854725`) on white in desktop, mobile, Arabic, project and breadcrumb captures, exceeding 4.5:1. The reviewer found no visible regressions from this fix and marked remaining findings **Clear**. This is the final fix review, not a new full-surface score; no numeric design-quality scores were supplied.

No new bitmap assets or global theme changes were introduced. The inherited 1.7rem desktop and 1.45rem mobile title sizes produce two advisory DESIGN.md ramp findings. They remain local component values; this extension neither repairs that drift nor promotes those sizes into the global system.

## Theme integration correction

The subsequent user correction supersedes the fixed ink/copper treatment above: header surfaces now read `--SecondaryColor`, with readable text supplied by `--secondary-text-color` from the existing System Identity theme utility. Primary actions use `--PrimaryColor` and the existing `--button-primary-color`; icon accents and focus treatments derive from primary. Selected filter text uses a secondary/neutral blend without redefining the inherited primary token. Component structure and route behavior remain unchanged.

Verification: 46 focused tests passed across seven files, including two new secondary-foreground cases. Root type-check, focused ESLint and Stylelint passed. A standalone browser fixture verified blue/dark and green/light palettes on desktop, mobile and Arabic RTL, with no overflow or runtime errors. The fixture includes both headers, AnimatedBreadcrumb and SidebarNavigation; it does not establish live API behavior. Earlier captures document the previous palette, not this correction.
