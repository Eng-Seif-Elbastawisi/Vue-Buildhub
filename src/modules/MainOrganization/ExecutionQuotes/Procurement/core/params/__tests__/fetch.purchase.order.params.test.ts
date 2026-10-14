import { expect, it } from 'vitest';
import Params from '../fetch.purchase.order.params';
it('sends only the required request identifier', () => {
  expect(new Params(2).toMap()).toEqual({ purchase_request_id: 2 });
  expect(new Params(0).validate().isValid).toBe(false);
});
