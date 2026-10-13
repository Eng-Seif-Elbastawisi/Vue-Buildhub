import { describe, expect, it } from 'vitest';
import measurementModel from '@/modules/shared/measurement/core/models/measurement.model';
import MaterialsShowModel from '../materials.show.model';

describe('MaterialsShowModel', () => {
  it('normalizes translated material details for edit forms', () => {
    const brand = measurementModel.example;
    const model = MaterialsShowModel.fromJson({
      id: 2,
      brand,
      price: 90,
      quantity: '10',
      unit: 1,
      title: [{ locale: 'en', title: 'Steel' }],
      status: 0,
    });

    expect(model.id).toBe(2);
    expect(model.quantity).toBe(10);
    expect(model.brand).toMatchObject({ id: brand.id, title: brand.title });
    expect(model.translations.title).toEqual({ en: 'Steel' });
    expect(model.status).toBe(false);
  });

  it('maps plural sub-stage relations for edit forms', () => {
    const model = MaterialsShowModel.fromJson({
      sub_stages: [
        { id: 6, title: 'Sub-stage 1' },
        { id: 7, title: 'Sub-stage 2' },
      ],
    });

    expect(model.subStages).toMatchObject([
      { id: 6, title: 'Sub-stage 1' },
      { id: 7, title: 'Sub-stage 2' },
    ]);
  });

  it('does not convert the legacy singular sub-stage relation into a list', () => {
    const model = MaterialsShowModel.fromJson({
      sub_stage: { id: 6, title: 'Legacy sub-stage' },
    });

    expect(model.subStages).toEqual([]);
    expect(model.subStage).toBeUndefined();
  });
});
