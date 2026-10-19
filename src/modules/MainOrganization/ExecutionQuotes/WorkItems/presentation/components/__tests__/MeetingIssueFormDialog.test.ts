import { startedOverview } from '../../../__tests__/timeline-fixtures';
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
        workStatus: 1,
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
import MeetingIssueFormDialog from '../MeetingIssueFormDialog.vue';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
it('switches relevant fields and omits meeting date from issue request', async () => {
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_project_timelines')
        ? startedOverview([18])
        : request.url.includes('store_project_timeline_stage_meeting')
          ? { status: false, message: 'Rejected' }
          : { status: true, data: [] },
    ),
  );
  const wrapper = mountDialog(MeetingIssueFormDialog, { initialType: 1 });
  expect(wrapper.find('#activity-date').exists()).toBe(true);
  expect(wrapper.find('#activity-description').exists()).toBe(true);
  expect(wrapper.find('#meeting-result').exists()).toBe(true);
  expect(wrapper.find('#meeting-attendees').exists()).toBe(true);
  const type = wrapper
    .findAllComponents(UpdatedCustomInputSelect)
    .find((select) => select.props('id') === 'activity-type');
  if (!type) throw new Error('Missing activity type select');
  type.vm.$emit('update:modelValue', new TitleInterface({ id: 3, title: 'Risk' }));
  await flushPromises();
  expect(wrapper.find('#activity-date').exists()).toBe(false);
  expect(wrapper.find('#activity-description').exists()).toBe(true);
  wrapper
    .getComponent(WorkItemStageSelect)
    .vm.$emit('update:modelValue', new TitleInterface({ id: 18, title: 'Electrical' }));
  await wrapper.get('#activity-title').setValue('Supply risk');
  await wrapper.get('#activity-description').setValue('Late delivery');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(
    post.mock.calls.find((call) =>
      call[0].url.includes('store_project_timeline_stage_meeting'),
    )?.[0].data,
  ).toEqual({
    project_timeline_stage_id: 18,
    type: 3,
    title: 'Supply risk',
    description: 'Late delivery',
    employee_id: null,
  });
  expect(wrapper.emitted('update:visible')).toBeUndefined();
  expect((wrapper.get('#activity-description').element as HTMLTextAreaElement).value).toBe(
    'Late delivery',
  );
  wrapper.unmount();
});

it('submits Meeting audience, result and numeric attendees separately from assignment and preserves a rejected draft', async () => {
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_project_timelines')
        ? startedOverview()
        : { status: false, message: 'Rejected' },
    ),
  );
  const wrapper = mountDialog(MeetingIssueFormDialog, { initialType: 1 });
  wrapper
    .getComponent(WorkItemStageSelect)
    .vm.$emit('update:modelValue', new TitleInterface({ id: 18, title: 'Electrical' }));
  await wrapper.get('#activity-title').setValue('Weekly');
  await wrapper.get('#activity-date').setValue('2026-10-15');
  await wrapper.get('#activity-description').setValue('Progress');
  await wrapper.get('#meeting-result').setValue('Agreed');
  const audience = wrapper
    .findAllComponents(UpdatedCustomInputSelect)
    .find((select) => select.props('id') === 'meeting-audience');
  const attendees = wrapper
    .findAllComponents(UpdatedCustomInputSelect)
    .find((select) => select.props('id') === 'meeting-attendees');
  if (!audience || !attendees) throw new Error('Missing meeting fields');
  audience.vm.$emit('update:modelValue', new TitleInterface({ id: 2, title: 'With Client' }));
  attendees.vm.$emit('update:modelValue', [
    new TitleInterface({ id: 7, title: 'First' }),
    new TitleInterface({ id: 8, title: 'Second' }),
  ]);
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  const store = post.mock.calls.find((call) =>
    call[0].url.includes('store_project_timeline_stage_meeting'),
  );
  expect(store?.[0].data).toEqual({
    project_timeline_stage_id: 18,
    type: 1,
    title: 'Weekly',
    date: '2026-10-15',
    description: 'Progress',
    meeting_audience_type: 2,
    result: 'Agreed',
    attendees: [7, 8],
  });
  expect(wrapper.emitted('update:visible')).toBeUndefined();
  expect((wrapper.get('#meeting-result').element as HTMLTextAreaElement).value).toBe('Agreed');
  expect(attendees.props('modelValue')).toHaveLength(2);
  wrapper.unmount();
});
