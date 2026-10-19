import { startedOverview } from '../../../__tests__/timeline-fixtures';
import { beforeEach, expect, it, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import TitleInterface from '@/base/Data/Models/titleInterface';
import WorkItemsController from '../../controllers/work-items.controller';
import ScheduleGroupModel from '../../../../Schedule/core/models/schedule.group.model';
import ProjectTimelineStageModel from '../../../../Schedule/core/models/project.timeline.stage.model';
import ShopDrawingFormDialog from '../ShopDrawingFormDialog.vue';
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
            id: 7,
            quoteStageId: 999,
            title: 'Electrical',
            children: [],
            parentId: null,
          }),
        ],
      }),
    ],
  });
});
it('converts actual file bytes, preserves failed input and refreshes before closing after success', async () => {
  let attempts = 0;
  post.mockImplementation(async (request) =>
    response(
      request.url.includes('fetch_project_timelines')
        ? startedOverview([7])
        : request.url.includes('store_shop_drawing_quote')
          ? ++attempts === 1
            ? { status: false, message: 'Rejected' }
            : { status: true }
          : { status: true, data: [] },
    ),
  );
  const wrapper = mountDialog(ShopDrawingFormDialog);
  await wrapper.get('#drawing-title').setValue('MEP');
  await wrapper.get('#drawing-version').setValue('V1');
  wrapper
    .getComponent(WorkItemStageSelect)
    .vm.$emit('update:modelValue', [
      new TitleInterface({ id: 7, title: 'Main' }),
      new TitleInterface({ id: 7, title: 'Main' }),
    ]);
  const input = wrapper.get('input[type=file]');
  Object.defineProperty(input.element, 'files', {
    value: [new File(['drawing'], 'drawing.pdf', { type: 'application/pdf' })],
    configurable: true,
  });
  await input.trigger('change');
  await vi.waitFor(() => expect(wrapper.html()).toContain('drawing.pdf'));
  await flushPromises();
  expect(wrapper.html()).toContain('drawing.pdf');
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(wrapper.emitted('update:visible')).toBeUndefined();
  expect(wrapper.text()).toContain('Rejected');
  expect((wrapper.get('#drawing-title').element as HTMLInputElement).value).toBe('MEP');
  expect(
    post.mock.calls.find((call) => call[0].url.includes('store_shop_drawing_quote'))?.[0].data,
  ).toEqual({
    quote_id: 140,
    title: 'MEP',
    date: null,
    version_number: 'V1',
    file: 'data:application/pdf;base64,ZHJhd2luZw==',
    project_timeline_stage_ids: [7],
  });
  await wrapper.get('form').trigger('submit');
  await flushPromises();
  expect(wrapper.emitted('update:visible')).toEqual([[false]]);
  expect(post.mock.calls.at(-1)?.[0].url).toContain('fetch_shop_drawing_quotes');
  wrapper.unmount();
});
it('requires title, version and stages while keeping file and date optional', async () => {
  const wrapper = mountDialog(ShopDrawingFormDialog);
  await wrapper.get('form').trigger('submit');
  expect(post.mock.calls.some((call) => call[0].url.includes('store_'))).toBe(false);
  expect(wrapper.findAll('[role="alert"]').length).toBeGreaterThan(0);
  expect(wrapper.get('.upload-label').text()).toBeTruthy();
  expect(wrapper.get('input[type=file]').attributes('required')).toBeUndefined();
  wrapper.unmount();
});

it('removes a selected attachment without resetting other drawing fields', async () => {
  const wrapper = mountDialog(ShopDrawingFormDialog);
  await wrapper.get('#drawing-title').setValue('MEP');
  const input = wrapper.get('input[type=file]');
  Object.defineProperty(input.element, 'files', {
    value: [new File(['drawing'], 'drawing.dwg', { type: 'application/octet-stream' })],
    configurable: true,
  });
  await input.trigger('change');
  await vi.waitFor(() => expect(wrapper.html()).toContain('drawing.dwg'));
  const remove = wrapper
    .findAll('button')
    .find((button) => button.attributes('title') === 'Remove file');
  if (!remove) throw new Error('Missing remove button');
  await remove.trigger('click');
  expect(wrapper.html()).not.toContain('drawing.dwg');
  expect((wrapper.get('#drawing-title').element as HTMLInputElement).value).toBe('MEP');
  wrapper.unmount();
});
