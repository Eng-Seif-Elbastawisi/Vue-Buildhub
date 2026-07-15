# Installation guide

[Documentation home](README.md) · [Environment configuration](ENVIRONMENT_CONFIGURATION.md) · [Development guide](DEVELOPMENT_GUIDE.md) · [Troubleshooting](TROUBLESHOOTING.md)

## Requirements

| Requirement     | Confirmed value                                                                              |
| --------------- | -------------------------------------------------------------------------------------------- |
| Node.js         | `^20.19.0` or `>=22.12.0` from `package.json#engines`                                        |
| Package manager | npm; `package-lock.json` and npm-based Husky scripts are committed                           |
| Browser         | A modern browser supporting ESNext output, modules, local/session storage, and HTML5 history |

The Docker builder currently uses `node:20-alpine`. Because that tag floats within Node 20, ensure the resolved image is at least Node 20.19.

The exact engine declaration is:

```json
"node": "^20.19.0 || >=22.12.0"
```

Check local versions:

```bash
node --version
npm --version
```

## Install dependencies

For a reproducible clean installation:

```bash
npm ci
```

Use `npm install` only when intentionally updating dependency resolution or the lockfile:

```bash
npm install
```

The `prepare` script installs Husky hooks during installation.

## Environment setup

The only custom environment variable read by application code is:

```dotenv
VITE_APP_ENV=development
```

Accepted values are `development`, `production`, and `test`. Existing `.env`, `.env.development`, and `.env.production` files define this name. Do not copy actual private values into documentation or commit secrets to `VITE_*` variables. See [Environment configuration](ENVIRONMENT_CONFIGURATION.md).

Important behavior:

- `development` and `production` use the API URL compiled into [`environment.config.ts`](../../src/base/Core/Config/environment.config.ts).
- `test` enables static repository data globally and points the network configuration at a local placeholder API, although individual controllers may force static or live behavior.
- If the variable is absent or invalid, a production Vite build selects `production`; other modes select `development`.

## Start the development server

```bash
npm run dev
```

Vite prints the actual local URL and port. No fixed dev-server port is configured in [`vite.config.ts`](../../vite.config.ts).

## Create and preview a production build

```bash
npm run build
npm run preview
```

`npm run build` runs `vue-tsc -b` before `vite build`. Output is written to `dist/` because no custom `build.outDir` is configured.

## Available npm scripts

These commands exactly match [`package.json`](../../package.json):

| Command                 | Script                                          | Purpose                                                   |
| ----------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| `npm run dev`           | `vite`                                          | Start the Vite development server                         |
| `npm run build`         | `vue-tsc -b && vite build`                      | Type-check project references and build production assets |
| `npm run preview`       | `vite preview`                                  | Serve `dist/` for local verification                      |
| `npm test`              | `vitest`                                        | Run Vitest in watch mode                                  |
| `npm run test:run`      | `vitest run`                                    | Run the full suite once                                   |
| `npm run test:coverage` | `vitest run --coverage`                         | Run tests with coverage collection                        |
| `npm run type-check`    | `vue-tsc --noEmit`                              | Type-check Vue and TypeScript without output              |
| `npm run lint`          | `eslint . --ext .ts,.vue --fix`                 | Lint and auto-fix TypeScript/Vue files                    |
| `npm run format`        | `prettier --write "src/**/*.{ts,vue,scss,css}"` | Format source files                                       |
| `npm run prepare`       | `husky`                                         | Install Git hooks                                         |
| `npm run gitPush`       | `git push origin HEAD --no-verify`              | Bypass hooks; avoid in normal development                 |

Focused test examples:

```bash
npx vitest run src/stores/__tests__/example.test.ts
npx vitest run -t "test name"
```

## Common installation errors

### Unsupported Node version

Symptoms include npm engine warnings, Vite startup errors, or unavailable runtime APIs.

```bash
node --version
```

Install Node 20.19+ or 22.12+ and rerun `npm ci`.

### Lockfile/install mismatch

`npm ci` fails if `package.json` and `package-lock.json` disagree. Do not delete the lockfile as a first response. On a branch intentionally changing dependencies, run `npm install`, review the lockfile diff, then retry `npm ci` in a clean checkout.

### Native/Sass installation errors

The project uses `sass-embedded`. Clear only npm's verified cache and reinstall:

```bash
npm cache verify
rm -rf node_modules
npm ci
```

`node_modules` is generated content; removing it does not alter application source.

### Husky fails outside a Git checkout

Some container/build contexts do not include `.git`. If install fails only during `prepare`, confirm the checkout and npm/Husky environment. The committed Docker build copies the repository after `npm ci`, so deployment builders should be tested with the current install lifecycle.

### Port already in use

Vite normally selects another port. To request one explicitly without changing project files:

```bash
npm run dev -- --port 5174
```

### API unavailable after successful installation

Installation does not validate backend availability. Confirm the selected `VITE_APP_ENV`, browser network request URL, CORS response, and authentication header. Continue with [API troubleshooting](TROUBLESHOOTING.md#api-connection-errors).
