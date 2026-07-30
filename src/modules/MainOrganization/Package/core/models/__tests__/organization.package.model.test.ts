import { describe, expect, it } from 'vitest';
import OrganizationPackageModel from '../organization.package.model';

describe('OrganizationPackageModel', () => {
  it('maps the available package response without calculating backend prices', () => {
    const packageOffer = OrganizationPackageModel.fromJson({
      id: '8',
      title: 'Professional',
      price: '500.00',
      price_after_discount: '450.00',
      discount_type: 1,
      discount_value: '10.00',
      duration_type: 3,
      duration: '6',
      features: [
        { id: 29, key: 1, key_name: 'NUMBER_OF_EMPLOYEES', value: 12 },
        { id: 30, key: 2, key_name: 'HAS_MOBILE', value: true },
      ],
      created_at: '2026-07-29 11:50:26',
    });

    expect(packageOffer).toEqual(
      expect.objectContaining({
        id: 8,
        title: 'Professional',
        price: '500.00',
        price_after_discount: '450.00',
        duration: 6,
      }),
    );
    expect(packageOffer.features).toEqual([
      expect.objectContaining({ key_name: 'NUMBER_OF_EMPLOYEES', value: 12 }),
      expect.objectContaining({ key_name: 'HAS_MOBILE', value: true }),
    ]);
  });

  it('normalizes malformed optional response fields safely', () => {
    const packageOffer = OrganizationPackageModel.fromJson({
      price: '25.00',
      features: [null, { value: { unsupported: true } }],
    });

    expect(packageOffer).toEqual(
      expect.objectContaining({
        id: 0,
        title: '',
        price: '25.00',
        price_after_discount: '25.00',
        duration: 0,
        created_at: '',
      }),
    );
    expect(packageOffer.features[0]?.value).toBe('');
    expect(packageOffer.features[1]?.value).toBe('');
  });
});
