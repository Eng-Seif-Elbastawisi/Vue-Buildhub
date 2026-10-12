import { expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import WorkActivitiesList from '../WorkActivitiesList.vue';
import WorkActivityModel from '../../../core/models/activity.model';
it('keeps the selected activity filter when the accordion is collapsed and reopened', async () => {
  const activities = [1, 2, 3, 4].map((type) =>
    WorkActivityModel.fromJson({
      id: type,
      project_timeline_stage_id: 18,
      type,
      title: `Record ${type}`,
      employee: { id: 1, name: 'Creator', type: 1 },
      assigned_employee: null,
      date: type === 1 ? '2026-10-15' : null,
      description: type === 1 ? null : 'Description',
      created_at: null,
    }),
  );
  const wrapper = mount(WorkActivitiesList, {
    props: { state: new DataSuccess({ data: activities }), stageLabel: (id) => `Stage ${id}` },
    global: { mocks: { $t: (key: string) => key } },
  });
  await wrapper.findAll('.work-items-filters button')[3]?.trigger('click');
  expect(wrapper.get('h3').text()).toBe('Record 3');
  expect(wrapper.get('.work-items-section-count').text()).toBe('4');
  await wrapper.get('summary').trigger('click');
  expect(wrapper.get('details').attributes('open')).toBeUndefined();
  await wrapper.get('summary').trigger('click');
  expect(wrapper.get('details').attributes('open')).toBeDefined();
  expect(wrapper.get('h3').text()).toBe('Record 3');
  expect(wrapper.findAll('.work-items-filters button')[3]?.attributes('aria-pressed')).toBe('true');
  wrapper.unmount();
});
