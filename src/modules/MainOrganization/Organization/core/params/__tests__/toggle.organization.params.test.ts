import { describe, expect, it } from 'vitest';
import ToggleOrganizationParams from '../toggle.organization.params';

describe('ToggleOrganizationParams', () => {
  it('maps and validates active and inactive states', () => {
    expect(new ToggleOrganizationParams({ toggle_status: 1 }).toMap()).toEqual({
      toggle_status: 1,
    });
    expect(new ToggleOrganizationParams({ toggle_status: 2 }).toMap()).toEqual({
      toggle_status: 2,
    });
    expect(new ToggleOrganizationParams({ toggle_status: 2 }).validate().isValid).toBe(true);
    expect(new ToggleOrganizationParams({ toggle_status: 3 }).validate().isValid).toBe(false);
  });
});
