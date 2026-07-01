import { describe, expect, it } from 'vitest';
import { ProjectItemPriceEnum } from '../../constant/project.item.Price.enum';
import AddProjectItemParams from '../add.project.Item.params';

const payload = {
  price: 150,
  quantity: 3,
  item_id: 9,
  pricing_method: ProjectItemPriceEnum.GENERAL_ITEM,
  project_floor_id: 2,
};

describe('AddProjectItemParams', () => {
  it('maps and validates add payloads', () => {
    const params = new AddProjectItemParams(payload);

    expect(params.toMap()).toEqual(payload);
    expect(params.validate().isValid).toBe(true);
  });
});
