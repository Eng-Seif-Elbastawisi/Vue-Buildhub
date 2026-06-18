import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OrganizationModel from '../../../core/models/organization.model';
import EditOrganizationParams from '../../../core/params/edit.organization.params';
import ShowOrganizationParams from '../../../core/params/show.organization.params';
import AddOrganizationParams from '../../../core/params/add.organization.params';
import OrganizationEdit from '../OrganizationEdit.vue';

const mockController = vi.hoisted(() => ({
  fetchOne: vi.fn(),
  update: vi.fn(),
  itemData: { value: null as OrganizationModel | null },
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/organization.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/organization/edit/12', params: { id: '12' } }),
}));

const addParams = new AddOrganizationParams({
  name: 'Build Hub',
  address: 'Cairo',
  employee_name: 'Jane',
  employee_email: 'jane@example.com',
  employee_phone: '01000000000',
});

const global = {
  stubs: {
    OrganizationForm: {
      emits: ['updateData'],
      template:
        '<div class="organization-form-stub" @click="$emit(\'updateData\', addParams)"></div>',
      setup: () => ({ addParams }),
    },
    IconAccept: true,
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('OrganizationEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.fetchOne.mockResolvedValue({});
    mockController.update.mockResolvedValue({});
    mockController.itemData.value = OrganizationModel.example;
    mockController.errorMessage.value = null;
  });

  it('fetches organization data on mount', async () => {
    mount(OrganizationEdit, { global });
    await flushPromises();

    expect(mockController.fetchOne).toHaveBeenCalledWith(expect.any(ShowOrganizationParams));
    expect(mockController.fetchOne.mock.calls[0]?.[0].organization_id).toBe(12);
    expect(mockController.fetchOne.mock.calls[0]?.[0].allLocales).toBe(true);
  });

  it('updates organization with edit params converted from form params', async () => {
    const wrapper = mount(OrganizationEdit, { global });

    await wrapper.find('.organization-form-stub').trigger('click');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(mockController.update).toHaveBeenCalledWith(
      expect.any(EditOrganizationParams),
      undefined,
      '/organization/edit/12',
    );
    expect(mockController.update.mock.calls[0]?.[0].organization_id).toBe(12);
  });

  it('renders controller errors', () => {
    mockController.errorMessage.value = 'Unable to update';
    const wrapper = mount(OrganizationEdit, { global });

    expect(wrapper.find('.error').text()).toBe('Unable to update');
  });
});
