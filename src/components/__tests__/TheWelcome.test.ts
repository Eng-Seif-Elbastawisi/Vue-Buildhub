import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TheWelcome from '../TheWelcome.vue';

vi.stubGlobal('fetch', vi.fn());

const globalConfig = {
  mocks: {
    $t: (key: string) => key,
  },
  stubs: {
    DocumentationIcon: true,
    ToolingIcon: true,
    EcosystemIcon: true,
    CommunityIcon: true,
    SupportIcon: true,
  },
};

describe('TheWelcome', () => {
  it('renders translated section headings', () => {
    const wrapper = mount(TheWelcome, { global: globalConfig });

    expect(wrapper.text()).toContain('vue_starter.documentation');
    expect(wrapper.text()).toContain('vue_starter.tooling');
    expect(wrapper.text()).toContain('vue_starter.support_vue');
  });

  it('keeps external resource links available', () => {
    const wrapper = mount(TheWelcome, { global: globalConfig });

    expect(wrapper.find('a[href="https://vuejs.org/"]').exists()).toBe(true);
    expect(wrapper.find('a[href="https://vite.dev/guide/features.html"]').exists()).toBe(true);
  });
});
