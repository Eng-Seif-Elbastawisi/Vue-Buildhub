import { expect, it } from 'vitest';
import PurchaseRequestSupplierPriceParams from '../purchase-request.supplier-price.params';
import { DurationType } from '@/modules/shared/Package/core/constants/duration.type.enum';
it.each(Object.values(DurationType))(
  'serializes supplier ID and confirmed numeric unit %s',
  (unit) => {
    const params = new PurchaseRequestSupplierPriceParams(3, 1500.25, 2, unit);
    expect(params.toMap()).toEqual({ id: 3, price: 1500.25, duration: 2, duration_type: unit });
    expect(params.validate().isValid).toBe(true);
  },
);
it.each([
  [0, 10, 2, 1],
  [3, NaN, 2, 1],
  [3, 10, 2.5, 1],
  [3, 10, 2, 9],
])('rejects invalid values %j', (id, price, duration, unit) => {
  expect(new PurchaseRequestSupplierPriceParams(id, price, duration, unit).validate().isValid).toBe(
    false,
  );
});

it('omits unchanged files and accepts only new Base64 replacements', () => {
  const offer = new PurchaseRequestSupplierPriceParams(1, 200, 5, 1);
  expect(offer.toMap()).not.toHaveProperty('attachment');
  offer.attachment = 'https://example.test/old.jpg';
  expect(offer.validate().isValid).toBe(false);
  offer.attachment = 'data:image/jpeg;base64,YQ==';
  expect(offer.validate().isValid).toBe(true);
  expect(offer.toMap().attachment).toBe('data:image/jpeg;base64,YQ==');
});
