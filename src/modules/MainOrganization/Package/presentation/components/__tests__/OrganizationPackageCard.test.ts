import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { PackageSubscriptionStatus } from '@/modules/shared/Package/core/constants/package.subscription.status.enum';
import OrganizationPackageCard from '../OrganizationPackageCard.vue';
import { createPackageOffer, createSubscription } from './organization.package.test-factory';

describe('OrganizationPackageCard', () => {
  it('renders backend pricing and key_name feature values', () => {
    const wrapper = mount(OrganizationPackageCard, {
      props: {
        packageOffer: createPackageOffer(),
        subscription: null,
        subscribing: false,
        globalSubscriptionBlocked: false,
        subscriptionAccessReady: true,
      },
    });

    expect(wrapper.text()).toContain('Professional Package');
    expect(wrapper.text()).toContain('500.00');
    expect(wrapper.text()).toContain('450.00');
    expect(wrapper.text()).toContain('10.00% OFF');
    expect(wrapper.text()).toContain('6 Months');
    expect(wrapper.text()).toContain('Number of employees');
    expect(wrapper.text()).toContain('33');
    expect(wrapper.text()).toContain('Available');
    expect(wrapper.text()).toContain('Not available');
    expect(wrapper.find('.organization-package-card__original-price').exists()).toBe(true);
  });

  it('blocks pending subscriptions and allows rejected subscriptions again', async () => {
    const wrapper = mount(OrganizationPackageCard, {
      props: {
        packageOffer: createPackageOffer(),
        subscription: createSubscription(PackageSubscriptionStatus.PENDING),
        subscribing: false,
        globalSubscriptionBlocked: true,
        subscriptionAccessReady: true,
      },
    });
    const subscribeButton = wrapper.get<HTMLButtonElement>('.organization-package-card__action');

    expect(subscribeButton.element.disabled).toBe(true);
    expect(subscribeButton.text()).toContain('Subscription pending');

    await wrapper.setProps({
      subscription: createSubscription(PackageSubscriptionStatus.REJECTED, 2),
      globalSubscriptionBlocked: false,
    });

    expect(subscribeButton.element.disabled).toBe(false);
    expect(subscribeButton.text()).toContain('Subscribe again');
  });

  it('uses the confirmed visual action for the current package', () => {
    const wrapper = mount(OrganizationPackageCard, {
      props: {
        packageOffer: createPackageOffer(),
        subscription: createSubscription(PackageSubscriptionStatus.CONFIRMED),
        subscribing: false,
        globalSubscriptionBlocked: true,
        subscriptionAccessReady: true,
      },
    });
    const subscribeButton = wrapper.get<HTMLButtonElement>('.organization-package-card__action');

    expect(subscribeButton.element.disabled).toBe(true);
    expect(subscribeButton.text()).toContain('Current package');
    expect(subscribeButton.classes()).toContain('organization-package-card__action--current');
  });
});
