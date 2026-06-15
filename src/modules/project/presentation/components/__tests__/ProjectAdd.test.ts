import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import AddProjectParams from '../../../core/params/add.project.params';
import ProjectAdd from '../ProjectAdd.vue';
const create = vi.fn();
vi.mock('vue-router', () => ({ useRoute: () => ({ fullPath: '/project/add' }) }));
vi.mock('../../controllers/project.controller', () => ({
  default: { getInstance: () => ({ create, errorMessage: ref('') }) },
}));
const FormStub = {
  emits: ['updateData'],
  template: '<button class="form" @click="$emit(\'updateData\', params)">form</button>',
  data: () => ({ params: new AddProjectParams({ name: 'Mall', projectType: 4 }) }),
};
describe('ProjectAdd', () => {
  it('creates form data', async () => {
    const wrapper = mount(ProjectAdd, {
      global: { mocks: { $t: (key: string) => key }, stubs: { ProjectForm: FormStub } },
    });
    await wrapper.find('.form').trigger('click');
    await wrapper.find('.btn').trigger('click');
    await flushPromises();
    expect(create).toHaveBeenCalledWith(expect.any(AddProjectParams), undefined, '/project/add');
  });
});
