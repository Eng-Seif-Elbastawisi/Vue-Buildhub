import { mount } from '@vue/test-utils';
import { expect, it } from 'vitest';
import ScheduleStageTable from '../ScheduleStageTable.vue';
import { groupFixture } from '../../controllers/__tests__/fixtures';

it('shows the saved stage hierarchy without adding task rows', () => {
  const wrapper = mount(ScheduleStageTable, {
    props: { stages: groupFixture().stages },
    global: { mocks: { $t: (key: string) => key } },
  });

  expect(wrapper.findAll('tbody tr')).toHaveLength(1);
  expect(wrapper.get('tbody th').text()).toBe('Stage');
  expect(wrapper.get('tbody td').text()).toBe('Child');
});
