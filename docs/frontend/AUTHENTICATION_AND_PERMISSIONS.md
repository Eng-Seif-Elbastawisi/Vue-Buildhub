# Authentication and permissions

[Documentation home](README.md) · [Routes](ROUTES_DOCUMENTATION.md) · [State management](STATE_MANAGEMENT.md) · [API integration](API_INTEGRATION.md)

## Implemented authentication surfaces

| User area                | Login route           | Component                                                                              | Endpoint                      |
| ------------------------ | --------------------- | -------------------------------------------------------------------------------------- | ----------------------------- |
| Platform administration  | `/login-admin`        | `src/modules/MainAdmin/auth_admin/presentation/components/LoginForm.vue`               | `mainportal/login`            |
| Organization application | `/login-organization` | `src/modules/MainOrganization/auth_organization/presentation/components/LoginForm.vue` | `organization/employee/login` |

The routed pages are [`src/views/MainAdmin/auth_admin/LoginAdmin.vue`](../../src/views/MainAdmin/auth_admin/LoginAdmin.vue) and [`src/views/MainOrganization/auth_organization/LoginOrganization.vue`](../../src/views/MainOrganization/auth_organization/LoginOrganization.vue), rendered through [`AuthShell.vue`](../../src/modules/auth/presentation/components/AuthShell.vue).

A third implementation exists in [`src/modules/auth`](../../src/modules/auth) and posts to the organization employee-login endpoint, but the active organization login route imports the `MainOrganization/auth_organization` form. Country-choice login components also exist but are not part of the active route flow.

## Login flow

1. A login form gathers `credentials` and `password`.
2. Its singleton login controller validates a `LoginParams` object.
3. The repository calls its API service with a JSON POST.
4. A successful payload is mapped to `UserModel`.
5. The controller calls `userStore.setUser(user)`.
6. The store persists the user, creates a client-side 24-hour expiry, applies system-identity colors, and schedules a timeout.
7. Every copied login form routes type `1` users to the route named `Admin` (`/admin/admin`) and other successful users to the route named `Employee` (`/organization/employee`). The global guard separately maps the two types to the `/admin` and `/organization` application prefixes.

The server's exact credential rules and token lifetime are **not confirmable from frontend source**.

## User model and role fields

**Primary model:** [`src/modules/auth/core/models/user.model.ts`](../../src/modules/auth/core/models/user.model.ts). Equivalent copied models exist in both area-specific authentication modules.

Relevant fields include:

| Field          | Frontend use                                                          |
| -------------- | --------------------------------------------------------------------- |
| `apiToken`     | Added to authenticated requests only when it is a usable token string |
| `refreshToken` | Mapped and persisted; no refresh flow was found                       |
| `type`         | Selects admin (`1`) or organization (`2`) route area                  |
| `isMaster`     | Used by sidebar visibility, not by the route guard                    |
| `languages`    | Mapped from the response; no authorization behavior is attached to it |
| `setting`      | Used to apply identity colors/logo-related user settings              |

The three authentication model copies now type `type` with [`UserType`](../../src/modules/auth/core/constants/userType.enum.ts): `ADMIN=1` and `ORGANIZATION=2`. These numeric values preserve the backend payload contract. A missing type is not defaulted to administrator, so the route guard rejects that session. The former JWT-like model fixture has been removed; `UserModel.example` has no authentication token.

## Session and token storage

[`src/stores/user.ts`](../../src/stores/user.ts) persists `user`, `isAuth`, and `expiresAt` through `pinia-plugin-persistedstate` to `localStorage` under `user`.

- Session expiry is always generated as 24 hours from login on the client.
- Bootstrap calls `initFromPersist()` from [`src/main.ts`](../../src/main.ts).
- An expired restored session is cleared immediately.
- An unexpired restored session schedules logout for its remaining duration.
- JWT claims and server expiry are not inspected.
- Refresh-token use is not implemented.

Because tokens are accessible to JavaScript in local storage, protection against cross-site scripting is important. HttpOnly-cookie behavior cannot be inferred because the frontend explicitly handles bearer tokens.

## Request authentication headers

[`headerHandler.ts`](../../src/base/Core/NetworkStructure/networking/utils/headerHandler.ts) builds these headers:

```http
Accept: application/json
Accept-Language: <stored language or default>
x-country: <configured country>
Authorization: Bearer <api token>
```

`HeaderHandler` adds `Authorization` only when the request is marked authenticated and [`getUsableAuthToken()`](../../src/modules/auth/core/utils/authToken.ts) returns a trimmed token. Missing values, whitespace, the placeholder strings `undefined`, `null`, and `bearer`, and values containing whitespace are rejected. Therefore the generated headers do not contain empty, `undefined`, or `null` bearer values.

This validation confirms only that a token is usable as a bearer value. Signature, revocation, and server-side expiration remain backend responsibilities.

## Route guards

[`src/router/guards.ts`](../../src/router/guards.ts) installs a global `beforeEach` guard. Its effective role map is:

| `UserType`     | Value | Allowed application prefix | Login route           |
| -------------- | ----: | -------------------------- | --------------------- |
| `ADMIN`        |     1 | `/admin`                   | `/login-admin`        |
| `ORGANIZATION` |     2 | `/organization`            | `/login-organization` |

Behavior:

- An unauthenticated visitor may open either login route.
- Any other unauthenticated navigation, including `/not-found`, redirects to a login route.
- An authenticated user opening a login route is redirected to their mapped application root.
- A user navigating into the other role's protected prefix is redirected to their own application root.
- The `/admin` and `/organization` parents declare `meta.allowedUserTypes`.
- Administrator CRUD records also declare `allowedUserTypes: [UserType.ADMIN]`; this blocks the copies expanded beneath `/organization` from organization users.
- A persisted user with an unrecognized `type` is treated like an unauthenticated user for guard decisions.

The guard requires all three local conditions: `isAuth === true`, a usable `apiToken`, and a recognized `UserType`. It then checks `allowedUserTypes` metadata and the application prefix. It does not validate the token with the backend or decode token expiry.

## Logout and expiration

Logout is local-only in [`src/stores/user.ts`](../../src/stores/user.ts):

1. Cancel the expiry timer.
2. Reset `user`, `isAuth`, and `expiresAt`.
3. Remove only the persisted authentication key `user` from `localStorage`.

Language, country, organization-toggle, system-identity palette, and other unrelated browser-storage values survive logout. No backend logout/revocation endpoint is called.

At startup, [`src/main.ts`](../../src/main.ts) registers a callback that calls [`handleUnauthorizedResponse(router)`](../../src/base/Core/NetworkStructure/networking/utils/unauthorizedHandler.ts) with the Axios singleton. The response interceptor invokes that callback for HTTP 401. It performs the same scoped logout, redirects `/admin...` pages to `/login-admin` and other pages to `/login-organization`, and does not redirect when already on either login page. It does not refresh tokens.

## Permissions and navigation visibility

There is no active granular permission engine in the frontend:

- Route records do not declare permission metadata.
- `UserModel` does not declare or map a permissions collection.
- `PermissionBuilder.vue` currently renders an empty `<data>` element.
- The permission handler utility is commented out.
- Sidebar groups use `user.type` and/or `isMaster` for visibility, which is presentation logic rather than route enforcement.

This means a hidden sidebar entry does not prove that the URL is unavailable. Shared route expansion still exposes numerous CRUD routes beneath both prefixes. The frontend now enforces application user type and explicitly marks administrator CRUD routes, but it cannot enforce action permissions that are absent from the authenticated response. Backend authorization remains the security boundary, and its behavior is **not confirmable from this repository**.

## Unauthorized behavior

| Condition                                    | Confirmed frontend behavior                                                   |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| Missing auth flag, token, or recognized type | Redirect to the login route selected by the target prefix                     |
| Authenticated user opens login               | Redirect to own area root                                                     |
| Type 1 opens organization prefix             | Redirect to `/admin`                                                          |
| Type 2 opens admin prefix                    | Redirect to `/organization`                                                   |
| Type 2 opens `/organization/admin...`        | `allowedUserTypes` rejects it and redirects to `/organization`                |
| Backend returns 401                          | Scoped logout, user-store reset, then redirect unless already on a login page |
| Backend returns 403                          | Typed network failure; the session is retained                                |
| Missing action permission                    | No active frontend permission check                                           |
| Unknown URL while unauthenticated            | Catch-all reaches `/not-found`, then guard redirects to login                 |

## Security observations

These are implementation observations, not claims about the backend:

- Persistent bearer tokens increase the impact of an XSS defect.
- The client-generated 24-hour session may not match server token validity.
- A global 401 logout flow exists, but no refresh-token workflow or server logout/revocation call is implemented.
- Sidebar filtering and route-prefix checks are not granular authorization.
- Removing the token fixture from the current source does not remove it from Git history; credential rotation and history remediation cannot be confirmed from frontend source.
