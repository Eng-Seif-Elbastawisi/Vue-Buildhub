import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddSpaceParams from '../../../core/params/add.space.params';
import SpaceAdd from '../SpaceAdd.vue';

const create = vi.fn();
vi.mock('vue-router', () => ({ useRoute: () => ({ fullPath: '/space/add' }) }));
vi.mock('../../controllers/space.controller', () => ({
  default: { getInstance: () => ({ create, errorMessage: ref('') }) },
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

describe('SpaceAdd', () => {
  it('creates form data', async () => {
    const wrapper = mount(SpaceAdd, {
      global: { mocks: { $t: (key: string) => key }, stubs: { SpaceForm: FormStub } },
    });
    await wrapper.find('.form').trigger('click');
    await wrapper.find('.btn').trigger('click');
    await flushPromises();
    expect(create).toHaveBeenCalledWith(expect.any(AddSpaceParams), undefined, '/space/add');
  });
});
