import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import TaskAssignmentCreate from '../TaskAssignmentCreate.vue';

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

describe('TaskAssignmentCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects the legacy create route to approved tasks', async () => {
    const wrapper = mount(TaskAssignmentCreate);

    await nextTick();

    expect(wrapper.find('.task-assignment-create-redirect').exists()).toBe(true);
    expect(mocks.replace).toHaveBeenCalledWith({
      name: 'mainorganization-task-assignment-approved',
    });
  });
});
