import { describe, expect, it } from 'vitest';
import FetchOrganizationPackagesParams from '../fetch.organization.packages.params';

describe('FetchOrganizationPackagesParams', () => {
  it('creates the empty payload expected by fetch_packages', () => {
    const params = new FetchOrganizationPackagesParams();

    expect(params.toMap()).toEqual({});
    expect(params.validate().isValid).toBe(true);
  });
});
