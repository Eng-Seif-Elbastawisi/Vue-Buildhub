import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AddPackageParams from '../../../core/params/add.package.params';
import PackageAdd from '../PackageAdd.vue';

const mockController = vi.hoisted(() => ({
  create: vi.fn(),
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/package.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({ useRoute: () => ({ fullPath: '/admin/package/add' }) }));

const params = new AddPackageParams({
  duration: 12,
  hasmobild: true,
  hasportal: true,
  projectnumbers: 10,
  employeenumbers: 25,
  price: '999.00',
});

const global = {
  stubs: {
    PackageForm: {
      emits: ['updateData'],
      template: '<div class="package-form-stub" @click="$emit(\'updateData\', params)"></div>',
      setup: () => ({ params }),
    },
  },
  mocks: { $t: (key: string) => key },
};

describe('PackageAdd', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.create.mockResolvedValue({});
    mockController.errorMessage.value = null;
  });

  it('creates a package with emitted form params', async () => {
    const wrapper = mount(PackageAdd, { global });
    await wrapper.find('.package-form-stub').trigger('click');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(mockController.create).toHaveBeenCalledWith(params, undefined, '/admin/package/add');
  });
});
