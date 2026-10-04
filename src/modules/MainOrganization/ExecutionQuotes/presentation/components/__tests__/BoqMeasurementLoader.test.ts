import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import BoqMeasurementLoader from '../BoqMeasurementLoader.vue';

describe('BoqMeasurementLoader', () => {
  it('announces loading and renders four quotation placeholder rows without mock values', () => {
    const wrapper = mount(BoqMeasurementLoader, {
      global: {
        mocks: {
          $t: () => 'Preparing quotation...',
        },
      },
    });

    expect(wrapper.attributes('role')).toBe('status');
    expect(wrapper.attributes('aria-busy')).toBe('true');
    expect(wrapper.text()).toBe('Preparing quotation...');
    expect(wrapper.findAll('.boq-measurement-loader__row')).toHaveLength(5);
    expect(
      wrapper.findAll('.boq-measurement-loader__row:not(.boq-measurement-loader__row--header)'),
    ).toHaveLength(4);
    expect(
      wrapper.findAll('.boq-measurement-loader__row--header .boq-measurement-loader__block'),
    ).toHaveLength(5);
    expect(wrapper.find('.boq-measurement-loader__sweep').exists()).toBe(true);
    expect(wrapper.find('.boq-measurement-loader__block--total').exists()).toBe(true);
  });
});
