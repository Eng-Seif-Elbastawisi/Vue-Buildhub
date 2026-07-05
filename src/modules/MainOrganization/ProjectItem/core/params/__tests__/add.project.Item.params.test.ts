import { describe, expect, it } from 'vitest';
import { ProjectItemPriceEnum } from '../../constant/project.item.Price.enum';
import AddProjectItemParams from '../add.project.Item.params';

const payload = {
  project_id: 4,
  price: 150,
  quantity: 3,
  item_id: 9,
  pricing_method: ProjectItemPriceEnum.GENERAL_ITEM,
};

describe('AddProjectItemParams', () => {
  it('maps and validates add payloads', () => {
    const params = new AddProjectItemParams(payload);

    expect(params.toMap()).toEqual(payload);
    expect(params.validate().isValid).toBe(true);
  });

  it('includes floor data only for full-floor pricing', () => {
    const params = new AddProjectItemParams({
      ...payload,
      pricing_method: ProjectItemPriceEnum.FULL_FLOOR_RELATED,
      project_floor_id: 2,
    });

    expect(params.toMap()).toEqual({
      project_id: 4,
      price: 150,
      quantity: 3,
      item_id: 9,
      pricing_method: ProjectItemPriceEnum.FULL_FLOOR_RELATED,
      project_floor_id: 2,
    });
  });
});
