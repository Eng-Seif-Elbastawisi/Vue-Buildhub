import { describe, expect, it } from 'vitest';
import DeleteBrandParams from '../delete.brand.params';

describe('DeleteBrandParams', () => {
  it('maps and validates brand id', () => {
    expect(new DeleteBrandParams({ brand_id: 3 }).toMap()).toEqual({ brand_id: 3 });
    expect(new DeleteBrandParams({ brand_id: null as unknown as number }).validate().isValid).toBe(
      false,
    );
  });
});
