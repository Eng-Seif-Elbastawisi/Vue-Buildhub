# API summary

[Documentation home](../README.md) · [Complete API documentation](../API_INTEGRATION.md)

## Transport snapshot

| Concern               | Confirmed implementation                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| Client                | Axios singleton in `networkService.ts`                                                                   |
| Standard CRUD method  | POST                                                                                                     |
| Create encoding       | Multipart POST by default; JSON POST when `useJson` is passed                                            |
| Auth                  | Bearer header only for authenticated calls with a usable token; HTTP 401 triggers scoped logout          |
| Locale/country        | `Accept-Language` and `x-country` headers                                                                |
| Error model           | Typed exceptions mapped to `DataState`                                                                   |
| Pagination            | Rows under response `data.data`; metadata under response `data.meta` within the business `data` envelope |
| Retry                 | Environment-controlled for retryable failures with exponential backoff                                   |
| Cancellation/progress | Supported by base layer; no feature use of progress helpers found                                        |

## Endpoint families

The source configures 145 endpoint bindings/custom operations when each service property is counted, including two frontend implementations of the same organization login path and the sidebar-count call. The meaningful inventory is:

| Area                                                        |                         Endpoint operations | Prefix                                                               |
| ----------------------------------------------------------- | ------------------------------------------: | -------------------------------------------------------------------- |
| Authentication                                              |                 3 bindings (2 unique paths) | `mainportal/`, `organization/`                                       |
| Administrator CRUD                                          |                                           5 | `mainportal/`                                                        |
| Country list                                                | 1 configured; controller forces static data | `general/`                                                           |
| Organization workflow modules (excluding its login binding) |                                          68 | Mostly dynamic `{area}/`; suppliers/clients fixed organization       |
| Shared catalog modules                                      |                                          67 | 13 CRUD families (65 operations) plus two system-identity operations |
| Sidebar counts                                              |                                           1 | Dynamic `{area}/`                                                    |

`{area}/` is `mainportal/` for type 1 users and `organization/` otherwise.

## Custom operations beyond standard CRUD

| Method | Relative endpoint                       | Purpose                                       |
| ------ | --------------------------------------- | --------------------------------------------- |
| POST   | `{area}/export_invoice`                 | Invoice export response                       |
| POST   | `{area}/show_fetch_from`                | Read organization source toggle               |
| POST   | `{area}/toggle_fetch_from`              | Change organization source toggle             |
| POST   | `{area}/convert_measurement_to_project` | Convert measurement/request data to a project |
| POST   | `{area}/store_version`                  | Store a project version                       |
| POST   | `{area}/revise_version`                 | Revise a project version                      |
| POST   | `{area}/fetch_project_status_histories` | Fetch project status history                  |
| POST   | `{area}/update_project_preview_status`  | Project-floor final/preview-status action     |
| POST   | `{area}/show_setting`                   | Read system identity                          |
| POST   | `{area}/store_setting`                  | Store system identity                         |
| POST   | `{area}/organization_sidebar_counts`    | Sidebar count badges                          |

## CRUD families

| Family                                                    | Index endpoint                                                                                                                                                                                                                                            |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admins                                                    | `fetch_admins`                                                                                                                                                                                                                                            |
| Invoices / payments                                       | `fetch_invoices`, `fetch_invoice_payments`                                                                                                                                                                                                                |
| Projects / previews / floors / department items / pricing | `fetch_projects`, `fetch_project_previews`, `fetch_project_floors`, `fetch_project_department_items`, `fetch_project_pricings`                                                                                                                            |
| Organization setup                                        | `fetch_specializations`, `fetch_suppliers`, `fetch_terms`, `fetch_clients`, `fetch_employees`                                                                                                                                                             |
| Shared catalogs                                           | `fetch_brands`, `fetch_client_sources`, `fetch_departments`, `fetch_items`, `fetch_materials`, `fetch_organizations`, `fetch_project_types`, `fetch_spaces`, `fetch_stages`, `fetch_term`, `fetch_locations`, `fetch_measurement_units`, `fetch_supplies` |

Each CRUD family also defines its corresponding show/store/update/delete endpoint except country (index only) and system identity/toggle (custom two-operation services). Exact controller, params, response model, page, and path information is in [API integration](../API_INTEGRATION.md#confirmed-endpoints).
