import { mount } from '@vue/test-utils';
import { expect, it } from 'vitest';
import ScheduleStageTable from '../ScheduleStageTable.vue';
import ProjectTimelineStageModel from '../../../core/models/project.timeline.stage.model';
import { groupFixture } from '../../controllers/__tests__/fixtures';

it('shows the saved stage hierarchy without adding task rows', () => {
  const wrapper = mount(ScheduleStageTable, {
    props: { stages: groupFixture().stages },
    global: { mocks: { $t: (key: string) => key } },
  });

  expect(wrapper.find('table').exists()).toBe(false);
  expect(wrapper.findAll('.schedule__stage-list > li')).toHaveLength(1);
  expect(wrapper.get('.schedule__stage-title').text()).toBe('Stage');
  expect(wrapper.get('.schedule__stage-item > ul > li').text()).toBe('Child');
});

it('keeps stages without substages visible with the unavailable message', () => {
  const wrapper = mount(ScheduleStageTable, {
    props: {
      stages: [new ProjectTimelineStageModel({ ...groupFixture().stages[0], children: [] })],
    },
    global: { mocks: { $t: (key: string) => key } },
  });
  expect(wrapper.get('.schedule__stage-title').text()).toBe('Stage');
  expect(wrapper.get('.schedule__stage-fallback').text()).toBe('schedule.not_available');
  expect(wrapper.find('.schedule__substage-list').exists()).toBe(false);
});
