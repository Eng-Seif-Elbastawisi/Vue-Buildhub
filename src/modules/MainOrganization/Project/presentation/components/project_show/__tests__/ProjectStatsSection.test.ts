import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProjectStatsSection from '../ProjectStatsSection.vue';

describe('ProjectStatsSection', () => {
  it('renders statistics supplied by the project data flow', () => {
    const wrapper = mount(ProjectStatsSection, {
      props: {
        title: 'Project statistics',
        stats: [
          { icon: 'pi pi-building', value: '3', label: 'Floors', caption: 'Total Floors' },
          { icon: 'pi pi-th-large', value: '12', label: 'Spaces', caption: 'Total Spaces' },
        ],
      },
    });

    expect(wrapper.attributes('aria-label')).toBe('Project statistics');
    expect(wrapper.findAll('.project-stat-card')).toHaveLength(2);
    expect(wrapper.text()).toContain('3');
    expect(wrapper.text()).toContain('12');
    expect(wrapper.text()).toContain('Total Floors');
    expect(wrapper.text()).toContain('Total Spaces');
  });
});
