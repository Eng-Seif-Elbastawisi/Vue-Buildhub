# Compact status badge migration

696 non-test Vue files were source-scanned. All 32 identified active record-status badge owners (36 template positions) now use the shared visual recipe. This is source/CSS coverage, not live acceptance of every populated screen.

`src/shared/ConstructionStates/StatusBadge.vue` is the generic presentation component. QuoteStatusBadge preserves its status prop, class mapping and translations while delegating rendering. Existing native status spans retain their classes/bindings and opt in with `bh-status`, so no domain or event logic moves into the generic component. PrimeVue Tag uses the installed preset API and the same tokens.

Default geometry: 22px single-line height, 8px horizontal padding, 6px corners, 12px/600 text. Backgrounds are solid; borders, shadows, gradients and badge animations are removed. Optional existing icons are 12px. Long labels wrap outside tables; table labels remain on one line inside existing horizontal scrollers. The dot variant is transparent and uses readable semantic ink.

Palette estimates adapt the reference for readable small text: green `#16803f`, red `#c83d46`, blue `#2b62bf`, amber `#efb74b` with dark text, neutral `#e2e5ea`/`#485366`. Dark neutral is `#354052`/`#edf2fa`. Existing purple review and System Identity brand mappings are retained. These are adapted application tokens, not original design-source values.

## Component coverage

| Component                                                                                                                  | Badge family                                                                     | Migration                               |
| -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------- |
| `src/modules/MainAdmin/package/presentation/components/PackageIndex.vue`                                                   | `feature-status`                                                                 | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/ProcurementPage.vue`                     | `procurement-status`                                                             | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/ExecutionQuotes/Procurement/presentation/components/PurchaseOrderDetails.vue`                | `procurement-status`                                                             | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/ExecutionQuotes/Schedule/presentation/components/ProjectManagementShortcut.vue`              | `project-shortcut__badge`                                                        | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/ExecutionQuotes/Warehouse/presentation/components/MaterialReceiptHistory.vue`                | `material-receipt__status`                                                       | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/ExecutionQuotes/WorkItems/presentation/components/DailyReportsList.vue`                      | `work-items-badge`                                                               | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/ExecutionQuotes/presentation/components/ExecutionQuoteIndex.vue`                             | `execution-quote-index__client-status`, `execution-quote-index__progress-status` | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/ExecutionQuotes/presentation/components/ExecutionQuoteShow.vue`                              | `execution-quote-show__status`                                                   | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/ExecutionQuotes/presentation/components/builder/ExecutionQuoteMainStages.vue`                | `stage-card__status`                                                             | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/ExecutionQuotes/presentation/components/builder/ExecutionQuoteStageHeader.vue`               | `stage-header__status`                                                           | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/Invoice/presentation/components/InvoiceIndex.vue`                                            | `invoice-status-badge`                                                           | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/Invoice/presentation/components/invoice_show/InvoiceChildrenCard.vue`                        | `invoice-status-badge`                                                           | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/Invoice/presentation/components/invoice_show/InvoicePaymentsCard.vue`                        | `invoice-payments-card__status`                                                  | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/Invoice/presentation/components/invoice_show/InvoiceShowHeader.vue`                          | `invoice-show-status-pill`                                                       | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/Labors/presentation/components/LaborIndex.vue`                                               | `status-badge`                                                                   | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/Package/presentation/components/OrganizationPackageCard.vue`                                 | `organization-package-card__status`                                              | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/Package/presentation/components/OrganizationPackageSubscriptionsTable.vue`                   | `package-subscription-status`                                                    | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/Products/presentation/components/ProductsIndex.vue`                                          | `status-badge`                                                                   | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/Products/presentation/components/show/ProductShowHero.vue`                                   | `status-pill`                                                                    | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/Products/presentation/components/show/ProductShowInfo.vue`                                   | `status-pill`                                                                    | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/Project/presentation/components/GlobalProjectSearch.vue`                                     | `status-badge`                                                                   | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/Project/presentation/components/ProjectHistory.vue`                                          | `status-badge`                                                                   | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/Project/presentation/components/ProjectIndex.vue`                                            | `status-badge`                                                                   | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/Project/presentation/components/project_show/ProjectFloorsSection.vue`                       | `status-badge`                                                                   | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/Project/presentation/components/project_show/ProjectInfoSection.vue`                         | `status-badge`                                                                   | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/Project/presentation/components/project_show/ProjectShowHeader.vue`                          | `status-badge`                                                                   | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/TaskAssignment/presentation/components/TaskApprovedIndex.vue`                                | `assignment-status`                                                              | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/TaskAssignment/presentation/components/task-assignments-show/TaskAssignmentsShowDetails.vue` | `status-badge`                                                                   | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/TaskAssignment/presentation/components/task-assignments-show/TaskAssignmentsShowHeader.vue`  | `task-status-chip`                                                               | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/TaskAssignment/presentation/components/task-assignments-show/TaskAssignmentsShowHistory.vue` | `status-badge`                                                                   | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/ExecutionQuotes/presentation/components/ExecutionQuoteForm.vue`                              | `quote-hero__badge`                                                              | Native bindings retained; shared recipe |
| `src/modules/MainOrganization/ExecutionQuotes/presentation/components/QuoteStatusBadge.vue`                                | `quote-status-badge`                                                             | Shared component wrapper                |

## Module review

| Module                               | Vue files reviewed | Status-badge result                                                |
| ------------------------------------ | -----------------: | ------------------------------------------------------------------ |
| `MainAdmin/admin`                    |                  4 | No active record-status badge owner found; other controls retained |
| `MainAdmin/auth_admin`               |                  3 | No active record-status badge owner found; other controls retained |
| `MainAdmin/package`                  |                  6 | 1 migrated owners                                                  |
| `MainOrganization/AttachmentType`    |                  4 | No active record-status badge owner found; other controls retained |
| `MainOrganization/ChangeStatus`      |                  2 | No active record-status badge owner found; other controls retained |
| `MainOrganization/Contractor`        |                  5 | No active record-status badge owner found; other controls retained |
| `MainOrganization/ExecutionQuotes`   |                 76 | 11 migrated owners                                                 |
| `MainOrganization/Invoice`           |                 22 | 4 migrated owners                                                  |
| `MainOrganization/InvoicePayment`    |                  4 | No active record-status badge owner found; other controls retained |
| `MainOrganization/ItemTypes`         |                  4 | No active record-status badge owner found; other controls retained |
| `MainOrganization/Labors`            |                  4 | 1 migrated owners                                                  |
| `MainOrganization/Organization`      |                  1 | No active record-status badge owner found; other controls retained |
| `MainOrganization/Package`           |                  5 | 2 migrated owners                                                  |
| `MainOrganization/Products`          |                 11 | 3 migrated owners                                                  |
| `MainOrganization/Project`           |                 26 | 6 migrated owners                                                  |
| `MainOrganization/ProjectFloor`      |                  6 | No active record-status badge owner found; other controls retained |
| `MainOrganization/ProjectItem`       |                  5 | No active record-status badge owner found; other controls retained |
| `MainOrganization/ProjectPricing`    |                  4 | No active record-status badge owner found; other controls retained |
| `MainOrganization/QuoteTypes`        |                  6 | No active record-status badge owner found; other controls retained |
| `MainOrganization/Specialization`    |                  4 | No active record-status badge owner found; other controls retained |
| `MainOrganization/Suppliers`         |                  4 | No active record-status badge owner found; other controls retained |
| `MainOrganization/TaskAssignment`    |                 12 | 4 migrated owners                                                  |
| `MainOrganization/Term`              |                  4 | No active record-status badge owner found; other controls retained |
| `MainOrganization/Warehouse`         |                  5 | No active record-status badge owner found; other controls retained |
| `MainOrganization/auth_organization` |                  3 | No active record-status badge owner found; other controls retained |
| `MainOrganization/client`            |                  4 | No active record-status badge owner found; other controls retained |
| `MainOrganization/employee`          |                  4 | No active record-status badge owner found; other controls retained |
| `auth`                               |                  7 | No active record-status badge owner found; other controls retained |
| `country`                            |                  6 | No active record-status badge owner found; other controls retained |
| `home`                               |                  1 | No active record-status badge owner found; other controls retained |
| `shared/Brand`                       |                  5 | No active record-status badge owner found; other controls retained |
| `shared/ClientSource`                |                  6 | No active record-status badge owner found; other controls retained |
| `shared/Department`                  |                  4 | No active record-status badge owner found; other controls retained |
| `shared/Item`                        |                  4 | No active record-status badge owner found; other controls retained |
| `shared/Materials`                   |                  5 | No active record-status badge owner found; other controls retained |
| `shared/Organization`                |                  4 | No active record-status badge owner found; other controls retained |
| `shared/PricePercentage`             |                  1 | No active record-status badge owner found; other controls retained |
| `shared/ProjectType`                 |                  4 | No active record-status badge owner found; other controls retained |
| `shared/Space`                       |                  4 | No active record-status badge owner found; other controls retained |
| `shared/Stages`                      |                 10 | No active record-status badge owner found; other controls retained |
| `shared/SystemIdentity`              |                  2 | No active record-status badge owner found; other controls retained |
| `shared/Term`                        |                  4 | No active record-status badge owner found; other controls retained |
| `shared/location`                    |                 12 | No active record-status badge owner found; other controls retained |
| `shared/measurement`                 |                  6 | No active record-status badge owner found; other controls retained |
| `shared/supply`                      |                  4 | No active record-status badge owner found; other controls retained |

## Verification

- Six shared/quote component tests passed, including all four existing quote statuses. Thirty module interaction tests passed; one Procurement test still expects an absent search selector. The exact failure also reproduces with the pre-change ProcurementPage.
- Root type-check, Vite bundling and targeted Stylelint passed. Changed-owner ESLint retains two ProductsIndex unused-code errors and a ProjectIndex non-null warning, reproduced against the pre-change source. The shared badge, wrapper, tests and theme configuration lint cleanly. No full-suite or full `npm run build` pass is claimed.
- 118 status samples per viewport (354 total), using actual owner/scoped styles, passed geometry, solid-color and contrast checks at 1440px English/light, 1024px English/light and 390px Arabic/dark. The minimum measured solid text contrast was 4.98:1. Nine dialog badges passed sizing checks; dialog Escape closing remained functional.
- The actual populated InvoiceIndex route was captured with read-only synthetic API fixtures at all three widths. All four invoice statuses remain 22px, including tablet and mobile; horizontal scrolling preserves full labels. No live backend records or writes were used.
- Component/CSS fixtures cover native badge styles; they do not prove complete live forms, role matrices or every populated screen. Original scripts and template bindings were checked in the [preservation report](status-badge-preservation.json).

Artifacts: [inventory](status-badge-inventory.json), [visual checks](status-badge-visual-verification.json), [populated invoice route](status-badge-route-verification.json), [desktop overview](status-badge-screenshots/1440.png), [dark dialog](status-badge-screenshots/dialog-390.png).

## Intentional exclusions and existing quirks

Filter chips, navigation/count badges, site-team selection counts, type/category/version/date metadata, progress indicators, timeline markers, toggle-field labels, feedback banners and skeletons remain separate. Inactive commented-out status markup is not revived. No shared `.badge` or `.tag` selector indiscriminately converts those controls.

- Project numeric status colors are retained, including existing brand and green mappings for pre-execution states.
- Task review header stays purple; task review history stays blue, matching existing distinct styles.
- Warehouse partial receipts retain their existing brand color.
- The stage builder header already styles both Active and Inactive labels green; this existing mapping is preserved.
