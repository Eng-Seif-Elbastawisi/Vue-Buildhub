import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import PricePercentageModel from '../../../core/models/price.percentage.model';
import type UpdatePricePercentagesParams from '../../../core/params/update.price.percentages.params';
import PricePercentageSettings from '../PricePercentageSettings.vue';

const mockController = vi.hoisted(() => ({
  resetItem: vi.fn(),
  updatePercentages: vi.fn(),
  errorMessage: { value: '' },
}));

vi.mock('../../controllers/price.percentage.controller', () => ({
  default: {
    getInstance: () => mockController,
  },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { project_id: '24' } }),
}));

const AppButtonStub = {
  props: ['disabled', 'loading'],
  emits: ['click'],
  template:
    '<button type="button" :disabled="disabled || loading" @click="$emit(\'click\', $event)"><slot /></button>',
};

const mountSettings = () =>
  mount(PricePercentageSettings, {
    global: {
      stubs: { AppButton: AppButtonStub },
      mocks: { $t: (key: string) => key },
    },
  });

describe('PricePercentageSettings', () => {
  beforeEach(() => {
    mockController.resetItem.mockReset();
    mockController.updatePercentages.mockReset();
    mockController.errorMessage.value = '';
  });

  it('starts with one row and lets users add and remove entries', async () => {
    const wrapper = mountSettings();
    await flushPromises();

    expect(wrapper.findAll('.percentage-row')).toHaveLength(1);
    expect(wrapper.find('.total-summary').text()).toContain('0 / 100%');

    const percentageInput = wrapper.find('.percentage-input');
    expect(percentageInput.attributes('min')).toBe('1');
    expect(percentageInput.attributes('max')).toBe('100');

    await wrapper.find('.add-row-button').trigger('click');
    expect(wrapper.findAll('.percentage-row')).toHaveLength(2);

    await wrapper.findAll('.remove-row-button')[1].trigger('click');
    expect(wrapper.findAll('.percentage-row')).toHaveLength(1);
  });

  it('allows numbers and blocks text in percentage inputs', async () => {
    const wrapper = mountSettings();
    await flushPromises();
    const percentageInput = wrapper.find<HTMLInputElement>('.percentage-input');

    for (const key of ['e', 'E', '+', '-', 'a', 'Z', '%', ' ']) {
      const keydownEvent = new KeyboardEvent('keydown', { key, cancelable: true });

      percentageInput.element.dispatchEvent(keydownEvent);

      expect(keydownEvent.defaultPrevented).toBe(true);
    }

    for (const key of ['5', '.', 'Backspace', 'ArrowLeft']) {
      const keydownEvent = new KeyboardEvent('keydown', { key, cancelable: true });

      percentageInput.element.dispatchEvent(keydownEvent);

      expect(keydownEvent.defaultPrevented).toBe(false);
    }

    for (const [pastedText, shouldBePrevented] of [
      ['12.5', false],
      ['hello', true],
      ['12e2', true],
      ['.', true],
    ] as const) {
      const pasteEvent = new Event('paste', { bubbles: true, cancelable: true });
      Object.defineProperty(pasteEvent, 'clipboardData', {
        value: { getData: () => pastedText },
      });

      percentageInput.element.dispatchEvent(pasteEvent);

      expect(pasteEvent.defaultPrevented).toBe(shouldBePrevented);
    }
  });

  it('submits all rows as invoice offers', async () => {
    mockController.updatePercentages.mockResolvedValue(
      new DataSuccess({ data: PricePercentageModel.example }),
    );
    const wrapper = mountSettings();
    await flushPromises();

    await wrapper.find('.title-input').setValue('Updated tax');
    await wrapper.find('.percentage-input').setValue('100');
    await wrapper.find('.save-button').trigger('click');
    await flushPromises();

    const params = mockController.updatePercentages.mock
      .calls[0][0] as UpdatePricePercentagesParams;
    expect(params.toMap()).toEqual({
      project_id: 24,
      invoices: [{ title: 'Updated tax', percentage: 100 }],
    });
    expect(wrapper.text()).toContain('price_percentage.updated');
  });

  it('does not submit when the total is not 100', async () => {
    const wrapper = mountSettings();
    await flushPromises();

    await wrapper.find('.title-input').setValue('Tax');
    await wrapper.find('.percentage-input').setValue('99');
    await wrapper.find('.save-button').trigger('click');
    await flushPromises();

    expect(wrapper.find('.total-summary').text()).toContain('99 / 100%');
    expect(mockController.updatePercentages).not.toHaveBeenCalled();
  });
});
