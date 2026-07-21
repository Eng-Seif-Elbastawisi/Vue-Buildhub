import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import PricePercentageModel from '../../../core/models/price.percentage.model';
import type UpdatePricePercentagesParams from '../../../core/params/update.price.percentages.params';
import PricePercentageSettings from '../PricePercentageSettings.vue';

const mockController = vi.hoisted(() => ({
  resetItem: vi.fn(),
  showPercentages: vi.fn(),
  updatePercentages: vi.fn(),
  itemData: { value: undefined as unknown },
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
    mockController.showPercentages.mockReset();
    mockController.updatePercentages.mockReset();
    mockController.itemData.value = new PricePercentageModel([
      { title: 'Tax', percentage: 15 },
      { title: 'Service', percentage: 85 },
    ]);
    mockController.errorMessage.value = '';
  });

  it('loads existing rows and lets users add and remove entries', async () => {
    const wrapper = mountSettings();
    await flushPromises();

    expect(mockController.showPercentages).toHaveBeenCalledOnce();
    expect(mockController.showPercentages.mock.calls[0][0].toMap()).toEqual({ project_id: 24 });
    expect(wrapper.findAll('.percentage-row')).toHaveLength(2);
    expect(wrapper.find('.total-summary').text()).toContain('100 / 100%');

    const percentageInput = wrapper.find('.percentage-input');
    expect(percentageInput.attributes('min')).toBe('1');
    expect(percentageInput.attributes('max')).toBe('100');

    await wrapper.find('.add-row-button').trigger('click');
    expect(wrapper.findAll('.percentage-row')).toHaveLength(3);

    await wrapper.findAll('.remove-row-button')[2].trigger('click');
    expect(wrapper.findAll('.percentage-row')).toHaveLength(2);
  });

  it('starts with one editable row when no percentages exist', async () => {
    mockController.itemData.value = new PricePercentageModel([]);

    const wrapper = mountSettings();
    await flushPromises();

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

  it('submits all rows as the percentages array', async () => {
    mockController.itemData.value = new PricePercentageModel([{ title: 'Tax', percentage: 100 }]);
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
      percentages: [{ title: 'Updated tax', percentage: 100 }],
    });
    expect(wrapper.text()).toContain('price_percentage.updated');
  });

  it('does not submit when the total is not 100', async () => {
    mockController.itemData.value = new PricePercentageModel([{ title: 'Tax', percentage: 100 }]);
    const wrapper = mountSettings();
    await flushPromises();

    await wrapper.find('.percentage-input').setValue('99');
    await wrapper.find('.save-button').trigger('click');
    await flushPromises();

    expect(wrapper.find('.total-summary').text()).toContain('99 / 100%');
    expect(mockController.updatePercentages).not.toHaveBeenCalled();
  });
});
