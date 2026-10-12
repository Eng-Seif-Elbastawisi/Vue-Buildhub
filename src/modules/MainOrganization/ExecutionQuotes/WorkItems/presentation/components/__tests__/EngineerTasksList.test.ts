import { expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import EngineerTasksList from '../EngineerTasksList.vue';
import WorkTaskModel from '../../../core/models/task.model';
it('renders distinct creator and assignee inside an initially expanded task accordion', () => {
  const task = WorkTaskModel.fromJson({
    id: 1,
    project_timeline_stage_id: 18,
    title: 'Electrical',
    employee: { id: 1, name: 'Creator', type: 1 },
    assigned_employee: { id: 7, name: 'Assignee', type: 2 },
    end_date: null,
    created_at: null,
  });
  const wrapper = mount(EngineerTasksList, {
    props: { state: new DataSuccess({ data: [task] }), stageLabel: (id) => `Stage ${id}` },
    global: { mocks: { $t: (key: string) => key } },
  });
  expect(wrapper.get('details').attributes('open')).toBeDefined();
  expect(wrapper.get('h3').text()).toBe('Electrical');
  expect(wrapper.text()).toContain('Stage 18');
  expect(wrapper.text()).toContain('Creator');
  expect(wrapper.text()).toContain('Assignee');
  expect(wrapper.text()).toContain('work_items.no_date');
  wrapper.unmount();
});
