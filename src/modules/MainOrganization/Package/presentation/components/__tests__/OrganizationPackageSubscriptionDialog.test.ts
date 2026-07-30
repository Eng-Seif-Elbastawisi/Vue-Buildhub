import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import OrganizationPackageSubscriptionDialog from '../OrganizationPackageSubscriptionDialog.vue';
import { createPackageOffer } from './organization.package.test-factory';

const DialogStub = {
  props: ['visible'],
  emits: ['update:visible'],
  template: `
    <section v-if="visible" class="dialog-stub">
      <slot name="header" />
      <slot />
      <slot name="footer" />
    </section>
  `,
};

describe('OrganizationPackageSubscriptionDialog', () => {
  it('shows selected package details and emits confirmation', async () => {
    const wrapper = mount(OrganizationPackageSubscriptionDialog, {
      props: {
        modelValue: true,
        packageOffer: createPackageOffer(),
        loading: false,
      },
      global: { stubs: { Dialog: DialogStub } },
    });

    expect(wrapper.text()).toContain('Professional Package');
    expect(wrapper.text()).toContain('450.00');
    expect(wrapper.text()).toContain('6 Months');

    await wrapper.findAll('button')[1]?.trigger('click');

    expect(wrapper.emitted('confirm')).toHaveLength(1);
  });

  it('keeps both dialog actions disabled while subscribing', () => {
    const wrapper = mount(OrganizationPackageSubscriptionDialog, {
      props: {
        modelValue: true,
        packageOffer: createPackageOffer(),
        loading: true,
      },
      global: { stubs: { Dialog: DialogStub } },
    });

    expect(
      wrapper.findAll<HTMLButtonElement>('button').every((button) => button.element.disabled),
    ).toBe(true);
  });
});
