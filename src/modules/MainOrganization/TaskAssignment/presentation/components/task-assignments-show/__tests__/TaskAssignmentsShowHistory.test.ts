import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ProjectHistoryModel from '@/modules/MainOrganization/ProjectItem/core/models/project.history.model';
import ProjectItemShowModel from '@/modules/MainOrganization/ProjectItem/core/models/project.Item.show.model';

import { InsideStatusType } from '../../../../core/constants/inside.status.enum';
import TaskAssignmentsShowHistory from '../TaskAssignmentsShowHistory.vue';

describe('TaskAssignmentsShowHistory', () => {
  it('shows status history notes and date from the model prop', () => {
    const wrapper = mount(TaskAssignmentsShowHistory, {
      props: {
        model: new ProjectItemShowModel({
          histories: [
            new ProjectHistoryModel({
              id: 1,
              status: InsideStatusType.WORKING,
              history_employees: [],
              created_at: '2026-07-30',
              notes: 'Work started',
            }),
          ],
        }),
      },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          Accordion: { template: '<div><slot /></div>' },
          AccordionTab: { template: '<div><slot /></div>' },
        },
      },
    });

    expect(wrapper.text()).toContain('Work started');
    expect(wrapper.text()).toContain('2026-07-30');
  });
});
