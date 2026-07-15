# Modules summary

[Documentation home](../README.md) · [Complete module documentation](../MODULES_DOCUMENTATION.md)

The source contains **31 module directories**. Counts below treat copied/inactive auth and country scaffolds as modules because their source layers exist, while clearly stating routing status.

## MainAdmin (2)

| Directory                          | Purpose              | Active route                                                               |
| ---------------------------------- | -------------------- | -------------------------------------------------------------------------- |
| `src/modules/MainAdmin/admin`      | Administrator CRUD   | Yes, beneath both prefixes due shared expansion; duplicated under `/admin` |
| `src/modules/MainAdmin/auth_admin` | Platform admin login | `/login-admin`                                                             |

## MainOrganization (13)

| Directory           | Purpose                                               | Active route                             |
| ------------------- | ----------------------------------------------------- | ---------------------------------------- |
| `Invoice`           | Invoice CRUD, details, export/PDF                     | Yes                                      |
| `InvoicePayment`    | Payment CRUD and receipt data                         | Yes                                      |
| `Organization`      | `fetch_from` show/toggle setting                      | Yes, shared-expanded toggle path         |
| `Project`           | Project CRUD, previews, conversion, versions, history | Yes; preview index component is unrouted |
| `ProjectFloor`      | Floor/space inspection data and final status          | Yes; floor index component is unrouted   |
| `ProjectItem`       | Department/project item pricing method data           | Yes, shared-expanded                     |
| `ProjectPricing`    | Project pricing and discounts                         | Yes                                      |
| `Specialization`    | Employee specialization catalog                       | Yes                                      |
| `Suppliers`         | Organization suppliers                                | Yes                                      |
| `Term`              | Organization-specific terms                           | Yes                                      |
| `auth_organization` | Organization employee login                           | `/login-organization`                    |
| `client`            | Client CRM                                            | Yes                                      |
| `employee`          | Employee CRUD/types                                   | Yes                                      |

## Shared catalogs (14)

All are expanded below `/admin` and `/organization` unless noted.

| Directory        | Purpose                                          |
| ---------------- | ------------------------------------------------ |
| `Brand`          | Material/supply brand catalog                    |
| `ClientSource`   | Client acquisition-source catalog                |
| `Department`     | Project department catalog                       |
| `Item`           | Priced item catalog with item/type/status enums  |
| `Materials`      | Material catalog                                 |
| `Organization`   | Organization CRUD                                |
| `ProjectType`    | Project classification catalog                   |
| `Space`          | Space/room catalog                               |
| `Stages`         | Project stage catalog                            |
| `SystemIdentity` | Logo/color identity settings                     |
| `Term`           | Shared terms using fixed `dashboard/` API prefix |
| `location`       | Country/root, governorate, and city hierarchy    |
| `measurement`    | Measurement-unit catalog                         |
| `supply`         | Supply catalog                                   |

## Root modules (2)

| Directory             | Purpose                                                     | Active route                                                             |
| --------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| `src/modules/auth`    | Shared `AuthShell` plus generic organization-login scaffold | Shell is active; generic `LoginForm` is not the active organization form |
| `src/modules/country` | Country CRUD/static fixture scaffold                        | No active country CRUD route; list controller forces static data         |

## Common architecture

```text
core models/params/constants
  -> data API service/endpoints/repository
  -> presentation controller/components
  -> thin src/views route wrapper
```

The employee module is the canonical conventional CRUD example. Exact business behavior, statuses, filters, params, endpoints, and file paths are in [Modules documentation](../MODULES_DOCUMENTATION.md).
