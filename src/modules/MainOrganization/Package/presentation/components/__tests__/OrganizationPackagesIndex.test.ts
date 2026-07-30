import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DataInitial } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { PackageSubscriptionStatus } from '@/modules/shared/Package/core/constants/package.subscription.status.enum';
import SubscribeToPackageParams from '../../../core/params/subscribe.to.package.params';
import OrganizationPackageApiService from '../../../data/api/organization.package.api-service';
import OrganizationPackageController from '../../controllers/organization.package.controller';
import OrganizationPackagesIndex from '../OrganizationPackagesIndex.vue';
import { createPackageOffer } from './organization.package.test-factory';

const DialogStub = {
  props: ['visible'],
  template: `
    <section v-if="visible" class="dialog-stub">
      <slot name="header" />
      <slot />
      <slot name="footer" />
    </section>
  `,
};

describe('OrganizationPackagesIndex', () => {
  const apiService = OrganizationPackageApiService.getInstance();
  const controller = OrganizationPackageController.getInstance();

  beforeEach(() => {
    controller.packagesState.value = new DataInitial();
    controller.subscriptionsState.value = new DataInitial();
    controller.subscribeState.value = new DataInitial();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads both lists and refreshes subscription state after confirming', async () => {
    const packageOffer = createPackageOffer();
    vi.spyOn(apiService, 'fetchPackages').mockResolvedValue({
      statusCode: 200,
      data: { status: true, data: [packageOffer] },
    });
    const fetchHistory = vi
      .spyOn(apiService, 'fetchPackageSubscriptions')
      .mockResolvedValueOnce({
        statusCode: 200,
        data: { status: true, data: [] },
      })
      .mockResolvedValueOnce({
        statusCode: 200,
        data: {
          status: true,
          data: [
            {
              id: 3,
              package: { id: 8, title: 'Professional Package' },
              status: PackageSubscriptionStatus.PENDING,
              notes: null,
              created_at: '2026-07-30 09:00:00',
            },
          ],
        },
      });
    const subscribe = vi.spyOn(apiService, 'subscribeToPackage').mockResolvedValue({
      statusCode: 201,
      data: { status: true, message: 'Subscription queued' },
    });
    const wrapper = mount(OrganizationPackagesIndex, {
      global: {
        stubs: {
          Dialog: DialogStub,
          Skeleton: true,
          TableSkelaton: true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Professional Package');
    expect(fetchHistory).toHaveBeenCalledTimes(1);

    await wrapper.get('.organization-package-card__action').trigger('click');
    await wrapper.findAll('.dialog-stub button')[1]?.trigger('click');
    await flushPromises();

    const params = subscribe.mock.calls[0]?.[0];

    expect(params).toBeInstanceOf(SubscribeToPackageParams);
    expect(params?.toMap()).toEqual({ package_id: 8 });
    expect(fetchHistory).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).toContain('Subscription pending');
    expect(
      wrapper.get<HTMLButtonElement>('.organization-package-card__action').element.disabled,
    ).toBe(true);
  });
});
