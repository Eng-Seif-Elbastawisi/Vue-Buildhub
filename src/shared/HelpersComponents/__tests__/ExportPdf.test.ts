import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExportPdf from '../ExportPdf.vue';

// Mock dependencies
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    internal: { pageSize: { getWidth: () => 297 } },
    addImage: vi.fn(),
    save: vi.fn(),
  })),
}));

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: () => 'data:image/png;base64,mocked',
    width: 800,
    height: 600,
  }),
}));

// Mock icon
vi.mock('../../icons/ExportIcon.vue', () => ({
  default: { template: '<span class="mock-export-icon" />' },
}));

const createWrapper = () =>
  mount(ExportPdf, {
    global: {
      mocks: { $t: (key: string) => key },
    },
  });

describe('ExportPdf', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders as a button', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('button').exists()).toBe(true);
  });

  it('has type="button"', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('button').attributes('type')).toBe('button');
  });

  it('displays export text', () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain('Export PDF');
  });

  it('renders the export icon', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.mock-export-icon').exists()).toBe(true);
  });

  it('applies btn btn-secondary class', () => {
    const wrapper = createWrapper();
    const btn = wrapper.find('button');
    expect(btn.classes()).toContain('btn');
    expect(btn.classes()).toContain('btn-secondary');
  });
});
