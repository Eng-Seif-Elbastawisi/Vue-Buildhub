import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ExportExcel from '../ExportExcel.vue';

// Mock dependencies
vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn(() => ({ '!ref': 'A1:B2' })),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
    decode_range: vi.fn(() => ({ s: { r: 0, c: 0 }, e: { r: 1, c: 1 } })),
    encode_cell: vi.fn(() => 'A1'),
  },
  write: vi.fn(() => new ArrayBuffer(8)),
}));

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

// Mock icon
vi.mock('../../icons/ExportIcon.vue', () => ({
  default: { template: '<span class="mock-export-icon" />' },
}));
vi.mock('../../icons/SaveIcon.vue', () => ({
  default: { template: '<span class="mock-save-icon" />' },
}));

const mockData = [
  { id: 1, name: 'John', email: 'john@test.com' },
  { id: 2, name: 'Jane', email: 'jane@test.com' },
];

const createWrapper = (props = {}) =>
  mount(ExportExcel, {
    props: {
      data: mockData,
      ...props,
    },
    global: {
      mocks: { $t: (key: string) => key },
    },
  });

describe('ExportExcel', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders as a button', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('button').exists()).toBe(true);
  });

  it('displays export text', () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain('Export Excel');
  });

  it('has type="button"', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('button').attributes('type')).toBe('button');
  });

  it('emits export-start on click', async () => {
    const wrapper = createWrapper();
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('export-start')).toBeTruthy();
  });

  it('emits export-success after successful export', async () => {
    const wrapper = createWrapper();
    await wrapper.find('button').trigger('click');
    await flushPromises();
    expect(wrapper.emitted('export-success')).toBeTruthy();
  });

  it('emits export-error when no data', async () => {
    const wrapper = createWrapper({ data: [] });
    await wrapper.find('button').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('export-error')).toBeTruthy();
  });

  it('uses custom filename', () => {
    const wrapper = createWrapper({ filename: 'employees' });
    expect(wrapper.exists()).toBe(true);
  });

  it('uses custom sheet name', () => {
    const wrapper = createWrapper({ sheetName: 'Data' });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders save icon', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.mock-save-icon').exists()).toBe(true);
  });
});
