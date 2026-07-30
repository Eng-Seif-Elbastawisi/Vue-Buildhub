import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ProjectItemShowModel from '@/modules/MainOrganization/ProjectItem/core/models/project.Item.show.model';

import TaskAssignmentsShowHeader from '../TaskAssignmentsShowHeader.vue';

describe('TaskAssignmentsShowHeader', () => {
  it('shows the task id and current status from props', () => {
    const wrapper = mount(TaskAssignmentsShowHeader, {
      props: {
        model: new ProjectItemShowModel({ id: 39 }),
        itemId: '39',
        statusLabel: 'Working',
        statusMeta: {
          className: 'task-status-chip--working',
          icon: 'pi pi-cog',
        },
      },
      global: {
        mocks: { $t: (key: string) => key },
      },
    });

    expect(wrapper.text()).toContain('#39');
    expect(wrapper.text()).toContain('Working');
    expect(wrapper.find('.task-status-chip--working').exists()).toBe(true);
  });
});
