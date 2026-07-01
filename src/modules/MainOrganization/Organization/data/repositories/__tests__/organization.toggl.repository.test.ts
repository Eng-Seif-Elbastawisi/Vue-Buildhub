import { describe, expect, it } from 'vitest';
import OrganizationToggledModel from '../../../core/models/organization.toggle.model';
import OrganizationRepository from '../organization.toggl.repository';

describe('OrganizationRepository', () => {
  it('returns the same singleton instance', () => {
    expect(OrganizationRepository.getInstance()).toBe(OrganizationRepository.getInstance());
  });

  it('parses item and list responses', () => {
    const repository = OrganizationRepository.getInstance() as unknown as {
      parseItem(data: unknown): OrganizationToggledModel;
      parseList(data: unknown): OrganizationToggledModel[];
      config: { hasPagination: boolean; dataKey: string; paginationKey: string };
    };

    expect(repository.config).toEqual({
      hasPagination: false,
      dataKey: 'data',
      paginationKey: 'meta',
    });
    expect(repository.parseItem({ id: 1, toggle_status: true })).toBeInstanceOf(
      OrganizationToggledModel,
    );
    expect(repository.parseList([{ id: 1, toggle_status: true }])).toEqual([
      expect.any(OrganizationToggledModel),
    ]);
    expect(repository.parseList({})).toEqual([]);
  });
});
