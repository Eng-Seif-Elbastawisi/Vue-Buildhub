import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import TitleInterface from '@/base/Data/Models/titleInterface';
import TermModel from '@/modules/MainOrganization/Term/core/models/term.model';

import ProjectTermGallery from '../ProjectTermGallery.vue';

const terms = [
  new TermModel({ id: 1, title: 'Payment', description: 'Pay within 30 days' }),
  new TermModel({ id: 2, title: 'Delivery', description: 'Delivery within Cairo' }),
];

const mountGallery = (selectedIds: number[] = []) =>
  mount(ProjectTermGallery, {
    props: {
      options: terms,
      modelValue: selectedIds.map(
        (id) =>
          new TitleInterface<number>({
            id,
            title: terms.find((term) => term.id === id)?.title,
          }),
      ),
    },
    global: {
      mocks: {
        $t: (key: string) => key,
      },
    },
  });

describe('ProjectTermGallery', () => {
  it('shows only selected terms with a bold title and description', () => {
    const wrapper = mountGallery([1]);
    const cards = wrapper.findAll('.term-gallery__card');

    expect(cards).toHaveLength(1);
    expect(cards[0]?.find('strong').text()).toBe('Payment');
    expect(cards[0]?.find('.term-gallery__content span').text()).toBe('Pay within 30 days');
    expect(wrapper.text()).not.toContain('Delivery');
  });

  it('removes a selected term from the gallery result', async () => {
    const wrapper = mountGallery([1, 2]);

    await wrapper.findAll('.term-gallery__remove')[0]?.trigger('click');

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([
      expect.objectContaining({ id: 2, title: 'Delivery' }),
    ]);
  });

  it('shows guidance when no terms are selected', () => {
    const wrapper = mountGallery();

    expect(wrapper.find('.term-gallery__empty').exists()).toBe(true);
    expect(wrapper.findAll('.term-gallery__card')).toHaveLength(0);
  });
});
