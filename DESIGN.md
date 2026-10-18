---
name: BuildHub application workspace
description: A bilingual operational workspace with layered cool surfaces and contextual navigation.
colors:
  primary: '#10141a'
  primary-hover: '#354052'
  periwinkle: '#83a2db'
  blue-ink: '#365b96'
  blue-soft: '#e3ebf9'
  coral: '#ce6969'
  coral-ink: '#a23d45'
  coral-soft: '#fae8e9'
  green-ink: '#28664f'
  green-soft: '#e2f0e8'
  amber-ink: '#805b20'
  amber-soft: '#f7edd8'
  canvas: '#e8edf5'
  surface: '#f8fafd'
  surface-raised: '#fff'
  surface-secondary: '#dfe7f3'
  muted: '#5d6879'
  line: '#d3dce8'
  field-line: '#b8c5d6'
  hover: '#e0e7f1'
  focus: '#4169a9'
  dark-canvas: '#171e29'
  dark-surface: '#202a38'
  dark-surface-raised: '#283444'
  dark-surface-secondary: '#2e3c50'
  dark-text: '#edf2fa'
  dark-muted: '#b6c2d4'
  dark-line: '#3c4a5f'
  dark-field-line: '#63738c'
  dark-active: '#e5edfa'
  dark-hover: '#344358'
  dark-blue-ink: '#b4ccfa'
  dark-blue-soft: '#2a3d5a'
  dark-coral-ink: '#ffb5ba'
  dark-coral-soft: '#4e303c'
  dark-green-ink: '#a0d7bb'
  dark-green-soft: '#294438'
  dark-amber-ink: '#ebcd91'
  dark-amber-soft: '#483e29'
  dark-focus: '#a3c4fc'
typography:
  page:
    fontFamily: 'Lufga, Medium, Segoe UI, sans-serif'
    fontSize: 'clamp(1.5rem, 2.2vw, 2rem)'
  title:
    fontFamily: 'Lufga, Medium, Segoe UI, sans-serif'
    fontSize: '1.125rem'
  body:
    fontFamily: 'Lufga, Medium, Segoe UI, sans-serif'
    fontSize: '1rem'
  label:
    fontFamily: 'Lufga, Medium, Segoe UI, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 500
  small:
    fontFamily: 'Lufga, Medium, Segoe UI, sans-serif'
    fontSize: '0.75rem'
rounded:
  sm: '8px'
  control: '12px'
  card: '24px'
  panel: '32px'
  pill: '999px'
spacing:
  '1': '0.25rem'
  '2': '0.5rem'
  '3': '0.75rem'
  '4': '1rem'
  '5': '1.25rem'
  '6': '1.5rem'
  '8': '2rem'
  '10': '2.5rem'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.surface-raised}'
    rounded: '{rounded.pill}'
    height: '44px'
    padding: '0 24px'
  button-primary-hover:
    backgroundColor: '{colors.primary-hover}'
    textColor: '{colors.surface-raised}'
  button-secondary:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.primary-hover}'
    rounded: '{rounded.pill}'
    height: '44px'
  input:
    backgroundColor: '{colors.surface-raised}'
    textColor: '{colors.primary}'
    rounded: '{rounded.control}'
    typography: '{typography.label}'
  navigation-active:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.surface-raised}'
    rounded: '{rounded.pill}'
    padding: '8px 18px'
  badge:
    backgroundColor: '{colors.blue-soft}'
    textColor: '{colors.blue-ink}'
    rounded: '{rounded.pill}'
    padding: '2px 7px'
  card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.primary}'
    rounded: '{rounded.card}'
---

# Design System: BuildHub application workspace

## Overview

**Creative North Star: "The Contextual Workspace"**

BuildHub adapts the user-pinned RonDesignLab Customer Journey CRM reference into an application-wide operational workspace. A slim icon rail identifies global sections; horizontal pills expose their contextual destinations. Cool blue-gray canvas, near-white surfaces, dark ink, periwinkle accents and restrained coral feedback establish the shared visual language.

This record replaces the former scoped warm copper identity. The direction contract is [DIRECTION.md](docs/redesign/DIRECTION.md). Palette values are approximate adaptations from supplied raster references, not original Figma tokens. Existing BuildHub branding, customer palette controls and bilingual local fonts remain authoritative.

**Key Characteristics:**

- Separate global selection from contextual navigation.
- Use rounded modular surfaces with tonal depth.
- Keep operational records, forms and tables readable in English and Arabic.
- Use short state feedback and respect reduced motion.

The token-bearing implementation is documented here; this is not whole-application approval. Isolated browser fixtures and offline captures do not establish live backend or permission acceptance. Existing full-suite and build gate failures remain outside this document’s verification; [AUDIT.md](docs/redesign/AUDIT.md) records the migration’s evidence boundaries. Screenshots under `docs/redesign/screenshots` are review artifacts using isolated browser profiles and synthetic fixtures where populated data is shown. No new production raster asset was added; supplied screenshots are visual references.

## Colors

### Primary

Dark ink is the default brand primary and active navigation fill. Slate is its brand hover companion. System Identity owns `--PrimaryColor`, `--SecondaryColor`, derived alpha values and readable button text. Its default accent is periwinkle; saved customer palettes and logos continue to apply. Fixed workspace semantic tokens are separate from those customer branding variables.

### Secondary

Periwinkle and blue ink/soft pairs identify supporting icons, selected records and contextual emphasis. Coral ink/soft pairs express errors and destructive feedback. Green and amber pairs preserve success and warning meaning. Existing semantic action colors remain in the action stylesheet; do not collapse every action into the brand primary.

### Neutral

Canvas frames surface and raised-surface layers; secondary surface groups related cards. Muted ink supports labels, line defines separators, and field-line keeps controls distinguishable. Hover and focus are explicit semantic colors.

**The Palette Ownership Rule.** Keep customer branding variables configurable; use workspace semantic tokens for shared surfaces, text, focus and status feedback.

`src/styles/workspace-tokens.scss` defines the light primitives in frontmatter and the `.dark` semantic overrides recorded there. Dark mode changes surfaces, text, field boundaries, active navigation and status pairs; it does not replace the saved brand palette. The persisted theme store toggles `.dark` on the document root. PrimeVue uses the same selector and semantic variable references in both schemes. Dark token support is implemented; complete populated-route dark-mode acceptance remains unverified.

Source order matters: `src/main.ts` imports `main.scss`, `standard-crud-form.scss`, `construction-states.scss`, `workspace-tokens.scss`, then `workspace-components.scss`. The active authored entry is `main.scss`; retained generated CSS files are not that entry. Legacy gray, quote, table and standard-form token names bridge into workspace semantics. Historical `copper` names in those aliases no longer establish a copper visual requirement.

## Typography

The Latin face is **Lufga**, supplied in `src/assets/fonts/lufga_fonts`. `src/styles/_fonts.scss` bundles the OpenType files at weights 100–900 in upright and italic styles, using `font-display: swap`. The shared stack is `Lufga`, local URW DIN Arabic Medium (registered as `Medium`), Segoe UI, then sans-serif. Legacy `Thin`, `Light`, `Medium`, `Demi` and `Bold` families map Latin glyphs to the corresponding Lufga files through Unicode ranges; their existing DIN Arabic faces remain available for Arabic glyphs. This preserves older module font declarations without changing module behavior. Chromium verified actual bundled Lufga rendering for Regular, Medium, SemiBold, Bold, Italic and the legacy Medium alias, plus DIN Arabic fallback; see [font verification](docs/redesign/font-verification.json).

Page headings use the fluid page role. Section titles use the title role; body, labels and small table headings use the recorded scale. Dialog titles use the existing extra-large step (1.375rem); dashboard count values retain a larger local treatment. Auth introduction headings have their own fluid size. These are local compositions, not additional mandatory global type roles.

Tables, times and monetary values use tabular numerals. Shared shell and auth text suppress automatic title casing so translated strings retain their intended form; legacy global capitalization still exists elsewhere. Keep English and Arabic keys paired and do not rely on CSS casing to edit copy.

## Layout

The desktop shell uses an icon rail (80px), fixed search/account row (78px), and scrollable contextual strip (60px). Rail controls are 48px; contextual links are at least 40px high. The desktop rail stays compact: its group buttons only select the horizontal contextual destinations, with no expansion toggle or duplicate sidebar module links. The main content area is fluid, capped at 1600px, with a content inset of `clamp(1rem, 2.2vw, 2rem)`.

Desktop content reserves the combined header and contextual-strip height before the breadcrumb row. The strip has a fixed 60px border-box height; the breadcrumb keeps a separate 14px top inset. Contextual links accept pointer events independently of the fixed rail container.

At 1023px and below, the existing mobile topbar and drawer replace desktop navigation; content loses its rail offset and receives a 1rem inline inset. The drawer keeps its existing focus and Escape behavior. Contextual destinations and module directories retain existing role filtering and disabled entries.

Forms may use the centered 1180px form wrapper. Shared form headers and field regions use 24px padding; at 680px and below, these regions use 20px vertical and 16px inline padding. Shared action rows stack at that breakpoint. Existing standard CRUD field grids also retain their narrower-screen rules; inspect the owning form before assuming all fields share one grid.

Home retains existing counts and a role-filtered module directory. Its directory becomes two columns at 1100px and one at 680px; count cards use two columns on small screens. Auth pairs introduction and form panels, stacking at 800px. Tables scroll inside their own regions rather than requiring the page to widen.

Logical insets, margins, padding, borders and start alignment support RTL. Home link arrows mirror for RTL. Preserve existing direction-aware schedule and app navigation behavior. Responsive module-specific breakpoints coexist with these shared values.

## Elevation & Depth

Tonal layers and whitespace provide the default depth: shared cards, tables, form cards and project heroes remove resting shadows. Popovers and dialogs remain lifted so teleported interactions are legible above the shell. The exact popover and dialog shadows are carried in the sidecar from `workspace-tokens.scss`; overlay masks also have light and dark values. Some established action hover treatments retain local shadows.

**The Tonal Surface Rule.** Group persistent working content with surface tone and spacing; reserve the shared elevation tokens for overlays.

State feedback uses the fast duration (140ms). Existing local animations can remain. Global reduced-motion rules reduce animation and transition duration to 0.01ms, limit iterations and remove smooth scrolling; shell and targeted module rules additionally remove spatial transitions.

## Shapes

Controls use gently rounded corners, cards use broad rounded corners, and grouped panels use the largest shared radius. Pills distinguish compact actions and navigation; circular icon markers support headings and counts. Fine field borders and table separators are functional structure. Shared cards do not require ornamental outlines.

The frontmatter records the workspace scale. Content controls use the shared 12px radius. Native module controls explicitly opt into `workspace-control`; obsolete global PrimeVue internals and the legacy CRUD control overrides have been removed. Compact table controls may use a 36px minimum height while ordinary fields use 44px.

## Components

### Buttons

Primary actions use customer primary fill and computed readable text, switching to customer secondary fill and its readable text on hover. Standard CRUD actions are 44px high with pill corners. General `.btn` controls have a 42px minimum and 10px by 20px padding; small and large variants retain their existing sizes. Secondary form actions use the surface with secondary ink and boundary, then fill on hover. Press feedback moves an enabled control down 1px. Disabled controls retain existing opacity and cursor behavior.

### Inputs / Fields

Use existing input wrappers, UpdatedCustomInputSelect, FieldHelpIcon and field groups. Shared native and PrimeVue controls use raised surfaces, field-line borders and a 44px minimum. Focus uses a visible two-pixel semantic outline; invalid fields use coral ink and disabled fields use secondary surfaces. Existing validation messages and component APIs remain with their owners.

### Cards / Containers

Shared cards use the card radius and surface fill. Forms use `StandardFormLayout` while preserving caller-owned headers, field sections and actions. Listing toolbars, tables and pagination are separate rounded surfaces. Table headers use small muted text; rows retain separators, hover tone and a blue-soft selected state. Data behavior stays with the existing components.

### Navigation

The icon rail and horizontal contextual pills share active ink/on-active treatment, hover tone and visible focus. The mobile drawer retains the existing route definitions and access filtering. The reference supplies the hierarchy, not new route destinations or permissions.

### Chips

Navigation badges use blue-soft with blue ink, pill corners and compact padding. Status indicators retain semantic coral, green and amber meaning and existing text labels; color alone must not replace the label.

### Overlays

The Aura-derived `src/styles/primevue/systemIdentityPreset.ts` uses supported PrimeVue 4 semantic form-field, content, overlay, focus and color-scheme tokens. Body-level styles cover teleported Select, MultiSelect, DatePicker, Menu, Popover, Dialog, Drawer and Tooltip surfaces. Dialogs constrain their width and height to the viewport; the configured modal stacking layer clears the desktop rail. Keep existing interaction and validation ownership.

### Project and execution workspaces

Project details use a secondary-surface hero, surface cards, pill actions and a raised actions popover. Execution listings reuse surface filters and tables. Schedule groups sit inside broad secondary-surface panels, with surface task cards and periwinkle hover boundaries. Thin links between adjacent board cards express saved schedule order only; they disappear at 768px and below. They do not establish a dependency model or a new workflow. Existing quote disclosures, procurement controls and Site & Team content retain their business owners while legacy palette aliases adopt workspace colors.

## Do's and Don'ts

- **Do** use semantic workspace tokens and existing shared controls for new surfaces.
- **Do** preserve saved customer palettes, BuildHub branding and the local bilingual fonts.
- **Do** keep translated labels, logical spacing, visible focus and reduced-motion behavior.
- **Do** connect navigation, summaries and schedules to their existing routes and real data owners.
- **Do** inspect final matching declarations when a legacy module overrides a shared primitive.

- **Don't** restore the obsolete scoped copper identity as the application default.
- **Don't** promote one page composition into a mandatory layout for every module.
- **Don't** invent customer records, metrics, dependencies or approval states to fill a visual.
- **Don't** describe fixture screenshots or source inspection as full live acceptance.

## Unified form and content contracts

`src/shared/components/form/StandardFormLayout.vue` is the single reusable form layout. It renders the same native root via `as="div|section|main|form"`. Existing class attributes and native events fall through to that root. Default-slot content remains direct children, so dynamic fields and owner-specific structure retain their bindings. There is no submission, fetching, validation, routing or permission logic in this component.

- `mode="create|edit|show"` annotates presentation. Show mode does not convert values into inputs or disable caller-owned controls.
- `title` and optional `description`, or the `header` slot, provide an optional header. Existing module headers can remain in the default slot.
- `columns` accepts 1, 2 or 3 (for example, `:columns="2"`) sets the direct `.form-fields` grid. Three columns reduce to two at 1024px; grids reduce to one at 680px. Full-row fields use `full-row`, `full-width` or the existing span classes. Specialized timeline, invoice and repeater grids retain their owners.
- The optional `actions` slot supplies the shared footer. Seventy page owners now provide their existing actions through this slot. Specialized workflow docks and child-owned invoice actions retain their existing placement. Existing `.actions`, `.form-actions`, `.form-footer` and `.form-action-pair` markup also uses the compatibility stylesheet.
- `loading` sets `aria-busy` and exposes the optional `loading` slot. `disabled` sets `aria-disabled`. Both are presentation metadata: modules must keep binding actual disabled controls and submission guards themselves.
- `embedded` removes the extra card surface for dialog forms and nested layouts. Nested instances also share their parent's surface.

`src/styles/standard-crud-form.scss` is now a compatibility layer for thin page owners, existing field span classes, headers and action rows. It no longer manufactures large header icons or sets competing control dimensions. `workspace-components.scss` owns the layout, controls and states. Native module fields carry `workspace-control`; native tables carry `workspace-data-table`, and their existing scroll wrappers carry `workspace-table-scroll`.

Existing `UpdatedCustomInputSelect` keeps object-valued selections, select-all, lookup controllers and lookup pagination. Direct native selects that already bind enum/string values retain those contracts and receive the same native control treatment. PrimeVue DatePicker keeps its existing date models. No unused alternate input component was introduced.

`AppTable` retains columns, scoped slots, selection, sorting, reordering and existing events. `Pagination` retains server-owned page state and events; page and page-size controls are native buttons. Sorting is not automatically wired to an endpoint by this visual migration. Native operational tables keep their own columns and calculations and scroll inside their existing wrappers.

PrimeVue dialogs receive `workspace-dialog` and keep their visibility/close/focus contracts. Small and large size classes are available without overriding caller-supplied widths. Custom invoice and subscription dialogs keep their existing lifecycle and teleported overlays, with shared surface tokens. Existing delete confirmation phases use compact PrimeIcons in place of the large scene; confirmation and pending/error/success logic remain unchanged. File upload inputs remain native and focusable with a visible focus treatment on their labels.

The content migration and verification status is recorded in [MIGRATION.md](docs/redesign/MIGRATION.md). Source review and isolated component/network fixtures are distinguished from populated live acceptance.

Rich text fields retain Quill and its existing formatting/model bindings. Toolbar, editor and picker surfaces use workspace text, field-line, raised-surface and focus/accent tokens; no new editor implementation was introduced.

### Sharper list headings and shared module actions

`IndexPageHeader` uses the shared page type scale, a tighter 1.2 title line-height, and a 44px icon on a 12px corner radius. The current user-requested glass panel has a 24px radius, 24px desktop padding and a 112px minimum desktop height; mobile uses 20px block/16px inline padding with actions following the identity. Search text inherits the Lufga workspace stack. Props, slots and caller-owned actions remain unchanged.

`workspace-components.scss` owns button geometry and variants for `.btn`, legacy `.btn-add`, `.project-action-btn`, `.invoice-show-btn` and their icon controls inside workspace content and dialogs. Default actions are 44px pills, compact buttons remain 34px, large buttons 48px, and dense table actions 36px rounded controls. Primary actions use the existing System Identity primary/foreground pair; secondary actions use workspace surface/text/field-line tokens. Ghost and outline primary variants retain their separate behavior, and semantic action tones remain available. Existing invoice/project control names share this presentation without replacing their event or routing contracts. Execution Quotes no longer sets its default primary action to the blue support accent.

Evidence and limitations: [heading/button verification](docs/redesign/heading-button-verification.json) covers nine offline routed listing scenes and two isolated detail/button fixtures. Screenshots are browser captures in `docs/redesign/heading-button-screenshots`; they contain no generated artwork. The invoice fixture mounts the actual InvoiceShowHeader and AppButton components; project detail samples validate CSS classes only. This does not establish live populated project/invoice detail acceptance.

### Frosted workspace heading surfaces

The user-requested glass treatment extends the existing workspace palette. `workspace-tokens.scss` defines `--bh-glass-fill` (82% workspace surface), `--bh-glass-tint` (48% blue-soft), `--bh-glass-border` (72% raised surface mixed with field-line), `--bh-glass-background` (a restrained tint wash over the translucent fill), and `--bh-glass-blur` (18px). These derive from semantic colors and follow the existing dark theme. Text does not inherit opacity.

`_workspace-glass.scss` contains one shared `surface` mixin, used by IndexPageHeader, supporting button variants, the invoice detail hero, the execution quote detail hero and the project detail hero. It supplies an opaque base surface, enables the translucent background and blur/saturation under `@supports`, and restores an opaque surface with no blur for `prefers-reduced-transparency: reduce`. Supporting controls keep a stronger field-line edge; primary actions keep the existing primary/foreground palette pair with a fine inset reflection. No shell, route, data, visibility or event behavior changed.

Current evidence: [glass heading verification](docs/redesign/glass-heading-verification.json), [reduced-transparency verification](docs/redesign/glass-fallback-verification.json), and browser captures in `docs/redesign/glass-heading-screenshots`. These supersede the previous flat heading captures for this presentation. Nine offline listing scenes cover the three modules at desktop/tablet/mobile, including Arabic/dark; the invoice detail fixture mounts its real header, while project action samples check CSS only. Full populated project and execution detail workflows remain outside the evidence.

### Shared feature/page-intro header parity

`FeatureHeader.vue` applies the same glass mixin to `.feature-header-container.page-header--animated`, including its page-intro and entity variants. A component-owned selector keeps older shell/CRUD compatibility rules from flattening the surface. It uses 112px minimum desktop height, 24px padding/radius, the shared page title scale at weight 700/line-height 1.2, and a 44px icon with control-radius corners. At 767px and below it stacks actions, removes the minimum height and uses 20px block/16px inline padding. Existing route titles, descriptions, icons, slots and visibility behavior remain.

The execution quote hero also retains the glass surface with matching title scale, mobile padding, muted metadata labels and normal text values. Secondary source badges use the existing blue ink/soft pair; the leading badge retains the primary palette. The original route template, API mapping and displayed fields are unchanged. See [feature-header evidence](docs/redesign/feature-header-verification.json) and [quote-hero fixture evidence](docs/redesign/quote-hero-verification.json). Actual routed quote rendering was checked with synthetic API data; it does not prove live backend acceptance.

### Procurement and Warehouse workspace intros

`_workspace-intro.scss` is the single owner of `.procurement-header.procurement-intro`, `.procurement-intro-copy` and the intro back link. Procurement and both project Warehouse pages import it; Warehouse no longer carries a separate intro implementation. The existing Procurement surface uses workspace colors, 24px corners, 28px/32px desktop padding and 24px mobile padding, with responsive primary actions. Receipt-page identity is translated with the existing `material_receipt.warehouse` key; Material Receipt remains the receiving tab and breadcrumb context. Material Disbursement keeps its feature title.

The dashboard hides its automatic FeatureHeader when the page provides this intro, following the existing own-header rule for index pages. Project navigation, Warehouse tabs, back links and action bindings remain intact. See [Warehouse intro verification](docs/redesign/warehouse-intro-verification.json); browser checks use empty API fixtures, not live CRUD data.
