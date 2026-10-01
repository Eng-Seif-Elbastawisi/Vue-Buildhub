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
  it('shows each term title in bold with its description underneath', () => {
    const wrapper = mountGallery();
    const cards = wrapper.findAll('button');

    expect(cards).toHaveLength(2);
    expect(cards[0]?.find('strong').text()).toBe('Payment');
    expect(cards[0]?.find('.term-gallery__content span').text()).toBe('Pay within 30 days');
  });

  it('marks selected terms and removes them when selected again', async () => {
    const wrapper = mountGallery([1]);
    const selectedCard = wrapper.find('button[aria-pressed="true"]');

    expect(selectedCard.attributes('aria-pressed')).toBe('true');
    await selectedCard.trigger('click');

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([]);
  });

  it('adds a term while preserving the existing selection', async () => {
    const wrapper = mountGallery([1]);

    await wrapper.findAll('button')[1]?.trigger('click');

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([
      expect.objectContaining({ id: 1, title: 'Payment' }),
      expect.objectContaining({ id: 2, title: 'Delivery' }),
    ]);
  });
});
