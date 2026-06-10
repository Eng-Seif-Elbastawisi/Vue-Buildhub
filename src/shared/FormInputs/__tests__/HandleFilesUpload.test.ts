import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import HandleFilesUpload from '../HandleFilesUpload.vue';

const createWrapper = (props = {}) =>
  mount(HandleFilesUpload, {
    props: {
      label: 'Upload Files',
      ...props,
    },
    global: {
      mocks: { $t: (key: string) => key },
    },
  });

describe('HandleFilesUpload', () => {
  it('renders without crashing', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it('renders a file input element', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('input[type="file"]').exists()).toBe(true);
  });

  it('accepts files based on accept prop', () => {
    const wrapper = createWrapper({ accept: 'image/*' });
    const input = wrapper.find('input[type="file"]');
    expect(input.attributes('accept')).toBe('image/*');
  });

  it('does not have multiple attribute by default', () => {
    const wrapper = createWrapper();
    const input = wrapper.find('input[type="file"]');
    expect(input.element.multiple).toBe(false);
  });

  it('has multiple attribute when multiple prop is true', () => {
    const wrapper = createWrapper({ multiple: true });
    const input = wrapper.find('input[type="file"]');
    expect(input.element.multiple).toBe(true);
  });

  it('shows default upload text when max files not reached', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.upload-text').text()).toBe('Click to upload');
  });

  it('shows max files reached text when limit is hit', () => {
    const wrapper = createWrapper({ maxFiles: 0 });
    expect(wrapper.find('.upload-text').text()).toBe('Max 0 files reached');
  });

  it('renders with initial file from url', async () => {
    const wrapper = mount(HandleFilesUpload, {
      props: {
        file: 'http://example.com/test.jpg',
      },
      global: {
        mocks: { $t: (key: string) => key },
      },
    });

    // The component uses onMounted to process preloaded files
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.preview-grid').exists()).toBe(true);
    expect(wrapper.findAll('.preview-item')).toHaveLength(1);
  });

  it('renders multiple initial files', async () => {
    const wrapper = mount(HandleFilesUpload, {
      props: {
        file: ['img1.jpg', 'img2.jpg'],
        multiple: true,
      },
      global: {
        mocks: { $t: (key: string) => key },
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.findAll('.preview-item')).toHaveLength(2);
  });

  it('emits change event when a file is removed', async () => {
    const wrapper = mount(HandleFilesUpload, {
      props: {
        file: 'test.jpg',
      },
      global: {
        mocks: { $t: (key: string) => key },
      },
    });

    await wrapper.vm.$nextTick();

    const removeBtn = wrapper.find('.remove-btn');
    await removeBtn.trigger('click');

    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0][0]).toEqual([]);
  });

  it('updates files dynamically when file prop changes', async () => {
    const wrapper = mount(HandleFilesUpload, {
      props: {
        file: '',
      },
      global: {
        mocks: { $t: (key: string) => key },
      },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.find('.preview-grid').exists()).toBe(false);

    await wrapper.setProps({ file: 'http://example.com/dynamic.jpg' });
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.preview-grid').exists()).toBe(true);
    expect(wrapper.findAll('.preview-item')).toHaveLength(1);
    expect(wrapper.find('.preview-filename').text()).toBe('dynamic.jpg');
  });
});
