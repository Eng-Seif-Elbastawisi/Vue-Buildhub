import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ProjectSideColumn from '../ProjectSideColumn.vue';

const addPreviewRoute = {
  path: '/organization/project_preview/add',
  query: {
    project_id: 24,
  },
};

const routerLinkStub = {
  name: 'RouterLink',
  props: ['to'],
  template: '<a><slot /></a>',
};

describe('ProjectSideColumn', () => {
  it('renders preview details', () => {
    const wrapper = mount(ProjectSideColumn, {
      props: {
        hasProjectFloors: false,
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
        siteLinkLabel: 'Site Link',
        addressLabel: 'Address',
        emptyValue: '—',
        formatDate: () => '08 Jul 2026',
        formatTime: () => '05:44 PM',
        valueOrEmpty: (value?: string | number | null) => String(value ?? '—'),
      },
      global: {
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    });

    expect(wrapper.text()).toContain('Site address');
    expect(wrapper.find('a[href="https://example.com/site"]').exists()).toBe(true);
    expect(wrapper.find('.project-preview-illustration').exists()).toBe(true);
    expect(wrapper.find('.project-preview-edit-action').exists()).toBe(false);
  });

  it('keeps all preview entries accessible through the compact selector', async () => {
    const wrapper = mount(ProjectSideColumn, {
      props: {
        hasProjectFloors: false,
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
        siteLinkLabel: 'Site Link',
        addressLabel: 'Address',
        emptyValue: '—',
        formatDate: (value?: string | null) => String(value ?? '—'),
        formatTime: (value?: string | null) => String(value ?? '—'),
        valueOrEmpty: (value?: string | number | null) => String(value ?? '—'),
      },
      global: {
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    });

    expect(wrapper.findAll('.project-preview-selector option')).toHaveLength(2);
    expect(wrapper.text()).toContain('Latest address');
    expect(wrapper.find('a[href="https://example.com/latest"]').exists()).toBe(true);

    await wrapper.find('select').setValue('1');

    expect(wrapper.text()).toContain('Previous address');
    expect(wrapper.find('a[href="https://example.com/previous"]').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'RouterLink' }).props('to')).toEqual({
      name: 'edit-project_preview',
      params: { project_preview_id: 38 },
      query: { project_id: 24 },
    });
  });

  it('hides preview edit actions when the project has floors', () => {
    const wrapper = mount(ProjectSideColumn, {
      props: {
        addItemTo: addPreviewRoute,
        preview: {
          id: 39,
          preview_date: '2026-07-30',
          preview_time: '13:47:00',
        },
        hasProjectFloors: true,
        previewTitle: 'Project Preview',
        noPreviewLabel: 'No preview',
        previewDateLabel: 'Preview Date',
        previewTimeLabel: 'Preview Time',
        siteLinkLabel: 'Site Link',
        addressLabel: 'Address',
        emptyValue: '—',
        formatDate: (value?: string | null) => String(value ?? '—'),
        formatTime: (value?: string | null) => String(value ?? '—'),
        valueOrEmpty: (value?: string | number | null) => String(value ?? '—'),
      },
      global: {
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    });

    expect(wrapper.find('.project-preview-edit-action').exists()).toBe(false);
  });

  it('renders source-like addresses as escaped text and rejects unsafe site links', () => {
    const sourceLikeAddress = '<script>window.location="https://unsafe.example"</script>';
    const wrapper = mount(ProjectSideColumn, {
      props: {
        hasProjectFloors: false,
        addItemTo: addPreviewRoute,
        preview: {
          preview_date: '2026-07-08',
          preview_time: '17:44:00',
          site_link: 'javascript:alert(1)',
          address: sourceLikeAddress,
        },
        previewTitle: 'Project Preview',
        noPreviewLabel: 'No preview',
        previewDateLabel: 'Preview Date',
        previewTimeLabel: 'Preview Time',
        siteLinkLabel: 'Site Link',
        addressLabel: 'Address',
        emptyValue: '—',
        formatDate: (value?: string | null) => String(value ?? '—'),
        formatTime: (value?: string | null) => String(value ?? '—'),
        valueOrEmpty: (value?: string | number | null) => String(value ?? '—'),
      },
      global: {
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    });

    expect(wrapper.find('script').exists()).toBe(false);
    expect(wrapper.text()).toContain(sourceLikeAddress);
    expect(wrapper.find('a[href^="javascript:"]').exists()).toBe(false);
    expect(wrapper.find('.project-preview-address').attributes('open')).toBeUndefined();
  });

  it('routes to add preview when no preview exists', () => {
    const wrapper = mount(ProjectSideColumn, {
      props: {
        hasProjectFloors: false,
        addItemTo: addPreviewRoute,
        preview: null,
        previewTitle: 'Project Preview',
        noPreviewLabel: 'No preview',
        previewDateLabel: 'Preview Date',
        previewTimeLabel: 'Preview Time',
        siteLinkLabel: 'Site Link',
        addressLabel: 'Address',
        emptyValue: '—',
        formatDate: () => '08 Jul 2026',
        formatTime: () => '05:44 PM',
        valueOrEmpty: (value?: string | number | null) => String(value ?? '—'),
      },
      global: {
        stubs: {
          RouterLink: routerLinkStub,
        },
      },
    });

    expect(wrapper.findComponent({ name: 'RouterLink' }).props('to')).toEqual(addPreviewRoute);
  });
});
