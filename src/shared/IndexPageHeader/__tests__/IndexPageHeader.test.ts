import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import IndexPageHeader from '../IndexPageHeader.vue';

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

  it('keeps search before actions and filters in a separate toolbar row', () => {
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
    const action = toolbar.get('[data-test="add"]');
    const filters = toolbar.get('.index-page-toolbar__filters');

    expect(toolbar.element.contains(search.element)).toBe(true);
    expect(search.element.compareDocumentPosition(action.element)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
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
    expect(searchOnly.find('.index-page-toolbar__actions').exists()).toBe(false);
    expect(actionOnly.find('.index-page-toolbar__search').exists()).toBe(false);
    expect(actionOnly.find('.index-page-toolbar__actions').exists()).toBe(true);
  });
});
