import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import { ExecutionQuoteItemSourceEnum } from '../../../../core/constants/execution.quote.item.source.enum';
import ExecutionQuoteItemForm from '../ExecutionQuoteItemForm.vue';

const { productsController, emptyController } = vi.hoisted(() => ({
  productsController: {
    listData: {
      value: [
        {
          id: 10,
          title: 'Concrete block',
          item_type: { title: 'Product' },
          measurement_unit: { title: 'Piece' },
          expected_price: 12,
          has_sorting: true,
          sortings: [{ id: 5, title: 'Premium', price: 20 }],
        },
      ],
    },
    fetchAsOptions: vi.fn().mockResolvedValue([]),
    isListFailed: vi.fn().mockReturnValue(false),
    isListSuccess: vi.fn().mockReturnValue(true),
  },
  emptyController: {
    listData: { value: [] },
    fetchAsOptions: vi.fn().mockResolvedValue([]),
    isListFailed: vi.fn().mockReturnValue(false),
    isListSuccess: vi.fn().mockReturnValue(true),
  },
}));

vi.mock('@/modules/MainOrganization/Products/presentation/controllers/products.controller', () => ({
  default: { getInstance: () => productsController },
}));
vi.mock('@/modules/shared/Materials/presentation/controllers/materials.controller', () => ({
  default: { getInstance: () => emptyController },
}));
vi.mock('@/modules/MainOrganization/Labors/presentation/controllers/labor.controller', () => ({
  default: { getInstance: () => emptyController },
}));

const SelectStub = {
  name: 'UpdatedCustomInputSelect',
  props: ['id', 'label', 'modelValue', 'staticOptions'],
  emits: ['update:modelValue'],
  template: `
    <div class="select-stub" :data-id="id">
      <span>{{ label }}</span>
      <button
        v-if="id === 'execution-quote-product'"
        class="choose-product"
        @click="$emit('update:modelValue', { id: 10, title: 'Concrete block' })"
      />
      <button
        v-if="id === 'execution-quote-product-sorting'"
        class="choose-sorting"
        @click="$emit('update:modelValue', staticOptions[0])"
      />
    </div>
  `,
};

describe('ExecutionQuoteItemForm', () => {
  it('places read-only labels outside their bordered controls', () => {
    const wrapper = mount(ExecutionQuoteItemForm, {
      props: {
        source: ExecutionQuoteItemSourceEnum.PRODUCT,
        subStageId: 7,
      },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          UpdatedCustomInputSelect: SelectStub,
          FieldHelpIcon: true,
        },
      },
    });

    const displayFields = wrapper.findAll('.item-display-field');

    expect(displayFields).toHaveLength(2);
    expect(
      displayFields.every(
        (field) =>
          field.element.firstElementChild?.classList.contains('item-field-label') &&
          field.element.lastElementChild?.classList.contains('item-display-control'),
      ),
    ).toBe(true);
  });

  it('uses product sorting terminology and emits the selected sorting id', async () => {
    const wrapper = mount(ExecutionQuoteItemForm, {
      props: {
        source: ExecutionQuoteItemSourceEnum.PRODUCT,
        subStageId: 7,
      },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          UpdatedCustomInputSelect: SelectStub,
          FieldHelpIcon: true,
        },
      },
    });

    expect(wrapper.text()).toContain('execution_quote.item_fields.sorting');
    expect(wrapper.text()).not.toContain('execution_quote.item_fields.grade');
    expect(wrapper.text()).toContain('execution_quote.item_guidance.choose_item');

    await wrapper.get('.choose-product').trigger('click');
    expect(wrapper.text()).toContain('execution_quote.item_guidance.choose_sorting');

    await wrapper.get('.choose-sorting').trigger('click');
    expect(wrapper.text()).toContain('execution_quote.item_guidance.ready');
    expect(wrapper.get('.section-title__badge').text()).toBe('execution_quote.ready_to_add');
    expect(wrapper.get('.add-item-button').attributes('disabled')).toBeUndefined();

    await wrapper.get('.add-item-button').trigger('click');

    expect(wrapper.emitted('add')?.[0]?.[0]).toMatchObject({
      source_id: 10,
      sorting_id: 5,
      unit_price: 20,
    });
  });

  it('adds supervision items without displaying or emitting a price', async () => {
    const wrapper = mount(ExecutionQuoteItemForm, {
      props: {
        source: ExecutionQuoteItemSourceEnum.PRODUCT,
        subStageId: 7,
        pricingEnabled: false,
      },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          UpdatedCustomInputSelect: SelectStub,
          FieldHelpIcon: true,
        },
      },
    });

    expect(wrapper.find('#execution-quote-item-unit-price').exists()).toBe(false);
    expect(wrapper.text()).toContain('execution_quote.item_guidance.choose_item_without_pricing');

    await wrapper.get('.choose-product').trigger('click');
    await wrapper.get('.choose-sorting').trigger('click');
    await wrapper.get('.add-item-button').trigger('click');

    expect(wrapper.emitted('add')?.[0]?.[0]).toMatchObject({
      source_id: 10,
      sorting_id: 5,
      quantity: 1,
      unit_price: 0,
    });
  });
});
