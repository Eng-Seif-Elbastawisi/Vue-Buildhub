import { describe, expect, it } from 'vitest';
import EditAttachmentTypeParams from '../edit.attachment.type.params';
import TranslationParams from '@/base/Core/Params/translationParams';

describe('EditAttachmentTypeParams', () => {
  it('validates id and translations', () => {
    const invalid = new EditAttachmentTypeParams({ id: 0 });
    expect(invalid.validate().isValid).toBe(false);

    const valid = new EditAttachmentTypeParams({
      id: 5,
      translations: new TranslationParams({
        title: { ar: 'مخطط', en: 'Plan' },
      }),
    });
    expect(valid.validate().isValid).toBe(true);
    expect(valid.toMap()).toEqual({
      attachment_type_id: 5,
      translations: {
        title: { ar: 'مخطط', en: 'Plan' },
      },
    });
  });
});
