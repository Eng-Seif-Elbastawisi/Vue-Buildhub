import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProjectShowTabs from '../ProjectShowTabs.vue';

describe('ProjectShowTabs', () => {
  it('renders tabs and emits the selected tab id', async () => {
    const wrapper = mount(ProjectShowTabs, {
      props: {
        tabs: [
          { id: 'project-data', label: 'Project Data', icon: 'pi pi-calendar' },
          { id: 'project-preview', label: 'Project Preview', icon: 'pi pi-id-card' },
        ],
        activeTab: 'project-data',
        ariaLabel: 'Project sections',
      },
    });

    await wrapper.findAll('button')[1].trigger('click');

    expect(wrapper.find('nav').attributes('aria-label')).toBe('Project sections');
    expect(wrapper.findAll('button')[0].attributes('aria-current')).toBe('location');
    expect(wrapper.findAll('button')[1].attributes('aria-controls')).toBe('project-preview');
    expect(wrapper.emitted('select')?.[0]).toEqual(['project-preview']);
  });
});
