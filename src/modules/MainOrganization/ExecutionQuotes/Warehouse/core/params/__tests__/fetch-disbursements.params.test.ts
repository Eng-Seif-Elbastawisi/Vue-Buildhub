import { expect, it } from 'vitest';
import FetchDisbursementsParams from '../fetch-disbursements.params';

it('scopes history fetching by quote rather than purchase request', () => {
  const params = new FetchDisbursementsParams(140);
  expect(params.toMap()).toEqual({ quote_id: 140 });
  expect(params.validate().isValid).toBe(true);
  expect(new FetchDisbursementsParams(-1).validate().isValid).toBe(false);
});
