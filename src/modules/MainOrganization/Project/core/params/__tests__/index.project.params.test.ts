import { describe, expect, it } from 'vitest';
import { ConvertStatus } from '@/modules/MainOrganization/Project/core/constants/convert.status.enum';
import { DepartmentTypeEnum } from '@/modules/shared/Department/core/constants/Type.enum';
import IndexProjectParams from '../index.project.params';

describe('IndexProjectParams', () => {
  it('adds optional project filters to the index map', () => {
    const params = new IndexProjectParams(
      'villa',
      2,
      20,
      1,
      '2026-06-25',
      [ConvertStatus.SEND_TO_CLIENT],
      [DepartmentTypeEnum.SUPERVISION],
    );
    params.clientId = 42;

    expect(params.toMap()).toMatchObject({
      word: 'villa',
      page: 2,
      per_page: 20,
      with_pagination: 1,
      date_remove: '2026-06-25',
      status: [ConvertStatus.SEND_TO_CLIENT],
      service_type: [DepartmentTypeEnum.SUPERVISION],
      client_id: 42,
    });
  });

  it('uses pending status by default and omits status when null or empty', () => {
    expect(new IndexProjectParams().toMap()).toMatchObject({
      page: 1,
      per_page: 10,
      with_pagination: 1,
      status: [ConvertStatus.ACCEPT_CLIENT],
    });

    expect(new IndexProjectParams('', 1, 10, 1, null, null).toMap()).not.toHaveProperty('status');
    expect(new IndexProjectParams('', 1, 10, 1, null, []).toMap()).not.toHaveProperty('status');
  });

  it('omits optional filters when they are undefined or empty', () => {
    const defaultParams = new IndexProjectParams().toMap();

    expect(defaultParams).not.toHaveProperty('service_type');
    expect(defaultParams).not.toHaveProperty('client_id');
    expect(new IndexProjectParams('', 1, 10, 1, null, null, []).toMap()).not.toHaveProperty(
      'service_type',
    );
  });
});
