import { describe, it, expect } from 'vitest';
import EditProjectParams from '../edit.project.params';
import { ServiceType } from '@/modules/MainOrganization/Project/core/constants/serviceType.enum';

describe('EditProjectParams', () => {
  it('should instantiate correctly and convert to map', () => {
    const params = new EditProjectParams({
      projectId: 123,
      client_name: 'Jane Doe',
      service_type: ServiceType.EXECUTIONONLY,
    });

    expect(params.projectId).toBe(123);

    const map = params.toMap();
    expect(map.project_id).toBe(123);
    expect(map.client_name).toBe('Jane Doe');
    expect(map.service_type).toBe(ServiceType.EXECUTIONONLY);
  });
});
