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

for (const prefix of ['organization', 'mainportal']) {
  const scheduleRouter = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: `/${prefix}`,
        component: { template: '<router-view />' },
        children: executionQuoteRoutes,
      },
    ],
  });
  it.each([
    ['/site-team', 'Quote Site Team', undefined],
    ['/work-items', 'Quote Work Items', undefined],
    ['/drawings', 'Quote Drawings', undefined],
    ['/procurement', 'Quote Procurement', undefined],
    ['/warehouse/material-receipt', 'Quote Material Receipt', undefined],
    ['/schedule', 'Quote Schedule', undefined],
    ['/schedule/add', 'Add Schedule Group', undefined],
    ['/schedule/201', 'Show Schedule Group', '201'],
    ['/schedule/201/edit', 'Edit Schedule Group', '201'],
  ])(`preserves owner/group params under ${prefix}: %s`, (suffix, name, groupId) => {
    const route = scheduleRouter.resolve(`/${prefix}/execution-quotes/show/101${suffix}`);
    expect(route.name).toBe(name);
    expect(route.params.id).toBe('101');
    expect(route.params.groupId).toBe(groupId);
  });
}
