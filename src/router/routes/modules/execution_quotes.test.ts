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
  it('resolves the quote setup page separately from the builder', () => {
    const resolvedRoute = router.resolve('/organization/execution-quotes/add');

    expect(resolvedRoute.name).toBe('Add Execution Quote');
    expect(resolvedRoute.params.stageId).toBeUndefined();
  });

  it.each([
    ['/organization/execution-quotes/add/stages?id=28', undefined],
    ['/organization/execution-quotes/add/stages/12?id=28', '12'],
  ])('resolves %s to the quote builder with stage %s', (path, stageId) => {
    const resolvedRoute = router.resolve(path);

    expect(resolvedRoute.name).toBe('Build Execution Quote');
    expect(resolvedRoute.params.stageId).toBe(stageId);
    expect(resolvedRoute.query.id).toBe('28');
  });

  it('resolves the execution quote show page', () => {
    const resolvedRoute = router.resolve('/organization/execution-quotes/show/28');

    expect(resolvedRoute.name).toBe('Show Execution Quote');
    expect(resolvedRoute.params.id).toBe('28');
  });
});
