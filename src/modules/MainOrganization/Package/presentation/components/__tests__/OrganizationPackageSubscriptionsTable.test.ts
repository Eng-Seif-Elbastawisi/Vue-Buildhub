import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import OrganizationPackageSubscriptionsTable from '../OrganizationPackageSubscriptionsTable.vue';
import { createSubscription } from './organization.package.test-factory';

describe('OrganizationPackageSubscriptionsTable', () => {
  it('renders translated status, empty notes, and a formatted subscription date', () => {
    const wrapper = mount(OrganizationPackageSubscriptionsTable, {
      props: { subscriptions: [createSubscription()] },
    });

    expect(wrapper.text()).toContain('Professional Package');
    expect(wrapper.text()).toContain('Pending');
    expect(wrapper.text()).toContain('-');
    expect(wrapper.text()).toContain('Jul');
    expect(wrapper.find('.package-subscription-status--pending').exists()).toBe(true);
  });
});
