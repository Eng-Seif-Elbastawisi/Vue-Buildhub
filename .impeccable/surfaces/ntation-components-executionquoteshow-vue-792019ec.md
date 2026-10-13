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

## Quote-hero refinement

Mode: Operate. Scope: `execution-quote-show__hero` and the shared `PageHeaderIcon` import in the primary target. This precise local Bolder extension increases contrast within BuildHub's incumbent world. It introduces no concepts, component system, or image assets; earlier launcher and project-details directions remain outside this refinement.

THESIS: Make the project title the first and strongest hero content, then identify the quote and its client and organization before the existing app launcher.

OWN-WORLD: Inherit the ink surface (`#272a2b`), copper accents, white text, existing font family, and existing translated labels. Use root-qualified hero selectors to preserve white title and party values and copper-light labels against global color rules, without `!important`. The project title uses 2.5rem desktop text and 1.75rem at 640px and below; these are local hierarchy decisions, not additions to the global type ramp.

STORY: Read the project title, existing quote classification and source badges, then existing client and organization values in a labelled definition list. Continue to the same three apps and project-details disclosure below. Existing data bindings and translated project-title fallback remain in use.

FIRST VIEWPORT: A flat bordered ink hero places the white project title first, constrained to 24ch with balanced wrapping. Existing badges sit below it; party labels use copper-light text and values use white. On desktop, the existing `PageHeaderIcon` with `kind="project"` supplies an aria-hidden decorative mark in a 104px bordered frame with an 84px inner span.

FORM: Keep the hero free of shadows and hover lift. Party fields use two columns on desktop and one column at 640px and below, where the decorative mark is hidden and hero padding reduces from 2rem to 1.25rem. Preserve wrapping, logical spacing, and RTL behavior. Restrict source changes to the hero and its icon import; the three apps, project-details disclosure, and prior uncommitted header work retain their ownership.

## Quote-hero verification

- Independent finish review: **ship** at the narrow hero scope, with all five contract sections valid and no requested fixes. The root agent and reviewer viewed all five captures.
- Visual evidence: [desktop](../review/quote-hero/desktop.png), [mobile](../review/quote-hero/mobile.png), [Arabic](../review/quote-hero/arabic.png), [long project title on mobile](../review/quote-hero/long-mobile.png), and [missing project title on mobile](../review/quote-hero/missing-mobile.png). Desktop uses a 1440px viewport and mobile uses 390px. These are review captures, not product image assets.
- Browser evidence: `/tmp/quote-hero-browser-final.log` records no overflow or browser errors and three apps in all five mocked fixture previews. Computed hero background is `rgb(39, 42, 43)`; the title and party values are white, and party labels are `rgb(244, 196, 159)`. The missing-title fixture still contains client and organization values; it verifies the translated project-title fallback only, not missing party-value rendering. No live API behavior is established by these fixtures.
- Validation: `npm run type-check`, focused ESLint, and focused Stylelint passed, with evidence in `/tmp/quote-hero-types.log`, `/tmp/quote-hero-lint-final.log`, and `/tmp/quote-hero-style-final.log`. `/tmp/quote-hero-tests.log` records four passing and seven failing tests out of eleven; the seven failures match `/tmp/project-details-baseline-tests.log`, with no additional failing cases. The focused suite remains failing.
- Boundary and drift: the implementation adds no API, model, controller, or dependency changes. No live API calls or commits were made for verification. `/tmp/quote-hero-detect.json` contains eleven advisory font-size findings and zero primary findings, covering inherited sizes and the local hero hierarchy. These are not canonized as global tokens or repaired outside this scope. Root `DESIGN.md`, `PRODUCT.md`, and the design sidecar remain unchanged; prior uncommitted `IndexPageHeader` work is preserved.

## Quote hero theme correction

The user's subsequent theme request supersedes the fixed ink/copper hero palette: the hero uses `--SecondaryColor` with `--secondary-text-color`, while badge backgrounds and borders use primary and its readable button foreground. Party labels and the decorative icon use a primary/foreground blend. The Execution Quotes index masthead follows the same surface/foreground pair, with primary-derived actions, filter accents and popup accents. Its owning stylesheet is `execution-quote-pilot.scss`; the routed index view remains a thin wrapper. An explicit bounded grid column contains loading-table width on mobile.

Browser fixtures verified blue/dark and green/light palettes on desktop and Arabic mobile, with no horizontal overflow in the final check. These captures verify theme rendering, not live API behavior. Type-check, focused ESLint and Stylelint passed. The focused component tests recorded seven passes and seventeen failures: ten index failures reproduced with the original stylesheet, and seven Quote Show failures matched the previously recorded baseline. Earlier hero captures and review describe the previous palette.

## Shared index header integration

ExecutionQuoteIndex now renders `src/shared/IndexPageHeader/IndexPageHeader.vue` with the existing translated title and subtitle and New Quote action slot. The separate masthead markup and its unused rules were removed from `execution-quote-pilot.scss`. Desktop and Arabic-mobile fixtures retained both tested palettes without overflow. The focused shared-header/navigation test passed; the broader index/header run retained ten baseline index failures and seven passes. Type-check and focused lint/style checks passed.

## Execution Quotes submodule theme alignment

The subsequent module-wide theme request aligns Schedule summaries and accents, Site & Team headings, Work Items disclosures, selected activity filters and attachment-gallery toolbar, and the shared app launcher/navigation with primary and secondary identity tokens. Secondary surfaces use the existing readable secondary foreground; headings on paper use a secondary/neutral blend. Primary accents use the active primary token and its light companion. Workflow and safety status colors retain their semantic meaning. No endpoint, controller or model behavior changed.

Sixteen mocked browser cases covered the launcher, Schedule, Site & Team and Work Items with blue/dark and green/light palettes on desktop and Arabic mobile. The final cases had no horizontal overflow or JavaScript runtime errors. Focused type, ESLint and Stylelint checks passed. Component tests recorded 43 passes and 19 failures; restoring the original affected source files reproduced all failure cases and failed suites, with no added failures. These checks establish frontend behavior only; no live backend calls or mutations were made.
