import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { describe, expect, it } from 'vitest';

import ar from '@/locales/ar.json';

import ExecutionQuoteRowActions from '../ExecutionQuoteRowActions.vue';

describe('ExecutionQuoteRowActions', () => {
  it('shows a neutral placeholder when the row has no usable action', () => {
    const wrapper = mount(ExecutionQuoteRowActions, {
      props: { available: false, canModify: false, canChangeStatus: false },
    });

    expect(wrapper.get('.execution-quote-index__no-actions').text()).toBe('—');
    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('keeps view visible without a menu when the quote cannot be modified', async () => {
    const wrapper = mount(ExecutionQuoteRowActions, {
      props: { available: true, canModify: false, canChangeStatus: false },
    });

    expect(wrapper.find('.execution-quote-index__more-button').exists()).toBe(false);
    await wrapper.get('.execution-quote-index__view-button').trigger('click');
    expect(wrapper.emitted('view')).toHaveLength(1);
  });

  it('groups the editable actions in a labeled menu', async () => {
    const wrapper = mount(ExecutionQuoteRowActions, {
      props: { available: true, canModify: true, canChangeStatus: true },
    });

    const moreButton = wrapper.get('.execution-quote-index__more-button');
    expect(moreButton.attributes('aria-label')).toBe('More actions');
    expect(moreButton.attributes('title')).toBe('More actions');
    expect(wrapper.find('.execution-quote-index__add-item-button').exists()).toBe(false);

    await moreButton.trigger('click');
    expect(wrapper.get('.execution-quote-index__actions-menu').attributes('dir')).toBe('ltr');

    await wrapper.get('.execution-quote-index__add-item-button .p-menu-item-link').trigger('click');
    expect(wrapper.emitted('addItem')).toHaveLength(1);
  });

  it('opens the menu in Arabic RTL with a translated trigger', async () => {
    const arabicI18n = createI18n({
      legacy: false,
      locale: 'ar',
      messages: { ar },
    });
    const wrapper = mount(ExecutionQuoteRowActions, {
      props: { available: true, canModify: true, canChangeStatus: true },
      global: { plugins: [arabicI18n] },
    });

    expect(wrapper.get('.execution-quote-index__more-button').attributes('aria-label')).toBe(
      'المزيد من الإجراءات',
    );
    await wrapper.get('.execution-quote-index__more-button').trigger('click');
    expect(wrapper.get('.execution-quote-index__actions-menu').attributes('dir')).toBe('rtl');
  });
});
