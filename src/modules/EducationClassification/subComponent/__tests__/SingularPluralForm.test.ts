import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import SingularPluralForm from '../SingularPluralForm.vue';

vi.mock('@/shared/MultiLangInput.vue', () => ({
  default: {
    name: 'MultiLangInput',
    template: '<div class="multi-lang-input" />',
    props: ['fieldKey', 'label', 'languages', 'modelValue'],
    emits: ['update:modelValue'],
  },
}));

const mountForm = (props: Record<string, unknown> = {}) =>
  mount(SingularPluralForm, {
    props: { numberOfBranches: 0, label: 'Branch', ...props },
    global: {
      mocks: { $t: (k: string) => k },
    },
  });

describe('SingularPluralForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders without crashing', () => {
      const wrapper = mountForm();
      expect(wrapper.exists()).toBe(true);
    });

    it('renders no branch rows when numberOfBranches is 0', () => {
      const wrapper = mountForm({ numberOfBranches: 0 });
      expect(wrapper.findAll('.branch-row')).toHaveLength(0);
    });

    it('renders correct number of branch rows', () => {
      const wrapper = mountForm({ numberOfBranches: 3 });
      expect(wrapper.findAll('.branch-row')).toHaveLength(3);
    });

    it('hides save button when numberOfBranches is 0', () => {
      const wrapper = mountForm({ numberOfBranches: 0 });
      expect(wrapper.find('.save-btn').exists()).toBe(false);
    });

    it('shows save button when numberOfBranches > 0', () => {
      const wrapper = mountForm({ numberOfBranches: 2 });
      expect(wrapper.find('.save-btn').exists()).toBe(true);
    });
  });

  describe('emitting update', () => {
    it('emits update event with branch data when save is clicked', async () => {
      const wrapper = mountForm({ numberOfBranches: 2 });

      await wrapper.find('.save-btn').trigger('click');

      expect(wrapper.emitted('update')).toBeTruthy();
      const emittedBranches = wrapper.emitted('update')![0][0] as any[];
      expect(emittedBranches).toHaveLength(2);
      expect(emittedBranches[0]).toHaveProperty('singular');
      expect(emittedBranches[0]).toHaveProperty('plural');
    });
  });

  describe('prop reactivity', () => {
    it('updates branch rows when numberOfBranches prop changes', async () => {
      const wrapper = mountForm({ numberOfBranches: 1 });
      expect(wrapper.findAll('.branch-row')).toHaveLength(1);

      await wrapper.setProps({ numberOfBranches: 3 });
      expect(wrapper.findAll('.branch-row')).toHaveLength(3);
    });

    it('reduces branch rows when numberOfBranches decreases', async () => {
      const wrapper = mountForm({ numberOfBranches: 4 });
      await wrapper.setProps({ numberOfBranches: 2 });
      expect(wrapper.findAll('.branch-row')).toHaveLength(2);
    });
  });

  describe('initialBranches pre-fill', () => {
    it('pre-fills branch data from initialBranches prop', async () => {
      const initialBranches = [
        { singular: { en: 'Stage', ar: 'مرحلة' }, plural: { en: 'Stages', ar: 'مراحل' } },
        { singular: { en: 'Grade', ar: 'صف' }, plural: { en: 'Grades', ar: 'صفوف' } },
      ];
      const wrapper = mountForm({ numberOfBranches: 2, initialBranches });

      await wrapper.find('.save-btn').trigger('click');

      const emittedBranches = wrapper.emitted('update')![0][0] as any[];
      expect(emittedBranches[0].singular).toEqual({ en: 'Stage', ar: 'مرحلة' });
      expect(emittedBranches[0].plural).toEqual({ en: 'Stages', ar: 'مراحل' });
    });

    it('updates branches when initialBranches prop changes', async () => {
      const wrapper = mountForm({ numberOfBranches: 1, initialBranches: [] });

      const newInitial = [
        { singular: { en: 'Term', ar: 'فصل' }, plural: { en: 'Terms', ar: 'فصول' } },
      ];
      await wrapper.setProps({ initialBranches: newInitial });

      await wrapper.find('.save-btn').trigger('click');
      const emitted = wrapper.emitted('update')![0][0] as any[];
      expect(emitted[0].singular).toEqual({ en: 'Term', ar: 'فصل' });
    });
  });
});
