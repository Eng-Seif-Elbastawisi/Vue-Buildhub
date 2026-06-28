import { describe, expect, it } from 'vitest';
import OrganizationModel from '../../../core/models/organization.model';
import OrganizationShowModel from '../../../core/models/organization.show.model';
import OrganizationRepository from '../organization.repository';

const organizationJson = {
  id: 10,
  employee_name: 'Jane Admin',
  employee_email: 'jane@example.com',
  employee_phone: '01000000000',
  employee_password: 'secret',
  address: 'Cairo',
  name: 'Build Hub',
  default_employee: {
    id: 1,
    name: 'Jane Admin',
    email: 'jane@example.com',
    phone: '01000000000',
  },
};

describe('OrganizationRepository', () => {
  it('returns the same singleton instance', () => {
    expect(OrganizationRepository.getInstance()).toBe(OrganizationRepository.getInstance());
  });

  it('parses item and list responses', () => {
    const repository = OrganizationRepository.getInstance() as unknown as {
      parseItem(data: unknown): OrganizationShowModel;
      parseList(data: unknown): OrganizationModel[];
      config: { hasPagination: boolean; dataKey: string; paginationKey: string };
    };

    expect(repository.config).toEqual({
      hasPagination: true,
      dataKey: 'data',
      paginationKey: 'meta',
    });
    expect(repository.parseItem(organizationJson)).toBeInstanceOf(OrganizationShowModel);
    expect(repository.parseList([organizationJson])).toEqual([expect.any(OrganizationModel)]);
    expect(repository.parseList({})).toEqual([]);
  });
});
