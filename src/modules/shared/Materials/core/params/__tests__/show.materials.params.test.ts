import { describe, expect, it } from 'vitest';
import ShowMaterialParams from '../show.materials.params';

describe('ShowMaterialParams', () => {
  it('keeps allLocales for request headers but excludes it from the API payload', () => {
    const params = new ShowMaterialParams({ material_id: 5, allLocales: true });
    expect(params.allLocales).toBe(true);
    expect(params.toMap()).toEqual({ material_id: 5 });
  });
});
