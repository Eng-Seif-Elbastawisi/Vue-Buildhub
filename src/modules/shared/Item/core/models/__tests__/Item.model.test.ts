import { describe, expect, it } from 'vitest';
import { ItemStatusEnum } from '../../constant/item.status.enum';
import { ItemTypeEnum } from '../../constant/item.type.enum copy';
import ItemModel from '../Item.model';

const itemJson = {
  id: 7,
  translations: [
    { locale: 'en', title: 'Concrete' },
    { locale: 'ar', title: 'Concrete AR' },
  ],
  type: ItemTypeEnum.MATERIAL,
  status: ItemStatusEnum.MAIN,
  stage_id: 2,
  stage_id_title: 'Stage 2',
  department_id: 3,
  department_id_title: 'Department 3',
  measurement_unit_id: 4,
  measurement_unit_id_title: 'Unit 4',
  price: 150,
  notes: 'Ready mix',
};

describe('ItemModel', () => {
  it('maps item JSON and freezes the instance', () => {
    const model = ItemModel.fromJson(itemJson);

    expect(model).toMatchObject({
      id: 7,
      translations: { title: { en: 'Concrete', ar: 'Concrete AR' } },
      type: ItemTypeEnum.MATERIAL,
      status: ItemStatusEnum.MAIN,
      price: 150,
      notes: 'Ready mix',
    });
    expect(model.stage_id).toMatchObject({ id: 2, title: 'Stage 2' });
    expect(model.department_id).toMatchObject({ id: 3, title: 'Department 3' });
    expect(model.measurement_unit_id).toMatchObject({ id: 4, title: 'Unit 4' });
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('maps object translations, rejects empty JSON, and exposes an example', () => {
    expect(ItemModel.mapTranslations({ title: { en: 'Item' } })).toEqual({ en: 'Item' });
    expect(() => ItemModel.fromJson(null as unknown as Record<string, unknown>)).toThrow(
      'Cannot create LocationModel',
    );
    expect(ItemModel.example).toBeInstanceOf(ItemModel);
  });
});
