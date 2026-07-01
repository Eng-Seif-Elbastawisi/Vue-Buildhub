import { describe, expect, it } from 'vitest';
import { ProjectItemPriceEnum } from '../../constant/project.item.Price.enum';
import ProjectItemModel from '../project.Item.model';

const itemJson = {
  id: 7,
  price: 150,
  quantity: 3,
  item_id: 9,
  item_id_title: 'Concrete',
  pricing_method: ProjectItemPriceEnum.GENERAL_ITEM,
  project_floor_id: 2,
};

describe('ProjectItemModel', () => {
  it('maps project item JSON and freezes the instance', () => {
    const model = ProjectItemModel.fromJson(itemJson);

    expect(model).toMatchObject({
      id: 7,
      price: 150,
      quantity: 3,
      pricing_method: ProjectItemPriceEnum.GENERAL_ITEM,
      project_floor_id: 2,
    });
    expect(model.item_id).toMatchObject({ id: 9, title: 'Concrete' });
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('rejects empty JSON and exposes an example', () => {
    expect(() => ProjectItemModel.fromJson(null as unknown as Record<string, unknown>)).toThrow(
      'Cannot create ProjectItemModel',
    );
    expect(ProjectItemModel.example).toBeInstanceOf(ProjectItemModel);
  });
});
