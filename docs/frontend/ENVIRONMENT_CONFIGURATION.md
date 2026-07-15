# Environment configuration

[Documentation home](README.md) · [Installation](INSTALLATION_GUIDE.md) · [API integration](API_INTEGRATION.md) · [Build and deployment](BUILD_AND_DEPLOYMENT.md)

## Environment selection

The only application-defined Vite environment variable found in source is `VITE_APP_ENV`. [`src/base/Core/Config/environment.config.ts`](../../src/base/Core/Config/environment.config.ts) accepts these logical values:

- `development`
- `production`
- `test`

If the variable is absent or invalid, a Vite production build selects `production`; other builds select `development`. Vite chooses which `.env*` file to load based on its mode; this repository contains `.env`, `.env.development`, and `.env.production`.

Do not place passwords, bearer tokens, or private keys in `VITE_*` variables: Vite substitutes them into browser-delivered code.

## Variable reference

| Variable       | Purpose                                                                                 | Required                      | Safe example  | Used in                                      |
| -------------- | --------------------------------------------------------------------------------------- | ----------------------------- | ------------- | -------------------------------------------- |
| `VITE_APP_ENV` | Selects the named API/static-data/retry configuration object                            | Optional; mode-based fallback | `development` | `src/base/Core/Config/environment.config.ts` |
| `PROD`         | Vite built-in boolean used for the fallback stage when `VITE_APP_ENV` is absent/invalid | Built in                      | `false`       | `src/base/Core/Config/environment.config.ts` |
| `BASE_URL`     | Vite built-in public base path passed to HTML5 router history                           | Built in                      | `/`           | `src/router/index.ts`                        |

There are no source references to variable-based API URL, token, client secret, analytics key, or feature flag names.

## Repository environment files

| File               | Selected application environment | Notes                                                                                 |
| ------------------ | -------------------------------- | ------------------------------------------------------------------------------------- |
| `.env`             | `production`                     | Loaded by Vite in all modes, subject to mode-specific overrides                       |
| `.env.production`  | `production`                     | Used by a normal production build                                                     |
| `.env.development` | `test`                           | Development mode therefore selects the `test` configuration in the current repository |

Only the variable name and logical selection are documented here. Values from local or deployment environment files should be reviewed before release and must not be treated as secrets because the build exposes `VITE_*` data to the browser.

## Configuration object

[`environment.config.ts`](../../src/base/Core/Config/environment.config.ts) provides per-environment values for:

| Property           | Purpose                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------- |
| `stage`            | Selected logical environment name                                                        |
| `apiBaseUrl`       | Axios instance base URL                                                                  |
| `timeout`          | Axios request timeout                                                                    |
| `enableLogging`    | Enables error/diagnostic logging branches (many success log statements remain commented) |
| `useStaticData`    | Makes repositories return module mocks instead of sending requests                       |
| `enableRetry`      | Enables retry in standard service options                                                |
| `maxRetryAttempts` | Maximum attempts supplied to retry configuration                                         |
| `retryDelay`       | Initial retry delay before exponential backoff                                           |

The API URL is a hard-coded configuration value, not a separately configurable environment variable. [`src/base/Core/NetworkStructure/baseUrl.ts`](../../src/base/Core/NetworkStructure/baseUrl.ts) also exports a hard-coded base value, and [`BaseEndpoints.ts`](../../src/base/Data/Endpoints/BaseEndpoints.ts) constructs absolute module endpoints from it.

Development and production currently resolve to the same remote API host in source, while the test configuration uses a local host and static mock data. The exact hosts are intentionally omitted from this guide; they are public build configuration rather than credentials, but deployment operators should confirm them directly in the source.

## Type declarations

[`env.d.ts`](../../env.d.ts) currently contains only the Vite client type reference; it does not add a project-specific `ImportMetaEnv` declaration. New application variables should be prefixed with `VITE_`, typed in this file, and read with `import.meta.env`.

## Changing backend targets

The current architecture does not support overriding the backend host with a deployment-time `VITE_API_URL`. Changing targets requires a source/configuration change and a new build. If variable-based targets are added later, update:

1. `ImportMetaEnv` in `env.d.ts`.
2. `environment.config.ts` validation and mapping.
3. Endpoint construction so `BaseEndpoints` and the Axios instance use one source of truth.
4. Deployment configuration and this document.

Runtime mutation of environment variables after the bundle is built has no effect unless the deployment supplies an additional runtime configuration mechanism; none exists in the current source.

## Configuration checks

```bash
# Show variable names and assignments without documenting their values elsewhere
rg '^VITE_[A-Z0-9_]+=' .env .env.*

# Find every application variable reference
rg 'import\.meta\.env|VITE_' src vite.config.ts
```

If API requests unexpectedly use a local target during `npm run dev`, verify the `.env.development` selection and `VITE_APP_ENV` first.
