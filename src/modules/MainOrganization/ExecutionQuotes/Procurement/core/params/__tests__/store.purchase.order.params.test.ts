import { expect, it } from 'vitest';
import Params from '../store.purchase.order.params';
it('serializes only documented fields, omitting an absent attachment', () => {
  const params = new Params(2, 4, null, null, '2026-10-14');
  expect(params.toMap()).toEqual({
    purchase_request_id: 2,
    purchase_request_price_id: 4,
    note: null,
    date: '2026-10-14',
  });
  expect(params.validate().isValid).toBe(true);
});
it('preserves optional notes and the complete Base64 attachment', () => {
  const params = new Params(2, 4, 'Notes', 'data:application/pdf;base64,JVBERg==', '2026-10-14');
  expect(params.toMap().file).toBe('data:application/pdf;base64,JVBERg==');
  expect(params.validate().isValid).toBe(true);
});
it.each(['', '2026-02-30', '14-10-2026'])('rejects invalid date %s', (date) => {
  expect(new Params(2, 4, null, null, date).validate().isValid).toBe(false);
});
it('does not accept a fetched URL as upload input', () => {
  expect(
    new Params(2, 4, null, 'https://example.com/file.pdf', '2026-10-14').validate().isValid,
  ).toBe(false);
});
