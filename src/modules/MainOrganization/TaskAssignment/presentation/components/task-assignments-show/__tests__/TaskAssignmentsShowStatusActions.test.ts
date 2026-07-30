import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import TaskAssignmentsShowStatusActions from '../TaskAssignmentsShowStatusActions.vue';

describe('TaskAssignmentsShowStatusActions', () => {
  it('emits action and dialog form updates from user interactions', async () => {
    const wrapper = mount(TaskAssignmentsShowStatusActions, {
      props: {
        model: {
          activeAction: 'HOLD',
          confirmationMessage: 'Confirm hold',
          loading: false,
          notes: 'Initial note',
          showFinish: false,
          showHold: true,
          showStart: false,
          title: 'Hold task',
          visible: true,
        },
      },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          Dialog: {
            props: ['visible', 'header'],
            template: '<div v-if="visible"><slot /><slot name="footer" /></div>',
          },
          HandleFilesUpload: true,
        },
      },
    });

    await wrapper.get('.task-action-btn--hold').trigger('click');
    await wrapper.get('#task_action_notes').setValue('Waiting for review');
    await wrapper.get('.modal-buttons-footer .btn-primary').trigger('click');

    expect(wrapper.emitted('open')).toEqual([['HOLD']]);
    expect(wrapper.emitted('update:notes')).toEqual([['Waiting for review']]);
    expect(wrapper.emitted('confirm')).toHaveLength(1);
  });
});
