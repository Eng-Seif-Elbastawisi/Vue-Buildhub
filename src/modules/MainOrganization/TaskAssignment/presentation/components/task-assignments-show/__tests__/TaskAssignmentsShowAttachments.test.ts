import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ProjectAttachmentModel from '@/modules/MainOrganization/Project/core/models/project.show.attachment';
import ProjectItemShowModel from '@/modules/MainOrganization/ProjectItem/core/models/project.Item.show.model';

import TaskAssignmentsShowAttachments from '../TaskAssignmentsShowAttachments.vue';

describe('TaskAssignmentsShowAttachments', () => {
  it('shows attachment previews from the model prop', () => {
    const wrapper = mount(TaskAssignmentsShowAttachments, {
      props: {
        model: new ProjectItemShowModel({
          attachments: [
            new ProjectAttachmentModel({
              id: 1,
              file: '/documents/brief.png',
              alt: 'Project brief',
            }),
          ],
        }),
      },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          Image: {
            props: ['src', 'alt'],
            template: '<img :src="src" :alt="alt" />',
          },
        },
      },
    });

    const attachment = wrapper.get('img');

    expect(attachment.attributes('src')).toBe('/documents/brief.png');
    expect(attachment.attributes('alt')).toBe('Project brief');
  });
});
