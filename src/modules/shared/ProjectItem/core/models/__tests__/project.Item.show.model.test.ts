import { describe, expect, it } from 'vitest';
import { ProjectItemPriceEnum } from '../../constant/project.item.Price.enum';
import ProjectItemShowModel from '../project.Item.show.model';

const itemJson = {
  id: 7,
  price: 150,
  quantity: 3,
  item_id: 9,
  item_id_title: 'Concrete',
  pricing_method: ProjectItemPriceEnum.SPACE_RELATED,
  project_floor_id: 2,
};

describe('ProjectItemShowModel', () => {
  it('maps project item show JSON and freezes the instance', () => {
    const model = ProjectItemShowModel.fromJson(itemJson);

    expect(model).toMatchObject({
      id: 7,
      price: 150,
      quantity: 3,
      pricing_method: ProjectItemPriceEnum.SPACE_RELATED,
      project_floor_id: 2,
    });
    expect(model.item_id).toMatchObject({ id: 9, title: 'Concrete' });
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('throws for empty JSON and exposes an example', () => {
    expect(() =>
      ProjectItemShowModel.fromJson(undefined as unknown as Record<string, unknown>),
    ).toThrow('Invalid ProjectItemShowModel');
    expect(ProjectItemShowModel.example).toBeInstanceOf(ProjectItemShowModel);
  });
});
