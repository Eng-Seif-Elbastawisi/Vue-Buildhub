import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import TitleInterface from '@/base/Data/Models/titleInterface';
import ProjectItemShowModel from '@/modules/MainOrganization/ProjectItem/core/models/project.Item.show.model';

import { TaskDurationType } from '../../../../core/constants/taskDurationType.enum';
import TaskAssignmentsShowDetails from '../TaskAssignmentsShowDetails.vue';

describe('TaskAssignmentsShowDetails', () => {
  it('shows task details from the model prop', () => {
    const wrapper = mount(TaskAssignmentsShowDetails, {
      props: {
        model: new ProjectItemShowModel({
          item_id: new TitleInterface({ id: 5, title: 'Design task' }),
          department: 'Architecture',
          duration: 3,
          duration_type: TaskDurationType.WEEK,
          has_attached: true,
          is_assign_employee: true,
        }),
      },
      global: {
        mocks: { $t: (key: string) => key },
      },
    });

    expect(wrapper.text()).toContain('Design task');
    expect(wrapper.text()).toContain('Architecture');
    expect(wrapper.text()).toContain('week');
  });
});
