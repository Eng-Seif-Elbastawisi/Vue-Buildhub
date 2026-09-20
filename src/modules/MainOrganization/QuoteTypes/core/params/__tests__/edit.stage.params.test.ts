import { describe, expect, it } from 'vitest';
import EditStageParams from '../edit.stage.params';

const translations = { title: { en: 'Primary', ar: 'Primary AR' } };
const emptyTranslations = { title: { en: ' ', ar: '' } };

describe('EditStageParams', () => {
  it('maps and validates stage update payloads', () => {
    const params = new EditStageParams({ id: 3, translations });

    expect(params.toMap()).toEqual({ stage_id: 3, translations });
    expect(params.validate().isValid).toBe(true);
  });

  it('requires a stage id', () => {
    const params = new EditStageParams({
      id: undefined as unknown as number,
      translations,
    });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'id' }],
    });
  });

  it('requires a translated title', () => {
    const params = new EditStageParams({ id: 3, translations: emptyTranslations });

    expect(params.validate()).toMatchObject({
      isValid: false,
      errors: [{ field: 'translations' }],
    });
  });
});
