import { describe, expect, it } from 'vitest';
import ProjectPreviewShowModel from '../project.preview.show.model';

describe('ProjectPreviewShowModel', () => {
  it('maps the complete edit response including object-backed select values', () => {
    const model = ProjectPreviewShowModel.fromJson({
      id: '12',
      project: { id: '10', name: 'Commercial project' },
      engineer: { id: '15', name: 'Site engineer' },
      pricing_responsible: { id: '18', name: 'Pricing lead' },
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
      site_link: 'https://maps.google.com/?q=30.0444,31.2357',
      address: 'Nasr City, Cairo, Egypt',
      status: '3',
      notification_type: '2',
      notification_message: 'Preview is ready',
    });

    expect(model.id).toBe(12);
    expect(model.project_preview_id).toBe(12);
    expect(model.project_id).toBe(10);
    expect(model.engineer_id).toBe(15);
    expect(model.pricing_responsible_id).toBe(18);
    expect(model.pricing_responsible).toEqual({ id: 18, title: 'Pricing lead' });
    expect(model.status).toBe(3);
    expect(model.notification_type).toBe(2);
    expect(model.preview_date).toBe('2026-06-25');
    expect(model.preview_time).toBe('10:30:00');
  });

  it('falls back to scalar relation ids and preserves nullable response fields', () => {
    const model = ProjectPreviewShowModel.fromJson({
      id: 12,
      project_id: 10,
      engineer_id: 15,
      pricing_responsible_id: 18,
      status: null,
      notification_type: null,
      notification_message: null,
      site_link: null,
      address: null,
    });

    expect(model.project_id).toBe(10);
    expect(model.engineer_id).toBe(15);
    expect(model.pricing_responsible_id).toBe(18);
    expect(model.status).toBeNull();
    expect(model.notification_type).toBeNull();
    expect(model.notification_message).toBeNull();
  });

  it('maps optional execution quote source fields when returned by the preview API', () => {
    const model = ProjectPreviewShowModel.fromJson({
      id: 12,
      project_id: 10,
      quote_type_id: 2,
      design_value: '5000.00',
      area: 320,
    });

    expect(model.quote_type_id).toBe(2);
    expect(model.design_value).toBe('5000.00');
    expect(model.area).toBe(320);
  });
});
