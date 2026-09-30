import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import { QuoteStatusEnum } from '../../../core/constants/quote.status.enum';
import ExecutionQuoteStatusDialog from '../ExecutionQuoteStatusDialog.vue';

const DialogStub = {
  props: ['visible'],
  emits: ['update:visible'],
  template: '<section v-if="visible" class="dialog-stub"><slot /></section>',
};

describe('ExecutionQuoteStatusDialog', () => {
  it.each([QuoteStatusEnum.PENDING_VALIDATION, QuoteStatusEnum.REVISION_REQUIRED])(
    'requires a valid choice when multiple transitions are available from %s',
    async (currentStatus) => {
      const wrapper = mount(ExecutionQuoteStatusDialog, {
        props: {
          modelValue: true,
          currentStatus,
        },
        global: { stubs: { Dialog: DialogStub } },
      });

      const options = wrapper.findAll('.execution-quote-status-dialog__option');

      expect(options).toHaveLength(2);
      expect(wrapper.get('.execution-quote-status-dialog__submit').attributes('disabled')).toBe('');

      await options[1].trigger('click');
      await wrapper.get('textarea').setValue('  Client requested this change  ');
      await wrapper.get('.execution-quote-status-dialog__submit').trigger('click');

      expect(wrapper.emitted('submit')).toEqual([
        [QuoteStatusEnum.SENT_TO_CLIENT, 'Client requested this change'],
      ]);
    },
  );

  it('preselects the only allowed transition from draft', async () => {
    const wrapper = mount(ExecutionQuoteStatusDialog, {
      props: {
        modelValue: true,
        currentStatus: QuoteStatusEnum.DRAFT,
      },
      global: { stubs: { Dialog: DialogStub } },
    });

    expect(wrapper.findAll('.execution-quote-status-dialog__option')).toHaveLength(1);
    await wrapper.get('.execution-quote-status-dialog__submit').trigger('click');

    expect(wrapper.emitted('submit')).toEqual([[QuoteStatusEnum.PENDING_VALIDATION, null]]);
  });
});
