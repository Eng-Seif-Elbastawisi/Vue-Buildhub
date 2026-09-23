import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { ExecutionQuoteItemSourceEnum } from '../../../../core/constants/execution.quote.item.source.enum';
import ExecutionQuoteItemSourceCards from '../ExecutionQuoteItemSourceCards.vue';

describe('ExecutionQuoteItemSourceCards', () => {
  it('emits the numeric source enum selected by the user', async () => {
    const wrapper = mount(ExecutionQuoteItemSourceCards, {
      props: { modelValue: null },
      global: { mocks: { $t: (key: string) => key } },
    });

    await wrapper.findAll('.source-card')[1].trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe(
      ExecutionQuoteItemSourceEnum.BUILDING_MATERIAL,
    );
  });
});
