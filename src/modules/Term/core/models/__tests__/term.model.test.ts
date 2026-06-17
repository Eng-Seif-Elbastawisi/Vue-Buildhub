import { describe, expect, it } from 'vitest';
import TermModel from '../term.model';

describe('TermModel', () => {
  it('maps translated title and the related department from API data', () => {
    const model = TermModel.fromJson({
      id: 5,
      translations: { title: { en: 'First Term', ar: 'الفصل الأول' } },
      department: { id: 2, title: 'Science' },
    });

    expect(model.id).toBe(5);
    expect(model.title).toBe('First Term');
    expect(model.translations.title.ar).toBe('الفصل الأول');
    expect(model.department.id).toBe(2);
    expect(model.department.title).toBe('Science');
  });
});
