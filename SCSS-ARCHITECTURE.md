# Scalable SCSS Architecture Plan

## Context

`main.scss` currently mixes variables, mixins, base styles, and utilities in one file using legacy `@import`. ~47 components have inline `<style scoped>` with no access to shared mixins, causing gradient buttons, focus rings, and label styles to be copy-pasted 8–40 times. This plan splits everything into proper partials, exposes tools to every component via `@use`, and confirms production CSS minification is active.

---

## New Directory Structure

```
app/styles/
├── main.css                        ← UNCHANGED (Tailwind v4 @theme tokens)
├── main.scss                       ← MODIFIED (@use entry point only)
│
├── abstracts/                      ← zero CSS output — pure tools
│   ├── _variables.scss             ← $primary, $surface, etc.
│   ├── _mixins.scss                ← 4 existing + 5 new mixins
│   ├── _functions.scss             ← placeholder
│   └── _index.scss                 ← @forward barrel
│
├── base/
│   ├── _reset.scss                 ← body, h1–h6, .material-symbols-outlined
│   ├── _typography.scss            ← placeholder
│   └── _index.scss
│
├── utilities/
│   ├── _utilities.scss             ← .glass, .primary-gradient, .sr-only, etc.
│   └── _index.scss
│
├── layout/                         ← extracted from default.vue
│   ├── _layout.scss                ← .layout shell, skip-link
│   ├── _nav.scss                   ← all .nav__* rules
│   ├── _footer.scss                ← all .footer__* rules
│   └── _index.scss
│
└── pages/
    └── _auth.scss                  ← moved from auth.scss (content unchanged)
```

---

## New Mixins (`abstracts/_mixins.scss`)

5 new mixins extracted from repeated patterns, added to the 4 existing ones:

| Mixin              | Replaces                                               | Found in      |
| ------------------ | ------------------------------------------------------ | ------------- |
| `button-gradient`  | gradient background + `color: var(--color-on-primary)` | 8+ components |
| `focus-ring`       | `:focus-visible` outline block                         | 40+ instances |
| `label-xs`         | small uppercase label text                             | 20+ instances |
| `badge-base`       | inline badge/chip styling                              | 10+ instances |
| `link-interactive` | icon-link with hover gap animation                     | 12+ instances |

```scss
// abstracts/_mixins.scss

// ── Existing ──────────────────────────────────────────────────────────────

@mixin glass {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin ambient-shadow {
  box-shadow: 0 12px 32px rgba(26, 28, 28, 0.05);
}

@mixin micro-chip {
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

// ── New ───────────────────────────────────────────────────────────────────

@mixin button-gradient($direction: 135deg) {
  background: linear-gradient(
    #{$direction},
    var(--color-primary) 0%,
    var(--color-primary-container) 100%
  );
  color: var(--color-on-primary);
}

@mixin focus-ring($color: var(--color-primary), $offset: 2px, $radius: null) {
  &:focus-visible {
    outline: 2px solid #{$color};
    outline-offset: #{$offset};

    @if $radius {
      border-radius: #{$radius};
    }
  }
}

@mixin label-xs($letter-spacing: 0.05em) {
  font-family: var(--font-label);
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: #{$letter-spacing};
}

@mixin badge-base($variant: default) {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-family: var(--font-label);
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;

  @if $variant == gradient {
    @include button-gradient;
  }
}

@mixin link-interactive($shift: 3px) {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  text-decoration: none;
  transition: gap var(--transition-base);

  .material-symbols-outlined {
    transition: transform var(--transition-base);
  }

  &:hover {
    gap: 0.5rem;

    @if $shift != 0 {
      .material-symbols-outlined {
        transform: translateX(#{$shift});
      }
    }
  }
}
```

Usage in any `.scss` file or `<style scoped lang="scss">` block:

```scss
@use 'abstracts' as *; /* resolves via loadPaths — no relative paths needed */

.btn--primary {
  @include button-gradient;
}
.btn {
  @include focus-ring;
}
.field__label {
  @include label-xs;
}
.badge {
  @include badge-base;
}
.section__link {
  @include link-interactive;
}
```

---

## New `main.scss` (entry point only)

```scss
// Load order: abstracts first (tools), then layers that consume them.
// CSS tokens are in main.css (Tailwind v4 @theme) — never duplicated here.

@use 'abstracts'; // zero output — registers mixins/vars for this file
@use 'base';
@use 'utilities';
@use 'layout';
@use 'pages/auth';
```

---

## `nuxt.config.ts` Changes

Add `loadPaths` so every SCSS file can `@use 'abstracts'` without relative paths:

```ts
import { fileURLToPath } from 'node:url';

export default defineNuxtConfig({
  // ...existing config unchanged...

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: [fileURLToPath(new URL('./app/styles', import.meta.url))],
        },
      },
    },
  },
});
```

---

## `.stylelintrc.json` Changes

Install plugin: `npm install -D stylelint-scss`

```json
{
  "extends": ["stylelint-config-standard", "stylelint-config-recommended-vue"],
  "plugins": ["stylelint-scss"],
  "rules": {
    "at-rule-no-unknown": null,
    "scss/at-rule-no-unknown": true,
    "...existing rules unchanged..."
  },
  "ignoreFiles": [
    "node_modules/**",
    ".nuxt/**",
    "dist/**",
    "app/styles/main.css"
  ]
}
```

Key changes: add `"plugins"`, disable `at-rule-no-unknown`, enable `scss/at-rule-no-unknown`, remove `app/styles/main.scss` from `ignoreFiles`.

---

## Implementation Phases

### Phase 1 — Foundation _(no visible changes, nothing breaks)_

1. `npm install -D stylelint-scss`
2. Update `.stylelintrc.json` as shown above
3. Create all 14 new SCSS partial files (leave them with placeholder content for now)
4. Populate `abstracts/_variables.scss` with existing `$variable` values from `main.scss`
5. Populate `abstracts/_mixins.scss` with all 9 mixins (4 existing + 5 new)
6. Populate `base/_reset.scss` with body/heading/icon rules from `main.scss`
7. Populate `utilities/_utilities.scss` with utility classes from `main.scss` (add `@use 'abstracts' as *` at top)

### Phase 2 — Wire entry point + layout

8. Add `vite.css.preprocessorOptions.scss.loadPaths` to `nuxt.config.ts`
9. Replace `main.scss` content with the clean `@use` entry point
10. Populate `layout/_nav.scss` with all `.nav__*` rules from `default.vue`
11. Populate `layout/_footer.scss` with all `.footer__*` rules from `default.vue`
12. Populate `layout/_layout.scss` with `.layout` shell + skip-link from `default.vue`
13. Replace `<style scoped>` in `default.vue` with `<style lang="scss">@use 'layout';</style>`
14. Copy `auth.scss` → `pages/_auth.scss`, delete original `auth.scss`

### Phase 3 — Refactor existing external SCSS files

Add `@use 'abstracts' as *` and replace repeated patterns with mixin calls:

| File                   | Mixins to apply                                           |
| ---------------------- | --------------------------------------------------------- |
| `AppButton.scss`       | `button-gradient`, `focus-ring`                           |
| `ProductCard.scss`     | `badge-base`, `label-xs`, `button-gradient`, `focus-ring` |
| `SectionHeader.scss`   | `link-interactive`, `focus-ring`                          |
| `AddressesTab.scss`    | `button-gradient`, `badge-base`                           |
| `AppInput.scss`        | none (no matching patterns)                               |
| `StarRating.scss`      | none                                                      |
| `ProductSkeleton.scss` | none                                                      |

### Phase 4 — Convert highest-value inline components _(optional second pass)_

Change `<style scoped>` → `<style scoped lang="scss">` + `@use 'abstracts' as *` for the components with the most repeated patterns:

1. `NotificationBell.vue` — gradient badge + focus-ring
2. `HomeHero.vue` — button-gradient + focus-ring
3. `HomeNewsletter.vue` — button-gradient + label-xs
4. `HomeCategoryGrid.vue` — label-xs + focus-ring
5. `AppBreadcrumb.vue` — link-interactive + focus-ring + label-xs

---

## CSS Minification

Vite 5 (used by Nuxt 4) **already minifies CSS in production** via esbuild. No extra config needed.

Verify after `npm run build`:

```
.nuxt/dist/client/_nuxt/*.css   ← should be single-line minified
```

Optional second-pass with cssnano (deduplication, merging):

```bash
npm install -D cssnano
```

```ts
// nuxt.config.ts — inside vite.css:
postcss: {
  plugins: process.env.NODE_ENV === 'production' ? [require('cssnano')({ preset: 'default' })] : [];
}
```

> Skip cssnano unless the build audit shows duplicate rules — Vite's minification is sufficient for this project's scale.

---

## Files Summary

| Action     | Count | Files                                                                               |
| ---------- | ----- | ----------------------------------------------------------------------------------- |
| **Create** | 14    | All partials under `abstracts/`, `base/`, `utilities/`, `layout/`, `pages/`         |
| **Modify** | 5     | `main.scss`, `nuxt.config.ts`, `default.vue`, `.stylelintrc.json`, `AppButton.scss` |
| **Delete** | 1     | `app/styles/auth.scss`                                                              |

---

## Verification Checklist

- [ ] `npm run dev` — app looks identical, no style regressions
- [ ] `npm run lint:styles` — zero errors across all `.scss` and `.vue` files
- [ ] Test `@use 'abstracts' as *` in one component and call `@include focus-ring` — confirms `loadPaths` works
- [ ] `npm run build` — succeeds; `.nuxt/dist/client/_nuxt/*.css` is minified
- [ ] `default.vue` nav renders correctly (sticky glass header, mobile menu, badge)
