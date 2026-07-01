import { describe, expect, it } from 'vitest';
import OrganizationToggledModel from '../organization.toggle.model';

describe('OrganizationToggledModel', () => {
  it('maps toggle status JSON and freezes the instance', () => {
    const model = OrganizationToggledModel.fromJson({ id: 10, toggle_status: 2 });

    expect(model).toMatchObject({
      id: 10,
      toggle_status: 2,
    });
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('normalizes unknown statuses to active', () => {
    expect(OrganizationToggledModel.fromJson({ toggle_status: '1' }).toggle_status).toBe(1);
    expect(OrganizationToggledModel.fromJson({ toggle_status: null }).toggle_status).toBe(1);
  });

  it('throws for empty JSON and exposes an example', () => {
    expect(() => OrganizationToggledModel.fromJson(null)).toThrow(
      'Cannot create OrganizationToggledModel',
    );
    expect(OrganizationToggledModel.example).toBeInstanceOf(OrganizationToggledModel);
  });
});
