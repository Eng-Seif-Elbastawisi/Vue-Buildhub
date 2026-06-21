import { describe, expect, it } from 'vitest';
import { ItemStatusEnum } from '../../../core/constant/item.status.enum';
import { ItemTypeEnum } from '../../../core/constant/item.type.enum copy';
import ItemModel from '../../../core/models/Item.model';
import ItemShowModel from '../../../core/models/Item.show.model';
import ItemRepository from '../Item.repository';

const itemJson = {
  id: 7,
  translations: [{ locale: 'en', title: 'Concrete' }],
  type: ItemTypeEnum.MATERIAL,
  status: ItemStatusEnum.MAIN,
  stage_id: 2,
  department_id: 3,
  measurement_unit_id: 4,
  price: 150,
  notes: 'Ready mix',
};

describe('ItemRepository', () => {
  it('returns the same singleton instance', () => {
    expect(ItemRepository.getInstance()).toBe(ItemRepository.getInstance());
  });

  it('parses item and list responses', () => {
    const repository = ItemRepository.getInstance() as unknown as {
      parseItem(data: Record<string, unknown>): ItemShowModel;
      parseList(data: unknown): ItemModel[];
      config: { hasPagination: boolean; dataKey: string; paginationKey: string };
    };

    expect(repository.config).toEqual({
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    });
    expect(repository.parseItem(itemJson)).toBeInstanceOf(ItemShowModel);
    expect(repository.parseList([itemJson])).toEqual([expect.any(ItemModel)]);
    expect(repository.parseList({})).toEqual([]);
  });
});
