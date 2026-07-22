import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PackageModel from '../../../core/models/package.model';
import AddPackageParams from '../../../core/params/add.package.params';
import EditPackageParams from '../../../core/params/edit.package.params';
import ShowPackageParams from '../../../core/params/show.package.params';
import PackageEdit from '../PackageEdit.vue';

const mockController = vi.hoisted(() => ({
  fetchOne: vi.fn(),
  update: vi.fn(),
  itemData: { value: null as PackageModel | null },
  errorMessage: { value: null as string | null },
}));

vi.mock('../../controllers/package.controller', () => ({
  default: { getInstance: () => mockController },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/admin/package/edit/12', params: { id: '12' } }),
}));

const addParams = new AddPackageParams({
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
      template: '<div class="package-form-stub" @click="$emit(\'updateData\', addParams)"></div>',
      setup: () => ({ addParams }),
    },
  },
  mocks: { $t: (key: string) => key },
};

describe('PackageEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockController.fetchOne.mockResolvedValue({});
    mockController.update.mockResolvedValue({});
    mockController.itemData.value = PackageModel.example;
  });

  it('fetches and updates the selected package', async () => {
    const wrapper = mount(PackageEdit, { global });
    await flushPromises();
    expect(mockController.fetchOne).toHaveBeenCalledWith(expect.any(ShowPackageParams));

    await wrapper.find('.package-form-stub').trigger('click');
    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(mockController.update).toHaveBeenCalledWith(
      expect.any(EditPackageParams),
      undefined,
      '/admin/package/edit/12',
    );
  });
});
