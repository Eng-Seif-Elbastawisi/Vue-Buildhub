import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AddOrganizationParams from '../../../core/params/add.organization.params';
import OrganizationAdd from '../OrganizationAdd.vue';

const mockController = vi.hoisted(() => ({
  create: vi.fn(),
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/organization.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/organization/add' }),
}));

const params = new AddOrganizationParams({
  name: 'Build Hub',
  address: 'Cairo',
  employee_name: 'Jane',
  employee_email: 'jane@example.com',
  employee_phone: '01000000000',
  employee_password: 'secret',
});

const global = {
  stubs: {
    OrganizationForm: {
      emits: ['updateData'],
      template: '<div class="organization-form-stub" @click="$emit(\'updateData\', params)"></div>',
      setup: () => ({ params }),
    },
  },
  mocks: {
    $t: (key: string) => key,
  },
};

describe('OrganizationAdd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.create.mockResolvedValue({});
    mockController.errorMessage.value = null;
  });

  it('creates an organization with emitted form params', async () => {
    const wrapper = mount(OrganizationAdd, { global });

    await wrapper.find('.organization-form-stub').trigger('click');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(mockController.create).toHaveBeenCalledWith(params, undefined, '/organization/add');
  });

  it('renders controller errors', () => {
    mockController.errorMessage.value = 'Unable to save';
    const wrapper = mount(OrganizationAdd, { global });

    expect(wrapper.find('.error').text()).toBe('Unable to save');
  });
});
