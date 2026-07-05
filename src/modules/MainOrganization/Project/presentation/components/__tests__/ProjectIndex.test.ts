import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import ProjectIndex from '../ProjectIndex.vue';

const fetchList = vi.fn();
const deleteProject = vi.fn();
const routerPush = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: routerPush }),
}));

vi.mock('../../controllers/project.controller', () => ({
  default: {
    getInstance: () => ({
      listState: { value: {} },
      pagination: { value: { current_page: 1, last_page: 1, per_page: 10, total: 1 } },
      fetchList,
      delete: deleteProject,
    }),
  },
}));

const routerLinkStub = {
  props: ['to'],
  template: '<a :href="to"><slot /></a>',
};

const mountProjectIndex = () =>
  mount(ProjectIndex, {
    global: {
      stubs: {
        RouterLink: routerLinkStub,
        DataStatusBuilder: {
          props: ['controller', 'onRetry'],
          template: '<div><slot name="success" :data="[{ id: 7, title: `Tower` }]" /></div>',
        },
        AppTable: {
          props: ['headers', 'items'],
          template: '<div class="app-table"><slot name="actions" :item="items[0]" /></div>',
        },
        Pagination: {
          emits: ['changePage', 'countPerPage'],
          template: '<button class="change-page" @click="$emit(`changePage`, 2)">next</button>',
        },
        TableSkelaton: true,
        DeleteDialog: {
          emits: ['delete'],
          template:
            '<button class="delete-dialog" @click="$emit(`delete`)"><slot name="btn" /></button>',
        },
      },
    },
  });

describe('ProjectIndex', () => {
  it('renders translated project index actions and fetches the list', async () => {
    const wrapper = mountProjectIndex();
    await nextTick();

    expect(fetchList).toHaveBeenCalled();
    expect(wrapper.text()).toContain('Projects');
    expect(wrapper.text()).toContain('Add Project');
    expect(wrapper.find('button.action-btn.delete').attributes('title')).toBe('Delete');
  });

  it('deletes a project from the row action', async () => {
    const wrapper = mountProjectIndex();

    await wrapper.find('.delete-dialog').trigger('click');

    expect(deleteProject).toHaveBeenCalled();
    expect(deleteProject.mock.calls[0][0].toMap()).toEqual({ projectId: 7 });
  });
});
