import { describe, expect, it } from 'vitest';
import ProjectPreviewModel from '../project.preview.model';

describe('ProjectPreviewModel', () => {
  it('maps translated titles from array and object forms', () => {
    expect(
      ProjectPreviewModel.mapTranslations([
        { locale: 'en', title: 'Commercial project' },
        { locale: 'ar', title: 'مشروع تجاري' },
      ]),
    ).toEqual({
      en: 'Commercial project',
      ar: 'مشروع تجاري',
    });

    expect(ProjectPreviewModel.mapTranslations({ title: { en: 'Commercial project' } })).toEqual({
      en: 'Commercial project',
    });
  });

  it('parses preview json with related project and engineer data', () => {
    const model = ProjectPreviewModel.fromJson({
      id: 12,
      project: {
        id: 10,
        title: [
          { locale: 'ar', title: 'مشروع تجاري' },
          { locale: 'en', title: 'Commercial project' },
        ],
      },
      engineer: { id: 15, name: 'Site engineer' },
      pricing_responsible: { id: 18, title: 'Pricing lead' },
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
      site_link: 'https://maps.google.com/?q=30.0444,31.2357',
      address: 'Nasr City, Cairo, Egypt',
      status: 1,
      notification_type: 2,
      notification_message: 'Ready',
    });

    expect(model.project_preview_id).toBe(12);
    expect(model.project_id).toBe(10);
    expect(model.title).toBe('Commercial project');
    expect(model.engineer).toEqual({ id: 15, title: 'Site engineer' });
    expect(model.pricing_responsible).toEqual({ id: 18, title: 'Pricing lead' });
    expect(model.preview_date).toBe('2026-06-25');
    expect(model.notification_message).toBe('Ready');
  });
});
