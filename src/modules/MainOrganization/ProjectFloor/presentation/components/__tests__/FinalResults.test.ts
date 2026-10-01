import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Status } from '../../../core/constants/status.enum';
import AddFinalProjectFloorResultParams from '../../../core/params/final.result.project.floor.params';
import FinalResults from '../FinalResults.vue';

const mocks = vi.hoisted(() => ({
  fetchList: vi.fn(),
  push: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock('vue-i18n', () => ({
  createI18n: () => ({
    global: {
      t: (key: string) => key,
    },
  }),
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock('@/modules/MainOrganization/employee/presentation/controllers/employee.controller', () => ({
  default: {
    getInstance: () => ({
      listState: { value: { data: [] } },
      fetchList: mocks.fetchList,
    }),
  },
}));

describe('FinalResults.vue', () => {
  beforeEach(() => {
    mocks.fetchList.mockResolvedValue(undefined);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(FinalResults).toBeDefined();
  });

  it('submits status-only params when the user selects not ready for completion', async () => {
    const wrapper = mount(FinalResults, {
      props: {
        projectId: 24,
        projectPreviewId: 15,
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          Dialog: true,
          FieldHelpIcon: true,
          UpdatedCustomInputSelect: true,
        },
      },
    });

    const notReadyButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('ProjectFloor.not_ready_for_completion'));

    expect(notReadyButton).toBeDefined();
    await notReadyButton?.trigger('click');
    await flushPromises();

    const submission = wrapper.emitted('submitFinalResult')?.[0]?.[0];

    expect(submission).toBeInstanceOf(AddFinalProjectFloorResultParams);
    expect((submission as AddFinalProjectFloorResultParams).toMap()).toEqual({
      project_preview_id: 15,
      status: Status.NOT_READY_FOR_COMPLETION,
    });
  });
});
