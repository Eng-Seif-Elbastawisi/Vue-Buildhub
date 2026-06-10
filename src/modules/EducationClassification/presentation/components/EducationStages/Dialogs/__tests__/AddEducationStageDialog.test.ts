import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AddEducationStageDialog from '../AddEducationStageDialog.vue';

const globalConfig = {
  stubs: {
    Dialog: {
      template: '<div v-if="visible"><slot></slot></div>',
      props: ['visible'],
    },
  },
};

describe('AddEducationStageDialog.vue', () => {
  it('renders the open button', () => {
    const wrapper = mount(AddEducationStageDialog, { global: globalConfig });
    expect(wrapper.find('button').text()).toBe('Add Education Type');
  });

  it('shows dialog when button is clicked', async () => {
    const wrapper = mount(AddEducationStageDialog, { global: globalConfig });
    await wrapper.find('button').trigger('click');
    // Since we use ref for visibility, we can't easily check the Dialog stub's prop
    // unless we check the wrapper's internal state or use a more complex stub.
    // However, we can check if the internal 'visible' ref would have changed
    // by checking if the Dialog (v-if="visible") is rendered in the stub.
    expect(wrapper.find('input#title').exists()).toBe(true);
  });

  it('emits update:data with correct payload when saved', async () => {
    const wrapper = mount(AddEducationStageDialog, {
      props: {
        ClassificationId: 5,
        parent_id: 10,
      },
      global: globalConfig,
    });

    // Open dialog
    await wrapper.find('button').trigger('click');

    // Set title
    const input = wrapper.find('input#title');
    await input.setValue('New Stage');

    // Click save
    const saveBtn = wrapper.findAll('button').find((b) => b.text() === 'save');
    await saveBtn?.trigger('click');

    expect(wrapper.emitted('update:data')).toBeTruthy();
    expect(wrapper.emitted('update:data')![0]).toEqual([
      {
        title: 'New Stage',
        classification_id: 5,
        parent_id: 10,
      },
    ]);
  });
});
