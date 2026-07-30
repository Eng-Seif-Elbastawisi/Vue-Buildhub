import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { PackageSubscriptionStatus } from '../../../core/constants/package.subscription.status.enum';
import PackageSubscriptionModel from '../../../core/models/package.subscription.model';
import ChangePackageSubscriptionStatusParams from '../../../core/params/change.package.subscription.status.params';
import PackageSubscriptionStatusDialog from '../PackageSubscriptionStatusDialog.vue';

const subscription = PackageSubscriptionModel.example;

const global = {
  stubs: {
    Dialog: {
      props: ['visible'],
      emits: ['update:visible'],
      template: '<div v-if="visible" class="dialog-stub"><slot /></div>',
    },
    UpdatedCustomInputSelect: {
      props: ['modelValue', 'staticOptions'],
      emits: ['update:modelValue'],
      template:
        '<button class="status-select-stub" @click="$emit(\'update:modelValue\', staticOptions[2])">{{ modelValue?.title }}</button>',
    },
  },
  mocks: { $t: (key: string) => key },
};

describe('PackageSubscriptionStatusDialog', () => {
  it('submits only the package subscription status payload', async () => {
    const wrapper = mount(PackageSubscriptionStatusDialog, {
      props: {
        modelValue: true,
        subscription,
      },
      global,
    });

    await wrapper.find('.status-select-stub').trigger('click');
    await wrapper.find('textarea').setValue('  zzzzz  ');
    await wrapper.find('.btn-primary').trigger('click');

    const submittedParams = wrapper.emitted('submit')?.[0]?.[0] as
      | ChangePackageSubscriptionStatusParams
      | undefined;

    expect(wrapper.text()).not.toContain(subscription.packageTitle);
    expect(submittedParams).toBeInstanceOf(ChangePackageSubscriptionStatusParams);
    expect(submittedParams?.toMap()).toEqual({
      package_subscription_id: subscription.id,
      status: PackageSubscriptionStatus.REJECTED,
      notes: 'zzzzz',
    });
  });
});
