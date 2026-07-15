import { describe, expect, it } from 'vitest';
import { NotificationType } from '../../constants/notificationType.enum';
import { Status } from '../../constants/status.enum';
import AddProjectPreviewParams from '../add.project.preview.params';

describe('AddProjectPreviewParams', () => {
  it('maps every project preview field to the API payload', () => {
    const params = new AddProjectPreviewParams({
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
  });

  it('omits undefined optional values and validates required fields', () => {
    const params = new AddProjectPreviewParams({
      project_id: 10,
      engineer_id: 15,
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
    });

    expect(params.toMap()).toEqual({
      project_id: 10,
      engineer_id: 15,
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
    });
    expect(params.validate().isValid).toBe(true);
  });
});
