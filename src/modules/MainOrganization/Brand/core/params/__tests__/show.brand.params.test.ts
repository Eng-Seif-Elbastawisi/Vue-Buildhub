import { describe, expect, it } from 'vitest';
import ShowBrandParams from '../show.brand.params';

describe('ShowBrandParams', () => {
  it('maps and validates brand id', () => {
    expect(new ShowBrandParams({ brand_id: 8 }).toMap()).toEqual({ brand_id: 8 });
    expect(new ShowBrandParams({ brand_id: null as unknown as number }).validate().isValid).toBe(
      false,
    );
  });
});
