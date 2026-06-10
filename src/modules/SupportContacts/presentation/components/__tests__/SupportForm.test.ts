import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import SupportForm from '../SupportForm.vue';

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ query: {}, params: {}, fullPath: '/support' }),
  createRouter: vi.fn(() => ({
    install: vi.fn(),
    push: vi.fn(),
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

vi.mock('@/shared/MultiLangInput.vue', () => ({
  default: {
    name: 'MultiLangInput',
    template: '<div class="multi-lang-input" />',
    props: ['fieldKey', 'label', 'languages', 'modelValue', 'type'],
    emits: ['update:modelValue'],
  },
}));

vi.mock('@/shared/icons/Support/DeleteIcon.vue', () => ({
  default: { name: 'DeleteIcon', template: '<span class="delete-icon" />' },
}));

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } });

const mountForm = (props: Record<string, unknown> = {}) =>
  mount(SupportForm, {
    props,
    global: {
      plugins: [i18n],
      stubs: { Teleport: true, Transition: true },
    },
  });

describe('SupportForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const wrapper = mountForm();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders the add section button', () => {
    const wrapper = mountForm();
    const addBtn = wrapper.find('.add-section-btn');
    expect(addBtn.exists()).toBe(true);
  });

  it('starts with one section', () => {
    const wrapper = mountForm();
    expect(wrapper.findAll('.support-section-card')).toHaveLength(1);
  });

  it('adds a new section when the add button is clicked', async () => {
    const wrapper = mountForm();
    await wrapper.find('.add-section-btn').trigger('click');
    expect(wrapper.findAll('.support-section-card')).toHaveLength(2);
  });

  it('does not show delete button when only one section exists', () => {
    const wrapper = mountForm();
    expect(wrapper.find('.delete-section-btn').exists()).toBe(false);
  });

  it('shows delete button when more than one section exists', async () => {
    const wrapper = mountForm();
    await wrapper.find('.add-section-btn').trigger('click');
    expect(wrapper.find('.delete-section-btn').exists()).toBe(true);
  });

  it('removes a section when delete is clicked', async () => {
    const wrapper = mountForm();
    await wrapper.find('.add-section-btn').trigger('click');
    expect(wrapper.findAll('.support-section-card')).toHaveLength(2);
    await wrapper.find('.delete-section-btn').trigger('click');
    expect(wrapper.findAll('.support-section-card')).toHaveLength(1);
  });

  it('emits updateData on mount', () => {
    const wrapper = mountForm();
    expect(wrapper.emitted('updateData')).toBeTruthy();
  });

  it('emits updateData after adding a section', async () => {
    const wrapper = mountForm();
    const before = wrapper.emitted('updateData')?.length ?? 0;
    await wrapper.find('.add-section-btn').trigger('click');
    expect(wrapper.emitted('updateData')!.length).toBeGreaterThan(before);
  });
});
