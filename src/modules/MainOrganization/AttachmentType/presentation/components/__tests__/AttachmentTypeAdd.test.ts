import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddAttachmentTypeParams from '../../../core/params/add.attachment.type.params';
import AttachmentTypeAdd from '../AttachmentTypeAdd.vue';

const create = vi.fn();
vi.mock('vue-router', () => ({ useRoute: () => ({ fullPath: '/attachment-types/add' }) }));
vi.mock('../../controllers/attachment.type.controller', () => ({
  default: { getInstance: () => ({ create, errorMessage: ref('') }) },
}));

const FormStub = {
  emits: ['updateData'],
  template: '<button class="form" @click="$emit(\'updateData\', params)">form</button>',
  data: () => ({
    params: new AddAttachmentTypeParams({
      translations: new TranslationParams({ title: { en: 'Plan' } }),
    }),
  }),
};

describe('AttachmentTypeAdd', () => {
  it('creates form data', async () => {
    const wrapper = mount(AttachmentTypeAdd, {
      global: { mocks: { $t: (key: string) => key }, stubs: { AttachmentTypeForm: FormStub } },
    });
    await wrapper.find('.form').trigger('click');
    await wrapper.find('.btn').trigger('click');
    await flushPromises();
    expect(create).toHaveBeenCalledWith(
      expect.any(AddAttachmentTypeParams),
      undefined,
      '/attachment-types/add',
    );
  });
});
