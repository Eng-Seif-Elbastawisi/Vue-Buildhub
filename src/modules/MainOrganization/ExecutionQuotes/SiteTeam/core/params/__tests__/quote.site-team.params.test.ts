import { expect, it } from 'vitest';
import QuoteSiteTeamParams from '../quote.site-team.params';
it.each([0, -1, NaN, 1.5])('rejects invalid Quote owner %s', (id) =>
  expect(new QuoteSiteTeamParams(id).validate().isValid).toBe(false),
);
it('uses the Quote owner key', () =>
  expect(new QuoteSiteTeamParams(140).toMap()).toEqual({ quote_id: 140 }));
