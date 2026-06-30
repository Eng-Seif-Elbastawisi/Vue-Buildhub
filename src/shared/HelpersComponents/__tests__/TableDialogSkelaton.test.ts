import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TableDialogSkelaton from '../TableDialogSkelaton.vue';

describe('TableDialogSkelaton.vue', () => {
  it('renders the default number of skeleton rows', () => {
    const wrapper = mount(TableDialogSkelaton);

    expect(wrapper.findAll('.document-type-row')).toHaveLength(6);
  });

  it('renders the requested number of skeleton rows', () => {
    const wrapper = mount(TableDialogSkelaton, {
      props: {
        rows: 3,
      },
    });

    expect(wrapper.findAll('.document-type-row')).toHaveLength(3);
  });
});
