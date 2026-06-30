import { describe, expect, it } from 'vitest';
import { ProjectItemPriceEnum } from '../../../core/constant/project.item.Price.enum';
import ProjectItemModel from '../../../core/models/project.Item.model';
import ProjectItemShowModel from '../../../core/models/project.Item.show.model';
import ProjectItemRepository from '../project.Item.repository';

const itemJson = {
  id: 7,
  price: 150,
  quantity: 3,
  item_id: 9,
  item_id_title: 'Concrete',
  pricing_method: ProjectItemPriceEnum.GENERAL_ITEM,
  project_floor_id: 2,
};

describe('ProjectItemRepository', () => {
  it('returns the same singleton instance', () => {
    expect(ProjectItemRepository.getInstance()).toBe(ProjectItemRepository.getInstance());
  });

  it('parses item and list responses', () => {
    const repository = ProjectItemRepository.getInstance() as unknown as {
      parseItem(data: Record<string, unknown>): ProjectItemShowModel;
      parseList(data: unknown): ProjectItemModel[];
      config: { hasPagination: boolean; dataKey: string; paginationKey: string };
    };

    expect(repository.config).toEqual({
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    });
    expect(repository.parseItem(itemJson)).toBeInstanceOf(ProjectItemShowModel);
    expect(repository.parseList([itemJson])).toEqual([expect.any(ProjectItemModel)]);
    expect(repository.parseList({})).toEqual([]);
  });
});
