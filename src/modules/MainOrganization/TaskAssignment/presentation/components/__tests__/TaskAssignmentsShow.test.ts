import { mount } from '@vue/test-utils';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type * as VueRouter from 'vue-router';
import TaskAssignmentsShow from '../TaskAssignmentsShow.vue';
import ProjectItemController from '@/modules/MainOrganization/ProjectItem/presentation/controllers/project.Item.controller';
import TaskAssignmentController from '../../controllers/task.assignment.controller';
import { DataSuccess, type DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof VueRouter>();
  return {
    ...actual,
    useRoute: () => ({
      params: { id: '39' },
    }),
  };
});

describe('TaskAssignmentsShow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders project item details and handles status action workflow', async () => {
    const mockItemData = {
      id: 39,
      price: 1500,
      quantity: 2,
      pricing_method: 'GENERAL_ITEM',
      project_floor_id: 1,
      item_id: { id: 5, title: 'Test Project Item' },
    };

    const projectItemCtrl = ProjectItemController.getInstance();
    vi.spyOn(projectItemCtrl, 'fetchOne').mockImplementation(async () => {
      projectItemCtrl.itemState.value = new DataSuccess({ data: mockItemData as never }) as DataState<never>;
      return projectItemCtrl.itemState.value;
    });
    vi.spyOn(projectItemCtrl, 'isItemLoading').mockReturnValue(false);
    projectItemCtrl.itemState.value = new DataSuccess({ data: mockItemData as never }) as DataState<never>;

    const taskAssignmentCtrl = TaskAssignmentController.getInstance();
    const setStatusSpy = vi.spyOn(taskAssignmentCtrl, 'setTaskEmployeeStatus').mockResolvedValue(
      new DataSuccess<void>({ message: 'Status updated' }),
    );

    const wrapper = mount(TaskAssignmentsShow, {
      global: {
        stubs: {
          RouterLink: true,
          Dialog: {
            props: ['visible', 'header'],
            emits: ['update:visible', 'hide'],
            template: `
              <div v-if="visible" class="p-dialog-stub">
                <h2>{{ header }}</h2>
                <slot />
                <slot name="footer" />
              </div>
            `,
          },
        },
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    expect(projectItemCtrl.fetchOne).toHaveBeenCalled();
    expect(wrapper.text()).toContain('Test Project Item');

    // Initially Start button should be visible
    const startBtn = wrapper.find('.task-action-btn--start');
    expect(startBtn.exists()).toBe(true);

    // Click Start to open modal
    await startBtn.trigger('click');
    expect(wrapper.find('.p-dialog-stub').exists()).toBe(true);

    // Confirm Start action
    const confirmBtn = wrapper.find('.modal-buttons-footer .btn-primary');
    await confirmBtn.trigger('click');

    expect(setStatusSpy).toHaveBeenCalled();
  });
});
