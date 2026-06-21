import { describe, expect, it } from 'vitest';
import DeleteOrganizationParams from '../delete.organization.params';

describe('DeleteOrganizationParams', () => {
  it('maps and validates the organization id', () => {
    expect(new DeleteOrganizationParams({ organization_id: 4 }).toMap()).toEqual({
      organization_id: 4,
    });
    expect(new DeleteOrganizationParams({ organization_id: 4 }).validate().isValid).toBe(true);
    expect(
      new DeleteOrganizationParams({ organization_id: undefined as unknown as number }).validate()
        .isValid,
    ).toBe(false);
  });
});
