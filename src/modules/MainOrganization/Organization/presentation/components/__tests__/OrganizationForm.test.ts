import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import OrganizationModel from '../../../core/models/organization.model';
import AddOrganizationParams from '../../../core/params/add.organization.params';
import OrganizationForm from '../OrganizationForm.vue';

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
  useRoute: () => ({ fullPath: '/organization/add', params: {} }),
}));

const global = {
  stubs: {
    DocumentIcon: true,
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('OrganizationForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders organization fields', () => {
    const wrapper = mount(OrganizationForm, { global });

    expect(wrapper.find('#organization-name').exists()).toBe(true);
    expect(wrapper.find('#organization-address').exists()).toBe(true);
    expect(wrapper.find('#organization-employee_email').exists()).toBe(true);
  });

  it('emits add params when a field changes', async () => {
    const wrapper = mount(OrganizationForm, { global });

    await wrapper.find('#organization-name').setValue('Build Hub');
    await wrapper.find('#organization-name').trigger('input');

    const emittedParams = wrapper.emitted('updateData')?.at(-1)?.[0] as AddOrganizationParams;
    expect(emittedParams).toBeInstanceOf(AddOrganizationParams);
    expect(emittedParams.name).toBe('Build Hub');
  });

  it('prefills from organization prop and disables fields while loading', () => {
    const wrapper = mount(OrganizationForm, {
      global,
      props: { organization: OrganizationModel.example, loading: true },
    });

    expect(wrapper.find<HTMLInputElement>('#organization-name').element.value).toBe(
      OrganizationModel.example.name,
    );
    expect(wrapper.find('.form-fields.disabled').exists()).toBe(true);
    expect(wrapper.emitted('updateData')?.[0]?.[0]).toBeInstanceOf(AddOrganizationParams);
  });
});
