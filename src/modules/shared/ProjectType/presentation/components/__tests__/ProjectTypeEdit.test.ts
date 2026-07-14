import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import TranslationParams from '@/base/Core/Params/translationParams';
import AddProjectTypeParams from '../../../core/params/add.project-type.params';
import EditProjectTypeParams from '../../../core/params/edit.project-type.params';
import ProjectTypeEdit from '../ProjectTypeEdit.vue';
const fetchOne = vi.fn();
const update = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/project/edit/2', params: { project_id: '2' } }),
}));
vi.mock('../../controllers/project-type.controller', () => ({
  default: {
    getInstance: () => ({ fetchOne, update, itemData: ref(null), errorMessage: ref('') }),
  },
}));
const FormStub = {
  emits: ['updateData'],
  template: '<button class="form" @click="$emit(\'updateData\', params)">form</button>',
  data: () => ({
    params: new AddProjectTypeParams({
      name: 'Mall',
      projectType: 4,
      translations: new TranslationParams({ title: { en: 'Mall' } }),
    }),
  }),
};
describe('ProjectTypeEdit', () => {
  it('loads and updates project', async () => {
    const wrapper = mount(ProjectTypeEdit, {
      global: { mocks: { $t: (key: string) => key }, stubs: { ProjectTypeForm: FormStub } },
    });
    await flushPromises();
    expect(fetchOne).toHaveBeenCalledWith(expect.objectContaining({ projectId: 2 }));
    await wrapper.find('.form').trigger('click');
    await wrapper.find('.btn').trigger('click');
    expect(update).toHaveBeenCalledWith(
      expect.any(EditProjectTypeParams),
      undefined,
      '/project/edit/2',
    );
  });
});
