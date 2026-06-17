import { describe, expect, it } from 'vitest';
import EditStageParams from './edit.stage.params';

const translations = {
  title: { en: 'Updated', ar: 'محدث' },
};

describe('EditStageParams', () => {
  it('maps id and translations', () => {
    const params = new EditStageParams({ id: 4, translations });

    expect(params.id).toBe(4);
    expect(params.translations).toBe(translations);
    expect(params.toMap()).toEqual({
      id: 4,
      translations,
    });
  });

  it('validates required id and translations', () => {
    expect(new EditStageParams({ id: 4, translations }).validate().isValid).toBe(true);

    expect(
      new EditStageParams({
        id: null as unknown as number,
        translations: undefined,
      }).validate(),
    ).toEqual({
      isValid: false,
      errors: [
        { field: 'id', message: 'id is required' },
        { field: 'translations', message: 'translations is required' },
      ],
    });
  });
});
