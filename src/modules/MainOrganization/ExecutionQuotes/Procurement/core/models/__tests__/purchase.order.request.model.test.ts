import { expect, it } from 'vitest';
import Model from '../purchase.order.request.model';
it('validates request ownership identifiers and status', () => {
  expect(Model.fromJson({ id: 1, quote_id: 140, project_id: 86, status: 3 }).quoteId).toBe(140);
  expect(() => Model.fromJson({ id: 1, quote_id: 140, project_id: 86, status: 9 })).toThrow();
});
