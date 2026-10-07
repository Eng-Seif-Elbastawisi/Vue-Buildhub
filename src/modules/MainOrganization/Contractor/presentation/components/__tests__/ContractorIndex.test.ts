import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import {
  DataFailed,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { ErrorModel, ErrorType } from '@/base/Core/NetworkStructure/Resources/errors/errorModel';
import ContractorModel from '../../../core/models/contractor.model';
import ContractorIndex from '../ContractorIndex.vue';

const fetchList = vi.fn().mockResolvedValue(undefined);
const deleteStage = vi.fn();
const listState = ref(new DataSuccess<ContractorModel[]>({ data: [] }));
const routerPush = vi.fn();
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({ push: routerPush }),
}));
vi.mock('../../controllers/contractor.controller', () => ({
  default: {
    getInstance: () => ({
      fetchList,
      deleteStage,
      delete: vi.fn(),
      listState,
      pagination: ref(null),
    }),
  },
}));

describe('ContractorIndex', () => {
  const mountTable = () =>
    mount(ContractorIndex, {
      global: {
        mocks: {
          $t: (key: string, params?: Record<string, string>) => {
            if (key === 'Contractor.remove_stage') return `Remove ${params?.stage}`;
            if (key === 'Contractor.remove_stage_confirm') {
              return `Remove ${params?.stage} from ${params?.contractor}? Only this stage will be removed.`;
            }
            return key;
          },
        },
        stubs: {
          IndexPageHeader: { template: '<div><slot name="search"/><slot name="actions"/></div>' },
          DataStatusBuilder: {
            props: ['controller'],
            template: '<div><slot name="success" :data="controller.data"/></div>',
          },
          AppTable: {
            props: ['items'],
            template:
              '<div><div v-for="item in items" :key="item.id"><slot name="cell-stages" :item="item"/><slot name="actions" :item="item"/></div></div>',
          },
          DeleteDialog: {
            props: ['title', 'message', 'onDelete'],
            template:
              '<div><button type="button" @click="onDelete"><slot name="btn"/></button><p>{{ message }}</p></div>',
          },
          Pagination: true,
          TableSkelaton: true,
          RouterLink: { props: ['to'], template: '<a :href="to"><slot/></a>' },
        },
      },
    });

  it('loads contractors through index params and links to add', () => {
    const wrapper = mount(ContractorIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          IndexPageHeader: { template: '<div><slot name="search"/><slot name="actions"/></div>' },
          DataStatusBuilder: true,
          AppTable: true,
          Pagination: true,
          TableSkelaton: true,
          DeleteDialog: true,
          RouterLink: { props: ['to'], template: '<a :href="to"><slot/></a>' },
        },
      },
    });

    expect(fetchList.mock.calls.at(-1)?.[0].toMap()).toMatchObject({ page: 1 });
    expect(wrapper.get('a').attributes('href')).toBe('/organization/contractors/add');
  });

  it('shows every stage name and removes only the selected relation after confirmation', async () => {
    listState.value = new DataSuccess({
      data: [
        ContractorModel.fromJson({
          id: 1,
          name: 'Builder',
          stages: [
            { id: 152, title: 'Electrical' },
            {
              id: 153,
              title: [
                { locale: 'en', title: 'Plumbing' },
                { locale: 'ar', title: 'سباكة' },
              ],
            },
          ],
        }),
      ],
    });
    deleteStage.mockResolvedValueOnce(new DataSuccess<void>({ message: 'Removed' }));

    const wrapper = mountTable();
    const initialFetchCount = fetchList.mock.calls.length;
    expect(wrapper.text()).toContain('Electrical');
    expect(wrapper.text()).toContain('Plumbing');
    expect(wrapper.text()).toContain('Only this stage will be removed');

    const remove = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Remove Electrical'));
    expect(remove).toBeDefined();
    await remove!.trigger('click');
    await vi.waitFor(() => expect(fetchList).toHaveBeenCalledTimes(initialFetchCount + 1));

    expect(deleteStage.mock.calls[0]?.[0].toMap()).toEqual({ contractor_id: 1, stage_id: 152 });
    wrapper.unmount();
  });

  it('keeps the stage visible and does not refresh when the backend rejects removal', async () => {
    listState.value = new DataSuccess({
      data: [
        ContractorModel.fromJson({
          id: 1,
          name: 'Builder',
          stages: [{ id: 152, title: 'Electrical' }],
        }),
      ],
    });
    deleteStage.mockResolvedValueOnce(
      new DataFailed<void>({ error: new ErrorModel('Stage is locked', ErrorType.serviceSide) }),
    );

    const wrapper = mountTable();
    const initialFetchCount = fetchList.mock.calls.length;
    const remove = wrapper
      .findAll('button')
      .find((button) => button.text().includes('Remove Electrical'));
    await remove!.trigger('click');
    await vi.waitFor(() => expect(deleteStage).toHaveBeenCalled());

    expect(wrapper.text()).toContain('Electrical');
    expect(fetchList).toHaveBeenCalledTimes(initialFetchCount);
    wrapper.unmount();
  });

  it('uses the existing neutral empty value when a contractor has no stages', () => {
    listState.value = new DataSuccess({
      data: [ContractorModel.fromJson({ id: 1, name: 'Builder', stages: [] })],
    });

    const wrapper = mountTable();

    expect(wrapper.text()).toContain('no_data_found');
    wrapper.unmount();
  });
});
