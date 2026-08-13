import { afterEach, describe, expect, it } from 'vitest';
import { i18n } from '@/locales/i18n';
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

const originalLocale = i18n.global.locale;

afterEach(() => {
  i18n.global.locale = originalLocale;
});

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

  it('allows stage and price to be omitted for non-supervision items', () => {
    const params = new AddItemParams({
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

  it('shows the localized department validation message when no department is selected', () => {
    i18n.global.locale = 'ar';
    const params = new AddItemParams({
      ...payload,
      service_type: ItemServiceTypeEnum.DESIGN,
      department_id: undefined,
    });

    expect(params.validate().errors).toEqual([{ field: 'department_id', message: 'القسم مطلوب' }]);
  });

  it('requires stage and price for supervision items', () => {
    const params = new AddItemParams({
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
