---
version: 1
slug: 'ntation-components-executionquoteshow-vue-792019ec'
primary_target: 'src/modules/MainOrganization/ExecutionQuotes/presentation/components/ExecutionQuoteShow.vue'
related_targets:
  [
    'src/modules/MainOrganization/ExecutionQuotes/Schedule/presentation/components/SchedulePage.vue',
    'src/modules/MainOrganization/ExecutionQuotes/SiteTeam/presentation/components/SiteTeamPage.vue',
  ]
---

## Direction contract

THESIS: Quote Show is the project app launcher. Active apps lead; existing commercial and project details remain in a native collapsed disclosure.

OWN-WORLD: Inherit BuildHub's current ink, copper primary, pale canvas, white surfaces, existing fonts and controls. Architectural geometry distinguishes Schedule from Site & Team without introducing a new global theme.

STORY: Identify the current project, choose Schedule or Site & Team, and move between apps without losing Quote ownership. Only real modules and available metrics appear.

FIRST VIEWPORT: Compact project identity, two illustrated app links in a fluid grid, then a collapsed project-details summary. Modules use a shared app navigation strip above their existing task controls.

FORM: User-pinned app-launcher composition; existing-world extension. No concept seed required for the specified app grid. Code-led implementation.

MOTION: Timeline/floor line tracing acknowledges focused or hovered app selection; controls retain immediate feedback, and reduced motion removes tracing and spatial effects.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Project-details refinement

Mode: Operate. Scope: the existing `workspace-project-details` disclosure in the primary target. This precise local Bolder extension inherits the incumbent ink, copper, warm paper, fonts, translations, controls, and layout; it does not require a concept roll or new system tokens. Earlier launcher direction above remains historical context outside this refinement.

THESIS: Give the collapsed project-details control a clear visual anchor and make expanded project and client information easier to scan.

OWN-WORLD: Use the existing quote ink for the summary, white text, and existing copper tokens for the framed file icon, chevron, and focus outline. Keep the established type family. The summary and section headings use 1.25rem text, reducing to 1.1rem at 640px and below.

STORY: Open the native disclosure, read creation/type metadata, then scan existing project and client values. Data bindings, financial sections, and task controls retain their behavior.

FIRST VIEWPORT: The disclosure starts collapsed. Its ink summary contains a copper-framed decorative file icon, translated title, and expansion chevron. Expanded metadata has a bottom rule; project/client field rows use separators instead of faint nested tiles. Stronger headings and ink values establish hierarchy.

FORM: Keep native `details`/`summary` semantics and visible keyboard focus. Inside this disclosure only, detail cards align content to the start and remove shadows and hover lift. Preserve existing mobile single-column behavior and logical margins for RTL. Reduced motion disables summary and chevron transitions.

## Project-details verification

- Independent finish review: **ship**, with all five contract sections complete and no material visual fixes requested. The reviewer viewed all six captures; the bounded two-round finish process is complete.
- Visual evidence: [collapsed desktop](../review/project-details/collapsed-desktop.png), [expanded desktop](../review/project-details/expanded-desktop.png), [collapsed mobile](../review/project-details/collapsed-mobile.png), [expanded mobile](../review/project-details/expanded-mobile.png), [collapsed Arabic](../review/project-details/collapsed-arabic.png), and [expanded Arabic](../review/project-details/expanded-arabic.png). These are review captures, not product image assets.
- Browser evidence: `/tmp/project-details-browser-final.log` records initially collapsed disclosures, successful keyboard toggling, visible focus, no overflow, and no browser errors for desktop, mobile, and Arabic fixture previews. Previews use mocked data; displayed financial values are fixture values and do not establish live backend behavior.
- Validation: `npm run type-check`, focused ESLint, and focused Stylelint passed. Focused tests had seven failures and three passes before the refinement; the subsequent run retained the same seven failures and added a passing Skeleton test, for four passes. Evidence: `/tmp/project-details-baseline-tests.log`, `/tmp/project-details-tests.log`, `/tmp/project-details-types.log`, `/tmp/project-details-lint-final.log`, and `/tmp/project-details-style-final.log`. The focused test suite remains failing; these results do not claim a green suite.
- Boundary: no palette or font-family changes, new tokens, root design-document changes, or unrelated source repairs belong to this pass. The user's existing stages-accordion `mt-2` and status-history edits remain outside its ownership. `/tmp/project-details-detect.json` records ten advisory font-size findings, largely inherited sizes plus the local 1.1rem mobile treatment. These do not establish new global type tokens and are not grounds for unrelated repairs.
