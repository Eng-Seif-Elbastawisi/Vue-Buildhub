# API integration

[Documentation home](README.md) · [Modules](MODULES_DOCUMENTATION.md) · [Environment](ENVIRONMENT_CONFIGURATION.md) · [Authentication](AUTHENTICATION_AND_PERMISSIONS.md)

## Architecture

Backend calls follow this implementation path:

```text
Vue component
  -> singleton feature controller
  -> singleton feature repository
  -> singleton feature API service
  -> BaseApiService / ServicesInterface
  -> NetworkService (Axios)
  -> backend
```

The important shared files are:

| Responsibility                                              | Source                                                                                                                                       |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Axios instance, retry, cancellation, progress, interceptors | [`src/base/Core/NetworkStructure/networking/networkService.ts`](../../src/base/Core/NetworkStructure/networking/networkService.ts)           |
| Request headers                                             | [`src/base/Core/NetworkStructure/networking/utils/headerHandler.ts`](../../src/base/Core/NetworkStructure/networking/utils/headerHandler.ts) |
| CRUD request construction                                   | [`src/base/Data/ApiService/baseApiService.ts`](../../src/base/Data/ApiService/baseApiService.ts)                                             |
| Low-level service dispatch                                  | [`src/base/Data/ApiService/apiServiceInterface.ts`](../../src/base/Data/ApiService/apiServiceInterface.ts)                                   |
| Response mapping and typed errors                           | [`src/base/Domain/Repositories/baseRepository.ts`](../../src/base/Domain/Repositories/baseRepository.ts)                                     |
| Reactive presentation behavior                              | [`src/base/Presentation/Controller/baseController.ts`](../../src/base/Presentation/Controller/baseController.ts)                             |
| Absolute endpoint builder                                   | [`src/base/Data/Endpoints/BaseEndpoints.ts`](../../src/base/Data/Endpoints/BaseEndpoints.ts)                                                 |
| API base constant                                           | [`src/base/Core/NetworkStructure/baseUrl.ts`](../../src/base/Core/NetworkStructure/baseUrl.ts)                                               |
| Environment settings                                        | [`src/base/Core/Config`](../../src/base/Core/Config)                                                                                         |

## HTTP client configuration

`NetworkService` is an Axios singleton configured with:

- `baseURL: env.apiBaseUrl`
- timeout from the selected environment
- default JSON `Content-Type` and `Accept` headers
- request IDs and timestamps for diagnostics
- optional upload/download progress callbacks
- `AbortController` request cancellation
- retry of errors classified as retryable, using exponential delay from `ErrorHandler`

Feature endpoints are constructed as absolute strings from `baseUrl`, so the Axios `baseURL` is normally not used to resolve them. This duplication means changing only the environment API URL does not necessarily change feature requests.

## Endpoint prefixes

Endpoint classes extend `BaseEndpoints` and append a prefix plus suffix to the hard-coded base URL.

| Prefix notation in this document | Runtime behavior                                                |
| -------------------------------- | --------------------------------------------------------------- |
| `{area}/`                        | `mainportal/` when `user.type === 1`; otherwise `organization/` |
| `mainportal/`                    | Fixed platform-admin API                                        |
| `organization/`                  | Fixed organization API                                          |
| `dashboard/`                     | Fixed legacy/shared API prefix                                  |
| `general/`                       | Fixed general API prefix                                        |

Only relative paths are shown below so this documentation does not replicate deployment host values.

## Request format and authentication

All confirmed feature endpoints use HTTP `POST` in their active call paths:

- index/show/delete default to JSON POST;
- update defaults to JSON POST because `usePost` defaults to true;
- create is an HTTP POST using `multipart/form-data` unless the controller passes `useJson: true`;
- custom operations shown below call `customPost`.

`Params.toMap()` creates the request body. `HeaderHandler` always adds `Accept`, `Accept-Language`, and `x-country`. It adds `Authorization: Bearer <token>` only for calls marked authenticated and only when the stored token is a trimmed, usable bearer value. Missing and placeholder token values do not produce an `Authorization` header. See [Authentication and permissions](AUTHENTICATION_AND_PERMISSIONS.md#request-authentication-headers).

Whether the backend also requires cookies, CSRF protection, or additional gateway headers is **not confirmable from frontend source**.

## Response mapping and pagination

`ServicesInterface` wraps Axios output as `{ data, statusCode, headers }`. Repositories then expect the backend envelope to expose business data at `response.data.data` and a message at `response.data.message`.

For repositories configured with pagination, the expected envelope is effectively:

```json
{
  "data": {
    "data": [],
    "meta": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 10,
      "total": 0
    }
  },
  "message": "..."
}
```

`PaginationModel.fromMap()` maps the metadata. Each feature repository maps item/list payloads through its `Model.fromMap()` or equivalent and returns `DataSuccess`, `DataEmpty`, or `DataFailed`.

## Error handling and retry

The low-level layer normalizes Axios failures. The repository maps them into typed UI states, including:

- bad request, unauthorized, forbidden, not found, conflict, validation, and server failures;
- timeout (`DataTimeout`);
- disconnected network (`DataNoNetwork`);
- cancelled request (`DataCancelled`);
- rate limit (`DataRateLimited`).

Configured status exceptions cover 400, 401, 403, 404, 405, 406, 408, 409, 422, 429, and 500–504. Retrying is environment-controlled and limited to errors that `ErrorHandler` classifies as retryable.

For HTTP 401, the Axios response interceptor invokes an unauthorized callback registered by `src/main.ts`. The callback calls `handleUnauthorizedResponse(router)`, which removes only the persisted `user` authentication state, resets the Pinia user store, and redirects to the login page selected from the current route prefix. It skips navigation when the current route is already a login page. No token refresh is attempted. HTTP 403 remains a typed error and does not end the session.

## File uploads and downloads

- Standard create calls send `FormData` when `useJson` is not enabled; params containing files are serialized by the shared service.
- `BaseApiService.uploadWithProgress()` and `downloadWithProgress()` exist, but no feature-module call to either helper was found.
- [`HandleFilesUpload.vue`](../../src/shared/FormInputs/HandleFilesUpload.vue) handles browser file selection/previews and client-side downloads.
- Invoice/project PDF and spreadsheet exports are primarily client-side through jsPDF, html2canvas, SheetJS, and file-saver.
- The invoice API exposes `export_invoice` as a JSON POST. It does not configure Axios `responseType: 'blob'`; the backend response format is **not confirmed**.

## Confirmed endpoints

### Reading the endpoint tables

`CRUD params` means the five action-specific classes in the module's `core/params` folder: index, show/ID, add, edit, and delete. Naming/capitalization varies by module and is retained in source. `List / item model` means list calls map arrays and show/create/update map the named model. All paths below are confirmed in `*.api.endpoints.ts`.

### Confirmed params classes by API family

The following table resolves every later `CRUD params` abbreviation to source-declared class names.

| API family                                 | Params classes                                                                                                                                                                                |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication (all three implementations) | `LoginParams`                                                                                                                                                                                 |
| Administrators                             | `IndexAdminParams`, `ShowAdminParams`, `AddAdminParams`, `EditAdminParams`, `DeleteAdminParams`                                                                                               |
| Country                                    | `IndexCountryParams`, `ShowCountryParams`, `AddCountryParams`, `EditCountryParams`, `DeleteCountryParams` (only index endpoint configured)                                                    |
| Invoice                                    | `IndexInvoiceParams`, `ShowInvoiceParams`, `AddInvoiceParams`, `EditInvoiceParams`, `DeleteInvoiceParams`, `ExportInvoiceParams`                                                              |
| Invoice payment                            | `IndexInvoicePaymentParams`, `ShowInvoicePaymentParams`, `AddInvoicePaymentParams`, `EditInvoicePaymentParams`, `DeleteInvoicePaymentParams`                                                  |
| Organization fetch-source                  | `ShowOrganizationToggledParams`, `ToggleOrganizationParams`                                                                                                                                   |
| Project                                    | `IndexProjectParams`, `ShowProjectParams`, `AddProjectParams`, `EditProjectParams`, `DeleteProjectParams`                                                                                     |
| Project preview                            | `IndexProjectPreviewParams`, `ShowProjectPreviewParams`, `AddProjectPreviewParams`, `EditProjectPreviewParams`                                                                                |
| Project custom actions                     | `convert.measurement.params.ts` and `store.version.params.ts` each export a copied class named `ShowProjectParams`; revision/history use `ReviseVersionParams` and `ShowProjectHistoryParams` |
| Project floor                              | `IndexProjectFloorParams`, `ShowProjectFloorParams`, `AddProjectFloorParams`, `EditProjectFloorParams`, `DeleteProjectFloorParams`, `AddFinalProjectFloorResultParams`                        |
| Project item                               | `IndexProjectItemParams`, `ShowProjectItemParams`, `AddProjectItemParams`, `EditProjectItemParams`, `DeleteProjectItemParams`                                                                 |
| Project pricing                            | `IndexProjectPricingParams`, `ShowProjectPricingParams`, `AddProjectPricingParams`, `EditProjectPricingParams`, `DeleteProjectPricingParams`                                                  |
| Specialization                             | `IndexSpecializationParams`, `ShowSpecializationParams`, `AddSpecializationParams`, `EditSpecializationParams`, `DeleteSpecializationParams`                                                  |
| Supplier                                   | `IndexSuppliersParams`, `ShowSuppliersParams`, `AddSuppliersParams`, `EditSuppliersParams`, `DeleteSuppliersParams`                                                                           |
| Organization term                          | `IndexTermParams`, `ShowTermParams`, `AddTermParams`, `EditTermParams`, `DeleteTermParams`                                                                                                    |
| Client                                     | `IndexClientParams`, `ShowClientParams`, `AddClientParams`, `EditClientParams`, `DeleteClientParams`                                                                                          |
| Employee                                   | `IndexEmployeeParams`, `ShowEmployeeParams`, `AddEmployeeParams`, `EditEmployeeParams`, `DeleteEmployeeParams`                                                                                |
| Brand                                      | `IndexBrandParams`, `ShowBrandParams`, `AddBrandParams`, `EditBrandParams`, `DeleteBrandParams`                                                                                               |
| Client source                              | `IndexClientSourceParams`, `ShowClientSourceParams`, `AddClientSourceParams`, `EditClientSourceParams`, `DeleteClientSourceParams`                                                            |
| Department                                 | `IndexDepartmentParams`, `ShowDepartmentParams`, `AddDepartmentParams`, `EditDepartmentParams`, `DepartmentIdParams`                                                                          |
| Item                                       | `IndexItemParams`, `ShowItemParams`, `AddItemParams`, `EditItemParams`, `DeleteItemParams`                                                                                                    |
| Material                                   | `IndexMaterialParams`, `ShowMaterialParams`, `AddMaterialsParams`, `EditMaterialParams`, `DeleteMaterialParams`                                                                               |
| Organization                               | `IndexOrganizationParams`, `ShowOrganizationParams`, `AddOrganizationParams`, `EditOrganizationParams`, `DeleteOrganizationParams`                                                            |
| Project type                               | `IndexProjectTypeParams`, `ShowProjectTypeParams`, `AddProjectTypeParams`, `EditProjectTypeParams`, `DeleteProjectTypeParams`                                                                 |
| Space                                      | `IndexSpaceParams`, `ShowSpaceParams`, `AddSpaceParams`, `EditSpaceParams`, `DeleteSpaceParams`                                                                                               |
| Stage                                      | `IndexStageParams`, `ShowStageParams`, `AddStageParams`, `EditStageParams`, `DeleteStageParams`                                                                                               |
| System identity                            | `ShowSystemIdentityParams`, `StoreSystemIdentityParams`                                                                                                                                       |
| Shared term                                | `IndexTermParams`, `AddTermParams`, `EditTermParams`, `TermIdParams`                                                                                                                          |
| Location                                   | `IndexLocationParams`, `ShowLocationParams`, `AddLocationParams`, `EditLocationParams`, `DeleteLocationParams`                                                                                |
| Measurement unit                           | `IndexMeasurementParams`, `ShowMeasurementParams`, `AddMeasurementParams`, `EditMeasurementParams`, `DeleteMeasurementParams`                                                                 |
| Supply                                     | `IndexSupplyParams`, `ShowSupplyParams`, `AddSupplyParams`, `EditSupplyParams`, `DeleteSupplyParams`                                                                                          |

The sidebar-count call sends no params object. Deletion of a shared term uses `TermIdParams`; there is no separately named delete class. Project preview has a configured delete endpoint but no `DeleteProjectPreviewParams` class in its params folder; the controller/service behavior should be checked before adding a delete UI.

### Authentication, administration, and utility APIs

| Method                              | Endpoint                             | Controller/service                                               | Params               | Response model               | Related page/component                                             |
| ----------------------------------- | ------------------------------------ | ---------------------------------------------------------------- | -------------------- | ---------------------------- | ------------------------------------------------------------------ |
| POST JSON                           | `mainportal/login`                   | MainAdmin `LoginController` / `login.api-service.ts`             | `LoginParams`        | MainAdmin `UserModel`        | `/login-admin`                                                     |
| POST JSON                           | `organization/employee/login`        | MainOrganization auth `LoginController` / `login.api-service.ts` | `LoginParams`        | MainOrganization `UserModel` | `/login-organization`                                              |
| POST JSON                           | `organization/employee/login`        | Root auth `LoginController` / `login.api-service.ts`             | `LoginParams`        | root auth `UserModel`        | Root auth form exists but is not mounted by the active login route |
| POST                                | `mainportal/fetch_admins`            | `AdminController` / `AdminApiService`                            | `IndexAdminParams`   | `AdminModel[]` + pagination  | `/admin/admin` and duplicated shared path                          |
| POST                                | `mainportal/show_admin`              | Same                                                             | `ShowAdminParams`    | `AdminModel`                 | admin edit                                                         |
| POST                                | `mainportal/store_admin`             | Same                                                             | `AddAdminParams`     | `AdminModel`                 | admin add                                                          |
| POST                                | `mainportal/update_admin`            | Same                                                             | `EditAdminParams`    | `AdminModel`                 | admin edit                                                         |
| POST                                | `mainportal/delete_admin`            | Same                                                             | `DeleteAdminParams`  | Void/message                 | admin index                                                        |
| POST (configured, runtime bypassed) | `general/fetch_countries`            | `CountryController` / `CountryApiService`                        | country index params | `CountryModel[]`             | Country pages are unrouted; controller forces static list data     |
| POST                                | `{area}/organization_sidebar_counts` | `sidebar.counts.api-service.ts`                                  | Empty body           | `SidebarCountsApiResponse`   | `SidebarNavigation.vue`                                            |

### Organization workflow APIs

| Module                             | Method and endpoint(s)                                                                                                                                                 | Controller/service                                           | Params                                                                                                                    | Response model                                             | Related pages                                      |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------- |
| Invoice                            | POST `{area}/fetch_invoices`, `show_invoice`, `store_invoice`, `update_invoice`, `delete_invoice`                                                                      | `InvoiceController` / `InvoiceApiService`                    | Invoice CRUD params                                                                                                       | `InvoiceModel[]` / `InvoiceShowModel` / void               | invoice index/show/add/edit                        |
| Invoice export                     | POST `{area}/export_invoice`                                                                                                                                           | `InvoiceController` / `InvoiceApiService.exportInvoice`      | `ExportInvoiceParams`                                                                                                     | Generic object; exact download contract not confirmed      | invoice index/show export action                   |
| Invoice payment                    | POST `{area}/fetch_invoice_payments`, `show_invoice_payment`, `store_invoice_payment`, `update_invoice_payment`, `delete_invoice_payment`                              | `InvoicePaymentController` / service                         | Payment CRUD params                                                                                                       | `InvoicePaymentModel[]` / `InvoicePaymentModel` / void     | payment index/add/edit                             |
| Organization fetch-source setting  | POST `{area}/show_fetch_from`; POST `{area}/toggle_fetch_from`                                                                                                         | organization toggle controller/service                       | `ShowOrganizationToggledParams`, `ToggleOrganizationParams`                                                               | `OrganizationToggledModel`                                 | organization screen/action                         |
| Project                            | POST `{area}/fetch_projects`, `show_project`, `store_project`, `update_project`, `delete_project`                                                                      | `ProjectController` / `ProjectApiService`                    | Project CRUD params                                                                                                       | `ProjectModel[]` / `ProjectShowModel` / void               | project/converted-project index, add/edit/show     |
| Project conversion/version/history | POST `{area}/convert_measurement_to_project`, `store_version`, `revise_version`, `fetch_project_status_histories`                                                      | `ProjectController` / custom service methods                 | The first two files both export a class named `ShowProjectParams`; then `ReviseVersionParams`, `ShowProjectHistoryParams` | void/message actions; `ProjectHistoryModel` history        | project show/history/revision flows                |
| Project preview                    | POST `{area}/fetch_project_previews`, `show_project_preview`, `store_project_preview`, `update_project_preview`, `delete_project_preview`                              | `ProjectPreviewController` / preview service                 | Preview CRUD params                                                                                                       | `ProjectPreviewModel[]` / `ProjectPreviewShowModel` / void | preview add/edit; index component is not routed    |
| Project floor                      | POST `{area}/fetch_project_floors`, `show_project_floor`, `store_project_floor`, `update_project_floor`, `delete_project_floor`                                        | `ProjectFloorController` / service                           | Floor CRUD params                                                                                                         | `ProjectFloorModel[]` / `ProjectFloorShowModel` / void     | floor add/edit/show; index component is not routed |
| Project floor final action         | POST `{area}/update_project_preview_status`                                                                                                                            | `ProjectFloorController` / service method named `getProject` | `AddFinalProjectFloorResultParams`                                                                                        | Raw `ApiResponse`; no repository model mapping             | floor/final-result flow                            |
| Project department item            | POST `{area}/fetch_project_department_items`, `show_project_department_item`, `store_project_department_item`, `update_project_item`, `delete_project_department_item` | `ProjectItemController` / service                            | Project-item CRUD params                                                                                                  | `ProjectItemModel[]` / `ProjectItemShowModel` / void       | project-item index/add/edit                        |
| Project pricing                    | POST `{area}/fetch_project_pricings`, `show_project_pricing`, `store_project_pricing`, `update_project_pricing`, `delete_project_pricing`                              | `ProjectPricingController` / service                         | Pricing CRUD params                                                                                                       | `ProjectPricingModel[]` / `ProjectPricingShowModel` / void | pricing index/add/edit                             |
| Specialization                     | POST `{area}/fetch_specializations`, `show_specialization`, `store_specialization`, `update_specialization`, `delete_specialization`                                   | `SpecializationController` / service                         | Specialization CRUD params                                                                                                | `SpecializationModel[]` / `SpecializationShowModel` / void | specialization index/add/edit                      |
| Supplier                           | POST `organization/fetch_suppliers`, `show_supplier`, `store_supplier`, `update_supplier`, `delete_supplier`                                                           | `SuppliersController` / service                              | Supplier CRUD params                                                                                                      | `SuppliersModel[]` / `SuppliersShowModel` / void           | supplier index/add/edit                            |
| Organization term                  | POST `{area}/fetch_terms`, `show_term`, `store_term`, `update_term`, `delete_term`                                                                                     | MainOrganization `TermController` / service                  | Organization-term CRUD params                                                                                             | `TermModel[]` / `TermShowModel` / void                     | organization term index/add/edit                   |
| Client                             | POST `organization/fetch_clients`, `show_client`, `store_client`, `update_client`, `delete_client`                                                                     | `ClientController` / service                                 | Client CRUD params                                                                                                        | `ClientModel[]` / `ClientShowModel` / void                 | client index/add/edit                              |
| Employee                           | POST `{area}/fetch_employees`, `show_employee`, `store_employee`, `update_employee`, `delete_employee`                                                                 | `EmployeeController` / service                               | Employee CRUD params                                                                                                      | `EmployeeModel[]` / `EmployeeModel` / void                 | employee index/add/edit                            |

### Shared catalog APIs

Except for shared Term, every `{area}` row selects the platform or organization prefix from `user.type`.

| Module           | Method and endpoint(s)                                                                                                                         | Controller/service                        | Params                                                  | Response model                                                  | Related pages                           |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------- |
| Brand            | POST `{area}/fetch_brands`, `show_brand`, `store_brand`, `update_brand`, `delete_brand`                                                        | `BrandController` / service               | Brand CRUD params                                       | `BrandModel[]` / `BrandShowModel` / void                        | brand index/add/edit                    |
| Client source    | POST `{area}/fetch_client_sources`, `show_client_source`, `store_client_source`, `update_client_source`, `delete_client_source`                | `ClientSourceController` / service        | Client-source CRUD params                               | `ClientSourceModel[]` / `ClientSourceModel` / void              | client-source index/add/edit            |
| Department       | POST `{area}/fetch_departments`, `show_department`, `store_department`, `update_department`, `delete_department`                               | `DepartmentController` / service          | Department CRUD params                                  | `DepartmentModel[]` / `DepartmentModel` / void                  | department index/add/edit               |
| Item             | POST `{area}/fetch_items`, `show_item`, `store_item`, `update_item`, `delete_item`                                                             | `ItemController` / service                | Item CRUD params                                        | `ItemModel[]` / `ItemShowModel` / void                          | item index/add/edit                     |
| Material         | POST `{area}/fetch_materials`, `show_material`, `store_material`, `update_material`, `delete_material`                                         | `MaterialsController` / service           | Material CRUD params                                    | `MaterialModel[]` / `MaterialShowModel` / void                  | material index/add/edit                 |
| Organization     | POST `{area}/fetch_organizations`, `show_organization`, `store_organization`, `update_organization`, `delete_organization`                     | shared `OrganizationController` / service | Organization CRUD params                                | `OrganizationModel[]` / `OrganizationShowModel` / void          | organization index/add/edit             |
| Project type     | POST `{area}/fetch_project_types`, `show_project_type`, `store_project_type`, `update_project_type`, `delete_project_type`                     | `ProjectTypeController` / service         | Project-type CRUD params                                | `ProjectTypeModel[]` / `ProjectTypeShowModel` / void            | project-type index/add/edit             |
| Space            | POST `{area}/fetch_spaces`, `show_space`, `store_space`, `update_space`, `delete_space`                                                        | `SpaceController` / service               | Space CRUD params                                       | `SpaceModel[]` / `SpaceShowModel` / void                        | space index/add/edit                    |
| Stage            | POST `{area}/fetch_stages`, `show_stage`, `store_stage`, `update_stage`, `delete_stage`                                                        | `StageController` / service               | Stage CRUD params                                       | `StageModel[]` / `StageModel` / void                            | stage index/add/edit                    |
| System identity  | POST `{area}/show_setting`, `store_setting`                                                                                                    | `SystemIdentityController` / service      | `ShowSystemIdentityParams`, `StoreSystemIdentityParams` | `SystemIdentityShowModel`                                       | `/system-identity`                      |
| Shared term      | POST `dashboard/fetch_term`, `show_term`, `store_term`, `update_term`, `delete_term`                                                           | shared `TermController` / service         | Shared-term CRUD/ID params                              | `TermModel[]` / `TermModel` / void                              | shared terms index/add/edit             |
| Location         | POST `{area}/fetch_locations`, `show_location`, `store_location`, `update_location`, `delete_location`                                         | `LocationController` / service            | Location CRUD params                                    | `LocationModel[]` / `LocationShowModel` / void                  | country/governorate/city location pages |
| Measurement unit | POST `{area}/fetch_measurement_units`, `show_measurement_unit`, `store_measurement_unit`, `update_measurement_unit`, `delete_measurement_unit` | `MeasurementController` / service         | Measurement CRUD params                                 | Declared `StageModel[]`; item parser returns `measurementModel` | measurement index/add/edit              |
| Supply           | POST `{area}/fetch_supplies`, `show_supply`, `store_supply`, `update_supply`, `delete_supply`                                                  | `SupplyController` / service              | Supply CRUD params                                      | `SupplyModel[]` / `SupplyShowModel` / void                      | supply index/add/edit                   |

## Static/mock behavior

The environment manager can make repositories return `mockItem`/`mockList` rather than call the service. The repository's test stage enables this globally. The country controller explicitly forces `useStaticData: true` for list requests in every environment, so `general/fetch_countries` is configured but not reached by that controller method.

Mock examples are development/test fixtures and must not be interpreted as backend contract examples where they disagree with live mappings.

## Adding or changing an API

Follow the existing layer order:

1. Add an endpoint property to the module endpoint class.
2. Add a typed `Params` class with `toMap()` and validation.
3. Expose the call through the singleton API service.
4. Map its response in the repository to a concrete model and `DataState`.
5. Add a controller method for presentation behavior.
6. Consume the controller from the component; do not call Axios from Vue files.
7. Add endpoint, service, repository, controller, model/params, and component tests consistent with neighboring modules.

See [Development guide](DEVELOPMENT_GUIDE.md#adding-api-behavior) for a code-oriented checklist.
