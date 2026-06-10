import type { UserConfig } from '@commitlint/types';
// type in commit => [build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test]

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow scopes matching your module names (kebab-case)
    'scope-case': [2, 'always', 'kebab-case'],
    // Limit subject line to 100 chars (generous for descriptive commits)
    'header-max-length': [2, 'always', 200],
    // Disallow trailing period in subject
    'subject-full-stop': [2, 'never', '.'],
    // Subject must start with lowercase
    'subject-case': [2, 'always', 'lower-case'],
  },
};

export default config;
