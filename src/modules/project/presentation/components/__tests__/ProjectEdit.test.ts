import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import AddProjectParams from '../../../core/params/add.project.params';
import EditProjectParams from '../../../core/params/edit.project.params';
import ProjectEdit from '../ProjectEdit.vue';
const fetchOne = vi.fn();
const update = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/project/edit/2', params: { project_id: '2' } }),
}));
vi.mock('../../controllers/project.controller', () => ({
  default: {
    getInstance: () => ({ fetchOne, update, itemData: ref(null), errorMessage: ref('') }),
  },
}));
const FormStub = {
  emits: ['updateData'],
  template: '<button class="form" @click="$emit(\'updateData\', params)">form</button>',
  data: () => ({ params: new AddProjectParams({ name: 'Mall', projectType: 4 }) }),
};
describe('ProjectEdit', () => {
  it('loads and updates project', async () => {
    const wrapper = mount(ProjectEdit, {
      global: { mocks: { $t: (key: string) => key }, stubs: { ProjectForm: FormStub } },
    });
    await flushPromises();
    expect(fetchOne).toHaveBeenCalledWith(expect.objectContaining({ projectId: 2 }));
    await wrapper.find('.form').trigger('click');
    await wrapper.find('.btn').trigger('click');
    expect(update).toHaveBeenCalledWith(
      expect.any(EditProjectParams),
      undefined,
      '/project/edit/2',
    );
  });
});
