import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { PackageSubscriptionStatus } from '../../../core/constants/package.subscription.status.enum';
import PackageSubscriptionModel from '../../../core/models/package.subscription.model';
import ChangePackageSubscriptionStatusParams from '../../../core/params/change.package.subscription.status.params';
import PackageSubscriptionsIndex from '../PackageSubscriptionsIndex.vue';

const mockController = vi.hoisted(() => ({
  fetchPackageSubscriptions: vi.fn(),
  changePackageSubscriptionStatus: vi.fn(),
  listState: { value: { status: 'success' } },
}));

vi.mock('../../controllers/package.subscription.controller', () => ({
  default: { getInstance: () => mockController },
}));

const subscription = PackageSubscriptionModel.example;

const global = {
  stubs: {
    DataStatusBuilder: {
      setup() {
        return {
          subscriptions: [subscription],
        };
      },
      template: '<div><slot name="success" :data="subscriptions" /></div>',
    },
    AppTable: {
      props: ['items'],
      template:
        '<div><div v-for="item in items" :key="item.id"><slot name="cell-status" :item="item" /><slot name="cell-notes" :item="item" /><slot name="cell-created_at" :item="item" /><slot name="cell-actions" :item="item" /></div></div>',
    },
    PackageSubscriptionStatusDialog: {
      props: ['modelValue', 'subscription', 'loading'],
      emits: ['submit', 'update:modelValue'],
      setup(props: { subscription: PackageSubscriptionModel | null }, { emit }) {
        const submit = () => {
          if (!props.subscription) {
            return;
          }

          emit(
            'submit',
            new ChangePackageSubscriptionStatusParams({
              package_subscription_id: props.subscription.id,
              status: PackageSubscriptionStatus.CONFIRMED,
              notes: props.subscription.notes,
            }),
          );
        };

        return { submit };
      },
      template: '<div v-if="modelValue" class="dialog-stub"><button class="btn-primary" @click="submit">save</button></div>',
    },
    TableSkelaton: true,
  },
  mocks: { $t: (key: string) => key },
};

describe('PackageSubscriptionsIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.fetchPackageSubscriptions.mockResolvedValue({});
    mockController.changePackageSubscriptionStatus.mockResolvedValue(
      new DataSuccess<void>({ message: 'Updated' }),
    );
  });

  it('fetches package subscriptions on mount', async () => {
    mount(PackageSubscriptionsIndex, { global });

    await flushPromises();

    expect(mockController.fetchPackageSubscriptions).toHaveBeenCalledTimes(1);
  });

  it('opens the change-status dialog and submits the selected subscription status', async () => {
    const wrapper = mount(PackageSubscriptionsIndex, { global });

    await flushPromises();
    await wrapper.find('.action-btn').trigger('click');
    await wrapper.find('.dialog-stub .btn-primary').trigger('click');
    await flushPromises();

    const params = mockController.changePackageSubscriptionStatus.mock
      .calls[0][0] as ChangePackageSubscriptionStatusParams;

    expect(params).toBeInstanceOf(ChangePackageSubscriptionStatusParams);
    expect(params.toMap()).toEqual({
      package_subscription_id: subscription.id,
      status: PackageSubscriptionStatus.CONFIRMED,
      notes: subscription.notes,
    });
    expect(mockController.fetchPackageSubscriptions).toHaveBeenCalledTimes(2);
  });
});
