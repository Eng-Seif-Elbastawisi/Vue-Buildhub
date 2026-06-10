module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
  },
  extends: [
    // Vue 3 recommended (includes essential + strongly-recommended)
    'plugin:vue/vue3-recommended',
    // TypeScript recommended
    'plugin:@typescript-eslint/recommended',
    // Must be last — disables all formatting rules that conflict with Prettier
    'prettier',
  ],
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    // ── Vue ──────────────────────────────────────────────────────────────────
    // PrimeVue + shared components use single-word names (Index, Card, etc.)
    'vue/multi-word-component-names': 'off',
    // v-html is used sparingly — keep as warning
    'vue/no-v-html': 'warn',
    // Enforce consistent component composition API usage
    'vue/component-api-style': ['warn', ['script-setup', 'composition']],
    // Always declare emits
    'vue/require-explicit-emits': 'warn',
    // Block order: script → template → style
    'vue/block-order': ['warn', { order: ['script', 'template', 'style'] }],
    // Attribute hyphenation (PrimeVue uses PascalCase props)
    'vue/attribute-hyphenation': 'warn',
    // Unused vars in templates
    'vue/no-unused-vars': 'error',

    // ── TypeScript — warn-only during incremental adoption ───────────────────
    // any is used in base infrastructure and PrimeVue interop
    '@typescript-eslint/no-explicit-any': 'warn',
    // Unused vars — block commits
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    // Enforce type-only imports (can auto-fix)
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],
    // Non-null assertion — warn, not block
    '@typescript-eslint/no-non-null-assertion': 'warn',
    // non-null assertion on optional chain IS unsafe — keep as error
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
    // Empty functions used in base abstract classes
    '@typescript-eslint/no-empty-function': 'warn',
    // Declaration merging in base infrastructure
    '@typescript-eslint/no-unsafe-declaration-merging': 'warn',
    // require() is used in one config file — warn only
    '@typescript-eslint/no-var-requires': 'warn',

    // ── General — errors that should always block a commit ────────────────────
    // No console.log in production code (project rules)
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  ignorePatterns: [
    'dist/',
    'dist-ssr/',
    'node_modules/',
    'coverage/',
    'public/',
    'eslint.config.js',
    'vite.config.ts',
    'vitest.config.ts',
    'commitlint.config.ts',
  ],
};
