import { describe, expect, it } from 'vitest';

import TranslationParams from '@/base/Core/Params/translationParams';

import EditQuoteTypeParams from '../edit.quote.types.params';

describe('EditQuoteTypeParams', () => {
  it('preserves the existing type code in the update payload', () => {
    const params = new EditQuoteTypeParams({
      id: 4,
      translations: new TranslationParams({ title: { en: 'Supervision' } }),
      typeCode: 'SUPERVISION',
      status: true,
    });

    expect(params.toMap()).toMatchObject({
      quote_type_id: 4,
      code: 'SUPERVISION',
    });
    expect(params.validate().isValid).toBe(true);
  });
});
