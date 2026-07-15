# State management

[Documentation home](README.md) · [Authentication](AUTHENTICATION_AND_PERMISSIONS.md) · [Development guide](DEVELOPMENT_GUIDE.md)

## Overview

The application uses [Pinia](https://pinia.vuejs.org/) as its global state-management library. Pinia is created in [`src/main.ts`](../../src/main.ts), extended with `pinia-plugin-persistedstate`, and installed before the router. Stores use the setup-store form of `defineStore`.

The application also contains feature controllers built around Vue `reactive` state. These are singleton presentation-layer objects, not Pinia stores. See [Controller state](#controller-state).

## Store registration and persistence

```ts
const pinia = createPinia();
const app = createApp(App).use(pinia).use(pinia.use(piniaPluginPersistedstate)).use(router);
```

The chained second `.use(...)` is the literal bootstrap implementation: it passes the Pinia instance returned by `pinia.use()` to Vue again before application stores are created.

Persistence is configured per store. Browser storage is therefore part of the application state contract:

| Store   | Pinia ID  | Persistent storage | Storage key |
| ------- | --------- | ------------------ | ----------- |
| User    | `user`    | `localStorage`     | `user`      |
| Country | `country` | `localStorage`     | `country`   |
| Theme   | `theme`   | `localStorage`     | `theme`     |
| Forms   | `forms`   | `sessionStorage`   | `forms`     |
| Counter | `counter` | None               | —           |

## User store

**File:** [`src/stores/user.ts`](../../src/stores/user.ts)

The store is the frontend source of truth for the current authenticated identity.

### State

| State       | Type/purpose                                                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `user`      | `UserModel \| null`; identity, type, API token, refresh token, languages, settings, and profile fields mapped by `UserModel` |
| `isAuth`    | Boolean authentication flag                                                                                                  |
| `expiresAt` | Client-generated session expiry timestamp or `null`                                                                          |

### Derived state

The store declares no computed getters; components read the returned refs directly.

### Actions

| Action              | Behavior                                                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `setUser(user)`     | Stores the user, marks the session authenticated, assigns an expiry 24 hours from the client clock, applies identity colors, and schedules automatic logout |
| `initFromPersist()` | Called from `src/main.ts`; restores identity colors and the remaining expiry timer, or logs out an expired persisted session                                |
| `logout()`          | Cancels the timer, resets authentication state, and removes only the persisted `user` key                                                                   |
| `setAutoLogout()`   | Cancels any prior timer and schedules `logout()` for the stored expiry                                                                                      |

The timeout is calculated locally; the source does not decode a JWT expiry. Tokens are stored inside persisted `UserModel` data in `localStorage`. No refresh-token action is implemented despite `refreshToken` being mapped by the model.

`logout()` leaves unrelated local-storage values intact, including locale, country, organization-toggle, and system-identity preferences. The HTTP 401 response handler calls this same action before redirecting to login.

## Country store

**File:** [`src/stores/country.ts`](../../src/stores/country.ts)

| Concern         | Implementation                                                             |
| --------------- | -------------------------------------------------------------------------- |
| State           | `countryCode`, initialized to `eg`                                         |
| Derived state   | `isCountrySet`, true when the code is non-empty                            |
| Getter function | `getCountryCode()`, returns the stored value                               |
| Action          | `setCountryCode(code)`, trims and normalizes non-empty values to uppercase |
| Persistence     | Complete store persisted to `localStorage` using key `country`             |

The request header reads this store directly. [`headerHandler.ts`](../../src/base/Core/NetworkStructure/networking/utils/headerHandler.ts) sends `getCountryCode()` as `x-country`.

## Forms store

**File:** [`src/stores/formsStore.ts`](../../src/stores/formsStore.ts)

The forms store preserves drafts by a caller-provided key, commonly a route path, and can show a return/clear warning toast.

| Action                                         | Behavior                                                                                      |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `getFormData(key)` / `setFormData(key, value)` | Read or write a draft                                                                         |
| `clearFormData(key)`                           | Assign `null` to one draft key                                                                |
| `hasUnsavedChanges(key)`                       | Checks only whether the draft has a non-empty `email` or a defined `type`                     |
| `showReturnWarning(targetPath)`                | Adds a PrimeVue info toast, then uses a `MutationObserver` to append Return and Clear buttons |

The complete returned store state (`formData`) is persisted to `sessionStorage`. `setFormData` clears the key when its computed non-empty check is true; that counterintuitive behavior is source-confirmed. `showReturnWarning` obtains `useToast()` and `useRouter()` inside the action and then mutates the rendered toast DOM.

## Theme store

**File:** [`src/stores/theme.ts`](../../src/stores/theme.ts)

The store holds `isDark`, watches it, and toggles the `dark` class on the root `<html>` element through `applyTheme()`. `toggle()` flips the ref. The Pinia plugin persists the store to `localStorage` under `theme`; the store applies the current ref when it is created and again when it changes.

## Counter store

**File:** [`src/stores/counter.ts`](../../src/stores/counter.ts)

This is the Vue starter counter with `count`, `doubleCount`, and `increment()`. No application usage was found; it is not business state.

## Route-search composable

**File:** [`src/stores/routerSearch.ts`](../../src/stores/routerSearch.ts)

Despite its location, this is not a Pinia store. `useRouteSearch()` creates component-local refs used by `Navbar.vue`:

| Returned value     | Purpose                                    |
| ------------------ | ------------------------------------------ |
| `query`            | Current search text                        |
| `results`          | Up to eight case-insensitive title matches |
| `isOpen`           | Search-result panel visibility             |
| `activeIndex`      | Keyboard-highlighted result                |
| `navigate(route)`  | Pushes the selected path and resets state  |
| `onKeydown(event)` | Handles Arrow Up/Down, Enter, and Escape   |
| `reset()`          | Clears query/panel/selection state         |

The module flattens `dashboardRoutes` once at import time, skips dynamic paths and routes with `meta.searchable === false`, and derives titles from `meta.title`, `meta.breadcrumb`, or route name. Its default parent path is `/eg`, which is not an active top-level route in the current router (`/organization` is active). Search results may therefore navigate to stale `/eg/...` URLs; no persistence is used.

## Controller state

Feature state is commonly held by singleton controllers that extend [`BaseController`](../../src/base/Presentation/Controller/baseController.ts). A controller exposes reactive list/item data, pagination, data state, validation messages, and dialog/loading state. It calls a singleton repository, maps `DataSuccess`/`DataFailed`, and triggers UI feedback through application utilities.

The normal flow is:

```text
Vue page/component -> singleton controller -> singleton repository -> API service
```

Because controller instances are singletons, their reactive state can survive component unmounting until explicitly replaced or cleared. They are not persisted by Pinia.

## Authentication and permissions storage

- Authentication status and the full user object are persisted in the `user` Pinia store.
- `UserModel` maps `UserType`, `isMaster`, API/refresh tokens, languages, and identity settings; it has no permissions collection. A missing type remains undefined instead of defaulting to administrator.
- The route guard requires `isAuth`, a usable `apiToken`, a recognized `UserType`, matching `allowedUserTypes` metadata, and the correct URL prefix.
- No active action-level permission store or permission getter was found.
- [`PermissionBuilder.vue`](../../src/shared/HelpersComponents/PermissionBuilder.vue) and [`permission_handler.ts`](../../src/base/Presentation/Utils/permission_handler.ts) contain inactive/commented permission logic.

See [Authentication and permissions](AUTHENTICATION_AND_PERMISSIONS.md) for the complete flow and limitations.
