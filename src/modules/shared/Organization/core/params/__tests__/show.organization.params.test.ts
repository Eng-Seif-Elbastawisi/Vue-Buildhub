import { describe, expect, it } from 'vitest';
import ShowOrganizationParams from '../show.organization.params';

describe('ShowOrganizationParams', () => {
  it('maps and validates the organization id', () => {
    const params = new ShowOrganizationParams({ organization_id: 4, allLocales: true });

    expect(params.toMap()).toEqual({ organization_id: 4 });
    expect(params.allLocales).toBe(true);
    expect(params.validate().isValid).toBe(true);
    expect(
      new ShowOrganizationParams({ organization_id: null as unknown as number }).validate().isValid,
    ).toBe(false);
  });
});
