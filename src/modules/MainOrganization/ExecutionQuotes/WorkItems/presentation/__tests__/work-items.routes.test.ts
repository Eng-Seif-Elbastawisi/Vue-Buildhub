import { expect, it } from 'vitest';
import { drawingsPath, workItemsPath } from '../work-items.routes';
it.each(['/organization', '/mainportal'])('preserves Quote and route prefix %s', (prefix) =>
  expect(workItemsPath(`${prefix}/execution-quotes/show/140`, 140)).toBe(
    `${prefix}/execution-quotes/show/140/work-items`,
  ),
);

it.each(['/organization', '/mainportal'])(
  'keeps drawings in the same Quote and workspace %s',
  (prefix) => {
    expect(drawingsPath(`${prefix}/execution-quotes/show/140/work-items`, 140)).toBe(
      `${prefix}/execution-quotes/show/140/drawings`,
    );
  },
);
