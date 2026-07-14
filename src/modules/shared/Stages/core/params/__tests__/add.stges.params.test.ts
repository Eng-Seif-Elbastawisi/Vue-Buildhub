import { describe, expect, it } from 'vitest';
import AddStageParams from '../add.stges.params';

const translations = { title: { en: 'Primary', ar: 'Primary AR' } };
const emptyTranslations = { title: { en: '', ar: ' ' } };

describe('AddStageParams', () => {
  it('maps and validates stage create payloads', () => {
    const params = new AddStageParams({ translations, parentId: 5 });

    expect(params.toMap()).toEqual({ translations, parent_id: 5 });
    expect(params.validate().isValid).toBe(true);
  });

  it('omits empty optional parent id', () => {
    expect(new AddStageParams({ translations }).toMap()).toEqual({ translations });
  });

  it('requires a translated title', () => {
    const params = new AddStageParams({ translations: emptyTranslations });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'translations' }],
    });
  });
});
