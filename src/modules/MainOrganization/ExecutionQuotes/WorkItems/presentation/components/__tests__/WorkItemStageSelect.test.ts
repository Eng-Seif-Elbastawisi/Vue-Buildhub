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
