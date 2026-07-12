import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import InvoiceClientProjectCard from '../InvoiceClientProjectCard.vue';

describe('InvoiceClientProjectCard', () => {
  it('renders client and project metadata', () => {
    const wrapper = mount(InvoiceClientProjectCard, {
      props: {
        clientName: 'BuildHub Client',
        clientPhone: '+20 100',
        clientEmail: 'client@example.com',
        projectName: 'Tower project',
        organizationName: 'Techlab',
        createdByName: 'Techlab Employee',
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
    });

    expect(wrapper.text()).toContain('BuildHub Client');
    expect(wrapper.text()).toContain('Tower project');
    expect(wrapper.text()).toContain('Techlab Employee');
  });
});
