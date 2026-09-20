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
      stage: { id: 20, title: 'Execution' },
      sub_stage: { id: 30, title: 'Painting' },
      status: 1,
    });

    expect(labor.itemType).toBeInstanceOf(TitleModel);
    expect(labor.stage).toBeInstanceOf(StageModel);
    expect(labor.subStage).toBeInstanceOf(StageModel);
    expect(labor.itemType).toMatchObject({ id: 10, title: 'Finishing' });
    expect(labor.stage).toMatchObject({ id: 20, title: 'Execution' });
    expect(labor.subStage).toMatchObject({ id: 30, title: 'Painting' });
    expect(labor.status).toBe(true);
    expect(Object.isFrozen(labor)).toBe(true);
  });
});
