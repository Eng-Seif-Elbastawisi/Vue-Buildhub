import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProjectSideColumn from '../ProjectSideColumn.vue';

describe('ProjectSideColumn', () => {
  it('renders stats and preview details', () => {
    const wrapper = mount(ProjectSideColumn, {
      props: {
        imageSource: '/project.png',
        projectTitle: 'Test Project',
        stats: [{ icon: 'pi pi-building', value: '1', label: 'Floors' }],
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
    });

    expect(wrapper.find('img[alt="Test Project"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Floors');
    expect(wrapper.text()).toContain('Preview ready');
    expect(wrapper.find('a[href="https://example.com/site"]').exists()).toBe(true);
  });
});
