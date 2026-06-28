import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import MultiImagesDialog from '../MultiImagesDialog.vue';

const globalConfig = {
  mocks: {
    $t: (key: string) => key,
  },
  stubs: {
    Dialog: {
      template: '<div><slot name="header" /><slot /></div>',
    },
    Galleria: {
      props: ['value'],
      template:
        '<div><slot name="item" :item="value[0]" /><slot name="thumbnail" :item="value[0]" /></div>',
    },
  },
};

describe('MultiImagesDialog', () => {
  it('renders the trigger slot', () => {
    const wrapper = mount(MultiImagesDialog, {
      props: { images: ['image-one.png'] },
      slots: { default: 'Open gallery' },
      global: globalConfig,
    });

    expect(wrapper.text()).toContain('Open gallery');
  });

  it('uses translated alt text for gallery images', () => {
    const wrapper = mount(MultiImagesDialog, {
      props: { images: ['image-one.png'] },
      global: globalConfig,
    });

    const images = wrapper.findAll('img');
    expect(images).toHaveLength(2);
    expect(images.every((image) => image.attributes('alt') === 'image')).toBe(true);
  });
});
