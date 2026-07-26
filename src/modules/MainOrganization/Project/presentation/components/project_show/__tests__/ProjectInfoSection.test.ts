import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProjectInfoSection from '../ProjectInfoSection.vue';

describe('ProjectInfoSection', () => {
  it('renders information items with meta and badge states', () => {
    const wrapper = mount(ProjectInfoSection, {
      props: {
        title: 'Project Information',
        additionalDetailsLabel: 'View all project information',
        items: [
          {
            icon: 'pi pi-user',
            label: 'Client',
            value: 'Marny Barnett',
            meta: '+1 (855) 934-1348',
          },
          {
            icon: 'pi pi-shield',
            label: 'Status',
            value: 'Active',
            badge: 'is-active',
          },
        ],
      },
    });

    expect(wrapper.text()).toContain('Project Information');
    expect(wrapper.text()).toContain('Marny Barnett');
    expect(wrapper.text()).toContain('+1 (855) 934-1348');
    expect(wrapper.find('.status-badge--inline').text()).toBe('Active');
  });

  it('keeps secondary and long backend values inside a collapsed disclosure', () => {
    const wrapper = mount(ProjectInfoSection, {
      props: {
        title: 'Project Information Summary',
        additionalDetailsLabel: 'View all project information',
        items: Array.from({ length: 11 }, (_, itemIndex) => ({
          icon: 'pi pi-info-circle',
          label: `Field ${itemIndex + 1}`,
          value: itemIndex === 10 ? '<script>unsafe()</script>' : `Value ${itemIndex + 1}`,
        })),
      },
    });

    expect(wrapper.findAll('.project-info-summary-grid .project-info-field')).toHaveLength(8);
    expect(wrapper.findAll('.project-info-additional-grid .project-info-field')).toHaveLength(3);
    expect(wrapper.find('.project-info-disclosure').attributes('open')).toBeUndefined();
    expect(wrapper.text()).toContain('<script>unsafe()</script>');
    expect(wrapper.find('script').exists()).toBe(false);
    expect(
      wrapper
        .findAll('.project-safe-value')
        .some((projectValue) => projectValue.html().includes('&lt;script&gt;unsafe()&lt;/script&gt;')),
    ).toBe(true);
  });
});
