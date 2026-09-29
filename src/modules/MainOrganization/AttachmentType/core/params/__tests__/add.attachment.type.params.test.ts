import { describe, expect, it } from 'vitest';
import AddAttachmentTypeParams from '../add.attachment.type.params';
import TranslationParams from '@/base/Core/Params/translationParams';

describe('AddAttachmentTypeParams', () => {
  it('validates required translation title', () => {
    const invalidParams = new AddAttachmentTypeParams({});
    expect(invalidParams.validate().isValid).toBe(false);

    const validParams = new AddAttachmentTypeParams({
      translations: new TranslationParams({
        title: { ar: 'مخطط معماري', en: 'Architectural Plan' },
      }),
    });
    expect(validParams.validate().isValid).toBe(true);
  });

  it('maps correctly to payload object', () => {
    const params = new AddAttachmentTypeParams({
      translations: new TranslationParams({
        title: { ar: 'مخطط معماري', en: 'Architectural Plan' },
      }),
    });
    expect(params.toMap()).toEqual({
      translations: {
        title: { ar: 'مخطط معماري', en: 'Architectural Plan' },
      },
    });
  });
});
