import { describe, expect, it } from 'vitest';
import ItemTypesModel from '@/modules/MainOrganization/ItemTypes/core/models/item.types.model';
import StageModel from '@/modules/shared/Stages/core/models/stage.model';
import { UnitTypeEnum } from '../../constant/unit.type.enum';
import MaterialsModel from '../materials.model';

describe('MaterialsModel', () => {
  it('maps API translations and supports snake-case brand id', () => {
    const model = MaterialsModel.fromJson({
      id: 4,
      brand_id: 7,
      item_type: {
        id: 12,
        title: 'Finishing',
        status: 1,
      },
      stage: {
        id: 20,
        title: 'Preparation',
      },
      sub_stage: {
        id: 21,
        title: 'Excavation',
      },
      price: '125',
      unit: UnitTypeEnum.bag,
      translations: [
        { locale: 'en', title: 'Cement' },
        { locale: 'ar', title: 'Cement AR' },
      ],
      status: 1,
    });

    expect(model).toMatchObject({
      id: 4,
      brandId: 7,
      itemType: {
        id: 12,
        title: 'Finishing',
        status: true,
      },
      stage: {
        id: 20,
        title: 'Preparation',
      },
      subStage: {
        id: 21,
        title: 'Excavation',
      },
      price: 125,
      unit: UnitTypeEnum.bag,
      translations: { title: { en: 'Cement', ar: 'Cement AR' } },
      status: true,
    });
    expect(model.itemType).toBeInstanceOf(ItemTypesModel);
    expect(model.stage).toBeInstanceOf(StageModel);
    expect(model.subStage).toBeInstanceOf(StageModel);
  });
});
