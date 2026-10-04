import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import AppErrorState from '../AppErrorState.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'ar',
  messages: {
    ar: {
      'construction_states.section_title': 'تعذر تحميل هذا القسم',
      'construction_states.section_message': 'أعد المحاولة',
    },
  },
});

describe('AppErrorState', () => {
  it('keeps the backend message and emits retry', async () => {
    const retry = vi.fn();
    const wrapper = mount(AppErrorState, {
      props: { variant: 'section', message: 'Server detail exactly as returned', onRetry: retry },
      global: { plugins: [i18n], mocks: { $t: (key: string) => key } },
    });

    expect(wrapper.text()).toContain('Server detail exactly as returned');
    await wrapper.find('button').trigger('click');
    expect(retry).toHaveBeenCalledOnce();
  });
});
