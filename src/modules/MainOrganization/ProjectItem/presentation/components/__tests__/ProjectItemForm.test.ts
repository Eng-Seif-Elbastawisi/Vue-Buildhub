import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemServiceTypeEnum } from '@/modules/shared/Item/core/constant/item.service.type.enum';
import { ProjectItemPriceEnum } from '../../../core/constant/project.item.Price.enum';
import ProjectItemShowModel from '../../../core/models/project.Item.show.model';
import AddProjectItemParams from '../../../core/params/add.project.Item.params';
import ProjectItemForm from '../ProjectItemForm.vue';

vi.mock('vue-router', () => ({
  onBeforeRouteLeave: vi.fn(),
  useRoute: () => ({ fullPath: '/item/add', params: {}, query: {} }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    resolve: vi.fn(),
  }),
  createRouter: vi.fn(() => ({
    install: vi.fn(),
    push: vi.fn(),
    resolve: vi.fn(),
    afterEach: vi.fn(),
    beforeEach: vi.fn(),
  })),
  createWebHistory: vi.fn(),
}));

vi.mock('@/modules/shared/Item/presentation/controllers/Item.controller', () => ({
  default: { getInstance: () => ({}) },
}));

vi.mock(
  '@/modules/MainOrganization/ProjectFloor/presentation/controllers/project.floor.controller',
  () => ({
    default: {
      getInstance: () => ({
        fetchList: vi.fn(),
        listState: { value: { data: [] } },
      }),
    },
  }),
);

const createSelectStub = (pricingMethod: ProjectItemPriceEnum) => {
  return {
    props: ['id', 'params'],
    emits: ['update:modelValue'],
    template:
      '<button :class="id" @click="$emit(\'update:modelValue\', optionFor(id))">select</button>',
    methods: {
      optionFor(id: string) {
        const options: Record<string, { id: number; title: string }> = {
          department_id: { id: 7, title: 'Finishing' },
          'project-item-item': { id: 9, title: 'Concrete' },
          'project-item-pricing-method': {
            id: pricingMethod,
            title:
              pricingMethod === ProjectItemPriceEnum.SPACE_RELATED
                ? 'Space related'
                : 'General item',
          },
          space_id: { id: 6, title: 'Lobby' },
        };
        return options[id];
      },
    },
  };
};

const SelectStub = createSelectStub(ProjectItemPriceEnum.GENERAL_ITEM);

describe('ProjectItemForm', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('emits complete item params from form inputs', async () => {
    const wrapper = mount(ProjectItemForm, {
      props: { project: 4 },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { UpdatedCustomInputSelect: SelectStub },
      },
    });

    await wrapper.find('.department_id').trigger('click');
    await wrapper.find('.project-item-item').trigger('click');
    await wrapper.find('.project-item-pricing-method').trigger('click');
    await wrapper.find<HTMLInputElement>('.field-input[step="1"]').setValue('250');
    await wrapper.find<HTMLInputElement>('.field-input[step="1"]').setValue('3');
    await wrapper.find('.add-btn').trigger('click');

    const emissions = wrapper.emitted('updateData') as unknown[][];
    const params = emissions.at(-1)?.[0] as AddProjectItemParams;

    expect(params.toMap()).toEqual({
      project_id: 4,
      department_id: 7,
      items: [
        {
          item_id: 9,
          price: 250,
          quantity: 3,
          pricing_method: ProjectItemPriceEnum.GENERAL_ITEM,
        },
      ],
    });
  });

  it('filters items by design service and the selected department', async () => {
    const wrapper = mount(ProjectItemForm, {
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { UpdatedCustomInputSelect: SelectStub },
      },
    });

    const itemSelect = wrapper
      .findAllComponents(SelectStub)
      .find((select) => select.props('id') === 'project-item-item');

    expect(itemSelect?.props('params')).toBeUndefined();

    await wrapper.find('.department_id').trigger('click');

    expect(itemSelect?.props('params').toMap()).toEqual({
      with_pagination: 0,
      page: 1,
      per_page: 100,
      service_type: ItemServiceTypeEnum.DESIGN,
      department_id: 7,
    });
  });

  it('keeps Space-related pricing in the table and submitted params', async () => {
    const wrapper = mount(ProjectItemForm, {
      props: { project: 4 },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: {
          UpdatedCustomInputSelect: createSelectStub(ProjectItemPriceEnum.SPACE_RELATED),
        },
      },
    });

    await wrapper.find('.department_id').trigger('click');
    await wrapper.find('.project-item-item').trigger('click');
    await wrapper.find('.project-item-pricing-method').trigger('click');
    await wrapper.find('.space_id').trigger('click');
    await wrapper.find<HTMLInputElement>('.field-input[step="1"]').setValue('250');
    await wrapper.find<HTMLInputElement>('.field-input[step="1"]').setValue('3');
    await wrapper.find('.add-btn').trigger('click');

    const row = wrapper.find('.local-table-row');
    expect(row.text()).toContain('250');
    expect(row.text()).toContain('750');

    const emissions = wrapper.emitted('updateData') as unknown[][];
    const params = emissions.at(-1)?.[0] as AddProjectItemParams;

    expect(params.toMap()).toEqual({
      project_id: 4,
      department_id: 7,
      items: [
        {
          item_id: 9,
          price: 250,
          quantity: 3,
          pricing_method: ProjectItemPriceEnum.SPACE_RELATED,
          project_floor_space_id: 6,
        },
      ],
    });
  });

  it('prefills values from an existing item', () => {
    const wrapper = mount(ProjectItemForm, {
      props: { item: ProjectItemShowModel.example, loading: true },
      global: {
        mocks: { $t: (key: string) => key },
        stubs: { UpdatedCustomInputSelect: SelectStub },
      },
    });

    expect(wrapper.find<HTMLInputElement>('.field-input[step="1"]').element.value).toBe(
      String(ProjectItemShowModel.example.price),
    );
    expect(wrapper.find('.add-panel.disabled').exists()).toBe(true);
    expect(wrapper.emitted('updateData')?.[0]?.[0]).toBeInstanceOf(AddProjectItemParams);
  });
});
