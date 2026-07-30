import { describe, expect, it } from 'vitest';
import { PackageEndpoints } from '../package.api.endpoints';

describe('shared package endpoints', () => {
  it('exposes organization package reads and subscription actions', () => {
    const endpoints = new PackageEndpoints();

    expect(endpoints.fetchPackages).toContain('mainportal/fetch_packages');
    expect(endpoints.subscribeToPackage).toContain('mainportal/subscribe_to_package');
    expect(endpoints.fetchPackageSubscriptions).toContain('mainportal/fetch_package_subscriptions');
  });
});
