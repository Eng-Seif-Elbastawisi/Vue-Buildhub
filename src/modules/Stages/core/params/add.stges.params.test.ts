import { describe, expect, it } from 'vitest';
import AddStageParams from './add.stges.params';

const translations = {
  title: { en: 'Primary', ar: 'ابتدائي' },
};

describe('AddStageParams', () => {
  it('maps translations without optional parent id', () => {
    const params = new AddStageParams({ translations });

    expect(params.translations).toBe(translations);
    expect(params.parentId).toBeUndefined();
    expect(params.toMap()).toEqual({ translations });
  });

  it('maps parent id when provided', () => {
    const params = new AddStageParams({ translations, parentId: 9 });

    expect(params.toMap()).toEqual({
      translations,
      parent_id: 9,
    });
  });

  it('validates required translations', () => {
    expect(new AddStageParams({ translations }).validate().isValid).toBe(true);
    expect(new AddStageParams({}).validate()).toEqual({
      isValid: false,
      errors: [{ field: 'translations', message: 'translations is required' }],
    });
  });
});
