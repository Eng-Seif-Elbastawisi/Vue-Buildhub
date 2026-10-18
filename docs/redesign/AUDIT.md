# BuildHub frontend redesign audit

This migration adapts the user-supplied RonDesignLab Customer Journey reference. It preserves the BuildHub name, logo, current workflows and the existing Vue architecture. Palette values are approximations from the supplied raster images, not original Figma tokens.

## Repository inventory

- Vue 3.5, TypeScript 5.9, Vite 8, Vue Router 5, Pinia 3 and vue-i18n 11; npm and package-lock.json remain unchanged.
- PrimeVue 4.5 with @primeuix/themes 2 and an Aura-derived `systemIdentityPreset`. The preset uses supported semantic/form-field/content/overlay tokens. PrimeIcons 7 and the existing local DIN Arabic font family remain installed.
- Two authenticated shells: organization and administration. `/mainportal` remains an alias of the organization route tree. There are no additional implemented portal trees in `src/router/index.ts`.
- 208 child route declarations, 197 distinct portal paths, and 137 referenced view components. Duplicate declarations and shared-route suffixes are retained. The two home routes, two login screens, two error screens and root/catch-all redirects are tracked separately in the migration report.
- Route arrays live in `src/router/routes/{modules,shared,admin}`. Thin views mount module presentation components. The audit generator reads those actual arrays, applies `addSuffix` to shared routes and verifies each referenced view exists.
- Module organization includes core/data/presentation, with domain/use-case layers in some older modules. API endpoints, models, parameters, repositories and controllers are outside the visual migration.
- Auth access remains in `src/router/guards.ts`; existing user-type prefix checks, route metadata and component-level financial guards are unchanged. Desktop and mobile menus continue using the original role-filtered `sidebar.config.ts` definitions, including disabled entries and query-specific links.

## Shared surface inventory

| Surface                          | Existing implementation and migration mechanism                                                                                                                                                                                                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shell                            | DashboardLayout, SidebarNavigation, Navbar, MobileTopBar, MobileSidebarDrawer; slim desktop rail and scrollable contextual links replace the expanded default sidebar. Mobile retains the existing drawer and its focus/Escape behavior.                                                |
| Page headings                    | FeatureHeader, IndexPageHeader, PageHeaderIcon, AnimatedBreadcrumb; lightweight identity and existing caller-owned actions replace dark banners.                                                                                                                                        |
| Forms                            | Standard CRUD stylesheet, Employee reference, AppInput, MultiLangInput, UpdatedCustomInputSelect, FieldHelpIcon, StandardFormSectionHeader; existing props, events, labels, fields and validations remain.                                                                              |
| Selection and specialized fields | Existing PrimeVue Select/MultiSelect, InputNumber, DatePicker, checkbox/radio/switch and file-upload implementations remain. Shared semantic colors, field dimensions, focus states and overlay surfaces apply.                                                                         |
| Tables and filters               | AppTable, Pagination, FilterDialog, index-header slots and native module tables; shared surfaces and legacy table-token aliases retain existing sorting, selection, search, bulk-delete and pagination implementations. Scroll regions and checkbox controls receive accessible labels. |
| Dialogs and overlays             | PrimeVue Dialog/Drawer/Popover/Menu/Tooltip/Toast plus UnifiedDialog and existing construction state components; the preset and shared stylesheet cover teleported surfaces.                                                                                                            |
| State feedback                   | DataStatusBuilder, DataEmpty, DataFailed, NoNetworkState, TimeoutState, loaders and ConstructionStates remain mounted by their owners. Existing retry/loading/error semantics and illustrations are preserved.                                                                          |
| Data visualization               | Existing module charts, SVG/timeline views and schedule editors retain their data sources and calculations. No chart library, fabricated series or new business metrics are introduced.                                                                                                 |
| Branding/theme                   | SystemIdentity palette/logo settings and persisted theme store remain. Only the default palette changes to dark ink with a periwinkle accent; saved customer palettes continue to apply. New semantic surface tokens include dark-mode values.                                          |
| Localization                     | Existing EN/AR dictionaries and language switcher remain. Added accessibility strings exist in both languages. Layout uses logical spacing; actual mobile and desktop captures include Arabic RTL.                                                                                      |

## Source and cascade findings

The old entry imported `main.min.css` although authored SCSS continued changing. The entry now imports `main.scss`, which compiles successfully, so module source migrations are included in the shipped bundle. Generated CSS files are retained because they are referenced by repository tests and may have external consumers.

The former styles mixed warm copper workspaces, dark banners, white admin tables, multiple shadow treatments and hard-coded module colors. New `workspace-tokens.scss` and `workspace-components.scss` bridge those existing component APIs. Style-only color migrations touch 67 presentation files; targeted composition changes cover the shared shell, both dashboards, both login screens, headers, project details and execution workspace families. Original scripts/templates are retained for components receiving only color-token migration.

The dashboards expose only existing role-filtered navigation and the same count collection. The existing admin count fallback and existing menu destinations are deliberately retained. The notifications component exists in the repository but was not mounted in the incumbent desktop Navbar; the redesign does not activate new WebSocket/push subscriptions.

## Verification boundaries

Browser work uses an isolated local review profile and blocks external traffic. Employee table screenshots use explicitly synthetic browser-only response fixtures; no fixtures or mock metrics are added to application code. Other data-backed captures exercise unavailable/offline states. No live records were created, edited or deleted. Actual authenticated CRUD, permission variants and populated financial/project/schedule states require a connected test account and suitable records.

Baseline captures are in `baseline/`. Current screenshots, browser results, route coverage and quality-gate results are linked in `MIGRATION.md`. A shell check is not evidence that every populated route, dialog and interaction has passed visual or functional acceptance.
