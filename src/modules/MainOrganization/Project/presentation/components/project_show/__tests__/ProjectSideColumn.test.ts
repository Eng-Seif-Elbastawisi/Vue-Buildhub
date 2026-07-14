import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProjectSideColumn from '../ProjectSideColumn.vue';

const addPreviewRoute = {
  path: '/organization/project_preview/add',
  query: {
    project_id: 24,
  },
};

const accordionStubs = {
  Accordion: {
    template: '<div class="p-accordion"><slot /></div>',
  },
  AccordionPanel: {
    template: '<section class="p-accordionpanel"><slot /></section>',
  },
  AccordionHeader: {
    template: '<button class="p-accordionheader"><slot /></button>',
  },
  AccordionContent: {
    template: '<div class="p-accordioncontent"><slot /></div>',
  },
};

describe('ProjectSideColumn', () => {
  it('renders stats and preview details', () => {
    const wrapper = mount(ProjectSideColumn, {
      props: {
        imageSource: '/project.png',
        projectTitle: 'Test Project',
        stats: [{ icon: 'pi pi-building', value: '1', label: 'Floors' }],
        addItemTo: addPreviewRoute,
        preview: {
          preview_date: '2026-07-08',
          preview_time: '17:44:00',
          notification_type: 1,
          notification_message: 'Preview ready',
          site_link: 'https://example.com/site',
          address: 'Site address',
        },
        previewTitle: 'Project Preview',
        noPreviewLabel: 'No preview',
        previewDateLabel: 'Preview Date',
        previewTimeLabel: 'Preview Time',
        notificationTypeLabel: 'Notification Type',
        notificationMessageLabel: 'Notification Message',
        siteLinkLabel: 'Site Link',
        addressLabel: 'Address',
        emptyValue: '—',
        formatDate: () => '08 Jul 2026',
        formatTime: () => '05:44 PM',
        valueOrEmpty: (value?: string | number | null) => String(value ?? '—'),
      },
      global: {
        stubs: accordionStubs,
      },
    });

    expect(wrapper.find('img[alt="Test Project"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Floors');
    expect(wrapper.text()).toContain('Preview ready');
    expect(wrapper.find('a[href="https://example.com/site"]').exists()).toBe(true);
  });

  it('renders all preview entries', () => {
    const wrapper = mount(ProjectSideColumn, {
      props: {
        imageSource: '/project.png',
        projectTitle: 'Test Project',
        stats: [{ icon: 'pi pi-building', value: '1', label: 'Floors' }],
        addItemTo: addPreviewRoute,
        preview: null,
        previews: [
          {
            id: 39,
            preview_date: '2026-07-30',
            preview_time: '13:47:00',
            notification_message: 'Latest preview',
            site_link: 'https://example.com/latest',
            address: 'Latest address',
          },
          {
            id: 38,
            preview_date: '2026-07-16',
            preview_time: '13:40:00',
            notification_message: 'Previous preview',
            site_link: 'https://example.com/previous',
            address: 'Previous address',
          },
        ],
        previewTitle: 'Project Preview',
        noPreviewLabel: 'No preview',
        previewDateLabel: 'Preview Date',
        previewTimeLabel: 'Preview Time',
        notificationTypeLabel: 'Notification Type',
        notificationMessageLabel: 'Notification Message',
        siteLinkLabel: 'Site Link',
        addressLabel: 'Address',
        emptyValue: '—',
        formatDate: (value?: string | null) => String(value ?? '—'),
        formatTime: (value?: string | null) => String(value ?? '—'),
        valueOrEmpty: (value?: string | number | null) => String(value ?? '—'),
      },
      global: {
        stubs: accordionStubs,
      },
    });

    expect(wrapper.find('.p-accordion').exists()).toBe(true);
    expect(wrapper.text()).toContain('Latest preview');
    expect(wrapper.text()).toContain('Previous preview');
    expect(wrapper.find('a[href="https://example.com/latest"]').exists()).toBe(true);
    expect(wrapper.find('a[href="https://example.com/previous"]').exists()).toBe(true);
  });

  it('routes to add preview when no preview exists', () => {
    const wrapper = mount(ProjectSideColumn, {
      props: {
        imageSource: '/project.png',
        projectTitle: 'Test Project',
        stats: [{ icon: 'pi pi-building', value: '1', label: 'Floors' }],
        addItemTo: addPreviewRoute,
        preview: null,
        previewTitle: 'Project Preview',
        noPreviewLabel: 'No preview',
        previewDateLabel: 'Preview Date',
        previewTimeLabel: 'Preview Time',
        notificationTypeLabel: 'Notification Type',
        notificationMessageLabel: 'Notification Message',
        siteLinkLabel: 'Site Link',
        addressLabel: 'Address',
        emptyValue: '—',
        formatDate: () => '08 Jul 2026',
        formatTime: () => '05:44 PM',
        valueOrEmpty: (value?: string | number | null) => String(value ?? '—'),
      },
      global: {
        stubs: {
          ...accordionStubs,
          RouterLink: {
            name: 'RouterLink',
            props: ['to'],
            template: '<a><slot /></a>',
          },
        },
      },
    });

    expect(wrapper.findComponent({ name: 'RouterLink' }).props('to')).toEqual(addPreviewRoute);
  });
});
