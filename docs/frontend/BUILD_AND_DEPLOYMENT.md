# Build and deployment

[Documentation home](README.md) · [Installation](INSTALLATION_GUIDE.md) · [Environment](ENVIRONMENT_CONFIGURATION.md) · [Troubleshooting](TROUBLESHOOTING.md)

## Production build

Use the exact npm script from [`package.json`](../../package.json):

```bash
npm ci
npm run build
```

The build script is:

```text
vue-tsc -b && vite build
```

Type errors stop the build before Vite bundles the application.

## Requirements

| Requirement             | Confirmed configuration                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| Node.js                 | `^20.19.0` or `>=22.12.0`                                                                                 |
| Package manager         | npm with committed `package-lock.json`                                                                    |
| Build mode              | Vite production mode through `vite build`                                                                 |
| Application environment | `VITE_APP_ENV`; production is selected automatically for a production build when no valid override exists |
| Backend                 | Browser-accessible API host compiled into endpoint/environment configuration                              |
| Web server              | Static-file server with HTML5 history fallback                                                            |

## Output

Vite writes the build to `dist/`; [`vite.config.ts`](../../vite.config.ts) does not override `build.outDir`. The directory contains `index.html`, hashed assets, and copied public files.

Verify locally:

```bash
npm run preview
```

`vite preview` is a verification server, not the intended production process.

## Docker deployment

[`Dockerfile`](../../Dockerfile) implements a two-stage image:

1. `node:20-alpine` installs with `npm ci` and runs `npm run build` in `/app`.
2. `nginx:stable-alpine` removes the default site, copies `/app/dist` to `/usr/share/nginx/html`, installs [`nginx.conf`](../../nginx.conf), exposes port 80, and starts nginx in the foreground.

Build and run:

```bash
docker build -t buildhub-frontend .
docker run --rm -p 8080:80 buildhub-frontend
```

Use a pinned Node builder tag that satisfies Node 20.19+ if reproducibility is required; the current `node:20-alpine` tag is floating.

## SPA route fallback

Vue Router uses HTML5 history via `createWebHistory()`. The server must return `index.html` for application URLs that do not match a physical asset.

The committed nginx rule is:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Equivalent fallback configuration is required on S3/CDN, Apache, IIS, or another static host. Without it, direct navigation or refresh on `/admin/...` and `/organization/...` returns a server 404 before Vue runs.

## Asset handling

- Imports from `src/assets` are transformed and fingerprinted by Vite.
- Files in `public` are copied without transformation and keep their names.
- The `@` alias resolves to `src` at build time.
- SCSS can resolve imports from `src/styles` through `loadPaths`.
- `src/main.ts` imports committed `src/styles/main.min.css`, so ensure global source stylesheet changes are reflected in that runtime file.
- Image paths returned by backend models must be reachable from the deployed browser; no server-side image proxy exists.

## Cache policy

The committed nginx configuration:

- caches JS, CSS, fonts, SVG, and raster images for one year with `public, immutable`;
- sends `no-store, no-cache, must-revalidate` for `index.html`;
- enables gzip for text, CSS, JSON, JavaScript, and XML.

This suits Vite-hashed assets. Be careful with non-fingerprinted files from `public`: the extension-based one-year rule also applies to them, so changing a public file without renaming/versioning it may leave clients with stale content.

## Environment variables

`VITE_*` values are build-time substitutions. They are not secrets and changing a container environment variable after `dist` is built does not rewrite the bundle.

The only custom variable is:

```dotenv
VITE_APP_ENV=production
```

The actual API host is hard-coded in both environment/base endpoint configuration. Confirm it before building. See [Environment configuration](ENVIRONMENT_CONFIGURATION.md).

## Deployment checklist

1. Use a supported Node version and `npm ci`.
2. Select the intended `VITE_APP_ENV` at build time.
3. Run `npm run type-check`, `npm run test:run`, and `npm run build`.
4. Inspect the bundle/deployment logs for accidental credentials; never inject private values into `VITE_*`.
5. Serve `dist/` over HTTPS.
6. Configure SPA fallback without rewriting real assets.
7. Permit the frontend origin in backend CORS configuration.
8. Verify `/login-admin`, `/login-organization`, a nested protected route, API login, file/image loading, English/Arabic, and logout.
9. Verify that `index.html` is not cached and hashed assets are cached.

## Build troubleshooting

### Type-check failure

```bash
npm run type-check
npx vue-tsc -b
```

The first mirrors the standard check; the second isolates the build's TypeScript phase. Fix strict types, unused symbols, and case-sensitive imports.

### Build succeeds locally but fails in Docker

Check Node version and import casing. Linux filesystems distinguish `Item` from `item` and `Suppliers` from `suppliers`.

```bash
docker build --no-cache -t buildhub-frontend .
```

### JavaScript chunk fails after deployment

Confirm `index.html` is not served from an old cache and that all hashed assets from the same `dist` deployment were uploaded atomically. Do not mix assets from two builds.

### Backend target is wrong

`VITE_APP_ENV` selects a configuration, but endpoint classes build URLs from `src/base/Core/NetworkStructure/baseUrl.ts`. Review both sources; changing only container runtime variables after build will not help.
