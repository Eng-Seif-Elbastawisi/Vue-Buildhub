import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ExecutionQuoteItemSourceEnum } from '../../../../core/constants/execution.quote.item.source.enum';
import ProductsModel from '@/modules/MainOrganization/Products/core/models/products.model';
import MaterialsModel from '@/modules/shared/Materials/core/models/materials.model';
import { UnitTypeEnum } from '@/modules/shared/Materials/core/constant/unit.type.enum';
import MeasurementModel from '@/modules/shared/measurement/core/models/measurement.model';
import ExecutionQuoteItemForm from '../ExecutionQuoteItemForm.vue';

const { productsController, materialController, emptyController } = vi.hoisted(() => ({
  productsController: {
    listData: { value: [] as ProductsModel[] },
    fetchAsOptions: vi.fn().mockResolvedValue([]),
    isListFailed: vi.fn().mockReturnValue(false),
    isListSuccess: vi.fn().mockReturnValue(true),
  },
  materialController: {
    listData: { value: [] as MaterialsModel[] },
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
  default: { getInstance: () => materialController },
}));
vi.mock('@/modules/MainOrganization/Labors/presentation/controllers/labor.controller', () => ({
  default: { getInstance: () => emptyController },
}));

const SelectStub = {
  name: 'UpdatedCustomInputSelect',
  props: ['id', 'label', 'modelValue', 'staticOptions', 'params'],
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
      <button
        v-if="id === 'execution-quote-material'"
        class="choose-material"
        @click="$emit('update:modelValue', { id: 20, title: 'Cement' })"
      />
    </div>
  `,
};

describe('ExecutionQuoteItemForm', () => {
  beforeEach(() => {
    productsController.listData.value = [
      new ProductsModel({
        id: 10,
        title: 'Concrete block',
        itemTypeTitle: 'Product',
        measurementUnitId: 9,
        measurementUnitTitle: 'Piece',
        expectedPrice: 12,
        sortings: [{ id: 5, title: 'Premium', price: 20 }],
        status: true,
      }),
    ];
    materialController.listData.value = [
      new MaterialsModel({
        id: 20,
        title: 'Cement',
        translations: { title: { en: 'Cement', ar: 'أسمنت' } },
        unit: UnitTypeEnum.bag,
        measurementUnit: new MeasurementModel({ id: 12, title: 'Bag' }),
        price: 15,
        status: true,
      }),
    ];
  });

  it('requests only active products, materials and labor', () => {
    const sources = [
      ExecutionQuoteItemSourceEnum.PRODUCT,
      ExecutionQuoteItemSourceEnum.BUILDING_MATERIAL,
      ExecutionQuoteItemSourceEnum.LABOR,
    ];

    sources.forEach((source) => {
      const wrapper = mount(ExecutionQuoteItemForm, {
        props: { source, subStageId: 7 },
        global: {
          mocks: { $t: (key: string) => key },
          stubs: { UpdatedCustomInputSelect: SelectStub, FieldHelpIcon: true },
        },
      });
      const sourceSelect = wrapper.findAllComponents(SelectStub)[0];

      expect(sourceSelect.props('params').toMap()).toMatchObject({ status: 1 });
    });
  });

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
      unit_id: 9,
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
      unit_id: 9,
      unit_price: 0,
    });
  });

  it('adds the measurement unit CRUD id for a building material', async () => {
    const wrapper = mount(ExecutionQuoteItemForm, {
      props: {
        source: ExecutionQuoteItemSourceEnum.BUILDING_MATERIAL,
        subStageId: 7,
      },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { UpdatedCustomInputSelect: SelectStub, FieldHelpIcon: true },
      },
    });

    await wrapper.get('.choose-material').trigger('click');
    await wrapper.get('.add-item-button').trigger('click');

    expect(wrapper.emitted('add')?.[0]?.[0]).toMatchObject({
      source_id: 20,
      unit_id: 12,
      unit_name: 'Bag',
    });
  });

  it('hydrates and updates an item selected for editing', async () => {
    const wrapper = mount(ExecutionQuoteItemForm, {
      props: {
        source: ExecutionQuoteItemSourceEnum.PRODUCT,
        subStageId: 7,
        editingItem: {
          id: 'item-1',
          stage_id: 1,
          sub_stage_id: 7,
          source_type: ExecutionQuoteItemSourceEnum.PRODUCT,
          source_id: '99',
          sorting_id: 5,
          source_title: 'Custom product',
          unit_name: 'Box',
          unit_id: 15,
          sorting_title: 'Premium',
          quantity: 4,
          unit_price: 18,
        },
      },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { UpdatedCustomInputSelect: SelectStub, FieldHelpIcon: true },
      },
    });

    expect(wrapper.get<HTMLInputElement>('#execution-quote-item-quantity').element.value).toBe('4');
    expect(wrapper.get<HTMLInputElement>('#execution-quote-item-unit-price').element.value).toBe(
      '18',
    );
    expect(wrapper.text()).toContain('execution_quote.update_item');

    await wrapper.get('#execution-quote-item-quantity').setValue('6');
    await wrapper.get('.add-item-button').trigger('click');

    expect(wrapper.emitted('add')?.[0]?.[0]).toMatchObject({
      source_id: 99,
      sorting_id: 5,
      quantity: 6,
      unit_price: 18,
      unit_id: 15,
      unit_name: 'Box',
      sorting_title: 'Premium',
    });
  });
});
