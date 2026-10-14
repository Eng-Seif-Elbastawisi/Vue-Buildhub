---
name: BuildHub project workspace
description: Incumbent visual identity for Quote Show, Schedule, and Site & Team
colors:
  quote-ink: '#272a2b'
  quote-muted: '#676b6d'
  quote-line: '#e7e1da'
  quote-paper: '#fffdfa'
  quote-canvas: '#f5f3f0'
  quote-copper: '#a45e39'
  quote-copper-dark: '#854725'
  quote-copper-soft: '#f4e8df'
  primary: '#c47a35'
  primary-alpha-8: 'rgba(79, 175, 124, 0.08)'
  title-card: 'rgba(17, 24, 39, 1)'
  subtitle: '#64748b'
  card: '#ffffff'
  section: '#f8fafc'
  border-weak: '#e2e8f0'
typography:
  title:
    fontFamily: "'Medium', 'Segoe UI', sans-serif"
    fontSize: '1.5rem'
    fontWeight: 600
  card-title:
    fontFamily: "'Medium', 'Segoe UI', sans-serif"
    fontSize: '1.25rem'
    fontWeight: 600
  card-body:
    fontFamily: "'Medium', 'Segoe UI', sans-serif"
    fontSize: '0.8rem'
    lineHeight: 1.65
  navigation:
    fontFamily: "'Medium', 'Segoe UI', sans-serif"
    fontSize: '0.85rem'
    fontWeight: 600
rounded:
  sm: '8px'
  control: '10px'
  md: '12px'
  panel: '14px'
  lg: '16px'
  full: '9999px'
spacing:
  compact: '0.75rem'
  standard: '1rem'
  app-gap: '1.25rem'
  section: '1.5rem'
components:
  workspace-app:
    backgroundColor: '{colors.card}'
    textColor: '{colors.title-card}'
    rounded: '{rounded.lg}'
  workspace-navigation:
    backgroundColor: '{colors.card}'
    textColor: '{colors.subtitle}'
    rounded: '{rounded.panel}'
    padding: '0.5rem'
  workspace-navigation-active:
    backgroundColor: '{colors.primary-alpha-8}'
    textColor: '{colors.title-card}'
    rounded: '{rounded.control}'
    padding: '0.75rem 1rem'
  schedule-card:
    backgroundColor: '{colors.quote-paper}'
    textColor: '{colors.quote-ink}'
    rounded: '{rounded.panel}'
---

# Design System: BuildHub project workspace

## Overview

This is a scoped record of the existing BuildHub identity as used by Quote Show, Schedule, and Site & Team. It extends the authenticated dashboard's ink, copper, warm canvas, and established controls. It does not define a replacement theme for unrelated modules.

The shell uses warm paper and charcoal with copper accents. Workspace content combines that shell identity with the existing white cards, slate text, and legacy primary tokens. SVG geometry distinguishes the app entries: stepped timeline bars for Schedule, a floor plan for Site & Team, and a checklist for Work Items. These illustrations are code assets, not raster images.

Key characteristics:

- Compact project identity and clear app navigation.
- Rounded, bordered task surfaces with restrained depth.
- Existing bilingual typography and immediate keyboard focus feedback.

## Colors

### Primary

Quote copper identifies Schedule actions and shell accents; its dark and soft companions support text and selected states. The legacy primary remains in launcher illustrations, outlines, and Site & Team controls.

### Neutral

Quote ink, muted, line, paper, and canvas form the warm shell and Schedule palette. Title-card ink, subtitle slate, white card, pale section, and weak border remain the launcher and Site & Team palette. The Schedule summary uses title-card ink with white values and translucent white labels and separators.

**Source precedence.** The shell declares quote tokens on `body:has(.dashboard-shell)` in [dashboard-shell.scss](src/shared/LayoutComponents/styles/dashboard-shell.scss). Schedule aliases these tokens with legacy fallbacks. Launcher and Site & Team styles reference legacy tokens directly. Their values come from the imported [main.min.css](src/styles/main.min.css), whose source includes [_variables.scss](src/styles/_variables.scss).

**Recorded drift.** The legacy primary alpha family is green-based even though its opaque primary is copper. The alpha-8 token above records that incumbent value; it is not a copper tint. Do not infer new alpha values from the opaque primary. Dark-mode legacy overrides also exist; this record's primitive values describe the default light state, not a verified dark-mode specification.

## Typography

The dashboard inherits the local URW DIN Arabic Medium face, registered under `Medium`, with Segoe UI and sans-serif fallbacks. [Font registrations](src/styles/_fonts.scss) also include Thin, Light, Bold, and Demi; these workspace refinements introduce no new font family.

App section headings use the title role, and app titles use the card-title role. Small descriptions use card-body; navigation and app action text use navigation. App metrics use tabular numerals. Site & Team's project title grows with `clamp(1.5rem, 2.5vw, 2rem)`.

Workspace headings and prose override the global capitalization rule where explicitly styled. Keep translated text intact rather than relying on automatic title casing.

## Layout

The launcher grid uses `repeat(auto-fit, minmax(min(100%, 23rem), 1fr))` with the app-gap spacing. It fits two entries where space allows and stacks them when it does not. The app description has a maximum width of 65ch. Quote Show retains its compact header and a native project-details disclosure, closed initially; quote creation date and quote type sit inside that disclosure with the existing commercial and project sections.

Schedule and Site & Team use responsive page padding (`clamp(1rem, 2vw, 2rem)`). Schedule summaries and panels use fluid columns with an 18rem minimum bounded by available width. At 600px, summary rows switch to block separators and remove their individual inline padding; the summary container adds a 1rem inline inset at 700px and below. Site & Team's summary gives site information more width than locations and assigned engineers, then becomes one column at 900px.

App navigation wraps naturally; at 600px and below, the Apps link occupies a full row and the divider disappears. Quote header actions stack at mobile widths, preserving both existing actions.

Logical margins, padding, borders, and alignment support RTL. Schedule mirrors its date-direction arrow under RTL. Decorative app diagrams keep their architectural orientation.

## Elevation & Depth

These module containers are flat: the page frame removes its background, border, and shadow; Site & Team cards explicitly remove shadows. Borders, tonal fills, separators, and the dark Schedule summary establish hierarchy. Expanded Quote Show detail cards retain their existing small shadow. Existing dialogs retain their established application treatment; this refinement does not introduce a new shadow vocabulary.

Style order matters. [DashboardLayout.vue](src/shared/LayoutComponents/DashboardLayout.vue) loads shell SCSS; Schedule and Site & Team pages import their module styles. Later module rules override earlier declarations, including the Schedule summary's dark background. Specific page selectors override the shared `standard-crud-page` frame. Quote Show, app cards, and navigation also carry scoped component styles. Treat executable imports and the final matching declaration as authoritative over stale module README descriptions.

## Shapes

App cards use the large rounded shape; navigation and Schedule panels use the panel shape. Navigation links use the control shape. Site & Team floor rows and space forms retain smaller rounded edges. Badges and member initials use the full radius. Fine borders and native disclosure controls provide structure without introducing additional ornamental frames.

## Components

### App links

Each entire card is a router link with a decorative inline SVG, title, description, optional loaded metrics, and an ink-colored action footer. Hover changes the border to the legacy primary; keyboard focus draws a two-pixel primary outline with a four-pixel offset.

Hover and focus trace the illustration line over 700ms; hover scales the SVG over 500ms and moves the action arrow upward. Reduced motion removes those animations, transforms, and card transitions. Schedule metrics support loading, error, unavailable, and successful states. Site & Team exposes only already loaded metrics belonging to the current quote; its shortcut does not fetch them in the background.

### Navigation

The shared navigation connects Apps, Schedule, and Site & Team. The active app uses `aria-current="page"`, an alpha fill, and ink text; hover uses the section fill. Focus uses a visible primary outline. Reduced motion disables its 180ms transitions.

Existing route helpers preserve `/mainportal` or `/organization` and the quote ID: [schedule.routes.ts](src/modules/MainOrganization/ExecutionQuotes/Schedule/presentation/schedule.routes.ts) defines Quote Show and Schedule paths; [site-team.routes.ts](src/modules/MainOrganization/ExecutionQuotes/SiteTeam/presentation/site-team.routes.ts) extends the Quote Show path. Navigation renders only for a positive integer quote ID.

### Disclosures and task surfaces

Quote project details use native `details` and `summary`; the chevron rotates when expanded and receives reduced-motion handling. Site & Team floor disclosures start open and tint their summary on hover or expansion. Member rows use initials, names, supporting text, and separators. Small Site & Team links, badges, and avatars use ink text.

Schedule preserves existing task controls, timeline cards, and settings dialog. Coarse pointers hide drag handles. Reduced motion removes timeline tracing and spatial movement while retaining brief opacity and border feedback. Form controls remain the established BuildHub controls; this document does not redefine their API or interaction contracts.

## Do's and Don'ts

- **Do** inherit the actual shell and module tokens and existing font registrations.
- **Do** keep real module routes and quote ownership attached to app navigation.
- **Do** preserve translated labels, logical spacing, native disclosures, visible focus, and reduced-motion behavior.
- **Do** verify later style overrides before documenting a visual value.
- **Don't** treat this surface composition as a required layout for unrelated BuildHub screens.
- **Don't** replace the incumbent palette, fonts, or shared controls while extending these surfaces.
- **Don't** invent metrics or raster assets where the implementation uses loaded data and SVG geometry.

## Procurement refinement

Procurement extends this workspace with a charcoal introduction, warm paper panels and copper selection accents. Colors are module-local aliases of existing quote tokens; the existing DIN font and shared controls remain in use. Bordered, shadow-free panels and tabular prices establish hierarchy. A compact three-step guide connects requirements, supplier prices and storing an order.

Purchase Requests provide local text search and all/pending/confirmed/rejected filters. The result count describes the filtered collection against the full loaded collection. Filters reset on quote changes and never trigger additional API calls. Supplier Prices retains its local supplier filter. Mobile tables scroll inside their named, keyboard-focusable regions; filters, dialog fields and actions adapt to narrow screens. Logical spacing and an explicit locale direction support Arabic RTL. Reduced-motion rules remove decorative transitions.

Order creation remains in Supplier Prices, using the selected saved price-record ID. Order viewing remains in Purchase Requests. The refinement preserves shared attachment input/preview, backend status authority and the existing Store/Fetch separation. No raster assets ship with this change. Mocked desktop, mobile and RTL browser captures and validation limits are recorded in Procurement's DESIGN_REVIEW.md.
