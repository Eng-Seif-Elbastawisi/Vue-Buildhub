import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import StageModel from '@/modules/shared/Stages/core/models/stage.model';

import ExecutionQuoteMainStages from '../ExecutionQuoteMainStages.vue';

describe('ExecutionQuoteMainStages', () => {
  it('replaces stage pricing with supervision guidance when pricing is disabled', () => {
    const wrapper = mount(ExecutionQuoteMainStages, {
      props: {
        stages: [new StageModel({ id: 129, title: 'Finishes', children: [] })],
        stageStates: {},
        showPricing: false,
      },
      global: { mocks: { $t: (key: string) => key } },
    });

    expect(wrapper.text()).toContain('execution_quote.pricing_not_required_short');
    expect(wrapper.text()).not.toContain('execution_quote.client_stage_price');
  });
});
