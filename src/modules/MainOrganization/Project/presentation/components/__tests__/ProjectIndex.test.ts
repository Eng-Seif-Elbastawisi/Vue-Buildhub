import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { ConvertStatus } from '@/modules/MainOrganization/Project/core/constants/convert.status.enum';
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

const globalOptions = {
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
};

const mountProjectIndex = (props = {}) =>
  mount(ProjectIndex, {
    props,
    global: globalOptions,
  });

describe('ProjectIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders translated project index actions and fetches the list', async () => {
    const wrapper = mountProjectIndex();
    await nextTick();

    expect(fetchList).toHaveBeenCalled();
    expect(fetchList.mock.calls[0][0].toMap()).toMatchObject({
      status: [ConvertStatus.PENDING],
    });
    expect(wrapper.text()).toContain('Requests');
    expect(wrapper.text()).toContain('Add Project');
    expect(wrapper.find('button.action-btn.delete').attributes('title')).toBe('Delete');
  });

  it('fetches projects with the provided status filters', async () => {
    mountProjectIndex({
      statuses: [
        ConvertStatus.CONVERT_TO_PROJECT,
        ConvertStatus.SEND_TO_CLIENT,
        ConvertStatus.REVISE_VERSION,
      ],
    });
    await nextTick();

    expect(fetchList.mock.calls.at(-1)?.[0].toMap()).toMatchObject({
      status: [
        ConvertStatus.CONVERT_TO_PROJECT,
        ConvertStatus.SEND_TO_CLIENT,
        ConvertStatus.REVISE_VERSION,
      ],
    });
  });

  it('deletes a project from the row action', async () => {
    const wrapper = mountProjectIndex();

    await wrapper.find('.delete-dialog').trigger('click');

    expect(deleteProject).toHaveBeenCalled();
    expect(deleteProject.mock.calls[0][0].toMap()).toEqual({ projectId: 7 });
  });
});
