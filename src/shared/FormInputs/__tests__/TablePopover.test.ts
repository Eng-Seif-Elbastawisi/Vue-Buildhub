import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TablePopover from '../TablePopover.vue';

// Stubs
const PopoverStub = {
  name: 'Popover',
  template: '<div class="popover-stub"><slot /></div>',
  methods: { toggle: vi.fn() },
};
const DropIconStub = { name: 'DropIcon', template: '<span class="drop-icon-stub" />' };

// Mock utility functions
vi.mock('@/base/Presentation/Utils/word_slice', () => ({
  default: (str: string, len: number) => str.slice(0, len),
}));
vi.mock('@/base/Presentation/Utils/set_default_image.ts', () => ({
  setDefaultImage: vi.fn(),
}));

const createWrapper = (props = {}) =>
  mount(TablePopover, {
    props,
    global: {
      stubs: { Popover: PopoverStub, DropIcon: DropIconStub },
      mocks: { $t: (key: string) => key },
    },
  });

describe('TablePopover', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders nothing visible when no data is provided', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.popover-button').exists()).toBe(false);
  });

  it('renders text mode when data prop has entries', () => {
    const wrapper = createWrapper({ data: [{ title: 'Cairo' }, { title: 'Giza' }] });
    expect(wrapper.find('.popover-button').exists()).toBe(true);
    expect(wrapper.find('.tag-blue').exists()).toBe(true);
  });

  it('shows count badge when more than 1 location', () => {
    const wrapper = createWrapper({ data: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] });
    const badge = wrapper.find('.tag-more');
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe('2'); // length - 1
  });

  it('does not show count badge when only 1 location', () => {
    const wrapper = createWrapper({ data: [{ title: 'Cairo' }] });
    expect(wrapper.find('.tag-more').exists()).toBe(false);
  });

  it('renders image mode when data_img is provided without data', () => {
    const wrapper = createWrapper({
      data_img: [
        { name: 'Alice', avatar: '/alice.png' },
        { name: 'Bob', avatar: '/bob.png' },
      ],
    });
    const imgs = wrapper.findAll('img.avatar');
    expect(imgs).toHaveLength(2);
  });

  it('shows +N badge when more than 3 avatars', () => {
    const wrapper = createWrapper({
      data_img: [
        { name: 'A', avatar: '/a.png' },
        { name: 'B', avatar: '/b.png' },
        { name: 'C', avatar: '/c.png' },
        { name: 'D', avatar: '/d.png' },
      ],
    });
    expect(wrapper.find('.avatar-more').text()).toContain('+1');
  });

  it('renders popover content with location titles', () => {
    const wrapper = createWrapper({ data: [{ title: 'Cairo' }, { title: 'Alex' }] });
    const popoverContent = wrapper.find('.popover-content');
    expect(popoverContent.exists()).toBe(true);
  });

  it('uses loc.name as fallback when title is missing', () => {
    const wrapper = createWrapper({ data: [{ name: 'Fallback City' }] });
    expect(wrapper.find('.tag-blue').exists()).toBe(true);
  });
});
