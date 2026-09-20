import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import TitleModel from '@/base/Core/Models/titleModel';
import { UnitTypeEnum } from '@/modules/shared/Materials/core/constant/unit.type.enum';
import DeleteLaborParams from '../../../core/params/delete.labor.params';
import LaborModel from '../../../core/models/labor.model';
import LaborIndex from '../LaborIndex.vue';

const routerPush = vi.hoisted(() => vi.fn());
const toastSuccess = vi.hoisted(() => vi.fn());
const route = vi.hoisted(() => ({ query: {} as Record<string, string> }));
const controller = vi.hoisted(() => ({
  fetchList: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  listState: { value: { status: 'success' } },
  pagination: { value: { currentPage: 1, lastPage: 1, perPage: 10, total: 1 } },
}));
const itemTypesController = vi.hoisted(() => ({
  fetchAsOptions: vi.fn().mockResolvedValue([
    { id: 11, title: 'Finishing' },
    { id: 12, title: 'Installation' },
  ]),
}));
const measurementController = vi.hoisted(() => ({
  fetchAsOptions: vi.fn().mockResolvedValue([
    { id: 21, title: 'Meter' },
    { id: 22, title: 'Hour' },
  ]),
}));

vi.mock('../../controllers/labor.controller', () => ({
  default: { getInstance: () => controller },
}));

vi.mock(
  '@/modules/MainOrganization/ItemTypes/presentation/controllers/item.types.controller',
  () => ({ default: { getInstance: () => itemTypesController } }),
);

vi.mock('@/modules/shared/measurement/presentation/controllers/measurement.controller', () => ({
  default: { getInstance: () => measurementController },
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({ user: { type: 1 } }),
}));

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ push: routerPush }),
}));

vi.mock('@/base/Presentation/Utils/debouced', () => ({
  debounce: (callback: () => void) => callback,
}));

vi.mock('@/base/Presentation/Dialogs/dialog.manager', () => ({
  dialogManager: { toastSuccess },
}));

describe('LaborIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    route.query = {};
  });

  it('uses translated Labor copy and admin Labor routes', async () => {
    const wrapper = mount(LaborIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DataStatusBuilder: {
            template:
              '<div><slot name="success" :data="[{ id: 7, title: \'Painting\', price: 100 }]" /></div>',
          },
          AppTable: {
            props: ['items'],
            template: '<div><slot name="actions" :item="items[0]" /></div>',
          },
          DeleteDialog: {
            emits: ['delete'],
            template:
              '<button class="delete-dialog" @click="$emit(\'delete\')"><slot name="btn" /></button>',
          },
          Pagination: true,
          TableSkelaton: true,
          IndexAddIcon: true,
          ChangeStatusButton: {
            props: ['id', 'type', 'initialIsActive'],
            template: '<div class="change-status" />',
          },
          RouterLink: RouterLinkStub,
        },
      },
    });
    await flushPromises();

    const destinations = wrapper.findAllComponents(RouterLinkStub).map((link) => link.props('to'));

    expect(wrapper.text()).toContain('labor.list_title');
    expect(destinations).toContain('/admin/labor/add');
    expect(destinations).toContain('/admin/labor/edit/7');
    expect(wrapper.get('.change-status').exists()).toBe(true);

    await wrapper.get('.delete-dialog').trigger('click');
    await flushPromises();

    expect(controller.delete).toHaveBeenCalledWith(expect.any(DeleteLaborParams));
  });

  it('shows a success toast after a labor record is deleted', async () => {
    controller.delete.mockResolvedValueOnce(new DataSuccess({ data: null }));

    const wrapper = mount(LaborIndex, {
      global: {
        stubs: {
          DataStatusBuilder: {
            template: '<div><slot name="success" :data="[{ id: 7 }]" /></div>',
          },
          AppTable: {
            props: ['items'],
            template: '<div><slot name="actions" :item="items[0]" /></div>',
          },
          DeleteDialog: {
            emits: ['delete'],
            template: '<button class="delete-dialog" @click="$emit(\'delete\')" />',
          },
          Pagination: true,
          IndexAddIcon: true,
          ChangeStatusButton: true,
          RouterLink: RouterLinkStub,
        },
      },
    });
    await flushPromises();

    await wrapper.get('.delete-dialog').trigger('click');
    await flushPromises();

    expect(toastSuccess).toHaveBeenCalledWith('Labor record deleted successfully.');
  });

  it('shows bulk delete after selection and deletes every selected labor record', async () => {
    const wrapper = mount(LaborIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DataStatusBuilder: {
            template:
              '<div><slot name="success" :data="[{ id: 7, title: \'Painting\', price: 100 }, { id: 8, title: \'Installation\', price: 150 }]" /></div>',
          },
          DeleteDialog: {
            props: ['triggerLabel'],
            emits: ['delete'],
            template:
              '<button class="delete-dialog" @click="$emit(\'delete\')">{{ triggerLabel }}<slot name="btn" /></button>',
          },
          Pagination: true,
          TableSkelaton: true,
          IndexAddIcon: true,
          ChangeStatusButton: true,
          RouterLink: RouterLinkStub,
        },
      },
    });
    await flushPromises();

    await wrapper.get('.th-checkbox input[type="checkbox"]').trigger('change');

    expect(wrapper.find('.table-bulk-actions').exists()).toBe(true);

    controller.fetchList.mockClear();
    await wrapper.get('.table-bulk-actions .delete-dialog').trigger('click');
    await flushPromises();

    const deletedIds = controller.delete.mock.calls.map(
      ([params]: [DeleteLaborParams]) => params.toMap().labor_id,
    );
    expect(deletedIds).toEqual([7, 8]);
    expect(controller.fetchList).toHaveBeenCalledTimes(1);
    expect(wrapper.find('.table-bulk-actions').exists()).toBe(false);
  });

  it('applies multi-select filters across all labor filter groups', async () => {
    const wrapper = mount(LaborIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DataStatusBuilder: true,
          Pagination: true,
          TableSkelaton: true,
          IndexAddIcon: true,
          ChangeStatusButton: true,
          RouterLink: RouterLinkStub,
        },
      },
    });
    await flushPromises();

    await wrapper.get('.labor-filter-button').trigger('click');
    expect(wrapper.get('#labor-filters-dialog').attributes('aria-modal')).toBe('true');
    expect(wrapper.find('[data-filter-category="statuses"][value="1"]').exists()).toBe(true);
    expect(wrapper.find('[data-filter-category="statuses"][value="0"]').exists()).toBe(true);
    await wrapper.get('[data-filter-category="itemTypes"][value="11"]').trigger('change');
    await wrapper.get('[data-filter-category="itemTypes"][value="12"]').trigger('change');
    await wrapper.get('[data-filter-category="measurementUnits"][value="21"]').trigger('change');
    await wrapper.get('[data-filter-category="statuses"][value="0"]').trigger('change');
    await wrapper
      .get('[data-filter-category="pricingModes"][value="configured"]')
      .trigger('change');
    await wrapper.get('[data-filter-category="mappingReadiness"][value="1"]').trigger('change');

    expect(routerPush).not.toHaveBeenCalled();

    await wrapper.get('.labor-filter-apply').trigger('click');
    await flushPromises();

    expect(routerPush).toHaveBeenLastCalledWith({
      query: {
        page: '1',
        word: undefined,
        active: undefined,
        item_types: '11,12',
        measurement_units: '21',
        statuses: '0',
        pricing_modes: 'configured',
        mapping_readiness: '1',
        per_page: '10',
        sort_by: undefined,
        sort_direction: undefined,
      },
    });
    expect(controller.fetchList.mock.calls.at(-1)?.[0].toMap()).toMatchObject({
      page: 1,
      active: 0,
      item_type_ids: [11, 12],
      measurement_unit_ids: [21],
      default_pricing_mode: 'configured',
      mapping_readiness: 1,
    });
    expect(wrapper.find('#labor-filters-dialog').exists()).toBe(false);
  });

  it('restores labor filters and page size while ignoring unsupported sorting', async () => {
    route.query = {
      page: '2',
      word: 'paint',
      item_types: '11,12',
      measurement_units: '21',
      statuses: '1',
      pricing_modes: 'manual_entry',
      mapping_readiness: '0',
      per_page: '20',
      sort_by: 'price',
      sort_direction: 'desc',
    };

    const wrapper = mount(LaborIndex, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          DataStatusBuilder: true,
          Pagination: true,
          TableSkelaton: true,
          IndexAddIcon: true,
          ChangeStatusButton: true,
          RouterLink: RouterLinkStub,
        },
      },
    });
    await flushPromises();

    const requestQuery = controller.fetchList.mock.calls[0]?.[0].toMap();

    expect(requestQuery).toMatchObject({
      word: 'paint',
      page: 2,
      per_page: 20,
      active: 1,
      item_type_ids: [11, 12],
      measurement_unit_ids: [21],
      default_pricing_mode: 'manual_entry',
      mapping_readiness: 0,
    });
    expect(requestQuery).not.toHaveProperty('sort_by');
    expect(requestQuery).not.toHaveProperty('sort_direction');

    await wrapper.get('.labor-filter-button').trigger('click');

    expect(
      (wrapper.get('[data-filter-category="itemTypes"][value="11"]').element as HTMLInputElement)
        .checked,
    ).toBe(true);
    expect(
      (
        wrapper.get('[data-filter-category="pricingModes"][value="manual_entry"]')
          .element as HTMLInputElement
      ).checked,
    ).toBe(true);
  });

  it('shows the required labor columns and mapped values', async () => {
    const labors = [
      new LaborModel({
        id: 7,
        title: 'Painting',
        translations: { title: { en: 'Painting' } },
        price: 125,
        unit: UnitTypeEnum.meter,
        itemType: new TitleModel('Finishing', 1),
        measurementUnit: new TitleModel('Meter', 1),
        pricingMode: 'configured',
        activeMappingCount: 3,
        mappingReady: true,
      }),
      new LaborModel({
        id: 8,
        title: 'Manual work',
        translations: { title: { en: 'Manual work' } },
        price: 999,
        unit: UnitTypeEnum.bag,
        itemType: new TitleModel('General', 2),
        measurementUnit: new TitleModel('Bag', 2),
      }),
    ];
    const SuccessStateStub = {
      setup: () => ({ labors }),
      template: '<div><slot name="success" :data="labors" /></div>',
    };
    const wrapper = mount(LaborIndex, {
      global: {
        stubs: {
          DataStatusBuilder: SuccessStateStub,
          DeleteDialog: true,
          Pagination: true,
          TableSkelaton: true,
          IndexAddIcon: true,
          ChangeStatusButton: true,
          RouterLink: RouterLinkStub,
        },
      },
    });
    await flushPromises();

    expect(wrapper.text()).toContain('labor.type');
    expect(wrapper.text()).toContain('labor.unit');
    expect(wrapper.text()).toContain('labor.default_pricing_mode');
    expect(wrapper.text()).toContain('labor.active_mapping_count');
    expect(wrapper.text()).toContain('labor.mapping_readiness');
    expect(wrapper.text()).toContain('Finishing');
    expect(wrapper.text()).toContain('Meter');
    expect(wrapper.text()).toContain('labor.configured');
    expect(wrapper.text()).toContain('125 labor.currency');
    expect(wrapper.text()).toContain('labor.ready');
    expect(wrapper.text()).toContain('labor.manual_entry');
    expect(wrapper.text()).not.toContain('999');
  });

  it('changes page size through the shared table pagination', async () => {
    const SuccessStateStub = {
      template: '<div><slot name="success" :data="[]" /></div>',
    };
    const wrapper = mount(LaborIndex, {
      global: {
        stubs: {
          DataStatusBuilder: SuccessStateStub,
          Pagination: {
            emits: ['countPerPage'],
            template:
              '<button class="pagination-page-size" @click="$emit(\'countPerPage\', 30)" />',
          },
          TableSkelaton: true,
          IndexAddIcon: true,
          ChangeStatusButton: true,
          RouterLink: RouterLinkStub,
        },
      },
    });
    await flushPromises();

    expect(wrapper.find('#labor-sort-by').exists()).toBe(false);
    expect(wrapper.find('#labor-page-size').exists()).toBe(false);

    await wrapper.get('.pagination-page-size').trigger('click');
    await flushPromises();

    expect(controller.fetchList.mock.calls.at(-1)?.[0].toMap()).toMatchObject({
      page: 1,
      per_page: 30,
    });
    expect(routerPush).toHaveBeenLastCalledWith({
      query: {
        page: '1',
        word: undefined,
        active: undefined,
        item_types: undefined,
        measurement_units: undefined,
        statuses: undefined,
        pricing_modes: undefined,
        mapping_readiness: undefined,
        per_page: '30',
        sort_by: undefined,
        sort_direction: undefined,
      },
    });
  });
});
