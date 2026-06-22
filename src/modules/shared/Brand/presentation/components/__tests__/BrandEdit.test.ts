import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import TranslationParams from '@/base/Core/Params/translationParams';
import { BrandTypeEnum } from '../../../core/constant/Brand.type.enum';
import BrandShowModel from '../../../core/models/brand.show.model';
import AddBrandParams from '../../../core/params/add.brand.params';
import EditBrandParams from '../../../core/params/edit.brand.params';
import ShowBrandParams from '../../../core/params/show.brand.params';
import BrandEdit from '../BrandEdit.vue';

const fetchOne = vi.fn().mockResolvedValue({});
const update = vi.fn().mockResolvedValue({});

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/brand/edit/8', params: { id: '8' } }),
}));

vi.mock('../../controllers/brand.controller.ts', () => ({
  default: {
    getInstance: () => ({
      fetchOne,
      update,
      itemData: ref(BrandShowModel.example),
      errorMessage: ref(''),
    }),
  },
}));

const addParams = new AddBrandParams({
  translations: new TranslationParams({
    title: { en: 'Acme', ar: 'أكمي' },
  }),
  type: BrandTypeEnum.MATERIALS,
});

const BrandFormStub = {
  emits: ['updateData'],
  template: '<button class="emit-form" @click="$emit(\'updateData\', addParams)">form</button>',
  setup: () => ({ addParams }),
};

describe('BrandEdit', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads all translations and updates the selected brand', async () => {
    const wrapper = mount(BrandEdit, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { BrandForm: BrandFormStub, IconAccept: true },
      },
    });
    await flushPromises();

    expect(fetchOne).toHaveBeenCalledWith(expect.any(ShowBrandParams));
    expect(fetchOne.mock.calls[0]?.[0]).toMatchObject({ brand_id: 8, allLocales: true });

    await wrapper.find('.emit-form').trigger('click');
    await wrapper.find('button.btn-primary').trigger('click');
    await flushPromises();

    expect(update).toHaveBeenCalledWith(expect.any(EditBrandParams), undefined, '/brand/edit/8');
    expect(update.mock.calls[0]?.[0].toMap()).toEqual({
      brand_id: 8,
      translations: {
        title: { en: 'Acme', ar: 'أكمي' },
      },
      type: BrandTypeEnum.MATERIALS,
    });
  });
});
