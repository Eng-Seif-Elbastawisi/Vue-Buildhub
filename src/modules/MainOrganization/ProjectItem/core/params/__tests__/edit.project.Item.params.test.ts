import { describe, expect, it } from 'vitest';
import { ProjectItemPriceEnum } from '../../constant/project.item.Price.enum';
import EditProjectItemParams from '../edit.project.Item.params';

const payload = {
  project_item_id: 12,
  price: 150,
  quantity: 3,
  item_id: 9,
  pricing_method: ProjectItemPriceEnum.SPACE_RELATED,
  project_floor_id: 2,
};

describe('EditProjectItemParams', () => {
  it('maps and validates edit payloads', () => {
    const params = new EditProjectItemParams(payload);

    expect(params.toMap()).toEqual(payload);
    expect(params.validate().isValid).toBe(true);
  });
});
