import { flushPromises, mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddFinalProjectFloorResultParams from '../../../core/params/final.result.project.floor.params';
import { NotificationType } from '../../../core/constants/notificationType.enum';
import { Status } from '../../../core/constants/status.enum';
import ProjectFloorAdd from '../ProjectFloorAdd.vue';

const mocks = vi.hoisted(() => ({
  fetchList: vi.fn(),
  create: vi.fn(),
  getProject: vi.fn(),
  push: vi.fn(),
  routeQuery: {
    project_id: '24',
    project_preview_id: '15',
  } as Record<string, string | string[] | undefined>,
  routeFullPath: '/organization/project_floor/add?project_id=24&project_preview_id=15',
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: mocks.routeQuery,
    fullPath: mocks.routeFullPath,
  }),
}));

vi.mock('vue-i18n', () => ({
  createI18n: () => ({
    global: {
      t: (key: string) => key,
    },
  }),
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/router/index', () => ({
  default: {
    push: mocks.push,
  },
}));

vi.mock('@/router', () => ({
  default: {
    push: mocks.push,
  },
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    user: {
      type: 2,
    },
  }),
}));

vi.mock('../../controllers/project.floor.controller', () => ({
  default: {
    getInstance: () => ({
      listState: {
        value: {
          data: [
            {
              id: 9,
              floor_number: 1,
              spaces: [],
            },
          ],
        },
      },
      errorMessage: {
        value: null,
      },
      fetchList: mocks.fetchList,
      create: mocks.create,
      getProject: mocks.getProject,
    }),
  },
}));

describe('ProjectFloorAdd.vue', () => {
  beforeEach(() => {
    mocks.routeQuery = {
      project_id: '24',
      project_preview_id: '15',
    };
    mocks.routeFullPath = '/organization/project_floor/add?project_id=24&project_preview_id=15';
    mocks.fetchList.mockResolvedValue(undefined);
    mocks.create.mockResolvedValue(undefined);
    mocks.getProject.mockResolvedValue(undefined);
    mocks.push.mockResolvedValue(undefined);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(ProjectFloorAdd).toBeDefined();
  });

  it('submits final result params without converting them to a plain object', async () => {
    const finalParams = new AddFinalProjectFloorResultParams({
      project_preview_id: 15,
      status: Status.READY_FOR_PRICING,
      pricing_responsible_id: 7,
      notification_type: NotificationType.URGENT,
      notification_message: 'Ready for pricing',
    });

    const wrapper = mount(ProjectFloorAdd, {
      global: {
        stubs: {
          ProjectSteps: {
            template: '<div />',
          },
          ProjectFloorForm: {
            template: '<div />',
          },
          FinalResults: {
            emits: ['submitFinalResult'],
            props: ['projectId', 'projectPreviewId', 'loading'],
            template:
              '<button data-test="submit-final-result" type="button" @click="$emit(\'submitFinalResult\', finalParams)">submit</button>',
            setup() {
              return {
                finalParams,
              };
            },
          },
        },
      },
    });

    await wrapper.find('[data-test="submit-final-result"]').trigger('click');
    await flushPromises();

    expect(mocks.getProject).toHaveBeenCalledWith(finalParams);
    expect(mocks.getProject.mock.calls[0][0]).toBeInstanceOf(AddFinalProjectFloorResultParams);
    expect(mocks.push).toHaveBeenCalledWith({
      path: '/organization/project-item/add',
      query: {
        project_id: 24,
        project_item: 9,
      },
    });
  });

  it('supports direct entry with only project_id and does not render preview-only final results', async () => {
    mocks.routeQuery = { project_id: ['24'] };
    mocks.routeFullPath = '/organization/project_floor/add?project_id=24';

    const wrapper = mount(ProjectFloorAdd, {
      global: {
        stubs: {
          ProjectSteps: {
            template: '<div />',
          },
          ProjectFloorForm: {
            name: 'ProjectFloorForm',
            props: ['projectId', 'projectPreviewId'],
            template: '<div />',
          },
          FinalResults: {
            name: 'FinalResults',
            template: '<div />',
          },
        },
      },
    });
    await flushPromises();

    const form = wrapper.findComponent({ name: 'ProjectFloorForm' });

    expect(form.props('projectId')).toBe(24);
    expect(form.props('projectPreviewId')).toBeUndefined();
    expect(wrapper.findComponent({ name: 'FinalResults' }).exists()).toBe(false);
    expect(mocks.fetchList).toHaveBeenCalledWith(expect.objectContaining({ projectId: 24 }));
  });
});
