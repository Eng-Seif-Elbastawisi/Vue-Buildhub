import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import IndexPageHeader from '../IndexPageHeader.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/admin/client-source' }),
}));

describe('IndexPageHeader', () => {
  it('renders the shared title hierarchy and omits an empty toolbar', () => {
    const wrapper = mount(IndexPageHeader, {
      props: {
        title: 'Project offers',
        subtitle: 'Review and manage project offers',
      },
    });

    expect(wrapper.get('h1').text()).toBe('Project offers');
    expect(wrapper.get('.index-page-heading__subtitle').text()).toBe(
      'Review and manage project offers',
    );
    expect(wrapper.find('.index-page-toolbar').exists()).toBe(false);
  });

  it('places existing actions opposite the title and search and filters below it', () => {
    const wrapper = mount(IndexPageHeader, {
      props: { title: 'Products' },
      slots: {
        search: '<input data-test="search" />',
        actions: '<button data-test="add">Add</button>',
        filters: '<select data-test="status"><option>Active</option></select>',
      },
    });

    const toolbar = wrapper.get('.index-page-toolbar');
    const search = toolbar.get('[data-test="search"]');
    const action = wrapper.get('.index-page-heading__actions [data-test="add"]');
    const filters = toolbar.get('.index-page-toolbar__filters');

    expect(toolbar.element.contains(search.element)).toBe(true);
    expect(wrapper.get('.index-page-heading').element.contains(action.element)).toBe(true);
    expect(toolbar.element.contains(action.element)).toBe(false);
    expect(filters.find('[data-test="status"]').exists()).toBe(true);
  });

  it('supports pages with only one existing control type', () => {
    const searchOnly = mount(IndexPageHeader, {
      props: { title: 'Client sources' },
      slots: { search: '<input data-test="search" />' },
    });
    const actionOnly = mount(IndexPageHeader, {
      props: { title: 'Administrators' },
      slots: { actions: '<button data-test="refresh">Refresh</button>' },
    });

    expect(searchOnly.find('.index-page-toolbar__search').exists()).toBe(true);
    expect(searchOnly.find('.index-page-heading__actions').exists()).toBe(false);
    expect(actionOnly.find('.index-page-toolbar__search').exists()).toBe(false);
    expect(actionOnly.find('.index-page-heading__actions').exists()).toBe(true);
    expect(actionOnly.find('.index-page-toolbar').exists()).toBe(false);
  });

  it('uses an entity icon without an Add or Edit accent on a list page', () => {
    const wrapper = mount(IndexPageHeader, { props: { title: 'Client sources' } });

    expect(wrapper.find('.page-header-icon[data-icon-kind="hierarchy"]').exists()).toBe(true);
    expect(wrapper.find('.page-header-icon__accent').exists()).toBe(false);
  });
});
