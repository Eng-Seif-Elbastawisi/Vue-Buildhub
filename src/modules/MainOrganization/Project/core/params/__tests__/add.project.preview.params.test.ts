import { describe, expect, it } from 'vitest';
import AddProjectPreviewParams from '../add.project.preview.params';

describe('AddProjectPreviewParams', () => {
  it('should instantiate correctly and convert to map', () => {
    const params = new AddProjectPreviewParams({
      engineer_id: 15,
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
      site_link: 'https://maps.google.com/?q=30.0444,31.2357',
      address: 'Nasr City, Cairo, Egypt',
    });

    expect(params.engineer_id).toBe(15);

    expect(params.toMap()).toEqual({
      engineer_id: 15,
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
      site_link: 'https://maps.google.com/?q=30.0444,31.2357',
      address: 'Nasr City, Cairo, Egypt',
    });
  });
});
