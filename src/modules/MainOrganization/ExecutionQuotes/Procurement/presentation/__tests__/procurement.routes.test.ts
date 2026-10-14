import { expect, it } from 'vitest';
import { procurementPath } from '../procurement.routes';
it.each(['/organization', '/mainportal'])('preserves owner and workspace prefix %s', (prefix) =>
  expect(procurementPath(`${prefix}/execution-quotes/show/140`, 140)).toBe(
    `${prefix}/execution-quotes/show/140/procurement`,
  ),
);
