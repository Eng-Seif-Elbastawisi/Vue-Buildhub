import { createMemoryHistory, createRouter } from 'vue-router';
import { describe, expect, it } from 'vitest';

import { executionQuoteRoutes } from './execution_quotes';

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/organization',
      component: { template: '<router-view />' },
      children: executionQuoteRoutes,
    },
  ],
});

describe('execution quote routes', () => {
  it.each([
    ['/organization/execution-quotes/add', undefined],
    ['/organization/execution-quotes/add/stages/12', '12'],
  ])('resolves %s to the quote builder with stage %s', (path, stageId) => {
    const resolvedRoute = router.resolve(path);

    expect(resolvedRoute.name).toBe('Add Execution Quote');
    expect(resolvedRoute.params.stageId).toBe(stageId);
  });
});
