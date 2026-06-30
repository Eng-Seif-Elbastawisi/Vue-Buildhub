import { describe, expect, it } from 'vitest';
import ProjectFloorModel from '../project.floor.model';

describe('ProjectFloorModel', () => {
  it('maps translated floor titles', () => {
    expect(
      ProjectFloorModel.mapTranslations([
        { locale: 'en', title: 'Fourth floor' },
        { locale: 'ar', title: 'الدور الرابع' },
      ]),
    ).toEqual({
      en: 'Fourth floor',
      ar: 'الدور الرابع',
    });
  });

  it('parses floor json', () => {
    const model = ProjectFloorModel.fromJson({
      id: 4,
      title: 'Fourth floor',
      translations: { title: { en: 'Fourth floor', ar: 'الدور الرابع' } },
    });

    expect(model.id).toBe(4);
    expect(model.title).toBe('Fourth floor');
    expect(model.translations?.title).toEqual({
      en: 'Fourth floor',
      ar: 'الدور الرابع',
    });
  });
});
