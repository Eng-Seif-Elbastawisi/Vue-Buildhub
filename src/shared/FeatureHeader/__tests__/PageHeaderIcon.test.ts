import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PageHeaderIcon from '../PageHeaderIcon.vue';

describe('PageHeaderIcon', () => {
  it('provides normalized drawable paths and a separate add accent', () => {
    const wrapper = mount(PageHeaderIcon, { props: { kind: 'person', action: 'add' } });
    const paths = wrapper.findAll('.page-header-icon__path');

    expect(paths.length).toBeGreaterThan(0);
    expect(paths.every((path) => path.attributes('pathLength') === '1')).toBe(true);
    expect(wrapper.find('.page-header-icon__accent').exists()).toBe(true);
    expect(wrapper.attributes('aria-hidden')).toBe('true');
  });

  it('uses an edit accent and omits accents on view pages', () => {
    const editIcon = mount(PageHeaderIcon, { props: { kind: 'box', action: 'edit' } });
    const viewIcon = mount(PageHeaderIcon, { props: { kind: 'box' } });

    expect(editIcon.find('.page-header-icon__accent path').exists()).toBe(true);
    expect(viewIcon.find('.page-header-icon__accent').exists()).toBe(false);
  });
});
