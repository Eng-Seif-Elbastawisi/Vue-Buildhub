import { describe, expect, it } from 'vitest';
import ShowBrandParams from '../show.brand.params';

describe('ShowBrandParams', () => {
  it('keeps allLocales for request headers but excludes it from the API payload', () => {
    const params = new ShowBrandParams({ brand_id: 8, allLocales: true });

    expect(params.allLocales).toBe(true);
    expect(params.toMap()).toEqual({ brand_id: 8 });
    expect(new ShowBrandParams({ brand_id: null as unknown as number }).validate().isValid).toBe(
      false,
    );
  });
});
