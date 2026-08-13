import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import OrganizationToggledModel from '../../../core/models/organization.toggle.model';
import ToggleOrganizationParams from '../../../core/params/toggle.organization.params';
import OrganizationTogglIndex from '../OrganizationTogglIndex.vue';

const mockController = vi.hoisted(() => ({
  showSetting: vi.fn(),
  toggleSetting: vi.fn(),
  itemData: { value: null as OrganizationToggledModel | null },
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/organization.toggl.controller', () => ({
  default: { getInstance: () => mockController },
}));

const global = {
  stubs: {
    ToggleSwitch: {
      props: ['modelValue', 'disabled'],
      emits: ['update:modelValue'],
      template:
        '<button class="toggle-switch-stub" :disabled="disabled" @click="$emit(\'update:modelValue\', !modelValue)">{{ modelValue }}</button>',
    },
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('OrganizationTogglIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    mockController.itemData.value = OrganizationToggledModel.example;
    mockController.errorMessage.value = null;
    mockController.showSetting.mockResolvedValue(
      new DataSuccess({ data: OrganizationToggledModel.example }),
    );
    mockController.toggleSetting.mockResolvedValue(
      new DataSuccess({
        data: new OrganizationToggledModel({ id: 10, toggle_status: 2 }),
      }),
    );
  });

  it('loads and renders the organization fetch toggle page', async () => {
    const wrapper = mount(OrganizationTogglIndex, { global });
    await flushPromises();

    expect(mockController.showSetting).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain('show organization');
    expect(wrapper.text()).toContain('organization_toggle.inactive');
  });

  it('renders the irreversible access warning before the setting is enabled', async () => {
    const wrapper = mount(OrganizationTogglIndex, { global });
    await flushPromises();

    expect(wrapper.get('.toggle-warning').text()).toContain(
      'organization_toggle.irreversible_warning',
    );
    expect(wrapper.get('.toggle-warning').attributes('role')).toBe('alert');
  });

  it('sends numeric toggle params when the switch changes', async () => {
    const wrapper = mount(OrganizationTogglIndex, { global });
    await flushPromises();

    await wrapper.find('.toggle-switch-stub').trigger('click');
    await flushPromises();

    expect(mockController.toggleSetting).toHaveBeenCalledWith(expect.any(ToggleOrganizationParams));
    expect(mockController.toggleSetting.mock.calls[0]?.[0].toggle_status).toBe(2);
    expect(window.localStorage.getItem('organizationFetchToggleStatus')).toBe('2');
    expect(wrapper.text()).toContain('organization_toggle.active');
  });

  it('keeps the selected active state when the toggle response returns stale inactive data', async () => {
    mockController.toggleSetting.mockResolvedValue(
      new DataSuccess({
        data: new OrganizationToggledModel({ id: 10, toggle_status: 1 }),
      }),
    );
    const wrapper = mount(OrganizationTogglIndex, { global });
    await flushPromises();

    await wrapper.find('.toggle-switch-stub').trigger('click');
    await flushPromises();

    expect(mockController.toggleSetting.mock.calls[0]?.[0].toggle_status).toBe(2);
    expect(wrapper.text()).toContain('organization_toggle.active');
    expect(wrapper.find('.toggle-switch-stub').text()).toBe('true');
  });

  it('loads the numeric value from the show endpoint when no local selection exists', async () => {
    mockController.showSetting.mockResolvedValue(
      new DataSuccess({
        data: new OrganizationToggledModel({ id: 10, toggle_status: 2 }),
      }),
    );

    const wrapper = mount(OrganizationTogglIndex, { global });
    await flushPromises();

    expect(wrapper.text()).toContain('organization_toggle.active');
    expect(window.localStorage.getItem('organizationFetchToggleStatus')).toBe('2');
  });

  it('prefers the locally selected status on refresh while the show endpoint syncs', async () => {
    window.localStorage.setItem('organizationFetchToggleStatus', '2');
    mockController.showSetting.mockResolvedValue(
      new DataSuccess({
        data: new OrganizationToggledModel({ id: 10, toggle_status: 1 }),
      }),
    );

    const wrapper = mount(OrganizationTogglIndex, { global });
    await flushPromises();

    expect(wrapper.text()).toContain('organization_toggle.active');
    expect(window.localStorage.getItem('organizationFetchToggleStatus')).toBe('2');
  });

  it('keeps the compact card when controller errors are present', async () => {
    mockController.errorMessage.value = 'Unable to load setting';
    const wrapper = mount(OrganizationTogglIndex, { global });
    await flushPromises();

    expect(wrapper.find('.toggle-card').exists()).toBe(true);
    expect(wrapper.find('.toggle-error').exists()).toBe(false);
  });
});
