import { describe, expect, it } from 'vitest';
import { ConvertStatus } from '../../constants/convert.status.enum';
import ProjectModel from '../project.model';

describe('ProjectModel', () => {
  it('maps translations from array and object response shapes', () => {
    expect(
      ProjectModel.mapTranslations([
        { locale: 'en', title: 'Commercial project' },
        { locale: 'ar', title: 'مشروع تجاري' },
        { locale: 'fr', description: 'Ignored value' },
      ]),
    ).toEqual({
      en: 'Commercial project',
      ar: 'مشروع تجاري',
    });

    expect(ProjectModel.mapTranslations({ title: { en: 'Commercial project' } })).toEqual({
      en: 'Commercial project',
    });
    expect(ProjectModel.mapTranslations(undefined)).toEqual({});
  });

  it('parses project list response fields and nested client data', () => {
    const model = ProjectModel.fromJson({
      id: 27,
      title: 'Commercial project',
      translations: [
        { locale: 'en', title: 'Commercial project' },
        { locale: 'ar', title: 'مشروع تجاري' },
      ],
      created_at: '2026-07-14 10:30:00',
      project_type: { id: 3, title: 'Commercial' },
      status: ConvertStatus.CONVERT_TO_PROJECT,
      client: {
        id: 5,
        name: 'Build Hub client',
        organization: {
          id: 8,
          name: 'Build Hub organization',
          address: 'Cairo',
        },
        employee: { id: 13, name: 'Project owner' },
      },
      preview_date: '2026-07-16',
      total_area: 512210,
      total_price: '7980.00',
    });

    expect(model).toMatchObject({
      id: 27,
      title: 'Commercial project',
      createdAt: '2026-07-14 10:30:00',
      status: ConvertStatus.CONVERT_TO_PROJECT,
      client: {
        id: 5,
        name: 'Build Hub client',
        organization: {
          id: 8,
          name: 'Build Hub organization',
          address: 'Cairo',
        },
        employee: { id: 13, name: 'Project owner' },
      },
      previewDate: '2026-07-16',
      totalArea: '512210',
      totalPrice: '7980.00',
    });
    expect(model.projectType).toMatchObject({ id: 3, title: 'Commercial' });
    expect(model.translations?.title).toEqual({
      en: 'Commercial project',
      ar: 'مشروع تجاري',
    });
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('leaves malformed optional fields undefined', () => {
    const model = ProjectModel.fromJson({
      id: '27',
      title: 100,
      created_at: null,
      status: 'pending',
      total_area: null,
      total_price: false,
    });

    expect(model).toMatchObject({
      id: undefined,
      title: undefined,
      createdAt: undefined,
      status: undefined,
      client: undefined,
      previewDate: undefined,
      totalArea: undefined,
      totalPrice: undefined,
    });
  });
});
