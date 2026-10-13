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
import DailyReportFormDialog from '../DailyReportFormDialog.vue';
it('preserves report date/notes after failure and sends no quantity', async () => {
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('store_project_timeline_stage_report')
        ? { status: false, message: 'Rejected' }
        : { status: true, data: [] },
    ),
  );
  const wrapper = mountDialog(DailyReportFormDialog);
  wrapper
    .getComponent(WorkItemStageSelect)
    .vm.$emit('update:modelValue', new TitleInterface({ id: 18, title: 'Electrical' }));
  await wrapper.get('#report-date').setValue('2026-10-12');
  await wrapper.get('#report-notes').setValue('Site safe');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(
    post.mock.calls.find((call) => call[0].url.includes('store_project_timeline_stage_report'))?.[0]
      .data,
  ).toEqual({
    project_timeline_stage_id: 18,
    date: '2026-10-12',
    notes: 'Site safe',
    site_safety_status: 1,
  });
  expect((wrapper.get('#report-notes').element as HTMLTextAreaElement).value).toBe('Site safe');
  expect(wrapper.emitted('update:visible')).toBeUndefined();
  wrapper.unmount();
});
