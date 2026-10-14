import { describe, expect, it } from 'vitest';
import ItemTypesModel from '@/modules/MainOrganization/ItemTypes/core/models/item.types.model';
import MeasurementModel from '@/modules/shared/measurement/core/models/measurement.model';
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
      measurement_unit: {
        id: 2,
        title: 'Bag',
        symbol: 'bag',
        status: 1,
      },
      stage: {
        id: 20,
        title: 'Preparation',
      },
      sub_stages: [
        {
          id: 21,
          title: 'Excavation',
        },
      ],
      price: '125',
      quantity: '10',
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
      measurementUnit: {
        id: 2,
        title: 'Bag',
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
      quantity: 10,
      unit: UnitTypeEnum.bag,
      translations: { title: { en: 'Cement', ar: 'Cement AR' } },
      status: true,
    });
    expect(model.itemType).toBeInstanceOf(ItemTypesModel);
    expect(model.measurementUnit).toBeInstanceOf(MeasurementModel);
    expect(model.stage).toBeInstanceOf(StageModel);
    expect(model.subStage).toBeInstanceOf(StageModel);
  });

  it('does not convert the legacy singular sub-stage relation into a list', () => {
    const model = MaterialsModel.fromJson({
      title: 'Cement',
      price: 125,
      unit: UnitTypeEnum.bag,
      translations: [],
      sub_stage: { id: 21, title: 'Legacy sub-stage' },
    });

    expect(model.subStages).toEqual([]);
    expect(model.subStage).toBeUndefined();
  });
});
