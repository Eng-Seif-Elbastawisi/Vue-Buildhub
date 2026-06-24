import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';
import AddProjectTypeParams from '../../../core/params/add.project-type.params';
import ProjectTypeAdd from '../ProjectTypeAdd.vue';
const create = vi.fn();
vi.mock('vue-router', () => ({ useRoute: () => ({ fullPath: '/project/add' }) }));
vi.mock('../../controllers/project-type.controller', () => ({
  default: { getInstance: () => ({ create, errorMessage: ref('') }) },
}));
const FormStub = {
  emits: ['updateData'],
  template: '<button class="form" @click="$emit(\'updateData\', params)">form</button>',
  data: () => ({ params: new AddProjectTypeParams({ name: 'Mall', projectType: 4 }) }),
};
describe('ProjectTypeAdd', () => {
  it('creates form data', async () => {
    const wrapper = mount(ProjectTypeAdd, {
      global: { mocks: { $t: (key: string) => key }, stubs: { ProjectTypeForm: FormStub } },
    });
    await wrapper.find('.form').trigger('click');
    await wrapper.find('.btn').trigger('click');
    await flushPromises();
    expect(create).toHaveBeenCalledWith(
      expect.any(AddProjectTypeParams),
      undefined,
      '/project/add',
    );
  });
});
