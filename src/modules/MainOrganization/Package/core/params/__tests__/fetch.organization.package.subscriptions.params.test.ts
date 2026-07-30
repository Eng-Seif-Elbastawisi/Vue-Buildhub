import { describe, expect, it } from 'vitest';
import FetchOrganizationPackageSubscriptionsParams from '../fetch.organization.package.subscriptions.params';

describe('FetchOrganizationPackageSubscriptionsParams', () => {
  it('creates the empty payload expected by fetch_package_subscriptions', () => {
    const params = new FetchOrganizationPackageSubscriptionsParams();

    expect(params.toMap()).toEqual({});
    expect(params.validate().isValid).toBe(true);
  });
});
