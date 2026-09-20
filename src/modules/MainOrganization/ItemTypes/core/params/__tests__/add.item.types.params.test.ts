import { describe, expect, it } from 'vitest';
import TranslationParams from '@/base/Core/Params/translationParams';
import { ItemTypeEnum } from '../../constant/item.type.enum';
import AddItemTypesParams from '../add.item.types.params';

describe('AddItemTypesParams', () => {
  it('includes status in the create payload', () => {
    const params = new AddItemTypesParams({
      translations: new TranslationParams({ title: { en: 'Material' } }),
      type: ItemTypeEnum.MATERIALS,
      code: 'MAT',
      status: true,
    });

    expect(params.toMap()).toMatchObject({ status: true });
  });
});
