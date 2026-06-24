import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import CountryCard from '../CountryCard.vue';
import CountryModel from '@/modules/country/core/models/country.model';

describe('CountryCard.vue', () => {
  const dummyCountry = new CountryModel({
    id: 1,
    title: 'Egypt',
    code: 'eg',
    flag: '/flag.png',
  });

  it('renders country info properly', () => {
    const wrapper = mount(CountryCard, {
      props: {
        country: dummyCountry,
        selectedCountryId: 2,
      },
      global: {
        stubs: {
          IconCheck: true,
        },
      },
    });

    const button = wrapper.find('button.country-card');
    expect(button.find('span.title').text()).toBe('Egypt');
    expect(button.find('img.flag').attributes('src')).toBe('/flag.png');
    expect(button.classes()).not.toContain('active');
  });

  it('adds active class and check icon when selected', () => {
    const wrapper = mount(CountryCard, {
      props: {
        country: dummyCountry,
        selectedCountryId: 1, // Matches dummyCountry.id
      },
      global: {
        stubs: {
          IconCheck: true,
        },
      },
    });

    const button = wrapper.find('button.country-card');
    expect(button.classes()).toContain('active');
    expect(button.findComponent({ name: 'IconCheck' }).exists()).toBe(true);
  });

  it('emits select-country on click', async () => {
    const wrapper = mount(CountryCard, {
      props: {
        country: dummyCountry,
        selectedCountryId: 2,
      },
      global: {
        stubs: {
          IconCheck: true,
        },
      },
    });

    const button = wrapper.find('button.country-card');
    await button.trigger('click');
    expect(wrapper.emitted('select-country')).toBeTruthy();
    expect(wrapper.emitted('select-country')![0]).toEqual([dummyCountry]);
  });
});
