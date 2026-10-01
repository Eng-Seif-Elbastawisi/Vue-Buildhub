# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Organization users (inferred from the protected organization workspace and in-app copy):** staff at finishing and contracting companies who manage client and project operations.
- **Platform administrators (inferred from the protected admin workspace):** staff who manage organizations, administrators, packages, and shared configuration.
- The primary audience and priority workflow across these two workspaces remain undecided.

## Product Purpose

BuildHub is an operational admin dashboard. The existing application supports work from client and project intake through offers, task assignment, execution, invoicing, and payment, alongside platform administration. Future design work should help users complete these workflows clearly and efficiently.

## Operating Context

- The web app has separate authenticated organization and admin workspaces, with role-based routes.
- Organization workflows include clients, employees, suppliers, projects, offers and execution quotes, task assignments, invoices, payments, and related catalogs.
- Admin workflows include organizations, administrators, packages, subscriptions, and shared settings and catalogs.
- Tables, filters, and forms are everyday working surfaces. Existing desktop and mobile navigation are part of the app.

## Capabilities and Constraints

- Support Arabic with right-to-left layout and English with left-to-right layout. Both languages already have locale files and language switching in the app.
- Preserve existing functionality, data flow, routes, and business logic during future interface work.
- Treat the current interface as a functional reference; its visual style is not a requirement for a future redesign.
- Keep operational tables, filters, and forms practical and readable.
- The codebase uses Vue 3, TypeScript, Vite, PrimeVue, Pinia, Vue Router, and vue-i18n. Repository instructions in `AGENTS.md` remain authoritative for implementation.
- Any required approval workflow, market beyond the in-app company description, or additional product constraint remains unconfirmed.

## Brand Commitments

- The existing product name and logo are BuildHub.
- The user has specified a future dashboard direction: premium, modern, visually distinctive, with smooth and purposeful animation. This is a constraint for later design work, not a design system defined by this file.
- The requested surface is an operational dashboard, not a marketing website or landing page.

## Evidence on Hand

- Product and audience wording: `src/locales/en.json` and `src/locales/ar.json`, including organization and admin login copy.
- Active workflows and access: `src/router/index.ts`, `src/router/routes/`, and `src/shared/LayoutComponents/SubComponents/sidebar.config.ts`.
- Existing branding assets: `src/assets/images/BuildHubLogo.jpg`, `src/assets/images/BuildHub.jpg`, and `src/assets/logo.svg`.
- No customer proof, performance claim, or competitive differentiator has been confirmed for this product record.

## Product Principles

1. Make frequent operational tasks easy to scan and complete.
2. Give Arabic and English equal functional support, including reading direction.
3. Preserve established workflows and business behavior while improving the interface.
4. Use motion to clarify state and action without slowing down work.

## Accessibility & Inclusion

- Arabic RTL and English LTR are required across future dashboard work.
- Tables, filters, and forms must remain readable and usable in both languages.

## Design Workflow

- Design directly in code with a clear direction and a visual review.
