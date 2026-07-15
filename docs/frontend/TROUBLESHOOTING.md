# Troubleshooting

[Documentation home](README.md) · [Installation](INSTALLATION_GUIDE.md) · [Environment](ENVIRONMENT_CONFIGURATION.md) · [Build and deployment](BUILD_AND_DEPLOYMENT.md)

Use browser developer tools, the terminal command that failed, and the exact selected environment as evidence. Never paste bearer tokens, passwords, full login responses, or private deployment configuration into an issue.

## Dependency installation errors

Confirm the engine and npm lockfile workflow:

```bash
node --version
npm --version
npm cache verify
rm -rf node_modules
npm ci
```

Node must satisfy `^20.19.0 || >=22.12.0`. Do not delete or regenerate `package-lock.json` unless dependency resolution is intentionally changing. If Husky installation fails, confirm the checkout contains `.git` and that the environment permits the `prepare` script.

## Missing or unexpected environment selection

Symptoms include mock/static data, a local API target during development, or unexpected timeout/retry behavior.

```bash
rg '^VITE_APP_ENV=' .env .env.*
rg 'VITE_APP_ENV|useStaticData' src/base src/modules
```

The committed development-mode file selects the test stage, whose repositories use static data. The country controller independently forces static list data. Restart Vite after changing an environment file.

## API connection errors

In the browser Network panel, check:

1. the complete request URL and prefix (`mainportal`, `organization`, `dashboard`, or `general`);
2. request method (standard CRUD is normally POST);
3. CORS/preflight response;
4. `Accept-Language`, `x-country`, and bearer header;
5. response status and envelope shape;
6. whether the selected environment enables static data.

The Axios instance base URL and the absolute endpoint base constant are separate sources. If only one changed, feature requests may continue to the old host. A timeout becomes `DataTimeout`; offline failures become `DataNoNetwork`; retry only applies to errors classified as retryable.

## Authentication issues

### Login succeeds but returns to login

Inspect the mapped user without exposing tokens. Confirm `user.type` is numeric `1` or `2`, `isAuth` is true, `apiToken` is present and usable, `localStorage.user` can be written, and `expiresAt` is in the future. The guard requires all of these local session conditions.

### Immediate or unexpected logout

The client sets expiry to 24 hours from its own clock. A badly skewed device clock or an old persisted `expiresAt` can trigger `initFromPersist()` logout. Clearing application storage and signing in again is a safe diagnostic step:

```text
Browser DevTools -> Application -> Storage -> Clear site data
```

This removes local preferences and drafts too.

### Backend returns 401 but the login redirect is unexpected

The global interceptor clears the user session on HTTP 401. Requests made from `/admin...` redirect to `/login-admin`; all other non-login paths redirect to `/login-organization`. A 401 received while already on either login page clears stale auth state but does not navigate again. Inspect the failing endpoint and backend token validity; do not add retry loops around authentication failures.

HTTP 403 is different: it remains a typed request failure and does not automatically end the session.

### Authenticated request has no Authorization header

Verify that the API call is marked authenticated and the login response mapped `apiToken`. The header builder intentionally omits `Authorization` for missing, blank, placeholder, or whitespace-containing token values. It never generates empty, `undefined`, or `null` bearer headers.

### Logout removed or retained unexpected browser data

Logout removes only `localStorage.user`. Locale, country, organization-toggle, system-identity, and other unrelated local values remain. To clear all application preferences for troubleshooting, use the browser's “Clear site data” control explicitly; logout does not perform that broader operation.

## Route not found or wrong redirect

- Verify the route in [Routes documentation](ROUTES_DOCUMENTATION.md).
- Shared route names are suffixed with `Admin` or `Organization`.
- Confirm optional versus required `:id` parameters.
- The root catch-all redirects to `/not-found`, but unauthenticated users are then redirected to login by the guard.
- A user entering the other role prefix is redirected to their own application root.
- Server 404 on browser refresh indicates missing SPA fallback; see [Build and deployment](BUILD_AND_DEPLOYMENT.md#spa-route-fallback).

Duplicate configured route paths exist (notably system identity and some admin-area records). When navigation appears to load an unexpected component, inspect the router record order in `src/router/index.ts` and its route aggregates.

## Dynamic import and chunk errors

Typical messages include “Failed to fetch dynamically imported module” or a missing hashed JavaScript file.

- Hard-refresh once and inspect the requested asset URL.
- Ensure `index.html` and `assets/` came from the same atomic deployment.
- Purge stale CDN/service-proxy cache for `index.html`.
- Check exact import casing; local case-insensitive filesystems can hide Linux failures.
- Rebuild rather than copying individual chunks:

```bash
rm -rf dist
npm run build
```

No service worker is implemented, so service-worker cache is not an application-controlled cause.

## Build and type errors

Run narrow checks before the complete build:

```bash
npm run type-check
npm run test:run
npm run build
```

Common confirmed causes are unused variables/parameters, incompatible model field types, missing Vue component imports, and case mismatches. `npm run lint` auto-fixes files; review its diff.

If a commit is rejected because a staged source lacks a test, run:

```bash
node scripts/check-test-coverage.mjs
```

Add an accepted companion test rather than bypassing the hook.

## Vite development server issues

### Port conflict or inaccessible host

```bash
npm run dev -- --port 5174
npm run dev -- --host 0.0.0.0
```

No fixed `server.port` or proxy is configured. API requests go directly to the compiled backend host, so a Vite proxy issue is not expected.

### Stale transformed modules

Stop Vite, remove only its generated cache, and restart:

```bash
rm -rf node_modules/.vite
npm run dev
```

Reinstall dependencies only if the cache reset and error details point to dependency resolution.

## Memory or file-watcher issues

For a large test/build process that exhausts Node memory:

```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run build
NODE_OPTIONS=--max-old-space-size=4096 npm run test:run
```

In containers, network mounts, or WSL, file watchers may miss changes or hit OS limits. Prefer a local filesystem and raise the host's watcher limit according to its operating-system policy. Polling is available as a temporary diagnostic:

```bash
CHOKIDAR_USEPOLLING=true npm run dev
```

Polling consumes more CPU and should not be the default without need.

## Styles do not update

`src/main.ts` imports `src/styles/main.min.css`, not `main.scss`. Confirm the changed rule is in an imported component style or has been compiled into the committed runtime CSS. Also check CSS custom-property identity values applied by the user/system-identity flow and the root `dark` class.

Run Stylelint on a target when needed:

```bash
npx stylelint "src/path/Component.vue"
```

Prefer tokens/custom properties to literal colors.

## Missing or untranslated labels

Compare English and Arabic catalogs:

```bash
node -e "const fs=require('fs'); for (const f of ['en','ar']) console.log(f, Object.keys(JSON.parse(fs.readFileSync('src/locales/'+f+'.json'))).length)"
```

The catalogs currently have known asymmetry. English lacks `project.Type` and `Project.steps.project_items_description`; Arabic lacks `Project.steps.project_department`, `Project.steps.project_department_description`, and `project_department`. Confirm key casing as JSON keys are case-sensitive.

Locale storage is also inconsistent: navigation writes `locale`, while request headers and the language switcher read `lang`. If UI language and `Accept-Language` differ, inspect both local-storage keys. This behavior is confirmed from source.

## File upload or export problems

- Confirm `accept`, file count, and browser FileReader errors for `HandleFilesUpload`.
- Revoke/reselect stale local object URLs by reopening the form.
- `ExportPdf` captures the first `.table-responsive`; ensure the intended table is present and visible.
- Client PDFs rely on browser canvas/font/image access; cross-origin images without correct CORS headers can taint a canvas.
- `export_invoice` is a JSON POST with no blob response configuration; verify the backend response contract before treating it as a file download.

## Escalation information

Provide:

- route and user type (never the token);
- Node/npm/browser versions;
- selected `VITE_APP_ENV` name;
- failing command and complete sanitized stack trace;
- request path suffix, method, status, and sanitized response envelope;
- reproducible steps and whether the issue occurs in dev, preview, Docker, or deployed nginx.
