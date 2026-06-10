#!/usr/bin/env node
/**
 * Ensures every staged .ts / .vue file (excluding pages, routers, stores,
 * barrel indexes, and type declarations) has a companion test file.
 *
 * Accepted test locations for src/foo/bar/Baz.ts:
 *   src/foo/bar/__tests__/Baz.test.ts
 *   src/foo/bar/__tests__/Baz.spec.ts
 *   src/foo/bar/Baz.spec.ts
 *   src/foo/bar/Baz.test.ts
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');

/** Patterns that mark a file as NOT requiring a test */
const SKIP = [
  /\/views\//, // page components
  /\/App\.vue$/, // root component
  /\/main\.ts$/, // entry point
  /\/index\.ts$/, // barrel re-exports
  /\.d\.ts$/, // ambient declarations
  /__tests__\//, // already a test dir
  /\.(spec|test)\.ts$/, // already a test file
  /\/router\//, // routing config
  /\/stores\//, // Pinia stores
  /\/locales\//, // i18n JSON/TS
  /\/assets\//,
  /\/styles\//,
  /\/icons\//, // SVG icon components — visual only
  /\/base\//, // framework layer
];

function skip(rel) {
  return SKIP.some((re) => re.test(rel.replace(/\\/g, '/')));
}

function testExists(absPath) {
  const dir = path.dirname(absPath);
  const ext = path.extname(absPath); // .ts or .vue
  const stem = path.basename(absPath, ext); // e.g. "LangInput"

  return [
    path.join(dir, '__tests__', `${stem}.test.ts`),
    path.join(dir, '__tests__', `${stem}.spec.ts`),
    path.join(dir, `${stem}.spec.ts`),
    path.join(dir, `${stem}.test.ts`),
  ].some(existsSync);
}

// ── Gather staged files ────────────────────────────────────────────────────
let staged;
try {
  staged = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean);
} catch {
  // Not inside a git repo or no staged files — nothing to check
  process.exit(0);
}

const missing = staged.filter((rel) => {
  const abs = path.resolve(ROOT, rel);
  if (!abs.startsWith(SRC)) return false; // outside src/
  if (!/\.(ts|vue)$/.test(rel)) return false; // not TS/Vue
  if (skip(rel)) return false; // explicitly excluded
  return !testExists(abs);
});

if (missing.length === 0) {
  if (staged.some((f) => /\.(ts|vue)$/.test(f))) {
    console.log('[check-test-coverage] All files have a companion test.');
  }
  process.exit(0);
}

console.error('\n[check-test-coverage] Missing test files:\n');
missing.forEach((f) => console.error(`  MISSING  ${f}`));
console.error(`
Each .ts/.vue file needs a companion test — one of:
  <dir>/__tests__/<Name>.test.ts   (preferred)
  <dir>/__tests__/<Name>.spec.ts
  <dir>/<Name>.spec.ts
  <dir>/<Name>.test.ts

Excluded from this rule: views/, router/, stores/, index.ts, *.d.ts, icons/
`);
process.exit(1);
