import { describe, expect, it } from 'vitest';
import AddLaborParams from '../add.labor.params';

describe('AddLaborParams', () => {
  it('maps all Labor relations to the API payload', () => {
    const params = new AddLaborParams({
      price: 100,
      measurementId: 5,
      translations: { title: { en: 'Installation', ar: 'تركيب' } },
      itemTypeId: 10,
      stageId: 20,
      subStageIds: [30, 31],
      status: true,
    });

    expect(params.toMap()).toEqual({
      price: 100,
      measurement_unit_id: 5,
      translations: { title: { en: 'Installation', ar: 'تركيب' } },
      item_type_id: 10,
      stage_id: 20,
      sub_stage_ids: [30, 31],
      status: true,
    });
    expect(params.validate().isValid).toBe(true);
  });

  it('requires the item type, stage, and sub-stage selections', () => {
    const result = new AddLaborParams({
      price: 100,
      measurementId: 5,
      translations: { title: { en: 'Installation' } },
    }).validate();

    expect(result.errors.map(({ field }) => field)).toEqual(
      expect.arrayContaining(['itemTypeId', 'stageId', 'subStageIds']),
    );
  });
});
