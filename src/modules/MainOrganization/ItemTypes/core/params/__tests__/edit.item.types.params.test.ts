import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import { ItemTypeEnum } from '../../constant/item.type.enum';
import EditItemTypesParams from '../edit.item.types.params';

describe('EditItemTypesParams', () => {
  it('includes status in the update payload', () => {
    const params = new EditItemTypesParams({
      itemTypesId: 4,
      translations: new TranslationParams({ title: { en: 'Labor' } }),
      type: ItemTypeEnum.LABOR,
      code: 'LAB',
      status: false,
    });

    expect(params.toMap()).toMatchObject({ item_type_id: 4, status: false });
  });
});
