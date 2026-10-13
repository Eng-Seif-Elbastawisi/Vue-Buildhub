import { expect, it } from 'vitest';
import AssignQuoteEngineersParams from '../assign.quote.engineers.params';
it('serializes multiple primitive IDs', () =>
  expect(new AssignQuoteEngineersParams(140, [7, 12, 18]).toMap()).toEqual({
    quote_id: 140,
    engineer_ids: [7, 12, 18],
  }));
it.each([[], [7, 7], [0], [-1], [NaN], [1.5]])(
  'rejects empty, duplicate or invalid IDs %j',
  (ids) => expect(new AssignQuoteEngineersParams(140, ids).validate().isValid).toBe(false),
);
