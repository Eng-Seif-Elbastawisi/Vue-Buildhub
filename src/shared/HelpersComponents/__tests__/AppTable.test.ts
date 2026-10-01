import { describe, it, expect, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
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
      stubs: {
        DeleteDialog: {
          props: ['triggerLabel'],
          emits: ['delete'],
          template:
            '<div class="delete-dialog-stub">{{ triggerLabel }}<button class="confirm-bulk-delete" @click="$emit(\'delete\')">Confirm</button></div>',
        },
      },
    },
  });

describe('AppTable', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.classes()).toContain('app-table-wrapper--standard');
  });

  it('keeps locally styled tables on their existing appearance', () => {
    const wrapper = createWrapper({ appearance: 'custom' });
    expect(wrapper.classes()).not.toContain('app-table-wrapper--standard');
    expect(wrapper.find('th').attributes('style')).toContain('text-align: left');
  });

  it('uses the shared index table inside the Execution Quotes frame', () => {
    const wrapper = createWrapper({ flush: true, minWidth: '1210px' });
    expect(wrapper.classes()).toContain('app-table-wrapper--standard');
    expect(wrapper.classes()).toContain('app-table-wrapper--flush');
    expect(wrapper.find('table').attributes('style')).toContain('min-width: 1210px');
  });

  it('renders table headers', () => {
    const wrapper = createWrapper();
    const ths = wrapper.findAll('th');
    expect(ths[0].text()).toBe('Name');
    expect(ths[1].text()).toBe('Email');
    expect(ths[0].attributes('style')).toContain('text-align: start');
  });

  it('preserves an explicit column alignment', () => {
    const wrapper = createWrapper({ headers: [{ key: 'name', label: 'Name', align: 'right' }] });
    expect(wrapper.find('th').attributes('style')).toContain('text-align: right');
    expect(wrapper.find('.td-data').attributes('style')).toContain('text-align: right');
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

  it('shows a confirmed bulk delete action for selected rows', async () => {
    const bulkDelete = vi.fn().mockResolvedValue(undefined);
    const wrapper = createWrapper({ selectable: true, bulkDelete });

    await wrapper.find('.td-checkbox input[type="checkbox"]').trigger('change');

    expect(wrapper.text()).toContain('Delete selected (1)');

    await wrapper.find('.confirm-bulk-delete').trigger('click');
    await flushPromises();

    expect(bulkDelete).toHaveBeenCalledWith([mockItems[0]]);
    expect(wrapper.find('.table-bulk-actions').exists()).toBe(false);
  });

  it('clears selection when the table receives a new page of items', async () => {
    const bulkDelete = vi.fn().mockResolvedValue(undefined);
    const wrapper = createWrapper({ selectable: true, bulkDelete });

    await wrapper.find('.td-checkbox input[type="checkbox"]').trigger('change');
    await wrapper.setProps({ items: [mockItems[1]] });

    expect(wrapper.find('.table-bulk-actions').exists()).toBe(false);
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
    expect(sortableTh.attributes('aria-sort')).toBe('ascending');
    expect(sortableTh.attributes('title')).toContain('Sorted ascending');
  });

  it('toggles sort direction on repeated click', async () => {
    const sortableHeaders = [{ key: 'name', label: 'Name', sortable: true }];
    const wrapper = createWrapper({ headers: sortableHeaders });

    const sortableTh = wrapper.find('.sortable');
    await sortableTh.trigger('click');
    await sortableTh.trigger('click');

    const emitted = wrapper.emitted('sort')!;
    expect(emitted[1]).toEqual(['name', 'desc']);
    expect(sortableTh.attributes('aria-sort')).toBe('descending');
    expect(sortableTh.attributes('title')).toContain('Sorted descending');
  });

  it('restores the initial sort state supplied by the server-backed list', () => {
    const wrapper = createWrapper({
      headers: [{ key: 'name', label: 'Name', sortable: true }],
      initialSortKey: 'name',
      initialSortDirection: 'desc',
    });

    const sortableTh = wrapper.find('.sortable');
    expect(sortableTh.attributes('aria-sort')).toBe('descending');
    expect(sortableTh.attributes('title')).toContain('Sorted descending');
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

  it('renders reorder drag handle column when reorderable is true', () => {
    const wrapper = createWrapper({ reorderable: true });
    expect(wrapper.find('.th-drag-handle').exists()).toBe(true);
    expect(wrapper.findAll('.td-drag-handle')).toHaveLength(2);
    expect(wrapper.find('.drag-handle-icon').exists()).toBe(true);
  });

  it('handles drag and drop reordering and emits reorder event', async () => {
    const wrapper = createWrapper({ reorderable: true });
    const rows = wrapper.findAll('tbody tr');
    const dragHandles = wrapper.findAll('.td-drag-handle');

    const dataTransfer = {
      effectAllowed: '',
      dropEffect: '',
      setData: vi.fn(),
      setDragImage: vi.fn(),
      getData: vi.fn(),
    };

    expect(rows[0].attributes('draggable')).toBeUndefined();
    expect(dragHandles[0].attributes('draggable')).toBe('true');

    // Drag row 0 by its dedicated handle
    await dragHandles[0].trigger('dragstart', { dataTransfer });
    // Drag over row 1
    await rows[1].trigger('dragover', { dataTransfer });
    // Drop on row 1
    await rows[1].trigger('drop', { dataTransfer });

    expect(wrapper.emitted('reorder')).toBeTruthy();
    const payload = wrapper.emitted('reorder')![0][0] as {
      items: TestItem[];
      movedItem: TestItem;
      fromIndex: number;
      toIndex: number;
    };
    expect(payload.fromIndex).toBe(0);
    expect(payload.toIndex).toBe(1);
    expect(payload.movedItem).toEqual(mockItems[0]);
    expect(payload.items[0]).toEqual(mockItems[1]);
    expect(payload.items[1]).toEqual(mockItems[0]);
  });

  it('keeps the full row together and inserts it at the indicated edge while dragging', async () => {
    const items = [...mockItems, { id: 3, name: 'Sam', email: 'sam@test.com' }];
    const wrapper = createWrapper({ items, reorderable: true });
    const rows = wrapper.findAll('tbody tr');
    const dragHandles = wrapper.findAll('.td-drag-handle');
    const setDragImage = vi.fn();
    const dataTransfer = {
      effectAllowed: '',
      dropEffect: '',
      setData: vi.fn(),
      setDragImage,
      getData: vi.fn(),
    };
    let runDragOverFrame: FrameRequestCallback = () => undefined;
    const animationFrame = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        runDragOverFrame = callback;
        return 1;
      });

    vi.spyOn(rows[2].element, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 140,
      left: 0,
      right: 600,
      width: 600,
      height: 40,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    });

    await dragHandles[0].trigger('dragstart', { clientX: 10, clientY: 10, dataTransfer });
    await rows[2].trigger('dragover', { clientY: 105, dataTransfer });
    runDragOverFrame(0);
    await wrapper.vm.$nextTick();

    expect(setDragImage.mock.calls[0]?.[0]).toBe(rows[0].element);
    expect(rows[0].classes()).toContain('is-dragging');
    expect(rows[2].classes()).toContain('drag-over-top');

    await rows[2].trigger('drop', { clientY: 105, dataTransfer });
    animationFrame.mockRestore();

    const payload = wrapper.emitted('reorder')?.[0]?.[0] as {
      items: TestItem[];
      fromIndex: number;
      toIndex: number;
    };
    expect(payload.fromIndex).toBe(0);
    expect(payload.toIndex).toBe(1);
    expect(payload.items.map((item) => item.id)).toEqual([2, 1, 3]);
    expect(rows.every((row) => !row.classes().includes('is-dragging'))).toBe(true);
  });
});
