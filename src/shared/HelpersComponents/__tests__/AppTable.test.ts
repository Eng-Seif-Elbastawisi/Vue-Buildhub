import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppTable from '../AppTable.vue';

// Mock dialogManager
vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: {
    toastSuccess: vi.fn(),
  },
}));

interface TestItem {
  id: number;
  name: string;
  email: string;
}

const mockHeaders = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
];

const mockItems: TestItem[] = [
  { id: 1, name: 'John', email: 'john@test.com' },
  { id: 2, name: 'Jane', email: 'jane@test.com' },
];

const createWrapper = (props = {}, slots = {}) =>
  mount(AppTable, {
    props: {
      headers: mockHeaders,
      items: mockItems,
      ...props,
    },
    slots,
    global: {
      mocks: { $t: (key: string) => key },
    },
  });

describe('AppTable', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders table headers', () => {
    const wrapper = createWrapper();
    const ths = wrapper.findAll('th');
    expect(ths[0].text()).toBe('Name');
    expect(ths[1].text()).toBe('Email');
  });

  it('renders table rows', () => {
    const wrapper = createWrapper();
    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(2);
  });

  it('renders cell data', () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain('John');
    expect(wrapper.text()).toContain('jane@test.com');
  });

  it('shows empty message when no items', () => {
    const wrapper = createWrapper({ items: [] });
    expect(wrapper.text()).toContain('No data available');
  });

  it('shows custom empty message', () => {
    const wrapper = createWrapper({ items: [], emptyMessage: 'Nothing here' });
    expect(wrapper.text()).toContain('Nothing here');
  });

  it('shows index column when showIndex is true', () => {
    const wrapper = createWrapper({ showIndex: true });
    const indexTh = wrapper.find('.th-index');
    expect(indexTh.exists()).toBe(true);
    expect(wrapper.text()).toContain('1');
    expect(wrapper.text()).toContain('2');
  });

  it('hides index column by default', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.th-index').exists()).toBe(false);
  });

  it('emits row-click when row is clicked', async () => {
    const wrapper = createWrapper();
    const firstRow = wrapper.findAll('tbody tr')[0];
    await firstRow.trigger('click');

    expect(wrapper.emitted('row-click')).toBeTruthy();
    expect(wrapper.emitted('row-click')![0][0]).toEqual(mockItems[0]);
    expect(wrapper.emitted('row-click')![0][1]).toBe(0);
  });

  it('renders selectable checkbox column', () => {
    const wrapper = createWrapper({ selectable: true });
    expect(wrapper.find('.th-checkbox').exists()).toBe(true);
  });

  it('toggles row selection', async () => {
    const wrapper = createWrapper({ selectable: true });
    const checkbox = wrapper.find('.td-checkbox input[type="checkbox"]');
    await checkbox.trigger('change');
    expect(wrapper.emitted('selection-change')).toBeTruthy();
  });

  it('selects all rows', async () => {
    const wrapper = createWrapper({ selectable: true });
    const headerCheckbox = wrapper.find('.th-checkbox input[type="checkbox"]');
    await headerCheckbox.trigger('change');
    expect(wrapper.emitted('selection-change')).toBeTruthy();
  });

  it('handles sortable columns', async () => {
    const sortableHeaders = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email' },
    ];
    const wrapper = createWrapper({ headers: sortableHeaders });

    const sortableTh = wrapper.find('.sortable');
    expect(sortableTh.exists()).toBe(true);

    await sortableTh.trigger('click');
    expect(wrapper.emitted('sort')).toBeTruthy();
    expect(wrapper.emitted('sort')![0]).toEqual(['name', 'asc']);
  });

  it('toggles sort direction on repeated click', async () => {
    const sortableHeaders = [{ key: 'name', label: 'Name', sortable: true }];
    const wrapper = createWrapper({ headers: sortableHeaders });

    const sortableTh = wrapper.find('.sortable');
    await sortableTh.trigger('click');
    await sortableTh.trigger('click');

    const emitted = wrapper.emitted('sort')!;
    expect(emitted[1]).toEqual(['name', 'desc']);
  });

  it('shows -- for null values', () => {
    const items = [{ id: 1, name: null, email: 'test@test.com' }];
    const wrapper = createWrapper({ items });
    expect(wrapper.text()).toContain('--');
  });

  it('renders actions column when actions slot is provided', () => {
    const wrapper = createWrapper(
      {},
      {
        actions: '<button>Edit</button>',
      },
    );
    expect(wrapper.find('.th-actions').exists()).toBe(true);
  });

  it('applies striped class', () => {
    const wrapper = createWrapper({ striped: true });
    expect(wrapper.find('.striped').exists()).toBe(true);
  });

  it('applies hoverable class', () => {
    const wrapper = createWrapper({ hoverable: true });
    expect(wrapper.find('.hoverable').exists()).toBe(true);
  });

  it('has table-responsive wrapper', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.table-responsive').exists()).toBe(true);
  });
});
