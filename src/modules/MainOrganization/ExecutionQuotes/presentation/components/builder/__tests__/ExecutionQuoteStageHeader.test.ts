import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ExecutionQuoteStageHeader from '../ExecutionQuoteStageHeader.vue';

describe('ExecutionQuoteStageHeader', () => {
  it('uses the shared back button and emits back', async () => {
    const wrapper = mount(ExecutionQuoteStageHeader, {
      props: { stageTitle: 'Finishes', active: true },
      global: { mocks: { $t: (key: string) => key } },
    });

    expect(wrapper.text()).toContain('Finishes');
    await wrapper.get('.stage-header__back').trigger('click');
    expect(wrapper.emitted('back')).toHaveLength(1);
  });
});
