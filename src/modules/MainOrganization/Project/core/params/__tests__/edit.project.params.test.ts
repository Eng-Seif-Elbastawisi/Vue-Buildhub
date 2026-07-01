import { describe, it, expect } from 'vitest';
import EditProjectParams from '../edit.project.params';
import { ServiceType } from '@/modules/MainOrganization/Project/core/constants/serviceType.enum';

describe('EditProjectParams', () => {
  it('should instantiate correctly and convert to map', () => {
    const params = new EditProjectParams({
      projectId: 123,
      client_name: 'Jane Doe',
      service_type: ServiceType.EXECUTIONONLY,
      engineer_id: 15,
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
      site_link: 'https://maps.google.com/?q=30.0444,31.2357',
      address: 'Nasr City, Cairo, Egypt',
    });

    expect(params.projectId).toBe(123);

    const map = params.toMap();
    expect(map.project_id).toBe(123);
    expect(map.client_name).toBe('Jane Doe');
    expect(map.service_type).toBe(ServiceType.EXECUTIONONLY);
    expect(map.engineer_id).toBe(15);
    expect(map.preview_date).toBe('2026-06-25');
    expect(map.preview_time).toBe('10:30:00');
    expect(map.site_link).toBe('https://maps.google.com/?q=30.0444,31.2357');
    expect(map.address).toBe('Nasr City, Cairo, Egypt');
  });
});
