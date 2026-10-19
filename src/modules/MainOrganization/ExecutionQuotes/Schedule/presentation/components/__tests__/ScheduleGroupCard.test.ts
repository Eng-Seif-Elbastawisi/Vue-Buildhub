import { mount } from '@vue/test-utils';
import { expect, it } from 'vitest';
import ScheduleGroupCard from '../ScheduleGroupCard.vue';
import { groupFixture } from '../../controllers/__tests__/fixtures';
import ScheduleGroupModel from '../../../core/models/schedule.group.model';
it('keeps all group actions available while its stage details are collapsed', async () => {
  const wrapper = mount(ScheduleGroupCard, {
    props: {
      group: groupFixture(),
      sequence: 1,
      basePath: '/mainportal/execution-quotes/show/101/schedule',
      busy: false,
      earlier: false,
      later: false,
    },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: { RouterLink: { template: '<a><slot /></a>' } },
    },
  });
  expect(wrapper.text()).toContain('6 task_assignment.duration_types.day');
  expect(wrapper.text()).toContain('schedule.not_available');
  expect(wrapper.get('.schedule__stage-title').text()).toBe('Stage');
  await wrapper.get('summary').trigger('click');
  expect(wrapper.get('details').element.open).toBe(false);
  expect(wrapper.findAll('.schedule__actions a')).toHaveLength(2);
  expect(wrapper.findAll('.schedule__actions button')).toHaveLength(5);
  expect(
    wrapper
      .findAll('button')
      .find((button) => button.text() === 'schedule.manage_work')
      ?.attributes('disabled'),
  ).toBeDefined();
  for (const action of ['schedule.earlier', 'schedule.later'])
    expect(
      wrapper
        .findAll('button')
        .find((button) => button.text() === action)
        ?.attributes('disabled'),
    ).toBeDefined();
  wrapper.unmount();
});
it('shows a null work status as Not Started and keeps status and history actions separate', async () => {
  const wrapper = mount(ScheduleGroupCard, {
    props: {
      group: new ScheduleGroupModel({ ...groupFixture(), workStatus: null }),
      sequence: 1,
      basePath: '/schedule/101',
      busy: false,
      earlier: false,
      later: false,
      timelineApproved: true,
    },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: { RouterLink: { template: '<a><slot /></a>' } },
    },
  });
  expect(wrapper.get('.schedule__work-badge').text()).toBe('schedule.work_unstarted');
  const manage = wrapper
    .findAll('button')
    .find((button) => button.text() === 'schedule.manage_work');
  await manage?.trigger('click');
  expect(wrapper.emitted('manageWork')).toHaveLength(1);
  const history = wrapper
    .findAll('button')
    .find((button) => button.text() === 'schedule.view_work_history');
  await history?.trigger('click');
  expect(wrapper.emitted('viewHistory')).toHaveLength(1);
  wrapper.unmount();
});
