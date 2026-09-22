import { describe, expect, it } from 'vitest';
import AddMaterialsParams from '../add.materials.params';

describe('AddMaterialsParams', () => {
  it('maps and validates material create payload', () => {
    const translations = { title: { en: 'Cement', ar: 'Cement AR' } };
    const params = new AddMaterialsParams({
      price: 12,
      brandId: 3,
      measurementId: 2,
      translations,
      itemTypeId: 4,
      stageId: 5,
      subStageIds: [6, 7],
      status: true,
    });
    expect(params.toMap()).toEqual({
      price: 12,
      brand_id: 3,
      measurement_unit_id: 2,
      translations,
      item_type_id: 4,
      stage_id: 5,
      sub_stage_ids: [6, 7],
      status: true,
    });
    expect(params.validate().isValid).toBe(true);
  });
});
