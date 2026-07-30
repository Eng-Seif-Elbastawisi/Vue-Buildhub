import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import OrganizationPackagesGrid from '../OrganizationPackagesGrid.vue';
import { createPackageOffer, createSubscription } from './organization.package.test-factory';

describe('OrganizationPackagesGrid', () => {
  it('renders every package with a stable card and forwards subscriptions', async () => {
    const firstPackage = createPackageOffer(8);
    const wrapper = mount(OrganizationPackagesGrid, {
      props: {
        packages: [firstPackage, createPackageOffer(9)],
        subscriptions: [createSubscription()],
        subscribing: false,
      },
    });

    expect(wrapper.findAll('.organization-package-card')).toHaveLength(2);

    await wrapper.findAll('.organization-package-card__action')[1]?.trigger('click');

    expect(wrapper.emitted('subscribe')?.[0]).toEqual([expect.objectContaining({ id: 9 })]);
  });
});
