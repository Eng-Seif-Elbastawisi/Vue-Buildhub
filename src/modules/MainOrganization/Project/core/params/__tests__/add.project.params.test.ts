import { describe, it, expect } from 'vitest';
import AddProjectParams from '../add.project.params';
import { ServiceType } from '@/modules/MainOrganization/Project/core/constants/serviceType.enum';

describe('AddProjectParams', () => {
  it('should instantiate correctly and convert to map', () => {
    const params = new AddProjectParams({
      client_name: 'John Doe',
      client_exist: true,
      service_type: ServiceType.DESIGNONLY,
    });

    expect(params.client_name).toBe('John Doe');

    const map = params.toMap();
    expect(map.client_name).toBe('John Doe');
    expect(map.client_exist).toBe(true);
    expect(map.service_type).toBe(ServiceType.DESIGNONLY);
  });
});
