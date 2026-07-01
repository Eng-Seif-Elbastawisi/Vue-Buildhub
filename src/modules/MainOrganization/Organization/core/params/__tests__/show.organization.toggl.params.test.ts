import { describe, expect, it } from 'vitest';
import ShowOrganizationToggledParams from '../show.organization.toggl.params';

describe('ShowOrganizationToggledParams', () => {
  it('serializes an empty show_fetch_from payload', () => {
    const params = new ShowOrganizationToggledParams();

    expect(params.toMap()).toEqual({});
    expect(params.validate().isValid).toBe(true);
  });
});
