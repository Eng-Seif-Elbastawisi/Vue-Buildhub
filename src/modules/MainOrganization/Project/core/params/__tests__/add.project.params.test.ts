import { describe, it, expect } from 'vitest';
import AddProjectParams from '../add.project.params';
import { ServiceType } from '@/modules/MainOrganization/Project/core/constants/serviceType.enum';

describe('AddProjectParams', () => {
  it('should instantiate correctly and convert to map', () => {
    const params = new AddProjectParams({
      client_name: 'John Doe',
      client_exist: true,
      service_type: ServiceType.DESIGNONLY,
      engineer_id: 15,
      preview_date: '2026-06-25',
      preview_time: '10:30:00',
      site_link: 'https://maps.google.com/?q=30.0444,31.2357',
      address: 'Nasr City, Cairo, Egypt',
    });

    expect(params.client_name).toBe('John Doe');

    const map = params.toMap();
    expect(map.client_name).toBe('John Doe');
    expect(map.client_exist).toBe(true);
    expect(map.service_type).toBe(ServiceType.DESIGNONLY);
    expect(map.engineer_id).toBe(15);
    expect(map.preview_date).toBe('2026-06-25');
    expect(map.preview_time).toBe('10:30:00');
    expect(map.site_link).toBe('https://maps.google.com/?q=30.0444,31.2357');
    expect(map.address).toBe('Nasr City, Cairo, Egypt');
  });
});
