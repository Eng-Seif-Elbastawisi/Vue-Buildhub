import { beforeEach, expect, it } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import WorkItemsController from '../../controllers/work-items.controller';
import ScheduleGroupModel from '../../../../Schedule/core/models/schedule.group.model';
import ProjectTimelineStageModel from '../../../../Schedule/core/models/project.timeline.stage.model';
import WorkItemStageSelect from '../WorkItemStageSelect.vue';
import { mountDialog } from '../../../../SiteTeam/presentation/components/__tests__/harness';
import { mockNetwork } from '../../../../SiteTeam/__tests__/network';
const controller = WorkItemsController.getInstance();
beforeEach(() => {
  mockNetwork();
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
it('offers timeline stage ID with label rather than QuoteStage or master ID', () => {
  const wrapper = mountDialog(WorkItemStageSelect, { id: 'stage', modelValue: null });
  expect(wrapper.get('[role="combobox"]').attributes('aria-label')).toBe('Project Timeline Stage');
  expect(controller.stages.value.map((stage) => stage.id)).toEqual([18]);
  expect(controller.stages.value[0]?.title).toBe('Main · Electrical');
  wrapper.unmount();
});

it('drawing multi-selection excludes children and stages without verified parent information', () => {
  controller.stagesState.value = new DataSuccess({
    data: [
      new ScheduleGroupModel({
        id: 2,
        title: 'Main',
        duration: 1,
        durationType: 4,
        stages: [
          new ProjectTimelineStageModel({
            id: 7,
            quoteStageId: 999,
            title: 'Eligible',
            children: [],
            parentId: null,
          }),
          new ProjectTimelineStageModel({
            id: 8,
            quoteStageId: 998,
            title: 'Child',
            children: [],
            parentId: 7,
          }),
          new ProjectTimelineStageModel({
            id: 9,
            quoteStageId: 997,
            title: 'Unverified',
            children: [],
          }),
        ],
      }),
    ],
  });
  const wrapper = mountDialog(WorkItemStageSelect, {
    id: 'drawing-stage',
    modelValue: [],
    mainOnly: true,
    multiple: true,
  });
  expect(controller.drawingStages.value.map((stage) => stage.id)).toEqual([7]);
  expect(wrapper.get('[role="combobox"]').attributes('aria-label')).toBe('Main Timeline Stages');
  wrapper.unmount();
});
