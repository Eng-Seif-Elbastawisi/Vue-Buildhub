import { describe, expect, it } from 'vitest';

import TranslationParams from '@/base/Core/Params/translationParams';

import AddQuoteTypeParams from '../add.quote.types.params';

describe('AddQuoteTypeParams', () => {
  it('maps the user-entered type code to the create payload', () => {
    const params = new AddQuoteTypeParams({
      translations: new TranslationParams({ title: { en: 'Lump sum' } }),
      typeCode: ' LUMP_SUM ',
      status: true,
    });

    expect(params.toMap()).toMatchObject({
      code: 'LUMP_SUM',
      status: true,
    });
    expect(params.validate().isValid).toBe(true);
  });
});
