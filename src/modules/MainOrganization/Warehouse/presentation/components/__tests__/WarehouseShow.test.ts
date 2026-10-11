import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import TranslationParams from '@/base/Core/Params/translationParams';
import WarehouseShowModel from '../../../core/models/warehouse.show.model';
import WarehouseShow from '../WarehouseShow.vue';

const fetchOne = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { warehouse_id: '2' } }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('../../controllers/warehouse.controller', () => ({
  default: {
    getInstance: () => ({
      fetchOne,
      delete: vi.fn(),
      itemData: ref(
        new WarehouseShowModel({
          id: 2,
          translations: new TranslationParams({ title: { ar: 'مخزن', en: 'Warehouse' } }),
        }),
      ),
      errorMessage: ref(''),
    }),
  },
}));

describe('WarehouseShow', () => {
  it('loads and displays Arabic and English titles', () => {
    const wrapper = mount(WarehouseShow, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { RouterLink: true, DeleteDialog: true },
      },
    });
    expect(fetchOne).toHaveBeenCalledWith(
      expect.objectContaining({ warehouseId: 2, allLocales: true }),
    );
    expect(wrapper.text()).toContain('مخزن');
    expect(wrapper.text()).toContain('Warehouse');
  });
});
