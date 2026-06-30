import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddSpaceParams from '../../../core/params/add.space.params';
import EditSpaceParams from '../../../core/params/edit.space.params';
import SpaceEdit from '../SpaceEdit.vue';

const fetchOne = vi.fn();
const update = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/space/edit/2', params: { space_id: '2' } }),
}));
vi.mock('../../controllers/space.controller', () => ({
  default: {
    getInstance: () => ({ fetchOne, update, itemData: ref(null), errorMessage: ref('') }),
  },
}));

const FormStub = {
  emits: ['updateData'],
  template: '<button class="form" @click="$emit(\'updateData\', params)">form</button>',
  data: () => ({
    params: new AddSpaceParams({
      translations: new TranslationParams({ title: { en: 'Mall' } }),
    }),
  }),
};

describe('SpaceEdit', () => {
  it('loads and updates project', async () => {
    const wrapper = mount(SpaceEdit, {
      global: { mocks: { $t: (key: string) => key }, stubs: { SpaceForm: FormStub } },
    });
    await flushPromises();
    expect(fetchOne).toHaveBeenCalledWith(
      expect.objectContaining({ spaceId: 2, allLocales: true }),
    );
    await wrapper.find('.form').trigger('click');
    await wrapper.find('.btn').trigger('click');
    expect(update).toHaveBeenCalledWith(expect.any(EditSpaceParams), undefined, '/space/edit/2');
  });
});
