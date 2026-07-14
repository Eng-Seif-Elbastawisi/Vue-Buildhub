import { describe, expect, it } from 'vitest';
import { ProjectItemPriceEnum } from '../../constant/project.item.Price.enum';
import AddProjectItemParams from '../add.project.Item.params';

const payload = {
  project_id: 4,
  department_id: 7,
  items: [
    {
      price: 150,
      quantity: 3,
      item_id: 9,
      pricing_method: ProjectItemPriceEnum.GENERAL_ITEM,
    },
  ],
};

describe('AddProjectItemParams', () => {
  it('maps and validates add payloads', () => {
    const params = new AddProjectItemParams(payload);

    expect(params.toMap()).toEqual(payload);
    expect(params.validate().isValid).toBe(true);
  });

  it('includes floor data only for floor and space pricing methods', () => {
    const params = new AddProjectItemParams({
      project_id: 4,
      department_id: 7,
      items: [
        {
          price: 150,
          quantity: 3,
          item_id: 9,
          pricing_method: ProjectItemPriceEnum.FULL_FLOOR_RELATED,
          project_floor_id: 2,
          project_floor_space_id: 5,
        },
        {
          price: 75,
          quantity: 1,
          item_id: 10,
          pricing_method: ProjectItemPriceEnum.SPACE_RELATED,
          project_floor_space_id: 5,
        },
      ],
    });

    expect(params.toMap()).toEqual({
      project_id: 4,
      department_id: 7,
      items: [
        {
          item_id: 9,
          quantity: 3,
          pricing_method: ProjectItemPriceEnum.FULL_FLOOR_RELATED,
          price: 150,
          project_floor_id: 2,
        },
        {
          item_id: 10,
          quantity: 1,
          pricing_method: ProjectItemPriceEnum.SPACE_RELATED,
          project_floor_space_id: 5,
        },
      ],
    });
  });

  it('requires select values inside each item payload', () => {
    const params = new AddProjectItemParams({
      project_id: 4,
      department_id: 7,
      items: [
        {
          quantity: 3,
          pricing_method: ProjectItemPriceEnum.FULL_FLOOR_RELATED,
        },
      ],
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'items.0.item_id' }, { field: 'items.0.project_floor_id' }],
    });
  });
});
