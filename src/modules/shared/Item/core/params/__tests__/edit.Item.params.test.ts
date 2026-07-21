import { describe, expect, it } from 'vitest';
import { ItemServiceTypeEnum } from '../../constant/item.service.type.enum';
import { ItemStatusEnum } from '../../constant/item.status.enum';
import { ItemTypeEnum } from '../../constant/item.type.enum copy';
import EditItemParams from '../edit.Item.params';

const payload = {
  item_id: 9,
  type: ItemTypeEnum.MATERIAL,
  status: ItemStatusEnum.MAIN,
  stage_id: 2,
  department_id: 3,
  measurement_unit_id: 4,
  price: 150,
  notes: 'Ready mix',
  translations: { title: { en: 'Concrete', ar: 'Concrete AR' } },
};

describe('EditItemParams', () => {
  it('maps and validates edit payloads', () => {
    const params = new EditItemParams(payload);

    expect(params.toMap()).toEqual(payload);
    expect(params.validate().isValid).toBe(true);
  });

  it('maps service type when present', () => {
    const params = new EditItemParams({
      ...payload,
      service_type: ItemServiceTypeEnum.SUPERVISION,
    });

    expect(params.toMap()).toMatchObject({
      service_type: ItemServiceTypeEnum.SUPERVISION,
    });
  });

  it('allows stage and price to be omitted for non-supervision items', () => {
    const params = new EditItemParams({
      item_id: payload.item_id,
      type: payload.type,
      status: payload.status,
      service_type: ItemServiceTypeEnum.DESIGN,
      department_id: payload.department_id,
      measurement_unit_id: payload.measurement_unit_id,
      notes: payload.notes,
      translations: payload.translations,
    });

    expect(params.validate()).toEqual({ isValid: true, errors: [] });
  });

  it('requires stage and price for supervision items', () => {
    const params = new EditItemParams({
      item_id: payload.item_id,
      type: payload.type,
      status: payload.status,
      service_type: ItemServiceTypeEnum.SUPERVISION,
      department_id: payload.department_id,
      measurement_unit_id: payload.measurement_unit_id,
      notes: payload.notes,
      translations: payload.translations,
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'stage_id' }, { field: 'price' }],
    });
  });
});
