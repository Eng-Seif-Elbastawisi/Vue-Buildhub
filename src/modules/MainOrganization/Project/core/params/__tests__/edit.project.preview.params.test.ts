import { describe, expect, it } from 'vitest';
import { NotificationType } from '../../constants/notificationType.enum';
import { Status } from '../../constants/status.enum';
import EditProjectPreviewParams from '../edit.project.preview.params';

describe('EditProjectPreviewParams', () => {
  it('maps the preview id and every editable field to the API payload', () => {
    const params = new EditProjectPreviewParams({
      id: 12,
      project_id: 10,
      engineer_id: 15,
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
      site_link: 'https://maps.google.com/?q=30.0444,31.2357',
      address: 'Nasr City, Cairo, Egypt',
      status: Status.READY_FOR_PRICING,
      pricing_responsible_id: 18,
      notification_type: NotificationType.URGENT,
      notification_message: 'Preview is ready for pricing',
    });

    expect(params.toMap()).toEqual({
      project_preview_id: 12,
      project_id: 10,
      engineer_id: 15,
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
      site_link: 'https://maps.google.com/?q=30.0444,31.2357',
      address: 'Nasr City, Cairo, Egypt',
      status: Status.READY_FOR_PRICING,
      pricing_responsible_id: 18,
      notification_type: NotificationType.URGENT,
      notification_message: 'Preview is ready for pricing',
    });
    expect(params.validate().isValid).toBe(true);
  });

  it('uses the same required field validation as add plus the preview id', () => {
    const params = new EditProjectPreviewParams({});

    expect(params.validate().errors.map((error) => error.field)).toEqual([
      'id',
      'engineer_id',
      'preview_date',
      'preview_time',
      'project_id',
    ]);
    expect(params.toMap()).toEqual({});
  });
});
