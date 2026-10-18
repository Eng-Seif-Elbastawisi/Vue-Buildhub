import { expect, it } from 'vitest';
import { materialDisbursementPath } from '../material-disbursement.routes';

it.each(['organization', 'mainportal'])(
  'keeps %s and the current quote in the disbursement path',
  (prefix) => {
    expect(
      materialDisbursementPath(
        `/${prefix}/execution-quotes/show/23/warehouse/material-receipt`,
        140,
      ),
    ).toBe(`/${prefix}/execution-quotes/show/140/warehouse/material-disbursement`);
  },
);
