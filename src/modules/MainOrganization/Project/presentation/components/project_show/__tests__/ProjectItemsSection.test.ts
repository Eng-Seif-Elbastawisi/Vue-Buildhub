import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProjectItemsSection from '../ProjectItemsSection.vue';

describe('ProjectItemsSection', () => {
  it('renders project item rows', () => {
    const wrapper = mount(ProjectItemsSection, {
      props: {
        title: 'Project Items',
        items: [{ id: 7, title: 'Paint work' }],
        emptyLabel: 'No items',
        idLabel: 'ID',
        titleLabel: 'Title',
        valueOrEmpty: (value?: string | number | null) => String(value ?? '—'),
      },
    });

    expect(wrapper.text()).toContain('Project Items');
    expect(wrapper.text()).toContain('7');
    expect(wrapper.text()).toContain('Paint work');
  });
});
