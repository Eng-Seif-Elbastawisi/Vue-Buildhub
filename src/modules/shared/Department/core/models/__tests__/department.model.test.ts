import { describe, expect, it } from 'vitest';
import DepartmentModel from '../department.model';

describe('DepartmentModel', () => {
  it('maps translated title and the related stage from API data', () => {
    const model = DepartmentModel.fromJson({
      id: 5,
      translations: { title: { en: 'Science', ar: 'العلوم' } },
      stage: { id: 2, title: 'Secondary' },
    });

    expect(model.id).toBe(5);
    expect(model.translations.title.en).toBe('Science');
    expect(model.stage.id).toBe(2);
    expect(model.stage.title).toBe('Secondary');
  });

  it('normalizes array translation payloads for edit forms', () => {
    const model = DepartmentModel.fromJson({
      id: 6,
      title: [
        { locale: 'en', title: 'Operations' },
        { locale: 'ar', title: 'العمليات' },
      ],
      stage: {
        id: 4,
        title: [
          { locale: 'en', title: 'Finishing' },
          { locale: 'ar', title: 'التشطيبات' },
        ],
      },
    });

    expect(model.translations.title).toEqual({ en: 'Operations', ar: 'العمليات' });
    expect(model.title).toBe('Operations');
    expect(model.stage.title).toBe('Finishing / التشطيبات');
  });
});
