import { describe, expect, it } from 'vitest';
import TitleModel from '@/base/Core/Models/titleModel';
import { UnitTypeEnum } from '@/modules/shared/Materials/core/constant/unit.type.enum';
import StageModel from '@/modules/shared/Stages/core/models/stage.model';
import LaborModel from '../labor.model';

describe('LaborModel', () => {
  it('maps API relations to their domain models', () => {
    const labor = LaborModel.fromJson({
      id: 1,
      title: 'Installation',
      price: '125.50',
      unit: UnitTypeEnum.meter,
      translations: [{ locale: 'en', title: 'Installation' }],
      item_type: { id: 10, title: 'Finishing' },
      measurement_unit: { id: 40, title: 'Meter' },
      stage: { id: 20, title: 'Execution' },
      sub_stages: [{ id: 30, title: 'Painting' }],
      default_pricing_mode: 'configured',
      active_mapping_count: 3,
      mapping_readiness: 'ready',
      status: 1,
    });

    expect(labor.itemType).toBeInstanceOf(TitleModel);
    expect(labor.stage).toBeInstanceOf(StageModel);
    expect(labor.subStage).toBeInstanceOf(StageModel);
    expect(labor.itemType).toMatchObject({ id: 10, title: 'Finishing' });
    expect(labor.measurementUnit).toMatchObject({ id: 40, title: 'Meter' });
    expect(labor.stage).toMatchObject({ id: 20, title: 'Execution' });
    expect(labor.subStage).toMatchObject({ id: 30, title: 'Painting' });
    expect(labor.subStages).toMatchObject([{ id: 30, title: 'Painting' }]);
    expect(labor.status).toBe(true);
    expect(labor.pricingMode).toBe('configured');
    expect(labor.activeMappingCount).toBe(3);
    expect(labor.mappingReady).toBe(true);
    expect(Object.isFrozen(labor)).toBe(true);
  });

  it('uses safe table defaults when optional pricing and mapping fields are absent', () => {
    const labor = LaborModel.fromJson({
      title: 'Manual labor',
      price: 50,
      unit: UnitTypeEnum.bag,
      translations: [],
    });

    expect(labor.pricingMode).toBe('manual_entry');
    expect(labor.activeMappingCount).toBe(0);
    expect(labor.mappingReady).toBe(false);
  });

  it('does not map a missing sub-stage list', () => {
    const labor = LaborModel.fromJson({
      title: 'Manual labor',
      price: 50,
      unit: UnitTypeEnum.bag,
      translations: [],
    });

    expect(labor.subStages).toEqual([]);
    expect(labor.subStage).toBeUndefined();
  });

  it('maps sub_stages returned by the list endpoint', () => {
    const labor = LaborModel.fromJson({
      title: 'Manual labor',
      price: 50,
      unit: UnitTypeEnum.bag,
      translations: [],
      sub_stages: [{ id: 30, title: 'Painting' }],
    });

    expect(labor.subStages).toMatchObject([{ id: 30, title: 'Painting' }]);
    expect(labor.subStage).toMatchObject({ id: 30, title: 'Painting' });
  });
});
