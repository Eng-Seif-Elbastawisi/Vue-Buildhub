import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import QuoteStatusBadge from '../QuoteStatusBadge.vue';
import { QuoteStatusEnum } from '../../../core/constants/quote.status.enum';

describe('QuoteStatusBadge', () => {
  it.each([
    [QuoteStatusEnum.DRAFT, 'status-draft', /Draft|quote_status\.draft/],
    [
      QuoteStatusEnum.PENDING_VALIDATION,
      'status-pending-validation',
      /Pending|quote_status\.pending_validation/,
    ],
    [
      QuoteStatusEnum.REVISION_REQUIRED,
      'status-revision-required',
      /Revision|quote_status\.revision_required/,
    ],
    [QuoteStatusEnum.SENT_TO_CLIENT, 'status-sent-to-client', /Sent|quote_status\.sent_to_client/],
  ] as const)(
    'retains the existing label and domain class for status %s',
    (status, className, label) => {
      const wrapper = mount(QuoteStatusBadge, { props: { status } });
      expect(wrapper.classes()).toContain(className);
      expect(wrapper.text()).toMatch(label);
      wrapper.unmount();
    },
  );
});
