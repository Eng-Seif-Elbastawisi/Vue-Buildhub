import { describe, expect, it } from 'vitest';
import { PackageEndpoints } from '../package.api.endpoints';

describe('PackageEndpoints', () => {
  it('exposes the full mainportal package CRUD endpoints', () => {
    const endpoints = new PackageEndpoints();

    expect(endpoints.index).toContain('mainportal/fetch_packages');
    expect(endpoints.show).toContain('mainportal/show_package');
    expect(endpoints.store).toContain('mainportal/store_package');
    expect(endpoints.update).toContain('mainportal/update_package');
    expect(endpoints.delete).toContain('mainportal/delete_package');
    expect(endpoints.fetchPackageSubscriptions).toContain('mainportal/fetch_package_subscriptions');
    expect(endpoints.changePackageSubscriptionStatus).toContain(
      'mainportal/change_package_subscription_status',
    );
  });
});
