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
import DailyReportFormDialog from '../DailyReportFormDialog.vue';
it('preserves report date/notes after failure and sends no quantity', async () => {
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_project_timelines')
        ? startedOverview([18])
        : request.url.includes('store_project_timeline_stage_report')
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
    report_scope_type: 1,
    attachments: [],
  });
  expect((wrapper.get('#report-notes').element as HTMLTextAreaElement).value).toBe('Site safe');
  expect(wrapper.emitted('update:visible')).toBeUndefined();
  wrapper.unmount();
});

import { vi } from 'vitest';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
it('preserves a specific-space report and multiple files after rejection, then clears only the space for whole-project scope', async () => {
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('show_quote')
        ? { status: true, data: { id: 140, project: { id: 86, title: 'Project' } } }
        : request.url.includes('fetch_project_floors')
          ? {
              status: true,
              data: [
                {
                  id: 23,
                  project: { id: 86 },
                  spaces: [{ id: 171, space: { id: 9, title: 'Living room' }, attachments: [] }],
                },
              ],
            }
          : request.url.includes('fetch_project_timelines')
            ? startedOverview()
            : { status: false, message: 'Rejected' },
    ),
  );
  const wrapper = mountDialog(DailyReportFormDialog);
  await flushPromises();
  wrapper
    .getComponent(WorkItemStageSelect)
    .vm.$emit('update:modelValue', new TitleInterface({ id: 18, title: 'Electrical' }));
  await wrapper.get('#report-date').setValue('2026-10-12');
  const scope = wrapper
    .findAllComponents(UpdatedCustomInputSelect)
    .find((select) => select.props('id') === 'report-scope');
  if (!scope) throw new Error('Missing report scope');
  scope.vm.$emit('update:modelValue', new TitleInterface({ id: 2, title: 'Specific Space' }));
  await flushPromises();
  const space = wrapper
    .findAllComponents(UpdatedCustomInputSelect)
    .find((select) => select.props('id') === 'report-space');
  if (!space) throw new Error('Missing report space');
  space.vm.$emit('update:modelValue', new TitleInterface({ id: 171, title: 'Living room' }));
  const upload = wrapper.get('input[type=file]');
  expect(upload.attributes('multiple')).toBeDefined();
  Object.defineProperty(upload.element, 'files', {
    value: [
      new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'b.jpg', { type: 'image/jpeg' }),
    ],
    configurable: true,
  });
  await upload.trigger('change');
  await vi.waitFor(() => expect(wrapper.findAll('.preview-item')).toHaveLength(2));
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  const stores = () =>
    post.mock.calls.filter((call) => call[0].url.includes('store_project_timeline_stage_report'));
  expect(stores()[0]?.[0].data).toMatchObject({
    report_scope_type: 2,
    project_floor_space_id: 171,
    attachments: [{ file: 'data:image/jpeg;base64,YQ==' }, { file: 'data:image/jpeg;base64,Yg==' }],
  });
  expect(wrapper.emitted('update:visible')).toBeUndefined();
  expect(space.props('modelValue')).toMatchObject({ id: 171 });
  expect(wrapper.findAll('.preview-item')).toHaveLength(2);
  expect((wrapper.get('#report-date').element as HTMLInputElement).value).toBe('2026-10-12');
  scope.vm.$emit('update:modelValue', new TitleInterface({ id: 1, title: 'Entire Project' }));
  await flushPromises();
  expect(wrapper.find('#report-space').exists()).toBe(false);
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(stores()[1]?.[0].data).not.toHaveProperty('project_floor_space_id');
  expect(stores()[1]?.[0].data.attachments).toHaveLength(2);
  wrapper.unmount();
});
