import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemStatusEnum } from '../../../core/constant/item.status.enum';
import { ItemTypeEnum } from '../../../core/constant/item.type.enum copy';
import ItemShowModel from '../../../core/models/Item.show.model';
import AddItemParams from '../../../core/params/add.Item.params';
import ItemForm from '../ItemForm.vue';

const route = vi.hoisted(() => ({ query: {} }));

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    onBeforeRouteLeave: vi.fn(),
    useRoute: () => route,
  };
});

const MultiLangInputStub = {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template:
    "<button class=\"translation-input\" @click=\"$emit('update:modelValue', { en: 'Item', ar: 'Item AR' })\">translate</button>",
};

const SelectStub = {
  props: ['id', 'params'],
  emits: ['update:modelValue'],
  template:
    '<button :class="id" :data-params="stringifyParams(params)" @click="$emit(\'update:modelValue\', optionFor(id))">select</button>',
  methods: {
    optionFor(id: string) {
      const options: Record<string, { id: number; title: string }> = {
        'item-type': { id: ItemTypeEnum.MATERIAL, title: 'MATERIAL' },
        'item-status': { id: ItemStatusEnum.MAIN, title: 'MAIN' },
        'item-department': { id: 11, title: 'Department' },
        'item-stage': { id: 12, title: 'Stage' },
        'item-measurement': { id: 13, title: 'Measurement' },
      };
      return options[id];
    },
    stringifyParams(params?: { toMap: () => Record<string, unknown> }) {
      return JSON.stringify(params?.toMap() ?? {});
    },
  },
};

const filterScenarios = [
  {
    selectClass: '.item-stage',
    filteredClass: '.item-department',
    expectedParams: { stage_id: 12 },
  },
  {
    selectClass: '.item-department',
    filteredClass: '.item-stage',
    expectedParams: { department_id: 11 },
  },
] as const;

describe('ItemForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    route.query = { service_type: '2' };
  });

  it('emits complete item params from form inputs', async () => {
    const wrapper = mount(ItemForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { MultiLangInput: MultiLangInputStub, UpdatedCustomInputSelect: SelectStub },
      },
    });

    await wrapper.find('.translation-input').trigger('click');
    await wrapper.find<HTMLInputElement>('#item-price').setValue('250');
    await wrapper.find('.item-type').trigger('click');
    await wrapper.find('.item-status').trigger('click');
    await wrapper.find('.item-stage').trigger('click');
    await wrapper.find('.item-department').trigger('click');
    await wrapper.find('.item-measurement').trigger('click');
    await wrapper.find<HTMLTextAreaElement>('#item-notes').setValue('Some notes');

    const emissions = wrapper.emitted('updateData') as unknown[][];
    const params = emissions.at(-1)?.[0] as AddItemParams;

    expect(params.toMap()).toEqual({
      type: ItemTypeEnum.MATERIAL,
      status: ItemStatusEnum.MAIN,
      stage_id: 12,
      department_id: 11,
      measurement_unit_id: 13,
      price: 250,
      notes: 'Some notes',
      translations: { title: { en: 'Item', ar: 'Item AR' } },
    });
  });

  it.each(filterScenarios)(
    'filters $filteredClass options after selecting $selectClass',
    async ({ selectClass, filteredClass, expectedParams }) => {
      const wrapper = mount(ItemForm, {
        global: {
          mocks: { $t: (key: string) => key },
          stubs: { MultiLangInput: MultiLangInputStub, UpdatedCustomInputSelect: SelectStub },
        },
      });

      await wrapper.find(selectClass).trigger('click');

      const filteredParams = JSON.parse(
        wrapper.find(filteredClass).attributes('data-params') ?? '{}',
      );

      expect(filteredParams).toMatchObject(expectedParams);
    },
  );

  it('prefills values from an existing item', () => {
    const wrapper = mount(ItemForm, {
      props: { item: ItemShowModel.example, loading: true },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { MultiLangInput: MultiLangInputStub, UpdatedCustomInputSelect: SelectStub },
      },
    });

    expect(wrapper.find<HTMLInputElement>('#item-price').element.value).toBe(
      String(ItemShowModel.example.price),
    );
    expect(wrapper.find('.form-fields.disabled').exists()).toBe(true);
    expect(wrapper.emitted('updateData')?.[0]?.[0]).toBeInstanceOf(AddItemParams);
  });
});
