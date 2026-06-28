import { describe, expect, it } from 'vitest';
import { ItemStatusEnum } from '../../constant/item.status.enum';
import { ItemTypeEnum } from '../../constant/item.type.enum copy';
import ItemShowModel from '../Item.show.model';

const itemJson = {
  id: 7,
  title: [{ locale: 'en', title: 'Concrete' }],
  type: ItemTypeEnum.MATERIAL,
  status: ItemStatusEnum.OPTIONAL,
  stage_id: 2,
  department_id: 3,
  measurement_unit_id: 4,
  price: 150,
  notes: 'Ready mix',
};

describe('ItemShowModel', () => {
  it('maps show JSON and freezes the instance', () => {
    const model = ItemShowModel.fromJson(itemJson);

    expect(model).toMatchObject({
      id: 7,
      translations: { title: { en: 'Concrete' } },
      type: ItemTypeEnum.MATERIAL,
      status: ItemStatusEnum.OPTIONAL,
      stage_id: 2,
      department_id: 3,
      measurement_unit_id: 4,
      price: 150,
      notes: 'Ready mix',
    });
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('throws for empty JSON and exposes an example', () => {
    expect(() => ItemShowModel.fromJson(undefined as unknown as Record<string, unknown>)).toThrow(
      'Invalid ItemShowModel',
    );
    expect(ItemShowModel.example).toBeInstanceOf(ItemShowModel);
  });
});
