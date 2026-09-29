import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddAttachmentTypeParams from '../../../core/params/add.attachment.type.params';
import EditAttachmentTypeParams from '../../../core/params/edit.attachment.type.params';
import AttachmentTypeEdit from '../AttachmentTypeEdit.vue';

const update = vi.fn();
const fetchOne = vi.fn().mockResolvedValue({ isSuccess: true });
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '5' }, fullPath: '/attachment-types/edit/5' }),
}));
vi.mock('../../controllers/attachment.type.controller', () => ({
  default: {
    getInstance: () => ({
      update,
      fetchOne,
      itemData: ref({ id: 5, translations: new TranslationParams({ title: { en: 'Plan' } }) }),
      errorMessage: ref(''),
    }),
  },
}));

const FormStub = {
  emits: ['updateData'],
  template: '<button class="form" @click="$emit(\'updateData\', params)">form</button>',
  data: () => ({
    params: new AddAttachmentTypeParams({
      translations: new TranslationParams({ title: { en: 'Updated Plan' } }),
    }),
  }),
};

describe('AttachmentTypeEdit', () => {
  it('updates form data', async () => {
    const wrapper = mount(AttachmentTypeEdit, {
      global: { mocks: { $t: (key: string) => key }, stubs: { AttachmentTypeForm: FormStub } },
    });
    await wrapper.find('.form').trigger('click');
    await wrapper.find('.btn').trigger('click');
    await flushPromises();
    expect(update).toHaveBeenCalledWith(
      expect.any(EditAttachmentTypeParams),
      undefined,
      '/attachment-types/edit/5',
    );
  });
});
