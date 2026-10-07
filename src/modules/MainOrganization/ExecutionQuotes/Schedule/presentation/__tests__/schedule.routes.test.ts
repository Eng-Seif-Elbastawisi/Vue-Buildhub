import { expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { executionQuoteRoutes } from '@/router/routes/modules/execution_quotes';
import { quotePath, schedulePath } from '../schedule.routes';
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/organization',
      alias: '/mainportal',
      component: { template: '<router-view />' },
      children: executionQuoteRoutes,
    },
  ],
});
it.each(['organization', 'mainportal'])(
  'preserves the active %s alias for all Schedule navigation',
  (prefix) => {
    const currentPath = `/${prefix}/execution-quotes/show/101`;
    expect(quotePath(currentPath, 101)).toBe(currentPath);
    const basePath = schedulePath(currentPath, 101);
    for (const [suffix, name] of [
      ['', 'Quote Schedule'],
      ['/add', 'Add Schedule Group'],
      ['/201', 'Show Schedule Group'],
      ['/201/edit', 'Edit Schedule Group'],
    ]) {
      const resolved = router.resolve(`${basePath}${suffix}`);
      expect(resolved.name).toBe(name);
      expect(resolved.path).toContain(`/${prefix}/`);
      expect(resolved.params.id).toBe('101');
    }
  },
);
