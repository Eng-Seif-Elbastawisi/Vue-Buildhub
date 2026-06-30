import { describe, it, expect } from 'vitest';
import EditProjectFloorParams from '../edit.project.floor.params';

describe('EditProjectFloorParams', () => {
  it('should instantiate correctly and convert to map', () => {
    const params = new EditProjectFloorParams({
      id: 123,
      engineer_id: 15,
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
      site_link: 'https://maps.google.com/?q=30.0444,31.2357',
      address: 'Nasr City, Cairo, Egypt',
    });

    expect(params.id).toBe(123);

    expect(params.toMap()).toEqual({
      id: 123,
      engineer_id: 15,
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
      site_link: 'https://maps.google.com/?q=30.0444,31.2357',
      address: 'Nasr City, Cairo, Egypt',
    });
  });
});
