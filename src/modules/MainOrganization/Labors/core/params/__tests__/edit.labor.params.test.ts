import { describe, expect, it } from 'vitest';
import EditLaborParams from '../edit.labor.params';

describe('EditLaborParams', () => {
  it('keeps translated titles and all relation IDs in the update payload', () => {
    const params = new EditLaborParams({
      laborId: 7,
      price: 150,
      measurementId: 6,
      translations: { title: { en: 'Painting', ar: 'دهان' } },
      itemTypeId: 11,
      stageId: 21,
      subStageIds: [31, 32],
      status: false,
    });

    expect(params.toMap()).toEqual({
      labor_id: 7,
      price: 150,
      measurement_unit_id: 6,
      translations: { title: { en: 'Painting', ar: 'دهان' } },
      item_type_id: 11,
      stage_id: 21,
      sub_stage_ids: [31, 32],
      status: false,
    });
    expect(params.validate().isValid).toBe(true);
  });
});
