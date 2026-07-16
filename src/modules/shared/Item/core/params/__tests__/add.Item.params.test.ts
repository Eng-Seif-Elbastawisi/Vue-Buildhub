import { describe, expect, it } from 'vitest';
import { ItemServiceTypeEnum } from '../../constant/item.service.type.enum';
import { ItemStatusEnum } from '../../constant/item.status.enum';
import { ItemTypeEnum } from '../../constant/item.type.enum copy';
import AddItemParams from '../add.Item.params';

const payload = {
  type: ItemTypeEnum.MATERIAL,
  status: ItemStatusEnum.MAIN,
  stage_id: 2,
  department_id: 3,
  measurement_unit_id: 4,
  price: 150,
  notes: 'Ready mix',
  translations: { title: { en: 'Concrete', ar: 'Concrete AR' } },
};

describe('AddItemParams', () => {
  it('maps and validates add payloads', () => {
    const params = new AddItemParams(payload);

    expect(params.toMap()).toEqual(payload);
    expect(params.validate().isValid).toBe(true);
  });

  it('maps service type when present', () => {
    const params = new AddItemParams({
      ...payload,
      service_type: ItemServiceTypeEnum.DESIGN,
    });

    expect(params.toMap()).toMatchObject({
      service_type: ItemServiceTypeEnum.DESIGN,
    });
  });
});
