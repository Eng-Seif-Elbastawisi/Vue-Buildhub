import { expect, it } from 'vitest';
import { workItemsPath } from '../work-items.routes';
it.each(['/organization', '/mainportal'])('preserves Quote and route prefix %s', (prefix) =>
  expect(workItemsPath(`${prefix}/execution-quotes/show/140`, 140)).toBe(
    `${prefix}/execution-quotes/show/140/work-items`,
  ),
);
