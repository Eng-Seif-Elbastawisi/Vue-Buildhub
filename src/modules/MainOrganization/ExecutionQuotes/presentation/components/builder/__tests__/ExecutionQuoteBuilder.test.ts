import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import StageModel from '@/modules/shared/Stages/core/models/stage.model';

import { ExecutionQuoteItemSourceEnum } from '../../../../core/constants/execution.quote.item.source.enum';
import { ExecutionQuoteTypeEnum } from '../../../../core/constants/execution.quote.type.enum';
import type ExecutionQuoteStageModel from '../../../../core/models/execution.quote.stage.model';
import type StoreExecutionQuoteDetailsParams from '../../../../core/params/store.execution.quote.details.params';
import type { ExecutionQuoteStagePricingDraft } from '../../../../core/params/set.execution.quote.stage.pricing.params';
import ExecutionQuoteBuilder from '../ExecutionQuoteBuilder.vue';

const { confirm, fetchList, push, routeParams } = vi.hoisted(() => ({
  confirm: vi.fn(),
  fetchList: vi.fn(),
  push: vi.fn().mockResolvedValue(undefined),
  routeParams: { stageId: '1' as string | undefined },
}));

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: { confirm },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: routeParams }),
  useRouter: () => ({ push }),
  createRouter: vi.fn(() => ({ push, beforeEach: vi.fn() })),
  createWebHistory: vi.fn(),
}));

vi.mock('@/modules/shared/Stages/presentation/controllers/stage.controller', () => ({
  default: { getInstance: () => ({ fetchList }) },
}));

const componentStubs = {
  ExecutionQuoteTypeCards: {
    props: ['disabled'],
    template: '<button class="quote-type-options" :disabled="disabled" />',
  },
  ExecutionQuoteMainStages: {
    props: ['stages', 'showPricing'],
    emits: ['open'],
    template: '<button class="open-stage" @click="$emit(\'open\', stages[0])" />',
  },
  ExecutionQuoteStageHeader: {
    emits: ['back'],
    template: '<button class="close-stage" @click="$emit(\'back\')" />',
  },
  ExecutionQuoteSubStages: {
    emits: ['update:modelValue'],
    template: '<button class="select-sub-stage" @click="$emit(\'update:modelValue\', 11)" />',
  },
  ExecutionQuoteItemSourceCards: {
    props: ['pricingEnabled'],
    emits: ['update:modelValue'],
    template: `<button class="select-source" @click="$emit('update:modelValue', ${ExecutionQuoteItemSourceEnum.PRODUCT})" />`,
  },
  ExecutionQuoteItemForm: {
    props: ['pricingEnabled', 'editingItem'],
    emits: ['add', 'cancel-edit'],
    template: `
      <div
        class="item-form-stub"
        :data-pricing-enabled="pricingEnabled"
        :data-editing-item="editingItem?.id"
      >
        <button
          class="add-item"
          @click="$emit('add', editingItem
            ? { source_id: 44, sorting_id: 55, quantity: 3, unit_price: 7, unit_id: 12, unit_name: 'Box' }
            : { source_id: 22, sorting_id: 33, quantity: 2, unit_price: 5, unit_id: 9, unit_name: 'Piece' })"
        />
      </div>
    `,
  },
  ExecutionQuoteStageClientPrice: {
    name: 'ExecutionQuoteStageClientPrice',
    props: ['modelValue', 'disabled'],
    emits: ['update:modelValue'],
    template: `
      <button
        class="client-price-stub"
        :data-client-price="modelValue"
        :data-disabled="disabled"
        :disabled="disabled"
        @click="$emit('update:modelValue', 4200)"
      />
    `,
  },
  ExecutionQuoteItemsTable: {
    name: 'ExecutionQuoteItemsTable',
    props: ['items', 'showPricing'],
    emits: ['edit', 'remove'],
    template: `
      <div
        class="items-table-stub"
        :data-items-count="items.length"
        :data-show-pricing="showPricing"
      >
        <button v-if="items.length" class="edit-first-item" @click="$emit('edit', items[0])" />
        <button v-if="items.length" class="remove-first-item" @click="$emit('remove', items[0])" />
      </div>
    `,
  },
  ExecutionQuoteTotals: { template: '<div class="totals-stub" />' },
};

interface BuilderMountOptions {
  modelValue?: (typeof ExecutionQuoteTypeEnum)[keyof typeof ExecutionQuoteTypeEnum] | null;
  initialStages?: ExecutionQuoteStageModel[];
  stubs?: Record<string, unknown>;
}

const mountBuilder = (options: BuilderMountOptions = {}) =>
  mount(ExecutionQuoteBuilder, {
    props: {
      enabled: true,
      modelValue:
        options.modelValue === undefined ? ExecutionQuoteTypeEnum.LUMP_SUM : options.modelValue,
      executionQuoteId: 28,
      initialStages: options.initialStages ?? [],
    },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: options.stubs ?? componentStubs,
    },
  });

describe('ExecutionQuoteBuilder', () => {
  beforeEach(() => {
    routeParams.stageId = '1';
    fetchList.mockReset();
    push.mockReset().mockResolvedValue(undefined);
    confirm.mockReset();
  });

  it('locks the quote type options on the saved quote stages page', async () => {
    fetchList.mockResolvedValueOnce(new DataSuccess({ data: [] }));

    const wrapper = mountBuilder({
      stubs: { ...componentStubs, ExecutionQuoteTypeCards: false },
    });
    await flushPromises();

    const quoteTypeOptions = wrapper.findAll<HTMLButtonElement>('.quote-type-option');
    expect(quoteTypeOptions).toHaveLength(2);
    expect(quoteTypeOptions.every((option) => option.element.disabled)).toBe(true);
  });

  it('hydrates items without a sub-stage and activates a direct stage route', async () => {
    routeParams.stageId = '152';
    fetchList.mockResolvedValue(new DataSuccess({ data: [] }));
    const wrapper = mountBuilder({ modelValue: null });

    await wrapper.setProps({
      modelValue: ExecutionQuoteTypeEnum.SUPERVISION,
      initialStages: [
        {
          id: 43,
          stageId: 152,
          stage: { id: 152, title: 'Electrical stage' },
          items: [
            {
              id: 118,
              itemType: ExecutionQuoteItemSourceEnum.BUILDING_MATERIAL,
              itemableId: 39,
              itemable: { id: 39, title: 'Cable' },
              quantity: 1,
              expectedPrice: 1000,
              unitId: 165,
              measurementUnit: { id: 165, title: 'Square kilometer' },
            },
          ],
        },
      ],
    });
    await flushPromises();

    expect(wrapper.find('.close-stage').exists()).toBe(true);
    expect(wrapper.get('.items-table-stub').attributes('data-items-count')).toBe('1');
  });

  it('sends lump-sum stage pricing separately from grouped quote items', async () => {
    fetchList
      .mockResolvedValueOnce(
        new DataSuccess({ data: [new StageModel({ id: 1, title: 'Main', children: [] })] }),
      )
      .mockResolvedValueOnce(
        new DataSuccess({ data: [new StageModel({ id: 11, title: 'Sub', children: [] })] }),
      );

    const wrapper = mountBuilder({
      initialStages: [{ id: 45, stageId: 1, subStageId: 11, items: [] }],
    });

    await flushPromises();
    await wrapper.get('.select-sub-stage').trigger('click');
    await wrapper.get('.select-source').trigger('click');
    await wrapper.get('.add-item').trigger('click');
    await wrapper.get('.add-item').trigger('click');

    expect(wrapper.get('.client-price-stub').attributes('data-client-price')).toBe('20');

    await wrapper.get('.client-price-stub').trigger('click');

    expect(fetchList.mock.calls[1]?.[0].toMap()).toMatchObject({ parent_id: 1, status: 1 });
    expect(fetchList.mock.calls[0]?.[0].toMap()).toMatchObject({ parent_id: null, status: 1 });

    const requests = wrapper
      .emitted('update:details')
      ?.at(-1)?.[0] as StoreExecutionQuoteDetailsParams[];

    expect(requests).toHaveLength(1);
    expect(requests[0]?.toMap()).toEqual({
      quote_id: 28,
      stage_id: 1,
      sub_stage_id: 11,
      item_type: ExecutionQuoteItemSourceEnum.PRODUCT,
      items: [
        { morph_id: 22, expected_price: 5, quantity: 2, unit: 9 },
        { morph_id: 22, expected_price: 5, quantity: 2, unit: 9 },
      ],
    });

    const pricingDrafts = wrapper
      .emitted('update:pricing')
      ?.at(-1)?.[0] as ExecutionQuoteStagePricingDraft[];

    expect(pricingDrafts).toEqual([
      expect.objectContaining({
        quoteStageId: 45,
        stageId: 1,
        subStageId: 11,
        quoteType: ExecutionQuoteTypeEnum.LUMP_SUM,
        pricingValue: 4200,
      }),
    ]);
  });

  it('edits a local item in place before it is sent', async () => {
    fetchList
      .mockResolvedValueOnce(
        new DataSuccess({ data: [new StageModel({ id: 1, title: 'Main', children: [] })] }),
      )
      .mockResolvedValueOnce(
        new DataSuccess({ data: [new StageModel({ id: 11, title: 'Sub', children: [] })] }),
      );

    const wrapper = mountBuilder();

    await flushPromises();
    await wrapper.get('.select-sub-stage').trigger('click');
    await wrapper.get('.select-source').trigger('click');
    await wrapper.get('.add-item').trigger('click');
    await wrapper.get('.edit-first-item').trigger('click');
    await wrapper.get('.select-sub-stage').trigger('click');

    expect(wrapper.get('.item-form-stub').attributes('data-editing-item')).toBeTruthy();

    await wrapper.get('.add-item').trigger('click');

    const displayedItems = wrapper
      .getComponent({ name: 'ExecutionQuoteItemsTable' })
      .props('items') as Array<{ source_id: number; quantity: number; unit_price: number }>;
    expect(displayedItems).toHaveLength(1);
    expect(displayedItems[0]).toMatchObject({ source_id: 44, quantity: 3, unit_price: 7 });

    const requests = wrapper
      .emitted('update:details')
      ?.at(-1)?.[0] as StoreExecutionQuoteDetailsParams[];
    expect(requests[0]?.toMap()).toMatchObject({
      items: [{ morph_id: 44, expected_price: 7, quantity: 3, unit: 12 }],
    });
  });

  it('removes a local item before it is sent', async () => {
    fetchList
      .mockResolvedValueOnce(
        new DataSuccess({ data: [new StageModel({ id: 1, title: 'Main', children: [] })] }),
      )
      .mockResolvedValueOnce(
        new DataSuccess({ data: [new StageModel({ id: 11, title: 'Sub', children: [] })] }),
      );

    const wrapper = mountBuilder();

    await flushPromises();
    await wrapper.get('.select-sub-stage').trigger('click');
    await wrapper.get('.select-source').trigger('click');
    await wrapper.get('.add-item').trigger('click');
    await wrapper.get('.remove-first-item').trigger('click');

    expect(wrapper.get('.items-table-stub').attributes('data-items-count')).toBe('0');
    expect(wrapper.emitted('update:details')?.at(-1)?.[0]).toEqual([]);
  });

  it('hydrates stored quote items and client price without resubmitting them', async () => {
    fetchList
      .mockResolvedValueOnce(
        new DataSuccess({ data: [new StageModel({ id: 1, title: 'Main', children: [] })] }),
      )
      .mockResolvedValueOnce(
        new DataSuccess({ data: [new StageModel({ id: 11, title: 'Sub', children: [] })] }),
      );

    const wrapper = mountBuilder({
      stubs: { ...componentStubs, ExecutionQuoteStageClientPrice: false },
      initialStages: [
        {
          id: 5,
          stageId: 1,
          subStageId: 11,
          stage: { id: 1, title: 'Main' },
          subStage: { id: 11, title: 'Sub' },
          clientPrice: 3500,
          items: [
            {
              id: 7,
              itemType: ExecutionQuoteItemSourceEnum.PRODUCT,
              itemableId: 17,
              itemable: { id: 17, title: 'Stored product' },
              unitId: 9,
              measurementUnit: { id: 9, title: 'Piece' },
              expectedPrice: 25,
              quantity: 2,
            },
          ],
        },
      ],
    });

    await flushPromises();

    const displayedItems = wrapper
      .getComponent({ name: 'ExecutionQuoteItemsTable' })
      .props('items');
    expect(displayedItems).toEqual([
      expect.objectContaining({
        source_id: 17,
        source_title: 'Stored product',
        stage_name: 'Main',
        sub_stage_name: 'Sub',
        quantity: 2,
        unit_id: 9,
        unit_name: 'Piece',
        persisted: true,
      }),
    ]);
    expect(wrapper.emitted('update:details')?.at(-1)?.[0]).toEqual([]);
    expect(wrapper.get<HTMLInputElement>('.client-price input').element.value).toBe('3500');

    await wrapper.get('.select-source').trigger('click');
    await wrapper.get('.add-item').trigger('click');

    expect(wrapper.get<HTMLInputElement>('.client-price input').element.value).toBe('3500');

    const requests = wrapper
      .emitted('update:details')
      ?.at(-1)?.[0] as StoreExecutionQuoteDetailsParams[];
    expect(requests[0]?.toMap()).toMatchObject({
      items: [{ morph_id: 22, expected_price: 5, quantity: 2, unit: 9 }],
    });
  });

  it('defaults a missing stored client price to the stage items total', async () => {
    fetchList
      .mockResolvedValueOnce(
        new DataSuccess({ data: [new StageModel({ id: 1, title: 'Main', children: [] })] }),
      )
      .mockResolvedValueOnce(
        new DataSuccess({ data: [new StageModel({ id: 11, title: 'Sub', children: [] })] }),
      );

    const wrapper = mountBuilder({
      initialStages: [
        {
          id: 5,
          stageId: 1,
          subStageId: 11,
          items: [
            {
              id: 7,
              itemType: ExecutionQuoteItemSourceEnum.PRODUCT,
              itemableId: 17,
              quantity: 2,
              expectedPrice: 25,
              unitId: 9,
            },
          ],
        },
      ],
    });

    await flushPromises();

    expect(wrapper.get('.client-price-stub').attributes('data-client-price')).toBe('50');
    expect(wrapper.emitted('update:pricing')?.at(-1)?.[0]).toEqual([
      expect.objectContaining({ quoteStageId: 5, pricingValue: 50 }),
    ]);
  });

  it('opens a selected main stage on the focused stage route', async () => {
    routeParams.stageId = undefined;
    fetchList.mockResolvedValueOnce(
      new DataSuccess({ data: [new StageModel({ id: 4, title: 'Finishes', children: [] })] }),
    );

    const wrapper = mountBuilder();

    await flushPromises();
    await wrapper.get('.open-stage').trigger('click');

    expect(push).toHaveBeenCalledWith({
      name: 'Build Execution Quote',
      params: { stageId: '4' },
      query: { id: '28' },
    });
  });

  it('returns from the focused stage route to the stage list', async () => {
    fetchList
      .mockResolvedValueOnce(
        new DataSuccess({ data: [new StageModel({ id: 1, title: 'Main', children: [] })] }),
      )
      .mockResolvedValueOnce(new DataSuccess({ data: [] }));

    const wrapper = mountBuilder();

    await flushPromises();
    await wrapper.get('.close-stage').trigger('click');

    expect(push).toHaveBeenCalledWith({
      name: 'Build Execution Quote',
      params: { stageId: undefined },
      query: { id: '28' },
    });
  });

  it('keeps supervision item entry separate from stage client pricing', async () => {
    fetchList
      .mockResolvedValueOnce(
        new DataSuccess({ data: [new StageModel({ id: 1, title: 'Main', children: [] })] }),
      )
      .mockResolvedValueOnce(
        new DataSuccess({ data: [new StageModel({ id: 11, title: 'Sub', children: [] })] }),
      );

    const wrapper = mountBuilder({
      modelValue: ExecutionQuoteTypeEnum.SUPERVISION,
      initialStages: [{ id: 43, stageId: 1, subStageId: 11, items: [] }],
    });

    await flushPromises();
    await wrapper.get('.select-sub-stage').trigger('click');
    await wrapper.get('.select-source').trigger('click');
    await wrapper.get('.add-item').trigger('click');

    expect(wrapper.get('.item-form-stub').attributes('data-pricing-enabled')).toBe('true');
    expect(wrapper.get('.items-table-stub').attributes('data-show-pricing')).toBe('true');
    expect(wrapper.find('.client-price-stub').exists()).toBe(false);
    expect(wrapper.find('.totals-stub').exists()).toBe(false);

    expect(wrapper.emitted('update:pricing')?.at(-1)?.[0]).toEqual([]);

    const requests = wrapper
      .emitted('update:details')
      ?.at(-1)?.[0] as StoreExecutionQuoteDetailsParams[];

    expect(requests[0]?.toMap()).toMatchObject({
      items: [{ morph_id: 22, expected_price: 5, quantity: 2, unit: 9 }],
    });
  });

  it('leaves without confirmation when all quote items are already saved', async () => {
    fetchList
      .mockResolvedValueOnce(
        new DataSuccess({ data: [new StageModel({ id: 1, title: 'Main', children: [] })] }),
      )
      .mockResolvedValueOnce(new DataSuccess({ data: [] }));

    const wrapper = mountBuilder({
      initialStages: [
        {
          id: 5,
          stageId: 1,
          subStageId: 11,
          items: [
            {
              id: 7,
              itemType: ExecutionQuoteItemSourceEnum.PRODUCT,
              itemableId: 17,
              quantity: 1,
              expectedPrice: 100,
              unitId: 9,
            },
          ],
        },
      ],
    });
    await flushPromises();
    await wrapper.get('.builder-toolbar__exit').trigger('click');

    expect(confirm).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith({ name: 'Execution Quotes' });
  });

  it('asks for confirmation before leaving with unsaved items', async () => {
    fetchList
      .mockResolvedValueOnce(
        new DataSuccess({ data: [new StageModel({ id: 1, title: 'Main', children: [] })] }),
      )
      .mockResolvedValueOnce(
        new DataSuccess({ data: [new StageModel({ id: 11, title: 'Sub', children: [] })] }),
      );

    const wrapper = mountBuilder();
    await flushPromises();
    await wrapper.get('.select-sub-stage').trigger('click');
    await wrapper.get('.select-source').trigger('click');
    await wrapper.get('.add-item').trigger('click');
    await wrapper.get('.builder-toolbar__exit').trigger('click');

    expect(confirm).toHaveBeenCalledWith(expect.any(String), expect.any(Function), {
      title: expect.any(String),
    });
    expect(push).not.toHaveBeenCalledWith({ name: 'Execution Quotes' });
  });
});
