# Modules documentation

[Documentation home](README.md) · [Routes](ROUTES_DOCUMENTATION.md) · [API integration](API_INTEGRATION.md) · [Development guide](DEVELOPMENT_GUIDE.md)

## Reading this document

The source contains 31 feature module directories: 2 under `MainAdmin`, 13 under `MainOrganization`, 14 under `shared`, plus root `auth` and `country`. “Permission” below means frontend routing behavior only; server-side authorization is **not confirmed from frontend source**.

Except where noted, CRUD modules use:

- `Index*Params` for `word`, `page`, `per_page`, `with_pagination`, plus feature filters.
- Action-specific add/edit/show/delete params with `ClassValidation`.
- POST for list/show/delete, POST JSON or multipart for create, and POST for update through `BaseApiService`.
- Paginated response mapping through `BaseRepository` with rows in `data.data` and metadata in `data.meta`.
- A singleton `*Controller`, `*Repository`, and `*ApiService`.

The exact endpoint/method matrix is in [API integration](API_INTEGRATION.md#confirmed-endpoints).

## MainAdmin modules

### Administrator management

**Purpose.** CRUD management of platform administrator accounts.

| Concern          | Implementation                                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root path        | `src/modules/MainAdmin/admin`                                                                                                                            |
| Pages/components | `AdminIndex.vue`, `AdminAdd.vue`, `AdminEdit.vue`, `AdminForm.vue`; thin views in `src/views/MainAdmin/Admin`                                            |
| Controller       | `presentation/controllers/admin.controller.ts`                                                                                                           |
| Model            | `core/models/admin.model.ts` (`id`, `name`, `email`, `phone`, optional password)                                                                         |
| Params           | `add.admin.params.ts`, `edit.admin.params.ts`, `show.admin.params.ts`, `delete.admin.params.ts`, `index.admin.params.ts`                                 |
| API              | `mainportal/fetch_admins`, `show_admin`, `store_admin`, `update_admin`, `delete_admin`                                                                   |
| Routes           | `/admin/admin`, `/admin/admin/add`, `/admin/admin/edit/:id`; duplicate named records exist. The shared expansion also registers `/organization/admin...` |

User actions are list/search/paginate, add, edit, and delete. Filters are `word` and `page`. There is no admin status enum. Add requires name (2–100 chars), email, phone, and password (minimum 6); edit requires the ID/name/email/phone and makes password optional with the same minimum. The sidebar shows Admins only to the admin role. Shared expansion still configures `/organization/admin...`, but `allowedUserTypes: [UserType.ADMIN]` prevents organization users from opening those records; canonical administrator pages are under `/admin/admin...`.

### MainAdmin authentication

**Purpose.** Platform-administrator login implementation used by `/login-admin`.

| Concern          | Implementation                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Root path        | `src/modules/MainAdmin/auth_admin`                                                                                        |
| Components       | `LoginForm.vue`; `ChooseCountry.vue` and `CountryCard.vue` also exist but are not mounted by the active admin login route |
| Controller/model | `presentation/controllers/login.controller.ts`; `core/models/user.model.ts`                                               |
| Params           | `core/params/login.params.ts` sends `credentials` and `password`                                                          |
| API              | POST `mainportal/login` through `LoginApiService` and `LoginRepository`                                                   |
| Route            | `/login-admin`; public only while unauthenticated                                                                         |

Email/credential and password are required. A successful response maps tokens, numeric type, employee data, language data, `is_master`, and identity settings into `UserModel`, then calls `userStore.setUser()`. The form navigates to route name `Admin` for `UserType.ADMIN` (`1`). The authenticated user model now uses the shared `UserType` contract rather than the copied email-category enum. See [Authentication](AUTHENTICATION_AND_PERMISSIONS.md).

## MainOrganization modules

### Authentication for organization users

**Purpose.** Login implementation used by `/login-organization`.

| Concern          | Implementation                                                              |
| ---------------- | --------------------------------------------------------------------------- |
| Root path        | `src/modules/MainOrganization/auth_organization`                            |
| Components       | `LoginForm.vue`, plus `ChooseCountry.vue` and `CountryCard.vue` scaffolds   |
| Controller/model | `presentation/controllers/login.controller.ts`; `core/models/user.model.ts` |
| Params/API       | Required credentials/password; POST `organization/employee/login`           |
| Route            | `/login-organization`; public only while unauthenticated                    |

On success the controller persists the user. The form routes type 1 to `Admin` and all other types to `Employee`; the global guard recognizes only types 1 and 2. No refresh-token call is implemented even though the model has a `refreshToken` field.

### Clients

**Purpose.** Organization CRM records for individual, company, and developer clients.

| Concern           | Implementation                                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Root path         | `src/modules/MainOrganization/client`                                                                                   |
| Components/views  | `clientIndex.vue`, `clientAdd.vue`, `clientEdit.vue`, `clientForm.vue`; views under `src/views/MainOrganization/Client` |
| Controller/models | `client.controller.ts`; `client.model.ts`, `client.show.model.ts`                                                       |
| Params            | Add/edit/index/show/delete client params                                                                                |
| API               | `organization/fetch_clients`, `show_client`, `store_client`, `update_client`, `delete_client`                           |
| Routes            | `/organization/client`, `/add`, `/edit/:client_id`                                                                      |

Users search/paginate, add, edit, and delete clients. Fields include name, phone, email, address, and `ClientTypeEnum` (`INDIVIDUAL=1`, `COMPANY=2`, `DEVELOPER=3`). Add validation requires name, phone, email, address, and type; edit additionally requires `client_id`. Access is organization type 2; no finer permission is implemented.

### Employees

**Purpose.** Manage organization employee accounts and their operational type.

| Concern          | Implementation                                                                                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root path        | `src/modules/MainOrganization/employee`                                                                                                                               |
| Components/views | `EmployeeIndex.vue`, `EmployeeAdd.vue`, `EmployeeEdit.vue`, `EmployeeForm.vue`; views under `src/views/MainOrganization/employee`                                     |
| Controller/model | `employee.controller.ts`; `employee.model.ts`                                                                                                                         |
| Params           | Add/edit/index/show/delete employee params                                                                                                                            |
| API              | Dynamic prefix `mainportal/` for type 1 or `organization/` otherwise, then `fetch_employees`, `show_employee`, `store_employee`, `update_employee`, `delete_employee` |
| Routes           | `/organization/employee`, `/add`, `/edit/:employee_id`                                                                                                                |

Filters are `word` and `page`. Employee types are `EMPLOYEE=1`, `ENGINEER=2`, `SELLER=3`, and `PRICING_RESPONSIBLE=4`. Add requires name/email/phone/password/type; password has a six-character minimum. Edit requires ID/name/email/phone/type and makes password optional. The active routes are organization-only despite the service's dynamic prefix.

### Specializations

**Purpose.** Localized supplier/organization specialization catalog.

| Concern           | Implementation                                                                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Root path         | `src/modules/MainOrganization/Specialization`                                                                                                                                              |
| Components        | `SpecializationIndex.vue`, `SpecializationAdd.vue`, `SpecializationEdit.vue`, `SpecializationForm.vue`                                                                                     |
| Controller/models | `specialization.controller.ts`; list and show models                                                                                                                                       |
| Params/API        | Localized translations plus ID/search params; dynamic prefix with `fetch_specializations`, `show_specialization`, `store_specialization`, `update_specialization`, `delete_specialization` |
| Routes            | `/organization/specialization`, `/organization/specialization/add`, `/organization/specialization/edit/:specialization_id`                                                                 |

Users search/paginate and perform CRUD. Translation params are required by add/edit and serialize nested locale titles. There are no status values. Route access is type 2 only; no action permission is implemented.

### Suppliers

**Purpose.** Maintain organization suppliers and their specialization/material information.

| Concern           | Implementation                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Root path         | `src/modules/MainOrganization/Suppliers`                                                                                                   |
| Components        | `SuppliersIndex.vue`, `SuppliersAdd.vue`, `SuppliersEdit.vue`, `SuppliersForm.vue`                                                         |
| Controller/models | `Suppliers.controller.ts`; `Suppliers.model.ts`, `Suppliers.show.model.ts`                                                                 |
| Params/API        | Add/edit/index/show/delete params; `organization/fetch_suppliers`, `show_supplier`, `store_supplier`, `update_supplier`, `delete_supplier` |
| Routes            | `/organization/suppliers`, `/organization/suppliers/add`, `/organization/suppliers/edit/:id`                                               |

Users search by `word`, paginate, add, edit, and delete. Core fields are name, phone, specialization (spelled `spacification` in the show model), and materials. Required-field validation is defined in the add/edit params. No supplier status enum or granular permission exists.

### Organization terms

**Purpose.** Organization-scoped localized terms used in the organization workflow; this is distinct from `modules/shared/Term`.

| Concern           | Implementation                                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Root path         | `src/modules/MainOrganization/Term`                                                                                        |
| Components        | `TermIndex.vue`, `TermAdd.vue`, `TermEdit.vue`, `TermForm.vue`                                                             |
| Controller/models | `term.controller.ts`; list/show term models                                                                                |
| Params/API        | Localized translations and term IDs; dynamic prefix `fetch_terms`, `show_term`, `store_term`, `update_term`, `delete_term` |
| Routes            | `/organization/term`, `/organization/term/add`, `/organization/term/edit/:term_id`                                         |

Users search/paginate and perform CRUD. Translation data is required for create/update; show/delete require the term ID. There are no statuses. Access is type 2 only.

### Organization data-source toggle

**Purpose.** Read and change an organization setting represented as `toggle_status`, with backend names indicating a `fetch_from` switch.

| Concern                    | Implementation                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Root path                  | `src/modules/MainOrganization/Organization`                                                                        |
| Component/controller/model | `OrganizationTogglIndex.vue`; `organization.toggl.controller.ts`; `organization.toggle.model.ts`                   |
| Params                     | `show.organization.toggl.params.ts`, `toggle.organization.params.ts`                                               |
| API                        | POST `{area}/show_fetch_from`; POST `{area}/toggle_fetch_from`, where area is `mainportal` or `organization`       |
| Routes                     | `/admin/organization-toggle` and `/organization/organization-toggle` through shared routes; duplicate admin record |

The user can view the current numeric status and toggle it. The frontend does not define the semantic meanings of all numeric values beyond the UI switch. Sidebar visibility is organization-only, but the route also exists under admin. No action permission is implemented.

### Projects and project previews

**Purpose.** Core request/project workflow, including pending/converted lists, details, preview scheduling, versioning, history, conversion, and PDF export.

| Concern                | Implementation                                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root path              | `src/modules/MainOrganization/Project`                                                                                                                                                |
| Main components        | `ProjectIndex.vue`, `ProjectAdd.vue`, `ProjectEdit.vue`, `ProjectForm.vue`, `ProjectShow.vue`, `ProjectHistory.vue`, `ProjectSteps.vue`                                               |
| Detail components      | `presentation/components/project_show/*` for header, tabs, info, floors, spaces, departments/items, pricing, and side column                                                          |
| Preview components     | `project_preview/ProjectPreviewIndex.vue`, `ProjectPreviewAdd.vue`, `ProjectPreviewEdit.vue`, `ProjectPreviewForm.vue`                                                                |
| Controllers/composable | `project.controller.ts`, `project.preview.controller.ts`, `useProjectShow.ts`                                                                                                         |
| Models                 | Project list/show, preview list/show, and history models                                                                                                                              |
| Params                 | Project add/edit/index/show/delete; preview add/edit/index/show; conversion, version, revision, and history params                                                                    |
| CRUD API               | Dynamic prefix with `fetch_projects`, `show_project`, `store_project`, `update_project`, `delete_project`; preview equivalents                                                        |
| Action API             | `convert_measurement_to_project`, `store_version`, `revise_version`, `fetch_project_status_histories`                                                                                 |
| Routes                 | `/organization/project`, `/converted-projects`, `/project/add`, `/project/edit/:project_id`, `/project/show/:project_id`, `/project/history/:project_id`, and preview add/edit routes |

The pending view passes only `ConvertStatus.PENDING`; the converted view passes `CONVERT_TO_PROJECT`, `SEND_TO_CLIENT`, and `REVISE_VERSION`. `ProjectIndex` paginates via `page`; status arrays are sent as filters. Project fields cover localized title, existing/new client, client source, project type, location, service type, date, notes, attachments, preview details, and terms. `AddProjectParams` currently defines an empty validation rule set, so component-level workflow is more restrictive than the params validator can prove.

Preview creation requires engineer, preview date/time, and project ID. Optional frontend fields include site link, address, notification type (`NORMAL=1`, `URGENT=2`, `LOW=3`), readiness status (`READY_FOR_PRICING=1`, `NEED_ADDITIONAL_VISIT=2`, `NOT_READY_FOR_COMPLETION=3`), pricing responsible employee, and notification message. Service types are design only, execution only, or both. The detail composable generates a PDF entirely in the browser and links into preview, floor, item, and pricing steps using query IDs. Access is type 2; no granular project permission exists.

### Project floors

**Purpose.** Record inspection floors, their spaces/dimensions/attachments, notes, recommendations, and final results.

| Concern           | Implementation                                                                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Root path         | `src/modules/MainOrganization/ProjectFloor`                                                                                                                                                |
| Components        | `ProjectFloorAdd.vue`, `ProjectFloorEdit.vue`, `ProjectFloorForm.vue`, `ProjectFloorIndex.vue`, `ProjectFloorShow.vue`, `FinalResults.vue`                                                 |
| Controller/models | `project.floor.controller.ts`; list/show floor models                                                                                                                                      |
| Params            | Add/edit/index/show/delete floor params and `final.result.project.floor.params.ts`                                                                                                         |
| API               | Dynamic prefix CRUD on `fetch_project_floors`, `show_project_floor`, `store_project_floor`, `update_project_floor`, `delete_project_floor`; custom POST to `update_project_preview_status` |
| Routes            | Add, edit, and show under `/organization/project_floor`; the index view exists but has no route                                                                                            |

Add consumes `project_id` and `project_preview_id` query values and requires both, floor number, site description, technical notes, inspection recommendations, and spaces. Floor numbers range from basement `-1` through tenth floor `10`. Each space carries a space ID, length, width, height, optional notes, and optional attachments. The final-result action calls the endpoint named `update_project_preview_status`, then proceeds to project-item entry. Access is type 2.

### Project items

**Purpose.** Attach department-grouped priced items to a project and optionally scope prices to a floor or space.

| Concern           | Implementation                                                                                                                                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root path         | `src/modules/MainOrganization/ProjectItem`                                                                                                                                                                        |
| Components        | `ProjectItemIndexEdit.vue`, `ProjectItemIndex.vue`, `ProjectItemAdd.vue`, `ProjectItemEdit.vue`, `ProjectItemForm.vue`                                                                                            |
| Controller/models | `project.Item.controller.ts`; list/show item models                                                                                                                                                               |
| Params/API        | Add/edit/index/show/delete params; dynamic prefix with `fetch_project_department_items`, `show_project_department_item`, `store_project_department_item`, `update_project_item`, `delete_project_department_item` |
| Routes            | `/admin/project-item...` and `/organization/project-item...` through shared routes                                                                                                                                |

The index supports `page`/`word`. Add consumes `project_id` and optional `project_item` query values, fetches up to 100 existing project items, and composes floor display and project pricing entry. Add requires project ID, department ID, and a non-empty items payload. Pricing methods are `GENERAL_ITEM=1`, `SPACE_RELATED=2`, and `FULL_FLOOR_RELATED=3`; serialization conditionally includes price, floor ID, or space ID. Both route roles can reach the module; no action permission exists.

### Project pricing

**Purpose.** Calculate/store project tax and discount data after project items.

| Concern           | Implementation                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Root path         | `src/modules/MainOrganization/ProjectPricing`                                                                                                                                        |
| Components        | `ProjectPricingIndex.vue`, `ProjectPricingAdd.vue`, `ProjectPricingEdit.vue`, `ProjectPricingForm.vue`                                                                               |
| Controller/models | `project.pricing.controller.ts`; list/show pricing models                                                                                                                            |
| Params/API        | Add/edit/index/show/delete params; dynamic prefix with `fetch_project_pricings`, `show_project_pricing`, `store_project_pricing`, `update_project_pricing`, `delete_project_pricing` |
| Routes            | `/organization/project-pricing`, `/organization/project-pricing/add`, `/organization/project-pricing/edit/:id`                                                                       |

Index filters are `page` and `word`; add consumes `project_id`, fetches project items and existing pricing, totals item final prices, and returns to the project detail after success. Tax, discount type, discount value, and project ID are required. Discount types are `FIXED=1` and `PERCENTAGE=2`. Access is type 2 only.

### Invoices

**Purpose.** Create and manage invoices and present a detailed financial view with item/payment summaries and exports.

| Concern           | Implementation                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Root path         | `src/modules/MainOrganization/Invoice`                                                                                                    |
| Main components   | `InvoiceIndex.vue`, `InvoiceAdd.vue`, `InvoiceEdit.vue`, `InvoiceForm.vue`, `ShowInvoice.vue`                                             |
| Detail components | `invoice_show/*`: header, status, client/project, items, payments, totals, notes, timeline, skeleton, and add-payment dialog              |
| Controller/models | `invoice.controller.ts`; `invoice.model.ts`, `invoice.show.model.ts`                                                                      |
| Params            | Add/edit/index/show/delete/export invoice params                                                                                          |
| API               | Dynamic prefix CRUD on `fetch_invoices`, `show_invoice`, `store_invoice`, `update_invoice`, `delete_invoice`; export via `export_invoice` |
| Routes            | `/organization/invoice`, `/invoice/add`, `/invoice/edit/:id`, `/invoices/:id`                                                             |

Index uses `page` and `word`. Add/edit require project, invoice number/date/amount; notes are optional. Status values are `UNPAID=1`, `PARTIAL=2`, `PAID=3`, and `EXTRA_PAID=4`. The detail screen can call the export endpoint and independently generates invoice/receipt PDFs in the browser. Export response shape beyond the repository's generic object handling is **not confirmed**. Access is type 2.

### Invoice payments

**Purpose.** CRUD management of payments associated with invoices; also embedded in the invoice detail flow.

| Concern          | Implementation                                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Root path        | `src/modules/MainOrganization/InvoicePayment`                                                                                                                                        |
| Components       | `InvoicePaymentIndex.vue`, `InvoicePaymentAdd.vue`, `InvoicePaymentEdit.vue`, `InvoicePaymentForm.vue`                                                                               |
| Controller/model | `invoice.payment.controller.ts`; `invoice.payment.model.ts`                                                                                                                          |
| Params/API       | Add/edit/index/show/delete params; dynamic prefix with `fetch_invoice_payments`, `show_invoice_payment`, `store_invoice_payment`, `update_invoice_payment`, `delete_invoice_payment` |
| Routes           | `/organization/invoice-payment`, `/organization/invoice-payment/add`, `/organization/invoice-payment/edit/:id`                                                                       |

Index supports `page` and `word`; the controller also fetches up to 100 payments for a specific invoice and exposes `createInvoicePayment`. Invoice ID, amount, date, and payment method are required; notes are optional. Methods are bank transfer `1`, cash `2`, cheque `3`, and wallet `4`. Access is type 2.

## Root support modules

### Shared authentication shell and generic auth scaffold

**Purpose.** Provides the active `AuthShell.vue` visual composition used by both login routes, plus a third copied organization-login stack.

| Concern                 | Implementation                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Root path               | `src/modules/auth`                                                                                                                       |
| Components              | `AuthShell.vue` (active), `LoginForm.vue`, `ChooseCountry.vue`, `CountryCard.vue`                                                        |
| Controller/model/params | Generic login controller, user model, and required credential/password params                                                            |
| API                     | `organization/employee/login`                                                                                                            |
| Routes                  | No route imports the generic `LoginForm`; `AuthShell` is imported by both active login views; inactive `src/views/auth/*` wrappers exist |

The shell switches organization/admin illustration and translated content via a required `mode` prop and exposes `mode`/translated `badge` through its default scoped slot. The generic login service duplicates the organization-auth implementation. Do not assume it is a third authentication flow.

### Country

**Purpose.** Country selection/CRUD scaffold and country model.

| Concern          | Implementation                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Root path        | `src/modules/country`                                                                      |
| Components       | `CountryIndex.vue`, `CountryAdd.vue`, `CountryEdit.vue`, `CountryForm.vue`                 |
| Controller/model | `country.controller.ts`; `country.model.ts` (`id`, title, code, flag)                      |
| Params           | Add/edit/index/show/delete country params                                                  |
| Confirmed API    | Only `general/fetch_countries` is configured                                               |
| Routes           | None in the active router; the previously referenced country route import is commented out |

Although CRUD params and components exist, create/show/update/delete endpoints are not configured and must not be inferred. More importantly, `CountryController.fetchList()` forces `useStaticData: true`, so the configured index endpoint is bypassed by that controller and hardcoded mock countries are returned. Filters in the inactive index/chooser are `page` and `word`. Add/edit validators require title, code, and flag.

## Shared catalog modules

All modules in this section are expanded under both `/admin` (type 1) and `/organization` (type 2), unless noted. Sidebar role filters are navigation hints, not route authorization.

### Brands

**Purpose.** Localized brand catalog classified as materials or supplies.

- **Files/components:** `src/modules/shared/Brand`; `BrandIndex.vue`, `BrandAdd.vue`, `BrandEdit.vue`, `BrandForm.vue`; brand list/show models and CRUD params/controller.
- **API/routes:** Dynamic prefix CRUD using `fetch_brands`, `show_brand`, `store_brand`, `update_brand`, `delete_brand`; `/brand`, `/brand/add`, `/brand/edit/:id?` under both app prefixes.
- **Behavior:** `page`/`word` filters; CRUD actions; `BrandTypeEnum` is `MATERIALS=1`, `SUPPLIES=2`. Create/update require translations and use JSON. No action permissions.

### Client sources

**Purpose.** Localized, optionally hierarchical sources for client acquisition.

- **Files/components:** `src/modules/shared/ClientSource`; `ClientSourceIndex/Add/Edit/Form.vue`; `client.source.model.ts`, `branches.model.ts`; CRUD params and `client.source.controller.ts`.
- **API/routes:** Dynamic prefix CRUD using `fetch_client_sources`, `show_client_source`, `store_client_source`, `update_client_source`, `delete_client_source`; `/client-source...` under both prefixes.
- **Behavior:** `page`/`word` filters, translations, optional `parentId`, add/edit/delete. The controller inherits base create/update behavior (multipart create, POST update) and has no status/permission enum.

### Departments

**Purpose.** Localized departments associated with a stage and used to group project items.

- **Files/components:** `src/modules/shared/Department`; `DepartmentIndex/Add/Edit/Form.vue`; `department.model.ts`; CRUD params/controller.
- **API/routes:** Dynamic prefix CRUD using `fetch_departments`, `show_department`, `store_department`, `update_department`, `delete_department`; `/departments...` under both prefixes.
- **Behavior:** `page`/`word`; add/edit require translations and `stageId`; ID is required for show/edit/delete. No department status or granular permission.

### Items

**Purpose.** Master construction item catalog consumed by project-item pricing.

- **Files/components:** `src/modules/shared/Item`; `ItemIndex/Add/Edit/Form.vue`; list/show models; CRUD params/controller.
- **API/routes:** Dynamic prefix CRUD using `fetch_items`, `show_item`, `store_item`, `update_item`, `delete_item`; `/item...` under both prefixes, with duplicate admin records.
- **Behavior:** `page`/`word`; fields include type, main/optional status, stage, department, measurement unit, price, notes, and localized title. Types are manufacturing `1`, material `2`, material+manufacturing `3`, and supply+installation `4`; statuses are main `1` and optional `2`. The add params currently have required validation commented out, so validity is not enforced there. No action permission.

### Materials

**Purpose.** Localized material catalog with price, brand, and measurement unit.

- **Files/components:** `src/modules/shared/Materials`; `MaterialsIndex/Add/Edit/Form.vue`; list/show models and CRUD params/controller.
- **API/routes:** Dynamic prefix CRUD using `fetch_materials`, `show_material`, `store_material`, `update_material`, `delete_material`; `/material...` under both prefixes.
- **Behavior:** `page`/`word`; add/edit require price, brand, measurement unit, and translations. `UnitTypeEnum` contains meter `1`, bag `2`, box `3`, though API models also carry a selected measurement model. No granular permission.

### Organizations

**Purpose.** Platform/tenant organization CRUD including a default employee and organization identity fields.

- **Files/components:** `src/modules/shared/Organization`; `OrganizationIndex/Add/Edit/Form.vue`; organization list/show/default-employee models and CRUD params/controller.
- **API/routes:** Dynamic prefix CRUD using `fetch_organizations`, `show_organization`, `store_organization`, `update_organization`, `delete_organization`; `/organization...` under both prefixes, with duplicate admin records.
- **Behavior:** `page`/`word`; fields include organization name/address/logo and default employee name/email/phone/password. The add params mark all fields optional; edit primarily requires the organization ID. Sidebar exposes Organizations to admins, but the organization-prefixed routes remain configured for type 2. Server authorization is not known.

### Project types

**Purpose.** Localized classification of projects.

- **Files/components:** `src/modules/shared/ProjectType`; `ProjectTypeIndex/Add/Edit/Form.vue`; list/show models and CRUD params/controller.
- **API/routes:** Dynamic prefix CRUD using `fetch_project_types`, `show_project_type`, `store_project_type`, `update_project_type`, `delete_project_type`; `/projectType...` under both prefixes.
- **Behavior:** Index reads `page` (no route `word` read). Categories are department `1`, teams `2`, village `3`, commercial `4`, industrial `5`, other `6`. Add/edit require localized translation data through their params; no action permission.

### Spaces

**Purpose.** Localized space/room catalog used by project-floor space entries.

- **Files/components:** `src/modules/shared/Space`; `SpaceIndex/Add/Edit/Form.vue`; list/show models, CRUD params, `space.controller.ts`.
- **API/routes:** Dynamic prefix CRUD using `fetch_spaces`, `show_space`, `store_space`, `update_space`, `delete_space`; `/space...` under both prefixes.
- **Behavior:** `page`/`word`; translation title required for add/edit, IDs required for show/delete. No statuses or granular permission.

### Stages

**Purpose.** Localized hierarchical stage catalog used by departments/items.

- **Files/components:** `src/modules/shared/Stages`; `StageIndex/Add/Edit/Form.vue`; `stage.model.ts` and branch tree model; CRUD params/controller.
- **API/routes:** Dynamic prefix CRUD using `fetch_stages`, `show_stage`, `store_stage`, `update_stage`, `delete_stage`; `/stages...` under both prefixes.
- **Behavior:** `page`/`word`; translations and optional parent hierarchy; child/branch parsing. `EducationType` (`General=1`, `Technical=2`) exists in the model layer but its business meaning here is not confirmed. No granular permission.

### System identity

**Purpose.** Load and save organization/platform branding and apply its palette/logo to the live UI.

- **Files/components:** `src/modules/shared/SystemIdentity`; `SystemIdentitySettings.vue`, `SystemIdentityForm.vue`; `useSystemIdentityTheme.ts`; show/list models, show/store params, controller.
- **API/routes:** Dynamic prefix POST `show_setting` and `store_setting`; `/system-identity` under both prefixes. Organization registers this path twice.
- **Behavior:** Name, primary/secondary/accent colors are required; logo, extracted colors, and active status are supported. The composable derives/applies CSS custom properties, previews/crops logos, persists a palette, and applies the user's returned setting on login/startup. Scoped authentication logout leaves the unrelated persisted palette intact. Both roles see the sidebar item. No granular permission.

### Shared terms

**Purpose.** Department-scoped localized terms, separate from organization terms.

- **Files/components:** `src/modules/shared/Term`; `TermIndex/Add/Edit/Form.vue`; term model, add/edit/index/ID params, controller.
- **API/routes:** Fixed `dashboard/` prefix using singular endpoint names `fetch_term`, `show_term`, `store_term`, `update_term`, `delete_term`; `/terms...` under both app prefixes.
- **Behavior:** `page`/`word`; create/edit combine translations with a required department ID; IDs use the generic key `id`. No status or permission. The fixed `dashboard/` API prefix differs from every other shared catalog and is source-confirmed.

### Locations

**Purpose.** A typed localized location hierarchy with separate country/root, governorate, and city screens.

- **Files/components:** `src/modules/shared/location`; generic `locationIndex/Add/Edit/Form.vue` plus parallel `city/*` and `governorate/*`; list/show models and one shared controller/params set.
- **API/routes:** Dynamic prefix CRUD using `fetch_locations`, `show_location`, `store_location`, `update_location`, `delete_location`; `/location`, `/location-governorate`, and `/location-city` CRUD paths under both prefixes.
- **Behavior:** all three indexes read `page`/`word`. Params support `parent_id`, code, type, and translations; type and translations are required while code validation is commented out. Types are country `1`, governorate `2`, city `3`, region `4`, and place `5`. Parent relationships are mapped in the show model. No granular permission.

### Measurement units

**Purpose.** Localized measurement-unit catalog used by materials, supplies, and items.

- **Files/components:** `src/modules/shared/measurement`; `MeasurementIndex/Add/Edit/Form.vue`; measurement/branch models, CRUD params/controller.
- **API/routes:** Dynamic prefix CRUD using `fetch_measurement_units`, `show_measurement_unit`, `store_measurement_unit`, `update_measurement_unit`, `delete_measurement_unit`; `/measurement...` under both prefixes.
- **Behavior:** `page`/`word`; localized title and optional hierarchy, with IDs mapped as `measurement_unit_id`. The copied `EducationType` and branch structures are present but their relevance to measurement units is **not confirmed**. No granular permission.

### Supplies

**Purpose.** Localized supply catalog with price, brand, and measurement unit.

- **Files/components:** `src/modules/shared/supply`; `SupplyIndex/Add/Edit/Form.vue`; list/show models and CRUD params/controller.
- **API/routes:** Dynamic prefix CRUD using `fetch_supplies`, `show_supply`, `store_supply`, `update_supply`, `delete_supply`; `/supply...` under both prefixes.
- **Behavior:** `page`/`word`; add/edit require price, brand, measurement unit, and translations. Unit constants are meter `1`, bag `2`, box `3`. No granular permission.

## Cross-module business behavior

### Forms and validation

Params classes call `ClassValidation` before create/update/delete through `BaseController`. Validation rules are the source of truth, but several modules intentionally or accidentally have empty/commented rules. Forms also contain UI-level required attributes and disabled-save checks; these do not prove backend validation.

Form controllers generally clear a matching `formsStore` draft and navigate back to the module index after a successful `DataSuccess`. Draft keys commonly use `route.fullPath` and persist in session storage.

### Filters and pagination

Most list pages synchronize `page` and `word` with the URL query, call an `Index*Params`, and render the shared `Pagination.vue`. Project lists use status arrays and page; project-related list requests often disable pagination or request 100 rows for embedded sections.

### Permissions

No module defines a live permission enum or action-level permission check. [`PermissionBuilder.vue`](../../src/shared/HelpersComponents/PermissionBuilder.vue) renders no protected content, and [`permission_handler.ts`](../../src/base/Presentation/Utils/permission_handler.ts) contains only commented-out logic because the authenticated user models expose no permission collection. Current frontend controls are the global `UserType`/token/prefix guard, `allowedUserTypes` route metadata, and sidebar role filtering. Backend authorization remains required for every protected operation.
