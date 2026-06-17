import { describe, expect, it } from 'vitest';
import DeleteMaterialParams from '../delete.materials.params';

describe('DeleteMaterialParams', () => {
  it('maps and validates material id', () => {
    expect(new DeleteMaterialParams({ material_id: 5 }).toMap()).toEqual({ material_id: 5 });
    expect(
      new DeleteMaterialParams({ material_id: null as unknown as number }).validate().isValid,
    ).toBe(false);
  });
});
