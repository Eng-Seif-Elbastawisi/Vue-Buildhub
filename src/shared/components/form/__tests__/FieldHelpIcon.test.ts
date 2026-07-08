import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';

import FieldHelpIcon from '../FieldHelpIcon.vue';

const messages: Record<string, string> = {
  'field_help.default_title': 'Field help',
  'field_help.default_field': 'this field',
  'field_help.show_for': 'Show help for {field}',
  'field_help.important_title': "Why it's important?",
  'field_help.default_importance':
    'This helps keep {field} clear, accurate, and easier to use across workflows.',
  'field_help.tip_label': 'Tip:',
  'field_help.title.title': 'Title',
  'field_help.title.text': 'Use a clear title.',
  'field_help.name.title': 'Name',
  'field_help.name.text': 'Use the full name.',
  'field_help.name.important': 'The name is used in reports and activity logs.',
  'field_help.name.tip': "Use the employee's real full name.",
};

const translate = (key: string, params?: Record<string, string>) => {
  const message = messages[key] ?? key;

  return Object.entries(params ?? {}).reduce(
    (result, [paramKey, value]) => result.replace(`{${paramKey}}`, value),
    message,
  );
};

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: translate,
  }),
}));

const PopoverStub = defineComponent({
  name: 'Popover',
  emits: ['show', 'hide'],
  setup(_, { emit }) {
    const shown = ref(false);

    const toggle = () => {
      shown.value = !shown.value;
      emit(shown.value ? 'show' : 'hide');
    };

    const hide = () => {
      shown.value = false;
      emit('hide');
    };

    return {
      shown,
      toggle,
      hide,
    };
  },
  template: '<section v-if="shown" class="popover-stub"><slot /></section>',
});

const wrappers: VueWrapper[] = [];

const createWrapper = (props = {}) => {
  const wrapper = mount(FieldHelpIcon, {
    props,
    global: {
      stubs: {
        Popover: PopoverStub,
      },
    },
  });

  wrappers.push(wrapper);

  return wrapper;
};

describe('FieldHelpIcon', () => {
  afterEach(() => {
    wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
    document.body.innerHTML = '';
  });

  it('does not render when no help content exists', () => {
    const wrapper = createWrapper({ fieldName: 'unknown_field' });

    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('renders a keyboard-focusable button when registry help exists', () => {
    const wrapper = createWrapper({ fieldName: 'title', label: 'Title' });
    const button = wrapper.find('button');

    expect(button.exists()).toBe(true);
    expect(button.attributes('type')).toBe('button');
    expect(button.attributes('aria-label')).toBe('Show help for Title');
    expect(button.attributes('aria-haspopup')).toBe('dialog');
  });

  it('opens an anchored popover when clicked', async () => {
    const wrapper = createWrapper({
      label: 'Custom field',
      helpTitle: 'Custom field',
      helpText: 'Use this field carefully.',
      importantText: 'This keeps the workflow easy to audit.',
      tip: 'Use a value everyone can recognize.',
    });

    await wrapper.find('button').trigger('click');

    const popover = wrapper.find('.popover-stub');

    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true');
    expect(popover.text()).toContain('Custom field');
    expect(popover.text()).toContain('Use this field carefully.');
    expect(popover.text()).toContain("Why it's important?");
    expect(popover.text()).toContain('This keeps the workflow easy to audit.');
    expect(popover.text()).toContain('Tip: Use a value everyone can recognize.');
  });

  it('renders registry importance and tip content', async () => {
    const wrapper = createWrapper({ fieldName: 'name', label: 'Name' });

    await wrapper.find('button').trigger('click');

    expect(wrapper.find('.popover-stub').text()).toContain('The name is used in reports');
    expect(wrapper.find('.popover-stub').text()).toContain("Use the employee's real full name.");
  });

  it('closes another open field help popover before opening the clicked one', async () => {
    const first = createWrapper({ fieldName: 'title', label: 'Location Title' });
    const second = createWrapper({ fieldName: 'name', label: 'Country' });

    await first.find('button').trigger('click');
    await first.vm.$nextTick();

    expect(first.find('button').attributes('aria-expanded')).toBe('true');

    await second.find('button').trigger('click');
    await first.vm.$nextTick();
    await second.vm.$nextTick();

    expect(first.find('button').attributes('aria-expanded')).toBe('false');
    expect(second.find('button').attributes('aria-expanded')).toBe('true');
  });
});
