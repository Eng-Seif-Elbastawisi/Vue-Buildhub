import { beforeEach, expect, it } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import TitleInterface from '@/base/Data/Models/titleInterface';
import WorkItemsController from '../../controllers/work-items.controller';
import ScheduleGroupModel from '../../../../Schedule/core/models/schedule.group.model';
import ProjectTimelineStageModel from '../../../../Schedule/core/models/project.timeline.stage.model';
import WorkItemStageSelect from '../WorkItemStageSelect.vue';
import { mountDialog } from '../../../../SiteTeam/presentation/components/__tests__/harness';
import { mockNetwork, response } from '../../../../SiteTeam/__tests__/network';
const controller = WorkItemsController.getInstance();
let post: ReturnType<typeof mockNetwork>;
beforeEach(() => {
  post = mockNetwork();
  controller.activate(140);
  controller.stagesState.value = new DataSuccess({
    data: [
      new ScheduleGroupModel({
        id: 2,
        title: 'Main',
        duration: 1,
        durationType: 4,
        stages: [
          new ProjectTimelineStageModel({
            id: 18,
            quoteStageId: 999,
            title: 'Electrical',
            children: [],
          }),
        ],
      }),
    ],
  });
});
import TaskFormDialog from '../TaskFormDialog.vue';
it('preserves task inputs on rejection and closes only after successful retry', async () => {
  let attempts = 0;
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('store_project_timeline_stage_task')
        ? ++attempts === 1
          ? { status: false, message: 'Rejected' }
          : { status: true }
        : { status: true, data: [] },
    ),
  );
  const wrapper = mountDialog(TaskFormDialog);
  wrapper
    .getComponent(WorkItemStageSelect)
    .vm.$emit('update:modelValue', new TitleInterface({ id: 18, title: 'Electrical' }));
  await wrapper.get('#task-title').setValue('Complete electrical');
  await wrapper.get('#task-endDate').setValue('2026-10-20');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(wrapper.emitted('update:visible')).toBeUndefined();
  expect((wrapper.get('#task-title').element as HTMLInputElement).value).toBe(
    'Complete electrical',
  );
  expect(wrapper.text()).toContain('Rejected');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(
    post.mock.calls.find((call) => call[0].url.includes('store_project_timeline_stage_task'))?.[0]
      .data,
  ).toMatchObject({
    project_timeline_stage_id: 18,
    title: 'Complete electrical',
    employee_id: null,
    end_date: '2026-10-20',
  });
  expect(wrapper.emitted('update:visible')).toEqual([[false]]);
  expect(wrapper.get('label[for="task-title"]').text()).toBeTruthy();
  wrapper.unmount();
});
it('shows stage validation without submitting', async () => {
  post.mockResolvedValue(response({ status: true, data: [] }));
  const wrapper = mountDialog(TaskFormDialog);
  await wrapper.get('#task-title').setValue('Task');
  await wrapper.get('form').trigger('submit');
  expect(wrapper.find('[role="alert"]').exists()).toBe(true);
  expect(
    post.mock.calls.some((call) => call[0].url.includes('store_project_timeline_stage_task')),
  ).toBe(false);
  wrapper.unmount();
});
