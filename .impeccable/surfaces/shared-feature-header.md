---
version: 1
slug: 'shared-feature-header'
primary_target: 'src/shared/FeatureHeader/FeatureHeader.vue'
related_targets: []
---

# Shared feature header

Mode: Operate. Bolder route identity within BuildHub's existing ink, copper, white and bilingual font system. This local refinement preserves the incumbent root DESIGN.md and sidecar.

## Direction contract

THESIS: Strengthen contrast and route identity while preserving existing workflows.

OWN-WORLD: Reuse BuildHub shell tokens and registered fonts. Ink supports white titles, warm muted descriptions, copper-framed route icons and dark-copper primary actions.

STORY: Recognize the route through its existing icon and title, read its optional description, then invoke caller-owned actions. Existing route resolution, translations and action slots remain intact.

FIRST VIEWPORT: A flat ink identity surface carries a white heading and optional warm description. The existing route icon sits in a copper-outlined frame (64px desktop, 48px mobile). Primary actions use dark copper; secondary actions use white text and an outline.

FORM: Desktop flex layout places identity opposite wrapping actions; at 680px and below, actions follow identity. Titles wrap, descriptions use logical text alignment, and buttons have a 44px minimum height. Keyboard focus remains visible and reduced-motion preferences remove local button transitions.

## Implementation and evidence

The change is confined to scoped styles in `src/shared/FeatureHeader/FeatureHeader.vue`; script and template behavior are unchanged. Shell color tokens come from `src/shared/LayoutComponents/styles/dashboard-shell.scss`, with legacy fallbacks in the component. The stronger scoped selector overrides incumbent header styling. The surface and icon retain the existing medium radius token, use borders without shadows, and hide the existing background image and surface overlay through CSS.

The title uses a local fluid size (`clamp(1.5rem, 2.4vw, 2.2rem)`), weight 700 and line height 1.25; mobile fixes it at 1.5rem. Descriptions use 1rem desktop, 0.88rem mobile and a 65ch maximum width. Action labels use 0.85rem. The component introduces no font family, new bitmap asset or global theme change.

Five captures under `.impeccable/review/feature-header/` cover `desktop.png`, `mobile.png`, `arabic.png`, `employee.png` and `plain.png`. They render the actual component with installed global CSS in a standalone fixture harness. They provide component-level evidence, not full routed-shell or live-API verification.

The employee fixture uses synthetic project action labels and body content; its capture verifies header rendering for that route identity, not the actual employee page integration.

The final browser log recorded no runtime errors or horizontal overflow in all five fixtures, plus one action callback in each fixture with actions. The plain fixture contains neither icon nor description nor actions. Rendered colors match the existing ink surface, white heading, warm graphite description and dark-copper primary action.

The focused suite passed 20 tests across three files. Root `npm run type-check`, focused ESLint and Stylelint passed. Verification logs are `/tmp/feature-header-browser-final.log`, `/tmp/feature-header-tests.log`, `/tmp/feature-header-types.log`, `/tmp/feature-header-lint.log` and `/tmp/feature-header-style.log`; these temporary logs are session evidence rather than durable repository artifacts.

## Finish review

The finish reviewer returned **ship** after reviewing all five valid captures. Typography, material, ground, route identities, actions and mobile/RTL behavior matched the direction; no material fixes remained and the refinement ceiling was reached. This verdict applies to the component harness scope above. No separate quality-bar card was supplied; the incumbent DESIGN.md governs this extension.

The detector reported two advisory font-ramp findings: the local 2.2rem title endpoint and inherited 1rem description size. These remain local values; this refinement neither repairs that drift nor promotes it into the global type system.

## Theme integration correction

The subsequent user correction supersedes the fixed ink/copper treatment above: header surfaces now read `--SecondaryColor`, with readable text supplied by `--secondary-text-color` from the existing System Identity theme utility. Primary actions use `--PrimaryColor` and the existing `--button-primary-color`; icon accents and focus treatments derive from primary. Component structure and route behavior remain unchanged.

Verification: 46 focused tests passed across seven files, including two new secondary-foreground cases. Root type-check, focused ESLint and Stylelint passed. A standalone browser fixture verified blue/dark and green/light palettes on desktop, mobile and Arabic RTL, with no overflow or runtime errors. The fixture includes both headers, AnimatedBreadcrumb and SidebarNavigation; it does not establish live API behavior. Earlier captures document the previous palette, not this correction.
