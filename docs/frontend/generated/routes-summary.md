# Routes summary

[Documentation home](../README.md) · [Complete route documentation](../ROUTES_DOCUMENTATION.md)

This is a compact inventory of the active router assembled by [`src/router/index.ts`](../../../src/router/index.ts). The complete table, including component paths, parameters, queries, redirects, and access behavior, is in [Routes documentation](../ROUTES_DOCUMENTATION.md).

## Counts

| Collection                     | Records | Notes                                                                 |
| ------------------------------ | ------: | --------------------------------------------------------------------- |
| Top level                      |       7 | Two login pages, not-found, root redirect, two app layouts, catch-all |
| `/admin` children              |      63 | 10 direct admin records + 53 shared expansions                        |
| `/organization` children       |      90 | 37 organization dashboard records + 53 shared expansions              |
| Total configured route records | **160** | Parent and redirect records included                                  |
| Distinct absolute URL patterns | **149** | Duplicate configured paths counted once                               |

## Top-level behavior

| Path                  | Name                 | Outcome                                                                |
| --------------------- | -------------------- | ---------------------------------------------------------------------- |
| `/login-admin`        | `Login Admin`        | Public admin login; authenticated users redirect to their app          |
| `/login-organization` | `Login Organization` | Public organization login; authenticated users redirect to their app   |
| `/not-found`          | `Not Found`          | Error page; unauthenticated users are redirected to login by the guard |
| `/`                   | —                    | Redirect to `/organization`                                            |
| `/admin`              | `dashboard`          | Authenticated type 1 layout; no default child                          |
| `/organization`       | `Organization App`   | Authenticated type 2 layout; no default child                          |
| `/:pathMatch(.*)*`    | —                    | Redirect to `/not-found`                                               |

## Organization-only dashboard groups

These 37 child records are registered beneath `/organization` before shared routes.

| Group              | Relative paths                                                                   | Records |
| ------------------ | -------------------------------------------------------------------------------- | ------: |
| System identity    | `system-identity`                                                                |       1 |
| Suppliers          | `suppliers`, `suppliers/add`, `suppliers/edit/:id`                               |       3 |
| Clients            | `client`, `client/add`, `client/edit/:client_id`                                 |       3 |
| Employees          | `employee`, `employee/add`, `employee/edit/:employee_id`                         |       3 |
| Specializations    | `specialization`, `specialization/add`, `specialization/edit/:specialization_id` |       3 |
| Organization terms | `term`, `term/add`, `term/edit/:term_id`                                         |       3 |
| Projects           | `project`, `converted-projects`, add/edit/show/history                           |       6 |
| Project previews   | `project_preview/add`, `project_preview/edit/:project_preview_id`                |       2 |
| Project pricing    | `project-pricing`, add/edit                                                      |       3 |
| Project floors     | `project_floor/add`, edit/show                                                   |       3 |
| Invoices           | `invoice`, `invoices/:id`, invoice add/edit                                      |       4 |
| Invoice payments   | `invoice-payment`, add/edit                                                      |       3 |

## Shared groups

Each of the following 53 relative records is expanded once under `/admin` and once under `/organization`, with route names suffixed `Admin` or `Organization`.

| Group             | Relative paths                                                     | Records per prefix |
| ----------------- | ------------------------------------------------------------------ | -----------------: |
| Organizations     | `organization`, add/edit, `organization-toggle`                    |                  4 |
| Items             | `item`, add/edit                                                   |                  3 |
| Administrators    | `admin`, add/edit                                                  |                  3 |
| Brands            | `brand`, add, `edit/:id?`                                          |                  3 |
| Departments       | `departments`, add/edit                                            |                  3 |
| Project types     | `projectType`, add/edit                                            |                  3 |
| Stages            | `stages`, add/edit                                                 |                  3 |
| Shared terms      | `terms`, add/edit                                                  |                  3 |
| Materials         | `material`, add/edit                                               |                  3 |
| Supplies          | `supply`, add/edit                                                 |                  3 |
| Locations         | `location`, `location-governorate`, `location-city`, each add/edit |                  9 |
| Measurement units | `measurement`, add/edit                                            |                  3 |
| Client sources    | `client-source`, add/edit                                          |                  3 |
| System identity   | `system-identity`                                                  |                  1 |
| Spaces            | `space`, add/edit                                                  |                  3 |
| Project items     | `project-item`, add/edit                                           |                  3 |

## Direct admin duplicates

The first 10 admin children repeat paths also produced by the shared expansion:

```text
organization
organization/add
organization/edit/:id
organization-toggle
item
item/add
item/edit/:id
admin
admin/add
admin/edit/:id
```

`/organization/system-identity` is also registered once in the organization dashboard array and once by shared expansion.

## Access summary

- The global guard requires `isAuth`, a usable token, a recognized `UserType`, matching route metadata, and the correct URL prefix.
- Type 1 is constrained to `/admin`; type 2 is constrained to `/organization`.
- Parent routes and administrator CRUD records define `allowedUserTypes`; no granular action permission metadata exists.
- Shared route expansion creates all shared paths under both prefixes, but organization users are rejected from `/organization/admin...`.
