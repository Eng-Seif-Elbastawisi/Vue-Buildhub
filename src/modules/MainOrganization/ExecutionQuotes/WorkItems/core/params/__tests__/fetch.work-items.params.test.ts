import { expect, it } from 'vitest';
import FetchWorkItemsParams from '../fetch.work-items.params';
it('scopes fetch to Quote and rejects a guessed/invalid owner', () => {
  expect(new FetchWorkItemsParams(140).toMap()).toEqual({ quote_id: 140 });
  expect(new FetchWorkItemsParams(0).validate().isValid).toBe(false);
});
