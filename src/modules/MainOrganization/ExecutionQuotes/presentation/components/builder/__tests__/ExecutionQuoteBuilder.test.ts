import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import StageModel from '@/modules/shared/Stages/core/models/stage.model';

import { ExecutionQuoteItemSourceEnum } from '../../../../core/constants/execution.quote.item.source.enum';
import { ExecutionQuoteTypeEnum } from '../../../../core/constants/execution.quote.type.enum';
import type { ExecutionQuoteStageRequest } from '../../../../core/params/store.execution.quote.details.params';
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
  ExecutionQuoteTypeCards: { template: '<div />' },
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

const mountBuilder = () =>
  mount(ExecutionQuoteBuilder, {
    props: {
      enabled: true,
      modelValue: ExecutionQuoteTypeEnum.LUMP_SUM,
    },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: componentStubs,
    },
  });

describe('ExecutionQuoteBuilder', () => {
  beforeEach(() => {
    routeParams.stageId = '1';
    fetchList.mockReset();
    push.mockReset().mockResolvedValue(undefined);
  });

  it('sends the selected sub-stage as item stage_id', async () => {
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

    const stages = wrapper.emitted('update:stages')?.at(-1)?.[0] as ExecutionQuoteStageRequest[];

    expect(stages[0]?.items[0]).toMatchObject({
      stage_id: 11,
      source_type: ExecutionQuoteItemSourceEnum.PRODUCT,
      source_id: 22,
      sorting_id: 33,
    });
    expect(stages[0]?.items[0]).not.toHaveProperty('sub_stage_id');
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
      name: 'Add Execution Quote',
      params: {
        stageView: 'stages',
        stageId: '4',
      },
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
      name: 'Add Execution Quote',
      params: {
        stageView: undefined,
        stageId: undefined,
      },
    });
  });
});
