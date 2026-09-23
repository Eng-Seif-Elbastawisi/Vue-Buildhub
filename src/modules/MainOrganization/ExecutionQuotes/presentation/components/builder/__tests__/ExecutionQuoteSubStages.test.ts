import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import StageModel from '@/modules/shared/Stages/core/models/stage.model';

import ExecutionQuoteSubStages from '../ExecutionQuoteSubStages.vue';

describe('ExecutionQuoteSubStages', () => {
  it('emits the selected stage id and marks the current stage', async () => {
    const stage = new StageModel({ id: 12, title: 'Painting', children: [] });
    const wrapper = mount(ExecutionQuoteSubStages, {
      props: { stages: [stage], items: [], modelValue: 12 },
      global: { mocks: { $t: (key: string) => key } },
    });

    const card = wrapper.get('.sub-stage-card');
    expect(card.classes()).toContain('sub-stage-card--selected');

    await card.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe(12);
  });
});
