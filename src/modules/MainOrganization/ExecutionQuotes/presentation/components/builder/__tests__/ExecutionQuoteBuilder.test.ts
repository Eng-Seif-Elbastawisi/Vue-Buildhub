import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import StageModel from '@/modules/shared/Stages/core/models/stage.model';

import { ExecutionQuoteItemSourceEnum } from '../../../../core/constants/execution.quote.item.source.enum';
import { ExecutionQuoteTypeEnum } from '../../../../core/constants/execution.quote.type.enum';
import type StoreExecutionQuoteDetailsParams from '../../../../core/params/store.execution.quote.details.params';
import ExecutionQuoteBuilder from '../ExecutionQuoteBuilder.vue';

const { fetchList, push, routeParams } = vi.hoisted(() => ({
  fetchList: vi.fn(),
  push: vi.fn().mockResolvedValue(undefined),
  routeParams: { stageId: '1' as string | undefined },
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
    props: ['stages'],
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
    emits: ['update:modelValue'],
    template: `<button class="select-source" @click="$emit('update:modelValue', ${ExecutionQuoteItemSourceEnum.PRODUCT})" />`,
  },
  ExecutionQuoteItemForm: {
    emits: ['add'],
    template: `
      <button
        class="add-item"
        @click="$emit('add', { source_id: 22, sorting_id: 33, quantity: 2, unit_price: 5 })"
      />
    `,
  },
  ExecutionQuoteClientPrice: { template: '<div />' },
  ExecutionQuoteItemsTable: { template: '<div />' },
  ExecutionQuoteTotals: { template: '<div />' },
};

const mountBuilder = (stubs: Record<string, unknown> = componentStubs) =>
  mount(ExecutionQuoteBuilder, {
    props: {
      enabled: true,
      modelValue: ExecutionQuoteTypeEnum.LUMP_SUM,
      executionQuoteId: 28,
    },
    global: {
      mocks: { $t: (key: string) => key },
      stubs,
    },
  });

describe('ExecutionQuoteBuilder', () => {
  beforeEach(() => {
    routeParams.stageId = '1';
    fetchList.mockReset();
    push.mockReset().mockResolvedValue(undefined);
  });

  it('locks the quote type options on the saved quote stages page', async () => {
    fetchList.mockResolvedValueOnce(new DataSuccess({ data: [] }));

    const wrapper = mountBuilder({ ...componentStubs, ExecutionQuoteTypeCards: false });
    await flushPromises();

    const quoteTypeOptions = wrapper.findAll<HTMLButtonElement>('.quote-type-option');
    expect(quoteTypeOptions).toHaveLength(2);
    expect(quoteTypeOptions.every((option) => option.element.disabled)).toBe(true);
  });

  it('groups selected items into the backend morph contract', async () => {
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
    await wrapper.get('.add-item').trigger('click');

    expect(fetchList.mock.calls[1]?.[0].toMap()).toMatchObject({ parent_id: 1 });

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
        { morph_id: 22, expected_price: 5, quantity: 2 },
        { morph_id: 22, expected_price: 5, quantity: 2 },
      ],
    });
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
});
