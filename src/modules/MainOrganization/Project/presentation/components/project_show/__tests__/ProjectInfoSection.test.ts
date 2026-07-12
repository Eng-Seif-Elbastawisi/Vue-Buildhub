import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProjectInfoSection from '../ProjectInfoSection.vue';

describe('ProjectInfoSection', () => {
  it('renders information items with meta and badge states', () => {
    const wrapper = mount(ProjectInfoSection, {
      props: {
        title: 'Project Information',
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
});
