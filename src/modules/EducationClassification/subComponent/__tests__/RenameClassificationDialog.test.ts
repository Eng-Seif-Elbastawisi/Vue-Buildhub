import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import RenameClassificationDialog from '../RenameClassificationDialog.vue';

vi.mock('primevue/dialog', () => ({
  default: {
    name: 'Dialog',
    template: '<div><slot name="header" /><slot /></div>',
    props: ['visible', 'modal', 'pt', 'style'],
    emits: ['update:visible'],
  },
}));

vi.mock('@/shared/icons/RenameIcon.vue', () => ({
  default: { name: 'RenameIcon', template: '<span />' },
}));

const mountDialog = (props: Record<string, unknown> = {}) =>
  mount(RenameClassificationDialog, {
    props: { visable: false, ...props },
    global: {
      mocks: { $t: (k: string) => k },
    },
  });

describe('RenameClassificationDialog', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const wrapper = mountDialog();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders save and cancel buttons', () => {
    const wrapper = mountDialog({ visable: true });
    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('renders a text input for the title', () => {
    const wrapper = mountDialog({ visable: true });
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
  });

  it('emits update:visable with false when cancel is clicked', async () => {
    const wrapper = mountDialog({ visable: true });
    const buttons = wrapper.findAll('button');
    const cancelBtn = buttons.find((b) => b.text().includes('cancel'));
    await cancelBtn!.trigger('click');
    expect(wrapper.emitted('update:visable')).toBeTruthy();
    expect(wrapper.emitted('update:visable')![0]).toEqual([false]);
  });

  it('emits update:visable with false when save is clicked', async () => {
    const wrapper = mountDialog({ visable: true });
    const buttons = wrapper.findAll('button');
    const saveBtn = buttons.find((b) => b.text().includes('save'));
    await saveBtn!.trigger('click');
    expect(wrapper.emitted('update:visable')).toBeTruthy();
    expect(wrapper.emitted('update:visable')![0]).toEqual([false]);
  });

  it('binds v-model to the title input', async () => {
    const wrapper = mountDialog({ visable: true });
    const input = wrapper.find('input[type="text"]');
    await input.setValue('New Title');
    expect((input.element as HTMLInputElement).value).toBe('New Title');
  });
});
